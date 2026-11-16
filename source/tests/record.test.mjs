// The GitHub record must stay honest: no banned names, verdicts only from the ladder, counts that add up.
// Copyright Jesun Ahmad Ushno. All rights reserved.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const rec = JSON.parse(fs.readFileSync('src/data/github-record.json', 'utf8'));
const BANNED = [['Jesun', 'Ai'].join('.'), ['Jesun', 'Code'].join('.'), 'jesun-code', 'jesun-reflection'];

test('record carries no banned or private names', () => {
  const s = JSON.stringify(rec).toLowerCase();
  for (const b of BANNED) assert.equal(s.includes(b.toLowerCase()), false, b);
});
test('every verdict sits on the ladder', () => {
  for (const s of rec.studies) if (s.verdict) assert.ok(rec.ladder.some(l => s.verdict.startsWith(l)), s.repo + ': ' + s.verdict);
});
test('ladder counts match the studies', () => {
  const st = rec.studies.filter(s => s.kind === 'study');
  assert.equal(rec.totals.studies, st.length);
  const sum = rec.ladder.reduce((n, l) => n + (rec.counts[l] || 0), 0);
  assert.equal(sum, rec.totals.graded);
  assert.equal(st.filter(s => s.verdict).length, rec.totals.graded);
});
test('links point at public GitHub or GitHub Pages only', () => {
  for (const s of rec.studies) {
    assert.match(s.url, /^https:\/\/github\.com\/JesunAhmadUshno\//);
    if (s.dashboard) assert.match(s.dashboard, /^https:\/\/([a-z0-9-]+\.github\.io|jesunahmadushno\.com)\//i);
  }
});
test('judge cases are complete and votes add up', () => {
  if (!rec.judge) return;
  assert.equal(rec.judge.cases.length, 30);
  for (const c of rec.judge.cases) for (const k of ['id', 'question', 'gold', 'answer', 'judge']) assert.ok(c[k] !== undefined && c[k] !== '', k);
  assert.ok(rec.judge.tally.agree >= 0 && rec.judge.tally.disagree >= 0);
});
test('no em dash anywhere in the record', () => {
  assert.equal(JSON.stringify(rec).includes(String.fromCharCode(0x2014)), false);
});
