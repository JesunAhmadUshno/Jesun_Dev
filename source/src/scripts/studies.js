// Research record behaviour: ladder filter, study wall, study search, judge the judge.
// Works on the home page and on /studies/. Everything degrades to plain links without script.
// Copyright Jesun Ahmad Ushno. All rights reserved.
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const reduce = () => { try { if (localStorage.getItem('jesun.rm') === '1') return true; } catch (e) { /* blocked */ } return matchMedia('(prefers-reduced-motion: reduce)').matches; };

const VOTE_BODY = 'Press "Submit new issue" to cast this vote. A bot records it within a minute, replies with the running tally, and closes the issue.';
const voteUrl = (id, side) => `https://github.com/JesunAhmadUshno/JesunAhmadUshno/issues/new?title=${encodeURIComponent(`judge: ${id} ${side}`)}&body=${encodeURIComponent(VOTE_BODY)}`;

function cases() {
  const el = $('#judge-data'); if (!el) return [];
  try { const c = JSON.parse(el.textContent); return Array.isArray(c) ? c : []; } catch (e) { return []; }
}

export function initJudge(root = document) {
  const C = cases(); if (!C.length) return;
  for (const box of $$('[data-judge]', root)) {
    if (box.dataset.ready) continue; box.dataset.ready = '1';
    let i = 0;
    const show = k => {
      i = (k + C.length) % C.length; const c = C[i];
      $('[data-jn]', box).textContent = c.n; $('[data-jq]', box).textContent = c.question; $('[data-jg]', box).textContent = c.gold; $('[data-ja]', box).textContent = c.answer;
      const v = $('[data-jv]', box); v.textContent = c.judge; v.dataset.v = c.judge;
      $('[data-jyes]', box).href = voteUrl(c.id, 'agree'); $('[data-jno]', box).href = voteUrl(c.id, 'disagree');
      if (!reduce()) { box.classList.remove('flip'); void box.offsetWidth; box.classList.add('flip'); }
      const live = $('[data-jlive]', box); if (live) live.textContent = `Case ${c.n}. ${c.question} The judge said ${c.judge}.`;
    };
    const next = $('[data-jnext]', box);
    if (next) next.addEventListener('click', () => show(i + 1));
    box.addEventListener('keydown', e => { if (e.target.closest('input,textarea')) return; if (e.key === 'ArrowRight') { show(i + 1); e.preventDefault(); } if (e.key === 'ArrowLeft') { show(i - 1); e.preventDefault(); } });
  }
}

// Ladder buttons act as a toggle filter on whichever study set sits nearby (wall tiles or study cards).
function initLadder(scope, onRung) {
  for (const b of $$('.ladder button', scope)) {
    b.addEventListener('click', () => {
      const on = b.getAttribute('aria-pressed') !== 'true';
      $$('.ladder button', scope).forEach(x => x.setAttribute('aria-pressed', 'false'));
      b.setAttribute('aria-pressed', String(on));
      onRung(on ? Number(b.dataset.rung) : null);
    });
  }
}

function initWall() {
  const sec = $('#studies'); const wall = sec && $('.swall', sec); if (!wall) return;
  const read = $('[data-wallread]', sec);
  const tiles = $$('.stile', wall);
  const say = t => { if (!read || !t) return; read.innerHTML = '<span class="label"></span> <b></b> <span class="q"></span>'; read.children[0].textContent = t.dataset.tv; read.children[1].textContent = t.querySelector('span').textContent + '.'; read.children[2].textContent = t.dataset.tq; };
  tiles.forEach(t => { t.addEventListener('mouseenter', () => say(t)); t.addEventListener('focus', () => say(t)); });
  // One Tab stop for the whole wall; arrow keys move between studies (roving tabindex).
  const cols = () => { const t0 = tiles[0].getBoundingClientRect().top; return Math.max(1, tiles.filter(t => t.getBoundingClientRect().top === t0).length); };
  wall.addEventListener('keydown', e => {
    const i = tiles.indexOf(document.activeElement); if (i < 0) return;
    const d = { ArrowRight: 1, ArrowLeft: -1, ArrowDown: cols(), ArrowUp: -cols(), Home: -i, End: tiles.length - 1 - i }[e.key]; if (d === undefined) return;
    e.preventDefault(); const n = tiles[Math.max(0, Math.min(tiles.length - 1, i + d))];
    tiles.forEach(t => { t.tabIndex = -1; }); n.tabIndex = 0; n.focus();
  });
  initLadder(sec, r => {
    wall.classList.toggle('sdim', r !== null);
    tiles.forEach(t => t.classList.toggle('on', r !== null && Number(t.dataset.rung) === r));
    const lit = tiles.filter(t => t.classList.contains('on'));
    if (read) read.textContent = r === null ? 'All studies shown.' : `${lit.length} ${lit.length === 1 ? 'study' : 'studies'} on this rung.`;
  });
  // A slow scan pings one tile at a time, so the wall reads as live without moving the layout.
  if (reduce()) return;
  let k = 0, timer = 0;
  const step = () => { if (document.hidden) return; const t = tiles[k++ % tiles.length]; t.classList.remove('ping'); void t.offsetWidth; t.classList.add('ping'); };
  const io = new IntersectionObserver(es => { for (const e of es) { clearInterval(timer); if (e.isIntersecting) timer = setInterval(step, 420); } });
  io.observe(wall);
}

function initPage() {
  const root = $('[data-studies]'); if (!root) return;
  const cards = $$('.study', root), q = $('[data-sq]', root), count = $('[data-scount]', root), empty = $('[data-sempty]', root);
  const state = { q: '', track: 'all', rung: null };
  try { const u = new URLSearchParams(location.search); if (u.get('q')) state.q = u.get('q').toLowerCase(); if (u.get('track')) state.track = u.get('track'); } catch (e) { /* ignore */ }
  const apply = () => {
    let n = 0;
    for (const c of cards) {
      const ok = (!state.q || state.q.split(/\s+/).every(w => c.dataset.q.includes(w))) && (state.track === 'all' || c.dataset.track === state.track) && (state.rung === null || Number(c.dataset.rung) === state.rung);
      c.hidden = !ok; if (ok) n++;
    }
    count.textContent = `${n} ${n === 1 ? 'study' : 'studies'} shown`; empty.hidden = n > 0;
  };
  if (q) { q.value = state.q; q.addEventListener('input', () => { state.q = q.value.toLowerCase().trim(); apply(); }); }
  for (const b of $$('[data-strack]', root)) {
    if (b.dataset.strack === state.track) { $$('[data-strack]', root).forEach(x => x.setAttribute('aria-pressed', 'false')); b.setAttribute('aria-pressed', 'true'); }
    b.addEventListener('click', () => { $$('[data-strack]', root).forEach(x => x.setAttribute('aria-pressed', 'false')); b.setAttribute('aria-pressed', 'true'); state.track = b.dataset.strack; apply(); });
  }
  initLadder(root, r => { state.rung = r; apply(); });
  // A deep link to a hidden card clears the filters so the card is visible.
  const reveal = () => { const id = decodeURIComponent(location.hash.slice(1)); const c = id && document.getElementById(id); if (c && c.classList.contains('study') && c.hidden) { state.q = ''; state.track = 'all'; state.rung = null; if (q) q.value = ''; apply(); c.scrollIntoView(); } };
  addEventListener('hashchange', reveal);
  apply(); reveal();
}

initWall(); initPage(); initJudge();
