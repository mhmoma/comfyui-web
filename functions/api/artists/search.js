export async function onRequestGet(context) {
  const { request, env } = context;
  const db = env.DB;

  if (!db) return json(500, { error: 'DB not bound' });

  const url = new URL(request.url);
  const q = (url.searchParams.get('q') || '').trim();
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '60', 10), 200);

  if (!q || q.length < 1) {
    return new Response(JSON.stringify([]), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }

  try {
    const pattern = `%${q}%`;
    const { results } = await db.prepare(
      `SELECT slug, name, trigger_text, count, score, thumb_url, img_url
       FROM artists
       WHERE name LIKE ?1 OR trigger_text LIKE ?1 OR slug LIKE ?1
       ORDER BY count DESC
       LIMIT ?2`
    ).bind(pattern, limit).all();

    return new Response(JSON.stringify(results), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=300',
      },
    });
  } catch (e) {
    return json(500, { error: e.message });
  }
}

function json(status, data) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
  });
}
