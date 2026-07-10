import { ARTICLES_SCHEMA, json, corsPreflight, checkAdmin } from './_shared.js';

export async function onRequestOptions() {
  return corsPreflight();
}

export async function onRequestPost(context) {
  const { request, env } = context;
  if (!checkAdmin(request, env)) return json(403, { error: 'Forbidden' });

  const db = env.DB;
  if (!db) return json(500, { error: 'Database not configured' });

  try {
    const stmts = ARTICLES_SCHEMA.split(';').map(s => s.trim()).filter(Boolean);
    for (const stmt of stmts) {
      await db.prepare(stmt).run();
    }
    return json(200, { ok: true, message: 'articles 表已就绪' });
  } catch (e) {
    return json(500, { error: e.message });
  }
}
