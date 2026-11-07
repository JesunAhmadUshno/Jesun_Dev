// Claims-consistency check. Run by `npm run build`.
// 1. The version the dashboard shows (regex over jesun.py) equals what the interpreter itself reports.
// 2. The bundled examples produce known answers when run through jesun.execute (Python 3, standard library only).
// 3. Every sitemap page has a canonical link and a meta description.
// 4. The dashboard source never hard-codes a Jesun.Code version or test count.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { spawnSync } from 'node:child_process';
import { buildAnatomy, buildAudit } from './extract.mjs';

const anatomy = buildAnatomy();
const py = spawnSync('python3', ['-I', '-B', '-c', `
import json, sys, pathlib
sys.path.insert(0, 'assets/jesun'); import jesun
ex = {p.stem: jesun.execute(p.read_text(), 'Mara\\n') for p in sorted(pathlib.Path('assets/jesun/examples').glob('*.jc'))}
print(json.dumps({'version': jesun.VERSION, 'depth': jesun.MAX_CALL_DEPTH, 'loops': jesun.MAX_LOOP_RUNS, 'ex': ex}))
`], { cwd: new URL('../..', import.meta.url).pathname, encoding: 'utf8' });
assert.equal(py.status, 0, `python3 run failed: ${py.stderr}`);
const r = JSON.parse(py.stdout);
assert.equal(anatomy.constants.VERSION, r.version, 'regex VERSION differs from jesun.VERSION');
assert.equal(anatomy.constants.MAX_CALL_DEPTH, r.depth);
assert.equal(anatomy.constants.MAX_LOOP_RUNS, r.loops);

const lines = (s) => s.trim().split('\n');
// functions.jc: add 2 and 3 -> 5; factorial 5 -> 120; add (add 1 and 2) and 10 -> 13
assert.deepEqual(lines(r.ex.functions).slice(-3), ['5', '120', '13']);
// loops.jc: "hi" x3, counter 0..2, skip 3 in 1..5, 2x2 nested
const lo = lines(r.ex.loops);
assert.equal(lo.filter((l) => l === 'hi').length, 3);
assert.equal(lo.filter((l) => l === 'nested').length, 4);
assert.deepEqual(lo.slice(-8, -4), ['1', '2', '4', '5']);
// decisions.jc: score 85 grades "B"; 9 conditions print
assert.equal(lines(r.ex.decisions)[0], 'B');
assert.equal(lines(r.ex.decisions).length, 9);
// hello.jc reads stdin
assert.match(r.ex.hello, /Nice to meet you, Mara/);

const audit = buildAudit();
const gaps = audit.pages.filter((p) => !p.exists || !p.canonical || !p.description).map((p) => p.file);
assert.deepEqual(gaps, [], `sitemap pages missing file, canonical or description: ${gaps.join(', ')}`);
const bad = audit.pages.filter((p) => p.ldErrors).map((p) => p.file);
assert.deepEqual(bad, [], `invalid JSON-LD on: ${bad.join(', ')}`);

const app = fs.readFileSync(new URL('./App.jsx', import.meta.url), 'utf8');
assert.ok(!/\b(v?2\.0\.0|711)\b/.test(app), 'App.jsx hard-codes a Jesun.Code version or test count');
console.log(`claims ok: interpreter v${r.version}, 4 examples match known answers, ${audit.pages.length}/${audit.pages.length} sitemap pages have canonical + description`);
