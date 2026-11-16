// Build gates. Fails (exit 1) on any hard-rule breach. Copyright Jesun Ahmad Ushno. All rights reserved.
import fs from 'node:fs';
import path from 'node:path';
const OUT = 'dist', SRC = 'src';
const errors = [], warns = [];
const walk = dir => fs.readdirSync(dir, { withFileTypes: true }).flatMap(e => e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)]);
const LEGACY = ['roadmap/infuse-ai-engineer', 'roadmap/tangerine-ai-engineer', 'muse-n8n-extraction-101', 'bangla/muse-n8n-extraction-101'];
const isLegacy = f => LEGACY.some(l => path.relative(OUT, f).startsWith(l));
const textFiles = f => /\.(html|css|js|mjs|json|md|txt|xml|webmanifest|py|yml)$/.test(f) || /_headers|_redirects/.test(f);
const scan = [...walk(OUT), ...walk(SRC).filter(f => !f.includes('legacy')), ...walk('scripts'), ...['JESUN-DOSSIER.md', 'FUSION-PLAN.md', 'RECEIPTS.md', 'PATTERNS.md', 'README.md', 'LICENSE', 'NOTICE', 'TAKEDOWN-KIT.md'].filter(f => fs.existsSync(f))].filter(textFiles);

// 1. Em dash: zero tolerance, everywhere (content, code, comments, docs).
const EM = String.fromCharCode(0x2014);
for (const f of scan) { const t = fs.readFileSync(f, 'utf8'); const n = t.split(EM).length - 1; if (n) errors.push(`em dash x${n}: ${f}`); }

// 2. Banned names: never in the shipped site.
// The third name is assembled rather than written, so this public file does not name it either.
const BANNED = [/jesun\s*\.\s*ai/i, /jesun\s*\.\s*code/i, new RegExp(['gal', 'lea'].join(''), 'i')];
for (const f of walk(OUT).filter(textFiles)) { const t = fs.readFileSync(f, 'utf8'); for (const b of BANNED) if (b.test(t)) errors.push(`banned name ${b}: ${f}`); }
for (const f of walk(path.join(SRC, 'data'))) { const t = fs.readFileSync(f, 'utf8'); for (const b of BANNED) if (b.test(t)) errors.push(`banned name ${b}: ${f}`); }

// 3. Hype words in copy he writes (data + content).
const HYPE = ['revolutionary', 'game-changer', 'game changer', 'cutting-edge', 'cutting edge', 'world-class', 'synergy', 'unleash', 'supercharge', 'rockstar', 'ninja', 'disrupt', 'next-level', 'best-in-class', 'delve', 'leverage', 'seamless', 'mind-blowing', 'godlike'];
const ownCopy = [path.join(SRC, 'data/jesun.json'), ...walk(path.join(SRC, 'content')).filter(f => !path.basename(f).startsWith('_'))];
for (const f of ownCopy) {
  let t = fs.readFileSync(f, 'utf8').toLowerCase();
  if (f.endsWith('jesun.json')) { const j = JSON.parse(fs.readFileSync(f, 'utf8')); delete j.recommendations; t = JSON.stringify(j).toLowerCase(); } // testimony is verbatim, not his copy
  for (const h of HYPE) if (t.includes(h)) errors.push(`hype word "${h}": ${f}`);
}

// 4. Unsourced statistics: every stat and journey count must carry a source.
const data = JSON.parse(fs.readFileSync(path.join(SRC, 'data/jesun.json'), 'utf8'));
for (const s of data.stats) if (!s.source) errors.push(`stat without source: ${s.id}`);
for (const j of data.journey) if (j.count && !j.source) errors.push(`journey count without source: ${j.id}`);
for (const p of data.projects) if (!p.source) errors.push(`project without source: ${p.slug}`);
for (const f of walk(path.join(SRC, 'content')).filter(f => !path.basename(f).startsWith('_'))) { const t = fs.readFileSync(f, 'utf8'); if (/\d+%|\d{2,}[,\d]*\+/.test(t) && !/^sources:\s*\[.+\]/m.test(t)) errors.push(`post has numbers but no sources: ${f}`); }

// 5. HTML checks on generated pages.
const html = walk(OUT).filter(f => f.endsWith('.html') && !isLegacy(f));
const titles = new Map(), descs = new Map();
const exists = u => { let p = path.join(OUT, decodeURIComponent(u.split('#')[0].split('?')[0])); if (u.split('#')[0].endsWith('/')) p = path.join(p, 'index.html'); return fs.existsSync(p) && fs.statSync(p).isFile() || fs.existsSync(path.join(p, 'index.html')); };
let links = 0, anchors = 0;
for (const f of html) {
  const t = fs.readFileSync(f, 'utf8'); const rel = '/' + path.relative(OUT, f);
  const redirect = /http-equiv="refresh"/.test(t);
  for (const m of t.matchAll(/<img\b[^>]*>/g)) if (!/\balt="/.test(m[0])) errors.push(`img without alt: ${rel}`);
  for (const m of t.matchAll(/<img\b[^>]*>/g)) if (!/\bwidth="\d+"/.test(m[0]) || !/\bheight="\d+"/.test(m[0])) warns.push(`img without width/height: ${rel}`);
  if (redirect || /noindex/.test(t)) continue;
  const title = (t.match(/<title>([^<]*)<\/title>/) || [])[1] || ''; const desc = (t.match(/<meta name="description" content="([^"]*)"/) || [])[1] || '';
  if (!title) errors.push(`missing title: ${rel}`); if (!desc) errors.push(`missing description: ${rel}`);
  if (title.length > 70) warns.push(`title ${title.length} chars: ${rel}`);
  if (desc.length < 70 || desc.length > 330) warns.push(`description ${desc.length} chars: ${rel}`);
  if (titles.has(title)) errors.push(`duplicate title: ${rel} and ${titles.get(title)}`); titles.set(title, rel);
  if (descs.has(desc) && !['/index.html', '/about/index.html'].includes(rel)) warns.push(`duplicate description: ${rel} and ${descs.get(desc)}`); descs.set(desc, rel);
  if (!/<link rel="canonical"/.test(t)) errors.push(`missing canonical: ${rel}`);
  if ((t.match(/<h1\b/g) || []).length !== 1) errors.push(`h1 count ${(t.match(/<h1\b/g) || []).length}: ${rel}`);
  // structured data: parse, one Person, stable id, no birthDate, no banned names
  const ld = [...t.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
  if (!ld.length) errors.push(`no JSON-LD: ${rel}`);
  for (const b of ld) { let j; try { j = JSON.parse(b[1]); } catch (e) { errors.push(`JSON-LD parse error: ${rel}`); continue; }
    const people = (j['@graph'] || []).filter(n => n['@type'] === 'Person');
    if (people.length !== 1 || people[0]['@id'] !== data.person.id) errors.push(`Person node wrong: ${rel}`);
    if (b[1].includes('birthDate')) errors.push(`birthDate in JSON-LD: ${rel}`);
    if (people[0] && people[0].description !== data.description) errors.push(`Person description drift: ${rel}`);
  }
  // internal links and anchors
  const ids = new Set([...t.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]));
  for (const m of t.matchAll(/\b(?:href|src)="([^"]+)"/g)) {
    const u = m[1]; if (/^(https?:|mailto:|tel:|data:)/.test(u)) continue;
    if (u.startsWith('#')) { anchors++; if (u.length > 1 && !ids.has(u.slice(1))) errors.push(`dead anchor ${u}: ${rel}`); continue; }
    if (!u.startsWith('/')) continue; links++;
    if (!exists(u)) errors.push(`broken link ${u}: ${rel}`);
    const [p, h] = u.split('#'); if (h && exists(p)) { let tf = path.join(OUT, p); if (p.endsWith('/')) tf = path.join(tf, 'index.html'); if (fs.existsSync(tf) && !new RegExp(`id="${h}"`).test(fs.readFileSync(tf, 'utf8'))) errors.push(`dead anchor ${u}: ${rel}`); }
  }
}
// 6. Legacy URLs must resolve.
const LEGACY_URLS = ['/', '/about.html', '/uses.html', '/privacy/', '/terms/', '/knowledge-panel-service/', '/projects/prism.html', '/projects/jesun-code.html', '/projects/bigfish.html', '/projects/nopara.html', '/projects/tridrop.html', '/projects/sonicclear.html', '/roadmap/infuse-ai-engineer/', '/roadmap/tangerine-ai-engineer/', '/muse-n8n-extraction-101/', '/bangla/muse-n8n-extraction-101/', '/Jesun_Resume.pdf', '/resume/Jesun-Ahmad-Ushno-Resume.pdf', '/favicon.png', '/sitemap.xml', '/robots.txt', '/llms.txt', '/ads.txt', '/710b97fc5f16df7c6b1010cfe2355cfa.txt', '/CNAME'];
for (const u of LEGACY_URLS) if (!exists(u)) errors.push(`legacy URL missing: ${u}`);

// 7. Budgets.
const jsDir = path.join(OUT, 'js');
const jsInitial = fs.statSync(path.join(jsDir, 'main.js')).size + fs.statSync(path.join(jsDir, 'arm.js')).size + fs.readdirSync(jsDir).filter(f => f.startsWith('chunk')).reduce((a, f) => a + fs.statSync(path.join(jsDir, f)).size, 0);
const jsAll = fs.readdirSync(jsDir).reduce((a, f) => a + fs.statSync(path.join(jsDir, f)).size, 0);
const cssSize = fs.statSync(path.join(OUT, 'css/site.css')).size;
if (jsInitial > 200 * 1024) errors.push(`initial JS ${jsInitial} bytes > 200 KB budget`);
if (cssSize > 80 * 1024) errors.push(`CSS ${cssSize} bytes > 80 KB budget`);
// Avatar motion clips have their own budget: they are fetched one state at a time, after first
// paint, never as part of a page. VP9 (Chrome, Edge, Firefox) must stay under 1 MB a state; the
// animated WebP fallback that only WebKit fetches, under 1.8 MB. Stills follow the image budget.
const CLIP = { '.webm': 1024, '.webp': 1800 };
for (const f of walk(path.join(OUT, 'img'))) {
  const kb = fs.statSync(f).size / 1024, ext = path.extname(f);
  if (f.includes(`${path.sep}avatar3d${path.sep}`) && !f.endsWith('-still.webp')) { if (kb > CLIP[ext]) warns.push(`avatar clip over ${CLIP[ext]} KB: ${f}`); }
  else if (kb > 260) warns.push(`image over 260 KB: ${f}`);
}
if (walk(OUT).some(f => f.endsWith('.map'))) errors.push('source map shipped');
if (walk(OUT).some(f => f.endsWith('jesun.json'))) errors.push('raw data file shipped');

const report = { pages: html.length, internalLinks: links, anchors, jsInitialBytes: jsInitial, jsTotalBytes: jsAll, cssBytes: cssSize, errors: errors.length, warnings: warns.length };
fs.writeFileSync('build-log/lint.json', JSON.stringify({ ...report, errorList: errors, warnList: warns }, null, 1));
for (const w of warns) console.log('warn  ' + w);
for (const e of errors) console.log('ERROR ' + e);
console.log(JSON.stringify(report));
process.exit(errors.length ? 1 : 0);
