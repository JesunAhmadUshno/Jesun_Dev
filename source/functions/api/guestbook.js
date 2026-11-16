// GET /api/guestbook: latest notes. POST: leave a note (no links, short, rate limited).
import { safe, json, bad, visitorKey, rateLimited, clean, readJson } from '../_lib.js';
async function onRequestGet_({ env }) {
  const { results } = await env.DB.prepare('SELECT name, note, created_at FROM guestbook WHERE hidden = 0 ORDER BY created_at DESC LIMIT 50').all();
  return json({ ok: true, notes: results || [] }, 200, { 'Cache-Control': 'public, max-age=30' });
}
async function onRequestPost_({ request, env }) {
  const b = await readJson(request); if (!b) return bad('Send JSON.');
  if (b._honey) return json({ ok: true });
  const name = clean(b.name, 40), note = clean(b.note, 280);
  if (!name || note.length < 2) return bad('Add a name and a short note.');
  if (/(https?:\/\/|www\.|\.com\b|<|>)/i.test(name + ' ' + note)) return bad('Links and markup are not allowed in notes.');
  const key = await visitorKey(request, env);
  if (await rateLimited(env, key, 'guestbook', 3)) return bad('Three notes per hour is the limit.', 429);
  const created_at = new Date().toISOString();
  // Notes wait for approval unless the owner turns open posting on (GUESTBOOK_OPEN = "1").
  const open = env.GUESTBOOK_OPEN === '1';
  await env.DB.prepare('INSERT INTO guestbook (name, note, created_at, hidden) VALUES (?1, ?2, ?3, ?4)').bind(name, note, created_at, open ? 0 : 1).run();
  return json({ ok: true, held: !open, note: { name, note, created_at } }, 201);
}

export const onRequestGet = safe(onRequestGet_);
export const onRequestPost = safe(onRequestPost_);
