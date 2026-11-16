// POST /api/hits: count one visit per visitor per day. No cookies, no IP stored.
import { safe, json, visitorKey } from '../_lib.js';
async function onRequestPost_({ request, env }) {
  const day = new Date().toISOString().slice(0, 10), key = await visitorKey(request, env);
  const seen = await env.DB.prepare('INSERT OR IGNORE INTO visits (day, k) VALUES (?1, ?2)').bind(day, key).run();
  if (seen.meta && seen.meta.changes) await env.DB.prepare('INSERT INTO counters (name, n) VALUES (\'visits\', 1) ON CONFLICT(name) DO UPDATE SET n = n + 1').run();
  const row = await env.DB.prepare('SELECT n FROM counters WHERE name = \'visits\'').first();
  return json({ ok: true, total: row ? row.n : 0 });
}

export const onRequestPost = safe(onRequestPost_);
