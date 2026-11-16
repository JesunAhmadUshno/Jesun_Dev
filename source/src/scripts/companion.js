// The companion: Jesun's full body 3D avatar, standing on a small hologram pad at the edge of
// every page. It is Cortex's body.
//
// What it does, and why:
//   - Each section of the page has a gesture. Scroll into the work and he points at it, reach
//     the recognition and he celebrates, reach the lab and he thinks. It plays once per section
//     per visit, then he settles, so it reads as attention and not as a loop.
//   - When Cortex thinks, he thinks. When Cortex speaks, he talks. When the panel opens he steps
//     aside, because the panel has its own face, and comes back with a nod when it closes.
//   - Left alone for a while, he does something small on his own: a nod, a look, a thought.
//   - He turns toward the pointer and leans with the scroll, on a real 3D transform, so he sits
//     in the page's space instead of being pasted over it.
//
// Formats: VP9 video with alpha where it plays (Chrome, Edge, Firefox), animated WebP on WebKit,
// which cannot decode VP9 alpha. Reduced motion gets a still per state and no motion at all.
// Clips are fetched one state at a time, only when needed.
//
// Ported from the React and Framer Motion component in the avatar pack (JesunFullBodyAvatar).
// The site is plain JavaScript, so the same behaviour is rebuilt here without the framework:
// crossfaded state layers, float, hover tilt, click flash, reduced motion stills.
// Copyright Jesun Ahmad Ushno. All rights reserved.

// Resolved from this script's own location (it ships in /js/), so the clips are found on the
// live site and inside a preview that serves the site from a sub path.
const BASE = (() => { try { return new URL('../img/avatar3d/', import.meta.url).href; } catch (e) { return '/img/avatar3d/'; } })();
// How long each clip runs once, in ms (frames at 15 fps). A gesture plays for this long, then
// he returns to his resting state.
const LEN = { idle: 6400, wave: 5270, nod: 6070, talking: 6000, thinking: 6000, celebrate: 6730, point: 5870 };
const LOOPS = new Set(['idle', 'talking', 'thinking']);

// What he does in each part of the home page. gesture plays once on arrival; rest is the state
// he settles into while that section is in view.
const HOME = {
  home: { gesture: 'wave' }, record: { gesture: 'nod' }, work: { gesture: 'point' },
  ventures: { gesture: 'talking' }, recognition: { gesture: 'celebrate' },
  proof: { gesture: 'thinking', rest: 'thinking' }, about: { gesture: 'nod' },
  journey: { gesture: 'celebrate' }, testimony: { gesture: 'nod' },
  lab: { gesture: 'thinking', rest: 'thinking' }, contact: { gesture: 'point' }
};
// Other pages get one arrival gesture and a resting state.
const PAGES = [
  [/^\/studies\//, 'thinking', 'thinking'], [/^\/lab\//, 'thinking', 'thinking'],
  [/^\/contact\//, 'point', 'idle'], [/^\/work\//, 'point', 'idle'], [/^\/projects\//, 'point', 'idle'],
  [/^\/journey\//, 'celebrate', 'idle'], [/^\/(writing|journal|bangla)\//, 'nod', 'idle'],
  [/^\/about\//, 'wave', 'idle'], [/.*/, 'wave', 'idle']
];

const reduced = () => { try { if (localStorage.getItem('jesun.rm') === '1') return true; } catch (e) { /* blocked */ } return !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches); };
const ss = { get(k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } }, set(k, v) { try { sessionStorage.setItem(k, v); } catch (e) { /* blocked */ } } };

// WebKit reports VP9 as playable but draws its alpha channel as black, so it is ruled out by
// engine, not by canPlayType.
function videoAlpha() {
  const ua = navigator.userAgent || '';
  const webkit = /AppleWebKit/.test(ua) && !/Chrome|Chromium|Edg\/|Firefox|OPR\//.test(ua);
  const ios = /iPhone|iPad|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  if (webkit || ios) return false;
  const v = document.createElement('video');
  return !!(v.canPlayType && v.canPlayType('video/webm; codecs="vp9"'));
}

export function initCompanion() {
  if (window.__companion || ss.get('jesun.companion') === 'off') return;
  if (matchMedia('print').matches) return;
  window.__companion = true;

  const still = reduced();
  const useVideo = !still && videoAlpha();
  const isHome = location.pathname === '/' || location.pathname === '/index.html';

  const root = document.createElement('div');
  root.className = 'jx';
  root.setAttribute('aria-hidden', 'true');
  root.innerHTML = '<div class="jx-pad"><i></i><i></i><i></i></div><div class="jx-body"><div class="jx-hit"></div><span class="jx-scan"></span></div>';
  const body = root.querySelector('.jx-body');
  const pad = root.querySelector('.jx-pad');
  const hide = document.createElement('button');
  hide.type = 'button'; hide.className = 'jx-hide'; hide.setAttribute('aria-label', 'Hide the 3D avatar for this visit');
  hide.innerHTML = '<svg viewBox="0 0 12 12" aria-hidden="true"><path d="M2 2l8 8M10 2L2 10"/></svg>';
  document.body.append(root, hide);

  /* ---- state layers ---- */
  let current = null, front = null, revertT = 0, lastChange = performance.now(), busyCortex = false;
  let rest = 'idle';
  const media = s => {
    let el;
    if (useVideo) {
      el = document.createElement('video');
      el.muted = true; el.defaultMuted = true; el.playsInline = true; el.loop = true; el.autoplay = true;
      el.setAttribute('muted', ''); el.setAttribute('playsinline', ''); el.preload = 'auto';
      el.poster = BASE + s + '-still.webp';
      el.src = BASE + s + '.webm';
    } else {
      el = document.createElement('img');
      el.alt = ''; el.decoding = 'async'; el.draggable = false;
      el.src = BASE + s + (still ? '-still.webp' : '.webp');
    }
    el.className = 'jx-layer' + (s === 'point' ? ' jx-mirror' : '');
    return el;
  };
  function show(s) {
    if (s === current) return;
    current = s; lastChange = performance.now(); root.dataset.state = s;
    const el = media(s);
    body.insertBefore(el, body.querySelector('.jx-hit'));
    const old = front; front = el;
    let done = false;
    const swap = () => {
      if (done || front !== el) return; done = true;
      el.classList.add('on');
      if (old) { old.classList.remove('on'); setTimeout(() => old.remove(), 420); }
    };
    if (useVideo) { el.addEventListener('playing', swap, { once: true }); el.addEventListener('loadeddata', swap, { once: true }); const p = el.play && el.play(); if (p && p.catch) p.catch(() => swap()); }
    else if (el.complete) swap(); else el.addEventListener('load', swap, { once: true });
    setTimeout(swap, 1600);     // the poster is showing either way, so never wait forever
  }
  // Play a gesture once, then settle back into the resting state.
  // Below 1200px wide there is no spare margin: anywhere he stands, he stands on text. So there he makes
  // cameos: in for the gesture, out again when it ends, instead of waiting over the paragraph.
  const cameo = () => innerWidth < 1200;
  function gesture(s, hold) {
    clearTimeout(revertT); revertT = 0;
    root.classList.remove('jx-off');
    show(s);
    if (LOOPS.has(s) && s === rest && !cameo()) return;
    revertT = setTimeout(() => {
      revertT = 0; if (busyCortex) return;
      if (cameo()) root.classList.add('jx-off'); else show(rest);
    }, hold || LEN[s] || 6000);
  }
  function setRest(s) { rest = s; if (!revertT || current === rest) show(rest); }

  /* ---- arrival ---- */
  function arrive() {
    root.classList.add('jx-in');
    // On the home page the hero already has his real portrait, so the companion waits off stage
    // until the hero scrolls away, then greets the reader on the way in.
    if (isHome) { if (!heroIn) greet(); return; }
    const m = PAGES.find(([re]) => re.test(location.pathname));
    rest = m[2];
    gesture(m[1]);
  }

  /* ---- sections on the home page ---- */
  let heroIn = isHome, greeted = 0;
  function greet() { if (greeted) return; greeted = performance.now(); gesture('wave'); }
  if (isHome) {
    const hero = document.getElementById('home');
    if (hero) {
      root.classList.add('jx-hero');
      new IntersectionObserver(([e]) => {
        heroIn = e.intersectionRatio > .25;
        root.classList.toggle('jx-hero', heroIn);
        if (!heroIn && root.classList.contains('jx-in') && !busyCortex) greet();
      }, { threshold: [0, .25, .5] }).observe(hero);
    } else heroIn = false;
    const seen = new Set();
    const els = Object.keys(HOME).map(id => document.getElementById(id)).filter(Boolean);
    const io = new IntersectionObserver(es => {
      for (const e of es) {
        if (!e.isIntersecting || busyCortex || !root.classList.contains('jx-in')) continue;
        const cfg = HOME[e.target.id]; if (!cfg) continue;
        rest = cfg.rest || 'idle';
        if (e.target.id === 'home') continue;
        // the greeting wave gets to finish before the first section gesture takes over
        if (!seen.has(e.target.id) && performance.now() - greeted > 3200) { seen.add(e.target.id); gesture(cfg.gesture); }
        else if (!revertT || current !== cfg.gesture) setRest(rest);
      }
    }, { rootMargin: '-45% 0px -45% 0px' });   // a section counts when it crosses the middle
    els.forEach(el => io.observe(el));
  } else {
    // anywhere else, reaching the end of the page earns a goodbye wave
    let waved = false;
    addEventListener('scroll', () => {
      if (waved || busyCortex) return;
      if (innerHeight + scrollY >= document.documentElement.scrollHeight - 40) { waved = true; gesture('wave'); }
    }, { passive: true });
  }

  /* ---- Cortex is his voice ---- */
  addEventListener('cortex:state', e => {
    const s = e.detail;
    if (s === 'open') { busyCortex = true; root.classList.add('jx-away'); hide.hidden = true; return; }
    if (s === 'close') { busyCortex = false; root.classList.remove('jx-away'); hide.hidden = false; gesture('nod'); return; }
    if (s === 'think') { busyCortex = true; clearTimeout(revertT); show('thinking'); return; }
    if (s === 'speak') { busyCortex = true; clearTimeout(revertT); show('talking'); return; }
    if (s === 'idle') { busyCortex = false; gesture('nod', 3200); }
  });

  /* ---- touch and click ---- */
  const hit = root.querySelector('.jx-hit');
  let lastWave = 0;
  hit.addEventListener('pointerenter', () => {
    const now = performance.now();
    if (busyCortex || now - lastWave < 9000) return;
    lastWave = now; gesture('wave');
  });
  // He is Cortex's body, so touching him opens Cortex. Keyboard users have the orb itself.
  hit.addEventListener('click', () => { const orb = document.querySelector('.cx-orb'); if (orb) orb.click(); });
  hide.addEventListener('click', () => { ss.set('jesun.companion', 'off'); root.classList.add('jx-away'); hide.remove(); setTimeout(() => root.remove(), 500); });

  /* ---- a life of his own ---- */
  if (!still) {
    setInterval(() => {
      if (document.hidden || busyCortex || !root.classList.contains('jx-in') || heroIn || cameo()) return;
      if (performance.now() - lastChange < 16000 || current !== rest) return;
      const pick = ['nod', 'thinking', 'nod', 'wave'][Math.floor(Math.random() * 4)];
      gesture(pick, pick === 'thinking' ? 4200 : undefined);
    }, 5000);
  }

  /* ---- space: turn toward the pointer, lean with the scroll, float ---- */
  if (!still) {
    let px = innerWidth / 2, py = innerHeight / 2, ry = 0, rx = 0, lean = 0, dy = 0, lastY = scrollY, vel = 0, raf = 0, last = 0;
    let quiet = 0;
    addEventListener('pointermove', e => { px = e.clientX; py = e.clientY; }, { passive: true });
    addEventListener('scroll', () => {
      vel += scrollY - lastY; lastY = scrollY;
      // on a phone he steps out of the way while you read, and back when you stop
      if (innerWidth < 760) { root.classList.add('jx-shy'); clearTimeout(quiet); quiet = setTimeout(() => root.classList.remove('jx-shy'), 900); }
    }, { passive: true });
    const tick = now => {
      raf = requestAnimationFrame(tick);
      if (now - last < 30) return;                      // about 33 fps is plenty for this
      last = now;
      const b = root.getBoundingClientRect();
      const cx = b.left + b.width / 2, cy = b.top + b.height * .3;
      const tY = Math.max(-1, Math.min(1, (px - cx) / (innerWidth * .5))) * 16;
      const tX = Math.max(-1, Math.min(1, (py - cy) / (innerHeight * .6))) * -5;
      ry += (tY - ry) * .08; rx += (tX - rx) * .08;
      vel *= .82;
      const tl = Math.max(-5, Math.min(5, vel * .12));
      lean += (tl - lean) * .14;
      const fl = Math.sin(now / 1350) * 5;
      dy += ((Math.max(-12, Math.min(12, vel * .35))) - dy) * .12;
      body.style.transform = `translate3d(0,${(fl + dy).toFixed(2)}px,0) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) rotateZ(${lean.toFixed(2)}deg)`;
      pad.style.transform = `translateX(-50%) scale(${(1 - fl * .012).toFixed(3)})`;
      pad.style.opacity = (.85 - fl * .02).toFixed(3);
    };
    const run = () => { cancelAnimationFrame(raf); raf = 0; if (!document.hidden) raf = requestAnimationFrame(tick); };
    document.addEventListener('visibilitychange', () => {
      run();
      if (useVideo && front && front.play) { if (document.hidden) front.pause(); else { const p = front.play(); if (p && p.catch) p.catch(() => {}); } }
    });
    run();
  }

  /* ---- when to appear ---- */
  // On the home page he waits for the build tour to sign off, so he never walks into the boot.
  // The tour can also be replayed later, and he steps aside for that too.
  let bootSeen = false; try { bootSeen = localStorage.getItem('jesun.boot') === '1'; } catch (e) { bootSeen = true; }
  addEventListener('swarm:start', () => root.classList.add('jx-away'));
  addEventListener('swarm:done', () => {
    root.classList.remove('jx-away');
    if (!root.classList.contains('jx-in')) setTimeout(arrive, 500); else gesture('celebrate');
  });
  if (isHome && !bootSeen && !still) setTimeout(() => { if (!root.classList.contains('jx-in')) arrive(); }, 40000);  // failsafe
  else setTimeout(arrive, isHome ? 900 : 700);
}
