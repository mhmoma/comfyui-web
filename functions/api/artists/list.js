export async function onRequestGet(context) {
  const { request, env } = context;
  const db = env.DB;

  if (!db) return json(500, { error: 'DB not bound' });

  const url = new URL(request.url);
  const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10));
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '60', 10), 200);
  const minCount = parseInt(url.searchParams.get('min') || '0', 10);
  const offset = (page - 1) * limit;

  try {
    let countQuery = 'SELECT COUNT(*) as total FROM artists';
    let dataQuery = 'SELECT slug, name, trigger_text, count, score, thumb_url, img_url FROM artists';

    if (minCount > 0) {
      countQuery += ` WHERE count >= ${minCount}`;
      dataQuery += ` WHERE count >= ${minCount}`;
    }

    dataQuery += ' ORDER BY count DESC LIMIT ? OFFSET ?';

    const [countResult, dataResult] = await Promise.all([
      db.prepare(countQuery).all(),
      db.prepare(dataQuery).bind(limit, offset).all(),
    ]);

    const total = countResult.results[0]?.total || 0;

    return new Response(JSON.stringify({
      total,
      page,
      pages: Math.ceil(total / limit),
      results: dataResult.results,
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=3600',
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
