import { readCookie, getStatus, listModels, jsonResponse } from './_shared.js';

export async function onRequestGet(context) {
  try {
    const cookie = readCookie(context.request);
    const status = await getStatus(cookie);
    return jsonResponse(200, {
      ok: status.ok,
      models: listModels(),
      quotas: status.quotas || { draw: status.quota, edit: null },
      hasCookie: status.hasCookie,
      user: status.user,
      error: status.error,
      storage: 'client-only',
    });
  } catch (e) {
    return jsonResponse(500, { ok: false, error: String(e.message || e) });
  }
}
