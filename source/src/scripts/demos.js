// Systems wall: four client-side demos of his own methods. No network, no keys.
// Copyright Jesun Ahmad Ushno. All rights reserved.
import { $, reduced } from './core.js';

function rng(seed) { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
function fit(c) { const d = Math.min(2, devicePixelRatio || 1), w = c.clientWidth, h = Math.round(w * 10 / 16); c.width = w * d; c.height = h * d; const x = c.getContext('2d'); x.setTransform(d, 0, 0, d, 0, 0); return { x, w, h }; }

/* 1. Wavelet defect detection (his 2023 paper, the wavelet step) */
function wavelet() {
  const root = $('#wavelet'); if (!root) return;
  const raw = $('#wv-raw'), det = $('#wv-det'), out = $('#wv-out'), kind = $('#wv-kind');
  const N = 128;
  let seed = 7;
  function texture() {
    const r = rng(seed), img = new Float32Array(N * N);
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
      const weave = .5 + .22 * Math.sin(x * 1.6) * Math.sin(y * 1.6) + .12 * Math.sin((x + y) * .8);
      img[y * N + x] = weave + (r() - .5) * .08;
    }
    const k = kind.value, cx = 20 + Math.floor(r() * (N - 40)), cy = 20 + Math.floor(r() * (N - 40));
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
      const i = y * N + x;
      if (k === 'hole' && Math.hypot(x - cx, y - cy) < 6) img[i] = .08 + r() * .05;
      if (k === 'slub' && Math.abs(y - cy) < 2 && Math.abs(x - cx) < 30) img[i] = .95;
      if (k === 'stain' && Math.hypot((x - cx) * .7, y - cy) < 10) img[i] *= .55;
    }
    return { img, cx, cy };
  }
  function haar(a, n) { // one 2D Haar level: returns LL (n/2)^2
    const h = n / 2, LL = new Float32Array(h * h), D = new Float32Array(h * h);
    for (let y = 0; y < h; y++) for (let x = 0; x < h; x++) {
      const p = a[(2 * y) * n + 2 * x], q = a[(2 * y) * n + 2 * x + 1], r2 = a[(2 * y + 1) * n + 2 * x], s = a[(2 * y + 1) * n + 2 * x + 1];
      LL[y * h + x] = (p + q + r2 + s) / 4;
      D[y * h + x] = (Math.abs(p - q + r2 - s) + Math.abs(p + q - r2 - s) + Math.abs(p - q - r2 + s)) / 4;
    }
    return { LL, D, h };
  }
  function run() {
    const { img } = texture();
    const l1 = haar(img, N), l2 = haar(l1.LL, l1.h), l3 = haar(l2.LL, l2.h); // weave averages out by level 3
    const A = l3.LL, n = l3.h; let m = 0; for (const v of A) m += v; m /= A.length;
    let sd = 0; for (const v of A) sd += (v - m) ** 2; sd = Math.sqrt(sd / A.length) || 1;
    const z = Array.from(A, v => Math.abs(v - m) / sd);
    const flagged = z.map((v, i) => [v, i]).filter(([v]) => v > 2.6);
    draw(raw, img, null);
    draw(det, img, { z, n, flagged });
    const peak = Math.max(...z);
    out.innerHTML = '';
    const msg = flagged.length
      ? `Level-3 Haar approximation, ${n}x${n} blocks. <b>${flagged.length} block(s) flagged</b>, peak z = <b>${peak.toFixed(2)}</b> (threshold 2.6).`
      : `Level-3 Haar approximation, ${n}x${n} blocks. <b>No block above threshold</b>, peak z = <b>${peak.toFixed(2)}</b>.`;
    out.innerHTML = msg;
  }
  function draw(c, img, d) {
    const { x, w, h } = fit(c), id = x.createImageData(N, N);
    for (let i = 0; i < N * N; i++) { const v = Math.max(0, Math.min(255, img[i] * 255)); id.data[i * 4] = v * .96; id.data[i * 4 + 1] = v * .94; id.data[i * 4 + 2] = v * .9; id.data[i * 4 + 3] = 255; }
    const off = document.createElement('canvas'); off.width = N; off.height = N; off.getContext('2d').putImageData(id, 0, 0);
    x.imageSmoothingEnabled = false; x.fillStyle = '#070708'; x.fillRect(0, 0, w, h);
    const s = Math.min(w, h), ox = (w - s) / 2;
    if (d) x.globalAlpha = .45;
    x.drawImage(off, ox, 0, s, s); x.globalAlpha = 1;
    if (d) {
      const cs = s / d.n;
      for (const [v, i] of d.flagged) { x.fillStyle = `rgba(255,61,46,${Math.min(.85, .25 + v / 10)})`; x.fillRect(ox + (i % d.n) * cs, Math.floor(i / d.n) * cs, cs, cs); }
      x.strokeStyle = 'rgba(245,243,238,.12)';
      for (let k = 0; k <= d.n; k++) { x.beginPath(); x.moveTo(ox + k * cs, 0); x.lineTo(ox + k * cs, s); x.stroke(); x.beginPath(); x.moveTo(ox, k * cs); x.lineTo(ox + s, k * cs); x.stroke(); }
    }
  }
  $('#wv-new').addEventListener('click', () => { seed = (seed * 31 + 11) % 100000; run(); });
  kind.addEventListener('change', run);
  addEventListener('resize', run);
  run();
}

/* 2. Elitist PSO with mutation and adaptive inertia (his 2023 paper) */
function pso() {
  const root = $('#pso'); if (!root) return;
  const c = $('#pso-c'), out = $('#pso-out'), mode = $('#pso-mode');
  const f = (x, y) => 20 + x * x - 10 * Math.cos(2 * Math.PI * x) + y * y - 10 * Math.cos(2 * Math.PI * y); // Rastrigin
  const B = 5.12, P = 30, T = 120;
  let st, timer = 0, bg = null;
  function heat(w, h) {
    const off = document.createElement('canvas'); off.width = 160; off.height = 100; const x = off.getContext('2d'); const id = x.createImageData(160, 100);
    for (let j = 0; j < 100; j++) for (let i = 0; i < 160; i++) { const v = f((i / 159 * 2 - 1) * B, (j / 99 * 2 - 1) * B) / 80; const k = (j * 160 + i) * 4; const g = Math.max(0, 1 - v); id.data[k] = 18 + g * 40; id.data[k + 1] = 18 + g * 22; id.data[k + 2] = 22 + g * 18; id.data[k + 3] = 255; }
    x.putImageData(id, 0, 0); return off;
  }
  function reset() {
    const r = rng(42);
    st = { t: 0, ps: [], gb: null, elitist: mode.value === 'elitist' };
    for (let i = 0; i < P; i++) { const p = { x: (r() * 2 - 1) * B, y: (r() * 2 - 1) * B, vx: 0, vy: 0 }; p.bx = p.x; p.by = p.y; p.bf = f(p.x, p.y); st.ps.push(p); }
    st.gb = st.ps.reduce((a, b) => (b.bf < a.bf ? b : a)); st.gb = { x: st.gb.bx, y: st.gb.by, f: st.gb.bf };
    st.rand = rng(9); draw();
  }
  function step() {
    const r = st.rand, w = st.elitist ? .9 - .5 * st.t / T : .72, c1 = 1.49, c2 = 1.49;
    for (const p of st.ps) {
      p.vx = w * p.vx + c1 * r() * (p.bx - p.x) + c2 * r() * (st.gb.x - p.x);
      p.vy = w * p.vy + c1 * r() * (p.by - p.y) + c2 * r() * (st.gb.y - p.y);
      p.x = Math.max(-B, Math.min(B, p.x + p.vx)); p.y = Math.max(-B, Math.min(B, p.y + p.vy));
      if (st.elitist && r() < .08) { p.x = Math.max(-B, Math.min(B, p.x + (r() - .5) * 1.6)); p.y = Math.max(-B, Math.min(B, p.y + (r() - .5) * 1.6)); }
      const v = f(p.x, p.y);
      if (v < p.bf) { p.bf = v; p.bx = p.x; p.by = p.y; }
      if (v < st.gb.f) st.gb = { x: p.x, y: p.y, f: v };
    }
    if (st.elitist) { // elitism: the worst particle restarts at the elite with a small jitter
      let worst = st.ps[0]; for (const p of st.ps) if (f(p.x, p.y) > f(worst.x, worst.y)) worst = p;
      worst.x = st.gb.x + (r() - .5) * .3; worst.y = st.gb.y + (r() - .5) * .3; worst.vx = worst.vy = 0;
    }
    st.t++; draw(w);
  }
  function draw(w) {
    const { x, w: W, h } = fit(c);
    if (!bg) bg = heat();
    x.imageSmoothingEnabled = true; x.drawImage(bg, 0, 0, W, h);
    const sx = v => (v / B + 1) / 2 * W, sy = v => (v / B + 1) / 2 * h;
    x.fillStyle = 'rgba(245,243,238,.9)';
    for (const p of st.ps) x.fillRect(sx(p.x) - 2, sy(p.y) - 2, 4, 4);
    x.strokeStyle = '#FF3D2E'; x.lineWidth = 2; x.beginPath(); x.arc(sx(st.gb.x), sy(st.gb.y), 7, 0, Math.PI * 2); x.stroke();
    x.strokeStyle = 'rgba(61,220,132,.8)'; x.beginPath(); x.moveTo(sx(0) - 6, sy(0)); x.lineTo(sx(0) + 6, sy(0)); x.moveTo(sx(0), sy(0) - 6); x.lineTo(sx(0), sy(0) + 6); x.stroke();
    out.innerHTML = `Iteration <b>${st.t}</b> / ${T}. Best f(x) = <b>${st.gb.f.toFixed(4)}</b> (global minimum 0 at the green cross). Inertia w = <b>${(w || (st.elitist ? .9 : .72)).toFixed(2)}</b>.`;
  }
  function play() {
    clearInterval(timer); reset();
    if (reduced()) { while (st.t < T) step(); return; }
    timer = setInterval(() => { if (st.t >= T) { clearInterval(timer); return; } step(); }, 40);
  }
  $('#pso-run').addEventListener('click', play);
  mode.addEventListener('change', play);
  addEventListener('resize', () => st && draw());
  reset();
}

/* 3. Fleet routing: tasks routed to idle seats with the right skill */
function fleet() {
  const root = $('#fleet-demo'); if (!root) return;
  const c = $('#fleet-c'), out = $('#fleet-out'), load = $('#fleet-load');
  const DEPTS = ['Research', 'Engineering', 'Data', 'Design', 'Security'];
  const SEATS = [['Atlas', 0], ['Scout', 0], ['Forge', 1], ['Senior ML', 1], ['MLOps', 1], ['Pipe', 2], ['Tape', 2], ['Nova', 3], ['Vega', 3], ['Shield', 4], ['Sentry', 4]];
  let st, timer = 0;
  function reset() { st = { t: 0, queue: [], seats: SEATS.map(([n, d]) => ({ n, d, busy: 0, task: null, done: 0 })), done: 0, wait: 0, r: rng(3) }; }
  function tick() {
    const r = st.r, rate = +load.value / 100;
    if (r() < rate) st.queue.push({ d: Math.floor(r() * DEPTS.length), at: st.t, work: 18 + Math.floor(r() * 30) });
    for (const s of st.seats) {
      if (s.busy > 0) { s.busy--; if (!s.busy) { s.task = null; s.done++; st.done++; } continue; }
      const i = st.queue.findIndex(q => q.d === s.d);
      if (i >= 0) { const q = st.queue.splice(i, 1)[0]; s.task = q; s.busy = q.work; st.wait += st.t - q.at; }
    }
    st.t++; draw();
  }
  function draw() {
    const { x, w, h } = fit(c);
    x.fillStyle = '#070708'; x.fillRect(0, 0, w, h);
    const cols = DEPTS.length, cw = w / cols;
    x.font = '10px "Dossier Mono", monospace'; x.textBaseline = 'top';
    DEPTS.forEach((d, i) => { x.fillStyle = '#A8A59E'; x.fillText(d.toUpperCase(), i * cw + 8, 8); });
    st.seats.forEach(s => {
      const col = s.d, idx = st.seats.filter(o => o.d === col).indexOf(s);
      const bx = col * cw + 8, by = 30 + idx * 46, bw = cw - 16;
      x.strokeStyle = s.busy ? '#FF3D2E' : '#3A3A40'; x.lineWidth = 1; x.strokeRect(bx, by, bw, 36);
      if (s.busy && s.task) { x.fillStyle = 'rgba(255,61,46,.25)'; x.fillRect(bx, by, bw * (1 - s.busy / s.task.work), 36); }
      x.fillStyle = '#F5F3EE'; x.fillText(s.n, bx + 6, by + 6);
      x.fillStyle = s.busy ? '#FF3D2E' : '#3DDC84'; x.fillText(s.busy ? 'working' : 'idle', bx + 6, by + 20);
    });
    const qy = h - 26;
    x.fillStyle = '#A8A59E'; x.fillText('QUEUE ' + st.queue.length, 8, qy - 14);
    st.queue.slice(0, 60).forEach((q, i) => { x.fillStyle = ['#7AA2FF', '#F5F3EE', '#3DDC84', '#FF7AB6', '#FFB020'][q.d]; x.fillRect(8 + i * 9, qy, 6, 6); });
    const util = st.seats.filter(s => s.busy).length / st.seats.length;
    out.innerHTML = `Tick <b>${st.t}</b>. Completed <b>${st.done}</b>. Average wait <b>${st.done ? (st.wait / Math.max(1, st.done)).toFixed(1) : '0.0'}</b> ticks. Seat utilisation <b>${Math.round(util * 100)}%</b>.`;
  }
  function play() { clearInterval(timer); reset(); if (reduced()) { for (let i = 0; i < 300; i++) tick(); return; } timer = setInterval(tick, 60); }
  $('#fleet-run').addEventListener('click', play);
  load.addEventListener('input', () => { $('#fleet-load-v').textContent = load.value + '%'; });
  addEventListener('resize', () => st && draw());
  reset(); for (let i = 0; i < 160; i++) tick();
}

/* 4. In-browser CSV analysis, the PRISM principle: no bytes leave the machine */
function csv() {
  const root = $('#csv'); if (!root) return;
  const ta = $('#csv-in'), out = $('#csv-out'), file = $('#csv-file'), stat = $('#csv-net');
  function parse(text) {
    const rows = []; let row = [], cur = '', q = false;
    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      if (q) { if (ch === '"' && text[i + 1] === '"') { cur += '"'; i++; } else if (ch === '"') q = false; else cur += ch; }
      else if (ch === '"') q = true; else if (ch === ',') { row.push(cur); cur = ''; }
      else if (ch === '\n' || ch === '\r') { if (ch === '\r' && text[i + 1] === '\n') i++; row.push(cur); rows.push(row); row = []; cur = ''; }
      else cur += ch;
    }
    if (cur || row.length) { row.push(cur); rows.push(row); }
    return rows.filter(r => r.some(v => v.trim() !== ''));
  }
  function analyse() {
    const t0 = performance.now();
    const rows = parse(ta.value); if (rows.length < 2) { out.textContent = 'Paste at least a header row and one data row.'; return; }
    const head = rows[0], body = rows.slice(1);
    const tbl = document.createElement('table'); tbl.className = 'tbl';
    tbl.innerHTML = '<thead><tr><th>Column</th><th>Type</th><th class="n">Rows</th><th class="n">Empty</th><th class="n">Unique</th><th class="n">Mean</th><th class="n">Min</th><th class="n">Max</th><th class="n">Std</th></tr></thead><tbody></tbody>';
    const tb = tbl.querySelector('tbody');
    head.forEach((h, ci) => {
      const vals = body.map(r => (r[ci] || '').trim()), present = vals.filter(v => v !== ''), nums = present.map(Number).filter(n => !Number.isNaN(n));
      const numeric = present.length && nums.length === present.length;
      const tr = document.createElement('tr');
      const cell = (v, n) => { const td = document.createElement('td'); if (n) td.className = 'n'; td.textContent = v; tr.appendChild(td); };
      cell(h || '(blank)'); cell(numeric ? 'number' : 'text'); cell(String(vals.length), 1); cell(String(vals.length - present.length), 1); cell(String(new Set(present).size), 1);
      if (numeric) { const m = nums.reduce((a, b) => a + b, 0) / nums.length, sd = Math.sqrt(nums.reduce((a, b) => a + (b - m) ** 2, 0) / nums.length); cell(m.toFixed(2), 1); cell(String(Math.min(...nums)), 1); cell(String(Math.max(...nums)), 1); cell(sd.toFixed(2), 1); }
      else { cell('-', 1); cell('-', 1); cell('-', 1); cell('-', 1); }
      tb.appendChild(tr);
    });
    out.innerHTML = ''; const wrap = document.createElement('div'); wrap.className = 'scroll-x'; wrap.appendChild(tbl); out.appendChild(wrap);
    const n = performance.getEntriesByType ? performance.getEntriesByType('resource').filter(e => e.startTime > t0).length : 0;
    stat.innerHTML = `Analysed <b>${body.length}</b> rows x <b>${head.length}</b> columns in <b>${(performance.now() - t0).toFixed(1)} ms</b>. Network requests made: <b>${n}</b>.`;
  }
  $('#csv-run').addEventListener('click', analyse);
  file.addEventListener('change', () => { const f = file.files[0]; if (!f) return; const r = new FileReader(); r.onload = () => { ta.value = String(r.result).slice(0, 2e6); analyse(); }; r.readAsText(f); });
  analyse();
}

export function initDemos() { wavelet(); pso(); fleet(); csv(); }
