// Cortex avatar: a field of light that starts as a lattice, swarms into a brain, resolves into
// his own face, and settles into a turning sphere.
//
// The face is not a drawing. It is his portrait, sampled into a point cloud by
// scripts/facemap.py, with a depth and a brightness on every point, so the head has real volume
// and real light. The cloud is also labelled, which is what lets the eyes blink and the mouth
// move while Cortex speaks. The head tracks the pointer, looks around on its own when left
// alone, and carries a holographic scan, a rim light and a chromatic fringe.
//
// Everything degrades: no pointer, no tracking. Reduced motion, a still portrait. No canvas,
// nothing at all, and the panel around it still works.
// Copyright Jesun Ahmad Ushno. All rights reserved.
// The portrait cloud is about forty kilobytes, so it is not part of the first paint. It is
// fetched when the panel opens and swapped in before the boot sequence reaches the face.
let FACE = null;
let facePending = null;
function loadFace() {
  if (FACE || facePending) return facePending;
  facePending = import('./face-map.js').then(m => { FACE = m.FACE; return FACE; }).catch(() => null);
  return facePending;
}

const RM = () => { try { if (localStorage.getItem('jesun.rm') === '1') return true; } catch (e) { /* blocked */ } return !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches); };
const ease = t => (t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
function rng(seed) { let s = seed >>> 0; return () => { s = (s + 0x6D2B79F5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

/* ---- the brain, drawn in a 100 by 100 box and sampled for points ----
   A lateral view, facing left, with the parts that make a brain read as a brain: a gyral edge
   rather than a smooth oval, the Sylvian fissure cutting the temporal lobe away, the cerebellum
   with its folia, and the brainstem below. The first version here was one blob with three
   stripes across it, which read as a potato. */
const BODIES = [
  // cerebrum
  'M11 45C9 37 13 28 20 23C25 18 32 15 39 15C45 13 52 14 58 15C66 14 74 18 80 25C86 31 90 39 90 47C91 54 88 60 84 64C80 68 74 69 69 68C64 68 60 69 57 71C53 68 48 67 43 69C39 72 34 76 29 77C23 78 18 74 16 68C13 62 12 53 11 45Z',
  // temporal lobe, below the fissure and pointing forward
  'M18 62C22 66 28 68 35 68C42 68 48 70 52 73C50 79 44 83 37 83C30 83 23 80 19 75C16 71 16 66 18 62Z',
  // cerebellum
  'M66 70C74 66 85 69 87 76C88 83 80 88 71 86C64 84 61 75 66 70Z',
  // brainstem
  'M55 73C59 79 61 87 59 96L50 96C52 88 50 80 47 74Z'
];
// [path, stroke width]. These are cut out of the fill, so they read as grooves.
const FOLDS = [
  ['M17 61C24 65 32 67 40 67C46 67 51 69 55 72', 2.4],   // Sylvian fissure
  ['M57 17C54 25 50 32 45 38C42 42 40 46 39 50', 1.9],   // central sulcus
  ['M48 16C45 24 41 30 37 36C34 40 33 43 32 47', 1.5],
  ['M66 19C63 27 59 33 55 39C52 43 51 46 50 50', 1.5],
  ['M12 38C17 34 23 32 29 31C33 30 36 30 38 28', 1.5],
  ['M13 48C19 45 25 43 30 42C34 41 36 41 38 39', 1.5],
  ['M16 56C21 54 26 53 30 52', 1.5],
  ['M72 28C76 33 78 39 77 45C77 49 76 52 74 55', 1.5],
  ['M81 38C85 43 86 49 84 55', 1.5],
  ['M60 56C65 54 70 54 75 55', 1.5],
  ['M22 72C28 70 35 70 41 71', 1.5],
  ['M25 78C31 76 37 76 43 77', 1.5],
  ['M65 74C71 71 80 71 86 73', 1.2],
  ['M65 79C71 76 80 76 87 78', 1.2],
  ['M67 84C72 81 80 81 85 83', 1.2]
];

const STRIDE = 5; // x, y, z, luminance, region
const R_EYE_L = 1, R_EYE_R = 2, R_MOUTH = 3;

function drawBrain(x, W, H) {
  const s = Math.min(W, H) * .98 / 100, ox = (W - 100 * s) / 2, oy = (H - 100 * s) / 2;
  x.save(); x.translate(ox, oy); x.scale(s, s); x.fillStyle = '#fff'; x.strokeStyle = '#fff';
  for (const p of BODIES) x.fill(new Path2D(p));
  x.globalCompositeOperation = 'destination-out'; x.lineCap = 'round'; x.lineJoin = 'round';
  for (const [f, w] of FOLDS) { x.lineWidth = w; x.stroke(new Path2D(f)); }
  x.restore();
}

// Sample n points from whatever the draw leaves opaque, spread by a seeded shuffle.
// Returns [x, y, z, luminance, region].
function sampleBrain(n, W, H) {
  const c = document.createElement('canvas'); c.width = W; c.height = H;
  const x = c.getContext('2d', { willReadFrequently: true });
  drawBrain(x, W, H);
  const d = x.getImageData(0, 0, W, H).data;
  const R = Math.min(W, H) * .42, cx = W / 2, cy = H / 2;
  const on = (px, y) => px >= 0 && y >= 0 && px < W && y < H && d[(y * W + px) * 4 + 3] > 140;
  // Two pools. An even fill of dots over a silhouette is a blob whatever the silhouette is:
  // what makes a shape read is its boundary. So the outline, and the edges of every sulcus,
  // are sampled separately and drawn brighter, and the interior fills in behind them.
  const rim = [], fill = [];
  const g = Math.max(2, Math.round(Math.min(W, H) / 150));
  for (let y = 0; y < H; y += 2) for (let px = 0; px < W; px += 2) {
    if (!on(px, y)) continue;
    (on(px + g, y) && on(px - g, y) && on(px, y + g) && on(px, y - g) ? fill : rim).push([px, y]);
  }
  if (!rim.length && !fill.length) return Array.from({ length: n }, () => [cx, cy, 0, .6, 0]);
  const r = rng(9173);
  const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = (r() * (i + 1)) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; };
  shuffle(rim); shuffle(fill);
  const nRim = Math.min(rim.length ? Math.round(n * .55) : 0, n);
  return Array.from({ length: n }, (_, i) => {
    const edge = i < nRim && rim.length;
    const src = edge ? rim : (fill.length ? fill : rim);
    const p = src[(edge ? i : i - nRim) % src.length];
    const x0 = p[0] + (r() - .5) * 1.6, y0 = p[1] + (r() - .5) * 1.6;
    // The rim is the drawing. The interior is shading behind it, lit from the upper left so it
    // agrees with the key light on the portrait.
    const l = edge ? clamp(.86 + (r() - .5) * .2, 0, 1)
      : clamp(.30 + ((cx - x0) + (cy - y0)) / (R * 5.2) + (r() - .5) * .16, 0, 1);
    return [x0, y0, (edge ? .25 : 1) * (r() - .5) * R * .45, l, 0];
  });
}

function lattice(n, W, H) {
  const cols = Math.ceil(Math.sqrt(n * W / H)), rows = Math.ceil(n / cols);
  const gx = W / (cols + 1), gy = H / (rows + 1), out = [];
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) { if (out.length >= n) break; out.push([gx * (c + 1), gy * (r + 1), 0, .5, 0]); }
  return out;
}

// A real sphere: points spread over a shell by the golden angle, a few pulled inward so the
// volume has a core, each lit by the same key light as the portrait.
function orbCloud(n, W, H) {
  const r = rng(4412), cx = W / 2, cy = H / 2, R = Math.min(W, H) * .44, out = [];
  const GA = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < n; i++) {
    const t = 1 - (i + .5) / n * 2, rad = Math.sqrt(Math.max(0, 1 - t * t)), a = GA * i;
    const shell = i % 7 === 0 ? .45 + r() * .3 : .9 + r() * .1;
    const X = Math.cos(a) * rad * shell, Y = t * shell, Z = Math.sin(a) * rad * shell;
    out.push([cx + X * R * 1.1, cy + Y * R, Z * R, clamp(.34 + (-X * .5 - Y * .62 + Z * .4) * .78, 0, 1), 0]);
  }
  return out;
}

// His face. The cloud is shuffled once so any subset of it is still a whole portrait, and the
// eye and mouth points are kept whole rather than thinned, because that is what has to move.
function faceCloud(n, W, H) {
  if (!FACE) return null;
  const m = FACE.length / STRIDE, r = rng(5531);
  // Fit the cloud to its own bounding box, not to the photo's frame. The crop carries margin
  // around his head, and scaling by the frame would render the face at a third of the stage.
  // Measure the head alone. Including the shoulders would shrink the face to make room for a
  // coat, and the face is the part that has to be legible.
  let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
  for (let i = 0; i < m; i++) {
    if (FACE[i * STRIDE + 4] === 5) continue;
    const a = FACE[i * STRIDE], b = FACE[i * STRIDE + 1];
    if (a < x0) x0 = a; if (a > x1) x1 = a; if (b < y0) y0 = b; if (b > y1) y1 = b;
  }
  const s = Math.min(W * .62 / (x1 - x0 || 1), H * .90 / (y1 - y0 || 1));
  const ox = (W - (x1 - x0) * s) / 2 - x0 * s, oy = H * .035 - y0 * s;
  const live = [], rest = [];
  for (let i = 0; i < m; i++) (FACE[i * STRIDE + 4] >= R_EYE_L && FACE[i * STRIDE + 4] <= R_MOUTH ? live : rest).push(i);
  for (const arr of [live, rest]) for (let i = arr.length - 1; i > 0; i--) { const j = (r() * (i + 1)) | 0; [arr[i], arr[j]] = [arr[j], arr[i]]; }
  const order = live.concat(rest);
  return Array.from({ length: n }, (_, i) => {
    const k = order[i % order.length] * STRIDE;
    // A photo only gives the front of a head, so the cloud is a bowl and not a sphere. Full
    // depth would turn into a cone the moment the head rotates, so the relief is damped to
    // roughly what survives a small turn and still reads as volume.
    return [ox + FACE[k] * s, oy + FACE[k + 1] * s, FACE[k + 2] * s * .46, FACE[k + 3] / 255, FACE[k + 4]];
  });
}

/**
 * avatar(canvas, opts) -> { play, state, level, destroy }
 *   play(sequence)   walk the dots through named shapes
 *   state(s)         '' at rest, 'think' while working, 'speak' while talking
 *   level(v)         0 to 1 mouth openness, for driving the lips from real speech
 *   onPhase(name)    fires as each shape starts forming, then 'settled'
 */
export function avatar(canvas, { count = 900, seq = ['grid', 'brain', 'face', 'orb'], hold = 1250, dur = 1400, auto = true, onPhase = null } = {}) {
  if (!canvas) return null;
  const x = canvas.getContext('2d');
  let W = 0, H = 0, D = 1, P = [], shapes = {}, raf = 0, on = false, last = 0, R = 60;
  let to = null, t0 = 0, queue = [], busy = false, settled = false, done = 0, total = 0;
  let px = -9999, py = -9999, pointerIn = false, spin = 0;
  let yaw = 0, pitch = 0, yawT = 0, pitchT = 0;          // where the head is looking
  let blink = 0, nextBlink = 1800, idleLook = 0, mouth = 0, mouthT = 0, fed = 0;
  const r = rng(2268);
  const say = (n, i) => { try { onPhase && onPhase(n, i, total); } catch (e) { /* a label must never break the field */ } };

  let SP = null, SPR = 0;
  // One soft round dot, drawn once and then stamped. A radial sprite reads as light rather than
  // as a pixel, and stamping it costs far less than an arc per dot per frame.
  const sprite = () => {
    SPR = Math.max(8, Math.round(9 * D));
    const c = document.createElement('canvas'); c.width = c.height = SPR * 2;
    const g = c.getContext('2d'), rg = g.createRadialGradient(SPR, SPR, 0, SPR, SPR, SPR);
    // A hard little core with only a whisper of halo. A wide halo turns the portrait to fog.
    rg.addColorStop(0, 'rgba(255,252,250,1)');
    rg.addColorStop(.30, 'rgba(255,236,228,.88)');
    rg.addColorStop(.46, 'rgba(255,132,124,.22)');
    rg.addColorStop(.72, 'rgba(255,80,92,.05)');
    rg.addColorStop(1, 'rgba(255,70,85,0)');
    g.fillStyle = rg; g.fillRect(0, 0, SPR * 2, SPR * 2);
    SP = c;
  };

  const build = () => {
    const box = canvas.getBoundingClientRect();
    // Integers only: the pixel index maths in the brain sampler is W based, so a fractional
    // width reads garbage.
    D = Math.min(2, devicePixelRatio || 1); W = Math.max(40, Math.floor(box.width)); H = Math.max(40, Math.floor(box.height));
    R = Math.min(W, H) * .5;
    canvas.width = W * D; canvas.height = H * D; x.setTransform(D, 0, 0, D, 0, 0);
    shapes = { grid: lattice(count, W, H), brain: sampleBrain(count, W, H), orb: orbCloud(count, W, H) };
    shapes.face = faceCloud(count, W, H) || shapes.orb;   // until the portrait lands, the sphere stands in
    if (!P.length) {
      P = shapes.grid.map(([a, b, c, l, g], i) => ({
        x: a, y: b, z: c, l, g, sx: a, sy: b, sz: c, sl: l, tx: a, ty: b, tz: c, tl: l,
        d: (i % 40) / 40 * .35, ph: r() * 6.283, sp: .4 + r() * .8, sz0: .74 + r() * .6, tw: r() * 6.283,
        ex: 0, ey: 0
      }));
    } else {
      P.forEach((p, i) => { const g = shapes[to || 'orb'][i]; p.tx = g[0]; p.ty = g[1]; p.tz = g[2]; p.tl = g[3]; p.g = g[4]; });
    }
    faceAnchors();
    sprite();
  };
  const anchors = { eyeL: null, eyeR: null, mouth: null };
  // Where each eye and the mouth sit, so a blink closes onto the real lid line.
  const faceAnchors = () => {
    const acc = { 1: [0, 0, 0], 2: [0, 0, 0], 3: [0, 0, 0] };
    for (const g of shapes.face) if (acc[g[4]]) { acc[g[4]][0] += g[0]; acc[g[4]][1] += g[1]; acc[g[4]][2]++; }
    anchors.eyeL = acc[1][2] ? [acc[1][0] / acc[1][2], acc[1][1] / acc[1][2]] : null;
    anchors.eyeR = acc[2][2] ? [acc[2][0] / acc[2][2], acc[2][1] / acc[2][2]] : null;
    anchors.mouth = acc[3][2] ? [acc[3][0] / acc[3][2], acc[3][1] / acc[3][2]] : null;
  };

  const goto = name => {
    to = name; t0 = performance.now();
    P.forEach((p, i) => {
      p.sx = p.x; p.sy = p.y; p.sz = p.z; p.sl = p.l;
      const g = shapes[name][i]; p.tx = g[0]; p.ty = g[1]; p.tz = g[2]; p.tl = g[3]; p.g = g[4];
    });
  };
  const step = () => {
    if (!queue.length) { busy = false; settled = true; say('settled', total); return; }
    busy = true; settled = false;
    const n = queue.shift(); goto(n); say(n, done++);
    setTimeout(step, dur + hold);
  };

  const frame = now => {
    raf = requestAnimationFrame(frame);
    if (!busy && settled && now - last < 33) return; // 30fps at rest, full rate while morphing
    const dt = Math.min(64, now - last || 16); last = now;
    const isFace = to === 'face';
    const mode = canvas.dataset.state || '';
    const think = mode === 'think', speaking = mode === 'speak';

    /* ---- the head decides where it is looking ---- */
    if (pointerIn && px > -9000) {
      yawT = clamp((px - W / 2) / (W * .5), -1, 1) * .26;
      pitchT = clamp((py - H / 2) / (H * .5), -1, 1) * .15;
      idleLook = now + 2600;
    } else if (now > idleLook) {
      // left alone, it looks about on its own rather than staring
      yawT = Math.sin(now * .00031) * .15 + Math.sin(now * .00097) * .05;
      pitchT = Math.sin(now * .00042 + 1.1) * .07;
    }
    yaw += (yawT - yaw) * Math.min(1, dt / 190);
    pitch += (pitchT - pitch) * Math.min(1, dt / 220);
    // away from the face the field turns under its own power
    if (!isFace) { spin += (think ? .0052 : .0022) * (dt / 16); }

    /* ---- blink and speech ---- */
    if (isFace && settled) {
      nextBlink -= dt;
      if (nextBlink <= 0) { blink = 1; nextBlink = 2400 + r() * 4200; }
    }
    blink = Math.max(0, blink - dt / 125);
    const lid = Math.sin(clamp(blink, 0, 1) * Math.PI);   // 0 open, 1 shut
    if (now - fed > 180) mouthT = speaking ? .22 + Math.abs(Math.sin(now * .011)) * .55 * (.6 + Math.sin(now * .0037) * .4) : 0;
    mouth += (mouthT - mouth) * Math.min(1, dt / 70);

    const k = to && busy ? Math.min(1, (now - t0) / dur) : 1;
    x.clearRect(0, 0, W, H);
    const cx = W / 2, cy = H / 2;
    const bloom = [];   // only the highlights get a halo, in a second pass
    const breath = 1 + Math.sin(now * .0009) * .016;
    // Only the sphere turns all the way round. A brain or a lattice that rotates shows its far
    // side half the time, and the far side is dim, so those sway a few degrees instead.
    const turn = isFace ? yaw : to === 'orb' ? spin : Math.sin(now * .0007) * .2;
    const cy_ = Math.cos(turn), sy_ = Math.sin(turn);
    const cp = Math.cos(isFace ? pitch : 0), sp_ = Math.sin(isFace ? pitch : 0);

    for (const p of P) {
      const kk = clamp((k - p.d) / (1 - p.d), 0, 1);
      const e = ease(kk);
      let tx = p.sx + (p.tx - p.sx) * e, ty = p.sy + (p.ty - p.sy) * e, tz = p.sz + (p.tz - p.sz) * e;
      p.l = p.sl + (p.tl - p.sl) * e;
      // in flight the dots bow outward, so the swarm reads as motion and not a cross fade
      if (e > 0 && e < 1) { const bow = Math.sin(e * Math.PI) * 26 * p.sp; tx += Math.cos(p.ph) * bow; ty += Math.sin(p.ph) * bow; tz += Math.sin(e * Math.PI) * 18 * p.sp; }
      const drift = settled ? (think ? 1.9 : (isFace ? .22 : .8)) : .4;  // a resting face holds still, so the features stay sharp
      tx += Math.cos(now * .0011 * p.sp + p.ph) * drift;
      ty += Math.sin(now * .0013 * p.sp + p.ph) * drift;

      // the eyes close and the mouth opens, on the real anchors from the photo
      let dim = 1;
      if (isFace && e > .55) {
        if (lid > 0 && (p.g === R_EYE_L || p.g === R_EYE_R)) {
          const a = p.g === R_EYE_L ? anchors.eyeL : anchors.eyeR;
          if (a) { ty += (a[1] - ty) * lid; dim = 1 - lid * .72; }
        } else if (p.g === R_MOUTH && mouth > .01 && anchors.mouth) {
          const open = (ty - anchors.mouth[1]) * mouth * 1.5;
          ty += open; dim = 1 + mouth * .5;
        }
      }
      p.x = tx; p.y = ty; p.z = tz;

      // project: yaw, then pitch, then a mild perspective so depth is readable
      const ax = (tx - cx) * breath, ay = (ty - cy) * breath, az = tz * breath;
      const rx = ax * cy_ + az * sy_;
      let rz = -ax * sy_ + az * cy_;
      const ry = ay * cp - rz * sp_;
      rz = ay * sp_ + rz * cp;
      const persp = 1 + rz / (R * 4.2);
      let sx = cx + rx * persp, sy = cy + ry * persp;
      if (pointerIn && px > -9000 && !isFace) {
        const bx = sx - px, by = sy - py, d2 = bx * bx + by * by;
        if (d2 < 2600) { const f = (1 - d2 / 2600) * 16; sx += bx / Math.sqrt(d2 + .01) * f; sy += by / Math.sqrt(d2 + .01) * f; }
      }

      const depth = clamp(.5 + rz / (R * 2), 0, 1);           // 0 far, 1 near
      const tw = (isFace ? .93 : .84) + Math.sin(now * .003 * p.sp + p.tw) * (isFace ? .07 : .16);
      const lum = clamp(p.l, 0, 1);
      // Brightness carries the likeness, size only hints at it. Big sprites bloom into each
      // other and the face turns to fog, so the dot stays small and the light does the work.
      // Density draws the dark mass, brightness draws the light. Every dot is a crisp core:
      // soft halos on two thousand overlapping dots add up to fog, and the likeness goes with
      // it. Only the highlights earn a halo, and they get it in the pass below.
      const a = clamp((.26 + .74 * lum) * (.46 + .54 * depth) * tw * dim * (think ? 1.08 : .96), 0, 1);
      const s = Math.max(.7, p.sz0 * (.58 + lum * .5) * (.6 + depth * .55) * persp);
      const g = (150 + lum * 95) | 0, bl = (140 + lum * 85) | 0, rr = think ? 255 : 252;
      x.fillStyle = `rgba(${rr},${g},${bl},${a.toFixed(3)})`;
      x.fillRect(sx - s / 2, sy - s / 2, s, s);
      if (lum > .72 && depth > .5) bloom.push(sx, sy, s * 3.4, (lum - .72) * 1.1 * depth);
    }
    // the highlights, and only those, carry light into the air around them
    x.globalCompositeOperation = 'lighter';
    for (let i = 0; i < bloom.length; i += 4) {
      x.globalAlpha = Math.min(.5, bloom[i + 3]);
      const r2 = bloom[i + 2];
      x.drawImage(SP, bloom[i] - r2, bloom[i + 1] - r2, r2 * 2, r2 * 2);
    }
    x.globalAlpha = 1;

    /* ---- the holographic pass: a scan sweep, a rim and a chromatic fringe ---- */
    const sweep = ((now * .00022) % 1) * (H + 90) - 45;
    const gr = x.createLinearGradient(0, sweep - 44, 0, sweep + 44);
    gr.addColorStop(0, 'rgba(120,190,255,0)');
    gr.addColorStop(.5, think ? 'rgba(255,150,150,.085)' : 'rgba(140,190,255,.055)');
    gr.addColorStop(1, 'rgba(120,190,255,0)');
    x.fillStyle = gr; x.fillRect(0, sweep - 44, W, 88);
    const rim = x.createRadialGradient(cx, cy, R * .52, cx, cy, R * 1.12);
    rim.addColorStop(0, 'rgba(255,70,85,0)');
    rim.addColorStop(1, speaking ? 'rgba(255,120,110,.10)' : 'rgba(110,160,255,.07)');
    x.fillStyle = rim; x.fillRect(0, 0, W, H);
    x.globalCompositeOperation = 'source-over';
  };

  build();
  // Fetch the portrait now. It arrives long before the boot sequence reaches the face, and if
  // it never arrives the sphere simply stands in its place.
  const still = RM();
  loadFace().then(f => {
    if (!f) return;
    const c = faceCloud(count, W, H); if (!c) return;
    shapes.face = c; faceAnchors();
    if (still) { P.forEach((p, i) => { const g = c[i]; p.x = p.tx = p.sx = g[0]; p.y = p.ty = p.sy = g[1]; p.z = p.tz = p.sz = g[2]; p.l = p.tl = p.sl = g[3]; p.g = g[4]; }); frame(performance.now()); cancelAnimationFrame(raf); raf = 0; }
    else if (to === 'face') P.forEach((p, i) => { const g = c[i]; p.tx = g[0]; p.ty = g[1]; p.tz = g[2]; p.tl = g[3]; p.g = g[4]; });
  });
  if (still) {
    P.forEach((p, i) => { const g = shapes.face[i]; p.x = p.tx = p.sx = g[0]; p.y = p.ty = p.sy = g[1]; p.z = p.tz = p.sz = g[2]; p.l = p.tl = p.sl = g[3]; p.g = g[4]; });
    to = 'face'; settled = true; busy = false; total = 0;
    frame(performance.now()); cancelAnimationFrame(raf); raf = 0;
    say('settled', 0);
    return { play() { }, state() { }, level() { }, destroy() { } };
  }

  const run = () => { cancelAnimationFrame(raf); raf = 0; if (on && !document.hidden) raf = requestAnimationFrame(frame); };
  const io = new IntersectionObserver(es => { on = es[0].isIntersecting; run(); }); io.observe(canvas);
  document.addEventListener('visibilitychange', run);
  // The stage changes height when the conversation starts, which fires no resize event, so
  // the canvas watches its own box instead of the window.
  let rz2 = 0; const redo = () => { clearTimeout(rz2); rz2 = setTimeout(build, 140); };
  addEventListener('resize', redo);
  let ro = null;
  if (window.ResizeObserver) { ro = new ResizeObserver(redo); ro.observe(canvas); }
  // The head follows the pointer anywhere over the panel, not only over its own canvas, which is
  // what makes it feel aware of the reader rather than of a box.
  const track = e => {
    const b = canvas.getBoundingClientRect();
    px = e.clientX - b.left; py = e.clientY - b.top; pointerIn = true;
    // beyond this radius the pointer is somewhere else entirely, so the head stops following
    if (Math.abs(px - b.width / 2) > b.width * 2.4 || py < -b.height * 1.5 || py > b.height * 9) pointerIn = false;
  };
  const host = canvas.closest('.cx-panel') || canvas.parentElement || canvas;
  host.addEventListener('pointermove', track);
  host.addEventListener('pointerleave', () => { pointerIn = false; px = py = -9999; });

  const api = {
    play(list = seq) { queue = list.slice(); total = queue.length; done = 0; settled = false; step(); },
    state(s) { canvas.dataset.state = s || ''; },
    // Feed real speech loudness here and the lips follow it instead of a generic loop.
    level(v) { mouthT = clamp(Number(v) || 0, 0, 1); fed = performance.now(); },
    destroy() { cancelAnimationFrame(raf); io.disconnect(); if (ro) ro.disconnect(); removeEventListener('resize', redo); host.removeEventListener('pointermove', track); }
  };
  if (auto) api.play();
  return api;
}
