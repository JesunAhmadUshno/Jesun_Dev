// Synaptic Weather: a seeded flow field whose traces read as a living mind. It storms when Cortex
// thinks (the cortex:think event) and calms when it rests. See docs/ALGORITHMIC-PHILOSOPHY.md.
// Copyright Jesun Ahmad Ushno. All rights reserved.
const RM = () => { try { if (localStorage.getItem('jesun.rm') === '1') return true; } catch (e) { /* blocked */ } return matchMedia('(prefers-reduced-motion: reduce)').matches; };
function rng(seed) { let s = seed >>> 0; return () => { s = (s + 0x6D2B79F5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
export function synaptic(c) {
  if (!c) return;
  const x = c.getContext('2d'); const R = rng(20261114);
  const waves = Array.from({ length: 5 }, () => ({ kx: (R() - .5) * .012, ky: (R() - .5) * .012, p: R() * 6.28, a: .5 + R() }));
  let W = 0, H = 0, P = [], storm = 0, pulse = null, raf = 0, on = false, last = 0;
  const size = () => { const d = Math.min(1.5, devicePixelRatio || 1); W = c.clientWidth; H = c.clientHeight; c.width = W * d; c.height = H * d; x.setTransform(d, 0, 0, d, 0, 0); x.fillStyle = '#07070B'; x.fillRect(0, 0, W, H); };
  const angle = (px, py, t) => { let s = 0; for (const w of waves) s += w.a * Math.sin(px * w.kx + py * w.ky + w.p + t * .00012 * (1 + storm * 3)); return s * 1.6; };
  const spawn = near => { const p = near && pulse ? { x: pulse.x + Math.cos(R() * 6.28) * pulse.r, y: pulse.y + Math.sin(R() * 6.28) * pulse.r } : { x: R() * W, y: R() * H }; p.life = 60 + R() * 90; return p; };
  const step = t => {
    x.fillStyle = `rgba(7,7,11,${.06 + storm * .04})`; x.fillRect(0, 0, W, H);
    x.lineWidth = .9; x.strokeStyle = `rgba(255,${70 + storm * 60 | 0},85,${.32 + storm * .3})`; x.beginPath();
    const sp = 1.1 + storm * 2.2;
    for (let i = 0; i < P.length; i++) {
      const p = P[i]; const a = angle(p.x, p.y, t); const nx = p.x + Math.cos(a) * sp, ny = p.y + Math.sin(a) * sp;
      x.moveTo(p.x, p.y); x.lineTo(nx, ny); p.x = nx; p.y = ny;
      if (--p.life < 0 || nx < 0 || ny < 0 || nx > W || ny > H) P[i] = spawn(storm > .2 && R() < .5);
    }
    x.stroke();
    if (pulse) { pulse.r += 6 + storm * 6; x.strokeStyle = `rgba(255,89,100,${Math.max(0, .28 - pulse.r / (W * 1.6))})`; x.lineWidth = 1.5; x.beginPath(); x.arc(pulse.x, pulse.y, pulse.r, 0, 6.283); x.stroke(); if (pulse.r > Math.hypot(W, H)) pulse = null; }
    storm *= .985;
  };
  const loop = t => { raf = requestAnimationFrame(loop); if (t - last < 33) return; last = t; step(t); };
  size(); P = Array.from({ length: Math.round(Math.min(900, W * H / 900)) }, () => spawn(false));
  if (RM()) { for (let k = 0; k < 160; k++) step(k * 33); return; }
  const run = () => { cancelAnimationFrame(raf); raf = 0; if (on && !document.hidden) raf = requestAnimationFrame(loop); };
  new IntersectionObserver(es => { on = es[0].isIntersecting; run(); }).observe(c);
  document.addEventListener('visibilitychange', run);
  addEventListener('resize', () => { size(); });
  addEventListener('cortex:think', () => { storm = 1; pulse = { x: W / 2, y: H / 2, r: 4 }; });
  c.addEventListener('pointerdown', e => { const r = c.getBoundingClientRect(); storm = Math.min(1, storm + .6); pulse = { x: e.clientX - r.left, y: e.clientY - r.top, r: 4 }; });
}
