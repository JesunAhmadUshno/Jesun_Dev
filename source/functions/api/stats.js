// GET /api/stats: public GitHub numbers, cached for 6 hours at the edge.
import { safe, json } from '../_lib.js';
async function onRequestGet_({ request, env }) {
  const cache = caches.default, key = new Request(new URL('/api/stats', request.url).toString());
  const hit = await cache.match(key); if (hit) return hit;
  let body = { ok: false };
  try {
    const r = await fetch(`https://api.github.com/users/${env.GITHUB_USER || 'JesunAhmadUshno'}`, { headers: { 'User-Agent': 'jesunahmadushno-site', ...(env.GITHUB_TOKEN ? { Authorization: `Bearer ${env.GITHUB_TOKEN}` } : {}) } });
    if (r.ok) { const u = await r.json(); body = { ok: true, public_repos: u.public_repos, followers: u.followers, fetched: new Date().toISOString() }; }
  } catch (e) { /* the page keeps its built number */ }
  const res = json(body, 200, { 'Cache-Control': body.ok ? 'public, max-age=21600' : 'no-store' });
  if (body.ok) await cache.put(key, res.clone());
  return res;
}

export const onRequestGet = safe(onRequestGet_);
