import { readCookie, getStatus, jsonResponse } from './_shared.js';

export async function onRequestGet(context) {
  try {
    const cookie = readCookie(context.request);
    const status = await getStatus(cookie);
    return jsonResponse(200, {
      ok: status.ok,
      quota: status.quota,
      quotas: status.quotas,
      error: status.error,
      storage: 'client-only',
    });
  } catch (e) {
    return jsonResponse(500, { ok: false, error: String(e.message || e) });
  }
}
