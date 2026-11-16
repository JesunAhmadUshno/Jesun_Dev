// Every state the companion can ask for must exist in all three formats, or a visitor gets an
// empty pad. This catches a typo in a state name or a clip that failed to encode.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const src = fs.readFileSync(new URL('../src/scripts/companion.js', import.meta.url), 'utf8');
const LEN = Object.keys(eval('(' + src.match(/const LEN = (\{[^}]+\})/)[1] + ')'));
const used = new Set([...src.matchAll(/(?:gesture|rest|show)\s*[:(]\s*'([a-z]+)'/g)].map(m => m[1]));
const dir = new URL('../src/img/avatar3d/', import.meta.url);

test('every state the companion uses has a known length', () => {
  for (const s of used) assert.ok(LEN.includes(s), `no clip length for ${s}`);
});

test('every clip exists as VP9, animated WebP and a still', () => {
  for (const s of LEN) for (const f of [`${s}.webm`, `${s}.webp`, `${s}-still.webp`]) {
    assert.ok(fs.existsSync(new URL(f, dir)), `missing ${f}`);
  }
});

test('clips stay inside their budget', () => {
  for (const s of LEN) {
    assert.ok(fs.statSync(new URL(`${s}.webm`, dir)).size < 1024 * 1024, `${s}.webm over 1 MB`);
    assert.ok(fs.statSync(new URL(`${s}-still.webp`, dir)).size < 60 * 1024, `${s}-still.webp over 60 KB`);
  }
});
