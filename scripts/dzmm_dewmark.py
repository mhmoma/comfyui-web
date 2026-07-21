# -*- coding: utf-8 -*-
"""DZMM 宣传水印/二维码去除（Pillow，可选 pyzbar）。"""
from __future__ import annotations

import io
from typing import List, Optional, Tuple

Rect = Tuple[int, int, int, int]  # x, y, w, h


def _clamp(v: int, a: int, b: int) -> int:
    return max(a, min(b, v))


def _union(a: Optional[Rect], b: Rect) -> Rect:
    if a is None:
        return b
    x0 = min(a[0], b[0])
    y0 = min(a[1], b[1])
    x1 = max(a[0] + a[2], b[0] + b[2])
    y1 = max(a[1] + a[3], b[1] + b[3])
    return (x0, y0, x1 - x0, y1 - y0)


def _expand(r: Rect, pad_x: int, pad_y: int, W: int, H: int) -> Rect:
    x0 = _clamp(r[0] - pad_x, 0, W)
    y0 = _clamp(r[1] - pad_y, 0, H)
    x1 = _clamp(r[0] + r[2] + pad_x, 0, W)
    y1 = _clamp(r[1] + r[3] + pad_y, 0, H)
    return (x0, y0, x1 - x0, y1 - y0)


def _expand_toward_corner(r: Rect, W: int, H: int, grow: float) -> Rect:
    cx = r[0] + r[2] / 2
    cy = r[1] + r[3] / 2
    toward_left = cx < W / 2
    toward_top = cy < H / 2
    pad_in = int(grow * 0.35)
    pad_edge = int(grow * 1.15)
    return _expand(
        r,
        pad_edge if toward_left else pad_in,
        pad_edge if toward_top else pad_in,
        W,
        H,
    )


def _detect_pyzbar(img) -> List[Rect]:
    try:
        from pyzbar.pyzbar import decode as zbar_decode  # type: ignore
    except Exception:
        return []
    found: List[Rect] = []
    try:
        for obj in zbar_decode(img):
            rect = obj.rect
            found.append((rect.left, rect.top, rect.width, rect.height))
    except Exception:
        pass
    return found


def _detect_corner_badges(img) -> List[Rect]:
    """High black/white transition density in corners ≈ QR / sticker."""
    W, H = img.size
    gray = img.convert("L")
    side = max(96, int(min(W, H) * 0.22))
    cell = 8
    rects: List[Rect] = []
    corners = [(0, 0), (W - side, 0), (0, H - side), (W - side, H - side)]

    for ox, oy in corners:
        crop = gray.crop((ox, oy, ox + side, oy + side))
        px = crop.load()
        cols = side // cell
        rows = side // cell
        scores = [[0.0] * cols for _ in range(rows)]
        max_score = 0.0
        for by in range(rows):
            for bx in range(cols):
                flips = 0
                samples = 0
                ssum = 0.0
                ssum2 = 0.0
                for y in range(by * cell, min((by + 1) * cell, side)):
                    prev = 1 if px[bx * cell, y] > 128 else 0
                    for x in range(bx * cell, min((bx + 1) * cell, side)):
                        g = px[x, y]
                        b = 1 if g > 128 else 0
                        if b != prev:
                            flips += 1
                        prev = b
                        ssum += g
                        ssum2 += g * g
                        samples += 1
                if not samples:
                    continue
                mean = ssum / samples
                var = ssum2 / samples - mean * mean
                sc = flips * 0.6 + (max(0.0, var) ** 0.5) * 0.15
                scores[by][bx] = sc
                if sc > max_score:
                    max_score = sc
        if max_score < 28:
            continue
        thr = max(22.0, max_score * 0.55)
        min_bx, min_by, max_bx, max_by = cols, rows, -1, -1
        count = 0
        for by in range(rows):
            for bx in range(cols):
                if scores[by][bx] >= thr:
                    count += 1
                    min_bx = min(min_bx, bx)
                    min_by = min(min_by, by)
                    max_bx = max(max_bx, bx)
                    max_by = max(max_by, by)
        if count < 6:
            continue
        rw = (max_bx - min_bx + 1) * cell
        rh = (max_by - min_by + 1) * cell
        aspect = rw / max(1, rh)
        if aspect < 0.45 or aspect > 2.4:
            continue
        if rw < side * 0.18 or rh < side * 0.18:
            continue
        if rw > side * 0.95 and rh > side * 0.95:
            continue
        rects.append((ox + min_bx * cell, oy + min_by * cell, rw, rh))
    return rects


def _inpaint(img, mask: Rect):
    """Simple multi-pass neighbor fill (RGBA)."""
    from PIL import Image

    W, H = img.size
    x0, y0, mw, mh = mask
    x0 = _clamp(x0, 0, W - 1)
    y0 = _clamp(y0, 0, H - 1)
    x1 = _clamp(x0 + mw, 1, W)
    y1 = _clamp(y0 + mh, 1, H)
    if x1 - x0 < 2 or y1 - y0 < 2:
        return img

    rgba = img.convert("RGBA")
    px = rgba.load()
    inside = set()
    for y in range(y0, y1):
        for x in range(x0, x1):
            inside.add((x, y))

    # Seed from exterior rim into mask (outward-in)
    for _ in range(28):
        updates = []
        for y in range(y0, y1):
            for x in range(x0, x1):
                wr = wg = wb = wa = wsum = 0.0
                for dy in (-2, -1, 0, 1, 2):
                    for dx in (-2, -1, 0, 1, 2):
                        if dx == 0 and dy == 0:
                            continue
                        nx, ny = x + dx, y + dy
                        if nx < 0 or ny < 0 or nx >= W or ny >= H:
                            continue
                        exterior = (nx, ny) not in inside
                        dist = abs(dx) + abs(dy)
                        w = (3.5 if exterior else 1.0) / (dist * dist)
                        r, g, b, a = px[nx, ny]
                        wr += r * w
                        wg += g * w
                        wb += b * w
                        wa += a * w
                        wsum += w
                if wsum < 1e-6:
                    continue
                updates.append((x, y, (int(wr / wsum), int(wg / wsum), int(wb / wsum), int(wa / wsum))))
        for x, y, color in updates:
            px[x, y] = color

    if img.mode == "RGB":
        return rgba.convert("RGB")
    if img.mode == "RGBA":
        return rgba
    return rgba.convert(img.mode)


def remove_watermark_bytes(data: bytes) -> Tuple[bytes, bool]:
    """
    Return (bytes, changed). On failure returns original bytes.
    """
    try:
        from PIL import Image
    except Exception:
        return data, False

    try:
        img = Image.open(io.BytesIO(data))
        img.load()
    except Exception:
        return data, False

    W, H = img.size
    if W < 64 or H < 64:
        return data, False

    mask: Optional[Rect] = None
    for r in _detect_pyzbar(img):
        grow = max(r[2], r[3]) * 0.85
        mask = _union(mask, _expand_toward_corner(r, W, H, grow))
        mask = _expand(mask, max(12, int(r[2] * 0.55)), max(10, int(r[3] * 0.45)), W, H)
    for r in _detect_corner_badges(img):
        grow = max(r[2], r[3]) * 0.55
        mask = _union(mask, _expand_toward_corner(r, W, H, grow))

    if mask is None:
        return data, False

    area = mask[2] * mask[3]
    if area > W * H * 0.12:
        side = int(min(W, H) * 0.18)
        cx = mask[0] + mask[2] / 2
        cy = mask[1] + mask[3] / 2
        mask = (
            0 if cx < W / 2 else W - side,
            0 if cy < H / 2 else H - side,
            side,
            side,
        )

    out = _inpaint(img, mask)
    buf = io.BytesIO()
    fmt = "WEBP" if data[:4] == b"RIFF" else "PNG"
    save_kw = {"quality": 95} if fmt == "WEBP" else {}
    try:
        out.save(buf, format=fmt, **save_kw)
    except Exception:
        buf = io.BytesIO()
        out.save(buf, format="PNG")
    return buf.getvalue(), True
