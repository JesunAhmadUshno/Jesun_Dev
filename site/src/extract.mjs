// Build-time extraction: reads the portfolio's own files and writes src/data/*.json.
// Nothing here is typed by hand; every number on the dashboard traces back to these reads.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');

// ---- site audit: sitemap.xml -> each page's head tags ----
export function locToFile(loc) {
  const p = new URL(loc).pathname.replace(/^\//, '');
  return p === '' || p.endsWith('/') ? `${p}index.html` : p;
}
const attr = (tag, name) => (tag.match(new RegExp(`${name}\\s*=\\s*"([^"]*)"`, 'i')) || [])[1];
export function auditHtml(html) {
  const metas = html.match(/<meta\b[^>]*>/gi) || [];
  const links = html.match(/<link\b[^>]*>/gi) || [];
  const prop = (m) => attr(m, 'property') || attr(m, 'name') || '';
  const types = new Set();
  let sameAs = 0, ldBlocks = 0, ldErrors = 0;
  const walk = (n) => {
    if (Array.isArray(n)) return n.forEach(walk);
    if (n && typeof n === 'object') {
      [].concat(n['@type'] || []).forEach((t) => types.add(t));
      if (Array.isArray(n.sameAs)) sameAs = Math.max(sameAs, n.sameAs.length);
      Object.values(n).forEach(walk);
    }
  };
  for (const m of html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)) {
    ldBlocks++;
    try { walk(JSON.parse(m[1])); } catch { ldErrors++; }
  }
  return {
    title: ((html.match(/<title>([\s\S]*?)<\/title>/i) || [])[1] || '').trim(),
    canonical: links.some((l) => /rel="canonical"/i.test(l) && attr(l, 'href')),
    description: metas.some((m) => /^description$/i.test(prop(m)) && (attr(m, 'content') || '').trim()),
    og: metas.filter((m) => /^og:/i.test(prop(m))).length,
    twitter: metas.filter((m) => /^twitter:/i.test(prop(m))).length,
    hreflang: links.filter((l) => /hreflang=/i.test(l)).length,
    ldBlocks, ldErrors, ldTypes: [...types].sort(), sameAs,
    bytes: Buffer.byteLength(html),
  };
}
export function buildAudit() {
  const locs = [...read('sitemap.xml').matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
  const pages = locs.map((loc) => {
    const file = locToFile(loc);
    const exists = fs.existsSync(path.join(ROOT, file));
    return { loc, file, exists, ...(exists ? auditHtml(read(file)) : {}) };
  });
  return { generatedFrom: 'sitemap.xml', pages };
}

// ---- interpreter anatomy: classes and constants in assets/jesun/jesun.py ----
export const PHASE2 = /^(AskAi|Term)|Agent|Fleet/;
export const BRIDGE = /^(Import|Foreign|ForeignCall|Interp|ReadFile|WriteFile|UsePkg|BringIn|Push)$/;
export function buildAnatomy(src = read('assets/jesun/jesun.py')) {
  const classes = [...src.matchAll(/^class (\w+)/gm)].map((m) => ({ name: m[1], line: src.slice(0, m.index).split('\n').length }));
  const iTok = classes.findIndex((c) => c.name === 'Token'), iParser = classes.findIndex((c) => c.name === 'Parser');
  if (iTok < 0 || iParser < iTok) throw new Error('jesun.py layout changed: Token/Parser markers not found');
  const nodes = classes.slice(iTok + 1, iParser).map((c) => ({ ...c, group: PHASE2.test(c.name) ? 'phase2' : BRIDGE.test(c.name) ? 'bridge' : 'core' }));
  const constants = {};
  for (const m of src.matchAll(/^(VERSION|MAX_CALL_DEPTH|MAX_LOOP_RUNS|AI_TIMEOUT|TMUX_TIMEOUT|_MAX_AGENT_DEPTH)\s*=\s*([^#\n]+)/gm))
    constants[m[1]] = JSON.parse(m[2].trim().replace(/_/g, ''));
  return { file: 'assets/jesun/jesun.py', lines: src.split('\n').length, bytes: Buffer.byteLength(src), constants, nodes,
    infra: classes.filter((c, i) => i <= iTok || i >= iParser).map((c) => c.name) };
}

// ---- language toggle: assets/js/lang.js keeps its own inline EN/BN table ----
// Run the script in a sandbox with a stub DOM and read the table it publishes on window.__STRINGS.
export function buildLang() {
  const win = {};
  const doc = { addEventListener() {}, querySelectorAll: () => [], getElementById: () => null, documentElement: {} };
  vm.runInNewContext(read('assets/js/lang.js'), { window: win, document: doc, localStorage: { getItem: () => null, setItem() {} } });
  const S = win.__STRINGS;
  if (!S || !S.en || !S.bn) throw new Error('lang.js no longer exposes window.__STRINGS');
  return { file: 'assets/js/lang.js', en: { ...S.en }, bn: { ...S.bn } };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const out = path.join(ROOT, 'site/src/data');
  fs.mkdirSync(out, { recursive: true });
  const audit = buildAudit(), anatomy = buildAnatomy();
  fs.writeFileSync(path.join(out, 'audit.json'), JSON.stringify(audit, null, 1));
  fs.writeFileSync(path.join(out, 'anatomy.json'), JSON.stringify(anatomy, null, 1));
  fs.writeFileSync(path.join(out, 'lang.json'), JSON.stringify(buildLang(), null, 1));
  console.log(`extract ok: ${audit.pages.length} sitemap pages, ${anatomy.nodes.length} AST node classes, jesun.py v${anatomy.constants.VERSION}`);
}
