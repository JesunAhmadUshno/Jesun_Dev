// Turns the TAP output into build-log/test.json and fails on any failed test.
import fs from 'node:fs';
const t = fs.readFileSync('build-log/test.tap', 'utf8');
const pass = +(t.match(/^# pass (\d+)/m) || [0, 0])[1], fail = +(t.match(/^# fail (\d+)/m) || [0, 0])[1];
fs.writeFileSync('build-log/test.json', JSON.stringify({ pass, fail, at: new Date().toISOString() }));
console.log(`tests: ${pass} passed, ${fail} failed`); process.exit(fail || !pass ? 1 : 0); // zero tests run is a failure, not a pass
