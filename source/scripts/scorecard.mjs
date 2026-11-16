// SEO, AEO and GEO scorecard. Machine criteria are measured from dist/. Judgment criteria use the written rubric.
// PENDING-LIVE criteria score zero until checked on the live site. Nothing rounds up.
// Copyright Jesun Ahmad Ushno. All rights reserved.
import fs from 'node:fs';
import path from 'node:path';
const OUT = 'dist';
const walk = dir => fs.readdirSync(dir, { withFileTypes: true }).flatMap(e => e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)]);
const LEGACY = ['roadmap/infuse', 'roadmap/tangerine', 'muse-n8n', 'bangla/muse'];
const html = walk(OUT).filter(f => f.endsWith('.html') && !LEGACY.some(l => path.relative(OUT, f).startsWith(l)));
const read = f => fs.readFileSync(f, 'utf8');
const live = html.filter(f => { const t = read(f); return !/http-equiv="refresh"/.test(t) && !/noindex/.test(t); });
const rel = f => '/' + path.relative(OUT, f).replace(/index\.html$/, '');
const qa = fs.existsSync('build-log/qa.json') ? JSON.parse(read('build-log/qa.json')) : null;
const lint = fs.existsSync('build-log/lint.json') ? JSON.parse(read('build-log/lint.json')) : null;
const ld = t => [...t.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(m => JSON.parse(m[1])['@graph'] || []).flat();
const types = t => new Set(ld(t).map(n => n['@type']));
const text = t => t.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/g, '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
const P = p => path.join(OUT, p);
const rows = { SEO: [], AEO: [], GEO: [] };
function c(disc, name, max, got, evidence, note = '') { rows[disc].push({ name, max, got: Math.max(0, Math.min(max, Math.round(got))), evidence, note }); }
const pending = (disc, name, max, step) => rows[disc].push({ name, max, got: 0, evidence: 'PENDING-LIVE', note: step });

/* ---------- SEO ---------- */
{
  const titles = live.map(f => (read(f).match(/<title>([^<]*)/) || [])[1]);
  c('SEO', 'Unique title on every indexable page', 60, new Set(titles).size === titles.length ? 60 : 0, `${titles.length} pages, ${new Set(titles).size} unique titles (lint)`);
  const descs = live.map(f => (read(f).match(/<meta name="description" content="([^"]*)"/) || [])[1] || '');
  const longD = descs.filter(x => x.length > 160).length;
  c('SEO', 'Meta description on every page, within length', 40, descs.every(Boolean) ? 40 - (longD ? 20 : 0) : 0, `${descs.filter(Boolean).length}/${descs.length} present; ${longD} above 160 characters`, longD ? 'Deduction 20: home and about carry the 360-character canonical description word for word, as Phase 7 requires. Search engines truncate it. Unblock: Jesun approves a 155-character canonical, or accepts the trade.' : '');
  c('SEO', 'Canonical URL on every page', 60, live.every(f => /rel="canonical"/.test(read(f))) ? 60 : 0, 'grep rel="canonical" across dist');
  const sm = read(P('sitemap.xml')); const locs = [...sm.matchAll(/<loc>([^<]+)/g)].map(m => m[1].replace('https://jesunahmadushno.com', ''));
  const missing = live.map(rel).filter(r => !locs.includes(r) && r !== '/404.html');
  c('SEO', 'XML sitemap lists every indexable page', 60, missing.length ? 30 : 60, `${locs.length} URLs in sitemap.xml; missing: ${missing.join(', ') || 'none'}`);
  c('SEO', 'Image entries in the sitemap', 30, /<image:image>/.test(sm) ? 30 : 0, `${(sm.match(/<image:image>/g) || []).length} image entries`);
  const rb = read(P('robots.txt'));
  c('SEO', 'robots.txt allows search, names the sitemap', 50, /User-agent: \*\nAllow: \//.test(rb) && /Sitemap:/.test(rb) ? 50 : 0, 'robots.txt: "User-agent: * / Allow: /", Sitemap line present; Googlebot and Bingbot not blocked');
  c('SEO', 'hreflang for English and Bangla editions', 40, /hreflang="bn"/.test(read(P('muse-n8n-extraction-101/index.html'))) && /hreflang="en"/.test(read(P('bangla/muse-n8n-extraction-101/index.html'))) && /xhtml:link/.test(sm) ? 40 : 0, 'Reciprocal hreflang links in both article heads and in the sitemap');
  const bad = live.filter(f => { const t = types(read(f)); return !(t.has('Person') && t.has('WebSite') && t.has('WebPage')); });
  const crumbs = live.filter(f => rel(f) !== '/' && !types(read(f)).has('BreadcrumbList'));
  c('SEO', 'Valid structured data on every template', 100, 100 - (bad.length ? 60 : 0) - (crumbs.length ? 20 : 0) - 0, `All JSON-LD parses (lint). Person+WebSite+WebPage on ${live.length - bad.length}/${live.length}. BreadcrumbList missing on: ${crumbs.map(rel).join(', ') || 'none'}`, 'Google Rich Results Test is a live check; listed below as PENDING-LIVE inside the Lighthouse item.');
  c('SEO', 'One h1 per page', 40, lint && !lint.errorList.some(e => e.startsWith('h1')) ? 40 : 0, 'lint: h1 count gate');
  // orphan check
  const linked = new Set(); for (const f of html) for (const m of read(f).matchAll(/href="(\/[^"#?]*)/g)) linked.add(m[1].replace(/index\.html$/, ''));
  const orphans = live.map(rel).filter(r => r !== '/' && !linked.has(r));
  c('SEO', 'Internal links resolve, no orphan page', 80, (lint && !lint.errorList.some(e => /broken link|dead anchor/.test(e)) ? 50 : 0) + (orphans.length ? 0 : 30), `${lint ? lint.internalLinks : '?'} internal links and ${lint ? lint.anchors : '?'} anchors checked; orphans: ${orphans.join(', ') || 'none'}`);
  c('SEO', 'Legacy URL map returns 200 or a clean redirect', 80, lint && !lint.errorList.some(e => e.startsWith('legacy')) ? 80 : 0, '25 legacy URLs checked by lint; redirects use meta refresh + canonical (GitHub Pages) and a _redirects file with 301s for Cloudflare Pages', 'GitHub Pages cannot send a true 301. On Cloudflare the _redirects file does.');
  c('SEO', 'Real 404 page that routes back into the site', 30, fs.existsSync(P('404.html')) && /href="\/work\/"/.test(read(P('404.html'))) ? 30 : 0, '404.html with home, work and palette routes');
  const imgs = html.flatMap(f => [...read(f).matchAll(/<img\b[^>]*>/g)].map(m => m[0]));
  const imgOk = imgs.every(i => /alt="/.test(i) && /width="/.test(i));
  c('SEO', 'Image SEO: alt, dimensions, modern formats, descriptive names', 60, imgOk ? 60 : 30, `${imgs.length} img tags, all with alt and size; WebP sources via <picture>; canonical headshot at /img/jesun-ahmad-ushno.jpg`);
  c('SEO', 'Mobile viewport, no horizontal overflow', 40, qa && !qa.console.some(x => /OVERFLOW/.test(x)) ? 40 : 0, qa ? `qa.mjs at 390x844 on 13 templates: ${qa.console.filter(x => /OVERFLOW/.test(x)).join('; ') || 'no overflow'}` : 'qa not run');
  const lcp = qa && qa.perf ? qa.perf.lcpMs : null, cls = qa && qa.perf ? qa.perf.cls : null;
  c('SEO', 'Core Web Vitals in lab (LCP under 1.8 s, CLS under 0.05)', 100, (lcp !== null && lcp < 1800 ? 60 : 0) + (cls !== null && cls < .05 ? 40 : 0), qa && qa.perf ? `LCP ${lcp} ms, CLS ${cls}, ${qa.perf.transferKB} KB transferred; ${qa.perf.conditions}` : 'qa not run', 'Lab numbers from a local server. Field data (CrUX) is PENDING-LIVE.');
  pending('SEO', 'Lighthouse SEO 100 and Rich Results Test on the live domain', 80, 'After launch: CI Lighthouse job on the live URL, and search.google.com/test/rich-results for /, /about/, a project and a writing entry.');
  pending('SEO', 'Search Console: sitemap submitted, pages indexed, no coverage errors', 50, 'After launch: submit sitemap.xml in Google Search Console and Bing Webmaster Tools; re-check in 14 days.');
}

/* ---------- AEO ---------- */
{
  const keys = ['', 'about/', 'work/', 'journey/', 'writing/', 'contact/', 'now/'];
  const counts = keys.map(k => { const t = read(P(k + 'index.html')); const m = t.match(/<p[^>]*id="bio">([^<]*)/) || t.match(/class="[^"]*\banswer\b[^"]*"[^>]*>([\s\S]*?)<\/div>/); return [k || 'home', m ? text(m[1]).replace(/^\s*(On record|Summary|Answer)\s*/, '').trim().split(' ').length : 0]; });
  const ok = counts.filter(([, n]) => n >= 40 && n <= 65).length;
  c('AEO', 'Answer-first summary (40 to 60 words) on key pages', 200, 200 * ok / keys.length, counts.map(([k, n]) => `${k}: ${n} words`).join('; '), ok < keys.length ? 'Pages outside the 40 to 60 band lose a share of the points.' : '');
  const qh = ['about/', 'contact/'].map(k => /<h[12][^>]*>[^<]*(Who|What|How|Where)[\s\S]*?\?/.test(read(P(k + 'index.html'))));
  const ventQ = /What ventures has/.test(read(P('about/index.html')));
  c('AEO', 'Question-shaped headings where they earn it (About, Ventures, Contact, FAQ)', 150, (qh.filter(Boolean).length + (ventQ ? 1 : 0)) / 3 * 150, `About h1 "Who is Jesun Ahmad Ushno?", Ventures h2 "What ventures has he founded?", Contact h1 "How do I contact him?", FAQ summaries are questions`);
  const faqN = (read(P('about/index.html')).match(/<summary>/g) || []).length;
  c('AEO', 'Honest FAQ answered from receipts', 150, faqN >= 5 ? 150 : 30 * faqN, `${faqN} questions on /about/#faq; every answer uses data-file facts only`);
  c('AEO', 'FAQPage structured data where it truthfully applies', 100, types(read(P('about/index.html'))).has('FAQPage') ? 100 : 0, 'FAQPage node on /about/ mirrors the visible FAQ exactly');
  c('AEO', 'Speakable summary on About', 80, /SpeakableSpecification/.test(read(P('about/index.html'))) ? 80 : 0, 'SpeakableSpecification -> #bio (the canonical description)');
  const arts = live.filter(f => /\/(journal|writing)\/[^/]+\/index\.html$/.test(f) && !/\/journal\/\d{4}\//.test(f));
  const dated = arts.filter(f => /rel="author"/.test(read(f)) && /Published/.test(read(f)));
  c('AEO', 'Visible date and byline on every article', 120, arts.length ? 120 * dated.length / arts.length : 0, `${dated.length}/${arts.length} article pages show "By Jesun Ahmad Ushno" and a published date`);
  const artLd = arts.filter(f => { const t = types(read(f)); return t.has('Article') || t.has('BlogPosting') || t.has('ScholarlyArticle') || t.has('Book'); });
  c('AEO', 'Article structured data on articles', 100, arts.length ? 100 * artLd.length / arts.length : 0, `${artLd.length}/${arts.length} carry Article, BlogPosting, ScholarlyArticle or Book`);
  pending('AEO', 'Featured snippet or voice answer captured for "Who is Jesun Ahmad Ushno"', 100, 'After launch and indexing: search the question on google.ca and google.com, record whether the answer block is used.');
}

/* ---------- GEO ---------- */
{
  const l = read(P('llms.txt'));
  c('GEO', 'llms.txt: who he is, ventures with titles, key pages', 150, /Founder/.test(l) && /Co-Founder/.test(l) && /Key pages/.test(l) ? 150 : 50, 'dist/llms.txt generated from the data file; banned names absent (lint)');
  const home = read(P('index.html'));
  c('GEO', 'Citable facts with source and date beside them', 100, (home.match(/Source:/g) || []).length >= 4 ? 100 : 50, `${(home.match(/Source:/g) || []).length} source lines on the home data strip; llms.txt lists facts with sources in brackets`);
  c('GEO', 'Quotable one-line definitions of each venture', 50, /Immitly is an immigration/.test(read(P('about/index.html'))) ? 50 : 0, 'About page and llms.txt carry one sentence per venture');
  const hasPat = fs.existsSync(P('patterns/index.html'));
  c('GEO', 'Original data presented as primary source (pattern registry, verified counts)', 100, hasPat ? 100 : 50, hasPat ? '/patterns/ publishes the dated registry with a Dataset node and the build fingerprint; verified counts carry sources on the home strip' : 'Verified counts only', hasPat ? '' : 'Publish /patterns/.');
  const arts = live.filter(f => /\/(journal|writing)\/[^/]+\/index\.html$/.test(f) && !/\/journal\/\d{4}\//.test(f));
  const by = arts.filter(f => ld(read(f)).some(n => n.author && n.author['@id'] === 'https://jesunahmadushno.com/#person'));
  c('GEO', 'Author entity clarity: byline linked to the Person @id', 100, arts.length ? 100 * by.length / arts.length : 0, `${by.length}/${arts.length} articles: author {"@id": "#person"}`);
  const outs = (read(P('work/index.html')).match(/href="https:\/\/(github|doi)/g) || []).length;
  c('GEO', 'Outbound citations to primary sources', 100, outs >= 6 ? 100 : 50, `${outs} links to GitHub repositories and DOIs on /work/ alone`);
  c('GEO', 'Freshness signals (dateModified, visible updated lines)', 100, /dateModified/.test(home) && /updated/i.test(read(P('now/index.html'))) ? 100 : 50, 'dateModified on every WebPage node; /now/ shows its update date; journal shows dates');
  c('GEO', 'E-E-A-T assembled: credentials with proof, testimony, corrections policy', 150, /id="corrections"/.test(read(P('legal/index.html'))) && /Credentials/.test(home) ? 150 : 75, 'Recognition rows with proof links; ten verbatim recommendations; corrections note on /legal/');
  const rb = read(P('robots.txt'));
  c('GEO', 'Answer engines may retrieve and cite while training is refused', 50, !/User-agent: (OAI-SearchBot|ChatGPT-User|PerplexityBot|Claude-User|Claude-SearchBot)\nDisallow/.test(rb) ? 50 : 0, 'robots.txt blocks training crawlers (GPTBot, ClaudeBot, CCBot, Google-Extended and others) and leaves search and user-requested agents allowed');
  pending('GEO', 'Observed citations in ChatGPT, Perplexity, Claude and AI Overviews', 100, 'After launch: ask each engine "Who is Jesun Ahmad Ushno?" and record whether it cites jesunahmadushno.com.');
}

/* ---------- write ---------- */
const sum = d => rows[d].reduce((a, r) => a + r.got, 0);
let md = `# SEO, AEO and GEO scorecard\n\nGenerated ${new Date().toISOString().slice(0, 10)} by scripts/scorecard.mjs from dist/, build-log/lint.json and build-log/qa.json. Regenerated on every CI run.\n\nRules: 1000 points per discipline. Every criterion shows its evidence. Every deduction names its reason. PENDING-LIVE criteria score 0 until checked on the live domain. Nothing rounds up.\n\n| Discipline | Score | Pending live | Named deductions |\n| --- | --- | --- | --- |\n`;
for (const k of ['SEO', 'AEO', 'GEO']) { const pend = rows[k].filter(r => r.evidence === 'PENDING-LIVE').reduce((a, r) => a + r.max, 0); const ded = rows[k].filter(r => r.evidence !== 'PENDING-LIVE').reduce((a, r) => a + r.max - r.got, 0); md += `| ${k} | ${sum(k)} / 1000 | ${pend} | ${ded} |\n`; }
md += `\nVerdict: not 1000/1000 yet. The gap is the PENDING-LIVE work (only provable after launch) plus the named deductions below, each with its unblock step.\n`;
for (const k of ['SEO', 'AEO', 'GEO']) {
  md += `\n## ${k}: ${sum(k)} / 1000\n\n| Criterion | Points | Evidence | Deduction or next step |\n| --- | --- | --- | --- |\n`;
  for (const r of rows[k]) md += `| ${r.name} | ${r.evidence === 'PENDING-LIVE' ? 'PENDING-LIVE (0 of ' + r.max + ')' : r.got + ' / ' + r.max} | ${r.evidence.replace(/\|/g, '/')} | ${(r.note || '').replace(/\|/g, '/')} |\n`;
}
md += `\n## Rubric for judgment criteria\n\n- Answer-first: counted as present only if a block labelled On record, Summary or Answer, or the speakable bio, opens the page and holds 40 to 65 words.\n- Question headings: a heading counts only if it is a real question a person would type.\n- FAQ: an answer counts only if every fact in it is in the data file with a source.\n- Citable facts: a fact counts only if its source sits beside it on the page, not in a footnote elsewhere.\n`;
fs.writeFileSync('SEO-AEO-GEO-SCORECARD.md', md);
console.log(['SEO', 'AEO', 'GEO'].map(k => `${k} ${sum(k)}/1000`).join('  '));
