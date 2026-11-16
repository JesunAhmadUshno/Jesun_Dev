// Chess: full legal move rules and an alpha-beta engine, written for this site. No CDN.
// Copyright Jesun Ahmad Ushno. All rights reserved.
import { $ } from './core.js';

const VAL = { p: 100, n: 320, b: 330, r: 500, q: 900, k: 0 };
const GLYPH = { k: '♚', q: '♛', r: '♜', b: '♝', n: '♞', p: '♟' };
const NAME = { k: 'king', q: 'queen', r: 'rook', b: 'bishop', n: 'knight', p: 'pawn' };
const isW = c => c !== '.' && c === c.toUpperCase();
const colorOf = c => (c === '.' ? null : isW(c) ? 'w' : 'b');
const fileOf = s => s & 7, rankOf = s => s >> 3; // index 0 = a8
const sqName = s => 'abcdefgh'[fileOf(s)] + (8 - rankOf(s));

export function startPos() {
  const b = ('rnbqkbnr' + 'pppppppp' + '.'.repeat(32) + 'PPPPPPPP' + 'RNBQKBNR').split('');
  return { b, turn: 'w', castle: { K: 1, Q: 1, k: 1, q: 1 }, ep: -1 };
}
function clone(p) { return { b: p.b.slice(), turn: p.turn, castle: { ...p.castle }, ep: p.ep }; }
const N8 = [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]];
const K8 = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];
const at = (r, f) => (r >= 0 && r < 8 && f >= 0 && f < 8 ? r * 8 + f : -1);

export function attacked(p, s, by) {
  const r = rankOf(s), f = fileOf(s), b = p.b;
  const dir = by === 'w' ? 1 : -1; // white pawns attack upward (toward lower rank index)
  for (const df of [-1, 1]) { const t = at(r + dir, f + df); if (t >= 0 && b[t] === (by === 'w' ? 'P' : 'p')) return true; }
  for (const [dr, df] of N8) { const t = at(r + dr, f + df); if (t >= 0 && b[t] === (by === 'w' ? 'N' : 'n')) return true; }
  for (const [dr, df] of K8) { const t = at(r + dr, f + df); if (t >= 0 && b[t] === (by === 'w' ? 'K' : 'k')) return true; }
  const slide = (dirs, set) => {
    for (const [dr, df] of dirs) {
      let rr = r + dr, ff = f + df;
      while (rr >= 0 && rr < 8 && ff >= 0 && ff < 8) {
        const c = b[rr * 8 + ff];
        if (c !== '.') { if (colorOf(c) === by && set.includes(c.toLowerCase())) return true; break; }
        rr += dr; ff += df;
      }
    }
    return false;
  };
  return slide([[-1, 0], [1, 0], [0, -1], [0, 1]], 'rq') || slide([[-1, -1], [-1, 1], [1, -1], [1, 1]], 'bq');
}
const kingSq = (p, c) => p.b.indexOf(c === 'w' ? 'K' : 'k');
export const inCheck = (p, c = p.turn) => attacked(p, kingSq(p, c), c === 'w' ? 'b' : 'w');

function pseudo(p) {
  const out = [], b = p.b, me = p.turn, them = me === 'w' ? 'b' : 'w';
  for (let s = 0; s < 64; s++) {
    const c = b[s]; if (colorOf(c) !== me) continue;
    const t = c.toLowerCase(), r = rankOf(s), f = fileOf(s);
    const push = (to, extra = {}) => out.push({ from: s, to, piece: t, cap: b[to] !== '.' ? b[to] : null, ...extra });
    if (t === 'p') {
      const d = me === 'w' ? -1 : 1, start = me === 'w' ? 6 : 1, last = me === 'w' ? 0 : 7;
      const one = at(r + d, f);
      if (one >= 0 && b[one] === '.') {
        push(one, rankOf(one) === last ? { promo: 'q' } : {});
        const two = at(r + 2 * d, f);
        if (r === start && b[two] === '.') push(two, { double: true });
      }
      for (const df of [-1, 1]) {
        const to = at(r + d, f + df); if (to < 0) continue;
        if (b[to] !== '.' && colorOf(b[to]) === them) push(to, rankOf(to) === last ? { promo: 'q' } : {});
        else if (to === p.ep) out.push({ from: s, to, piece: 'p', cap: me === 'w' ? 'p' : 'P', ep: true });
      }
    } else if (t === 'n' || t === 'k') {
      for (const [dr, df] of t === 'n' ? N8 : K8) { const to = at(r + dr, f + df); if (to >= 0 && colorOf(b[to]) !== me) push(to); }
      if (t === 'k') {
        const home = me === 'w' ? 60 : 4, K = me === 'w' ? 'K' : 'k', Q = me === 'w' ? 'Q' : 'q';
        if (s === home && !attacked(p, s, them)) {
          if (p.castle[K] && b[s + 1] === '.' && b[s + 2] === '.' && !attacked(p, s + 1, them) && !attacked(p, s + 2, them)) push(s + 2, { castle: 'k' });
          if (p.castle[Q] && b[s - 1] === '.' && b[s - 2] === '.' && b[s - 3] === '.' && !attacked(p, s - 1, them) && !attacked(p, s - 2, them)) push(s - 2, { castle: 'q' });
        }
      }
    } else {
      const dirs = t === 'r' ? [[-1, 0], [1, 0], [0, -1], [0, 1]] : t === 'b' ? [[-1, -1], [-1, 1], [1, -1], [1, 1]] : K8;
      for (const [dr, df] of dirs) {
        let rr = r + dr, ff = f + df;
        while (rr >= 0 && rr < 8 && ff >= 0 && ff < 8) { const to = rr * 8 + ff; if (b[to] === '.') push(to); else { if (colorOf(b[to]) === them) push(to); break; } rr += dr; ff += df; }
      }
    }
  }
  return out;
}
export function make(p, m) {
  const n = clone(p), b = n.b, c = b[m.from];
  b[m.to] = m.promo ? (p.turn === 'w' ? 'Q' : 'q') : c; b[m.from] = '.';
  if (m.ep) b[m.to + (p.turn === 'w' ? 8 : -8)] = '.';
  if (m.castle === 'k') { b[m.to - 1] = b[m.to + 1]; b[m.to + 1] = '.'; }
  if (m.castle === 'q') { b[m.to + 1] = b[m.to - 2]; b[m.to - 2] = '.'; }
  if (c === 'K') n.castle.K = n.castle.Q = 0; if (c === 'k') n.castle.k = n.castle.q = 0;
  for (const [sq, k] of [[63, 'K'], [56, 'Q'], [7, 'k'], [0, 'q']]) if (m.from === sq || m.to === sq) n.castle[k] = 0;
  n.ep = m.double ? (m.from + m.to) / 2 : -1;
  n.turn = p.turn === 'w' ? 'b' : 'w';
  return n;
}
export function legal(p) { return pseudo(p).filter(m => !inCheck(make(p, m), p.turn)); }

function evaluate(p) { // from white's view
  let s = 0;
  for (let i = 0; i < 64; i++) {
    const c = p.b[i]; if (c === '.') continue;
    const t = c.toLowerCase(), r = rankOf(i), f = fileOf(i);
    const center = 3.5 - Math.max(Math.abs(3.5 - r), Math.abs(3.5 - f));
    let v = VAL[t] + (t === 'n' || t === 'b' ? center * 8 : t === 'p' ? center * 3 + (isW(c) ? (6 - r) : (r - 1)) * 6 : 0);
    s += isW(c) ? v : -v;
  }
  return s;
}
function search(p, depth, a, b) {
  const moves = legal(p);
  if (!moves.length) return inCheck(p) ? -100000 - depth : 0;
  if (depth === 0) return (p.turn === 'w' ? 1 : -1) * evaluate(p);
  moves.sort((x, y) => (y.cap ? VAL[y.cap.toLowerCase()] : 0) - (x.cap ? VAL[x.cap.toLowerCase()] : 0));
  for (const m of moves) {
    const v = -search(make(p, m), depth - 1, -b, -a);
    if (v >= b) return b;
    if (v > a) a = v;
  }
  return a;
}
export function best(p, depth) {
  const moves = legal(p); let bestM = null, bv = -Infinity;
  moves.sort(() => Math.random() - .5);
  for (const m of moves) { const v = -search(make(p, m), depth - 1, -Infinity, -bv); if (v > bv || !bestM) { bv = v; bestM = m; } }
  return bestM;
}

export function initChess() {
  const board = $('#board'); if (!board) return;
  const status = $('#chess-status'), movesEl = $('#chess-moves');
  let pos, hist, sel = -1, last = null, flip = false, side = 'w', thinking = false, log = [];
  const depth = () => +$('#chess-depth').value;
  function reset() { pos = startPos(); hist = []; sel = -1; last = null; log = []; side = $('#chess-side').value; flip = side === 'b'; render(); maybeAI(); }
  function render() {
    board.innerHTML = '';
    const moves = sel >= 0 ? legal(pos).filter(m => m.from === sel) : [];
    for (let k = 0; k < 64; k++) {
      const s = flip ? 63 - k : k, c = pos.b[s];
      const btn = document.createElement('button');
      btn.type = 'button'; btn.className = 'sq' + ((rankOf(s) + fileOf(s)) % 2 ? '' : ' l');
      if (s === sel) btn.classList.add('sel');
      if (last && (s === last.from || s === last.to)) btn.classList.add('last');
      const mv = moves.find(m => m.to === s); if (mv) btn.classList.add(mv.cap ? 'cap' : 'hint');
      const label = c === '.' ? sqName(s) + ' empty' : sqName(s) + ' ' + (isW(c) ? 'white ' : 'black ') + NAME[c.toLowerCase()];
      btn.setAttribute('aria-label', label);
      if (c !== '.') { const sp = document.createElement('span'); sp.className = 'pc' + (isW(c) ? '' : ' b'); sp.textContent = GLYPH[c.toLowerCase()] + '︎'; btn.appendChild(sp); }
      if ((flip ? rankOf(s) === 0 : rankOf(s) === 7)) { const co = document.createElement('span'); co.className = 'co'; co.textContent = 'abcdefgh'[fileOf(s)]; btn.appendChild(co); }
      btn.addEventListener('click', () => click(s));
      board.appendChild(btn);
    }
    const lm = legal(pos);
    const who = pos.turn === 'w' ? 'White' : 'Black';
    status.textContent = !lm.length ? (inCheck(pos) ? 'Checkmate. ' + (pos.turn === 'w' ? 'Black' : 'White') + ' wins.' : 'Stalemate.') : thinking ? 'Engine thinking...' : who + ' to move' + (inCheck(pos) ? ', in check.' : '.');
    movesEl.textContent = log.map((m, i) => (i % 2 ? '' : (i / 2 + 1) + '. ') + m).join(' ') || 'No moves yet.';
  }
  function play(m) { hist.push(pos); log.push(sqName(m.from) + (m.cap ? 'x' : '-') + sqName(m.to) + (m.promo ? '=Q' : '')); pos = make(pos, m); last = m; sel = -1; render(); }
  function click(s) {
    if (thinking || (side !== 'both' && pos.turn !== side)) return;
    const c = pos.b[s];
    if (sel >= 0) { const m = legal(pos).find(x => x.from === sel && x.to === s); if (m) { play(m); maybeAI(); return; } }
    sel = colorOf(c) === pos.turn ? s : -1; render();
  }
  function maybeAI() {
    if (side === 'both' || pos.turn === side || !legal(pos).length) return;
    thinking = true; render();
    setTimeout(() => { const m = best(pos, depth()); thinking = false; if (m) play(m); else render(); }, 60);
  }
  $('#chess-new').addEventListener('click', reset);
  $('#chess-undo').addEventListener('click', () => { if (thinking || !hist.length) return; const n = side === 'both' ? 1 : Math.min(2, hist.length); for (let i = 0; i < n; i++) { pos = hist.pop(); log.pop(); } last = null; sel = -1; render(); });
  $('#chess-flip').addEventListener('click', () => { flip = !flip; render(); });
  $('#chess-side').addEventListener('change', reset);
  reset();
}
