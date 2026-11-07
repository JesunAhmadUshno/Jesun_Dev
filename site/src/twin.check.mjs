// Known-answer check for the twin console: runs the production twin.js over twin-data.js
// through the same loader the dashboard uses (twin-core.mjs). Run by `npm run build`.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import { loadTwin } from './twin-core.mjs';

const require = createRequire(import.meta.url);
const twinPath = new URL('../../assets/js/twin.js', import.meta.url), dataPath = new URL('../../assets/js/twin-data.js', import.meta.url);
const t = loadTwin(fs.readFileSync(twinPath, 'utf8'), fs.readFileSync(dataPath, 'utf8'));
const node = require(twinPath.pathname); // the file as production ships it, via plain require

// 1. The dashboard loader and a plain require give identical answers.
for (const q of ['what is jesun code', 'his tech stack', 'how do I contact him', 'tell me a joke', ''])
  for (const L of ['en', 'bn']) assert.equal(t.twinAnswer(q, L), node.twinAnswer(q, L), `loader drift on "${q}" ${L}`);

// 2. Every entry has non-empty EN and BN answers and at least one keyword.
for (const e of t.data.entries) {
  assert.ok(e.keys.length > 0, `${e.id} has no keys`);
  for (const L of ['en', 'bn']) assert.ok(e.a[L] && e.a[L].trim(), `${e.id} missing ${L} answer`);
}
for (const k of ['greeting', 'fallback']) for (const L of ['en', 'bn']) assert.ok(t.data[k][L].trim(), `${k}.${L} empty`);

// 3. Off-topic input gets the fallback, never a guess.
for (const q of ['weather in tokyo tomorrow', 'quantum chromodynamics', 'zzzz'])
  assert.equal(t.twinAnswer(q, 'en'), t.data.fallback.en, `"${q}" should fall back`);

// 4. Each topic is reachable by its own keywords; the explainability ranking agrees with twinAnswer.
const misses = [];
let total = 0;
for (const e of t.data.entries) {
  let home = 0;
  for (const k of e.keys) {
    total++;
    const got = t.twinAnswer(k, 'en');
    if (got === e.a.en) home++; else misses.push(`${e.id}:"${k}"`);
    const top = t.rank(k).scores[0];
    const expect = top.score >= 1 ? t.data.entries.find((x) => x.id === top.id).a.en : t.data.fallback.en;
    assert.equal(got, expect, `ranking disagrees with twinAnswer on "${k}"`);
  }
  assert.ok(home > 0, `topic ${e.id} unreachable by any of its own keys`);
}
const rate = (total - misses.length) / total;
// ponytail: floor, not exact snapshot, so routine content edits do not break the build.
assert.ok(rate >= 0.9, `self-routing fell to ${(rate * 100).toFixed(1)}%: ${misses.join(', ')}`);
console.log(`twin ok: ${t.data.entries.length} topics, ${total - misses.length}/${total} keywords route home; misses: ${misses.join(', ')}`);
