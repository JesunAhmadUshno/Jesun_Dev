// Home: matrix boot, network layer, agent swarm build with a live activity feed.
// Copyright Jesun Ahmad Ushno. All rights reserved.
import { $, $$, reduced, clamp, rand, store, tween, wait, ease, timeline, toast, copyText, ROOT } from './core.js';
import { initPalette, openPalette } from './palette.js';
import { runEgg } from './eggs.js';
import { network, wordCycle, fitGiant, labViz, cardArt, hudCursor, sectionRail, decodeHeadings, consoleAndDock } from './scifi.js';
import './studies.js';
import { waveMini } from './labmini.js';
import { sectionMotion, pauseOffscreen } from './motion.js';
import { initCortex } from './cortex.js';

const H = document.documentElement;
H.classList.add('js');
const AP = $('.ap');
const SEATS = (AP.dataset.seats || 'Atlas|Forge|Nova').split('|');
const COLORS = ['#FF4655', '#4D7CFE', '#2BD9A0', '#FFC24B', '#B57BFF', '#FF8A3D', '#3DD6F5', '#F25FB6', '#9BE15D', '#FF7A7A', '#7C93FF', '#F7E15A'];

/* ---------------- Page behaviour ---------------- */
initPalette();
$$('[data-palette]').forEach(b => b.addEventListener('click', openPalette));
const header = $('#header');
const onScroll = () => header.classList.toggle('scrolled', scrollY > 40);
addEventListener('scroll', onScroll, { passive: true }); onScroll();

const cards = $$('#workGrid .card'); let cat = 'all', q = '';
function applyFilter() {
  let n = 0;
  for (const c of cards) { const ok = (cat === 'all' || c.dataset.cat === cat) && c.dataset.title.includes(q); c.hidden = !ok; if (ok) n++; }
  $('#workEmpty').hidden = n > 0;
}
$$('.chip').forEach(ch => ch.addEventListener('click', () => { $$('.chip').forEach(o => o.setAttribute('aria-pressed', String(o === ch))); cat = ch.dataset.cat; applyFilter(); }));
$('#workSearch').addEventListener('input', e => { q = e.target.value.trim().toLowerCase(); applyFilter(); });
const strip = $('#strip');
$('#stripPrev').addEventListener('click', () => strip.scrollBy({ left: -strip.clientWidth * .7, behavior: 'smooth' }));
$('#stripNext').addEventListener('click', () => strip.scrollBy({ left: strip.clientWidth * .7, behavior: 'smooth' }));

const ba = $('#ba'), handle = $('#baHandle');
function setPos(p) { p = clamp(p, 0, 100); ba.style.setProperty('--pos', p + '%'); handle.setAttribute('aria-valuenow', String(Math.round(p))); handle.setAttribute('aria-valuetext', `${Math.round(100 - p)} percent rebuilt site shown`); ba._pos = p; }
setPos(55);
let dragging = false;
const posFrom = e => { const r = ba.getBoundingClientRect(); setPos((e.clientX - r.left) / r.width * 100); };
ba.addEventListener('pointerdown', e => { dragging = true; try { ba.setPointerCapture(e.pointerId); } catch (x) { /* ignore */ } posFrom(e); });
ba.addEventListener('pointermove', e => dragging && posFrom(e));
ba.addEventListener('pointerup', () => { dragging = false; });
handle.addEventListener('keydown', e => { const k = { ArrowLeft: -5, ArrowRight: 5, Home: -100, End: 100 }[e.key]; if (k !== undefined) { setPos(ba._pos + k); e.preventDefault(); } });
// Proof is the page's peak: while it is pinned, scrolling wipes the old site into the rebuild.
// Only on visits with section motion (html.mx). Dragging or keys hand control back to the visitor.
{
  const proof = $('#proof'), cap = $('#proof .cap'), capText = cap ? cap.textContent : '', layers = $$('[data-layer]').length;
  let manual = false, raf = 0;
  const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
  const scrub = () => {
    raf = 0; if (!H.classList.contains('mx') || manual || !proof) return;
    const r = proof.getBoundingClientRect(); if (r.bottom < 0 || r.top > innerHeight) return;
    const k = smooth(.1, .8, clamp(-r.top / Math.max(1, r.height - innerHeight), 0, 1));
    setPos(100 - 100 * k);
    if (cap) cap.textContent = k > .01 && k < .99 ? `REBUILD ${Math.round(k * 100)}% / LAYERS ${Math.round(k * layers)} OF ${layers}` : capText;
  };
  addEventListener('scroll', () => { if (!raf) raf = requestAnimationFrame(scrub); }, { passive: true });
  ba.addEventListener('pointerdown', () => { manual = true; });
  handle.addEventListener('keydown', () => { manual = true; });
  if (proof && 'IntersectionObserver' in window) new IntersectionObserver(es => { if (!es[0].isIntersecting) manual = false; }).observe(proof);
}

$$('[data-copy]').forEach(b => b.addEventListener('click', async () => { const ok = await copyText(b.dataset.copy); b.textContent = ok ? 'Copied' : 'Select it'; setTimeout(() => { b.textContent = 'Copy'; }, 1600); }));

/* Contact: own API first (D1 store), then the FormSubmit route, then plain email. */
const form = $('#brief');
form.addEventListener('submit', async e => {
  e.preventDefault();
  const st = $('#brief-status'), fd = new FormData(form), data = Object.fromEntries(fd.entries());
  if (data._honey) return;
  const bad = []; if (!data.name) bad.push('name'); if (!/^\S+@\S+\.\S+$/.test(data.email || '')) bad.push('email'); if ((data.message || '').trim().length < 10) bad.push('message');
  if (bad.length) { bad.forEach(n => form.elements[n].setAttribute('aria-invalid', 'true')); form.elements[bad[0]].focus(); st.textContent = 'Check the ' + bad.join(', ') + (bad.length > 1 ? ' fields.' : ' field.') + ' The brief needs at least one full sentence.'; return; }
  st.textContent = 'Sending the brief...';
  const post = (u, body) => fetch(u, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(body) }).then(async r => { if (r.status >= 400 && r.status < 500 && r.status !== 404 && r.status !== 405) { const j = await r.json().catch(() => ({})); const er = new Error(j.error || 'Check the form.'); er.user = true; throw er; } if (!r.ok) throw new Error(r.status); return r; });
  try { await post(ROOT + 'api/contact', data); }
  catch (x) { if (x.user) { st.textContent = x.message; return; } try { await post(form.dataset.fallback, { ...data, _subject: 'Brief: ' + data.type + ' from ' + data.name }); } catch (y) { st.textContent = 'Could not send from here. Email ' + 'jesunahmadushno@gmail.com' + ' instead.'; return; } }
  form.reset(); st.textContent = 'Brief received. Jesun reads every one himself.';
});

const clk = $('[data-clock]');
const fmt = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Toronto', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
const tickClock = () => { clk.textContent = fmt.format(new Date()); }; tickClock(); setInterval(tickClock, 1000);

// Privacy-safe view counter from the API; silent when offline.
fetch(ROOT + 'api/hits', { method: 'POST' }).then(r => r.ok ? r.json() : null).then(j => { if (j && j.total) $('[data-hits]').textContent = '/ ' + j.total.toLocaleString('en-US') + ' VISITS'; }).catch(() => {});
// Live GitHub stat from the API cache; keeps the built number when offline.
fetch(ROOT + 'api/stats').then(r => r.ok ? r.json() : null).then(j => {
  if (!j || !j.public_repos) return;
  const el = $('[data-layer="stat.repos"]'); if (!el) return;
  el.dataset.count = j.public_repos; el.dataset.final = String(j.public_repos);
  if (!S.on) $('[data-v]', el).textContent = String(j.public_repos);
}).catch(() => {});

$$('[data-replay]').forEach(b => b.addEventListener('click', () => start()));
$$('[data-grid-toggle]').forEach(b => b.addEventListener('click', () => runEgg('grid')));
// Visible motion switch: the same effect as the system "reduce motion" setting, remembered per browser.
$$('[data-motion-toggle]').forEach(b => {
  b.setAttribute('aria-pressed', String(store.get('jesun.rm') === '1'));
  b.textContent = store.get('jesun.rm') === '1' ? 'Allow motion' : 'Reduce motion';
  b.addEventListener('click', () => { store.set('jesun.rm', store.get('jesun.rm') === '1' ? '0' : '1'); location.reload(); });
});
// Header: menu on small screens, current section highlighted, anchor jumps clear the header.
const menuBtn = $('.menu-btn'), navEl = $('#home-nav');
if (menuBtn && navEl) menuBtn.addEventListener('click', () => { const o = navEl.classList.toggle('open'); menuBtn.setAttribute('aria-expanded', String(o)); });
$$('#home-nav a').forEach(a => a.addEventListener('click', () => { navEl.classList.remove('open'); menuBtn && menuBtn.setAttribute('aria-expanded', 'false'); }));
(function scrollspy() {
  const links = $$('#home-nav a[href^="#"]'), map = links.map(a => [a, document.getElementById(a.getAttribute('href').slice(1))]).filter(x => x[1]);
  // Light a link only while its own section is under the reading line; sections without a link light nothing.
  const secs = $$('section[id]'); let tops = [], raf = 0;
  const measure = () => { tops = secs.map(el => [el.id, el.offsetTop, el.offsetTop + el.offsetHeight]); };
  const up = () => { raf = 0; const y = scrollY + innerHeight * .35; const cur = (tops.find(([, t, b]) => y >= t && y < b) || [])[0]; links.forEach(a => a.classList.toggle('on', a.getAttribute('href') === '#' + cur)); };
  measure(); addEventListener('resize', measure); addEventListener('load', measure); setInterval(measure, 4000);
  addEventListener('scroll', () => { if (!raf) raf = requestAnimationFrame(up); }, { passive: true }); up();
})();
// Form: mark the field that needs attention.
form.addEventListener('input', e => e.target.removeAttribute('aria-invalid'));
if (store.get('jesun.grid') === '1') H.classList.add('grid-on');
const KON = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a']; let kp = 0;
addEventListener('keydown', e => { if (S.on || /INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return; kp = e.key === KON[kp] ? kp + 1 : (e.key === KON[0] ? 1 : 0); if (kp === KON.length) { kp = 0; runEgg('konami'); glitchAll(); } });

/* Deterrents, labelled as such: no context menu or drag on the portrait. */
$$('.protect').forEach(el => { el.addEventListener('contextmenu', e => e.preventDefault()); el.addEventListener('dragstart', e => e.preventDefault()); });

/* Glitch: headings slice and split now and then, on hover, and at the boot cut. */
function glitch(el, ms = 900) { if (reduced() || !el) return; el.classList.add('glitching'); setTimeout(() => el.classList.remove('glitching'), ms); }
function glitchAll() { $$('.glitch').forEach((el, i) => setTimeout(() => glitch(el), i * 60)); }
$$('.h2.glitch').forEach(el => el.addEventListener('pointerenter', () => glitch(el, 850)));
$('.name.glitch').addEventListener('pointerenter', e => glitch(e.currentTarget, 850));

/* Count-ups and parallax when no build runs. */
function countIn(el) {
  if (el.dataset.counted) return; el.dataset.counted = '1';
  const t = $('[data-v]', el) || el, to = parseFloat(el.dataset.count), dec = +(el.dataset.decimals || 0), suf = el.dataset.suffix || '';
  if (reduced()) return;
  tween(1300, k => { t.textContent = (dec ? (to * k).toFixed(dec) : Math.round(to * k)) + suf; }, ease.out).then(() => { t.textContent = el.dataset.final || t.textContent; });
}
let normalDone = false;
function normalMode() {
  if (normalDone) return; normalDone = true;
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { io.unobserve(e.target); countIn(e.target); } }));
    $$('[data-count]').forEach(el => { if (!el.dataset.final) el.dataset.final = ($('[data-v]', el) || el).textContent; io.observe(el); });
  }
  const gw = $('#giantWrap');
  // The CSS centres the word with transform: translateX(-50%). Writing transform here would wipe
  // that and throw the word half its width to the right on the first scroll, so the parallax
  // uses the separate translate property, which stacks on top of the centring.
  if (!reduced()) addEventListener('scroll', () => { gw.style.translate = '0 ' + Math.min(scrollY * .15, 160).toFixed(1) + 'px'; }, { passive: true });
}

/* ---------------- Sci-fi layer ---------------- */
const NET = network();
[fitGiant, wordCycle, labViz, waveMini, sectionMotion, pauseOffscreen, initCortex, cardArt, hudCursor, sectionRail, decodeHeadings].forEach(f => { try { f(); } catch (e) { console.error(e); } }); consoleAndDock(NET);
// Jesun's full body avatar, Cortex's body. A separate chunk, fetched after first paint.
import('./companion.js').then(m => m.initCompanion()).catch(() => {});

/* ---------------- Build record (written by the build, never typed in) ---------------- */
let BR = null;
const brReady = fetch(ROOT + 'build.json').then(r => r.ok ? r.json() : null).then(j => { BR = j; window.__BR = j; return j; }).catch(() => null);
const val = v => (v === undefined || v === null ? 'unrecorded' : v);

/* ---------------- Matrix boot ---------------- */
function matrixBoot(myToken) {
  const boot = $('#boot'), cv = $('#matrix'), box = $('#boot-box');
  boot.hidden = false; boot.classList.remove('out', 'glitch-out');
  const ctx = cv.getContext('2d'), d = Math.min(2, devicePixelRatio || 1);
  cv.width = innerWidth * d; cv.height = innerHeight * d; ctx.setTransform(d, 0, 0, d, 0, 0);
  const fs = 16, cols = Math.ceil(innerWidth / fs), drops = Array.from({ length: cols }, () => Math.random() * -40);
  const glyphs = 'アイウエオカキクケコサシスセソタチツテトナニヌネノ0123456789JESUNUSHNO<>/{}=+*';
  let raf = 0, glitchT = 0;
  const rain = () => {
    ctx.fillStyle = 'rgba(2,3,4,.14)'; ctx.fillRect(0, 0, innerWidth, innerHeight);
    ctx.font = `${fs}px "IBM Plex Mono", monospace`;
    for (let i = 0; i < cols; i++) {
      const y = drops[i] * fs, ch = glyphs[(Math.random() * glyphs.length) | 0];
      ctx.fillStyle = Math.random() < .06 ? '#FFFFFF' : Math.random() < .5 ? '#FF4655' : '#B3202C';
      ctx.fillText(ch, i * fs, y);
      if (y > innerHeight && Math.random() > .975) drops[i] = 0;
      drops[i] += .9 + (i % 3) * .2;
    }
    if (++glitchT % 38 === 0) { // horizontal glitch slice
      const sy = Math.random() * innerHeight, sh = 8 + Math.random() * 40;
      ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.drawImage(cv, 0, sy * d, cv.width, sh * d, (Math.random() - .5) * 60 * d, sy * d, cv.width, sh * d); ctx.restore();
    }
    raf = requestAnimationFrame(rain);
  };
  raf = requestAnimationFrame(rain);
  const nLayers = document.querySelectorAll('[data-layer]').length;
  const lines = [
    ['> jesun --boot --build ' + (window.__FP || 'dev'), ''],
    ['registry: ' + nLayers + ' layers queued', 'OK'],
    ['fleet: ' + (BR ? BR.seats : SEATS.length + 1) + ' seats, foreman online', 'OK'],
    ['lint: ' + (BR && BR.lint ? BR.lint.errors + ' errors, ' + BR.lint.links + ' links checked' : 'unrecorded'), BR && BR.lint && !BR.lint.errors ? 'PASSED' : 'CHECK'],
    ['tests: ' + (BR && BR.tests ? BR.tests.passed + ' passed, ' + BR.tests.failed + ' failed' : 'unrecorded'), BR && BR.tests && !BR.tests.failed ? 'PASSED' : 'CHECK'],
    ['index: ' + val(BR && BR.passages) + ' passages of record', 'OK'],
    ['handing over to the foreman', '...']
  ];
  box.innerHTML = '';
  const bar = document.createElement('div'); bar.className = 'boot-bar'; bar.innerHTML = '<i></i>';
  const done = (async () => {
    for (let i = 0; i < lines.length; i++) {
      if (myToken !== S.token) return;
      const ln = document.createElement('div'); ln.className = 'ln'; box.appendChild(ln);
      const [t, ok] = lines[i];
      for (let k = 0; k <= t.length; k += 2) { ln.textContent = t.slice(0, k); await new Promise(r => setTimeout(r, 12)); } ln.textContent = t;
      if (ok) { await new Promise(r => setTimeout(r, 110)); const s = document.createElement('span'); s.className = ok === '...' ? 'tag' : 'ok'; s.textContent = '  ' + ok; ln.appendChild(s); }
      if (i === 0) box.appendChild(bar);
      bar.firstChild.style.width = ((i + 1) / lines.length * 100) + '%';
      box.appendChild(bar);
    }
    await new Promise(r => setTimeout(r, 380));
  })();
  return {
    done,
    async close() {
      boot.classList.add('glitch-out'); document.body.classList.add('screen-glitch');
      await new Promise(r => setTimeout(r, 560));
      cancelAnimationFrame(raf); boot.hidden = true; document.body.classList.remove('screen-glitch');
    },
    kill() { cancelAnimationFrame(raf); boot.hidden = true; }
  };
}

/* ---------------- Agent patrol: after the build, a seat visits a number and shows its source ---------------- */
let patrol = null, patrolScroll = 0;
addEventListener('scroll', () => { patrolScroll = performance.now(); }, { passive: true });
function stopPatrol() { if (patrol) { clearTimeout(patrol.t); patrol.el && patrol.el.remove(); patrol.chip && patrol.chip.remove(); patrol = null; } }
function startPatrol() {
  if (reduced() || innerWidth < 900 || patrol || !matchMedia('(hover:hover)').matches) return;
  patrol = { t: 0, el: null, chip: null, lastScroll: 0 };
  const tick = async () => {
    if (!patrol) return;
    patrol.t = setTimeout(tick, 9000 + Math.random() * 5000);
    if (S.on || document.hidden || performance.now() - patrolScroll < 2500) return;
    const targets = $$('.rail .stat, .receipts li:not(.bld)').filter(e => { const r = e.getBoundingClientRect(); return r.top > 80 && r.bottom < innerHeight - 80 && r.width; });
    if (!targets.length) return;
    const el = targets[(Math.random() * targets.length) | 0], i = (Math.random() * SEATS.length) | 0, c = COLORS[i % COLORS.length];
    const a = document.createElement('div'); a.className = 'agent patrol'; a.style.color = c;
    a.innerHTML = `<svg viewBox="0 0 18 18" width="18" height="18"><path d="M2 1.5L15.5 9 9.2 10.4 6.4 16.3Z" fill="${c}" stroke="#05060A" stroke-width="1.2" stroke-linejoin="round"/></svg><span class="flag" style="background:${c}"></span>`;
    a.lastChild.textContent = SEATS[i]; document.body.appendChild(a); patrol.el = a;
    const p = { x: innerWidth + 30, y: innerHeight * .5 }, set = () => { a.style.transform = `translate(${p.x}px,${p.y}px)`; };
    const go = (tx, ty, ms) => { const sx = p.x, sy = p.y; return tween(ms, k => { p.x = sx + (tx() - sx) * k; p.y = sy + (ty() - sy) * k; set(); }); };
    const r0 = () => el.getBoundingClientRect();
    await go(() => r0().left - 10, () => r0().top + 6, 900);
    const src = (el.querySelector('.src, small') || {}).textContent || '';
    const chip = document.createElement('div'); chip.className = 'patrol-chip'; chip.setAttribute('role', 'status');
    chip.textContent = `${SEATS[i]} verified: ${src.replace(/^Source:\s*/, 'source ') || 'on record'}`;
    document.body.appendChild(chip); patrol.chip = chip;
    const r = r0(); chip.style.left = Math.max(12, Math.min(innerWidth - 340, r.left - 330)) + 'px'; chip.style.top = (r.top) + 'px';
    await new Promise(res => setTimeout(res, 3200));
    chip.remove(); if (!patrol) return; patrol.chip = null;
    await go(() => innerWidth + 40, () => p.y - 60, 800); a.remove(); if (patrol) patrol.el = null;
  };
  patrol.t = setTimeout(tick, 2500);
}

/* ---------------- Activity feed ---------------- */
const VERB = { drag: ['Created a file', 'C'], place: ['Created a file', 'C'], type: ['Edited a file', 'E'], count: ['Ran a command', '>'], slide: ['Used artifacts', 'A'] };
const tally = { files: 0, edits: 0, cmds: 0, arts: 0 };
function fileFor(L) {
  const n = L.name;
  if (L.type === 'count') return 'count --to ' + (L.el.dataset.count || '') + ' ' + n.split('.').pop();
  if (L.type === 'slide') return 'before-old-site.webp, after-rebuild.webp';
  if (n.startsWith('hero.portrait')) return 'portrait-cutout-820.webp';
  return n.replace(/\./g, '/') + '.html';
}
function feed(agent, L) {
  const [verb, ic] = VERB[L.type] || VERB.place;
  if (ic === 'C') tally.files++; else if (ic === 'E') tally.edits++; else if (ic === '>') tally.cmds++; else tally.arts++;
  const li = document.createElement('li');
  li.innerHTML = `<i style="background:${agent.c}">${ic}</i><span><b></b> <em></em><br><code></code></span>`;
  li.querySelector('b').textContent = agent.name; li.querySelector('em').textContent = verb.toLowerCase(); li.querySelector('code').textContent = fileFor(L);
  const list = $('#feed-list'); list.appendChild(li); while (list.children.length > 7) list.firstChild.remove();
  $('#feed-sum').textContent = `Created ${tally.files} files, edited ${tally.edits}, ran ${tally.cmds} commands, used ${tally.arts} artifacts`;
}
function feedNote(text, ic = 'J', color = '#FF4655') {
  const li = document.createElement('li');
  li.innerHTML = `<i style="background:${color}">${ic}</i><span><b></b></span>`; li.querySelector('b').textContent = text;
  const list = $('#feed-list'); list.appendChild(li); while (list.children.length > 7) list.firstChild.remove();
}

/* ---------------- Agent swarm build ---------------- */
const layerEl = $('#agent-layer'), canvas = $('#trail'), selLayer = $('#sel-layer'), hud = $('#hud'), skip = $('#skip'), feedEl = $('#feed');
const tctx = canvas.getContext('2d');
const S = { on: false, token: 0, agents: [], layers: [], sections: [], landed: 0, t0: 0, paused: 0, pAt: 0, rr: 0, raf: 0, originals: new Map(), foreman: null, boot: null };

function collect() {
  S.layers = $$('[data-layer]').map(el => { const s = el.closest('[data-section]'); return { el, name: el.dataset.layer, type: el.dataset.entry || 'place', sec: s ? s.dataset.section : 'Page' }; });
  S.sections = [];
  for (const L of S.layers) {
    let s = S.sections[S.sections.length - 1];
    if (!s || s.id !== L.sec) { s = { id: L.sec, layers: [] }; S.sections.push(s); }
    s.layers.push(L);
    if (L.type === 'type' && !S.originals.has(L.el)) S.originals.set(L.el, L.el.textContent);
    if (L.type === 'count' && !L.el.dataset.final) L.el.dataset.final = ($('[data-v]', L.el) || L.el).textContent;
  }
}
const sizeCanvas = () => { const d = Math.min(2, devicePixelRatio || 1); canvas.width = innerWidth * d; canvas.height = innerHeight * d; tctx.setTransform(d, 0, 0, d, 0, 0); };
function makeAgent(i, x, y) {
  const c = COLORS[i % COLORS.length], name = SEATS[i % SEATS.length];
  const el = document.createElement('div'); el.className = 'agent';
  el.innerHTML = `<svg viewBox="0 0 18 18" width="18" height="18"><path d="M2 1.5L15.5 9 9.2 10.4 6.4 16.3Z" fill="${c}" stroke="#05060A" stroke-width="1.2" stroke-linejoin="round"/></svg><span class="flag" style="background:${c}"></span>`;
  el.lastChild.textContent = name; el.style.color = c; layerEl.appendChild(el);
  return { el, c, name, x, y, busy: false, ph: Math.random() * 6.28, tr: [] };
}
function makeForeman() {
  const el = document.createElement('div'); el.className = 'agent foreman';
  el.innerHTML = `<img src="${ROOT}img/avatar-head-96.webp" alt="" width="42" height="42"><span class="flag">FOREMAN / JESUN</span>`;
  layerEl.appendChild(el);
  return { el, c: '#FF4655', name: 'Foreman', x: innerWidth / 2, y: innerHeight + 60, busy: true, ph: 0, tr: [] };
}
function focusPoint() {
  const els = S.focusEls || []; let x = 0, y = 0, n = 0;
  for (const el of els) { const r = el.getBoundingClientRect(); if (!r.width && !r.height) continue; x += r.left + r.width / 2; y += r.top + r.height / 2; n++; }
  if (!n) return [innerWidth * .5, innerHeight * .45];
  return [clamp(x / n, 60, innerWidth - 60), clamp(y / n, 90, innerHeight - 120)];
}
function loop(now) {
  const s = now / 1000, all = S.foreman ? S.agents.concat([S.foreman]) : S.agents;
  // 1. Ride the page: when the page scrolls (camera, scrollbar, keyboard), idle cursors move with it.
  const dy = S.lastY === undefined ? 0 : scrollY - S.lastY; S.lastY = scrollY;
  if (dy) for (const a of all) if ((!a.busy || a === S.foreman) && !a.flying) { a.y -= dy; for (let k = 1; k < a.tr.length; k += 2) a.tr[k] -= dy; }
  // 2. Steer: idle cursors orbit the elements being built, so the whole fleet follows the work.
  if (!timeline.paused) {
    const [fx, fy] = focusPoint();
    for (const a of all) {
      if (a.busy || a.flying || a.arriving) continue;
      const ang = a.ph + s * (.25 + (a.ph % 1) * .2), rad = 70 + (a.ph * 37) % 150;
      const tx = fx + Math.cos(ang) * rad * 1.6, ty = fy + Math.sin(ang) * rad * .8;
      a.x += (tx - a.x) * .045; a.y += (ty - a.y) * .045;
    }
  }
  // 3. Never lose a cursor off screen.
  for (const a of all) if (!a.flying && !a.arriving) { a.x = clamp(a.x, -30, innerWidth + 30); a.y = clamp(a.y, -30, innerHeight + 30); }
  tctx.clearRect(0, 0, innerWidth, innerHeight);
  // network mesh between nearby agents
  tctx.lineWidth = 1;
  for (let i = 0; i < all.length; i++) for (let j = i + 1; j < all.length; j++) {
    const a = all[i], b = all[j], d = Math.hypot(a.x - b.x, a.y - b.y);
    if (d < 150) { tctx.strokeStyle = `rgba(255,255,255,${(1 - d / 150) * .14})`; tctx.beginPath(); tctx.moveTo(a.x + 3, a.y + 2); tctx.lineTo(b.x + 3, b.y + 2); tctx.stroke(); }
  }
  tctx.lineWidth = 2; tctx.lineCap = 'round';
  for (const a of all) {
    let x = a.x, y = a.y;
    if (!a.busy || a === S.foreman) { x += Math.sin(s * 1.3 + a.ph) * 2.4; y += Math.cos(s * 1.1 + a.ph) * 2.4; }
    a.el.style.transform = `translate(${x}px,${y}px)`;
    a.tr.push(x, y); if (a.tr.length > 20) a.tr.splice(0, 2);
    tctx.strokeStyle = a.c;
    for (let k = 2; k < a.tr.length; k += 2) { tctx.globalAlpha = k / a.tr.length * .45; tctx.beginPath(); tctx.moveTo(a.tr[k - 2] + 3, a.tr[k - 1] + 2); tctx.lineTo(a.tr[k] + 3, a.tr[k + 1] + 2); tctx.stroke(); }
    tctx.globalAlpha = 1;
  }
  S.raf = requestAnimationFrame(loop);
}
// Flight along a curve. The target can be live (a function), so a page scroll mid-flight never leaves
// a cursor aiming at a stale point. The start and the curve ride along with any scroll too.
function fly(a, tx, ty) {
  const target = typeof tx === 'function' ? tx : () => [tx, ty];
  let [ex, ey] = target(); const sx = a.x, sy = a.y, dx = ex - sx, dy = ey - sy, dist = Math.hypot(dx, dy) || 1;
  const off = rand(40, 120) * (Math.random() < .5 ? -1 : 1), cx0 = sx + dx / 2 - dy / dist * off, cy0 = sy + dy / 2 + dx / dist * off;
  const y0 = scrollY; a.flying = true;
  return tween(clamp(dist * .5, 240, 700), k => {
    [ex, ey] = target(); const sh = y0 - scrollY, u = 1 - k;
    a.x = u * u * sx + 2 * u * k * cx0 + k * k * ex;
    a.y = u * u * (sy + sh) + 2 * u * k * (cy0 + sh) + k * k * ey;
  }).then(() => { a.flying = false; });
}
const anchor = (el, fx, fy, ox = 0, oy = 0) => () => { const r = el.getBoundingClientRect(); return [r.left + (typeof fx === 'number' ? fx : fx(r)) + ox, r.top + (typeof fy === 'number' ? fy : fy(r)) + oy]; };
function sel(el, name) {
  const s = document.createElement('div'); s.className = 'sel'; s.innerHTML = '<i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><b></b>';
  selLayer.appendChild(s); const lab = s.lastChild;
  const upd = () => { const r = el.getBoundingClientRect(); s.style.transform = `translate(${r.left - 3}px,${r.top - 3}px)`; s.style.width = (r.width + 6) + 'px'; s.style.height = (r.height + 6) + 'px'; lab.textContent = `${name} ${Math.round(r.width)} x ${Math.round(r.height)}`; };
  upd(); return { upd, remove: () => s.remove() };
}
const elapsed = () => (performance.now() - S.t0 - S.paused) / 1000;
function hudUpdate() {
  $('#hudAgents').textContent = S.agents.length + ' agents';
  $('#hudCount').textContent = S.landed + ' / ' + S.layers.length + ' layers';
  $('#hudFill').style.width = (S.layers.length ? S.landed / S.layers.length * 100 : 0) + '%';
  const dots = $('#hudDots'), want = Math.min(6, S.agents.length);
  if (dots.children.length !== want) { dots.innerHTML = ''; for (let i = 0; i < want; i++) { const d = document.createElement('i'); d.style.background = COLORS[i]; dots.appendChild(d); } }
}
function pick() { for (let k = 0; k < S.agents.length; k++) { const a = S.agents[(S.rr++) % S.agents.length]; if (!a.busy && !a.arriving) return a; } return S.agents[0]; }
function grow(n) {
  while (S.agents.length < n) {
    const side = Math.random() < .5, a = makeAgent(S.agents.length, side ? -24 : innerWidth + 24, rand(.15, .85) * innerHeight);
    S.agents.push(a); a.arriving = true; feedNote(a.name + ' joined the fleet', '+', a.c);
    fly(a, rand(40, innerWidth * .35), rand(.3, .7) * innerHeight).then(() => { a.arriving = false; });
  }
  hudUpdate();
}
function camera(el) {
  const r = el.getBoundingClientRect();
  if (r.top >= 80 && r.top <= innerHeight * .58) return Promise.resolve();
  const max = document.documentElement.scrollHeight - innerHeight, from = scrollY;
  const target = clamp(from + r.top - innerHeight * .2, 0, max);
  if (Math.abs(target - from) < 4) return Promise.resolve();
  return tween(Math.min(900, 480 + Math.abs(target - from) / 3), k => window.scrollTo(0, from + (target - from) * k));
}
async function place(L, a, my) { // a can be replaced mid-task in a chaos drill
  const el = L.el, r = el.getBoundingClientRect();
  if (!r.width && !r.height) { el.classList.add('landed'); S.landed++; hudUpdate(); return; }
  a.busy = true;
  const gxf = q => Math.min(26, q.width * .35), gyf = q => Math.min(16, q.height * .5);
  let dx = 0, dy = 0;
  if (L.type === 'drag') { dx = rand(60, 160) * (Math.random() < .5 ? -1 : 1); dy = rand(30, 90) * (Math.random() < .5 ? -1 : 1); await fly(a, anchor(el, gxf, gyf, dx, dy)); }
  else if (L.type === 'slide') await fly(a, anchor(el, q => q.width * .55, q => q.height / 2));
  else await fly(a, anchor(el, gxf, gyf));
  if (my !== S.token) return;
  if (S.chaos && !a.foreman) { // a seat fails; the foreman reassigns its task
    S.chaos = false; const lost = a;
    lost.el.classList.add('lost'); lost.busy = true; S.failed = (S.failed || 0) + 1;
    S.agents = S.agents.filter(x => x !== lost);
    const b = pick(); b.busy = true;
    feedNote(`${lost.name} lost. Foreman reassigned ${L.name} to ${b.name}.`, '!', '#FF4655');
    setTimeout(() => lost.el.remove(), 1400); hudUpdate();
    a = b;
    if (L.type === 'drag') await fly(a, anchor(el, gxf, gyf, dx, dy)); else await fly(a, anchor(el, gxf, gyf));
    if (my !== S.token) return;
  }
  el.classList.add('landed');
  const sb = sel(el, L.name), d = rand(200, 340);
  feed(a, L);
  if (L.type === 'drag') {
    el.style.transform = `translate(${dx}px,${dy}px)`;
    const home = anchor(el, gxf, gyf);
    await tween(d + 160, k => { const u = 1 - k; el.style.transform = `translate(${dx * u}px,${dy * u}px)`; const [hx, hy] = home(); a.x = hx; a.y = hy; sb.upd(); });
    el.style.transform = '';
    if (el.classList.contains('glitch')) glitch(el, 500);
  } else if (L.type === 'type') {
    const text = S.originals.get(el) || '', node = document.createTextNode(''), car = document.createElement('span'); car.className = 'caret';
    el.textContent = ''; el.appendChild(node); el.appendChild(car); a.el.classList.add('ibeam');
    await tween(clamp(text.length * 9, 380, 1100), k => { node.data = text.slice(0, Math.round(text.length * k)); sb.upd(); const cr = car.getBoundingClientRect(); a.x = cr.left - 4; a.y = cr.top + 2; }, ease.linear);
    el.textContent = text; a.el.classList.remove('ibeam');
  } else if (L.type === 'count') {
    const t = $('[data-v]', el) || el, to = parseFloat(el.dataset.count), dec = +(el.dataset.decimals || 0), suf = el.dataset.suffix || '';
    await tween(700, k => { t.textContent = (dec ? (to * k).toFixed(dec) : Math.round(to * k)) + suf; sb.upd(); }, ease.out);
    t.textContent = el.dataset.final; el.dataset.counted = '1';
  } else if (L.type === 'slide') {
    let p = 15; setPos(p);
    const follow = () => { setPos(p); const rr = el.getBoundingClientRect(); a.x = rr.left + rr.width * p / 100; a.y = rr.top + rr.height / 2; };
    await tween(850, k => { p = 15 + 55 * k; follow(); });
    await tween(450, k => { p = 70 - 15 * k; follow(); }, ease.out);
  } else {
    await tween(d, k => { el.style.opacity = String(k); el.style.transform = `translateY(${8 * (1 - k)}px) scale(${.92 + .08 * k})`; sb.upd(); }, ease.out);
    el.style.opacity = ''; el.style.transform = '';
  }
  if (my !== S.token) return;
  await wait(50);
  sb.remove(); a.busy = false; S.landed++; hudUpdate();
}
function block(e) { if (S.on) e.preventDefault(); }
function onKey(e) {
  if (!S.on || e.key === 'Shift') return;
  if (e.key === 'Tab') { if (!(e.target && e.target.closest && e.target.closest('#hud,#skip'))) { e.preventDefault(); skip.focus(); } return; }
  if (e.target && e.target.closest && e.target.closest('#hud,#skip') && (e.key === 'Enter' || e.key === ' ')) return;
  end(false);
}
function restore() {
  for (const L of S.layers) {
    const el = L.el; el.classList.add('landed'); el.style.opacity = ''; el.style.transform = '';
    if (S.originals.has(el)) el.textContent = S.originals.get(el);
    if (L.type === 'count') { ($('[data-v]', el) || el).textContent = el.dataset.final; el.dataset.counted = '1'; }
  }
  setPos(55);
}
function end(completed, secs) {
  if (!S.on) return;
  S.on = false; S.token++;
  timeline.clear(); if (S.boot) S.boot.kill();
  restore();
  H.classList.remove('tour-armed', 'touring', 'boot-armed');
  cancelAnimationFrame(S.raf);
  S.agents.forEach(a => a.el.remove()); S.agents = [];
  if (S.foreman) { S.foreman.el.remove(); S.foreman = null; }
  selLayer.innerHTML = ''; tctx.clearRect(0, 0, innerWidth, innerHeight);
  layerEl.hidden = true; skip.hidden = true;
  removeEventListener('wheel', block); removeEventListener('touchmove', block); removeEventListener('keydown', onKey);
  store.set('jesun.boot', '1');
  if (completed) {
    hud.classList.add('done');
    $('#hudDoneText').textContent = `Built by ${$('#hudAgents').textContent.split(' ')[0]} agents in ${secs.toFixed(1)}s${S.failed ? `, ${S.failed} seat failure recovered` : ''}. ${S.landed} / ${S.layers.length} layers. Signed by the foreman.`;
    feedEl.classList.add('done'); $('#feed-meta').textContent = 'Build ' + (window.__FP || 'dev') + ' signed';
    setTimeout(() => { if (!S.on) feedEl.hidden = true; }, 6000);
  } else { hud.hidden = true; feedEl.hidden = true; }
  // Focus lands somewhere useful, never on the page body.
  // Focus lands on main content (the HUD fades away, so it must not hold focus), and Cortex takes over.
  setTimeout(() => { if (S.prevFocus && S.prevFocus !== document.body && document.contains(S.prevFocus) && S.prevFocus.offsetParent !== null) S.prevFocus.focus({ preventScroll: true }); else $('#main').focus({ preventScroll: true }); }, 30);
  dispatchEvent(new CustomEvent('swarm:done', { detail: { completed } }));
  normalMode();
  if (completed) { setTimeout(startPatrol, 4000); setTimeout(() => { if (!S.on) { hud.classList.add('fade'); setTimeout(() => { if (!S.on) { hud.hidden = true; hud.classList.remove('fade'); } }, 600); } }, 7000); const cta = $('.hero-left .btn'); if (cta) { cta.classList.add('pulse'); setTimeout(() => cta.classList.remove('pulse'), 2600); } }
}
async function finale(my) {
  const card = $('#reelCard'); await camera(card); if (my !== S.token) return;
  const r = card.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2, R = Math.min(r.width, r.height) * .6, n = S.agents.length;
  S.agents.forEach(a => { a.busy = true; });
  feedNote('All layers placed. Fleet converging.', '*', '#FFC24B');
  await Promise.all(S.agents.map((a, i) => { const g = i / n * 6.283; return fly(a, cx + Math.cos(g) * R * 1.4, cy + Math.sin(g) * R); }));
  if (my !== S.token) return;
  await tween(1600, k => { S.agents.forEach((a, i) => { const g = i / n * 6.283 + k * 12.566, rad = R * (1 - .6 * k); a.x = cx + Math.cos(g) * rad * 1.4; a.y = cy + Math.sin(g) * rad; }); }, ease.sine);
  if (my !== S.token) return;
  const f = S.foreman; await fly(f, cx - 20, cy - 20);
  feedNote('Foreman: build signed. Jesun Ahmad Ushno.', 'J');
  // Ship log: the three most recently updated studies, straight from the public record on the page.
  $$('#studies .stile').filter(t => t.dataset.tu).sort((x, y) => y.dataset.tu.localeCompare(x.dataset.tu)).slice(0, 3).forEach(t => feedNote(`Ship log ${t.dataset.tu}: ${t.querySelector('span').textContent}, ${t.dataset.tv}`, '>', '#3DDC84'));
  await Promise.all(S.agents.map(a => { const g = Math.random() * 6.283; return fly(a, cx + Math.cos(g) * innerWidth, cy + Math.sin(g) * innerHeight); }));
}
async function start() {
  if (S.on || reduced()) return;
  S.on = true; const my = ++S.token; S.userPaused = false; S.focusEls = []; S.lastY = undefined; S.failed = 0; S.chaos = false; stopPatrol();
  collect();
  for (const L of S.layers) { L.el.classList.remove('landed'); L.el.style.opacity = ''; L.el.style.transform = ''; delete L.el.dataset.counted; }
  H.classList.add('tour-armed', 'touring');
  window.scrollTo(0, 0);
  dispatchEvent(new CustomEvent('swarm:start'));
  feedNote('Cortex: fleet dispatched. I take over when the page is signed.', 'C', '#FF4655');
  addEventListener('wheel', block, { passive: false }); addEventListener('touchmove', block, { passive: false }); addEventListener('keydown', onKey);
  skip.hidden = false; S.prevFocus = document.activeElement; setTimeout(() => { if (S.on) skip.focus({ preventScroll: true }); }, 50);
  // 1. Matrix boot (waits up to 400 ms for the build record)
  await Promise.race([brReady, new Promise(r => setTimeout(r, 400))]); if (my !== S.token) return;
  S.boot = matrixBoot(my);
  await S.boot.done; if (my !== S.token) return;
  await S.boot.close(); if (my !== S.token) return;
  glitchAll();
  // 2. Fleet build
  S.landed = 0; S.paused = 0; S.rr = 0; Object.assign(tally, { files: 0, edits: 0, cmds: 0, arts: 0 });
  timeline.clear(); $('#hudSpeed').value = '1'; $('#hudPause').textContent = 'Touring'; $('#hudPause').setAttribute('aria-pressed', 'false');
  layerEl.hidden = false; hud.hidden = false; hud.classList.remove('done'); feedEl.hidden = false; feedEl.classList.remove('done');
  $('#feed-list').innerHTML = ''; $('#feed-meta').textContent = 'Building jesunahmadushno.com'; $('#feed-sum').textContent = 'Starting the fleet...';
  sizeCanvas();
  const mobile = innerWidth < 760, n0 = mobile ? 8 : 18, nMax = mobile ? 8 : 30, conc = mobile ? 3 : 9;
  S.agents = []; for (let i = 0; i < n0; i++) S.agents.push(makeAgent(i, rand(24, 110), innerHeight * rand(.3, .7)));
  S.foreman = makeForeman();
  cancelAnimationFrame(S.raf); S.raf = requestAnimationFrame(loop);
  hudUpdate(); S.t0 = performance.now();
  try {
    feedNote(`Foreman opened build ${window.__FP || 'dev'}. ${S.layers.length} layers queued.`, 'J');
    await fly(S.foreman, innerWidth * .52, innerHeight * .4); await wait(250); S.foreman.busy = false;
    for (let si = 0; si < S.sections.length; si++) {
      if (my !== S.token) return;
      grow(Math.round(n0 + (nMax - n0) * si / Math.max(1, S.sections.length - 1)));
      feedNote('Section: ' + S.sections[si].id, '#', '#9BA0AE');
      const queue = S.sections[si].layers.slice();
      while (queue.length) {
        if (my !== S.token) return;
        await camera(queue[0].el); if (my !== S.token) return;
        const top0 = queue[0].el.getBoundingClientRect().top, batch = [queue.shift()];
        while (queue.length && batch.length < conc && queue[0].el.getBoundingClientRect().top - top0 < innerHeight * .5) batch.push(queue.shift());
        S.foreman.x += (batch[0].el.getBoundingClientRect().right - S.foreman.x) * .25;
        S.focusEls = batch.map(L => L.el);
        await Promise.all(batch.map(L => place(L, pick(), my)));
        if (my !== S.token) return;
        await wait(40);
      }
    }
    const secs = elapsed(); S.foreman.busy = true;
    await finale(my); if (my !== S.token) return;
    end(true, secs);
  } catch (err) { end(false); }
}

$('#hudPause').addEventListener('click', function () {
  if (!S.on) return; const p = !timeline.paused; timeline.pause(p); S.userPaused = p;
  this.textContent = p ? 'Paused' : 'Touring'; this.setAttribute('aria-pressed', String(p));
  if (p) S.pAt = performance.now(); else S.paused += performance.now() - S.pAt;
});
$('#hudSpeed').addEventListener('change', e => timeline.speed(+e.target.value));
$('#hudChaos').addEventListener('click', () => { if (S.on) { S.chaos = true; feedNote('Chaos drill: the next seat to land will fail.', '!', '#FFC24B'); } });
$('#hudClose').addEventListener('click', () => { if (S.on) end(false); else { hud.hidden = true; feedEl.hidden = true; } });
$('#hudReplay').addEventListener('click', () => start());
skip.addEventListener('click', () => end(false));
addEventListener('resize', () => { if (S.on) sizeCanvas(); });
window.__replayBoot = () => start();
window.__chaos = () => { if (!S.on) return false; S.chaos = true; return true; };
document.addEventListener('visibilitychange', () => {
  if (!S.on || S.userPaused) return;
  if (document.hidden) { timeline.pause(true); S.pAt = performance.now(); } else { timeline.pause(false); S.paused += performance.now() - S.pAt; S.lastY = scrollY; }
});

if (H.classList.contains('boot-armed') && !reduced()) {
  H.classList.add('tour-armed');
  const ready = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
  Promise.race([ready, new Promise(r => setTimeout(r, 1800))]).then(() => requestAnimationFrame(start));
} else { H.classList.remove('boot-armed'); normalMode(); }

// Ready only after every setup line above ran. If one throws, arm.js shows the page instead of a blank.
window.__homeReady = true;
// The page reacts when its agent thinks: a shockwave crosses the hero network.
addEventListener('cortex:think', () => { try { if (NET && NET.wave) NET.wave(); } catch (e) { /* not ready */ } });
