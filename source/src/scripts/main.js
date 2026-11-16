// Site runtime for every page. Copyright Jesun Ahmad Ushno. All rights reserved.
import { $, $$, reduced, clamp, countUp, toast, copyText, store, href } from './core.js';
import { openPalette, initPalette } from './palette.js';
import { runEgg } from './eggs.js';

const H = document.documentElement;
H.classList.add('js');

/* Header */
const top = $('.top');
const onScroll = () => top && top.classList.toggle('scrolled', scrollY > 8);
addEventListener('scroll', onScroll, { passive: true }); onScroll();
const menuBtn = $('.menu-btn'), nav = $('.nav');
if (menuBtn && nav) menuBtn.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  menuBtn.setAttribute('aria-expanded', String(open));
});

/* Palette */
initPalette();
$$('[data-palette]').forEach(b => b.addEventListener('click', openPalette));

/* Reveal and count-ups. Content is visible without JS; only below-fold items get the pre state. */
const io = 'IntersectionObserver' in window && !reduced() ? new IntersectionObserver(entries => {
  for (const e of entries) {
    if (!e.isIntersecting) continue;
    const el = e.target; io.unobserve(el);
    el.classList.remove('pre');
    if (el.dataset.count && !el.dataset.counted) runCount(el);
  }
}, { rootMargin: '0px 0px -8% 0px' }) : null;
function runCount(el) {
  el.dataset.counted = '1';
  const target = el.querySelector('[data-v]') || el;
  countUp(target, parseFloat(el.dataset.count), { decimals: +(el.dataset.decimals || 0), suffix: el.dataset.suffix || '' });
}
function armReveals() {
  $$('.reveal').forEach(el => {
    if (!io) return;
    if (el.getBoundingClientRect().top > innerHeight) el.classList.add('pre');
    io.observe(el);
  });
  $$('[data-count]').forEach(el => {
    if (el.closest('[data-layer]') && H.classList.contains('boot-armed')) return;
    if (io) io.observe(el);
  });
}
window.__armReveals = armReveals;
if (!H.classList.contains('boot-armed')) armReveals();

/* Scroll films: one progress value per film, written to a CSS variable */
const films = $$('[data-film]');
if (films.length && !reduced()) {
  let ticking = false;
  const update = () => {
    ticking = false;
    for (const f of films) {
      const r = f.getBoundingClientRect();
      const span = Math.max(1, f.offsetHeight - innerHeight);
      const p = clamp(-r.top / span, 0, 1);
      f.style.setProperty('--p', p.toFixed(4));
      const frames = +(f.dataset.frames || 120);
      const fc = f.querySelector('[data-frame]');
      if (fc) fc.textContent = String(Math.round(p * frames)).padStart(3, '0') + ' / ' + frames;
      const track = f.querySelector('.jtrack');
      if (track) {
        const shift = Math.max(0, track.scrollWidth - innerWidth + 80);
        f.style.setProperty('--shift', shift + 'px');
        $$('[data-count]', track).forEach(el => {
          if (el.dataset.counted) return;
          const b = el.getBoundingClientRect();
          if (b.left < innerWidth * .85 && b.right > 0 && r.top <= 0) runCount(el);
        });
      }
    }
  };
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
  addEventListener('resize', update);
  update();
}

/* Work grid: filters, search, tilt */
const grid = $('[data-grid]');
if (grid) {
  const cards = $$('.card', grid);
  let cat = 'all', q = '';
  const empty = $('[data-empty]');
  const apply = () => {
    let shown = 0;
    for (const c of cards) {
      const ok = (cat === 'all' || c.dataset.cat === cat) && c.dataset.search.includes(q);
      c.hidden = !ok; if (ok) shown++;
    }
    if (empty) empty.hidden = shown > 0;
    const out = $('[data-shown]'); if (out) out.textContent = String(shown);
  };
  $$('[data-cat-btn]').forEach(b => b.addEventListener('click', () => {
    $$('[data-cat-btn]').forEach(o => o.setAttribute('aria-pressed', String(o === b)));
    cat = b.dataset.catBtn; apply();
  }));
  const s = $('[data-search]');
  if (s) s.addEventListener('input', () => { q = s.value.trim().toLowerCase(); apply(); });
  if (!reduced() && matchMedia('(hover:hover)').matches) cards.forEach(c => {
    const inner = $('.card-in', c);
    c.addEventListener('pointermove', e => {
      const r = c.getBoundingClientRect();
      inner.style.setProperty('--rx', (((e.clientX - r.left) / r.width - .5) * 6).toFixed(2) + 'deg');
      inner.style.setProperty('--ry', (((e.clientY - r.top) / r.height - .5) * -6).toFixed(2) + 'deg');
    });
    c.addEventListener('pointerleave', () => { inner.style.setProperty('--rx', '0deg'); inner.style.setProperty('--ry', '0deg'); });
  });
}

/* Before / after sliders */
$$('[data-ba]').forEach(ba => {
  const h = $('.handle', ba);
  const set = p => { p = clamp(p, 0, 100); ba.style.setProperty('--pos', p + '%'); h.setAttribute('aria-valuenow', String(Math.round(p))); ba._pos = p; };
  set(+(ba.dataset.start || 52));
  let drag = false;
  const from = e => { const r = ba.getBoundingClientRect(); set((e.clientX - r.left) / r.width * 100); };
  ba.addEventListener('pointerdown', e => { drag = true; try { ba.setPointerCapture(e.pointerId); } catch (x) { /* ignore */ } from(e); });
  ba.addEventListener('pointermove', e => drag && from(e));
  ba.addEventListener('pointerup', () => { drag = false; });
  ba.addEventListener('pointercancel', () => { drag = false; });
  h.addEventListener('keydown', e => {
    const k = { ArrowLeft: -5, ArrowRight: 5, Home: -100, End: 100 }[e.key];
    if (k !== undefined) { set(ba._pos + k); e.preventDefault(); }
  });
  ba._set = set;
});

/* Copy buttons */
$$('[data-copy]').forEach(b => b.addEventListener('click', async () => {
  const ok = await copyText(b.dataset.copy);
  toast(ok ? 'Copied: ' + b.dataset.copy : 'Copy blocked. Select the text instead.');
}));

/* Contact brief: posts to his existing formsubmit route */
const brief = $('#brief');
if (brief) brief.addEventListener('submit', async e => {
  e.preventDefault();
  const st = $('#brief-status');
  const fd = new FormData(brief);
  if (fd.get('_honey')) return;
  const name = (fd.get('name') || '').toString().trim(), email = (fd.get('email') || '').toString().trim(), msg = (fd.get('message') || '').toString().trim();
  if (!name || !/^\S+@\S+\.\S+$/.test(email) || msg.length < 10) {
    const first = !name ? 'name' : !/^\S+@\S+\.\S+$/.test(email) ? 'email' : 'message'; const el = brief.elements[first]; if (el) { el.setAttribute('aria-invalid', 'true'); el.focus(); }
    st.textContent = 'Add your name, a valid email and at least one full sentence about the mandate.'; return;
  }
  st.textContent = 'Sending the brief...';
  const payload = Object.fromEntries(fd.entries());
  payload._subject = 'Brief: ' + (payload.type || 'mandate') + ' from ' + name;
  try {
    let r = await fetch(href('/api/contact'), { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(payload) }).catch(() => null);
    if (r && r.status >= 400 && r.status < 500 && r.status !== 404 && r.status !== 405) { const j = await r.json().catch(() => ({})); st.textContent = j.error || 'Check the form and try again.'; return; }
    if (!r || !r.ok) r = await fetch(brief.action, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(payload) });
    if (!r.ok) throw new Error('status ' + r.status);
    brief.reset(); st.textContent = 'Brief received. Jesun reads every one himself.';
  } catch (err) {
    st.textContent = 'The form could not send. Email jesunahmadushno@gmail.com instead.';
  }
});

/* Guestbook: reads and writes /api/guestbook; says so plainly when the API is offline. */
const gb = $('[data-guestbook]');
if (gb) {
  const list = $('#gb-list'), st = $('#gb-status');
  const row = n => { const li = document.createElement('li'); li.innerHTML = '<span class="label"></span><span><b></b> <span></span></span>'; li.firstChild.textContent = (n.created_at || '').slice(0, 10); li.querySelector('b').textContent = n.name; li.lastChild.lastChild.textContent = n.note; return li; };
  fetch(href('/api/guestbook')).then(r => r.ok ? r.json() : Promise.reject()).then(j => { list.innerHTML = ''; (j.notes.length ? j.notes : []).forEach(n => list.appendChild(row(n))); if (!j.notes.length) list.innerHTML = '<li><span class="label">Empty</span><span>Be the first to sign.</span></li>'; })
    .catch(() => { list.innerHTML = '<li><span class="label">Offline</span><span>The guestbook API is not running in this preview. On the live site notes appear here.</span></li>'; });
  gb.addEventListener('submit', async e => {
    e.preventDefault(); const data = Object.fromEntries(new FormData(gb).entries());
    if (!data.name || !data.note) { st.textContent = 'Add a name and a short note.'; return; }
    st.textContent = 'Signing...';
    try { const r = await fetch(href('/api/guestbook'), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }); const j = await r.json(); if (!r.ok) throw new Error(j.error); if (j.held) { gb.reset(); st.textContent = 'Signed. Your note appears here once Jesun approves it.'; return; } gb.reset(); st.textContent = 'Signed. Thank you.'; const first = list.querySelector('li'); if (first && /Empty|Offline/.test(first.textContent)) list.innerHTML = ''; list.prepend(row(j.note)); }
    catch (x) { st.textContent = x.message && x.message !== 'Failed to fetch' ? x.message : 'The guestbook API is not reachable from here.'; }
  });
}

/* Reading progress */
const art = $('[data-article]');
if (art) {
  const bar = document.createElement('div'); bar.className = 'progress'; bar.setAttribute('aria-hidden', 'true'); document.body.appendChild(bar);
  const up = () => { const r = art.getBoundingClientRect(); bar.style.setProperty('--read', clamp(-r.top / Math.max(1, r.height - innerHeight), 0, 1).toFixed(3)); };
  addEventListener('scroll', up, { passive: true }); up();
}
$$('[data-share]').forEach(b => b.addEventListener('click', async () => {
  const ok = await copyText(location.href.split('#')[0]);
  toast(ok ? 'Link copied.' : 'Copy blocked. Use the address bar.');
}));

/* Footer: live Toronto time */
const clk = $('[data-clock]');
if (clk) {
  const f = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Toronto', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
  const t = () => { clk.textContent = f.format(new Date()); };
  t(); setInterval(t, 1000);
}
$$('[data-replay]').forEach(b => b.addEventListener('click', () => runEgg('replay')));
$$('[data-grid-toggle]').forEach(b => b.addEventListener('click', () => runEgg('grid')));
if (store.get('jesun.grid') === '1') H.classList.add('grid-on');

/* Inspect deterrents (label: deterrent, not a lock). Never on body text. */
$$('.protect').forEach(el => {
  el.addEventListener('contextmenu', e => e.preventDefault());
  el.addEventListener('dragstart', e => e.preventDefault());
});
(function devtoolsNotice() {
  if (matchMedia('(pointer:coarse)').matches) return;
  // Inside a frame (previews, embeds) outer and inner sizes always differ, so the check would misfire.
  try { if (window.self !== window.top) return; } catch (e) { return; }
  let shown = null;
  const check = () => {
    const gap = Math.max(outerWidth - innerWidth, outerHeight - innerHeight);
    const open = gap > 220 && innerWidth > 600;
    if (open && !shown) {
      shown = document.createElement('div'); shown.className = 'vault-note'; shown.setAttribute('role', 'note');
      shown.innerHTML = '<div><b>This design is the property of Jesun Ahmad Ushno.</b>Close the developer tools to continue. Licensing: jesunahmadushno@gmail.com</div>';
      $$('[data-signature]').forEach(s => { s.style.visibility = 'hidden'; });
      document.body.appendChild(shown);
    } else if (!open && shown) {
      shown.remove(); shown = null;
      $$('[data-signature]').forEach(s => { s.style.visibility = ''; });
    }
  };
  addEventListener('resize', check); setTimeout(check, 1500);
})();

/* Konami: grid overlay */
const seq = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
let pos = 0;
addEventListener('keydown', e => {
  if (/INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return;
  pos = e.key === seq[pos] ? pos + 1 : (e.key === seq[0] ? 1 : 0);
  if (pos === seq.length) { pos = 0; runEgg('konami'); }
});

/* Page modules */
if ($('[data-lab]')) import('./lab.js');
if ($('[data-studies]') || $('[data-judge]')) import('./studies.js');

if ($('.card .gen')) import('./scifi.js').then(m => m.cardArt()).catch(() => {});

import('./cortex.js').then(m => m.initCortex()).catch(() => {});
// Jesun's full body avatar, Cortex's body. Loaded after first paint, never blocks it.
import('./companion.js').then(m => m.initCompanion()).catch(() => {});
