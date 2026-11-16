// Sci-fi layer for the home page: geometric network, word decode, card art, HUD cursor,
// heading decode, section rail, fleet dock and console. Copyright Jesun Ahmad Ushno. All rights reserved.
import { $, $$, reduced, clamp, href } from './core.js';
import data from '../data/jesun.json';

const H = document.documentElement;
const touring = () => H.classList.contains('touring') || H.classList.contains('boot-armed');
const RM = reduced();
const PAL = ['#FF4655', '#F4F4F2', '#4D7CFE', '#2BD9A0', '#FFC24B', '#B57BFF', '#3DD6F5', '#F25FB6'];
const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&*+=<>/\\';
function rng(seed) { let h = 2166136261; for (const c of String(seed)) h = Math.imul(h ^ c.charCodeAt(0), 16777619); return () => { h = Math.imul(h ^ (h >>> 15), 2246822507); h = Math.imul(h ^ (h >>> 13), 3266489909); return ((h ^= h >>> 16) >>> 0) / 4294967296; }; }

/* ---------- Geometric network behind the hero ---------- */
const SHAPES = ['dot', 'tri', 'square', 'hex', 'diamond', 'cross'];
function drawShape(ctx, s, x, y, r, rot) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.beginPath();
  const poly = n => { for (let i = 0; i < n; i++) { const a = i / n * 6.283 - Math.PI / 2; i ? ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r) : ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r); } ctx.closePath(); };
  if (s === 'dot') ctx.arc(0, 0, r * .55, 0, 6.283);
  else if (s === 'tri') poly(3);
  else if (s === 'square') poly(4);
  else if (s === 'hex') poly(6);
  else if (s === 'diamond') { ctx.moveTo(0, -r * 1.2); ctx.lineTo(r * .7, 0); ctx.lineTo(0, r * 1.2); ctx.lineTo(-r * .7, 0); ctx.closePath(); }
  else { ctx.moveTo(-r, 0); ctx.lineTo(r, 0); ctx.moveTo(0, -r); ctx.lineTo(0, r); }
  ctx.restore();
}
function shapePath(P, s, x, y, r, rot) {
  const c = Math.cos(rot), sn = Math.sin(rot), pt = (px, py) => [x + px * c - py * sn, y + px * sn + py * c];
  const poly = pts => { pts.forEach(([px, py], i) => { const [X, Y] = pt(px, py); i ? P.lineTo(X, Y) : P.moveTo(X, Y); }); P.closePath(); };
  const ngon = n => poly(Array.from({ length: n }, (_, i) => { const a = i / n * 6.283 - Math.PI / 2; return [Math.cos(a) * r, Math.sin(a) * r]; }));
  if (s === 'dot') { P.moveTo(x + r * .55, y); P.arc(x, y, r * .55, 0, 6.283); }
  else if (s === 'tri') ngon(3); else if (s === 'square') ngon(4); else if (s === 'hex') ngon(6);
  else if (s === 'diamond') poly([[0, -r * 1.2], [r * .7, 0], [0, r * 1.2], [-r * .7, 0]]);
  else { const [a1, b1] = pt(-r, 0), [a2, b2] = pt(r, 0), [a3, b3] = pt(0, -r), [a4, b4] = pt(0, r); P.moveTo(a1, b1); P.lineTo(a2, b2); P.moveTo(a3, b3); P.lineTo(a4, b4); }
}
export function network() {
  const c = $('#net'); if (!c) return;
  const ctx = c.getContext('2d'); const hero = $('#home');
  let W = 0, Hh = 0, nodes = [], mx = -9999, my = -9999, down = false, raf = 0, vis = true, waves = [], t = 0;
  let lastW = 0, lastT = 0;
  const size = () => {
    const d = matchMedia('(pointer:coarse)').matches ? 1 : Math.min(1.5, devicePixelRatio || 1), nw = c.clientWidth, nh = c.clientHeight;
    c.width = nw * d; c.height = nh * d; ctx.setTransform(d, 0, 0, d, 0, 0);
    const keep = nodes.length && Math.abs(nw - lastW) < 40; // mobile URL bar: keep the field
    W = nw; Hh = nh; lastW = nw; if (keep) return;
    const n = Math.round(clamp(W * Hh / 5200, 60, 260)), r = rng('jesun-net');
    nodes = Array.from({ length: n }, (_, i) => { const s = SHAPES[Math.floor(r() * SHAPES.length)]; return { x: r() * W, y: r() * Hh, vx: (r() - .5) * .3, vy: (r() - .5) * .3, s, size: s === 'dot' ? 2.2 + r() * 1.5 : 3 + r() * 4, rot: r() * 6.28, vr: (r() - .5) * .012, c: r() < .22 ? PAL[Math.floor(r() * PAL.length)] : null, ox: 0, oy: 0 }; });
  };
  const LINK = 120, BUCKETS = 10;
  const frame = now => {
    raf = vis && !document.hidden && !RM ? requestAnimationFrame(frame) : 0;
    // Hidden under the boot screen: do not draw at all, check again shortly.
    if (document.documentElement.classList.contains('boot-armed') && document.getElementById('boot') && !document.getElementById('boot').hidden) { cancelAnimationFrame(raf); raf = 0; setTimeout(kick, 400); return; }
    // 15 fps when the pointer is away and nothing is animating; full rate when engaged.
    const engaged = mx > -9000 || waves.length || down;
    if (!engaged && now && now - lastT < 64) return;
    lastT = now || 0;
    t++; ctx.clearRect(0, 0, W, Hh);
    for (const n of nodes) {
      if (!RM) { n.x += n.vx; n.y += n.vy; n.rot += n.vr; }
      if (n.x < -10) n.x = W + 10; if (n.x > W + 10) n.x = -10; if (n.y < -10) n.y = Hh + 10; if (n.y > Hh + 10) n.y = -10;
      if (engaged) {
        const dx = mx - n.x, dy = my - n.y, d = Math.hypot(dx, dy);
        if (d < 200 && d > 1) { const f = down ? -2.2 : .6; n.ox += dx / d * f * (1 - d / 200); n.oy += dy / d * f * (1 - d / 200); }
        for (const w of waves) { const wd = Math.hypot(n.x - w.x, n.y - w.y); if (Math.abs(wd - w.r) < 26) { n.ox += (n.x - w.x) / (wd || 1) * 3.2 * w.a; n.oy += (n.y - w.y) / (wd || 1) * 3.2 * w.a; } }
      }
      n.ox *= .9; n.oy *= .9; n.x += n.ox * .2; n.y += n.oy * .2;
    }
    // Links: grouped into alpha buckets, one stroke per bucket instead of one per link.
    const cell = LINK, grid = new Map();
    nodes.forEach((n, i) => { const k = ((n.x / cell) | 0) * 4096 + ((n.y / cell) | 0); let g = grid.get(k); if (!g) grid.set(k, g = []); g.push(i); });
    const near = i => { const n = nodes[i], cx = (n.x / cell) | 0, cy = (n.y / cell) | 0, out = []; for (let a = -1; a <= 1; a++) for (let b = -1; b <= 1; b++) { const g = grid.get((cx + a) * 4096 + cy + b); if (g) for (const j of g) if (j > i) out.push(j); } return out; };
    const cold = Array.from({ length: BUCKETS }, () => new Path2D()), hot = Array.from({ length: BUCKETS }, () => new Path2D()), facets = new Path2D();
    let anyHot = false;
    for (let i = 0; i < nodes.length; i++) {
      const a = nodes[i], ns = near(i);
      for (const j of ns) {
        const b = nodes[j], d = Math.hypot(a.x - b.x, a.y - b.y); if (d > LINK) continue;
        const k = Math.min(BUCKETS - 1, ((1 - d / LINK) * BUCKETS) | 0);
        const isHot = engaged && Math.hypot((a.x + b.x) / 2 - mx, (a.y + b.y) / 2 - my) < 170;
        const P = isHot ? hot[k] : cold[k]; P.moveTo(a.x, a.y); P.lineTo(b.x, b.y);
        if (isHot) { anyHot = true; for (const q of ns) { if (q <= j) continue; const cN = nodes[q]; if (Math.hypot(b.x - cN.x, b.y - cN.y) < LINK * .85 && Math.hypot(a.x - cN.x, a.y - cN.y) < LINK * .85) { facets.moveTo(a.x, a.y); facets.lineTo(b.x, b.y); facets.lineTo(cN.x, cN.y); facets.closePath(); } } }
      }
    }
    ctx.lineWidth = 1;
    for (let k = 0; k < BUCKETS; k++) { const al = (k + .5) / BUCKETS; ctx.strokeStyle = `rgba(255,70,85,${al * .22})`; ctx.stroke(cold[k]); if (anyHot) { ctx.strokeStyle = `rgba(255,89,100,${al * .7})`; ctx.stroke(hot[k]); } }
    if (anyHot) { ctx.fillStyle = 'rgba(255,70,85,.11)'; ctx.fill(facets); }
    // Cursor tethers (only when engaged) and nodes, one path per colour.
    let closest = null, cd = 1e9;
    if (engaged) { const teth = new Path2D(); for (const n of nodes) { const d = Math.hypot(n.x - mx, n.y - my); if (d < 170) { teth.moveTo(n.x, n.y); teth.lineTo(mx, my); } if (d < cd) { cd = d; closest = n; } } ctx.strokeStyle = 'rgba(244,244,242,.22)'; ctx.stroke(teth); }
    const fills = new Map(), strokes = new Map();
    for (const n of nodes) {
      const lit = engaged && Math.hypot(n.x - mx, n.y - my) < 170, outline = n.s === 'cross' || n.s === 'tri' || n.s === 'hex';
      const col = n.c || (lit ? '#FF4655' : outline ? 'rgba(244,244,242,.45)' : 'rgba(244,244,242,.55)');
      const M = outline ? strokes : fills; let P = M.get(col); if (!P) M.set(col, P = new Path2D());
      shapePath(P, n.s, n.x, n.y, n.size * (lit ? 1.35 : 1), n.rot);
    }
    for (const [col, P] of fills) { ctx.fillStyle = col; ctx.fill(P); }
    ctx.lineWidth = 1.2; for (const [col, P] of strokes) { ctx.strokeStyle = col; ctx.stroke(P); }
    if (closest && cd < 60) { ctx.strokeStyle = '#FF4655'; ctx.lineWidth = 1; ctx.strokeRect(closest.x - 9, closest.y - 9, 18, 18); ctx.fillStyle = 'rgba(244,244,242,.7)'; ctx.font = '9px "IBM Plex Mono", monospace'; ctx.fillText(`${closest.s.toUpperCase()} ${closest.x.toFixed(0)},${closest.y.toFixed(0)}`, closest.x + 13, closest.y - 11); }
    waves = waves.filter(w => { w.r += 9; w.a *= .955; ctx.strokeStyle = `rgba(255,70,85,${w.a})`; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(w.x, w.y, w.r, 0, 6.283); ctx.stroke(); ctx.strokeStyle = `rgba(77,124,254,${w.a * .6})`; ctx.beginPath(); ctx.arc(w.x, w.y, w.r * .7, 0, 6.283); ctx.stroke(); return w.a > .04; });
  };
  const kick = () => { if (!raf && !RM) raf = requestAnimationFrame(frame); };
  size(); frame();
  let rz = 0; addEventListener('resize', () => { clearTimeout(rz); rz = setTimeout(() => { size(); if (RM) frame(); else kick(); }, 120); });
  hero.addEventListener('pointermove', e => { const r = c.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; });
  hero.addEventListener('pointerleave', () => { mx = my = -9999; down = false; });
  hero.addEventListener('pointerdown', e => { if (e.target.closest('a,button,input,select,textarea')) return; down = true; const r = c.getBoundingClientRect(); waves.push({ x: e.clientX - r.left, y: e.clientY - r.top, r: 4, a: .9 }); });
  addEventListener('pointerup', () => { down = false; });
  new IntersectionObserver(es => { vis = es[0].isIntersecting; if (vis) kick(); }).observe(c);
  document.addEventListener('visibilitychange', kick);
  return { wave: (x, y) => { waves.push({ x: x ?? W / 2, y: y ?? Hh / 2, r: 4, a: 1 }); kick(); } };
}

/* ---------- Decode: scramble text nodes, then resolve ---------- */
export function decodeNode(el, ms = 900) {
  if (RM || !el) return;
  const nodes = []; const walk = n => { for (const c of n.childNodes) { if (c.nodeType === 3 && c.data.trim()) nodes.push([c, c.data]); else if (c.nodeType === 1 && !c.classList.contains('caret')) walk(c); } };
  walk(el);
  const t0 = performance.now();
  const step = now => {
    const k = clamp((now - t0) / ms, 0, 1);
    for (const [n, txt] of nodes) n.data = [...txt].map((ch, i) => (ch === ' ' || i / txt.length < k || Math.random() < .6) ? ch : GLYPHS[(Math.random() * GLYPHS.length) | 0]).join('');
    if (k < 1) requestAnimationFrame(step); else for (const [n, txt] of nodes) n.data = txt;
  };
  requestAnimationFrame(step);
}
export function decodeHeadings() {
  if (RM || !('IntersectionObserver' in window)) return;
  // Only the red second line decodes, in 600ms, with its width locked so the heading never re-wraps.
  const target = h => h.querySelector('.grad') || h;
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting || touring()) return; io.unobserve(e.target);
    const t = target(e.target); const w = t.getBoundingClientRect().width;
    if (t !== e.target) { t.style.display = 'inline-block'; t.style.minWidth = w + 'px'; }
    decodeNode(t, 600); setTimeout(() => { t.style.minWidth = ''; t.style.display = ''; }, 700);
  }), { threshold: .4 });
  $$('.ap .h2').forEach(h => { h.setAttribute('aria-label', h.textContent.replace(/\s+/g, ' ').trim()); io.observe(h); });
}

/* ---------- Giant word: decode cycle through true words ---------- */
export function fitGiant() {
  const g = $('.giant[data-words]'); if (!g) return;
  const fit = () => {
    if (innerWidth <= 900) { g.style.fontSize = ''; return; }
    const keep = g.textContent; g.textContent = 'PORTFOLIO'; g.style.fontSize = '200px';
    const w = g.getBoundingClientRect().width || 1, target = Math.min(innerWidth * .94, 1900);
    g.style.fontSize = Math.min(380, 200 * target / w).toFixed(1) + 'px'; g.textContent = keep;
  };
  // Sizing now lives in CSS (min(24.3vw, 380px)); measuring after fonts load caused layout shift.
  void fit;
}
export function wordCycle() {
  const g = $('.giant[data-words]'); if (!g || RM) return;
  const alts = g.dataset.words.split('|').filter(w => w !== 'PORTFOLIO'); let k = 0, onHome = true;
  const decodeTo = target => {
    const len = Math.max(g.textContent.length, target.length), t0 = performance.now();
    g.classList.add('decoding');
    const step = now => {
      const q = clamp((now - t0) / 1000, 0, 1); let out = '';
      for (let j = 0; j < len; j++) out += j / len < q ? (target[j] || '') : GLYPHS[(Math.random() * 36) | 0];
      g.textContent = out;
      if (q < 1) requestAnimationFrame(step); else { g.textContent = target; g.classList.remove('decoding'); }
    };
    requestAnimationFrame(step);
  };
  const next = () => {
    if (!touring() && !document.hidden) { const target = onHome ? alts[k++ % alts.length] : 'PORTFOLIO'; onHome = !onHome; decodeTo(target); }
    setTimeout(next, onHome ? 9000 : 3200);
  };
  setTimeout(next, 5200);
}

/* ---------- Generative card art: unique geometry per project ---------- */
export function cardArt() {
  const cvs = $$('.card .gen'); if (!cvs.length) return;
  const draw = (c, phase) => {
    const r = rng(c.dataset.seed), d = Math.min(2, devicePixelRatio || 1), w = c.clientWidth, h = c.clientHeight;
    if (!w) return;
    if (c.width !== Math.round(w * d)) { c.width = w * d; c.height = h * d; }
    const x = c.getContext('2d'); x.setTransform(d, 0, 0, d, 0, 0); x.clearRect(0, 0, w, h);
    const kind = Math.floor(r() * 4), hue = PAL[Math.floor(r() * 3)], hue2 = PAL[2 + Math.floor(r() * 5)];
    x.lineWidth = 1;
    if (kind === 0) { // orbit rings
      const cx = w * (.55 + r() * .3), cy = h * (.4 + r() * .3);
      for (let k = 0; k < 9; k++) { x.strokeStyle = k % 3 ? 'rgba(244,244,242,.14)' : hue; x.beginPath(); x.ellipse(cx, cy, 12 + k * 14, 6 + k * 8, phase * (k % 2 ? 1 : -1) * .4 + r() * 3, 0, 6.283); x.stroke(); }
    } else if (kind === 1) { // swarm lattice
      const pts = Array.from({ length: 26 }, () => [r() * w, r() * h, r() * 6.28]);
      for (const [a, b, p] of pts) for (const [c2, d2] of pts) { const dd = Math.hypot(a - c2, b - d2); if (dd < 70) { x.strokeStyle = `rgba(255,70,85,${(1 - dd / 70) * .5})`; x.beginPath(); x.moveTo(a + Math.sin(phase + p) * 4, b); x.lineTo(c2, d2); x.stroke(); } }
      for (const [a, b] of pts) { x.fillStyle = hue2; x.fillRect(a - 1.5, b - 1.5, 3, 3); }
    } else if (kind === 2) { // wave field
      for (let k = 0; k < 14; k++) { x.strokeStyle = k % 4 ? 'rgba(244,244,242,.12)' : hue; x.beginPath(); for (let px = 0; px <= w; px += 6) { const py = h * .2 + k * h * .045 + Math.sin(px / (18 + r() * 2) + phase + k * .4) * (6 + k); px ? x.lineTo(px, py) : x.moveTo(px, py); } x.stroke(); }
    } else { // polygon stack
      const cx = w * (.5 + r() * .35), cy = h * (.45 + r() * .2), sides = 3 + Math.floor(r() * 4);
      for (let k = 0; k < 8; k++) { x.strokeStyle = k === 3 ? hue2 : `rgba(255,70,85,${.15 + k * .06})`; x.beginPath(); for (let i = 0; i <= sides; i++) { const a = i / sides * 6.283 + phase * .3 + k * .12; const rr = 14 + k * 11; i ? x.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr) : x.moveTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr); } x.stroke(); }
    }
  };
  for (const c of cvs) {
    draw(c, 0);
    if (RM) continue;
    let raf = 0, ph = 0; const card = c.closest('.card');
    const loop = () => { ph += .02; draw(c, ph); raf = requestAnimationFrame(loop); };
    card.addEventListener('pointerenter', () => { if (!raf) raf = requestAnimationFrame(loop); });
    card.addEventListener('pointerleave', () => { cancelAnimationFrame(raf); raf = 0; });
  }
  addEventListener('resize', () => cvs.forEach(c => draw(c, 0)));
}

/* ---------- Lab teaser: a live elitist swarm on Rastrigin, looping ---------- */
export function labViz() {
  const c = $('#labviz'); if (!c) return;
  const ctx = c.getContext('2d'), out = $('#lv-best');
  const f = (x, y) => 20 + x * x - 10 * Math.cos(6.283 * x) + y * y - 10 * Math.cos(6.283 * y), B = 5.12;
  let W, Hh, ps, gb, t, raf = 0, vis = false, bg = null; const r = rng('lab');
  const size = () => { const d = Math.min(2, devicePixelRatio || 1); W = c.clientWidth; Hh = c.clientHeight; c.width = W * d; c.height = Hh * d; ctx.setTransform(d, 0, 0, d, 0, 0); bg = null; };
  const reset = () => { t = 0; ps = Array.from({ length: 34 }, () => { const p = { x: (r() * 2 - 1) * B, y: (r() * 2 - 1) * B, vx: 0, vy: 0 }; p.bx = p.x; p.by = p.y; p.bf = f(p.x, p.y); return p; }); gb = ps.reduce((a, b) => (b.bf < a.bf ? b : a)); gb = { x: gb.bx, y: gb.by, f: gb.bf }; };
  const heat = () => { const o = document.createElement('canvas'); o.width = 160; o.height = 70; const x = o.getContext('2d'), id = x.createImageData(160, 70); for (let j = 0; j < 70; j++) for (let i = 0; i < 160; i++) { const v = Math.max(0, 1 - f((i / 159 * 2 - 1) * B, (j / 69 * 2 - 1) * B) / 70), k = (j * 160 + i) * 4; id.data[k] = 14 + v * 60; id.data[k + 1] = 10 + v * 16; id.data[k + 2] = 16 + v * 22; id.data[k + 3] = 255; } x.putImageData(id, 0, 0); return o; };
  const step = () => {
    const w = .9 - .5 * Math.min(1, t / 140);
    for (const p of ps) {
      p.vx = w * p.vx + 1.49 * r() * (p.bx - p.x) + 1.49 * r() * (gb.x - p.x); p.vy = w * p.vy + 1.49 * r() * (p.by - p.y) + 1.49 * r() * (gb.y - p.y);
      p.x = clamp(p.x + p.vx, -B, B); p.y = clamp(p.y + p.vy, -B, B);
      if (r() < .08) { p.x = clamp(p.x + (r() - .5) * 1.6, -B, B); p.y = clamp(p.y + (r() - .5) * 1.6, -B, B); }
      const v = f(p.x, p.y); if (v < p.bf) { p.bf = v; p.bx = p.x; p.by = p.y; } if (v < gb.f) gb = { x: p.x, y: p.y, f: v };
    }
    t++;
  };
  const draw = () => {
    if (!bg) bg = heat(); ctx.drawImage(bg, 0, 0, W, Hh);
    const sx = v => (v / B + 1) / 2 * W, sy = v => (v / B + 1) / 2 * Hh;
    for (const p of ps) { ctx.strokeStyle = 'rgba(255,70,85,.35)'; ctx.beginPath(); ctx.moveTo(sx(p.x), sy(p.y)); ctx.lineTo(sx(p.x - p.vx * 2), sy(p.y - p.vy * 2)); ctx.stroke(); ctx.fillStyle = '#F4F4F2'; ctx.fillRect(sx(p.x) - 1.5, sy(p.y) - 1.5, 3, 3); }
    ctx.strokeStyle = '#FF4655'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(sx(gb.x), sy(gb.y), 7, 0, 6.283); ctx.stroke(); ctx.lineWidth = 1;
    if (out) out.textContent = 'f = ' + gb.f.toFixed(4) + ' / iter ' + t;
  };
  const loop = () => { if (t > 160) reset(); for (let i = 0; i < 2; i++) step(); draw(); raf = vis && !document.hidden ? requestAnimationFrame(loop) : 0; };
  size(); reset();
  if (RM) { for (let i = 0; i < 160; i++) step(); draw(); return; }
  draw();
  new IntersectionObserver(es => { vis = es[0].isIntersecting; if (vis && !raf) raf = requestAnimationFrame(loop); }).observe(c);
  addEventListener('resize', () => { size(); draw(); });
}

/* ---------- HUD cursor (desktop, fine pointer, motion allowed) ---------- */
export function hudCursor() {
  if (RM || !matchMedia('(hover:hover) and (pointer:fine)').matches) return;
  const el = $('#hcur'); if (!el) return;
  H.classList.add('hcur-on');
  const label = $('span', el);
  addEventListener('pointermove', e => {
    el.style.transform = `translate(${e.clientX}px,${e.clientY}px)`;
    const t = e.target.closest && e.target.closest('a,button,[role=slider],.card,.chip');
    el.classList.toggle('lock', !!t);
    label.textContent = t ? 'TARGET ' + (t.getAttribute('aria-label') || t.textContent || '').trim().slice(0, 18).toUpperCase() : `X${String(Math.round(e.clientX)).padStart(4, '0')} Y${String(Math.round(e.clientY + scrollY)).padStart(5, '0')}`;
  }, { passive: true });
  document.addEventListener('pointerleave', () => { el.style.transform = 'translate(-99px,-99px)'; });
}

/* ---------- Section rail ---------- */
export function sectionRail() {
  const rail = $('.srail'); if (!rail) return;
  const links = $$('a', rail), secs = links.map(a => document.getElementById(a.dataset.rail)).filter(Boolean);
  const up = () => {
    const y = scrollY + innerHeight * .35; let on = secs[0];
    for (const s of secs) if (s.offsetTop <= y) on = s;
    links.forEach(a => a.classList.toggle('on', a.dataset.rail === on.id));
    rail.style.setProperty('--sp', clamp(scrollY / Math.max(1, document.documentElement.scrollHeight - innerHeight), 0, 1).toFixed(3));
  };
  addEventListener('scroll', up, { passive: true }); up();
}

/* ---------- Fleet dock + console ---------- */
export function consoleAndDock(api) {
  const dock = $('#dock'), con = $('#console'), out = $('#con-out'), input = $('#con-in'); if (!con) return;
  const seats = data.fleet.departments.reduce((n, d) => n + d.seats.length, 0) + 1, t0 = Date.now();
  const line = (t, cls) => { const d = document.createElement('div'); d.className = 'ln' + (cls ? ' ' + cls : ''); d.textContent = t; out.appendChild(d); out.scrollTop = out.scrollHeight; };
  const go = id => { const el = document.getElementById(id); if (el) { close(); el.scrollIntoView({ behavior: RM ? 'auto' : 'smooth' }); return true; } return false; };
  const C = {
    help: () => line('help, whoami, ask <question>, cortex <task>, studies [rung], verdict <repo>, judge, ventures, projects, papers, seats, status, build-info, receipts, goto <section>, open <page>, build, chaos, scan, glitch, clear, exit'),
    ask: async a => { const q = a.join(' '); if (!q) { line('usage: ask what did he publish', 'dim'); return; } try { const { loadIndex, search, bestSentence } = await import('./retrieve.js'); const ix = await loadIndex(href('/index/passages.json')); const h = search(ix, q, 2); if (!h.length) { line('not on the record.', 'dim'); return; } line('"' + bestSentence(h[0].p.x, q) + '"', 'ok'); h.forEach(x => line('  source: ' + x.p.t + ' -> ' + x.p.u, 'dim')); } catch (e) { line('index offline.', 'dim'); } },
    'build-info': () => { const b = window.__BR; if (!b) { line('build record not loaded.', 'dim'); return; } line(`build ${b.fingerprint}, ${b.date}, ${b.pages} pages, ${b.layers} layers, ${b.seats} seats, ${b.passages} passages`, 'ok'); line(`lint: ${b.lint ? b.lint.errors + ' errors' : 'unrecorded'} / tests: ${b.tests ? b.tests.passed + ' passed, ' + b.tests.failed + ' failed' : 'unrecorded'}`); line('full record: /build/', 'dim'); },
    chaos: () => { if (window.__chaos && window.__chaos()) { close(); } else line('chaos runs during a build. type "build" first, then open the console and type chaos.', 'dim'); },
    studies: a => { const rungs = $$('#studies .ladder button'); if (!rungs.length) { line('studies are on /studies/. type: open studies', 'dim'); return; } const w = (a[0] || '').toLowerCase(); if (w) { const b = rungs.find(r => r.querySelector('.slab').textContent.toLowerCase().startsWith(w)); if (!b) { line('rungs: draft proposed functional evaluated released', 'dim'); return; } $$('#studies .stile').filter(t => t.dataset.rung === b.dataset.rung).forEach(t => line(`${t.dataset.tv.padEnd(32)} ${t.querySelector('span').textContent}`)); b.click(); return; } rungs.forEach(r => line(`${r.querySelector('b').textContent.padStart(3)}  ${r.querySelector('.slab').textContent}`)); line('type: studies evaluated, or verdict <repo>', 'dim'); },
    verdict: a => { const n = (a[0] || '').toLowerCase(); const t = n && $$('#studies .stile').find(x => x.querySelector('span').textContent.toLowerCase().includes(n)); if (!t) { line('usage: verdict rag-eval-harness', 'dim'); return; } line(`${t.querySelector('span').textContent}: ${t.dataset.tv}`, 'ok'); if (t.dataset.tq) line(t.dataset.tq); },
    judge: () => { if (!go('studies')) { location.href = href('/studies/#judge'); return; } const n = $('#jj-home [data-jnext]'); if (n) setTimeout(() => n.focus({ preventScroll: true }), 500); },
    cortex: a => { if (!window.__cortex) { line('cortex is still starting. try again in a second.', 'dim'); return; } close(); window.__cortex.open(); if (a.length) window.__cortex.ask(a.join(' ')); },
    whoami: () => { line(data.person.name + ' / ' + data.person.alternateName); line(data.description); },
    ventures: () => data.ventures.forEach(v => line(`${v.title.padEnd(11)} ${v.name}: ${v.what}`)),
    projects: () => data.projects.forEach((p, i) => line(`${String(i + 1).padStart(2, '0')}  ${p.name.padEnd(26)} ${p.catLabel}`)),
    papers: () => data.publications.filter(p => p.doi).forEach(p => line(`${p.date}  doi:${p.doi}  ${p.title}`)),
    seats: () => data.fleet.departments.forEach(d => line(`${d.name.padEnd(22)} ${d.seats.map(s => s[1]).join(', ')}`)),
    status: () => { line(`fleet: ${seats} seats configured, foreman: jesun`, 'ok'); line(`build: ${window.__FP || 'dev'}`); line(`session uptime: ${Math.round((Date.now() - t0) / 1000)}s`); line(`api: ${navigator.onLine ? 'reachable if deployed' : 'offline'}`); },
    receipts: () => data.stats.forEach(s => line(`${s.display.padEnd(8)} ${s.label}  <- ${s.source}`)),
    goto: a => { if (!go(a[0] || '')) line('no section: ' + (a[0] || '') + '. try: work studies ventures recognition proof about journey testimony lab contact', 'dim'); },
    open: a => { const p = (a[0] || '').replace(/[^a-z-]/g, ''); if (p) { line('opening /' + p + '/'); location.href = href('/' + p + '/'); } },
    build: () => { close(); window.__replayBoot && window.__replayBoot(); },
    matrix: () => { close(); window.__replayBoot && window.__replayBoot(); },
    scan: () => { api && api.wave(); line('shockwave fired across the network.', 'ok'); },
    glitch: () => { $$('.glitch').forEach((g, i) => setTimeout(() => { g.classList.add('glitching'); setTimeout(() => g.classList.remove('glitching'), 800); }, i * 70)); line('glitch injected.', 'ok'); },
    clear: () => { out.innerHTML = ''; },
    exit: () => close(),
    sudo: a => line(a.join(' ') === 'hire' ? 'Mandates are not bought from a terminal. Send a brief: goto contact' : 'sudo: permission denied. nice try.', 'dim')
  };
  let last = null;
  function open() { if (touring()) return; last = document.activeElement; con.hidden = false; input.value = ''; if (!out.children.length) { line(`jesun fleet console. build ${window.__FP || 'dev'}. type "help".`, 'dim'); } setTimeout(() => input.focus(), 20); }
  function close() { if (con.hidden) return; con.hidden = true; if (last && last.focus) last.focus(); }
  input.addEventListener('keydown', e => {
    if (e.key === 'Escape') { close(); return; }
    if (e.key === 'Tab') { e.preventDefault(); return; } // focus stays in the console while it is open
    if (e.key !== 'Enter') return;
    const raw = input.value.trim(); input.value = ''; line('> ' + raw, 'echo'); if (!raw) return;
    const [k, ...a] = raw.split(/\s+/); const f = C[k.toLowerCase()]; f ? f(a) : line('command not found: ' + k + '. type "help".', 'dim');
  });
  addEventListener('keydown', e => {
    if (/INPUT|TEXTAREA|SELECT/.test(e.target.tagName) && e.target !== input) return;
    // Single-key shortcut only while nothing is focused (WCAG 2.1.4), so it never fires inside a control.
    if ((e.key === '`' || e.key === '~') && (con.hidden ? (document.activeElement === document.body || !document.activeElement) : true)) { e.preventDefault(); con.hidden ? open() : close(); }
    else if (e.key === 'Escape' && !con.hidden) close();
  });
  if (dock) {
    dock.addEventListener('click', open);
    const tick = () => { const b = window.__BR, tests = b && b.tests ? ` / TESTS ${b.tests.passed}/${b.tests.passed + b.tests.failed}` : ''; $('#dock-text').textContent = `FLEET ${seats}/${seats} ONLINE / BUILD ${String(window.__FP || 'dev').slice(0, 6)}${tests} / UP ${Math.round((Date.now() - t0) / 1000)}S`; };
    tick(); setInterval(tick, 1000);
    const show = () => { dock.hidden = touring() || scrollY < innerHeight * .7; };
    addEventListener('scroll', show, { passive: true });
    show(); setInterval(show, 800);
  }
}
