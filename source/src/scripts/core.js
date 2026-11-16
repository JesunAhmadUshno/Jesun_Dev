// Shared helpers. Copyright Jesun Ahmad Ushno. All rights reserved.
export const $ = (s, r = document) => r.querySelector(s);
export const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
export const reduced = () => { try { if (localStorage.getItem('jesun.rm') === '1') return true; } catch (e) { /* storage blocked */ } return !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches); };
export const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
export const rand = (a, b) => a + Math.random() * (b - a);
export const store = {
  get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* storage blocked */ } }
};

// Tiny rAF tween engine with a global clock that can pause and change speed.
const clock = { paused: false, scale: 1, t: 0, last: 0, jobs: new Set(), raf: 0 };
function tick(now) {
  const dt = clock.last ? Math.min(64, now - clock.last) : 16;
  clock.last = now;
  if (!clock.paused) {
    clock.t += dt * clock.scale;
    for (const j of Array.from(clock.jobs)) j(clock.t);
  }
  clock.raf = clock.jobs.size ? requestAnimationFrame(tick) : 0;
  if (!clock.raf) clock.last = 0;
}
function add(job) { clock.jobs.add(job); if (!clock.raf) clock.raf = requestAnimationFrame(tick); }
export const ease = {
  linear: t => t,
  out: t => 1 - Math.pow(1 - t, 3),
  inOut: t => (t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  sine: t => -(Math.cos(Math.PI * t) - 1) / 2
};
export function tween(ms, onUpdate, easing = ease.inOut) {
  return new Promise(res => {
    const start = clock.t;
    const job = t => {
      const k = clamp((t - start) / ms, 0, 1);
      onUpdate(easing(k), k);
      if (k >= 1) { clock.jobs.delete(job); res(); }
    };
    job.res = res; add(job);
  });
}
export const wait = ms => tween(ms, () => {}, ease.linear);
export const timeline = {
  pause(v) { clock.paused = v; },
  speed(s) { clock.scale = s; },
  clear() { const pending = Array.from(clock.jobs); clock.jobs.clear(); clock.paused = false; clock.scale = 1; for (const j of pending) if (j.res) j.res(); },
  get paused() { return clock.paused; }
};

export function countUp(el, to, { decimals = 0, suffix = '', ms = 1200 } = {}) {
  const fmt = v => (decimals ? v.toFixed(decimals) : Math.round(v).toLocaleString('en-US')) + suffix;
  if (reduced()) { el.textContent = fmt(to); return Promise.resolve(); }
  return tween(ms, k => { el.textContent = fmt(to * k); }, ease.out);
}

export function toast(msg) {
  const old = $('.toast'); if (old) old.remove();
  const d = document.createElement('div');
  d.className = 'toast'; d.setAttribute('role', 'status'); d.textContent = msg;
  document.body.appendChild(d);
  setTimeout(() => d.remove(), 2600);
}

export async function copyText(text) {
  try { await navigator.clipboard.writeText(text); return true; } catch (e) { return false; }
}

// Site-root aware URLs, so the site also works when served from a sub-path (review previews).
export const ROOT = new URL('../', import.meta.url).href;
export const href = p => {
  let u = String(p).replace(/^\//, '');
  if (window.__PREVIEW) u = u.replace(/(\/|^)(#.*)?$/, '$1index.html$2');
  return ROOT + u;
};
