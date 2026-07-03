const VALID_SORT = { score: 'score', count: 'count', fav: 'score', name: 'name' };
const VALID_ORDER = { asc: 'ASC', desc: 'DESC' };

export async function onRequestGet(context) {
  const { request, env } = context;
  const db = env.DB;

  if (!db) return json(500, { error: 'DB not bound' });

  const url = new URL(request.url);
  const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10));
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '100', 10), 200);
  const sortParam = url.searchParams.get('sort') || 'score';
  const orderParam = url.searchParams.get('order') || (sortParam === 'name' ? 'asc' : 'desc');
  const letter = (url.searchParams.get('letter') || '').toLowerCase();
  const offset = (page - 1) * limit;

  const sortCol = VALID_SORT[sortParam] || 'score';
  const sortDir = VALID_ORDER[orderParam] || 'DESC';

  try {
    const conditions = [];

    if (letter && letter !== 'all') {
      if (letter === 'other') {
        conditions.push("LOWER(SUBSTR(name, 1, 1)) NOT BETWEEN 'a' AND 'z'");
      } else if (/^[a-z]$/.test(letter)) {
        conditions.push(`LOWER(SUBSTR(name, 1, 1)) = '${letter}'`);
      }
    }

    const where = conditions.length > 0 ? ' WHERE ' + conditions.join(' AND ') : '';

    const countQuery = `SELECT COUNT(*) as total FROM artists${where}`;
    const dataQuery = `SELECT slug, name, trigger_text, count, score, thumb_url, img_url FROM artists${where} ORDER BY ${sortCol} ${sortDir} LIMIT ? OFFSET ?`;

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
