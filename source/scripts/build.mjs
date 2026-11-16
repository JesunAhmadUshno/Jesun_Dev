// Build: one data file in, a complete static site out.
// Copyright Jesun Ahmad Ushno. All rights reserved.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import * as esbuild from 'esbuild';
import { marked } from 'marked';
import sharp from 'sharp';
import { esc, icon, layout, secHead, workGrid, picture, brief, projectCard, cutout, frames } from '../src/templates/parts.mjs';
import { homeBody } from '../src/templates/home.mjs';
import { studiesPageBody, orgBlock, studiesOnly, latestShipped } from '../src/templates/studies.mjs';
import { cortexDiagram, shipDiagram } from '../src/templates/diagrams.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.join(ROOT, 'src'), OUT = path.join(ROOT, 'dist');
const d = JSON.parse(fs.readFileSync(path.join(SRC, 'data/jesun.json'), 'utf8'));
// The public GitHub record (scripts/sync-github.mjs). Missing file means an empty, honest record, not a broken build.
const REC_FILE = path.join(SRC, 'data/github-record.json');
const rec = fs.existsSync(REC_FILE) ? JSON.parse(fs.readFileSync(REC_FILE, 'utf8')) : { synced: null, ladder: ['Draft', 'Proposed', 'Functional', 'Evaluated', 'v1.0 Released'], counts: {}, totals: { studies: 0, graded: 0, planLocked: 0, dashboards: 0, products: 0 }, tracks: [], studies: [], orgs: [], judge: null };
d.record = rec;
{ const st = d.stats.find(x => x.live === 'record.studies'); if (st && rec.totals.studies) { st.value = rec.totals.studies; st.display = String(rec.totals.studies); st.date = rec.synced; } }
const TODAY = process.env.BUILD_DATE || new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Toronto' }).format(new Date());
const FP = (process.env.BUILD_FP || crypto.createHash('sha256').update(TODAY + crypto.randomBytes(16).toString('hex')).digest('hex')).slice(0, 12);
const SITE = d.site.url;
const PID = d.person.id;
const pages = []; // {path, title, desc, lastmod, images:[]}

/* ---------- helpers ---------- */
const w = (rel, html) => { const f = path.join(OUT, rel); fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, html); };
const copyDir = (a, b) => { if (fs.existsSync(a)) fs.cpSync(a, b, { recursive: true }); };
function frontMatter(txt) {
  const m = txt.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/); if (!m) return { meta: {}, body: txt };
  const meta = {};
  for (const line of m[1].split('\n')) {
    const k = line.match(/^(\w+):\s*(.*)$/); if (!k) continue;
    let v = k[2].trim();
    if (v.startsWith('[') && v.endsWith(']')) v = v.slice(1, -1).split(',').map(s => s.trim()).filter(Boolean);
    else if (v === 'true' || v === 'false') v = v === 'true';
    meta[k[1]] = v;
  }
  return { meta, body: m[2] };
}
function readContent(dir) {
  const p = path.join(SRC, 'content', dir); if (!fs.existsSync(p)) return [];
  return fs.readdirSync(p).filter(f => f.endsWith('.md') && !f.startsWith('_')).map(f => {
    const { meta, body } = frontMatter(fs.readFileSync(path.join(p, f), 'utf8'));
    const slug = f.replace(/\.md$/, '').replace(/^\d{4}-\d{2}(-\d{2})?-/, '');
    return { ...meta, slug, html: marked.parse(body), words: body.split(/\s+/).length };
  }).filter(x => !x.draft).sort((a, b) => String(b.date).localeCompare(String(a.date)));
}
const fmtDate = s => { if (!s || s === 'Now') return s; const [y, m, dd] = String(s).split('-'); const M = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']; return dd ? `${+dd} ${M[+m - 1]} ${y}` : m ? `${M[+m - 1]} ${y}` : y; };

/* ---------- structured data: one Person node, everywhere ---------- */
const sameAs = d.profiles.filter(p => p.verified).map(p => p.url);
const orgNodes = d.ventures.map(v => ({ '@type': 'Organization', '@id': `${SITE}/#org-${v.slug}`, name: v.name, description: v.line, founder: { '@id': PID }, ...(v.url ? { url: v.url } : {}), ...(v.org ? { sameAs: [v.org] } : {}) }));
const personNode = {
  '@type': 'Person', '@id': PID, name: d.person.name, alternateName: d.person.alternateName, givenName: d.person.givenName,
  url: SITE + '/', image: SITE + d.person.image, jobTitle: d.person.jobTitle, description: d.description,
  address: { '@type': 'PostalAddress', addressLocality: d.person.address.locality, addressRegion: d.person.address.region, addressCountry: d.person.address.country },
  alumniOf: d.person.alumniOf.map(a => ({ '@type': 'CollegeOrUniversity', name: a.name, url: a.url })),
  knowsAbout: d.person.knowsAbout, sameAs, email: 'mailto:' + d.site.email,
  hasCredential: [{ '@type': 'EducationalOccupationalCredential', name: 'MSc Data Analytics, Graduated With Distinction', credentialCategory: 'degree', recognizedBy: { '@type': 'CollegeOrUniversity', name: 'University of Niagara Falls Canada' }, dateCreated: '2026-06-21' }]
};
const websiteNode = { '@type': 'WebSite', '@id': SITE + '/#website', url: SITE + '/', name: 'Jesun Ahmad Ushno', inLanguage: 'en', publisher: { '@id': PID }, about: { '@id': PID } };
function graph(pagePath, title, extra = [], crumbs = null) {
  const pg = { '@type': 'WebPage', '@id': SITE + pagePath + '#page', url: SITE + pagePath, name: title, isPartOf: { '@id': SITE + '/#website' }, about: { '@id': PID }, inLanguage: 'en', dateModified: TODAY };
  const nodes = [websiteNode, personNode, ...orgNodes, pg, ...extra];
  if (crumbs) nodes.push({ '@type': 'BreadcrumbList', itemListElement: crumbs.map(([n, u], i) => ({ '@type': 'ListItem', position: i + 1, name: n, item: SITE + u })) });
  return { '@context': 'https://schema.org', '@graph': nodes };
}
function page(p, { title, desc, body: rawBody, extra = [], crumbs, type, bodyAttrs, head, noindex, images = [], og, hreflang, lastmod, css, script, chrome }) {
  const body = /<h1\b/.test(rawBody) ? rawBody : rawBody.replace(/<h2 class="h2"([^>]*)>([\s\S]*?)<\/h2>/, '<h1 class="h2"$1>$2</h1>');
  const fullTitle = p === '/' ? title : `${title} | Jesun Ahmad Ushno`;
  const ogImage = og || `/og/${p === '/' ? 'home' : p.replace(/^\/|\/$/g, '').replace(/[\/.]/g, '-')}.png`;
  const html = layout({ d, path: p, title: fullTitle, desc, body, fp: FP, jsonld: graph(p, fullTitle, extra, crumbs), ogImage, type, bodyAttrs, head, noindex, hreflang, ...(css ? { css } : {}), ...(script ? { script } : {}), ...(chrome === false ? { chrome: false } : {}) });
  const file = p.endsWith('/') ? p + 'index.html' : p;
  w(file, html);
  if (!noindex) pages.push({ path: p, title, desc, lastmod: lastmod || TODAY, images, og: ogImage, ogTitle: title });
}
const answer = (label, text) => `<div class="answer"><span class="label">${label}</span>${esc(text)}</div>`;
const statSource = s => `${esc(s.source)}${s.date && !String(s.source).includes(s.date) ? ", " + esc(s.date) : ""}`;

/* ---------- clean ---------- */
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

/* ---------- HOME: the Agent Portfolio ---------- */
page('/', { title: 'Jesun Ahmad Ushno, software engineer and founder in Toronto', desc: d.description, body: homeBody(d, FP), chrome: false, css: '/css/home.css', script: '/js/home.js', images: ['/img/jesun-ahmad-ushno.jpg', '/img/portrait-cutout-820.webp'], og: '/og/home.png' });
function directory() {
  const prof = d.profiles.filter(p => p.verified).map(p => `<a href="${esc(p.url)}" target="_blank" rel="me noopener"><span>${esc(p.name)}</span>${esc(p.handle)} ${icon.out}</a>`).join('');
  return `<div><span>Email</span><span style="font:inherit;letter-spacing:0;text-transform:none;color:var(--paper)">${esc(d.site.email)} <button class="copy" type="button" data-copy="${esc(d.site.email)}">Copy</button></span></div>${prof}<div><span>Based in</span>Toronto, Ontario, Canada</div>`;
}

/* ---------- STUDIES ---------- */
if (rec.studies.length) {
  const st = studiesOnly(rec);
  page('/studies/', { title: `Studies, ${rec.totals.studies} under one standard`, desc: `${rec.totals.studies} public studies by Jesun Ahmad Ushno, each graded on a five-rung verdict ladder, plus judge the judge: thirty cases where you check an automated judge.`, body: studiesPageBody(d, rec, { secHead, answer }), crumbs: [['Home', '/'], ['Studies', '/studies/']], lastmod: rec.synced,
    extra: [{ '@type': 'ItemList', name: 'Studies by Jesun Ahmad Ushno', numberOfItems: st.length, itemListElement: st.map((x, i) => ({ '@type': 'ListItem', position: i + 1, item: { '@type': 'SoftwareSourceCode', name: x.repo, codeRepository: x.url, description: x.question || x.summary || undefined, author: { '@id': PID }, ...(x.dashboard ? { url: x.dashboard } : {}) } })) }] });
}

/* ---------- WORK ---------- */
{
  const ventures = d.ventures.map(v => `<div class="venture"><span class="label sig">${esc(v.title)}</span><h3 class="h3">${esc(v.name)}</h3><p>${esc(v.what)}</p></div>`).join('');
  const body = `<section class="sec" style="border-top:0"><div class="wrap">
${secHead({ label: 'Work / the full record', title: 'Projects, papers <em>and ventures.</em>' })}
${answer('Summary', `Jesun Ahmad Ushno has ${d.projects.length} records here: agent systems, privacy-first data tools, audio ML, a drawing-measurement research build, and two published methods. Each record links to its repository, live system or paper. His ventures, Immitly, Brimwood Innovation and Climeam, are listed below with his titles.`)}
${workGrid(d.projects)}
${rec.studies.length ? `<div class="ship-wrap" id="latest"><h3>Latest shipped</h3><p class="ship-sub">The twelve most recently updated public repositories, synced from GitHub on ${esc(fmtDate(rec.synced))}.</p>${latestShipped(rec, 12)}<p class="src" style="margin-top:16px"><a href="/studies/">All ${rec.totals.studies} studies</a></p></div>` : ''}
</div></section>
<section class="sec" id="ventures"><div class="wrap">${secHead({ label: 'Ventures', title: 'Offices <em>held.</em>' })}${orgBlock(d, rec)}</div></section>`;
  page('/work/', { title: 'Work, projects and ventures', desc: `Work by Jesun Ahmad Ushno: ${d.projects.slice(0, 4).map(p => p.name).join(', ')} and more, two ML papers, and his ventures with his titles.`, body, crumbs: [['Home', '/'], ['Work', '/work/']], extra: [{ '@type': 'ItemList', itemListElement: d.projects.map((p, i) => ({ '@type': 'ListItem', position: i + 1, url: `${SITE}/projects/${p.slug}.html`, name: p.name })) }] });
}

/* ---------- PROJECT PAGES (old URLs stay canonical) ---------- */
for (const p of d.projects) {
  const rel = d.projects.filter(x => x.cat === p.cat && x.slug !== p.slug).slice(0, 3);
  const proof = [['Repository', p.repo], ['Live system', p.demo], ['Paper', p.paper]].filter(x => x[1]).map(([t, u]) => `<a href="${esc(u)}"${u.startsWith('http') ? ' target="_blank" rel="noopener"' : ''}><span>${t}</span>${esc(u.replace(/^https?:\/\//, ''))} ${icon.out}</a>`).join('');
  const body = `<section class="sec" style="border-top:0"><div class="wrap">
<p class="label"><a href="/work/">Work</a> / ${esc(p.catLabel)}</p>
<h1 class="h1" style="margin:16px 0 28px">${esc(p.name)}<em style="font-style:normal;color:var(--signal)">.</em></h1>
<div class="contact-grid">
<div style="display:grid;gap:22px">${answer('In one paragraph', p.summary)}<p class="lede">${esc(p.body)}</p><div class="chips">${p.stack.map(s => `<span class="chip">${esc(s)}</span>`).join('')}</div><p class="src">Source: ${esc(p.source)}</p></div>
<div><div class="dir">${proof || '<div><span>Proof</span>Repository link on request</div>'}</div></div>
</div></div></section>
${rel.length ? `<section class="sec"><div class="wrap">${secHead({ label: 'Related records', title: 'Same <em>discipline.</em>' })}<div class="grid">${rel.map(r => projectCard(r)).join('')}</div></div></section>` : ''}`;
  const sw = { '@type': 'SoftwareSourceCode', name: p.name, description: p.summary, author: { '@id': PID }, ...(p.repo ? { codeRepository: p.repo } : {}), ...(p.demo && p.demo.startsWith('http') ? { url: p.demo } : {}) };
  page(`/projects/${p.slug}.html`, { title: `${p.name}, ${p.catLabel}`, desc: p.summary, body, crumbs: [['Home', '/'], ['Work', '/work/'], [p.name, `/projects/${p.slug}.html`]], extra: [sw] });
}

/* ---------- LAB ---------- */
{
  const seats = d.fleet.departments.map(dep => `<div class="dept"><h3>${esc(dep.name)} / ${dep.seats.length}</h3><div class="dept-grid">${dep.seats.map(([n, name, role]) => `<div class="seat"><span class="glyph" aria-hidden="true">${String(n).padStart(2, '0')}</span><div><b>${esc(name)}</b><span>${esc(role)}</span></div></div>`).join('')}</div></div>`).join('');
  const total = d.fleet.departments.reduce((a, b) => a + b.seats.length, 0);
  const body = `<div data-lab>
<section class="sec" style="border-top:0"><div class="wrap">
${secHead({ label: 'Lab / interactive systems, client-side', title: 'The <em>Lab.</em>', side: 'Everything on this page runs in your browser. No API keys. No servers. The only data it reads is the site\'s own record.' })}
<div class="lab-grid">
<div class="panel" id="terminal"><div class="panel-h"><span class="label"><b>jesun shell</b> / type help</span><span class="label">local</span></div>
<div style="display:grid;grid-template-rows:1fr auto"><div class="term" id="term-out" role="log" aria-live="polite" aria-label="Terminal output"></div><label class="term-in"><span aria-hidden="true">&gt;</span><span class="sr">Terminal command</span><input id="term-in" autocomplete="off" spellcheck="false" autocapitalize="off"></label></div></div>
<div class="panel" id="twin"><div class="twin">
<div class="twin-face"><img src="/img/avatar-head-96.webp" alt="Jesun's 3D avatar, the face of the twin" width="56" height="56"><div><b>The twin</b><p class="label" style="margin:2px 0 0">Rule-based, answers from the data file. Not a live model.</p></div></div>
<div class="twin-log" id="twin-log" role="log" aria-live="polite" aria-label="Twin conversation"></div>
<div class="twin-chips">${['What ventures does he run?', 'What did he publish?', 'What is his stack?', 'Tell me about KPMG', 'How do I contact him?'].map(q => `<button class="chip" type="button" data-ask="${esc(q)}">${esc(q)}</button>`).join('')}</div>
<form class="twin-form" id="twin-form"><label class="sr" for="twin-q">Ask the twin</label><input id="twin-q" placeholder="Ask about the record..." autocomplete="off"><button type="submit">Ask</button></form>
</div></div>
</div></div></section>

<section class="sec" id="cortex"><div class="wrap">
${secHead({ label: 'Cortex / the site agent', title: 'How the agent <em>answers.</em>', side: 'Press / on any page to talk to it. Every answer is built from this site, with sources.' })}
<div class="syn"><canvas id="synaptic" role="img" aria-label="Synaptic weather: a living field that storms when Cortex thinks. Click it to send a pulse."></canvas><span class="syn-tag">SYNAPTIC WEATHER / storms when Cortex thinks / click to pulse</span></div>
<figure class="dgm-fig">${cortexDiagram()}<figcaption class="src">The retriever always runs in your browser, so Cortex works with no server. When the site's server has the free model switched on, it writes the answer from the same passages and is capped at 600 answers a day.</figcaption></figure>
<p style="margin-top:18px"><button class="btn" type="button" data-cortex-open>Talk to Cortex</button></p>
</div></section>

<section class="sec" id="wall"><div class="wrap">
${secHead({ label: 'Systems wall / four live demos', title: 'His methods, <em>runnable.</em>', side: 'Two are his published papers. Two are the principles behind his products. Each states what it is and what it is not.' })}
<div class="wall">
<div class="panel demo" id="wavelet"><div class="panel-h"><span class="label"><b>Wavelet defect detection</b> / paper 2023</span><a class="label" href="/writing/fabric-defect-detection-wavelet-neural-network/">Paper</a></div><div class="panel-b">
<div class="ba" data-ba data-start="50" style="aspect-ratio:16/10"><canvas id="wv-raw" aria-label="Raw fabric texture sample" role="img"></canvas><canvas class="after" id="wv-det" aria-label="Wavelet detection map" role="img"></canvas><span class="tag l label">Raw</span><span class="tag r label">Detected</span><span class="line" aria-hidden="true"></span><button class="handle" type="button" role="slider" aria-label="Compare raw texture and detection" aria-valuemin="0" aria-valuemax="100" aria-valuenow="50">${icon.grip}</button></div>
<div class="ctrl"><label class="sr" for="wv-kind">Defect type</label><select class="sel" id="wv-kind"><option value="hole">Hole</option><option value="slub">Slub (thick yarn)</option><option value="stain">Stain</option><option value="none">No defect</option></select><button class="btn ghost" type="button" id="wv-new">New sample</button></div>
<p class="readout" id="wv-out" aria-live="polite"></p><p class="src">A synthetic woven texture, generated in the browser. The wavelet step of the method only: a 3-level Haar transform averages out the weave, then blocks that deviate from the fabric are flagged. The paper adds a neural network classifier.</p></div></div>

<div class="panel demo" id="pso"><div class="panel-h"><span class="label"><b>Elitist PSO</b> / paper 2023</span><a class="label" href="/writing/elitist-pso-mutation-adaptive-inertia/">Paper</a></div><div class="panel-b">
<canvas id="pso-c" role="img" aria-label="Particle swarm searching the Rastrigin function"></canvas>
<div class="ctrl"><label class="sr" for="pso-mode">Optimizer</label><select class="sel" id="pso-mode"><option value="elitist">Elitist, mutation, adaptive inertia</option><option value="standard">Standard PSO</option></select><button class="btn ghost" type="button" id="pso-run">Run 120 iterations</button></div>
<p class="readout" id="pso-out" aria-live="polite"></p><p class="src">30 particles on the 2D Rastrigin function, a standard test with many local minima. Same seed for both modes, so you can compare them.</p></div></div>

<div class="panel demo" id="fleet-demo"><div class="panel-h"><span class="label"><b>Fleet routing</b> / how he runs agents</span><a class="label" href="#system">Seats</a></div><div class="panel-b">
<canvas id="fleet-c" role="img" aria-label="Tasks routed to agent seats by department"></canvas>
<div class="ctrl"><label class="label" for="fleet-load">Load</label><input id="fleet-load" type="range" min="5" max="60" value="22"><span class="label" id="fleet-load-v">22%</span><button class="btn ghost" type="button" id="fleet-run">Restart</button></div>
<p class="readout" id="fleet-out" aria-live="polite"></p><p class="src">A simulation of the routing idea: each task goes to an idle seat with the matching job. Seat names come from his fleet. Numbers are simulated, not production metrics.</p></div></div>

<div class="panel demo" id="csv"><div class="panel-h"><span class="label"><b>Local analysis</b> / the PRISM principle</span><a class="label" href="/projects/prism.html">PRISM</a></div><div class="panel-b">
<label class="sr" for="csv-in">CSV data</label><textarea id="csv-in" spellcheck="false">region,month,orders,returns
Ontario,2026-07,1240,31
Ontario,2026-08,1315,28
Quebec,2026-07,860,19
Quebec,2026-08,,22
British Columbia,2026-07,1102,40
British Columbia,2026-08,1178,35</textarea>
<div class="ctrl"><button class="btn ghost" type="button" id="csv-run">Analyse locally</button><label class="btn ghost" style="cursor:pointer">Open a CSV file<input id="csv-file" type="file" accept=".csv,text/csv" class="sr"></label></div>
<p class="readout" id="csv-net" aria-live="polite"></p><div id="csv-out"></div><p class="src">Sample rows are invented for the demo. Your own file is read with FileReader and never uploaded.</p></div></div>
</div></div></section>

<section class="sec" id="system"><div class="wrap">
${secHead({ label: `The System / ${total + 1} seats`, title: 'The fleet, <em>as software.</em>', side: 'He runs his work through named AI seats with jobs, organised like a company. These are software roles, not people. One human seat: the foreman.' })}
<div class="seats"><div class="dept"><h3>Foreman / 1</h3><div class="dept-grid"><div class="seat foreman"><span class="glyph"><img src="/img/avatar-head-96.webp" alt="" width="34" height="34"></span><div><b>Jesun</b><span>Foreman, the only human seat</span></div></div></div></div>${seats}</div>
<p class="src" style="margin-top:20px">Source: ${esc(d.fleet.source)}. Status dots show seat configuration, not live uptime.</p>
</div></section>

<section class="sec" id="arcade"><span id="chess" class="anchor" aria-hidden="true"></span><div class="wrap" data-arcade>
${secHead({ label: 'Arcade / four engines', title: 'Challenge <em>the machine.</em>', side: 'Pick a game. Every engine is written for this site and runs in your browser. Scores stay in this browser only.' })}
<div class="gtabs" role="tablist" aria-label="Choose a game"><button type="button" role="tab" id="tab-chess" aria-controls="panel-chess" data-game="chess" aria-selected="false" tabindex="-1" class="gtab gtab-chess"><span class="gt-n">Chess</span><span class="gt-d">Alpha-beta search, two or three plies. Full legal rules.</span><span class="gt-l">Hard</span></button><button type="button" role="tab" id="tab-c4" aria-controls="panel-c4" data-game="c4" aria-selected="false" tabindex="-1" class="gtab gtab-c4"><span class="gt-n">Connect Four</span><span class="gt-d">Alpha-beta to depth 2, 4 or 6. It blocks threats and builds its own.</span><span class="gt-l">Pick a level</span></button><button type="button" role="tab" id="tab-ttt" aria-controls="panel-ttt" data-game="ttt" aria-selected="false" tabindex="-1" class="gtab gtab-ttt"><span class="gt-n">Tic-tac-toe</span><span class="gt-d">Perfect minimax. It cannot lose. A draw is a win for you.</span><span class="gt-l">Unbeatable</span></button><button type="button" role="tab" id="tab-rps" aria-controls="panel-rps" data-game="rps" aria-selected="false" tabindex="-1" class="gtab gtab-rps"><span class="gt-n">Mind reader</span><span class="gt-d">Rock, paper, scissors against a model that learns your habits as you play.</span><span class="gt-l">Learns you</span></button></div>
<div class="gpanel" role="tabpanel" id="panel-chess" aria-labelledby="tab-chess" data-game="chess"><div class="chess-wrap"><div class="board" id="board" role="group" aria-label="Chess board"></div>
<div class="chess-side"><p class="chess-status" id="chess-status" aria-live="polite"></p>
<div class="ctrl" style="display:flex;flex-wrap:wrap;gap:8px"><button class="btn ghost" type="button" id="chess-new">New game</button><button class="btn ghost" type="button" id="chess-undo">Undo</button><button class="btn ghost" type="button" id="chess-flip">Flip</button></div>
<div style="display:flex;flex-wrap:wrap;gap:12px"><label class="field"><span class="label">Play as</span><select class="sel" id="chess-side"><option value="w">White</option><option value="b">Black</option><option value="both">Both sides</option></select></label><label class="field"><span class="label">Engine depth</span><select class="sel" id="chess-depth"><option value="2">2 plies, casual</option><option value="3">3 plies, sharp</option></select></label></div>
<div><p class="label">Moves</p><div class="moves" id="chess-moves" aria-live="polite"></div></div></div></div></div>
<div class="gpanel" role="tabpanel" id="panel-c4" aria-labelledby="tab-c4" data-game="c4" hidden><div id="c4" class="gwrap"><div class="c4-board" role="group" aria-label="Connect Four board, seven columns"></div><div class="gside"><p class="gstatus" data-status aria-live="polite"></p><div class="gctrl"><button class="btn ghost" type="button" data-new>New game</button><button class="btn ghost" type="button" data-auto>Watch two agents play</button><label class="field"><span class="label">Level</span><select class="sel" data-level><option value="2">Easy, looks 2 moves ahead</option><option value="4" selected>Sharp, 4 moves</option><option value="6">Hard, 6 moves</option></select></label></div><p class="label" data-score="c4"></p><p class="src">You are red and move first. Click a column to drop a disc.</p></div></div></div>
<div class="gpanel" role="tabpanel" id="panel-ttt" aria-labelledby="tab-ttt" data-game="ttt" hidden><div id="ttt" class="gwrap"><div class="ttt-board" role="group" aria-label="Tic-tac-toe board"></div><div class="gside"><p class="gstatus" data-status aria-live="polite"></p><div class="gctrl"><button class="btn ghost" type="button" data-new>New game</button><label class="field"><span class="label">First move</span><select class="sel" data-first><option value="you">You start</option><option value="machine">Machine starts</option></select></label></div><p class="label" data-score="ttt"></p><p class="src">The engine searches every possible game and remembers each position it has solved.</p></div></div></div>
<div class="gpanel" role="tabpanel" id="panel-rps" aria-labelledby="tab-rps" data-game="rps" hidden><div id="rps" class="gwrap"><div class="rps-main"><div class="rps-throws" role="group" aria-label="Your throw"><button class="rps-b" type="button" data-throw="rock"><span aria-hidden="true">&#9994;</span>Rock <kbd>R</kbd></button><button class="rps-b" type="button" data-throw="paper"><span aria-hidden="true">&#9995;</span>Paper <kbd>P</kbd></button><button class="rps-b" type="button" data-throw="scissors"><span aria-hidden="true">&#9996;&#65039;</span>Scissors <kbd>S</kbd></button></div><p class="rps-hist" data-hist aria-label="Your recent throws"></p></div><div class="gside"><p class="gstatus" data-status aria-live="polite">Throw something. The machine predicts before it sees your move.</p><div><p class="label">What it expects next</p><div class="rps-bars" data-bars></div></div><p class="src" data-conf></p><div class="gctrl"><button class="btn ghost" type="button" data-new>Reset the model</button></div><p class="label" data-score="rps"></p></div></div></div>
</div></section>
</div>`;
  page('/lab/', { title: 'Lab: terminal, twin, live demos and an arcade', desc: 'A terminal, a rule-based twin, live versions of his two published ML methods, his agent fleet seat map and four game engines to challenge. All client-side.', body, crumbs: [['Home', '/'], ['Lab', '/lab/']] });
}

/* ---------- JOURNEY ---------- */
{
  const ch = d.journey.map(j => `<article class="chapter" id="${j.id}"><span class="yr">${esc(j.year)}</span><div><p class="label">${esc(j.dates)} / ${esc(j.place)}</p><h2>${esc(j.title)}</h2><p class="org">${esc(j.org)}</p><p class="muted">${esc(j.text)}</p>${j.count ? `<p class="jcount num reveal" data-count="${j.count}" data-suffix="${j.countSuffix || (j.count >= 1000 ? '+' : '')}"><span data-v>${j.count.toLocaleString('en-US')}${j.countSuffix || (j.count >= 1000 ? '+' : '')}</span><small>${esc(j.countLabel)}</small></p>` : ''}<p class="src">Source: ${esc(j.source)}</p></div><div>${j.photo ? `<figure class="exhibit protect" data-signature>${cutout('graduation-cutout', 'Jesun Ahmad Ushno holding his University of Niagara Falls Canada folder in graduation regalia', 820, 1167, '340px')}<figcaption class="src">Exhibit / UNF graduation, 2026</figcaption></figure>` : ''}</div></article>`).join('');
  const body = `<section class="sec" style="border-top:0"><div class="wrap">
${secHead({ label: 'Journey / Dhaka to Toronto', title: 'The record, <em>in order.</em>' })}
${answer('Summary', 'Jesun Ahmad Ushno studied computer engineering at AIUB in Dhaka (2018 to 2023), co-founded the MIAS Foundation, published two ML papers, and worked in IT Advisory at KPMG Bangladesh. He moved to Canada in 2025, earned an MSc in Data Analytics with Distinction in 2026, and now runs three ventures in Toronto.')}
<div class="chapters">${ch}</div>
${frames([
  { name: 'cap-toss', widths: [480, 498], w: 498, h: 660, alt: 'Jesun Ahmad Ushno throwing his graduation cap on campus', cap: 'MSc conferred, with Distinction', tag: 'Toronto / 2026' },
  { name: 'grad-golden', widths: [480, 498], w: 498, h: 660, alt: 'Jesun Ahmad Ushno in cap and gown at golden hour', cap: 'University of Niagara Falls Canada', tag: 'Data Analytics / CGPA 3.9154' },
  { name: 'walking-dusk', widths: [480, 760], w: 760, h: 1140, alt: 'Jesun Ahmad Ushno on a Toronto street at dusk', cap: 'Toronto, where the ventures run', tag: 'Immitly / Brimwood / Climeam' }
])}
<p class="label" style="margin-top:24px">Earlier roles: ${esc(d.earlierRoles.join(', '))}. Community: ${esc(d.community.map(c => c.title + ', ' + c.org + ', ' + c.dates).join('; '))}.</p>
</div></section>`;
  page('/journey/', { title: 'Journey, Dhaka to Toronto', desc: 'The record of Jesun Ahmad Ushno from AIUB and KPMG Bangladesh to an MSc with Distinction in Canada and three ventures in Toronto.', body, crumbs: [['Home', '/'], ['Journey', '/journey/']], images: ['/img/graduation-cutout-820.webp'] });
}

/* ---------- ABOUT (canonical bio, FAQ, all testimony) ---------- */
{
  const faq = d.faq.map(f => `<details><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`).join('');
  const quotes = d.recommendations.map(r => `<figure class="quote"><blockquote>${esc(r.quote)}</blockquote><figcaption><b>${esc(r.name)}</b><span>${esc(r.role)}</span><span class="src">${esc(r.relation)}. LinkedIn, ${esc(fmtDate(r.date))}.</span></figcaption></figure>`).join('');
  const body = `<section class="sec" style="border-top:0"><div class="wrap contact-grid">
<div style="display:grid;gap:24px;align-content:start">
<p class="label">About / the canonical record</p>
<h1 class="h2">Who is <em>Jesun Ahmad Ushno?</em></h1>
<p class="lede speakable" id="bio">${esc(d.description)}</p>
<p class="src">This paragraph is the single approved description. It is used word for word in this page's structured data, meta description and social cards.</p>
${frames([
  { name: 'toronto-front', widths: [480, 760], w: 760, h: 1140, alt: 'Portrait of Jesun Ahmad Ushno with the Toronto skyline behind him', cap: 'Jesun Ahmad Ushno', tag: 'Toronto, Ontario' },
  { name: 'cafe-terrace', widths: [480, 498], w: 498, h: 332, alt: 'Jesun Ahmad Ushno at a cafe terrace above the Toronto skyline', cap: 'Where the briefs get read', tag: 'Mornings / Toronto' }
], { cls: 'frames-2' })}
</div>
<div class="protect cut" data-signature>${cutout('sweater-cutout', 'Jesun Ahmad Ushno in a cream cable-knit sweater holding a coffee cup', 820, 991, '(max-width: 900px) 90vw, 460px')}</div>
</div></section>
<section class="sec" id="ventures"><div class="wrap">${secHead({ label: 'Ventures', title: 'What ventures has <em>he founded?</em>' })}
<div class="ventures">${d.ventures.map(v => `<div class="venture"><span class="label sig">${esc(v.title)}</span><h3 class="h3">${esc(v.name)}</h3><p>${esc(v.line)}</p></div>`).join('')}</div></div></section>
<section class="sec" id="faq"><div class="wrap">${secHead({ label: 'FAQ / answered from the record', title: 'Questions people <em>ask.</em>' })}<div class="faq">${faq}</div></div></section>
<section class="sec" id="testimony"><div class="wrap">${secHead({ label: 'Testimony / ten recommendations, verbatim', title: 'In their <em>words.</em>', side: 'Copied word for word from the LinkedIn recommendations Jesun received from KPMG colleagues.' })}<div class="quotes">${quotes}</div></div></section>`;
  const faqNode = { '@type': 'FAQPage', mainEntity: d.faq.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) };
  const prof = { '@type': 'ProfilePage', '@id': SITE + '/about/#profile', mainEntity: { '@id': PID }, speakable: { '@type': 'SpeakableSpecification', cssSelector: ['#bio'] } };
  page('/about/', { title: 'About Jesun Ahmad Ushno', desc: d.description, body, crumbs: [['Home', '/'], ['About', '/about/']], extra: [faqNode, prof], type: 'profile', images: ['/img/sweater-cutout-820.webp'] });
}

/* ---------- WRITING (posts + back catalogue) ---------- */
const posts = readContent('writing');
const journal = readContent('journal');
{
  const cat = d.publications.map(p => `<a href="/writing/${p.slug}/"><span class="label">${esc(fmtDate(p.date))}</span><div><h3>${esc(p.title)}</h3><p>${esc(p.venue)}. ${esc(p.summary)}</p></div><span class="label">${esc(p.type === 'ScholarlyArticle' ? 'Paper' : p.type)}</span></a>`).join('');
  const list = posts.map(p => `<a href="/writing/${p.slug}/"><span class="label">${esc(fmtDate(p.date))}</span><div><h3>${esc(p.title)}</h3><p>${esc(p.description)}</p></div><span class="label">Essay</span></a>`).join('');
  const body = `<section class="sec" style="border-top:0"><div class="wrap">
${secHead({ label: 'Writing / canonical home', title: 'Essays, papers <em>and a book.</em>', side: 'New essays publish here first. Copies on other platforms point back to this site.' })}
${answer('Summary', 'Jesun Ahmad Ushno has published two machine learning papers in AIP Conference Proceedings (2023), a book on data analytics (2025) and essays on Medium. Each has an entry here with its source. New essays are published on this site first and syndicated with a canonical link back.')}
${list ? `<h2 class="label" style="margin:32px 0 12px">Essays</h2><div class="list">${list}</div>` : ''}
<h2 class="label" style="margin:32px 0 12px">Back catalogue</h2><div class="list">${cat}</div>
<p style="margin-top:28px"><a class="arrow-link" href="/writing/feed.xml">RSS feed ${icon.arrow}</a></p>
</div></section>`;
  page('/writing/', { title: 'Writing: essays, papers and a book', desc: 'Essays, two AIP Conference Proceedings papers and a book on data analytics by Jesun Ahmad Ushno, each with sources and links.', body, crumbs: [['Home', '/'], ['Writing', '/writing/']] });
  for (const p of d.publications) {
    const cw = { '@type': p.type, '@id': `${SITE}/writing/${p.slug}/#work`, name: p.title, headline: p.title, author: { '@id': PID }, datePublished: p.date, inLanguage: 'en', ...(p.url ? { url: p.url } : {}), ...(p.doi ? { identifier: { '@type': 'PropertyValue', propertyID: 'DOI', value: p.doi }, isPartOf: { '@type': 'Periodical', name: p.venue } } : {}), ...(p.type === 'Book' ? { bookFormat: 'https://schema.org/EBook' } : {}) };
    const body = `<section class="sec" style="border-top:0"><div class="wrap"><article class="article">
<p class="label"><a href="/writing/">Writing</a> / ${esc(p.type === 'ScholarlyArticle' ? 'Paper' : p.type)}</p>
<h1>${esc(p.title)}</h1>
<div class="meta"><span class="label">By <a href="/about/" rel="author">Jesun Ahmad Ushno</a></span><span class="label">${esc(p.venue)}</span><span class="label">Published ${esc(fmtDate(p.date))}</span>${p.doi ? `<span class="label">DOI ${esc(p.doi)}</span>` : ''}</div>
${answer('Summary', p.summary)}
<div class="dir">${p.url ? `<a href="${esc(p.url)}" target="_blank" rel="noopener"><span>Primary source</span>${esc(p.url.replace(/^https?:\/\//, ''))} ${icon.out}</a>` : '<div><span>Primary source</span>No public listing link on record yet</div>'}<div><span>Record status</span>${esc(p.status)}</div></div>
${p.slug.includes('wavelet') ? '<p style="margin-top:24px"><a class="arrow-link" href="/lab/#wavelet">Run the wavelet step live ' + icon.arrow + '</a></p>' : ''}${p.slug.includes('pso') ? '<p style="margin-top:24px"><a class="arrow-link" href="/lab/#pso">Run the optimizer live ' + icon.arrow + '</a></p>' : ''}
</article></div></section>`;
    page(`/writing/${p.slug}/`, { title: p.title.length > 50 ? p.title.slice(0, 47).replace(/\s+\S*$/, '') + '...' : p.title, desc: p.summary, body, type: 'article', crumbs: [['Home', '/'], ['Writing', '/writing/'], [p.title, `/writing/${p.slug}/`]], extra: [cw] });
  }
  for (const p of posts) articlePage('writing', p);
}
function articlePage(kind, p) {
  const url = `/${kind}/${p.slug}/`;
  const art = { '@type': kind === 'journal' ? 'BlogPosting' : 'Article', '@id': SITE + url + '#article', headline: p.title, description: p.description, datePublished: p.date, dateModified: p.updated || p.date, author: { '@id': PID }, publisher: { '@id': PID }, mainEntityOfPage: SITE + url, inLanguage: 'en', keywords: (p.tags || []).join(', ') };
  const related = (kind === 'journal' ? journal : posts).filter(x => x.slug !== p.slug && (x.tags || []).some(t => (p.tags || []).includes(t))).slice(0, 3);
  const body = `<section class="sec" style="border-top:0"><div class="wrap"><article class="article" data-article>
<p class="label"><a href="/${kind}/">${kind === 'journal' ? 'Journal' : 'Writing'}</a> / ${esc((p.tags || []).join(', '))}</p>
<h1>${esc(p.title)}</h1>
<div class="meta"><span class="label">By <a href="/about/" rel="author">Jesun Ahmad Ushno</a></span><span class="label">Published <time datetime="${esc(p.date)}">${esc(p.dateLabel || fmtDate(p.date))}</time></span>${p.updated ? `<span class="label">Updated <time datetime="${esc(p.updated)}">${esc(fmtDate(p.updated))}</time></span>` : ''}<span class="label">${Math.max(1, Math.round(p.words / 220))} min read</span><button class="copy" type="button" data-share>Copy link</button></div>
${answer('In short', p.description)}
<div class="prose">${p.html}</div>
<p class="src" style="margin-top:28px">Sources: ${esc((p.sources || []).join('; '))}</p>
<div class="endcard"><p class="label">Next</p>${related.length ? `<div class="list">${related.map(r => `<a href="/${kind}/${r.slug}/"><span class="label">${esc(r.dateLabel || fmtDate(r.date))}</span><div><h3>${esc(r.title)}</h3></div><span></span></a>`).join('')}</div>` : ''}<div class="hero-actions"><a class="btn" href="/about/#ventures">The ventures ${icon.arrow}</a><a class="btn ghost" href="/contact/">Send a brief</a></div></div>
</article></div></section>`;
  page(url, { title: p.title, desc: p.description, body, type: 'article', crumbs: [['Home', '/'], [kind === 'journal' ? 'Journal' : 'Writing', `/${kind}/`], [p.title, url]], extra: [art], lastmod: p.updated || p.date });
}

/* ---------- JOURNAL ---------- */
{
  const years = [...new Set(journal.map(j => String(j.date).slice(0, 4)))];
  const listFor = items => `<div class="list">${items.map(p => `<a href="/journal/${p.slug}/"><span class="label">${esc(p.dateLabel || fmtDate(p.date))}</span><div><h3>${esc(p.title)}</h3><p>${esc(p.description)}</p></div><span class="label">${esc((p.tags || [])[0] || '')}</span></a>`).join('')}</div>`;
  const body = `<section class="sec" style="border-top:0"><div class="wrap">
${secHead({ label: 'Journal / the founder\'s log, public edition', title: 'Dated <em>entries.</em>', side: 'Build notes, decisions and records. Reverse chronological. Every entry names its sources.' })}
${years.map(y => `<h2 class="label" style="margin:32px 0 12px"><a href="/journal/${y}/">${y}</a></h2>${listFor(journal.filter(j => String(j.date).startsWith(y)))}`).join('')}
<p style="margin-top:28px"><a class="arrow-link" href="/journal/feed.xml">RSS feed ${icon.arrow}</a></p></div></section>`;
  page('/journal/', { title: 'Journal', desc: 'Dated build notes, decisions and records from Jesun Ahmad Ushno, newest first, each with its sources.', body, crumbs: [['Home', '/'], ['Journal', '/journal/']] });
  for (const y of years) page(`/journal/${y}/`, { title: `Journal, ${y}`, desc: `Journal entries by Jesun Ahmad Ushno from ${y}: build notes, decisions and records.`, body: `<section class="sec" style="border-top:0"><div class="wrap">${secHead({ label: 'Journal / archive', title: `${y}<em>.</em>` })}${listFor(journal.filter(j => String(j.date).startsWith(y)))}</div></section>`, crumbs: [['Home', '/'], ['Journal', '/journal/'], [y, `/journal/${y}/`]] });
  for (const p of journal) articlePage('journal', p);
}

/* ---------- NOW (lines expire after 90 days) ---------- */
{
  const ms = 90 * 864e5, now = new Date(TODAY).getTime();
  const live = d.now.filter(n => now - new Date(n.date).getTime() <= ms);
  const ships = d.github.recent.length ? d.github.recent.map(r => `<li><span class="label">${esc(r.date)}</span><span>${esc(r.repo)}: ${esc(r.text)}</span></li>`).join('') : d.github.pinned.map(r => `<li><span class="label">Pinned</span><span><a href="https://github.com/${d.github.user}/${encodeURIComponent(r)}" target="_blank" rel="noopener">${esc(r)}</a></span></li>`).join('');
  const latest = [...journal.slice(0, 3).map(j => ({ date: j.date, label: j.dateLabel, t: j.title, u: `/journal/${j.slug}/` }))];
  const body = `<section class="sec" style="border-top:0"><div class="wrap">
${secHead({ label: `Now / updated ${fmtDate(TODAY)}`, title: 'What he is <em>doing now.</em>', side: 'Rebuilt on every build. Lines expire after 90 days unless renewed in the data file.' })}
${answer('Summary', `As of ${fmtDate(TODAY)}, Jesun Ahmad Ushno is running Immitly as Founder, building Brimwood Innovation and Climeam as Co-Founder, and working in Toronto as a software engineer, AI engineer and data specialist. This page rebuilds itself from his data file and public GitHub activity, and every line expires after 90 days.`)}
<h2 class="label" style="margin:40px 0 12px">Mandates</h2><ul class="now">${live.map(n => `<li><span class="label">${esc(fmtDate(n.date))}</span><span>${esc(n.text)}</span></li>`).join('') || '<li><span class="label">Empty</span><span>No current line. Renew the now list in the data file.</span></li>'}</ul>
<h2 class="label" style="margin:40px 0 12px">Ships, from GitHub (${esc(d.github.public_repos)} public repositories, checked ${esc(fmtDate(d.github.fetched))})</h2><ul class="now">${ships}</ul>
${frames([
  { name: 'profile-skyline', widths: [480, 498], w: 498, h: 747, alt: 'Jesun Ahmad Ushno looking out over the Toronto skyline', cap: 'Toronto, now', tag: 'Software engineer, AI engineer, data specialist' },
  { name: 'cafe-terrace', widths: [480, 498], w: 498, h: 332, alt: 'Jesun Ahmad Ushno at a cafe terrace above the Toronto skyline', cap: 'Where the briefs get read', tag: 'Mornings' }
], { cls: 'frames-2' })}
<h2 class="label" style="margin:40px 0 12px">Latest writing</h2><ul class="now">${latest.map(l => `<li><span class="label">${esc(l.label || fmtDate(l.date))}</span><span><a href="${l.u}">${esc(l.t)}</a></span></li>`).join('')}</ul>
</div></section>`;
  page('/now/', { title: 'Now', desc: `What Jesun Ahmad Ushno is doing now: his ventures, his current role in Toronto, and his latest work, updated ${fmtDate(TODAY)}.`, body, crumbs: [['Home', '/'], ['Now', '/now/']] });
}

/* ---------- CONTACT ---------- */
page('/contact/', { title: 'Contact and the brief', desc: 'Send Jesun Ahmad Ushno a brief: mandate type, budget band, timeline and message. Or email jesunahmadushno@gmail.com.', crumbs: [['Home', '/'], ['Contact', '/contact/']], body: `<section class="sec" style="border-top:0"><div class="wrap contact-grid">
<div>${secHead({ label: 'Contact / the brief', title: 'How do I <em>contact him?</em>' })}${answer('Answer', 'Send the brief below or email jesunahmadushno@gmail.com. Jesun reads every message himself. A brief that names the mandate, the budget band and the timeline gets the fastest answer. Venture partnerships, advisory and engineering mandates, research collaborations and speaking requests all start here.')}${brief(d)}</div>
<div class="dir" style="align-self:start">${directory()}</div>
</div></section>` });

/* ---------- RESUME ---------- */
{
  const exp = [
    ['2026 to now', 'Software Engineer, AI Engineer and Data Specialist', 'Toronto', 'Production AI and data systems: retrieval-augmented generation and multi-agent orchestration.'],
    ['Jan 2026 to Mar 2026', 'Advanced Data Analytics and ML Intern', 'mentAImage, remote', 'Led dynamic feature extraction for PulseKey: tremor, pauses, speed and pressure; 32 metrics per session. Open source.'],
    ['Apr 2023 to Nov 2024', 'IT Advisory, Officer to Consultant', 'KPMG Bangladesh', '20+ Power Automate workflows, 20+ Power BI dashboards, 5+ ISO 27001 audits, PowerApps used by 500+ people.'],
    ['Nov 2021 to Mar 2023', 'Student Engagement Facilitator', 'ESAB AIUB', 'Technical sessions for 300+ students.'],
    ['Aug 2018 to Nov 2024', 'Co-founder', 'MIAS Foundation', 'Flood relief reaching 50,000+ families; education programs for 5,000 children.']
  ];
  const body = `<section class="sec" style="border-top:0"><div class="wrap"><article class="article" style="max-width:860px">
<p class="label">Resume / generated from the data file on ${esc(fmtDate(TODAY))}</p>
<h1>Jesun Ahmad Ushno</h1>
<div class="meta"><span class="label">${esc(d.person.jobTitle)}</span><span class="label">Toronto, Ontario</span><span class="label">${esc(d.site.email)}</span><a class="label" href="/resume/Jesun-Ahmad-Ushno-Resume.pdf">PDF</a></div>
<p class="lede">${esc(d.description)}</p>
<h2 class="label" style="margin:40px 0 12px">Ventures</h2><div class="recs">${d.ventures.map(v => `<div class="rec"><span class="d">${esc(v.title)}</span><h3>${esc(v.name)}<span class="o">${esc(v.what)}</span></h3><span></span></div>`).join('')}</div>
<h2 class="label" style="margin:40px 0 12px">Experience</h2><div class="recs">${exp.map(e => `<div class="rec"><span class="d">${e[0]}</span><h3>${e[1]}<span class="o">${e[2]}. ${e[3]}</span></h3><span></span></div>`).join('')}</div>
<h2 class="label" style="margin:40px 0 12px">Education</h2><div class="recs"><div class="rec"><span class="d">2026</span><h3>MSc Data Analytics, Graduated With Distinction<span class="o">University of Niagara Falls Canada. Conferred 21 June 2026. CGPA 3.9154.</span></h3><span></span></div><div class="rec"><span class="d">2023</span><h3>BSc Computer Engineering<span class="o">American International University-Bangladesh, 2018 to 2023.</span></h3><span></span></div></div>
<h2 class="label" style="margin:40px 0 12px">Publications</h2><div class="recs">${d.publications.map(p => `<div class="rec"><span class="d">${esc(fmtDate(p.date))}</span><h3>${esc(p.title)}<span class="o">${esc(p.venue)}${p.doi ? '. DOI ' + esc(p.doi) : ''}</span></h3><span></span></div>`).join('')}</div>
<h2 class="label" style="margin:40px 0 12px">Skills</h2><div class="recs">${d.stack.map(s => `<div class="rec"><span class="d">${esc(s.group)}</span><h3 style="font-weight:400">${esc(s.items.join(', '))}</h3><span></span></div>`).join('')}</div>
<p class="src" style="margin-top:24px">Selected open source: ${esc(d.projects.filter(p => p.repo).map(p => p.name).join(', '))}. ${esc(d.github.public_repos)} public repositories on GitHub (checked ${esc(fmtDate(d.github.fetched))}).</p>
</article></div></section>`;
  page('/resume/', { title: 'Resume', desc: 'Resume of Jesun Ahmad Ushno: ventures, experience at KPMG Bangladesh and in Toronto, MSc with Distinction, publications and skills.', body, crumbs: [['Home', '/'], ['Resume', '/resume/']] });
}

/* ---------- USES ---------- */
page('/uses/', { title: 'Uses, the toolchain', desc: 'The languages, frameworks, data and ML tools, and clouds Jesun Ahmad Ushno uses: Python, TypeScript, SQL, PyTorch, Power Platform, GCP and more.', crumbs: [['Home', '/'], ['Uses', '/uses/']], body: `<section class="sec" style="border-top:0"><div class="wrap">${secHead({ label: 'Uses / the toolchain', title: 'What he <em>builds with.</em>', side: 'Software only. Hardware changes too often to list.' })}<div class="recs">${d.stack.map(s => `<div class="rec"><span class="d">${esc(s.group)}</span><h3 style="font-weight:400">${esc(s.items.join(', '))}</h3><span></span></div>`).join('')}</div><p class="src" style="margin-top:20px">Source: resume and the previous uses page.</p></div></section>` });

/* ---------- GUESTBOOK (backed by /api/guestbook) ---------- */
page('/guestbook/', { title: 'Guestbook', desc: 'Leave a short note for Jesun Ahmad Ushno and the next visitor. Notes are stored in his own database, without links or tracking.', crumbs: [['Home', '/'], ['Guestbook', '/guestbook/']], body: `<section class="sec" style="border-top:0"><div class="wrap contact-grid">
<div>${secHead({ label: 'Guestbook / stored in his own database', title: 'Sign the <em>book.</em>', side: 'Short notes only. No links, no markup. Three per hour.' })}
<form class="brief" id="gb-form" data-guestbook novalidate><div class="row" style="grid-template-columns:1fr"><div class="field"><label for="gb-name">Name</label><input id="gb-name" name="name" maxlength="40" autocomplete="name" required></div></div><div class="field"><label for="gb-note">Note</label><textarea id="gb-note" name="note" maxlength="280" required style="min-height:100px"></textarea></div><div class="hp" aria-hidden="true"><label for="gb-honey">Leave empty</label><input id="gb-honey" name="_honey" tabindex="-1" autocomplete="off"></div><div><button class="btn" type="submit">Sign ${icon.arrow}</button></div><p class="status" id="gb-status" role="status" aria-live="polite"></p></form></div>
<div><p class="label" style="margin-bottom:12px">Latest notes</p><ul class="now" id="gb-list"><li><span class="label">Loading</span><span>Reading the book...</span></li></ul></div>
</div></section>` });

/* ---------- LEGAL ---------- */
page('/legal/', { title: 'Legal, privacy and corrections', desc: 'Terms of use, privacy note, corrections policy and copyright notice for jesunahmadushno.com, the site of Jesun Ahmad Ushno.', crumbs: [['Home', '/'], ['Legal', '/legal/']], body: `<section class="sec" style="border-top:0"><div class="wrap"><article class="article prose" style="max-width:760px">
<p class="label">Legal / effective ${esc(fmtDate(TODAY))}</p>
<h1>Legal, privacy and corrections</h1>
<h2 id="terms">Terms of use</h2>
<p>All design, code, copy, images and interaction patterns on this site are the property of Jesun Ahmad Ushno. All rights reserved. You may read, link to and quote short passages with attribution.</p>
<p>You may not scrape, copy, reproduce, mirror or republish the site or its parts. You may not use any of it to train machine learning models. Automated collection is refused in robots.txt and in page metadata.</p>
<p>For licensing, write to ${esc(d.site.email)}.</p>
<h2 id="privacy">Privacy note</h2>
<p><strong>Contact form.</strong> It collects your name, email, the mandate type, budget band, timeline and your message. They are stored in the site's own Cloudflare D1 database and forwarded to Jesun's inbox through FormSubmit (formsubmit.co). They are kept until he deletes them, and deleted on request. Messages are kept in his inbox for as long as the conversation needs, and deleted on request.</p>
<p><strong>Analytics.</strong> ${d.site.analytics.token ? 'Cloudflare Web Analytics counts page views without cookies and without fingerprinting. It sees the page, the referrer, the country and the browser type. Data is kept for 6 months by Cloudflare.' : 'None is active. If it is turned on, it will be Cloudflare Web Analytics: no cookies, no fingerprinting, page views only.'}</p>
<p><strong>Guestbook.</strong> Notes you sign are stored in a Cloudflare D1 database with your chosen name and the time. No email, no IP address. Ask and a note is removed.</p>
<p><strong>Visit counter.</strong> One visit per browser per day is counted using a salted hash that changes daily. The hash cannot be turned back into an IP address and is not linked to you.</p>
<p><strong>Local storage.</strong> Your browser keeps a few small settings on your device only: whether you have seen the build animation, the grid overlay, reduced motion, your arcade scores, and, for this tab only, your recent Cortex conversation. None of it leaves your device unless you send a question to Cortex.</p>
<p><strong>Cortex.</strong> When you ask Cortex a question, the question is sent to this site's own server, which looks up passages from this site and, when switched on, asks a small language model on Cloudflare Workers AI to write the answer from those passages. Questions are not stored. Only an anonymous daily counter is kept, to stay inside the free limit.</p>
<p><strong>Everything else.</strong> No ads, no trackers. Fonts are served from this site, with no request to any font service. The Lab demos run in your browser and send nothing.</p>
<h2 id="corrections">Corrections</h2>
<p>Every number on this site carries a source. If you find an error, email ${esc(d.site.email)} with the page and the correct source. Corrections are made in the open and noted on the page with the date.</p>
<h2 id="copyright">Copyright</h2>
<p>&copy; ${new Date().getFullYear()} Jesun Ahmad Ushno. Every build carries a unique fingerprint (this one: <code>${FP}</code>) recorded with its date, which identifies copies.</p>
</article></div></section>` });

/* ---------- PATTERNS (dated registry, primary source) ---------- */
{
  const pats = JSON.parse(fs.readFileSync(path.join(SRC, 'data/patterns.json'), 'utf8'));
  const body = `<section class="sec" style="border-top:0"><div class="wrap">
${secHead({ label: 'Patterns / registry of original interaction patterns', title: 'Patterns, <em>dated and signed.</em>', side: 'The primary source for these patterns. Each entry names the pattern, the date it was first built, and the build fingerprint that carries it.' })}
${answer('Summary', 'Jesun Ahmad Ushno designed the interaction patterns listed here for his own site. Each is recorded with its first build date and a build fingerprint embedded in the site code, so any copy can be traced to its origin. The patterns are his property. Licensing questions go to his email.')}
<div class="recs">${pats.map(x => `<div class="rec" id="${x.id}"><span class="d">${esc(fmtDate(x.date))}</span><h3>${esc(x.name)}<span class="o">${esc(x.what)}</span></h3><span class="label">${esc(x.id)}</span></div>`).join('')}</div>
<p class="src" style="margin-top:20px">Build fingerprint of this page: ${FP}. Registry also kept in PATTERNS.md in the repository.</p>
</div></section>`;
  page('/patterns/', { title: 'Patterns registry', desc: 'Dated registry of the original interaction patterns designed by Jesun Ahmad Ushno, with build fingerprints that identify copies.', body, crumbs: [['Home', '/'], ['Patterns', '/patterns/']], extra: [{ '@type': 'Dataset', name: 'Interaction pattern registry of Jesun Ahmad Ushno', creator: { '@id': PID }, dateModified: TODAY, description: 'Original interaction patterns with first build dates.' }] });
}

/* ---------- INDEX PAGES FOR PRESERVED CONTENT ---------- */
page('/roadmap/', { title: 'AI engineer roadmaps', desc: 'Two AI engineer roadmaps by Jesun Ahmad Ushno: the INFUSE roadmap and the Tangerine roadmap.', crumbs: [['Home', '/'], ['Roadmaps', '/roadmap/']], body: `<section class="sec" style="border-top:0"><div class="wrap">${secHead({ label: 'Roadmaps', title: 'Two roads to <em>AI engineering.</em>' })}<div class="list"><a href="/roadmap/infuse-ai-engineer/"><span class="label">Roadmap</span><div><h3>INFUSE AI engineer roadmap</h3><p>The step-by-step path from fundamentals to shipping AI systems.</p></div><span class="label">Open</span></a><a href="/roadmap/tangerine-ai-engineer/"><span class="label">Roadmap</span><div><h3>Tangerine AI engineer roadmap</h3><p>A second roadmap with a different sequence.</p></div><span class="label">Open</span></a></div></div></section>` });
page('/bangla/', { title: 'Bangla articles', desc: 'Articles by Jesun Ahmad Ushno in Bangla, including the n8n extraction guide.', crumbs: [['Home', '/'], ['Bangla', '/bangla/']], hreflang: '', body: `<section class="sec" style="border-top:0"><div class="wrap">${secHead({ label: 'Bangla', title: 'In <em>Bangla.</em>', side: 'Preserved as published. The English edition is linked beside it.' })}<div class="list"><a href="/bangla/muse-n8n-extraction-101/" hreflang="bn"><span class="label">Article</span><div><h3>Muse n8n extraction 101 (Bangla)</h3></div><span class="label">BN</span></a><a href="/muse-n8n-extraction-101/" hreflang="en"><span class="label">Article</span><div><h3>Muse n8n extraction 101 (English)</h3></div><span class="label">EN</span></a></div></div></section>` });

/* ---------- 404, TRAP, REDIRECTS ---------- */
page('/404.html', { title: 'Page not found', desc: 'This address is not on the record.', noindex: true, body: `<section class="sec" style="border-top:0"><div class="wrap">${secHead({ label: 'Error 404 / not on the record', title: 'This page is <em>not on file.</em>' })}<p class="lede">The address may have moved in the rebuild. Every old address redirects, so a typo is the likely cause.</p><div class="hero-actions" style="margin-top:28px"><a class="btn" href="/">Home ${icon.arrow}</a><a class="btn ghost" href="/work/">Work</a><button class="btn ghost" type="button" data-palette>Open the palette</button></div></div></section>` });
w('trap/index.html', `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="robots" content="noindex, nofollow"><title>Archive</title></head><body><p>This path is disallowed in robots.txt. Automated visits here are logged by the host.</p></body></html>`);
const redirect = (to, title) => `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>${esc(title)}</title><meta name="robots" content="noindex, follow"><link rel="canonical" href="${SITE}${to}"><meta http-equiv="refresh" content="0; url=${to}"></head><body><p>This page moved to <a href="${to}">${SITE}${to}</a>.</p></body></html>`;
for (const r of d.legacyRedirects) w(r.from.replace(/^\//, ''), redirect(r.to, 'Moved'));

/* ---------- PRESERVED LEGACY CONTENT ---------- */
copyDir(path.join(SRC, 'legacy'), OUT);
for (const [file, self, other, ol] of [['muse-n8n-extraction-101/index.html', '/muse-n8n-extraction-101/', '/bangla/muse-n8n-extraction-101/', 'bn'], ['bangla/muse-n8n-extraction-101/index.html', '/bangla/muse-n8n-extraction-101/', '/muse-n8n-extraction-101/', 'en']]) {
  const f = path.join(OUT, file); let h = fs.readFileSync(f, 'utf8');
  if (!h.includes('hreflang')) {
    const sl = ol === 'bn' ? 'en' : 'bn';
    h = h.replace(/<\/head>/i, `<link rel="alternate" hreflang="${sl}" href="${SITE}${self}">\n<link rel="alternate" hreflang="${ol}" href="${SITE}${other}">\n<link rel="alternate" hreflang="x-default" href="${SITE}/muse-n8n-extraction-101/">\n</head>`);
    fs.writeFileSync(f, h);
  }
}
for (const [p, t] of [['/roadmap/infuse-ai-engineer/', 'INFUSE AI engineer roadmap'], ['/roadmap/tangerine-ai-engineer/', 'Tangerine AI engineer roadmap'], ['/muse-n8n-extraction-101/', 'Muse n8n extraction 101'], ['/bangla/muse-n8n-extraction-101/', 'Muse n8n extraction 101, Bangla']]) pages.push({ path: p, title: t, lastmod: '2026-10-23', images: [], legacy: true });

/* ---------- STATIC ASSETS ---------- */
copyDir(path.join(SRC, 'fonts'), path.join(OUT, 'fonts'));
copyDir(path.join(SRC, 'img'), path.join(OUT, 'img'));
copyDir(path.join(SRC, 'static'), OUT);
fs.copyFileSync(path.join(SRC, 'img/icon-192.png'), path.join(OUT, 'favicon.png'));
fs.copyFileSync(path.join(SRC, 'img/icon-180.png'), path.join(OUT, 'apple-touch-icon.png'));
w('site.webmanifest', JSON.stringify({ name: 'Jesun Ahmad Ushno', short_name: 'Jesun', start_url: '/', display: 'standalone', background_color: '#0B0B0C', theme_color: '#0B0B0C', icons: [192, 512].map(s => ({ src: `/img/icon-${s}.png`, sizes: `${s}x${s}`, type: 'image/png' })) }));

/* ---------- JS and CSS ---------- */
await esbuild.build({ entryPoints: [path.join(SRC, 'scripts/main.js'), path.join(SRC, 'scripts/home.js')], bundle: true, splitting: true, format: 'esm', outdir: path.join(OUT, 'js'), minify: true, sourcemap: false, legalComments: 'none', target: ['es2020'], banner: { js: `/* (c) Jesun Ahmad Ushno. All rights reserved. ${FP} */` } });
await esbuild.build({ entryPoints: [path.join(SRC, 'scripts/arm.js')], bundle: false, outfile: path.join(OUT, 'js/arm.js'), minify: true, legalComments: 'none' });
const cssRes = await esbuild.transform(fs.readFileSync(path.join(SRC, 'styles/fonts.css'), 'utf8') + fs.readFileSync(path.join(SRC, 'styles/tokens.css'), 'utf8') + fs.readFileSync(path.join(SRC, 'styles/site.css'), 'utf8') + fs.readFileSync(path.join(SRC, 'styles/studies.css'), 'utf8') + fs.readFileSync(path.join(SRC, 'styles/cortex.css'), 'utf8'), { loader: 'css', minify: true, legalComments: 'none' });
const homeCss = await esbuild.transform(fs.readFileSync(path.join(SRC, 'styles/fonts.css'), 'utf8') + fs.readFileSync(path.join(SRC, 'styles/tokens.css'), 'utf8') + fs.readFileSync(path.join(SRC, 'styles/home.css'), 'utf8') + fs.readFileSync(path.join(SRC, 'styles/studies.css'), 'utf8') + fs.readFileSync(path.join(SRC, 'styles/cortex.css'), 'utf8'), { loader: 'css', minify: true, legalComments: 'none' });
let css = `/* (c) Jesun Ahmad Ushno. All rights reserved. */:root{--fp:"${FP}"}` + cssRes.code;

/* ---------- Search index: passages for the twin and the palette (one index, built once) ---------- */
{
  const P = [], add = (id, title, text, url, source) => { if (text) P.push({ id, t: title, x: String(text).replace(/\s+/g, ' ').trim(), u: url, s: source || '' }); };
  add('bio', 'Who he is', d.description, '/about/#bio', 'canonical description');
  d.faq.forEach((f, i) => add('faq' + i, f.q, f.a, '/about/#faq', 'FAQ'));
  d.ventures.forEach(v => add('v-' + v.slug, v.name + ', ' + v.title, v.line + ' ' + v.what, '/about/#ventures', v.source));
  d.projects.forEach(p => add('p-' + p.slug, p.name, p.summary + ' ' + p.body + ' Stack: ' + p.stack.join(', ') + '.', `/projects/${p.slug}.html`, p.source));
  d.journey.forEach(j => add('j-' + j.id, j.title + ', ' + j.org, `${j.dates}, ${j.place}. ${j.text}${j.count ? ' ' + j.count.toLocaleString('en-US') + ' ' + j.countLabel + '.' : ''}`, '/journey/#' + j.id, j.source));
  d.publications.forEach(p => add('pub-' + p.slug, p.title, `${p.venue}, ${p.date}. ${p.summary}${p.doi ? ' DOI ' + p.doi + '.' : ''}`, `/writing/${p.slug}/`, p.status));
  d.credentials.forEach((c, i) => add('c' + i, c.title, `${c.org}, ${c.date}.`, '/#recognition', c.source));
  d.stats.forEach(st => add('s-' + st.id, st.label, `${st.display} ${st.label}. Source: ${st.source}.`, '/#record', st.source));
  add('stack', 'His tech stack and tools', d.stack.map(g => g.group + ': ' + g.items.join(', ') + '.').join(' '), '/uses/', 'resume');
  d.recommendations.forEach((r, i) => add('rec' + i, 'Recommendation from ' + r.name + ', ' + r.relation.toLowerCase(), r.quote, '/about/#testimony', r.relation + ', LinkedIn'));
  journal.forEach(j => add('jr-' + j.slug, j.title, j.description, `/journal/${j.slug}/`, (j.sources || []).join('; ')));
  add('contact', 'How to contact him', 'Send a brief at the contact page or email ' + d.site.email + '. He reads every message himself.', '/contact/', 'site');
  add('fleet', 'His agent fleet', `He runs his work through ${d.fleet.departments.reduce((n, x) => n + x.seats.length, 0)} named AI seats in ${d.fleet.departments.length} departments, organised like a company, with one human foreman. Departments: ${d.fleet.departments.map(x => x.name).join(', ')}.`, '/lab/#system', d.fleet.source);
  if (rec.studies.length) {
    const st = studiesOnly(rec);
    add('studies', 'His studies and research spine', `He runs ${rec.totals.studies} public studies under one written standard, Standard v2, adopted ${rec.standardAdopted}. Each states its question first and is graded on a verdict ladder: ${rec.ladder.join(', ')}. Counts: ${rec.ladder.map(l => (rec.counts[l] || 0) + ' ' + l).join(', ')}. His research spine asks how far an automated judge can be trusted.`, '/studies/', 'profile roadmap, synced ' + rec.synced);
    st.filter(x => x.question).forEach(x => add('st-' + x.repo, x.repo + ' study, ' + (x.verdict || 'not yet graded'), `${x.question}${x.headline ? ' Headline: ' + x.headline : ''}`, '/studies/#' + x.repo.toLowerCase(), x.url));
    if (rec.judge) add('judge', 'Judge the judge, vote on an automated judge', `Thirty fixed SQuAD cases from rag-eval-harness. Read the question, the gold answer and the system answer, then vote whether the embedding judge was right. Votes are GitHub issues on his profile repository.`, '/studies/#judge', 'profile repository');
    (rec.orgs || []).forEach(o => add('org-' + o.org, o.org + ' GitHub organisation', o.repos.map(r => r.repo + ': ' + (r.summary || '')).join(' '), '/studies/#organisations', o.url));
  }
  w('index/passages.json', JSON.stringify({ v: 1, built: TODAY, n: P.length, p: P }));
}

/* ---------- Build record (provenance): read by the dock, the boot, the console and /build/ ---------- */
const readLog = f => { try { return JSON.parse(fs.readFileSync(path.join(ROOT, 'build-log', f), 'utf8')); } catch (e) { return null; } };
const lintLog = readLog('lint.json'), testLog = readLog('test.json'), qaLog = readLog('qa-home.json');
const homeHtml = fs.readFileSync(path.join(OUT, 'index.html'), 'utf8');
const score = (() => { try { const t = fs.readFileSync(path.join(ROOT, 'SEO-AEO-GEO-SCORECARD.md'), 'utf8'); const m = [...t.matchAll(/\| (SEO|AEO|GEO) \| (\d+) \/ 1000/g)]; return Object.fromEntries(m.map(x => [x[1], +x[2]])); } catch (e) { return null; } })();
const jsBytes = fs.readdirSync(path.join(OUT, 'js')).reduce((a, f) => a + fs.statSync(path.join(OUT, 'js', f)).size, 0);
const buildRec = {
  fingerprint: FP, date: TODAY, pages: pages.length,
  layers: (homeHtml.match(/data-layer="/g) || []).length,
  seats: d.fleet.departments.reduce((n, x) => n + x.seats.length, 0) + 1,
  passages: JSON.parse(fs.readFileSync(path.join(OUT, 'index/passages.json'), 'utf8')).n,
  lint: lintLog ? { errors: lintLog.errors, warnings: lintLog.warnings, links: lintLog.internalLinks, recordedOn: 'previous lint run' } : null,
  tests: testLog ? { passed: testLog.pass, failed: testLog.fail } : null,
  qa: qaLog ? { buildSeconds: qaLog.buildText, hiddenAfter: qaLog.hiddenAfter, hiddenAfterSkip: qaLog.hiddenAfterSkip, errors: (qaLog.errors || []).length } : null,
  scores: score, jsBytes, cssBytes: homeCss.code.length
};
w('build.json', JSON.stringify(buildRec, null, 1));
{
  const row = (k, v, src) => `<div class="rec"><span class="d">${esc(k)}</span><h3>${v === null || v === undefined ? '<span class="muted">not recorded</span>' : esc(String(v))}<span class="o">${esc(src)}</span></h3><span></span></div>`;
  const R = buildRec;
  const body = `<section class="sec" style="border-top:0"><div class="wrap">
${secHead({ label: 'Build / provenance of this exact page', title: 'The build <em>record.</em>', side: 'Every number below is written by the build itself. A missing value says so. Nothing is typed in by hand.' })}
${answer('Summary', `This site was built on ${fmtDate(R.date)} as build ${R.fingerprint}. It has ${R.pages} pages, ${R.layers} layers on the home page, ${R.seats} fleet seats and ${R.passages} searchable passages. The values below come from the build, the lint, the tests and the browser checks that ran on it.`)}
<div class="recs">${row('Fingerprint', R.fingerprint, 'embedded in CSS, JS, meta tag and a hidden marker')}${row('Built', R.date, 'build date, Toronto time')}${row('Pages', R.pages, 'scripts/build.mjs')}${row('Home layers', R.layers, 'count of data-layer in the home page')}${row('Fleet seats', R.seats, 'data.fleet plus the foreman')}${row('Search passages', R.passages, 'index/passages.json')}${row('Lint', R.lint ? `${R.lint.errors} errors, ${R.lint.warnings} warnings, ${R.lint.links} links checked` : null, 'build-log/lint.json, ' + (R.lint ? R.lint.recordedOn : ''))}${row('API tests', R.tests ? `${R.tests.passed} passed, ${R.tests.failed} failed` : null, 'build-log/test.json')}${row('Browser QA', R.qa ? `${R.qa.buildSeconds} Hidden layers after build: ${R.qa.hiddenAfter}, after skip: ${R.qa.hiddenAfterSkip}. Page errors: ${R.qa.errors}.` : null, 'build-log/qa-home.json')}${row('Scores', R.scores ? `SEO ${R.scores.SEO}, AEO ${R.scores.AEO}, GEO ${R.scores.GEO} out of 1000` : null, 'SEO-AEO-GEO-SCORECARD.md (live checks pending)')}${row('JavaScript', R.jsBytes.toLocaleString('en-US') + ' bytes', 'all files in /js')}${row('Home CSS', R.cssBytes.toLocaleString('en-US') + ' bytes', '/css/home.css')}</div>
<p style="margin-top:24px"><a class="arrow-link" href="/build.json">Raw build.json ${icon.arrow}</a></p>
</div></section>
<section class="sec" id="pipeline"><div class="wrap">${secHead({ label: 'Pipeline', title: 'How this site <em>ships.</em>', side: 'Everything up to review runs by itself. Going live is his call.' })}<figure class="dgm-fig">${shipDiagram()}</figure></div></section>`;
  page('/build/', { title: 'Build record', desc: `Provenance of jesunahmadushno.com build ${R.fingerprint}: pages, layers, fleet seats, lint, tests, browser checks and scores, written by the build itself.`, body, crumbs: [['Home', '/'], ['Build', '/build/']] });
}

/* ---------- Production class-name hashing (only classes JS never references) ---------- */
const jsText = fs.readdirSync(path.join(OUT, 'js')).map(f => fs.readFileSync(path.join(OUT, 'js', f), 'utf8')).join('\n');
const cssNoUrl = css.replace(/url\([^)]*\)/g, '');
const classNames = [...new Set([...cssNoUrl.matchAll(/\.(-?[a-zA-Z_][\w-]*)/g)].map(m => m[1]))];
const keep = new Set(classNames.filter(c => new RegExp(`(^|[^\\w-])${c.replace(/[-]/g, '\\-')}([^\\w-]|$)`).test(jsText)));
const map = new Map(); let ci = 0;
for (const c of classNames) if (!keep.has(c)) map.set(c, 'z' + (ci++).toString(36));
css = css.replace(/url\([^)]*\)|\.(-?[a-zA-Z_][\w-]*)/g, (m, c) => (c && map.has(c) ? '.' + map.get(c) : m));
fs.mkdirSync(path.join(OUT, 'css'), { recursive: true });
fs.writeFileSync(path.join(OUT, 'css/site.css'), css);
fs.writeFileSync(path.join(OUT, 'css/home.css'), `/* (c) Jesun Ahmad Ushno. All rights reserved. */:root{--fp:"${FP}"}` + homeCss.code);
const legacyDirs = ['roadmap/infuse-ai-engineer', 'roadmap/tangerine-ai-engineer', 'muse-n8n-extraction-101', 'bangla/muse-n8n-extraction-101'];
const walk = dir => fs.readdirSync(dir, { withFileTypes: true }).flatMap(e => e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)]);
for (const f of walk(OUT).filter(f => f.endsWith('.html'))) {
  const rel = path.relative(OUT, f);
  if (legacyDirs.some(l => rel.startsWith(l)) || rel === 'index.html') continue; // home ships its own stylesheet
  let h = fs.readFileSync(f, 'utf8');
  h = h.replace(/class="([^"]*)"/g, (m, v) => `class="${v.split(/\s+/).map(c => map.get(c) || c).join(' ')}"`);
  fs.writeFileSync(f, h);
}

/* ---------- OG images, one per page, from the data file ---------- */
fs.mkdirSync(path.join(OUT, 'og'), { recursive: true });
const ogDone = new Set();
for (const p of pages.filter(x => x.og && !x.legacy)) {
  if (ogDone.has(p.og)) continue; ogDone.add(p.og);
  const words = (p.ogTitle || p.title).split(' '); const lines = []; let cur = '';
  for (const wd of words) { if ((cur + ' ' + wd).trim().length > 26) { lines.push(cur.trim()); cur = wd; } else cur += ' ' + wd; } if (cur.trim()) lines.push(cur.trim());
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630"><defs><pattern id="g" width="48" height="48" patternUnits="userSpaceOnUse"><path d="M48 0H0V48" fill="none" stroke="#26262B" stroke-width="1"/></pattern></defs><rect width="1200" height="630" fill="#0B0B0C"/><rect width="1200" height="630" fill="url(#g)" opacity=".7"/><rect x="72" y="72" width="14" height="14" fill="#FF3D2E"/><text x="100" y="86" font-family="DejaVu Sans Mono" font-size="20" fill="#A8A59E" letter-spacing="3">JESUN AHMAD USHNO / ${esc(p.path === '/' ? 'TORONTO' : p.path.replace(/\//g, ' ').trim().toUpperCase().slice(0, 40))}</text>${lines.slice(0, 4).map((l, i) => `<text x="72" y="${250 + i * 84}" font-family="Inter Display" font-weight="700" font-size="76" letter-spacing="-2.5" fill="#F5F3EE">${esc(l)}</text>`).join('')}<text x="72" y="566" font-family="DejaVu Sans Mono" font-size="18" fill="#6F6D69" letter-spacing="2">jesunahmadushno.com / build ${FP}</text><rect x="0" y="622" width="1200" height="8" fill="#FF3D2E"/></svg>`;
  await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toFile(path.join(OUT, p.og.replace(/^\//, '')));
}

/* ---------- sitemap, robots, feeds, llms.txt, headers ---------- */
const urlXml = p => `<url><loc>${SITE}${p.path}</loc><lastmod>${p.lastmod}</lastmod>${p.path.includes('muse-n8n') ? `<xhtml:link rel="alternate" hreflang="en" href="${SITE}/muse-n8n-extraction-101/"/><xhtml:link rel="alternate" hreflang="bn" href="${SITE}/bangla/muse-n8n-extraction-101/"/>` : ''}${(p.images || []).map(i => `<image:image><image:loc>${SITE}${i}</image:loc></image:image>`).join('')}</url>`;
w('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${pages.map(urlXml).join('\n')}\n</urlset>\n`);
const TRAIN = ['GPTBot', 'CCBot', 'ClaudeBot', 'anthropic-ai', 'Google-Extended', 'Applebot-Extended', 'Bytespider', 'cohere-ai', 'cohere-training-data-crawler', 'Meta-ExternalAgent', 'FacebookBot', 'Diffbot', 'ImagesiftBot', 'Omgilibot', 'PetalBot', 'Timpibot', 'img2dataset', 'ia_archiver', 'archive.org_bot', 'Amazonbot', 'AI2Bot', 'PanguBot'];
w('robots.txt', `# Jesun Ahmad Ushno. Training and archiving crawlers are refused. Search and user-requested retrieval are allowed so answer engines can cite the source.\n${TRAIN.map(b => `User-agent: ${b}\nDisallow: /\n`).join('\n')}\nUser-agent: *\nAllow: /\nDisallow: /trap/\n\nSitemap: ${SITE}/sitemap.xml\n`);
const rss = (kind, title, items) => `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel><title>${esc(title)}</title><link>${SITE}/${kind}/</link><atom:link href="${SITE}/${kind}/feed.xml" rel="self" type="application/rss+xml"/><description>${esc(title)}, from the canonical home of Jesun Ahmad Ushno.</description><language>en</language>${items.map(i => `<item><title>${esc(i.title)}</title><link>${SITE}${i.url}</link><guid>${SITE}${i.url}</guid><pubDate>${new Date(i.date + (String(i.date).length === 4 ? '-01-01' : '')).toUTCString()}</pubDate><description>${esc(i.description)}</description><author>${d.site.email} (Jesun Ahmad Ushno)</author></item>`).join('')}</channel></rss>\n`;
w('writing/feed.xml', rss('writing', 'Writing', [...posts.map(p => ({ title: p.title, url: `/writing/${p.slug}/`, date: p.date, description: p.description })), ...d.publications.map(p => ({ title: p.title, url: `/writing/${p.slug}/`, date: p.date.length === 7 ? p.date + '-01' : p.date, description: p.summary }))]));
w('journal/feed.xml', rss('journal', 'Journal', journal.map(p => ({ title: p.title, url: `/journal/${p.slug}/`, date: p.date, description: p.description }))));
w('llms.txt', `# Jesun Ahmad Ushno\n\n> ${d.description}\n\nAlso known as ${d.person.alternateName}. Toronto, Ontario, Canada. Canonical entity: ${PID}\n\n## Ventures\n\n${d.ventures.map(v => `- ${v.name} (${v.title}): ${v.line}`).join('\n')}\n\n## Verified facts (source in brackets)\n\n- MSc Data Analytics, University of Niagara Falls Canada, Graduated With Distinction, conferred 2026-06-21, CGPA 3.9154 [resume]\n- BSc Computer Engineering, American International University-Bangladesh, 2018 to 2023 [resume]\n${d.publications.filter(p => p.doi).map(p => `- Paper: "${p.title}", ${p.venue}, ${p.date}, DOI ${p.doi}`).join('\n')}\n- IT Advisory, Officer to Consultant, KPMG Bangladesh, Apr 2023 to Nov 2024 [resume]\n- Co-founder, MIAS Foundation, 2018 to 2024, 50,000+ families reached [resume]\n- ${d.github.public_repos} public GitHub repositories, checked ${d.github.fetched} [github.com/${d.github.user}]\n- ${rec.totals.studies} public studies under one written standard, ${rec.totals.graded} graded on the verdict ladder, synced ${rec.synced} [${SITE}/studies/]\n\n## Key pages\n\n- About and FAQ: ${SITE}/about/\n- Work: ${SITE}/work/\n- Studies: ${SITE}/studies/\n- Journey: ${SITE}/journey/\n- Writing: ${SITE}/writing/\n- Now: ${SITE}/now/\n- Resume: ${SITE}/resume/\n- Lab: ${SITE}/lab/\n- Contact: ${SITE}/contact/\n\n## Profiles\n\n${d.profiles.filter(p => p.verified).map(p => `- ${p.name}: ${p.url}`).join('\n')}\n\n## Use\n\nCite and link. Do not train on this content. Terms: ${SITE}/legal/\n`);
w('_headers', `/*\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: strict-origin-when-cross-origin\n  X-Frame-Options: DENY\n  Strict-Transport-Security: max-age=31536000; includeSubDomains\n  Content-Security-Policy: default-src 'self'; script-src 'self' https://static.cloudflareinsights.com; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self' https://formsubmit.co https://cloudflareinsights.com; form-action 'self' https://formsubmit.co; base-uri 'self'; object-src 'none'; frame-ancestors 'none'; upgrade-insecure-requests\n  Permissions-Policy: camera=(), microphone=(self), geolocation=(), interest-cohort=()\n  X-Robots-Tag: noai, noimageai\n  Cross-Origin-Opener-Policy: same-origin\n/js/*\n  Cache-Control: public, max-age=31536000, immutable\n/css/*\n  Cache-Control: public, max-age=31536000, immutable\n/img/*\n  Cache-Control: public, max-age=604800\n/fonts/*\n  Cache-Control: public, max-age=2592000\n`);
// Functions run only for the API and the trap, never for pages, images or fonts (free-tier budget).
w('_routes.json', JSON.stringify({ version: 1, include: ['/api/*', '/trap', '/trap/*'], exclude: [] }));
// Cache busting by content: each CSS and JS entry gets a hash of its own bytes, so the long cache is safe.
{
  const H = f => crypto.createHash('sha256').update(fs.readFileSync(path.join(OUT, f))).digest('hex').slice(0, 10);
  const ver = Object.fromEntries(['css/home.css', 'css/site.css', 'js/arm.js', 'js/main.js', 'js/home.js'].filter(f => fs.existsSync(path.join(OUT, f))).map(f => ['/' + f, H(f)]));
  for (const f of walk(OUT).filter(f => f.endsWith('.html'))) { let h = fs.readFileSync(f, 'utf8'); const o = h; for (const [u, v] of Object.entries(ver)) h = h.split(`${u}?v=${FP}`).join(`${u}?v=${v}`); if (h !== o) fs.writeFileSync(f, h); }
}
w('_redirects', d.legacyRedirects.map(r => `${r.from.replace(/index\.html$/, '')} ${r.to} 301`).join('\n') + '\n/Jesun_Resume.pdf /resume/Jesun-Ahmad-Ushno-Resume.pdf 301\n');
w('.nojekyll', '');

/* ---------- build record ---------- */
const fpRec = { fingerprint: FP, date: TODAY, pages: pages.length, classesHashed: map.size, classesKept: keep.size };
fs.mkdirSync(path.join(ROOT, 'build-log'), { recursive: true });
fs.appendFileSync(path.join(ROOT, 'build-log/fingerprints.jsonl'), JSON.stringify(fpRec) + '\n');
console.log('built', JSON.stringify(fpRec));
