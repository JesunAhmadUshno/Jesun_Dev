// Arcade engines must play the way the page says they do.
// Copyright Jesun Ahmad Ushno. All rights reserved.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { tttBest, tttWinner, c4Best, c4Winner, rpsPredict } from '../src/scripts/engines.js';

test('tic-tac-toe takes a winning move when it has one', () => {
  const b = ['O', 'O', null, 'X', 'X', null, null, null, null];
  assert.equal(tttBest(b, () => 0), 2);
});
test('tic-tac-toe blocks an immediate threat', () => {
  const b = ['X', 'X', null, null, 'O', null, null, null, null];
  assert.equal(tttBest(b, () => 0), 2);
});
test('tic-tac-toe never loses against every human line of play', () => {
  let games = 0;
  const play = (b, human) => {
    const w = tttWinner(b); if (w) { assert.notEqual(w.p, 'X', 'the human beat the engine: ' + b.join(',')); games++; return; }
    if (b.every(Boolean)) { games++; return; }
    if (human) { for (let i = 0; i < 9; i++) if (!b[i]) { const n = b.slice(); n[i] = 'X'; play(n, false); } }
    else { const n = b.slice(); n[tttBest(n, () => 0)] = 'O'; play(n, true); }
  };
  play(Array(9).fill(null), true);
  play(Array(9).fill(null), false);
  assert.ok(games > 100);
});
test('connect four wins in one when it can', () => {
  const g = [[2, 2, 2], [1, 1], [1], [], [], [], []];
  assert.equal(c4Best(g, 4), 0);
});
test('connect four blocks a horizontal threat', () => {
  const g2 = [[], [1], [1], [1], [2, 2], [], []];
  const pick = c4Best(g2, 4);
  assert.ok(pick === 0 || pick === 4 || pick === 5, 'must block an open three, got ' + pick);
});
test('connect four never picks a full column', () => {
  const g = [[1, 2, 1, 2, 1, 2], [], [], [], [], [], []];
  assert.notEqual(c4Best(g, 2), 0);
});
test('connect four finds four in a row', () => {
  assert.equal(c4Winner([[1], [1], [1], [1], [], [], []]).v, 1);
  assert.equal(c4Winner([[2, 2, 2, 2], [], [], [], [], [], []]).v, 2);
  assert.equal(c4Winner([[1], [2], [], [], [], [], []]), null);
});
test('mind reader learns a repeated habit', () => {
  const h = ['rock', 'rock', 'rock', 'rock', 'rock', 'rock'];
  const p = rpsPredict(h);
  assert.ok(p.rock > .6, 'rock should dominate, got ' + p.rock);
  const sum = p.rock + p.paper + p.scissors;
  assert.ok(Math.abs(sum - 1) < 1e-9);
});
test('mind reader learns a cycle', () => {
  const h = []; for (let i = 0; i < 12; i++) h.push(['rock', 'paper', 'scissors'][i % 3]);
  const p = rpsPredict(h);
  assert.ok(p.rock > p.paper && p.rock > p.scissors, 'after scissors comes rock');
});
