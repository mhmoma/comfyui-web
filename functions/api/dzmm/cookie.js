import { normalizeCookie, jsonResponse } from './_shared.js';

/**
 * Compatibility endpoint. Does NOT persist cookie on Cloudflare.
 * Client must keep credentials in localStorage and send X-Dzmm-Cookie.
 */
export async function onRequestPost(context) {
  try {
    let cookie = '';
    try {
      const body = await context.request.json();
      cookie = normalizeCookie(body?.cookie || '');
    } catch {
      cookie = '';
    }
    return jsonResponse(200, {
      ok: true,
      hasCookie: Boolean(cookie),
      stored: false,
      storage: 'client-only',
      message: '凭证仅保存在浏览器本地，服务端不落盘',
    });
  } catch (e) {
    return jsonResponse(500, { ok: false, error: String(e.message || e) });
  }
}
