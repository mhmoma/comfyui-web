import { json, corsPreflight, checkAdmin } from './_shared.js';

export async function onRequestOptions() {
  return corsPreflight();
}

export async function onRequestGet(context) {
  const { request, env } = context;

  if (!env.ADMIN_KEY) {
    return json(503, { error: '服务端未配置 ADMIN_KEY，请在 Cloudflare 环境变量中设置' });
  }

  if (!checkAdmin(request, env)) {
    return json(403, { error: '管理密钥错误' });
  }

  return json(200, { ok: true });
}
