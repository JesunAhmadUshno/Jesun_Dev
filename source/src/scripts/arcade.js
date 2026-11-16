// Arcade: challenge the machine. A game chooser plus three engines written for this site:
// Connect Four (alpha-beta, depth by level), Tic-tac-toe (perfect minimax) and Mind reader
// (rock, paper, scissors against a pattern model that learns your habits). Chess lives in chess.js.
// Copyright Jesun Ahmad Ushno. All rights reserved.
import { tttBest, tttWinner, c4Best, c4Winner, c4Full, C4, rpsPredict, RPS, RPS_BEATS } from './engines.js';
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const store = { get(k) { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch (e) { return null; } }, set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* storage blocked */ } } };
const later = fn => setTimeout(fn, 260);

// Scoreboard per game, kept in this browser only.
function score(game) {
  const key = 'jesun.arcade.' + game;
  const s = store.get(key) || { you: 0, machine: 0, draw: 0 };
  const el = $(`[data-score="${game}"]`);
  const paint = () => { if (el) el.textContent = `You ${s.you} / Machine ${s.machine} / Draws ${s.draw}`; };
  paint();
  return { add(k) { s[k]++; store.set(key, s); paint(); } };
}

/* ---------------- Chooser ---------------- */
function chooser() {
  const root = $('[data-arcade]'); if (!root) return;
  const tabs = $$('[role="tab"]', root), panels = $$('[role="tabpanel"]', root);
  const pick = (id, focus) => {
    tabs.forEach(t => { const on = t.dataset.game === id; t.setAttribute('aria-selected', String(on)); t.tabIndex = on ? 0 : -1; if (on && focus) t.focus(); });
    panels.forEach(p => { p.hidden = p.dataset.game !== id; });
    root.dataset.active = id;
  };
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => pick(t.dataset.game));
    t.addEventListener('keydown', e => {
      const k = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
      if (k) { e.preventDefault(); pick(tabs[(i + k + tabs.length) % tabs.length].dataset.game, true); }
      if (e.key === 'Home') { e.preventDefault(); pick(tabs[0].dataset.game, true); }
      if (e.key === 'End') { e.preventDefault(); pick(tabs[tabs.length - 1].dataset.game, true); }
    });
  });
  const fromHash = () => { const h = location.hash.slice(1); const t = tabs.find(x => x.dataset.game === h || x.dataset.alias === h); if (t) { pick(t.dataset.game); root.scrollIntoView(); } };
  addEventListener('hashchange', fromHash);
  pick(tabs[0].dataset.game); fromHash();
}

/* ---------------- Connect Four ---------------- */
function connect4() {
  const root = $('#c4'); if (!root) return;
  const sc = score('c4');
  const boardEl = $('.c4-board', root), status = $('[data-status]', root), levelSel = $('[data-level]', root);
  let g, over, busy;
  const reset = () => { g = Array.from({ length: W }, () => []); over = false; busy = false; draw(); say('Your move. Drop a red disc.'); };
  const say = t => { status.textContent = t; };
  const W = C4.W, H = C4.H, cell = (b, c, r) => b[c][r] || 0, winner = c4Winner, full = c4Full;
  const machine = () => c4Best(g, +levelSel.value);
  const drop = (c, who) => { g[c].push(who); draw(c, g[c].length - 1); const w = winner(g); if (w) { over = true; draw(-1, -1, w.L); if (auto) { say(w.v === 1 ? 'Agent red wins with less search. Upsets happen.' : 'Agent gold wins. Deeper search pays.'); return true; } sc.add(w.v === 1 ? 'you' : 'machine'); say(w.v === 1 ? 'Four in a row. You beat the machine.' : 'The machine connected four. Press New game for a rematch.'); return true; } if (full(g)) { over = true; if (!auto) sc.add('draw'); say('Board full. A draw.'); return true; } return false; };
  function draw(lc = -1, lr = -1, win = null) {
    const fi = [...boardEl.children].indexOf(document.activeElement);
    boardEl.innerHTML = '';
    for (let c = 0; c < W; c++) {
      const col = document.createElement('button'); col.type = 'button'; col.className = 'c4-col'; col.setAttribute('aria-label', `Column ${c + 1}${g[c].length === H ? ', full' : ''}`); col.disabled = over || g[c].length === H;
      for (let r = H - 1; r >= 0; r--) { const d = document.createElement('i'); const v = cell(g, c, r); if (v) d.className = (v === 1 ? 'you' : 'ai') + (c === lc && r === lr ? ' drop' : '') + (win && win.some(([wc, wr]) => wc === c && wr === r) ? ' win' : ''); if (c === lc && r === lr) d.style.setProperty('--fall', H - r); col.appendChild(d); }
      col.addEventListener('click', () => { if (over || busy || g[c].length === H) return; if (drop(c, 1)) return; busy = true; say('The machine is thinking...'); later(() => { if (over) return; if (!drop(machine(), 2)) say('Your move.'); busy = false; }); });
      boardEl.appendChild(col);
    }
    if (fi >= 0) { const cols = [...boardEl.children]; const t = cols[fi] && !cols[fi].disabled ? cols[fi] : cols.find(c => !c.disabled); (t || boardEl.closest('.gwrap').querySelector('[data-new]')).focus(); }
  }
  $('[data-new]', root).addEventListener('click', () => { auto = false; reset(); });
  // Agent versus agent: two engines play each other, red at depth 2, gold at the chosen depth.
  let auto = false;
  const mirror = b => b.map(col => col.map(v => (v === 1 ? 2 : 1)));
  const autoBtn = $('[data-auto]', root);
  if (autoBtn) autoBtn.addEventListener('click', () => {
    if (auto) { auto = false; autoBtn.textContent = 'Watch two agents play'; return; }
    reset(); auto = true; busy = true; autoBtn.textContent = 'Stop the match'; say('Agent red against agent gold. Red looks 2 moves ahead.');
    let turn = 1;
    const step = () => {
      if (!auto || over) { auto = false; busy = false; autoBtn.textContent = 'Watch two agents play'; return; }
      const col = turn === 1 ? c4Best(mirror(g), 2) : c4Best(g, +levelSel.value);
      if (drop(col, turn)) { auto = false; busy = false; autoBtn.textContent = 'Watch two agents play'; return; }
      turn = turn === 1 ? 2 : 1; setTimeout(step, 420);
    };
    setTimeout(step, 300);
  });
  reset();
}

/* ---------------- Tic-tac-toe ---------------- */
function tictactoe() {
  const root = $('#ttt'); if (!root) return;
  const sc = score('ttt'), boardEl = $('.ttt-board', root), status = $('[data-status]', root), firstSel = $('[data-first]', root);
  let b, over;
  const win = tttWinner, ai = () => tttBest(b);
  const end = () => { const w = win(b); if (w) { over = true; paint(w.l); sc.add(w.p === 'X' ? 'you' : 'machine'); status.textContent = w.p === 'X' ? 'You won. That should not be possible. Tell him.' : 'The machine wins. It never misses a fork.'; return true; } if (b.every(Boolean)) { over = true; sc.add('draw'); status.textContent = 'Draw. Against a perfect player, a draw is the best result.'; return true; } return false; };
  function paint(winL = []) { const fi = [...boardEl.children].indexOf(document.activeElement); boardEl.innerHTML = ''; b.forEach((v, i) => { const c = document.createElement('button'); c.type = 'button'; c.className = 'ttt-cell' + (v ? ' ' + v.toLowerCase() : '') + (winL.includes(i) ? ' win' : ''); c.setAttribute('aria-label', `Row ${Math.floor(i / 3) + 1}, column ${i % 3 + 1}${v ? ', ' + (v === 'X' ? 'yours' : 'machine') : ''}`); c.disabled = over || !!v; c.textContent = v || ''; c.addEventListener('click', () => { if (over || b[i]) return; b[i] = 'X'; paint(); if (end()) return; b[ai()] = 'O'; paint(); if (!end()) status.textContent = 'Your move.'; }); boardEl.appendChild(c); }); if (fi >= 0) { const cs = [...boardEl.children]; const t = cs.find((c, k) => k >= fi && !c.disabled) || cs.find(c => !c.disabled); (t || root.querySelector('[data-new]')).focus(); } }
  const reset = () => { b = Array(9).fill(null); over = false; if (firstSel.value === 'machine') b[ai()] = 'O'; paint(); status.textContent = 'You are X. The machine plays perfectly. Can you force a draw?'; };
  $('[data-new]', root).addEventListener('click', reset); firstSel.addEventListener('change', reset);
  reset();
}

/* ---------------- Mind reader ---------------- */
function mindreader() {
  const root = $('#rps'); if (!root) return;
  const sc = score('rps'), status = $('[data-status]', root), bars = $('[data-bars]', root), hist = $('[data-hist]', root), conf = $('[data-conf]', root);
  const M = RPS, BEAT = RPS_BEATS, ICON = { rock: '\u270A', paper: '\u270B', scissors: '\u270C\uFE0F' };
  let h = [], tally = { you: 0, machine: 0, draw: 0 };
  const predict = () => rpsPredict(h);
  const paintBars = pr => { bars.innerHTML = M.map(m => `<div><span>${ICON[m]} ${m}</span><i style="--w:${Math.round(pr[m] * 100)}%"></i><b>${Math.round(pr[m] * 100)}%</b></div>`).join(''); };
  const play = you => {
    const pr = predict(); const guess = M.reduce((a, m) => (pr[m] > pr[a] ? m : a), 'rock'); const ai = BEAT[guess];
    h.push(you); const res = you === ai ? 'draw' : BEAT[ai] === you ? 'you' : 'machine'; tally[res]++; sc.add(res);
    const n = tally.you + tally.machine + tally.draw;
    status.textContent = `You threw ${you}. The machine predicted ${guess} and threw ${ai}. ${res === 'you' ? 'You win this round.' : res === 'machine' ? 'The machine reads you.' : 'Draw.'}`;
    conf.textContent = `${n} rounds. Machine win rate ${Math.round(tally.machine / n * 100)}%. Random play would hold it near 33%.`;
    hist.textContent = h.slice(-24).map(m => ICON[m]).join(' ');
    paintBars(predict());
  };
  $$('[data-throw]', root).forEach(btn => btn.addEventListener('click', () => play(btn.dataset.throw)));
  root.addEventListener('keydown', e => { if (/INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return; const m = { r: 'rock', p: 'paper', s: 'scissors' }[e.key.toLowerCase()]; if (m && !e.ctrlKey && !e.metaKey) play(m); });
  $('[data-new]', root).addEventListener('click', () => { h = []; tally = { you: 0, machine: 0, draw: 0 }; hist.textContent = ''; conf.textContent = ''; status.textContent = 'Fresh model. Throw something.'; paintBars(predict()); });
  paintBars(predict());
}

chooser(); connect4(); tictactoe(); mindreader();
