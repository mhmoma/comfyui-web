const fs = require('fs');
const https = require('https');
const http = require('http');

const SITE = 'https://comfyui-web-89u.pages.dev';
const ADMIN_KEY = process.argv[2] || 'Tomkk520525';
const BATCH_SIZE = 5;

function postJSON(url, body, headers) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const mod = url.startsWith('https') ? https : http;
    const parsed = new URL(url);
    const opts = {
      hostname: parsed.hostname,
      port: parsed.port || (url.startsWith('https') ? 443 : 80),
      path: parsed.pathname + parsed.search,
      method: body === null ? 'POST' : 'POST',
      headers: { ...headers, 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) },
    };
    const req = mod.request(opts, res => {
      let out = '';
      res.on('data', c => out += c);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(out) }); }
        catch { resolve({ status: res.statusCode, body: out }); }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function main() {
  const allData = JSON.parse(fs.readFileSync('characters.json', 'utf-8'));
  console.log(`Loaded ${allData.length} series`);

  console.log('Step 1: Init schema...');
  const init = await postJSON(`${SITE}/api/characters/seed?action=init`, {}, { 'x-admin-key': ADMIN_KEY });
  console.log('Init:', init.body);
  if (init.status !== 200) { console.error('Init failed'); process.exit(1); }

  let total = 0;
  for (let i = 0; i < allData.length; i += BATCH_SIZE) {
    const batch = allData.slice(i, i + BATCH_SIZE);
    const res = await postJSON(`${SITE}/api/characters/seed`, batch, { 'x-admin-key': ADMIN_KEY });
    total += res.body?.charactersInserted || 0;
    console.log(`Batch ${Math.floor(i / BATCH_SIZE) + 1}: series ${i + 1}-${Math.min(i + BATCH_SIZE, allData.length)}/${allData.length}, chars inserted: ${res.body?.charactersInserted || 0}, total: ${total}`);
    if (res.status !== 200) {
      console.error('Error:', res.body);
      console.log('Retrying in 3s...');
      await new Promise(r => setTimeout(r, 3000));
      i -= BATCH_SIZE;
      continue;
    }
  }

  console.log('\nStep 3: Verify...');
  const status = await postJSON(`${SITE}/api/characters/seed?action=status`, {}, { 'x-admin-key': ADMIN_KEY });
  console.log('Final:', status.body);
}

main().catch(console.error);
