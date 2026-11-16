// Retrieval quality tests over the real built index. Run after npm run build.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { buildIndex, search, bestSentence, explain } from '../src/scripts/retrieve.js';

const ix = buildIndex(JSON.parse(fs.readFileSync('dist/index/passages.json', 'utf8')).p);
const top = q => search(ix, q, 3).map(r => r.p);
const cases = [
  ['What did he publish?', /DOI|paper|AIP/i],
  ['Tell me about the wavelet paper', /wavelet/i],
  ['What ventures did he found?', /Immitly|Brimwood|Climeam/],
  ['Who is Adam Sayani?', /Brimwood/],
  ['What is Climeam?', /creative studio/i],
  ['Where does he live?', /Toronto/],
  ['What was his CGPA?', /3\.9154/],
  ['What did he do at KPMG?', /Power Automate|ISO 27001/],
  ['MIAS Foundation families', /50,000|families/],
  ['What is PRISM?', /browser|zero-trust/i],
  ['How do I contact him?', /jesunahmadushno@gmail\.com|brief/],
  ['What is his tech stack?', /Python/],
  ['Tell me about his agent fleet', /seats|fleet/i],
  ['PulseKey metrics', /32 metrics|drawing/i],
  ['Which university?', /Niagara Falls|AIUB/],
  ['particle swarm optimization', /particle swarm|PSO/i],
  ['What did his manager at KPMG say?', /Sifat|supervis/i],
  ['Does he use GCP?', /GCP/],
  ['book on data analytics', /Beginner/],
  ['How many public repositories?', /44|repositor/i]
];
for (const [q, rx] of cases) test(`retrieves: ${q}`, () => {
  const r = top(q); assert.ok(r.length, 'no result');
  assert.ok(r.some(p => rx.test(p.t + ' ' + p.x)), `top 3 for "${q}" were: ${r.map(p => p.t).join(' | ')}`);
});
test('refuses what is not on the record', () => {
  assert.equal(search(ix, 'salary net worth home address', 3).length, 0);
});
test('quotes a sentence verbatim from the passage', () => {
  const p = top('What did he publish?')[0]; const s = bestSentence(p.x, 'publish');
  assert.ok(p.x.includes(s));
});
test('index holds no banned names', () => {
  const raw = fs.readFileSync('dist/index/passages.json', 'utf8');
  assert.ok(!/jesun\s*\.\s*(ai|code)/i.test(raw) && !new RegExp(['gal', 'lea'].join(''), 'i').test(raw));
});
test('a query takes under 5 ms', () => {
  const t0 = performance.now(); for (let i = 0; i < 100; i++) search(ix, 'agent fleet ventures toronto'); assert.ok((performance.now() - t0) / 100 < 5);
});

test('explain shows the real working behind an answer', () => {
  const ix = buildIndex(JSON.parse(fs.readFileSync('dist/index/passages.json', 'utf8')).p);
  const e = explain(ix, 'what did he publish');
  assert.ok(e.tokens.length >= 1);
  assert.equal(e.scanned, ix.N);
  assert.ok(e.hits.length >= 1);
  assert.ok(e.hits[0].score >= e.hits[e.hits.length - 1].score);
  assert.ok(['high', 'medium', 'low'].includes(e.confidence));
  // The explained winner is the same passage the plain search returns.
  assert.equal(e.hits[0].p.id, search(ix, 'what did he publish', 1)[0].p.id);
  const none = explain(ix, 'zxqv blorf');
  assert.equal(none.hits.length, 0); assert.equal(none.confidence, 'none');
});
