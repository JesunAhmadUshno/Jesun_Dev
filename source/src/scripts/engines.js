// Pure game engines for the arcade. No DOM, so they run in tests and in the browser alike.
// Copyright Jesun Ahmad Ushno. All rights reserved.

/* Tic-tac-toe: X is the human, O is the machine. Perfect play by full minimax with a memo. */
const TTT_LINES = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];
export function tttWinner(s) { for (const l of TTT_LINES) if (s[l[0]] && l.every(i => s[i] === s[l[0]])) return { p: s[l[0]], l }; return null; }
const memo = new Map();
function mm(s, turn) {
  const k = s.map(v => v || '-').join('') + turn; if (memo.has(k)) return memo.get(k);
  const w = tttWinner(s); let r;
  if (w) r = w.p === 'O' ? 1 : -1;
  else if (s.every(Boolean)) r = 0;
  else { const vals = []; for (let i = 0; i < 9; i++) if (!s[i]) { s[i] = turn; vals.push(mm(s, turn === 'O' ? 'X' : 'O')); s[i] = null; } r = turn === 'O' ? Math.max(...vals) : Math.min(...vals); }
  memo.set(k, r); return r;
}
export function tttBest(b, rnd = Math.random) {
  const s = b.slice(); let best = -2, picks = [];
  for (let i = 0; i < 9; i++) if (!s[i]) {
    s[i] = 'O'; const v = tttWinner(s) ? 2 : mm(s, 'X'); s[i] = null; // an immediate win outranks a later one
    if (v > best) { best = v; picks = [i]; } else if (v === best) picks.push(i);
  }
  return picks[Math.floor(rnd() * picks.length)];
}

/* Connect Four: board is 7 columns, each an array from the bottom. 1 is the human, 2 the machine. */
export const C4 = { W: 7, H: 6 };
const C4_LINES = (() => { const L = []; for (let c = 0; c < C4.W; c++) for (let r = 0; r < C4.H; r++) for (const [dc, dr] of [[1, 0], [0, 1], [1, 1], [1, -1]]) { const cells = []; for (let k = 0; k < 4; k++) { const cc = c + dc * k, rr = r + dr * k; if (cc < 0 || cc >= C4.W || rr < 0 || rr >= C4.H) break; cells.push([cc, rr]); } if (cells.length === 4) L.push(cells); } return L; })();
const cell = (b, c, r) => b[c][r] || 0;
export function c4Winner(b) { for (const L of C4_LINES) { const v = cell(b, ...L[0]); if (v && L.every(([c, r]) => cell(b, c, r) === v)) return { v, L }; } return null; }
export const c4Full = b => b.every(col => col.length === C4.H);
function evalB(b) {
  let s = 0;
  for (const L of C4_LINES) { let m = 0, y = 0; for (const [c, r] of L) { const v = cell(b, c, r); if (v === 2) m++; else if (v === 1) y++; } if (m && y) continue; s += [0, 1, 6, 40, 10000][m] - [0, 1, 7, 50, 10000][y]; }
  for (let r = 0; r < b[3].length; r++) s += b[3][r] === 2 ? 4 : -4;
  return s;
}
const ORDER = [3, 2, 4, 1, 5, 0, 6];
function search(b, d, a, be, max) {
  const w = c4Winner(b); if (w) return w.v === 2 ? 100000 + d : -100000 - d;
  if (d === 0 || c4Full(b)) return evalB(b);
  if (max) { let v = -Infinity; for (const c of ORDER) { if (b[c].length === C4.H) continue; b[c].push(2); v = Math.max(v, search(b, d - 1, a, be, false)); b[c].pop(); a = Math.max(a, v); if (a >= be) break; } return v; }
  let v = Infinity; for (const c of ORDER) { if (b[c].length === C4.H) continue; b[c].push(1); v = Math.min(v, search(b, d - 1, a, be, true)); b[c].pop(); be = Math.min(be, v); if (a >= be) break; } return v;
}
export function c4Best(board, depth = 4) {
  const g = board.map(col => col.slice()); let best = -Infinity, pick = ORDER.find(c => g[c].length < C4.H);
  for (const c of ORDER) { if (g[c].length === C4.H) continue; g[c].push(2); const v = search(g, depth - 1, -Infinity, Infinity, false); g[c].pop(); if (v > best) { best = v; pick = c; } }
  return pick;
}

/* Mind reader: order-1 and order-2 frequency models of your throws, blended with a small prior. */
export const RPS = ['rock', 'paper', 'scissors'];
export const RPS_BEATS = { rock: 'paper', paper: 'scissors', scissors: 'rock' };
export function rpsPredict(h) {
  const p = { rock: 1, paper: 1, scissors: 1 };
  const add = (ctx, w) => { for (let i = ctx.length; i < h.length; i++) if (h.slice(i - ctx.length, i).join() === ctx.join()) p[h[i]] += w; };
  if (h.length >= 1) add(h.slice(-1), 1.5);
  if (h.length >= 2) add(h.slice(-2), 3);
  h.forEach(m => { p[m] += .25; });
  const t = p.rock + p.paper + p.scissors; return { rock: p.rock / t, paper: p.paper / t, scissors: p.scissors / t };
}
