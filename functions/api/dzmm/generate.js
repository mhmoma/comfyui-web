import { readCookie, normalizeCookie, generate, jsonResponse } from './_shared.js';

export async function onRequestPost(context) {
  try {
    let body = {};
    try {
      body = await context.request.json();
    } catch {
      body = {};
    }
    const cookie = normalizeCookie(
      readCookie(context.request) || body?.cookie || ''
    );
    if (!cookie) {
      return jsonResponse(401, {
        ok: false,
        error: '请先在设置中配置 DZMM Cookie（仅保存在本机浏览器）',
        code: 'NO_COOKIE',
      });
    }
    const { cookie: _ignored, ...rest } = body || {};
    const result = await generate(cookie, rest);
    return jsonResponse(result.ok ? 200 : 502, result);
  } catch (e) {
    return jsonResponse(500, { ok: false, error: String(e.message || e) });
  }
}
