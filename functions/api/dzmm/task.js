import { readCookie, normalizeCookie, pollTask, jsonResponse } from './_shared.js';

export async function onRequestGet(context) {
  try {
    const cookie = normalizeCookie(readCookie(context.request) || '');
    if (!cookie) {
      return jsonResponse(401, {
        ok: false,
        error: '请先在设置中配置 DZMM Cookie（仅保存在本机浏览器）',
        code: 'NO_COOKIE',
      });
    }
    const url = new URL(context.request.url);
    const query = Object.fromEntries(url.searchParams.entries());
    const result = await pollTask(cookie, query);
    const pending = ['pending', 'processing', 'queued'].includes(result.status);
    return jsonResponse(result.ok || pending ? 200 : 502, result);
  } catch (e) {
    return jsonResponse(500, { ok: false, error: String(e.message || e) });
  }
}
