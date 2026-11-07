// Runs assets/js/playground.js with a fake worker: the boot warmup must not overwrite the "runtime ready" status.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const src = fs.readFileSync(new URL('../../assets/js/playground.js', import.meta.url), 'utf8');
const el = () => ({ textContent: '', value: '', disabled: false, classList: { add() {}, remove() {} }, addEventListener() {} });
const els = {};
let worker;
class Worker { constructor() { worker = this; } postMessage() {} terminate() {} }
vm.runInNewContext(src, {
  window: { Worker }, Worker,
  document: { getElementById: (id) => (els[id] ||= el()), querySelectorAll: () => [] },
});
worker.onmessage({ data: { type: 'ready', version: '0.6.0' } });
worker.onmessage({ data: { type: 'done', id: -1, output: '' } });
assert.match(els['jc-status'].textContent, /runtime ready: Jesun\.Code v0\.6\.0/, `status after warmup: "${els['jc-status'].textContent}"`);
console.log('playground ok: warmup keeps the runtime-ready status');
