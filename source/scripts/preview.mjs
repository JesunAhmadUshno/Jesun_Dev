// Review preview: the built site with root-relative URLs, so it runs from any sub-path.
// Copyright Jesun Ahmad Ushno. All rights reserved.
import fs from 'node:fs';
import path from 'node:path';
const SRC = 'dist', OUT = process.argv[2] || 'preview';
fs.rmSync(OUT, { recursive: true, force: true });
fs.cpSync(SRC, OUT, { recursive: true });
for (const junk of ['_headers', '_redirects', '.nojekyll', 'CNAME', 'trap']) fs.rmSync(path.join(OUT, junk), { recursive: true, force: true });
const walk = d => fs.readdirSync(d, { withFileTypes: true }).flatMap(e => e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]);
const fix = (u, pre) => {
  if (!u.startsWith('/') || u.startsWith('//')) return u;
  let [p, h] = u.split('#'); p = p.replace(/^\//, '');
  if (p === '' || p.endsWith('/')) p += 'index.html';
  return pre + p + (h !== undefined ? '#' + h : '');
};
for (const f of walk(OUT).filter(f => f.endsWith('.html'))) {
  const rel = path.relative(OUT, f), depth = rel.split(path.sep).length - 1, pre = '../'.repeat(depth);
  let h = fs.readFileSync(f, 'utf8');
  h = h.replace(/<meta http-equiv="Content-Security-Policy"[^>]*>/, '');
  h = h.replace(/<meta http-equiv="refresh" content="0; url=([^"]+)">/, (m, u) => `<meta http-equiv="refresh" content="0; url=${fix(u, pre)}">`);
  h = h.replace(/\b(href|src)="([^"]*)"/g, (m, a, u) => `${a}="${fix(u, pre)}"`);
  h = h.replace(/\bsrcset="([^"]*)"/g, (m, v) => `srcset="${v.split(',').map(s => { const [u, w] = s.trim().split(/\s+/); return fix(u, pre) + (w ? ' ' + w : ''); }).join(', ')}"`);
  h = h.replace(/(<head>)/i, '$1\n<script>window.__PREVIEW=1;try{localStorage.removeItem("jesun.boot")}catch(e){}</script>');
  if (rel === 'index.html') {
    h = h.replace(/<!doctype html>\s*/i, '').replace(/<html[^>]*>\s*/i, '').replace(/<\/html>\s*$/i, '').replace(/<head>/i, '').replace(/<\/head>/i, '').replace(/<body[^>]*>/i, '').replace(/<\/body>/i, '').replace(/<meta charset="utf-8">\s*/i, '').replace(/<meta name="viewport"[^>]*>\s*/i, '');
    if (!/__PREVIEW/.test(h)) h = '<script>window.__PREVIEW=1;try{localStorage.removeItem("jesun.boot")}catch(e){}</script>\n' + h;
    h = h.replace(/<title>/, '<title>').replace(/^/, '');
  }
  fs.writeFileSync(f, h);
}
for (const f of walk(OUT).filter(f => f.endsWith('.css'))) {
  const depth = path.relative(OUT, f).split(path.sep).length - 1, pre = '../'.repeat(depth);
  fs.writeFileSync(f, fs.readFileSync(f, 'utf8').replace(/url\(\/([^)]+)\)/g, `url(${pre}$1)`));
}
const files = walk(OUT);
console.log('preview files', files.length, 'bytes', files.reduce((a, f) => a + fs.statSync(f).size, 0));
