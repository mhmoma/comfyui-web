const DEFAULT_HOST = 'civitai.com';

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
    },
  });
}

function civitaiHeaders(env) {
  const headers = { 'User-Agent': 'comfyui-web-lora-library/1.0' };
  const key = env.CIVITAI_API_KEY || '';
  if (key) headers.Authorization = `Bearer ${key}`;
  return headers;
}

function civitaiBase(env) {
  const host = (env.CIVITAI_HOST || DEFAULT_HOST).replace(/^https?:\/\//, '').replace(/\/$/, '');
  return `https://${host}/api/v1`;
}

async function proxyCivitai(env, path) {
  const url = `${civitaiBase(env)}${path}`;
  const res = await fetch(url, { headers: civitaiHeaders(env) });
  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    return json({ ok: false, error: text.slice(0, 300) }, res.status);
  }
  if (!res.ok) {
    return json({ ok: false, error: data?.message || text.slice(0, 300) }, res.status);
  }
  return json({ ok: true, data });
}

export async function onRequest(context) {
  const { request, env, params } = context;
  const method = request.method;

  if (method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': '*',
      },
    });
  }

  const sub = (params.path || []).join('/');
  const url = new URL(request.url);

  if (sub === 'status' && method === 'GET') {
    return json({
      ok: true,
      available: false,
      bridge: 'cloudflare',
      civitai_configured: Boolean(env.CIVITAI_API_KEY),
      civitai_host: env.CIVITAI_HOST || DEFAULT_HOST,
      hint: '完整 LoRA 库（扫描/下载/预览）需运行本地 python server.py；云端提供 C 站元数据代理',
    });
  }

  if (sub === 'civitai/search' && method === 'GET') {
    const q = url.searchParams.get('q') || '';
    const limit = url.searchParams.get('limit') || '20';
    if (!q) return json({ ok: false, error: 'missing q' }, 400);
    return proxyCivitai(env, `/models?query=${encodeURIComponent(q)}&limit=${limit}&types=LORA`);
  }

  if (sub.startsWith('civitai/model/') && method === 'GET') {
    const id = sub.slice('civitai/model/'.length);
    if (!id) return json({ ok: false, error: 'missing id' }, 400);
    return proxyCivitai(env, `/models/${encodeURIComponent(id)}`);
  }

  if (sub.startsWith('civitai/version/') && method === 'GET') {
    const id = sub.slice('civitai/version/'.length);
    if (!id) return json({ ok: false, error: 'missing id' }, 400);
    return proxyCivitai(env, `/model-versions/${encodeURIComponent(id)}`);
  }

  if (sub.startsWith('civitai/hash/') && method === 'GET') {
    const hash = sub.slice('civitai/hash/'.length);
    if (!hash) return json({ ok: false, error: 'missing hash' }, 400);
    return proxyCivitai(env, `/model-versions/by-hash/${encodeURIComponent(hash)}`);
  }

  return json({ ok: false, error: 'not found' }, 404);
}
