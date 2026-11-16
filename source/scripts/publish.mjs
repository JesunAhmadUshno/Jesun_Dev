// Copy a fresh build into the repository root, which is what GitHub Pages serves.
// Run from source/: npm run publish. Files the build does not produce are left alone, so the
// old URLs carried forward from the first site keep working.
// Copyright Jesun Ahmad Ushno. All rights reserved.
import fs from 'node:fs';
import path from 'node:path';

const DIST = path.resolve('dist'), ROOT = path.resolve('..');
if (!fs.existsSync(path.join(ROOT, 'CNAME'))) { console.error('publish: run from source/ inside the site repository'); process.exit(1); }
let n = 0;
const walk = d => { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); if (e.isDirectory()) walk(p); else { const rel = path.relative(DIST, p); if (rel === '_routes.json') continue; const to = path.join(ROOT, rel); fs.mkdirSync(path.dirname(to), { recursive: true }); fs.copyFileSync(p, to); n++; } } };
walk(DIST);
fs.writeFileSync(path.join(ROOT, '.nojekyll'), '');
console.log(`publish: ${n} files copied to the site root`);
