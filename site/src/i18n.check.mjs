// Bilingual parity check for content-strings.json, same parity() the dashboard renders. Run by `npm run build`.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parity } from './parity.mjs';
import { buildLang } from './extract.mjs';

const strings = JSON.parse(fs.readFileSync(new URL('../../content-strings.json', import.meta.url), 'utf8'));
const p = parity(strings);
assert.deepEqual(Object.keys(strings).sort(), ['bn', 'en'], 'expected exactly en and bn tables');
assert.equal(p.enCount, Object.keys(strings.en).length);
assert.equal(p.groups.reduce((s, g) => s + g.total, 0), p.keys.length, 'groups must partition the keys');
const missing = p.groups.flatMap((g) => [...g.missingBn.map((k) => `bn:${k}`), ...g.missingEn.map((k) => `en:${k}`)]);
const empty = p.groups.flatMap((g) => g.empty);
assert.deepEqual(missing, [], `keys missing a translation: ${missing.join(', ')}`);
assert.deepEqual(empty, [], `empty values: ${empty.join(', ')}`);
// The language switch reads lang.js's inline table; content-strings.json must stay a subset of it.
const lang = buildLang();
for (const L of ['en', 'bn']) {
  const absent = Object.keys(strings[L]).filter((k) => !(k in lang[L]) && !k.startsWith('twin-'));
  assert.deepEqual(absent, [], `content-strings.json ${L} keys unknown to lang.js: ${absent.join(', ')}`);
}
const lp = parity(lang);
const gaps = lp.groups.flatMap((g) => [...g.missingEn.map((k) => `en:${k}`), ...g.missingBn.map((k) => `bn:${k}`)]);
const drift = Object.keys(strings.en).flatMap((k) => ['en', 'bn'].filter((L) => k in lang[L] && lang[L][k] !== strings[L][k]).map((L) => `${L}:${k}`));
// Reported, not fatal: these are content decisions for the owner (see docs/research-review.md).
console.log(`i18n note: lang.js ${lp.enCount} EN / ${lp.bnCount} BN keys; missing: ${gaps.join(', ') || 'none'}; drift vs content-strings.json: ${drift.join(', ') || 'none'}`);
console.log(`i18n ok: ${p.enCount} EN / ${p.bnCount} BN keys, ${p.groups.length} prefix groups, 0 missing, 0 empty`);
