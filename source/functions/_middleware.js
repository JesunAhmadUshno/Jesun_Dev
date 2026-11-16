// Security headers on every response, and a log of scraper hits on the trap path.
import { visitorKey } from './_lib.js';
export async function onRequest({ request, env, next }) {
  const url = new URL(request.url);
  if (url.pathname.startsWith('/trap') && env.DB) {
    try { await env.DB.prepare('INSERT INTO trap_hits (at, k, ua, path) VALUES (?1, ?2, ?3, ?4)').bind(new Date().toISOString(), await visitorKey(request, env), (request.headers.get('User-Agent') || '').slice(0, 200), url.pathname).run(); } catch (e) { /* never block the response */ }
  }
  const res = await next();
  const h = new Headers(res.headers);
  h.set('X-Content-Type-Options', 'nosniff'); h.set('Referrer-Policy', 'strict-origin-when-cross-origin'); h.set('X-Frame-Options', 'DENY');
  h.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()'); h.set('X-Robots-Tag', 'noai, noimageai');
  return new Response(res.body, { status: res.status, statusText: res.statusText, headers: h });
}
