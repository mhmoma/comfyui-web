/**
 * DZMM draw helpers for Cloudflare Pages Functions.
 * Cookie is taken from each request only — never stored on the server.
 */
export const DZMM_BASE = 'https://www.dzmm.ai';

export const MODEL_META = {
  anime: {
    id: 'anime',
    label: 'Anime 动漫',
    quotaType: 'draw',
    defaultDimension: '1:1',
    dimensions: [
      { value: '1:1', label: '1:1 方形', pixels: '2048×2048' },
      { value: '2:3', label: '2:3 竖图', pixels: '1664×2496' },
      { value: '3:2', label: '3:2 横图', pixels: '2496×1664' },
    ],
  },
  iroha: {
    id: 'iroha',
    label: 'Iroha',
    quotaType: 'draw',
    defaultDimension: '9:16',
    dimensions: [
      { value: '9:16', label: '9:16 竖屏', pixels: '1440×2560' },
      { value: '1:1', label: '1:1 方形', pixels: '2048×2048' },
      { value: '2:3', label: '2:3 竖拍', pixels: '1664×2496' },
      { value: '3:4', label: '3:4 竖照', pixels: '1728×2304' },
      { value: '3:2', label: '3:2 横图', pixels: '2496×1664' },
      { value: '4:3', label: '4:3 传统', pixels: '2304×1728' },
      { value: '16:9', label: '16:9 宽屏', pixels: '2560×1440' },
    ],
  },
  'z-image': {
    id: 'z-image',
    label: 'Z-Image',
    quotaType: 'edit',
    defaultDimension: '4:3',
    dimensions: [
      { value: '1:1', label: '1:1 方形', pixels: '2048×2048' },
      { value: '4:3', label: '4:3 传统', pixels: '2304×1728' },
      { value: '3:4', label: '3:4 竖照', pixels: '1728×2304' },
      { value: '16:9', label: '16:9 宽屏', pixels: '2560×1440' },
      { value: '9:16', label: '9:16 竖屏', pixels: '1440×2560' },
      { value: '3:2', label: '3:2 经典', pixels: '2496×1664' },
      { value: '2:3', label: '2:3 竖拍', pixels: '1664×2496' },
      { value: '21:9', label: '21:9 超宽', pixels: '3024×1296' },
    ],
  },
};

const MODEL_ALIASES = {
  realistic: 'iroha',
  anima: 'iroha',
  vivid: 'iroha',
  'nalang-dream': 'z-image',
  'nalang-coser-2': 'z-image',
};

export function jsonResponse(status, data) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });
}

export function normalizeCookie(raw) {
  let text = String(raw || '').trim().replace(/^["']|["']$/g, '');
  if (!text) return '';

  const lines = text.split(/\r?\n/).map((ln) => ln.trim().replace(/^["']|["']$/g, '')).filter(Boolean);
  if (lines.length >= 2) {
    const kv = [];
    const bare = [];
    for (const ln of lines) {
      if (ln.includes('sb-rls-auth-token.') && ln.includes('=')) {
        kv.push(ln.split(';', 1)[0].trim());
      } else if (ln.startsWith('base64-') || ln.startsWith('eyJ') || (ln.length > 40 && !ln.includes('='))) {
        bare.push(ln);
      }
    }
    if (kv.length) return kv.join('; ');
    if (bare.length) {
      return bare.map((v, i) => `sb-rls-auth-token.${i}=${v}`).join('; ');
    }
  }

  if (text.includes('sb-rls-auth-token') || text.includes(';')) return text;
  if (text.startsWith('base64-') || text.startsWith('eyJ')) {
    return `sb-rls-auth-token=${text}`;
  }
  return text;
}

/** Cookie from request header only — never persisted. Body cookie is for /cookie endpoint. */
export function readCookie(request) {
  const header =
    request.headers.get('x-dzmm-cookie') ||
    request.headers.get('X-Dzmm-Cookie') ||
    '';
  return normalizeCookie(header);
}

export async function readCookieFromBody(request) {
  try {
    const body = await request.json();
    return { cookie: normalizeCookie(body?.cookie || ''), body };
  } catch {
    return { cookie: '', body: {} };
  }
}

export function normalizeModel(model) {
  let m = String(model || 'anime').trim();
  m = MODEL_ALIASES[m] || m;
  return MODEL_META[m] ? m : 'anime';
}

export function ensureDimension(model, dimension) {
  const meta = MODEL_META[normalizeModel(model)];
  const allowed = new Set(meta.dimensions.map((d) => d.value));
  if (dimension && allowed.has(dimension)) return dimension;
  return meta.defaultDimension;
}

export function listModels() {
  return Object.values(MODEL_META).map((m) => ({
    id: m.id,
    label: m.label,
    quotaType: m.quotaType,
    defaultDimension: m.defaultDimension,
    dimensions: m.dimensions,
  }));
}

function headersFor(cookie, referer = `${DZMM_BASE}/draw/generate/create`) {
  return {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    Accept: 'application/json',
    'Content-Type': 'application/json',
    Cookie: cookie,
    Origin: DZMM_BASE,
    Referer: referer,
  };
}

function enc(obj) {
  return encodeURIComponent(JSON.stringify(obj));
}

export function unwrap(resp) {
  return resp?.result?.data?.json;
}

export async function trpcGet(cookie, name, payload, referer) {
  const url = `${DZMM_BASE}/api/trpc/${name}?input=${enc(payload)}`;
  const res = await fetch(url, { headers: headersFor(cookie, referer || `${DZMM_BASE}/`) });
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`DZMM HTTP ${res.status}: ${text.slice(0, 300)}`);
  }
}

export async function trpcPost(cookie, name, payload, referer) {
  const url = `${DZMM_BASE}/api/trpc/${name}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: headersFor(cookie, referer || `${DZMM_BASE}/`),
    body: JSON.stringify(payload),
  });
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`DZMM HTTP ${res.status}: ${text.slice(0, 300)}`);
  }
}

export function trpcErrorMessage(resp) {
  const err = resp?.error;
  if (!err || typeof err !== 'object') return '';
  const inner = err.json && typeof err.json === 'object' ? err.json : err;
  const msg = inner.message || err.message || '';
  const code = inner.data?.code || inner.code;
  if (code === 'UNAUTHORIZED' || msg === 'UNAUTHORIZED') {
    return 'Cookie 无效或已过期，请重新登录 dzmm.ai 后在设置中粘贴 Cookie';
  }
  return String(msg || code || '');
}

export function taskFailureMessage(item, model) {
  const raw = String(
    item?.errorMessage || item?.error || item?.message || item?.failReason || ''
  ).trim();
  const m = normalizeModel(model || item?.model || '');
  if (raw.includes('令牌状态不可用') || (raw.includes('令牌') && raw.includes('不可用'))) {
    if (m === 'z-image') {
      return 'Z-Image 上游暂时不可用（该令牌状态不可用）。请改用 Anime / Iroha，或稍后再试。';
    }
    return `模型上游暂时不可用：${raw}`;
  }
  if (raw) return raw;
  return `生成失败: ${item?.status || 'failed'}`;
}

async function fetchQuota(cookie, procedure) {
  const raw = await trpcGet(cookie, procedure, {
    json: null,
    meta: { values: ['undefined'], v: 1 },
  });
  if (raw?.error) return null;
  const data = unwrap(raw);
  return data && typeof data === 'object' ? data : null;
}

export async function getStatus(cookie) {
  const out = {
    ok: true,
    hasCookie: Boolean(cookie),
    cookiePreview: cookie ? `${cookie.slice(0, 24)}…` : '',
    models: listModels(),
    storage: 'client-only',
  };
  if (!cookie) return out;
  try {
    const me =
      unwrap(
        await trpcGet(cookie, 'user.getMe', {
          json: null,
          meta: { values: ['undefined'], v: 1 },
        })
      ) || {};
    out.user = {
      id: me.id,
      fullName: me.fullName,
      email: me.email,
      isLoggedIn: Boolean(me.isLoggedIn),
    };
    if (!me.isLoggedIn) {
      out.ok = false;
      out.error = 'Cookie 无效或已过期，请重新登录 dzmm.ai 后在设置中粘贴';
      return out;
    }
    const drawQ = await fetchQuota(cookie, 'draw.image.quota');
    const editQ = await fetchQuota(cookie, 'draw.image.editQuota');
    out.quota = drawQ;
    out.quotas = { draw: drawQ, edit: editQ };
    if (!drawQ && !editQ) {
      out.ok = false;
      out.error = '配额查询失败';
    }
  } catch (e) {
    out.ok = false;
    out.error = String(e.message || e);
  }
  return out;
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

export async function generate(cookie, body) {
  const prompt = String(body?.prompt || '').trim();
  if (!prompt) return { ok: false, error: '正向提示词不能为空' };

  const model = normalizeModel(body?.model || 'anime');
  const dimension = ensureDimension(model, body?.dimension || '');
  const negativePrompt =
    body?.negativePrompt ||
    body?.negative_prompt ||
    'low quality, blurry, deformed, text, signature, watermark, multiple limbs, extra fingers, ugly';
  const tagIds = body?.tagIds || body?.tag_ids || [];
  const poll = body?.poll !== false;
  const pollInterval = Math.max(1, Number(body?.poll_interval) || 2) * 1000;
  const pollMax = Math.min(60, Math.max(5, Number(body?.poll_max) || 45));

  try {
    const me =
      unwrap(
        await trpcGet(cookie, 'user.getMe', {
          json: null,
          meta: { values: ['undefined'], v: 1 },
        })
      ) || {};
    if (!me.isLoggedIn) {
      return {
        ok: false,
        error: 'Cookie 无效或已过期，请重新登录 dzmm.ai 后在设置中粘贴 Cookie',
        code: 'UNAUTHORIZED',
      };
    }
  } catch (e) {
    return { ok: false, error: `登录校验失败: ${e.message || e}`, code: 'AUTH_CHECK_FAILED' };
  }

  const gen = await trpcPost(cookie, 'draw.image.generate', {
    json: {
      prompt,
      tagIds,
      dimension,
      model,
      negativePrompt,
    },
  });
  if (gen?.error) {
    return {
      ok: false,
      error: trpcErrorMessage(gen) || 'generate failed',
      generate: gen,
      code: 'GENERATE_ERROR',
    };
  }

  const taskId = unwrap(gen)?.taskId;
  if (!taskId) return { ok: false, error: '未返回 taskId', generate: gen };

  const result = { ok: true, taskId, generate: gen };
  if (!poll) return result;

  let detail = null;
  let status = 'pending';
  for (let i = 0; i < pollMax; i++) {
    detail = await trpcGet(cookie, 'draw.image.detail', { json: { id: taskId } });
    if (detail?.error) {
      return {
        ok: false,
        error: trpcErrorMessage(detail) || 'detail failed',
        taskId,
        detail,
      };
    }
    const item = unwrap(detail) || {};
    status = item.status || 'pending';
    result.pollCount = i + 1;
    result.status = status;
    if (status === 'completed' || status === 'failed' || status === 'error') break;
    await sleep(pollInterval);
  }

  result.detail = detail;
  const item = unwrap(detail || {}) || {};
  if (status === 'completed' && item.outputImages?.length) {
    const imgPath = item.outputImages[0];
    const remoteUrl = imgPath.startsWith('/') ? DZMM_BASE + imgPath : imgPath;
    result.remoteUrl = remoteUrl;
    // Cloudflare 不落盘：优先返回远端 URL；前端可直接展示
    result.imageUrl = remoteUrl;
    try {
      const imgRes = await fetch(remoteUrl, {
        headers: {
          Cookie: cookie,
          'User-Agent': 'Mozilla/5.0',
          Referer: `${DZMM_BASE}/`,
        },
      });
      if (imgRes.ok) {
        const buf = await imgRes.arrayBuffer();
        if (buf.byteLength > 0 && buf.byteLength < 4.5 * 1024 * 1024) {
          const bytes = new Uint8Array(buf);
          let binary = '';
          const chunk = 0x8000;
          for (let i = 0; i < bytes.length; i += chunk) {
            binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
          }
          const mime = imgRes.headers.get('content-type') || 'image/webp';
          result.imageUrl = `data:${mime};base64,${btoa(binary)}`;
        }
      }
    } catch {
      /* keep remoteUrl */
    }
  } else if (status === 'failed' || status === 'error') {
    result.ok = false;
    result.error = taskFailureMessage(item, model);
    result.errorMessage = item.errorMessage;
    result.code = 'TASK_FAILED';
  } else {
    result.ok = false;
    result.error = `轮询超时，最后状态: ${status}`;
    result.code = 'POLL_TIMEOUT';
  }
  return result;
}
