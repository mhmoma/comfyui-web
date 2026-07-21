/**
 * DZMM 出图自动去宣传水印（二维码 + 角落品牌贴）。
 * 依赖全局 jsQR（vendor/jsQR.js）。失败时原样返回，不阻断生图。
 */
(function (global) {
  'use strict';

  const STORAGE_KEY = 'dzmm_dewmark';

  function enabled() {
    try {
      const v = localStorage.getItem(STORAGE_KEY);
      if (v === null || v === '') return true;
      return v !== '0' && v !== 'false';
    } catch {
      return true;
    }
  }

  function setEnabled(on) {
    try {
      localStorage.setItem(STORAGE_KEY, on ? '1' : '0');
    } catch { /* ignore */ }
  }

  function loadImage(src) {
    return new Promise(async (resolve, reject) => {
      try {
        // Prefer blob URL so canvas is not CORS-tainted for same-origin / data / fetchable URLs
        let url = src;
        if (!String(src).startsWith('data:') && !String(src).startsWith('blob:')) {
          try {
            const res = await fetch(src, { credentials: 'same-origin' });
            if (res.ok) {
              const blob = await res.blob();
              url = URL.createObjectURL(blob);
            }
          } catch { /* use original */ }
        }
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error('图片加载失败'));
        img.src = url;
      } catch (e) {
        reject(e);
      }
    });
  }

  function clamp(v, a, b) {
    return Math.max(a, Math.min(b, v));
  }

  function unionRect(a, b) {
    if (!a) return b;
    if (!b) return a;
    const x0 = Math.min(a.x, b.x);
    const y0 = Math.min(a.y, b.y);
    const x1 = Math.max(a.x + a.w, b.x + b.w);
    const y1 = Math.max(a.y + a.h, b.y + b.h);
    return { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
  }

  function expandRect(r, padX, padY, W, H) {
    const x0 = clamp(Math.floor(r.x - padX), 0, W);
    const y0 = clamp(Math.floor(r.y - padY), 0, H);
    const x1 = clamp(Math.ceil(r.x + r.w + padX), 0, W);
    const y1 = clamp(Math.ceil(r.y + r.h + padY), 0, H);
    return { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
  }

  /** Grow toward nearest image edges (badge usually sits on a corner). */
  function expandTowardCorner(r, W, H, grow) {
    const cx = r.x + r.w / 2;
    const cy = r.y + r.h / 2;
    const towardLeft = cx < W / 2;
    const towardTop = cy < H / 2;
    const padIn = grow * 0.35;
    const padEdge = grow * 1.15;
    return expandRect(
      r,
      towardLeft ? padEdge : padIn,
      towardTop ? padEdge : padIn,
      W,
      H
    );
  }

  function scanQrInImageData(imageData, offsetX, offsetY, scale) {
    if (typeof jsQR !== 'function') return null;
    const code = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: 'attemptBoth',
    });
    if (!code || !code.location) return null;
    const loc = code.location;
    const pts = [loc.topLeftCorner, loc.topRightCorner, loc.bottomLeftCorner, loc.bottomRightCorner];
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    for (const p of pts) {
      minX = Math.min(minX, p.x);
      minY = Math.min(minY, p.y);
      maxX = Math.max(maxX, p.x);
      maxY = Math.max(maxY, p.y);
    }
    const s = scale || 1;
    return {
      x: offsetX + minX / s,
      y: offsetY + minY / s,
      w: (maxX - minX) / s,
      h: (maxY - minY) / s,
      data: code.data || '',
    };
  }

  function detectQrRects(ctx, W, H) {
    const found = [];
    const full = ctx.getImageData(0, 0, W, H);
    const hit = scanQrInImageData(full, 0, 0, 1);
    if (hit) found.push(hit);

    // Corner crops upscaled — small corner QR often missed on full scan
    const cw = Math.max(120, Math.floor(Math.min(W, H) * 0.28));
    const corners = [
      [0, 0],
      [W - cw, 0],
      [0, H - cw],
      [W - cw, H - cw],
    ];
    const scale = 2;
    const tmp = document.createElement('canvas');
    tmp.width = cw * scale;
    tmp.height = cw * scale;
    const tctx = tmp.getContext('2d', { willReadFrequently: true });
    for (const [ox, oy] of corners) {
      tctx.clearRect(0, 0, tmp.width, tmp.height);
      tctx.imageSmoothingEnabled = false;
      tctx.drawImage(ctx.canvas, ox, oy, cw, cw, 0, 0, tmp.width, tmp.height);
      const id = tctx.getImageData(0, 0, tmp.width, tmp.height);
      const q = scanQrInImageData(id, ox, oy, scale);
      if (q) found.push(q);
    }
    return found;
  }

  /**
   * Heuristic: find high black/white transition density patches in corners
   * (QR / barcode stickers), even if jsQR fails.
   */
  function detectCornerBadges(ctx, W, H) {
    const side = Math.max(96, Math.floor(Math.min(W, H) * 0.22));
    const cell = 8;
    const rects = [];
    const corners = [
      [0, 0],
      [W - side, 0],
      [0, H - side],
      [W - side, H - side],
    ];

    for (const [ox, oy] of corners) {
      const id = ctx.getImageData(ox, oy, side, side);
      const { data, width, height } = id;
      const gray = new Float32Array(width * height);
      for (let i = 0; i < width * height; i++) {
        const o = i * 4;
        gray[i] = 0.299 * data[o] + 0.587 * data[o + 1] + 0.114 * data[o + 2];
      }

      const cols = Math.floor(width / cell);
      const rows = Math.floor(height / cell);
      const score = new Float32Array(cols * rows);
      let maxScore = 0;

      for (let by = 0; by < rows; by++) {
        for (let bx = 0; bx < cols; bx++) {
          let flips = 0;
          let samples = 0;
          let sum = 0;
          let sum2 = 0;
          for (let y = by * cell; y < (by + 1) * cell && y < height; y++) {
            let prev = gray[y * width + bx * cell] > 128 ? 1 : 0;
            for (let x = bx * cell; x < (bx + 1) * cell && x < width; x++) {
              const g = gray[y * width + x];
              const b = g > 128 ? 1 : 0;
              if (b !== prev) flips++;
              prev = b;
              sum += g;
              sum2 += g * g;
              samples++;
            }
          }
          if (!samples) continue;
          const mean = sum / samples;
          const variance = sum2 / samples - mean * mean;
          // QR-like: many binary flips + high variance
          const s = flips * 0.6 + Math.sqrt(Math.max(0, variance)) * 0.15;
          score[by * cols + bx] = s;
          if (s > maxScore) maxScore = s;
        }
      }

      if (maxScore < 28) continue;

      // Threshold relative to peak; keep connected high-score block
      const thr = Math.max(22, maxScore * 0.55);
      let minBx = cols;
      let minBy = rows;
      let maxBx = -1;
      let maxBy = -1;
      let count = 0;
      for (let by = 0; by < rows; by++) {
        for (let bx = 0; bx < cols; bx++) {
          if (score[by * cols + bx] >= thr) {
            count++;
            minBx = Math.min(minBx, bx);
            minBy = Math.min(minBy, by);
            maxBx = Math.max(maxBx, bx);
            maxBy = Math.max(maxBy, by);
          }
        }
      }
      if (count < 6) continue;
      const rw = (maxBx - minBx + 1) * cell;
      const rh = (maxBy - minBy + 1) * cell;
      // Badge should be reasonably square-ish and not the whole corner
      const aspect = rw / Math.max(1, rh);
      if (aspect < 0.45 || aspect > 2.4) continue;
      if (rw < side * 0.18 || rh < side * 0.18) continue;
      if (rw > side * 0.95 && rh > side * 0.95) continue;

      rects.push({
        x: ox + minBx * cell,
        y: oy + minBy * cell,
        w: rw,
        h: rh,
      });
    }
    return rects;
  }

  /** Fast multi-pass edge-aware fill for small corner masks. */
  function inpaint(ctx, maskRect, W, H) {
    if (!maskRect || maskRect.w < 2 || maskRect.h < 2) return;
    const x0 = clamp(Math.floor(maskRect.x), 0, W - 1);
    const y0 = clamp(Math.floor(maskRect.y), 0, H - 1);
    const x1 = clamp(Math.ceil(maskRect.x + maskRect.w), 1, W);
    const y1 = clamp(Math.ceil(maskRect.y + maskRect.h), 1, H);
    if (x1 - x0 < 2 || y1 - y0 < 2) return;

    const pad = Math.max(6, Math.floor(Math.min(x1 - x0, y1 - y0) * 0.12));
    const rx0 = clamp(x0 - pad, 0, W);
    const ry0 = clamp(y0 - pad, 0, H);
    const rx1 = clamp(x1 + pad, 0, W);
    const ry1 = clamp(y1 + pad, 0, H);
    const rw = rx1 - rx0;
    const rh = ry1 - ry0;
    const img = ctx.getImageData(rx0, ry0, rw, rh);
    const orig = new Uint8ClampedArray(img.data);
    const inside = new Uint8Array(rw * rh);

    for (let y = 0; y < rh; y++) {
      for (let x = 0; x < rw; x++) {
        const gx = rx0 + x;
        const gy = ry0 + y;
        if (gx >= x0 && gx < x1 && gy >= y0 && gy < y1) inside[y * rw + x] = 1;
      }
    }

    let a = new Float32Array(orig.length);
    for (let i = 0; i < orig.length; i++) a[i] = orig[i];
    let b = new Float32Array(a.length);
    const passes = 22;
    for (let pass = 0; pass < passes; pass++) {
      b.set(a);
      for (let y = 0; y < rh; y++) {
        for (let x = 0; x < rw; x++) {
          const i = y * rw + x;
          if (!inside[i]) continue;
          let wr = 0;
          let wg = 0;
          let wb = 0;
          let wa = 0;
          let wsum = 0;
          for (let dy = -2; dy <= 2; dy++) {
            for (let dx = -2; dx <= 2; dx++) {
              if (!dx && !dy) continue;
              const nx = x + dx;
              const ny = y + dy;
              if (nx < 0 || ny < 0 || nx >= rw || ny >= rh) continue;
              const ni = ny * rw + nx;
              const dist = Math.abs(dx) + Math.abs(dy);
              const exterior = !inside[ni];
              const w = (exterior ? 3.5 : 1) / (dist * dist);
              const o = ni * 4;
              wr += a[o] * w;
              wg += a[o + 1] * w;
              wb += a[o + 2] * w;
              wa += a[o + 3] * w;
              wsum += w;
            }
          }
          if (wsum < 1e-6) continue;
          const o = i * 4;
          b[o] = wr / wsum;
          b[o + 1] = wg / wsum;
          b[o + 2] = wb / wsum;
          b[o + 3] = wa / wsum;
        }
      }
      const t = a;
      a = b;
      b = t;
    }

    const result = ctx.createImageData(rw, rh);
    for (let y = 0; y < rh; y++) {
      for (let x = 0; x < rw; x++) {
        const i = y * rw + x;
        const o = i * 4;
        if (!inside[i]) {
          result.data[o] = orig[o];
          result.data[o + 1] = orig[o + 1];
          result.data[o + 2] = orig[o + 2];
          result.data[o + 3] = orig[o + 3];
          continue;
        }
        const gx = rx0 + x;
        const gy = ry0 + y;
        const borderDist = Math.min(gx - x0, x1 - 1 - gx, gy - y0, y1 - 1 - gy);
        if (borderDist <= 2) {
          const t = borderDist / 2;
          result.data[o] = a[o] * t + orig[o] * (1 - t);
          result.data[o + 1] = a[o + 1] * t + orig[o + 1] * (1 - t);
          result.data[o + 2] = a[o + 2] * t + orig[o + 2] * (1 - t);
          result.data[o + 3] = a[o + 3] * t + orig[o + 3] * (1 - t);
        } else {
          result.data[o] = a[o];
          result.data[o + 1] = a[o + 1];
          result.data[o + 2] = a[o + 2];
          result.data[o + 3] = a[o + 3];
        }
      }
    }
    ctx.putImageData(result, rx0, ry0);
  }

  async function remove(imageUrl, options = {}) {
    if (options.force !== true && !enabled()) {
      return { url: imageUrl, changed: false, skipped: true };
    }
    if (!imageUrl) return { url: imageUrl, changed: false };

    let img;
    try {
      img = await loadImage(imageUrl);
    } catch (e) {
      return { url: imageUrl, changed: false, error: String(e.message || e) };
    }

    const W = img.naturalWidth || img.width;
    const H = img.naturalHeight || img.height;
    if (!W || !H) return { url: imageUrl, changed: false };

    const canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    ctx.drawImage(img, 0, 0);

    const qrRects = detectQrRects(ctx, W, H);
    const badgeRects = detectCornerBadges(ctx, W, H);

    let mask = null;
    for (const r of qrRects) {
      const grow = Math.max(r.w, r.h) * 0.85;
      mask = unionRect(mask, expandTowardCorner(r, W, H, grow));
      // Extra pad for logo strip beside QR
      mask = expandRect(mask, Math.max(12, r.w * 0.55), Math.max(10, r.h * 0.45), W, H);
    }
    for (const r of badgeRects) {
      const grow = Math.max(r.w, r.h) * 0.55;
      mask = unionRect(mask, expandTowardCorner(r, W, H, grow));
    }

    if (!mask) {
      return { url: imageUrl, changed: false, reason: 'no-watermark' };
    }

    // Cap mask size so we never wipe a large portion of the image
    const area = mask.w * mask.h;
    if (area > W * H * 0.12) {
      // Shrink toward nearest corner
      const side = Math.floor(Math.min(W, H) * 0.18);
      const cx = mask.x + mask.w / 2;
      const cy = mask.y + mask.h / 2;
      mask = {
        x: cx < W / 2 ? 0 : W - side,
        y: cy < H / 2 ? 0 : H - side,
        w: side,
        h: side,
      };
    }

    inpaint(ctx, mask, W, H);

    const mime = (imageUrl.startsWith('data:image/png') || /\.png(\?|$)/i.test(imageUrl))
      ? 'image/png'
      : 'image/webp';
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, mime, 0.95));
    if (!blob) {
      return { url: imageUrl, changed: false, error: 'toBlob failed' };
    }
    const url = URL.createObjectURL(blob);
    return {
      url,
      changed: true,
      blob,
      mask,
      qrCount: qrRects.length,
      badgeCount: badgeRects.length,
    };
  }

  global.DzmmDewmark = {
    enabled,
    setEnabled,
    remove,
    STORAGE_KEY,
  };
})(typeof window !== 'undefined' ? window : globalThis);
