"""
ComfyUI Web 本地服务器
- 托管前端静态文件
- 反向代理 ComfyUI API（解决 CORS 问题）
- 支持 WebSocket 代理

用法: python server.py [端口] [ComfyUI地址]
默认: python server.py 8080 http://127.0.0.1:8188
"""

import sys
import os
import traceback
import http.client
import json
import threading
import socket
import socketserver
import webbrowser
import base64
import io
import urllib.request
from collections import deque
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, unquote
import mimetypes
from PIL import Image
from PIL import ImageFilter
import numpy as np

COMFYUI_URL = "http://127.0.0.1:8188"
PORT = 8080

def _get_base_dir():
    if getattr(sys, 'frozen', False):
        return os.path.dirname(sys.executable)
    return os.path.dirname(os.path.abspath(__file__))

STATIC_DIR = _get_base_dir()
SCRIPTS_DIR = os.path.join(STATIC_DIR, 'scripts')
if SCRIPTS_DIR not in sys.path:
    sys.path.insert(0, SCRIPTS_DIR)

try:
    import lora_library as _lora_library
except ImportError:
    _lora_library = None

API_PREFIXES = (
    '/object_info', '/prompt', '/history', '/view',
    '/upload', '/ws', '/queue', '/interrupt',
    '/free', '/system_stats', '/embeddings', '/extensions',
)

SAM_MODEL_REL = os.path.join('models', 'sam', 'sam_vit_b_01ec64.pth')
SAM_MODEL_URL = 'https://dl.fbaipublicfiles.com/segment_anything/sam_vit_b_01ec64.pth'
YOLO_MODEL_REL = os.path.join('models', 'yolo', 'yolov8s-seg.pt')
YOLO_MODEL_URL = 'https://github.com/ultralytics/assets/releases/download/v8.3.0/yolov8s-seg.pt'
_SAM_STATE = {
    'predictor': None,
    'device': None,
    'error': None,
}
_YOLO_STATE = {
    'model': None,
    'device': None,
    'error': None,
}
_SAM_LOCK = threading.Lock()
_YOLO_LOCK = threading.Lock()


def _json_response(handler, code, data):
    body = json.dumps(data, ensure_ascii=False).encode('utf-8')
    handler.send_response(code)
    handler.send_header('Content-Type', 'application/json; charset=utf-8')
    handler.send_header('Content-Length', str(len(body)))
    handler.send_header('Access-Control-Allow-Origin', '*')
    handler.end_headers()
    handler.wfile.write(body)


def _ensure_sam_weights():
    model_path = os.path.join(_get_base_dir(), SAM_MODEL_REL)
    os.makedirs(os.path.dirname(model_path), exist_ok=True)
    if os.path.isfile(model_path) and os.path.getsize(model_path) > 100 * 1024 * 1024:
        return model_path
    tmp_path = model_path + '.part'
    urllib.request.urlretrieve(SAM_MODEL_URL, tmp_path)
    if os.path.getsize(tmp_path) < 100 * 1024 * 1024:
        raise RuntimeError('SAM weight download failed (file too small)')
    os.replace(tmp_path, model_path)
    return model_path


def _ensure_yolo_weights():
    model_path = os.path.join(_get_base_dir(), YOLO_MODEL_REL)
    os.makedirs(os.path.dirname(model_path), exist_ok=True)
    if os.path.isfile(model_path) and os.path.getsize(model_path) > 5 * 1024 * 1024:
        return model_path
    tmp_path = model_path + '.part'
    urllib.request.urlretrieve(YOLO_MODEL_URL, tmp_path)
    if os.path.getsize(tmp_path) < 5 * 1024 * 1024:
        raise RuntimeError('YOLO weight download failed (file too small)')
    os.replace(tmp_path, model_path)
    return model_path


def _get_runtime_device():
    import torch
    return 'cuda' if torch.cuda.is_available() else 'cpu'


def _get_sam_predictor():
    with _SAM_LOCK:
        if _SAM_STATE['predictor'] is not None:
            return _SAM_STATE['predictor'], _SAM_STATE['device']
        if _SAM_STATE['error']:
            raise RuntimeError(_SAM_STATE['error'])
        try:
            from segment_anything import sam_model_registry, SamPredictor
            model_path = _ensure_sam_weights()
            device = _get_runtime_device()
            sam = sam_model_registry['vit_b'](checkpoint=model_path)
            sam.to(device=device)
            predictor = SamPredictor(sam)
            _SAM_STATE['predictor'] = predictor
            _SAM_STATE['device'] = device
            return predictor, device
        except Exception as e:
            _SAM_STATE['error'] = str(e)
            raise


def _get_yolo_model():
    with _YOLO_LOCK:
        if _YOLO_STATE['model'] is not None:
            return _YOLO_STATE['model'], _YOLO_STATE['device']
        if _YOLO_STATE['error']:
            raise RuntimeError(_YOLO_STATE['error'])
        try:
            from ultralytics import YOLO
            model_path = _ensure_yolo_weights()
            device = _get_runtime_device()
            model = YOLO(model_path)
            _YOLO_STATE['model'] = model
            _YOLO_STATE['device'] = device
            return model, device
        except Exception as e:
            _YOLO_STATE['error'] = str(e)
            raise


def _decode_data_url_to_rgb(data_url):
    if not data_url or not isinstance(data_url, str):
        raise ValueError('missing image_data_url')
    marker = 'base64,'
    pos = data_url.find(marker)
    if pos < 0:
        raise ValueError('invalid data url')
    raw = base64.b64decode(data_url[pos + len(marker):])
    image = Image.open(io.BytesIO(raw)).convert('RGB')
    return np.array(image)


def _encode_mask_png(mask_u8):
    image = Image.fromarray(mask_u8, mode='L')
    buf = io.BytesIO()
    image.save(buf, format='PNG')
    return 'data:image/png;base64,' + base64.b64encode(buf.getvalue()).decode('ascii')


def _mask_to_bbox(mask_bool):
    ys, xs = np.where(mask_bool)
    if xs.size < 1 or ys.size < 1:
        return None
    return [float(xs.min()), float(ys.min()), float(xs.max()), float(ys.max())]


def _normalize_point_list(points, width, height):
    out = []
    for item in points or []:
        if not isinstance(item, (list, tuple)) or len(item) < 2:
            continue
        x = max(0.0, min(float(item[0]), float(width - 1)))
        y = max(0.0, min(float(item[1]), float(height - 1)))
        out.append([x, y])
    return out


def _normalize_box(box, width, height):
    if not isinstance(box, (list, tuple)) or len(box) < 4:
        return None
    x0 = max(0.0, min(float(box[0]), float(width - 1)))
    y0 = max(0.0, min(float(box[1]), float(height - 1)))
    x1 = max(0.0, min(float(box[2]), float(width - 1)))
    y1 = max(0.0, min(float(box[3]), float(height - 1)))
    if x1 <= x0 or y1 <= y0:
        return None
    return np.array([x0, y0, x1, y1], dtype=np.float32)


def _pick_best_local_mask(masks, scores, point_x, point_y):
    h, w = masks.shape[1], masks.shape[2]
    px = max(0, min(int(round(point_x)), w - 1))
    py = max(0, min(int(round(point_y)), h - 1))
    best_idx = 0
    best_value = None
    image_area = float(max(w * h, 1))
    for idx in range(len(masks)):
        mask = masks[idx]
        if not mask[py, px]:
            continue
        area_ratio = float(mask.sum()) / image_area
        value = float(scores[idx]) - area_ratio * 0.35
        if best_value is None or value > best_value:
            best_value = value
            best_idx = idx
    return best_idx


def _expand_mask_edges(mask_u8):
    image = Image.fromarray(mask_u8, mode='L')
    width, height = image.size
    expand_px = max(2, min(14, int(round(min(width, height) * 0.006))))
    if expand_px % 2 == 0:
        expand_px += 1
    # Close tiny gaps first, then gently dilate to recover missed edge fragments.
    image = image.filter(ImageFilter.MaxFilter(size=expand_px))
    image = image.filter(ImageFilter.MinFilter(size=max(3, expand_px - 2)))
    image = image.filter(ImageFilter.MaxFilter(size=max(3, expand_px - 2)))
    return np.array(image, dtype=np.uint8)


def _combine_refined_mask(refined_u8, coarse_mask_u8):
    refined = refined_u8 > 127
    coarse = coarse_mask_u8 > 127
    refined_area = int(refined.sum())
    coarse_area = int(coarse.sum())
    if coarse_area < 1:
        return refined_u8
    if refined_area > coarse_area * 1.8:
        merged = np.logical_and(refined, _expand_mask_edges(coarse_mask_u8) > 127)
        return (merged.astype(np.uint8) * 255)
    if refined_area < coarse_area * 0.45:
        merged = np.logical_or(refined, _expand_mask_edges(coarse_mask_u8) > 127)
        return (merged.astype(np.uint8) * 255)
    return refined_u8


def _keep_click_component(mask_u8, point_x, point_y):
    binary = mask_u8 > 127
    h, w = binary.shape[:2]
    px = max(0, min(int(round(point_x)), w - 1))
    py = max(0, min(int(round(point_y)), h - 1))
    if not binary[py, px]:
        return mask_u8
    visited = np.zeros((h, w), dtype=np.uint8)
    keep = np.zeros((h, w), dtype=np.uint8)
    q = deque([(px, py)])
    visited[py, px] = 1
    keep[py, px] = 255
    while q:
        x, y = q.popleft()
        for nx, ny in ((x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)):
            if nx < 0 or ny < 0 or nx >= w or ny >= h:
                continue
            if visited[ny, nx] or not binary[ny, nx]:
                continue
            visited[ny, nx] = 1
            keep[ny, nx] = 255
            q.append((nx, ny))
    return keep


def _clamp_mask_to_focus(mask_u8, focus_box, pad=24):
    if not focus_box:
        return mask_u8
    h, w = mask_u8.shape[:2]
    x0 = max(0, int(round(focus_box[0] - pad)))
    y0 = max(0, int(round(focus_box[1] - pad)))
    x1 = min(w - 1, int(round(focus_box[2] + pad)))
    y1 = min(h - 1, int(round(focus_box[3] + pad)))
    out = np.zeros_like(mask_u8, dtype=np.uint8)
    out[y0:y1 + 1, x0:x1 + 1] = mask_u8[y0:y1 + 1, x0:x1 + 1]
    return out


def _clamp_mask_near_click(mask_u8, point_x, point_y, radius):
    h, w = mask_u8.shape[:2]
    px = max(0, min(int(round(point_x)), w - 1))
    py = max(0, min(int(round(point_y)), h - 1))
    r = max(8, int(round(radius)))
    yy, xx = np.ogrid[:h, :w]
    keep = ((xx - px) * (xx - px) + (yy - py) * (yy - py)) <= (r * r)
    out = np.zeros_like(mask_u8, dtype=np.uint8)
    out[keep] = mask_u8[keep]
    return out


def _predict_sam_mask(image_rgb, point_x, point_y, negative_points=None, focus_box=None):
    predictor, device = _get_sam_predictor()
    height, width = image_rgb.shape[:2]
    positive_points = np.array([[float(point_x), float(point_y)]], dtype=np.float32)
    negative_points = _normalize_point_list(negative_points, width, height)
    all_points = positive_points
    all_labels = np.array([1], dtype=np.int32)
    if negative_points:
        neg = np.array(negative_points, dtype=np.float32)
        all_points = np.concatenate([positive_points, neg], axis=0)
        all_labels = np.concatenate([np.array([1], dtype=np.int32), np.zeros(len(neg), dtype=np.int32)], axis=0)
    norm_box = _normalize_box(focus_box, width, height)
    with _SAM_LOCK:
        predictor.set_image(image_rgb)
        masks, scores, _ = predictor.predict(
            point_coords=all_points,
            point_labels=all_labels,
            box=norm_box,
            multimask_output=True,
        )
    best = _pick_best_local_mask(masks, scores, point_x, point_y)
    mask = masks[best].astype(np.uint8) * 255
    mask = _expand_mask_edges(mask)
    return mask, float(scores[best]), device


def _candidate_rank(candidate, point_x, point_y):
    box = candidate['box']
    cx = (box[0] + box[2]) / 2.0
    cy = (box[1] + box[3]) / 2.0
    dist = ((cx - point_x) ** 2 + (cy - point_y) ** 2) ** 0.5
    contains = 0 if candidate['contains_point'] else 1
    area_penalty = candidate.get('area_ratio', 0.0) * 2.2
    return (contains, area_penalty, dist, -candidate['confidence'])


def _predict_yolo_candidates(image_rgb, point_x, point_y):
    model, device = _get_yolo_model()
    with _YOLO_LOCK:
        result = model.predict(
            source=image_rgb,
            verbose=False,
            retina_masks=True,
            device=device,
            conf=0.15,
            iou=0.5,
            max_det=24,
        )[0]
    candidates = []
    image_area = float(max(image_rgb.shape[0] * image_rgb.shape[1], 1))
    boxes = result.boxes
    masks = result.masks
    names = getattr(result, 'names', {}) or {}
    mask_data = masks.data.cpu().numpy() if masks is not None and masks.data is not None else None
    box_xyxy = boxes.xyxy.cpu().numpy() if boxes is not None else np.empty((0, 4))
    box_conf = boxes.conf.cpu().numpy() if boxes is not None and boxes.conf is not None else np.empty((0,))
    box_cls = boxes.cls.cpu().numpy() if boxes is not None and boxes.cls is not None else np.empty((0,))
    for idx in range(len(box_xyxy)):
        box = box_xyxy[idx].tolist()
        conf = float(box_conf[idx]) if idx < len(box_conf) else 0.0
        cls_idx = int(box_cls[idx]) if idx < len(box_cls) else -1
        cls_name = names.get(cls_idx, str(cls_idx))
        mask_u8 = None
        contains = False
        if mask_data is not None and idx < len(mask_data):
            mask_bool = mask_data[idx] > 0.5
            mask_u8 = (mask_bool.astype(np.uint8) * 255)
            area_ratio = float(mask_bool.sum()) / image_area
            px = max(0, min(int(round(point_x)), mask_bool.shape[1] - 1))
            py = max(0, min(int(round(point_y)), mask_bool.shape[0] - 1))
            contains = bool(mask_bool[py, px])
            auto_box = _mask_to_bbox(mask_bool)
            if auto_box:
                box = auto_box
        else:
            contains = box[0] <= point_x <= box[2] and box[1] <= point_y <= box[3]
            area_ratio = ((box[2] - box[0]) * (box[3] - box[1])) / image_area
        candidates.append({
            'box': box,
            'confidence': conf,
            'class_id': cls_idx,
            'class_name': cls_name,
            'mask_u8': mask_u8,
            'contains_point': contains,
            'area_ratio': max(0.0, min(float(area_ratio), 1.0)),
        })
    candidates.sort(key=lambda c: _candidate_rank(c, point_x, point_y))
    return candidates, device


def _predict_yolo_sam_mask(image_rgb, point_x, point_y, range_scale=1.1):
    height, width = image_rgb.shape[:2]
    candidates, yolo_device = _predict_yolo_candidates(image_rgb, point_x, point_y)
    if not candidates:
        mask, score, sam_device = _predict_sam_mask(image_rgb, point_x, point_y)
        return {
            'mask': mask,
            'score': score,
            'device': sam_device,
            'yolo_device': yolo_device,
            'mode': 'sam_fallback',
            'candidate': None,
        }
    candidate = candidates[0]
    box = candidate['box']
    box_w = max(1.0, box[2] - box[0])
    box_h = max(1.0, box[3] - box[1])
    area_ratio = candidate.get('area_ratio', 0.0)
    broad_candidate = area_ratio > 0.42
    if broad_candidate:
        # Prevent whole-body selections when YOLO only gives a broad person mask.
        local_r = max(72.0, min(min(width, height) * 0.22 * range_scale, max(84.0, min(box_w, box_h) * 0.45)))
        focus_box = [
            max(0.0, point_x - local_r),
            max(0.0, point_y - local_r),
            min(float(width - 1), point_x + local_r),
            min(float(height - 1), point_y + local_r),
        ]
    else:
        expand = max(12.0, max(box_w, box_h) * (0.18 + max(0.0, range_scale - 1.0) * 0.22))
        focus_box = [
            max(0.0, box[0] - expand),
            max(0.0, box[1] - expand),
            min(float(width - 1), box[2] + expand),
            min(float(height - 1), box[3] + expand),
        ]
    cx = (box[0] + box[2]) / 2.0
    cy = (box[1] + box[3]) / 2.0
    outer = max(18.0, min(width, height) * (0.018 if broad_candidate else 0.015))
    negative_points = [
        [focus_box[0] - outer, cy],
        [focus_box[2] + outer, cy],
        [cx, focus_box[1] - outer],
        [cx, focus_box[3] + outer],
    ]
    mask, score, sam_device = _predict_sam_mask(
        image_rgb,
        point_x,
        point_y,
        negative_points=negative_points,
        focus_box=focus_box,
    )
    if candidate['mask_u8'] is not None:
        mask = _combine_refined_mask(mask, candidate['mask_u8'])
    mask = _keep_click_component(mask, point_x, point_y)
    mask = _clamp_mask_to_focus(mask, focus_box, pad=20 if broad_candidate else 28)
    area_ratio_final = float((mask > 127).sum()) / float(max(width * height, 1))
    if area_ratio_final > 0.22:
        local_radius = max(56.0, min(min(width, height) * 0.26 * range_scale, max(box_w, box_h) * 0.55))
        mask = _clamp_mask_near_click(mask, point_x, point_y, local_radius)
        mask = _keep_click_component(mask, point_x, point_y)
    mask = _expand_mask_edges(mask)
    return {
        'mask': mask,
        'score': score,
        'device': sam_device,
        'yolo_device': yolo_device,
        'mode': 'yolo_sam_local' if broad_candidate else 'yolo_sam',
        'candidate': {
            'class_name': candidate['class_name'],
            'confidence': candidate['confidence'],
            'box': box,
            'contains_point': candidate['contains_point'],
        },
    }


def _get_sam_status():
    model_path = os.path.join(_get_base_dir(), SAM_MODEL_REL)
    model_exists = os.path.isfile(model_path)
    model_size = os.path.getsize(model_path) if model_exists else 0
    model_ready = model_exists and model_size > 100 * 1024 * 1024
    deps_ok = True
    dep_error = ''
    try:
        import torch  # noqa: F401
        import torchvision  # noqa: F401
        import segment_anything  # noqa: F401
    except Exception as e:
        deps_ok = False
        dep_error = str(e)
    return {
        'ok': True,
        'model_path': model_path,
        'model_exists': model_exists,
        'model_size': model_size,
        'model_ready': model_ready,
        'deps_ok': deps_ok,
        'dep_error': dep_error,
        'predictor_loaded': _SAM_STATE['predictor'] is not None,
        'device': _SAM_STATE['device'],
    }


def _get_yolo_status():
    model_path = os.path.join(_get_base_dir(), YOLO_MODEL_REL)
    model_exists = os.path.isfile(model_path)
    model_size = os.path.getsize(model_path) if model_exists else 0
    model_ready = model_exists and model_size > 5 * 1024 * 1024
    deps_ok = True
    dep_error = ''
    try:
        import torch  # noqa: F401
        import ultralytics  # noqa: F401
    except Exception as e:
        deps_ok = False
        dep_error = str(e)
    return {
        'ok': True,
        'model_path': model_path,
        'model_exists': model_exists,
        'model_size': model_size,
        'model_ready': model_ready,
        'deps_ok': deps_ok,
        'dep_error': dep_error,
        'model_loaded': _YOLO_STATE['model'] is not None,
        'device': _YOLO_STATE['device'],
    }


class Handler(BaseHTTPRequestHandler):
    def _is_api(self):
        return any(self.path.startswith(p) for p in API_PREFIXES)

    def _proxy(self, method):
        try:
            parsed = urlparse(COMFYUI_URL)
            host = parsed.hostname or '127.0.0.1'
            port = parsed.port or 8188

            body = None
            if method in ('POST', 'PUT'):
                length = int(self.headers.get('Content-Length', 0))
                body = self.rfile.read(length) if length > 0 else None

            conn = http.client.HTTPConnection(host, port, timeout=120)
            headers = {}
            skip_headers = ('host', 'connection', 'transfer-encoding',
                           'origin', 'referer', 'sec-fetch-site',
                           'sec-fetch-mode', 'sec-fetch-dest')
            for key, val in self.headers.items():
                if key.lower() not in skip_headers:
                    headers[key] = val

            conn.request(method, self.path, body=body, headers=headers)
            resp = conn.getresponse()
            resp_body = resp.read()

            self.send_response(resp.status)
            for key, val in resp.getheaders():
                low = key.lower()
                if low not in ('transfer-encoding', 'connection', 'keep-alive'):
                    self.send_header(key, val)
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(resp_body)
            conn.close()
        except ConnectionRefusedError:
            self._error(502, "ComfyUI 未运行")
        except Exception as e:
            traceback.print_exc()
            self._error(500, str(e))

    def _handle_local_api(self, method):
        path = self.path.split('?')[0]
        if path == '/api/sam-status' and method == 'GET':
            try:
                _json_response(self, 200, _get_sam_status())
            except Exception as e:
                traceback.print_exc()
                _json_response(self, 500, {
                    'ok': False,
                    'error': str(e),
                })
            return True
        if path == '/api/yolo-status' and method == 'GET':
            try:
                _json_response(self, 200, _get_yolo_status())
            except Exception as e:
                traceback.print_exc()
                _json_response(self, 500, {
                    'ok': False,
                    'error': str(e),
                })
            return True
        if path == '/api/auto-mask-sam' and method == 'POST':
            try:
                length = int(self.headers.get('Content-Length', 0))
                body = self.rfile.read(length) if length > 0 else b'{}'
                payload = json.loads(body.decode('utf-8'))
                image_rgb = _decode_data_url_to_rgb(payload.get('image_data_url'))
                point_x = payload.get('point_x')
                point_y = payload.get('point_y')
                if point_x is None or point_y is None:
                    raise ValueError('missing point_x / point_y')
                mask, score, device = _predict_sam_mask(
                    image_rgb,
                    point_x,
                    point_y,
                    negative_points=payload.get('negative_points'),
                    focus_box=payload.get('focus_box'),
                )
                mask_data_url = _encode_mask_png(mask)
                _json_response(self, 200, {
                    'ok': True,
                    'score': score,
                    'device': device,
                    'mask_data_url': mask_data_url,
                })
            except Exception as e:
                traceback.print_exc()
                _json_response(self, 500, {
                    'ok': False,
                    'error': str(e),
                    'hint': 'Install dependencies: pip install torch torchvision segment-anything numpy pillow',
                })
            return True
        if path == '/api/auto-mask-yolo-sam' and method == 'POST':
            try:
                length = int(self.headers.get('Content-Length', 0))
                body = self.rfile.read(length) if length > 0 else b'{}'
                payload = json.loads(body.decode('utf-8'))
                image_rgb = _decode_data_url_to_rgb(payload.get('image_data_url'))
                point_x = payload.get('point_x')
                point_y = payload.get('point_y')
                range_scale = float(payload.get('range_scale', 1.1))
                if point_x is None or point_y is None:
                    raise ValueError('missing point_x / point_y')
                result = _predict_yolo_sam_mask(image_rgb, float(point_x), float(point_y), range_scale=range_scale)
                _json_response(self, 200, {
                    'ok': True,
                    'score': result['score'],
                    'device': result['device'],
                    'yolo_device': result['yolo_device'],
                    'mode': result['mode'],
                    'candidate': result['candidate'],
                    'mask_data_url': _encode_mask_png(result['mask']),
                })
            except Exception as e:
                traceback.print_exc()
                _json_response(self, 500, {
                    'ok': False,
                    'error': str(e),
                    'hint': 'Install dependencies: pip install torch torchvision segment-anything ultralytics numpy pillow',
                })
            return True
        if self.path.startswith('/api/lora'):
            return self._handle_lora_api(method)
        return False

    def _parse_query(self):
        parsed = urlparse(self.path)
        q = {}
        if parsed.query:
            for part in parsed.query.split('&'):
                if '=' in part:
                    k, v = part.split('=', 1)
                    q[unquote(k)] = unquote(v)
                elif part:
                    q[part] = ''
        return parsed.path, q

    def _read_json_body(self):
        length = int(self.headers.get('Content-Length', 0))
        raw = self.rfile.read(length) if length > 0 else b'{}'
        try:
            return json.loads(raw.decode('utf-8'))
        except Exception:
            return {}

    def _serve_file(self, filepath):
        mime, _ = mimetypes.guess_type(filepath)
        if mime is None:
            mime = 'application/octet-stream'
        with open(filepath, 'rb') as f:
            content = f.read()
        self.send_response(200)
        self.send_header('Content-Type', mime)
        self.send_header('Content-Length', str(len(content)))
        self.send_header('Cache-Control', 'public, max-age=3600')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(content)

    def _handle_lora_api(self, method):
        if _lora_library is None:
            self._error(500, 'lora_library 模块未加载')
            return True
        path, query = self._parse_query()
        body = self._read_json_body() if method == 'POST' else {}
        try:
            code, data = _lora_library.handle_api(method, path, query, body, COMFYUI_URL)
            if code == 0 and isinstance(data, dict) and data.get('__file__'):
                self._serve_file(data['__file__'])
                return True
            if code == 302 and isinstance(data, dict) and data.get('__redirect__'):
                self.send_response(302)
                self.send_header('Location', data['__redirect__'])
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                return True
            _json_response(self, code, data)
        except Exception as e:
            traceback.print_exc()
            _json_response(self, 500, {'ok': False, 'error': str(e)})
        return True

    def _serve_static(self):
        path = self.path.split('?')[0]
        if path in ('', '/'):
            path = '/index.html'

        filepath = os.path.join(STATIC_DIR, path.lstrip('/'))
        filepath = os.path.normpath(filepath)

        if not filepath.startswith(STATIC_DIR):
            self._error(403, "Forbidden")
            return

        if os.path.isdir(filepath):
            filepath = os.path.join(filepath, 'index.html')
        elif not os.path.isfile(filepath):
            alt = os.path.join(filepath, 'index.html')
            if os.path.isfile(alt):
                filepath = alt

        if not os.path.isfile(filepath):
            self._error(404, "File not found")
            return

        mime, _ = mimetypes.guess_type(filepath)
        if mime is None:
            mime = 'application/octet-stream'

        try:
            with open(filepath, 'rb') as f:
                content = f.read()
            self.send_response(200)
            self.send_header('Content-Type', mime)
            self.send_header('Content-Length', str(len(content)))
            self.send_header('Cache-Control', 'no-cache')
            self.end_headers()
            self.wfile.write(content)
        except Exception as e:
            self._error(500, str(e))

    def _error(self, code, msg):
        body = json.dumps({"error": msg}).encode()
        self.send_response(code)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Content-Length', str(len(body)))
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        if self._handle_local_api('GET'):
            return
        if self._is_api():
            self._proxy('GET')
        else:
            self._serve_static()

    def do_POST(self):
        if self._handle_local_api('POST'):
            return
        self._proxy('POST')

    def do_PUT(self):
        if self._handle_local_api('PUT'):
            return
        self._proxy('PUT')

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', '*')
        self.send_header('Access-Control-Max-Age', '86400')
        self.send_header('Content-Length', '0')
        self.end_headers()

    def log_message(self, format, *args):
        msg = format % args
        if 'favicon' not in msg:
            sys.stdout.write(f"  {msg}\n")
            sys.stdout.flush()


class ThreadedHTTPServer(socketserver.ThreadingMixIn, HTTPServer):
    daemon_threads = True
    allow_reuse_address = True


def start_ws_proxy(local_port, comfyui_host, comfyui_port):
    ws_port = local_port + 1
    try:
        srv = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        srv.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        srv.bind(('0.0.0.0', ws_port))
        srv.listen(5)
    except OSError as e:
        print(f"  [警告] WebSocket 代理端口 {ws_port} 不可用: {e}", flush=True)
        return None

    def relay(src, dst):
        try:
            while True:
                data = src.recv(8192)
                if not data:
                    break
                dst.sendall(data)
        except:
            pass
        finally:
            try: src.close()
            except: pass
            try: dst.close()
            except: pass

    def handle(client):
        try:
            remote = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            remote.connect((comfyui_host, comfyui_port))
            init_data = client.recv(8192)
            remote.sendall(init_data)
            threading.Thread(target=relay, args=(client, remote), daemon=True).start()
            threading.Thread(target=relay, args=(remote, client), daemon=True).start()
        except:
            try: client.close()
            except: pass

    def loop():
        while True:
            try:
                client, _ = srv.accept()
                threading.Thread(target=handle, args=(client,), daemon=True).start()
            except:
                break

    threading.Thread(target=loop, daemon=True).start()
    print(f"  WebSocket 代理: ws://127.0.0.1:{ws_port}/ws", flush=True)
    return ws_port


def main():
    global COMFYUI_URL, PORT

    if len(sys.argv) > 1:
        PORT = int(sys.argv[1])
    if len(sys.argv) > 2:
        COMFYUI_URL = sys.argv[2].rstrip('/')

    parsed = urlparse(COMFYUI_URL)
    host = parsed.hostname or '127.0.0.1'
    port = parsed.port or 8188

    print(f"\n{'='*50}", flush=True)
    print(f"  ComfyUI Web 本地服务器", flush=True)
    print(f"{'='*50}", flush=True)
    print(f"  前端地址: http://127.0.0.1:{PORT}", flush=True)
    print(f"  ComfyUI:  {COMFYUI_URL}", flush=True)
    print(f"  门户首页: http://127.0.0.1:{PORT}/", flush=True)
    print(f"  生图工具: http://127.0.0.1:{PORT}/app/", flush=True)
    print(f"  管理发帖: http://127.0.0.1:{PORT}/admin/", flush=True)
    print(f"  资讯页面: http://127.0.0.1:{PORT}/news/", flush=True)
    print(f"{'='*50}\n", flush=True)

    start_ws_proxy(PORT, host, port)

    httpd = ThreadedHTTPServer(('0.0.0.0', PORT), Handler)
    print(f"  HTTP 服务器已启动，按 Ctrl+C 停止\n", flush=True)

    threading.Timer(0.5, lambda: webbrowser.open(f"http://127.0.0.1:{PORT}/")).start()

    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n  服务器已关闭")
        httpd.shutdown()


if __name__ == '__main__':
    main()
