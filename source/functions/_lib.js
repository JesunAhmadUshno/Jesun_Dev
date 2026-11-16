// Shared helpers for the API. Copyright Jesun Ahmad Ushno. All rights reserved.
export const json = (body, status = 200, extra = {}) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...extra } });
export const bad = (msg, status = 400) => json({ ok: false, error: msg }, status);
// Privacy: IPs are never stored. A salted daily hash lets us rate-limit without knowing who you are.
export async function visitorKey(request, env) {
  const ip = request.headers.get('CF-Connecting-IP') || request.headers.get('X-Forwarded-For') || '0.0.0.0';
  const day = new Date().toISOString().slice(0, 10);
  const host = new URL(request.url).hostname;
  const local = host === 'localhost' || host === '127.0.0.1' || host.endsWith('.test');
  if (!env.HASH_SALT && !local) throw new Error('HASH_SALT is not set'); // never hash with a public default in production
  const data = new TextEncoder().encode(`${env.HASH_SALT || 'dev-salt'}|${day}|${ip}`);
  const buf = await crypto.subtle.digest('SHA-256', data);
  return [...new Uint8Array(buf)].slice(0, 12).map(b => b.toString(16).padStart(2, '0')).join('');
}
export async function rateLimited(env, key, bucket, max) {
  const hour = new Date().toISOString().slice(0, 13);
  const row = await env.DB.prepare('SELECT n FROM rate WHERE k = ?1 AND bucket = ?2 AND hour = ?3').bind(key, bucket, hour).first();
  if (row && row.n >= max) return true;
  await env.DB.prepare('INSERT INTO rate (k, bucket, hour, n) VALUES (?1, ?2, ?3, 1) ON CONFLICT(k, bucket, hour) DO UPDATE SET n = n + 1').bind(key, bucket, hour).run();
  return false;
}
export const clean = (s, max) => String(s ?? '').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').trim().slice(0, max);
export const oneLine = (s, max) => clean(s, max).replace(/[\r\n]+/g, ' ');
export const isEmail = s => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s);
// Reads a JSON body only from this site: JSON content type, same origin when the browser says where it
// came from, and at most 16 KB. Anything else is treated as no body.
export async function readJson(request) {
  const ct = request.headers.get('Content-Type') || '';
  if (!ct.toLowerCase().startsWith('application/json')) return null;
  const origin = request.headers.get('Origin');
  if (origin && new URL(origin).host !== new URL(request.url).host) return null;
  const len = +(request.headers.get('Content-Length') || 0); if (len > 16384) return null;
  try { const t = await request.text(); if (t.length > 16384) return null; return JSON.parse(t); } catch (e) { return null; }
}

// Retention promise from the legal page: rate and visit rows older than 30 days are deleted.
export async function purgeOld(env) {
  if (Math.random() > .02) return;
  const cut = new Date(Date.now() - 30 * 864e5).toISOString();
  try { await env.DB.prepare('DELETE FROM rate WHERE hour < ?1').bind(cut.slice(0, 13)).run(); await env.DB.prepare('DELETE FROM visits WHERE day < ?1').bind(cut.slice(0, 10)).run(); } catch (e) { /* best effort */ }
}
// Every handler runs inside this, so a database failure returns JSON, not a bare 500 page.
export const safe = fn => async ctx => { try { const r = await fn(ctx); purgeOld(ctx.env).catch(() => {}); return r; } catch (e) { console.error('api', e && e.message); return json({ ok: false, error: 'The service is unavailable right now. Email jesunahmadushno@gmail.com instead.' }, 503); } };
