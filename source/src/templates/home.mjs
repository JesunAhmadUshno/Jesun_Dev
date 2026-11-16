// Home: the Agent Portfolio, built from the data file. Copyright Jesun Ahmad Ushno. All rights reserved.
import { esc } from './parts.mjs';
import { homeStudies, latestShipped } from './studies.mjs';

const svg = {
  down: '<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M8 2v12M3 9l5 5 5-5"/></svg>',
  out: '<svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M4 12L12 4M5 4h7v7"/></svg>',
  pin: '<svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M8 0a5.5 5.5 0 0 0-5.5 5.5C2.5 9.6 8 16 8 16s5.5-6.4 5.5-10.5A5.5 5.5 0 0 0 8 0zm0 7.6a2.1 2.1 0 1 1 0-4.2 2.1 2.1 0 0 1 0 4.2z"/></svg>',
  search: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><circle cx="7" cy="7" r="5"/><path d="M11 11l4 4"/></svg>',
  grip: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M6 4L2 8l4 4M10 4l4 4-4 4"/></svg>',
  mail: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><rect x="1.5" y="3" width="13" height="10" rx="1.5"/><path d="M2 4l6 5 6-5"/></svg>',
  code: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M5 4L1 8l4 4M11 4l4 4-4 4"/></svg>',
  user: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><circle cx="8" cy="5" r="3"/><path d="M2 15c.5-3.5 3-5 6-5s5.5 1.5 6 5"/></svg>',
  x: '<svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M2 2l8 8M10 2l-8 8"/></svg>'
};
const laurel = cls => `<svg class="laurel${cls}" viewBox="0 0 30 76" aria-hidden="true"><path d="M24 74C8 60 4 34 14 4" fill="none" stroke="currentColor" stroke-width="2"/><g fill="currentColor"><ellipse cx="18" cy="14" rx="3" ry="7" transform="rotate(25 18 14)"/><ellipse cx="9" cy="24" rx="3" ry="7" transform="rotate(-40 9 24)"/><ellipse cx="14" cy="34" rx="3" ry="7" transform="rotate(30 14 34)"/><ellipse cx="6" cy="44" rx="3" ry="7" transform="rotate(-50 6 44)"/><ellipse cx="14" cy="54" rx="3" ry="7" transform="rotate(35 14 54)"/><ellipse cx="9" cy="63" rx="3" ry="7" transform="rotate(-60 9 63)"/></g></svg>`;
const L = (name, entry) => ` data-layer="${name}"${entry ? ` data-entry="${entry}"` : ''}`;
const H2 = (name, html, text) => `<h2 class="h2 glitch" data-text="${esc(text)}"${L(name, 'drag')}>${html}</h2>`;

export function homeBody(d, fp) {
  const arts = { prism: 'parse(file)\nanalyse(local)\nupload: none', bigfish: 'spawn(agents)\nwatch(markets)\nact(schedule)', pulsekey: 'read(stroke)\nmetrics: 32\nsessions: 35', nopara: 'ffmpeg.wasm\nconvert(local)\nuploads: 0', sonicclear: 'denoise(audio)\nmodel: torch\nserve: fastapi', tridrop: 'qr -> pair\nwebrtc(p2p)\nserver: none', refract: 'render(assets)\nin: browser\nupload: none', 'fabric-defect-detection': 'haar(level=3)\nflag(z>2.6)\nclassify(nn)', 'elitist-pso': 'elite.keep()\nmutate(p=.08)\nw: .9 -> .4' };
  const cats = [['all', 'All'], ['agents', 'Agents'], ['ml', 'ML'], ['data', 'Data / Privacy'], ['research', 'Research']].filter(([c]) => c === 'all' || d.projects.some(p => p.cat === c));
  const cards = d.projects.map((p, i) => {
    const glyph = p.name.replace(/[^A-Za-z]/g, '').slice(0, 2).toUpperCase();
    const proof = [p.repo && `<a href="${esc(p.repo)}" target="_blank" rel="noopener">Repo</a>`, p.demo && `<a href="${esc(p.demo)}"${p.demo.startsWith('http') ? ' target="_blank" rel="noopener"' : ''}>${p.demo.startsWith('/') ? 'Run it' : 'Live'}</a>`, p.paper && `<a href="${esc(p.paper)}" target="_blank" rel="noopener">Paper</a>`].filter(Boolean).join('');
    return `<article class="card" data-cat="${p.cat}" data-title="${esc((p.name + ' ' + p.summary + ' ' + p.stack.join(' ')).toLowerCase())}"${L('work.' + p.slug, 'drag')}><div class="card-in"><div class="art" style="--gx:${[15, 80, 50, 10, 90, 40, 70, 25, 85][i % 9]}%;--gy:${[95, 100, 110, 20, 30, 0, 80, 60, 5][i % 9]}%"><a href="/projects/${p.slug}.html" aria-label="${esc(p.name)} case file" tabindex="-1"></a><span class="tag">${esc(p.catLabel)}</span><span class="arrow">${svg.out}</span><span class="code">${esc(arts[p.slug] || p.stack.join('\n'))}</span><span class="glyph">${glyph}</span><canvas class="gen" data-seed="${esc(p.slug)}" aria-hidden="true"></canvas></div><div class="card-meta"><span class="card-num">${String(i + 1).padStart(2, '0')}</span><span class="card-title"><a href="/projects/${p.slug}.html">${esc(p.name)}</a></span><span class="card-sub">${esc(p.catLabel)}${p.year ? ' / ' + esc(p.year) : ''}</span><span class="proof">${proof}</span></div></div></article>`;
  }).join('');
  const orgs = ['KPMG BANGLADESH', 'UNIVERSITY OF NIAGARA FALLS CANADA', 'AIUB', 'MIAS FOUNDATION', 'GDG ON CAMPUS UNF', 'MENTAIMAGE', 'AIP CONFERENCE PROCEEDINGS'];
  const stats = d.stats.map(s => `<div class="stat"><span class="n"${L('stat.' + s.id, 'count')} data-count="${s.value}" data-decimals="${s.decimals || 0}" data-suffix="${s.suffix || ''}"><span data-v>${esc(s.display)}</span></span><span class="l"${L('stat.' + s.id + '.label')}>${esc(s.label)}</span><span class="src">${esc(s.source)}</span></div>`).join('');
  const rows = d.credentials.map((c, i) => `<div class="row"${L('rec.row.' + i)}><span class="i">${String(i + 1).padStart(2, '0')}</span><span class="t">${esc(c.title)}<span class="o">${esc(c.org)} / <a href="${esc(c.proof)}"${c.proof.startsWith('http') ? ' target="_blank" rel="noopener"' : ''}>${esc(c.proofLabel)}</a></span></span><span class="y">${esc(String(c.date).slice(0, 4))}</span></div>`).join('');
  const tl = d.journey.slice().reverse().map(j => `<div class="ent"><span class="d"${L('tl.' + j.id + '.date')}>${esc(j.dates)}</span><span class="r"${L('tl.' + j.id + '.role')}>${esc(j.title)}</span><span class="org"${L('tl.' + j.id + '.org')}>${esc(j.org)}</span><p${L('tl.' + j.id + '.copy', 'type')}>${esc(j.text)}</p></div>`).join('');
  const miles = [['MSc with Distinction', '2026'], ['Immitly founded', 'Founder'], ['Brimwood Innovation', 'Co-Founder'], ['Climeam', 'Co-Founder'], ['Two ML papers published', '2023']].map(([t, y], i) => `<div class="mile"${L('mile.' + i)}><b>${esc(t)}</b><span>${esc(y)}</span></div>`).join('');
  const quotes = d.recommendations.filter(r => r.featured).map((r, i) => `<figure${L('quote.' + i)}><blockquote>${esc(r.quote.split('. ').slice(0, 2).join('. ').replace(/\.?$/, '.'))}</blockquote><figcaption><b>${esc(r.name)}</b><span>${esc(r.role)}</span><small>${esc(r.relation)}. LinkedIn recommendation.</small></figcaption></figure>`).join('');
  const prof = d.profiles.filter(p => p.verified);
  const seatNames = d.fleet.departments.flatMap(x => x.seats.map(s => s[1]));

  return `<div class="ap" data-home data-seats="${esc(seatNames.join('|'))}">
<a class="skiplink" href="#main">Skip to content</a>
<header class="site-header" id="header" data-section="Header">
  <div class="wrap">
    <a href="#home" class="logo"${L('nav.logo')}>JESUN<span class="dot">.</span></a>
    <nav class="nav" id="home-nav" aria-label="Main">
      <a href="#work"${L('nav.work')}>Work</a><a href="#studies"${L('nav.studies')}>Studies</a><a href="#ventures"${L('nav.ventures')}>Ventures</a><a href="#recognition"${L('nav.recognition')}>Recognition</a><a href="#journey"${L('nav.journey')}>Journey</a><a class="lab" href="/lab/"${L('nav.lab')}>Lab</a><a href="/writing/"${L('nav.writing')}>Writing</a><a href="#contact"${L('nav.contact')}>Contact</a>
    </nav>
    <div class="head-right">
      <a class="soc" href="https://github.com/JesunAhmadUshno" target="_blank" rel="me noopener"${L('nav.github')}>GitHub</a>
      <a class="soc" href="https://www.linkedin.com/in/jesunahmadushno" target="_blank" rel="me noopener"${L('nav.linkedin')}>LinkedIn</a>
      <button class="kbtn menu-btn" type="button" aria-expanded="false" aria-controls="home-nav">Menu</button>
      <button class="kbtn" type="button" data-palette aria-label="Open command palette"${L('nav.palette')}><kbd class="k-mod">Ctrl</kbd> K</button>
      <a class="talk" href="#contact"${L('nav.talk')}>Let's talk</a>
    </div>
  </div>
</header>

<main id="main" tabindex="-1">
<section class="hero" id="home" data-section="Hero">
  <canvas id="net" aria-hidden="true"></canvas>
  <div class="giant-wrap" id="giantWrap" aria-hidden="true"><span class="giant" data-words="PORTFOLIO|AGENTIC|FOUNDER|ENGINEER|OPERATOR"${L('hero.backdrop')}>PORTFOLIO</span></div>
  <div class="wrap hero-grid">
    <div class="hero-left">
      <div class="hello"${L('hero.script')}>Hello, I'm</div>
      <h1 class="name glitch" data-text="JESUN." data-signature${L('hero.name', 'drag')}>JESUN<span class="dot">.</span></h1>
      <div class="role"${L('hero.role')}>Software engineer<br>and founder</div>
      <p class="credo"${L('hero.credo', 'type')}>I build minds like companies, and companies like minds. Every claim carries a receipt, from the first commit to production.</p>
      <div${L('hero.cta')}><a class="btn" href="#work">See my work ${svg.down}</a></div>
      <div class="loc"${L('hero.location')}>${svg.pin}TORONTO, CANADA</div>
    </div>
    <div class="hero-mid">
      <div class="portrait photo holo protect" data-signature${L('hero.portrait', 'drag')}>
        <svg class="holo-ring" viewBox="0 0 400 400" aria-hidden="true"><circle cx="200" cy="200" r="190" class="r1"/><circle cx="200" cy="200" r="160" class="r2"/><circle cx="200" cy="200" r="126" class="r3"/><g class="ticks">${Array.from({ length: 72 }, (_, i) => `<line x1="200" y1="${i % 6 ? 14 : 4}" x2="200" y2="22" transform="rotate(${i * 5} 200 200)"/>`).join('')}</g><path class="arc" d="M200 40 A160 160 0 0 1 360 200"/><path class="arc b" d="M200 360 A160 160 0 0 1 40 200"/></svg>
        <picture><source type="image/webp" srcset="/img/portrait-cutout-520.webp 520w, /img/portrait-cutout-820.webp 820w" sizes="(max-width: 900px) 80vw, 430px"><img src="/img/portrait-cutout-820.webp" alt="Jesun Ahmad Ushno in a black coat and turtleneck" width="820" height="932" fetchpriority="high" draggable="false"></picture>
        <span class="holo-scan" aria-hidden="true"></span><span class="holo-lines" aria-hidden="true"></span>
        <span class="brk tl" aria-hidden="true"></span><span class="brk tr" aria-hidden="true"></span><span class="brk bl" aria-hidden="true"></span><span class="brk br" aria-hidden="true"></span>
        <span class="holo-tag t1" aria-hidden="true"><i></i>SUBJECT 0001 / J. A. USHNO</span>
        <span class="holo-tag t2" aria-hidden="true"><i></i>43.65N 79.38W / TORONTO</span>
        <span class="holo-tag t3" aria-hidden="true"><i></i>STATUS <b>ONLINE</b> / FLEET ${seatNames.length + 1}</span>
      </div>
    </div>
    <aside class="rail" aria-label="Key numbers">
      <div class="rail-line"${L('rail.line')}>Every system, a receipt.</div>
      ${stats}
    </aside>
  </div>
</section>

<section class="dossier" id="record" data-section="On record" aria-label="On record">
  <div class="wrap dossier-in">
    <div class="answer"${L('record.answer')}><span class="eyebrow">On record / canonical</span><p>${esc(d.description)}</p></div>
    <ul class="receipts"${L('record.receipts')}>${d.stats.map(s => `<li><b>${esc(s.display)}</b> <span>${esc(s.label)}</span> <small>Source: ${esc(s.source)}${s.date && !String(s.source).includes(s.date) ? ', ' + esc(s.date) : ''}</small></li>`).join('')}<li class="bld"><a href="/build/">Build record and test results</a></li></ul>
  </div>
</section>

<section class="section" id="work" data-section="Selected work">
  <div class="wrap">
    <div class="sec-head"><div class="eyebrow"${L('work.label')}>01 / Selected work</div>${H2('work.title', 'Work that ships<span class="dot">.</span>', 'WORK THAT SHIPS.')}</div>
    <div class="work-tools">
      <div class="chips" role="group" aria-label="Filter work">${cats.map(([c, t], i) => `<button class="chip" type="button" aria-pressed="${i === 0}" data-cat="${c}"${L('filter.' + c)}>${t}</button>`).join('')}</div>
      <label class="search"${L('work.search')}>${svg.search}<span class="sr">Search work</span><input id="workSearch" type="search" placeholder="Search a project..." autocomplete="off"></label>
    </div>
    <div class="grid3" id="workGrid">${cards}</div>
    <p class="empty" id="workEmpty" hidden>No project matches. Clear the search or pick All.</p>
    ${d.record && d.record.studies.length ? `<div class="ship-wrap"${L('work.latest')}><h3>Latest shipped</h3><p class="ship-sub">Synced from GitHub ${esc(d.record.synced)}. Newest first.</p>${latestShipped(d.record, 5, { home: true })}<p style="margin-top:14px"><a class="link" href="/work/#latest">All recent work ${svg.out}</a></p></div>` : ''}
    <div class="clients">
      <div class="clients-label"${L('clients.label')}>Been part of<br><span class="grad">the bigger picture.</span></div>
      <div class="strip" id="strip">${orgs.map((o, i) => `<span class="wm"${L('client.' + i)}>${esc(o)}</span>`).join('')}</div>
      <div class="pager"${L('clients.pager')}><span>${orgs.length} ON RECORD</span><button type="button" id="stripPrev" aria-label="Scroll left"><svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M10 3L5 8l5 5"/></svg></button><button type="button" id="stripNext" aria-label="Scroll right"><svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M6 3l5 5-5 5"/></svg></button></div>
    </div>
  </div>
</section>

${d.record && d.record.studies.length ? homeStudies(d, d.record, L, H2) : ''}

<section class="section" id="ventures" data-section="Ventures">
  <div class="wrap">
    <div class="sec-head"><div class="eyebrow"${L('ventures.label')}>03 / Ventures / offices held</div>${H2('ventures.title', `${['Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven'][d.ventures.length] || d.ventures.length} ventures<span class="dot">.</span><br><span class="grad">One operator.</span>`, `${(['Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven'][d.ventures.length] || d.ventures.length).toUpperCase()} VENTURES.`)}</div>
    <div class="vents">${d.ventures.map(v => `<div class="vent"${L('venture.' + v.slug)}><span class="t">${esc(v.title)}</span><h3>${esc(v.name)}</h3><p>${esc(v.descriptor || v.what)}</p>${v.stage ? `<span class="v-stage">${esc(v.stage)}</span>` : ''}${v.url || v.org ? `<p class="links">${v.url ? `<a href="${esc(v.url)}" target="_blank" rel="noopener">${esc(v.url.replace(/^https:\/\//, ''))}</a>` : ''}${v.org ? `<a href="${esc(v.org)}" target="_blank" rel="noopener">GitHub org</a>` : ''}</p>` : ''}</div>`).join('')}</div>
  </div>
</section>

<section class="section" id="recognition" data-section="Recognition">
  <div class="wrap">
    <div class="sec-head"><div class="eyebrow"${L('rec.label')}>04 / Recognition &amp; Credentials</div>${H2('rec.title', 'The work<span class="dot">.</span><br><span class="grad">The recognition.</span>', 'THE WORK.')}</div>
    <div class="rec">
      <div class="rec-left">
        <div class="big"${L('rec.distinction')}>${laurel('')}<span class="w">DISTINCTION</span>${laurel(' r')}</div>
        <div class="big-label"${L('rec.distinction.label')}>MSc Data Analytics, CGPA 3.9154</div>
        <p class="rec-p"${L('rec.copy', 'type')}>Work held to a standard someone else can check. Every line here has a document behind it.</p>
      </div>
      <div class="rows" aria-label="Selected recognition"><div class="eyebrow"${L('rec.list.label')} style="margin-bottom:14px">Selected recognition</div>${rows}</div>
    </div>
  </div>
</section>

<section class="section" id="proof" data-section="Before and after">
  <div class="wrap proof">
    <div class="proof-left">
      <div class="eyebrow"${L('proof.label')}>05 / A look under the surface</div>
      ${H2('proof.title', 'From noise<span class="dot">.</span><br><span class="grad">To signal.</span>', 'FROM NOISE.')}
      <p class="proof-p"${L('proof.copy', 'type')}>The old site and this rebuild, rendered from the same source bundle. Drag the line.</p>
      <div class="cap"${L('proof.caption')}>JESUNAHMADUSHNO.COM / OCT 2026 TO NOW</div>
    </div>
    <div class="ba" id="ba"${L('proof.slider', 'slide')}>
      <img src="/img/before-old-site.webp" alt="The previous version of jesunahmadushno.com" width="1280" height="800" loading="lazy">
      <img class="after" src="/img/after-rebuild.webp" alt="This rebuild of jesunahmadushno.com" width="1280" height="800" loading="lazy">
      <span class="ba-tag l">BEFORE</span><span class="ba-tag r">AFTER</span>
      <span class="ba-line"></span>
      <span class="ba-handle" id="baHandle" role="slider" tabindex="0" aria-label="Compare before and after" aria-valuemin="0" aria-valuemax="100" aria-valuenow="55">${svg.grip}</span>
    </div>
  </div>
</section>

<section class="section" id="about" data-section="Behind the systems">
  <div class="wrap">
    <div class="eyebrow"${L('about.label')} style="margin-bottom:18px">06 / Behind the systems</div>
    <div class="about-head">${H2('about.title', 'Not just models<span class="dot">.</span><br>But systems that <span class="grad">hold.</span>', 'NOT JUST MODELS.')}<p${L('about.copy', 'type')}>He works across data, models and the software around them. The goal stays the same: a system that runs in production and can show its work.</p></div>
    <div class="cols3">
      <div class="col">
        <div class="sub"${L('edu.label')}>Education</div>
        <div class="edu"${L('edu.msc')}><b>MSc Data Analytics, with Distinction</b><span>University of Niagara Falls Canada, 2026</span></div>
        <div class="edu"${L('edu.bsc')}><b>BSc Computer Engineering</b><span>AIUB, 2018 to 2023</span></div>
        <div class="sub"${L('toolkit.label')}>Toolkit</div>
        <div class="pills">${['Python', 'TypeScript', 'SQL', 'Java', 'Machine Learning', 'RAG', 'Agent Orchestration', 'React / Next.js', 'Power Platform', 'GCP', 'Azure', 'AWS', 'ISO 27001'].map(t => `<span class="pill"${L('skill.' + t.toLowerCase().replace(/[^a-z0-9]+/g, '-'))}>${esc(t)}</span>`).join('')}</div>
        <div class="tiles" aria-label="Main tools">${['Py', 'TS', 'SQL', 'GCP', 'Az', 'AWS'].map(t => `<span class="tile"${L('tile.' + t.toLowerCase())}>${t}</span>`).join('')}</div>
      </div>
      <div class="col">
        <div class="sub"${L('pipeline.label')}>From idea to production</div>
        <div class="steps">${[['SPEC', 'Write down what done means before any code.'], ['PLAN', 'Cut the work into slices that can each be checked.'], ['BUILD', 'Build each slice with its tests next to it.'], ['TEST', 'Run it on real cases, not only the happy path.'], ['SHIP', 'Release it, then check the live version matches the claim.']].map(([t, s], i) => `<div class="step"${L('step.' + t.toLowerCase())}><span class="node">0${i + 1}</span><div><b>${t}</b><span>${s}</span></div></div>`).join('')}</div>
      </div>
      <div class="col">
        <figure class="quote"${L('about.quote', 'drag')}>
          <div class="seal" aria-hidden="true"><svg viewBox="0 0 120 120"><defs><path id="sealp" d="M60 60m-46 0a46 46 0 1 1 92 0a46 46 0 1 1-92 0"/></defs><text><textPath href="#sealp">VERIFIED BEFORE DONE * VERIFIED BEFORE DONE * </textPath></text><circle cx="60" cy="60" r="30"/><path class="tick" d="M46 61l9 9 19-21"/></svg></div>
          <blockquote class="qt">If it can't be verified, it isn't done.</blockquote>
          <ul class="qchecks">${[`${d.stats.length} numbers on this page, each with its source`, d.record && d.record.totals.planLocked ? `${d.record.totals.planLocked} study plans locked before the data` : '', d.record && d.record.totals.dashboards ? `${d.record.totals.dashboards} repositories with a live dashboard` : ''].filter(Boolean).map(t => `<li>${esc(t)}</li>`).join('')}</ul>
          <figcaption><svg class="sig-svg" viewBox="0 0 260 90" role="img" aria-label="Signed, Jesun"><text x="6" y="66">Jesun</text></svg><span class="qf">The rule behind every build</span></figcaption>
        </figure>
      </div>
    </div>
  </div>
</section>

<section class="section" id="journey" data-section="The journey">
  <div class="wrap">
    <div class="sec-head"><div class="eyebrow"${L('journey.label')}>07 / The journey / Dhaka to Toronto</div>${H2('journey.title', 'Keep building<span class="dot">.</span><br>Keep proving<span class="dot">.</span>', 'KEEP BUILDING.')}</div>
    <div class="jour">
      <div class="tl">${tl}</div>
      <div class="col">
        <div class="eyebrow"${L('miles.label')}>Milestones</div>
        <h3 class="h2" style="font-size:clamp(36px,4.4vw,60px)"${L('miles.title')}>Little wins<span class="dot">.</span><br><span class="grad">Big meaning.</span></h3>
        <div class="miles">${miles}</div>
        <p style="margin-top:8px"><a class="link" href="/journey/">The full record ${svg.out}</a></p>
        <figure class="grad-cut protect" data-signature${L('journey.photo', 'drag')}><img src="/img/graduation-cutout-520.webp" srcset="/img/graduation-cutout-520.webp 520w, /img/graduation-cutout-820.webp 820w" sizes="300px" alt="Jesun Ahmad Ushno in graduation regalia holding his University of Niagara Falls Canada folder" width="520" height="743" loading="lazy" draggable="false"><figcaption>MSc, with Distinction / 21 Jun 2026</figcaption></figure>
      </div>
    </div>
  </div>
</section>

<section class="section" id="testimony" data-section="Testimony">
  <div class="wrap">
    <div class="sec-head"><div class="eyebrow"${L('said.label')}>08 / Testimony / verbatim</div>${H2('said.title', 'In their words<span class="dot">.</span>', 'IN THEIR WORDS.')}</div>
    <div class="tq">${quotes}</div>
    <p style="margin-top:24px"><a class="link" href="/about/#testimony">All ten recommendations ${svg.out}</a></p>
  </div>
</section>

<section class="section" id="lab" data-section="The Lab">
  <div class="wrap labx">
    <div><div class="eyebrow"${L('lab.label')} style="margin-bottom:18px">09 / The Lab</div>${H2('lab.title', 'His papers<span class="dot">.</span><br><span class="grad">Running live.</span>', 'HIS PAPERS.')}</div>
    <div><p${L('lab.copy')}>A terminal, a twin that answers from the record, his agent fleet as a seat map, four game engines to challenge, and live versions of his two published methods: wavelet defect detection and elitist particle swarm optimisation. All in your browser.</p>
    <div class="labviz"${L('lab.viz')}><canvas id="labviz" aria-label="A particle swarm converging on the global minimum, looping" role="img"></canvas><span class="lv-tag">ELITIST PSO / LIVE / <b id="lv-best">f = ...</b></span></div>
    <div class="acts"${L('lab.cta')}><a class="btn" href="/lab/">Enter the Lab ${svg.out}</a><a class="btn ghost" href="/lab/#system">See the fleet</a></div></div>
  </div>
  <div class="wrap labtiles">
    <a class="ltile lt-wave" href="/lab/#wall"${L('lab.tile.wave', 'drag')}><canvas class="wave-mini" aria-hidden="true"></canvas><span class="lt-k">Paper 2023 / wavelet scan</span><b>Find the flaw in the weave.</b><span class="lt-s">A 3-level Haar transform flags blocks that break the pattern. Live.</span></a>
    <div class="ltile lt-arc"${L('lab.tile.arcade', 'drag')}><span class="lt-k">Arcade / four engines</span><b>Challenge the machine.</b><div class="lt-games">${[['chess', 'Chess'], ['c4', 'Connect Four'], ['ttt', 'Tic-tac-toe'], ['rps', 'Mind reader']].map(([g, n]) => `<a href="/lab/#${g}" class="lg lg-${g}">${n}</a>`).join('')}</div><span class="lt-s">Alpha-beta, perfect minimax, and a model that learns your habits.</span></div>
    <a class="ltile lt-term" href="/lab/#terminal"${L('lab.tile.term', 'drag')}><pre aria-hidden="true"><span>$ whoami</span>
<span class="o">jesun ahmad ushno / toronto</span>
<span>$ studies --rung evaluated</span>
<span class="o">${esc(d.record ? String(d.record.counts.Evaluated || 0) : '0')} studies</span>
<span>$ ask what did he publish<i class="cur"></i></span></pre><span class="lt-k">Terminal / twin</span><b>Ask the record.</b><span class="lt-s">Answers come only from this site, with sources.</span></a>
  </div>
</section>

<section class="section" id="contact" data-section="Contact">
  <div class="wrap">
    <div class="eyebrow"${L('contact.label')}>10 / Your next system</div>
    <div class="contact">
      <div class="col">
        ${H2('contact.title', 'Let\'s work<br>together<span class="dot">.</span>', 'LET\'S WORK TOGETHER.')}
        <p class="invite"${L('contact.copy', 'type')}>Have a system to build? Send a brief. He reads every one himself.</p>
        <form class="bform" id="brief" data-endpoint="/api/contact" data-fallback="${esc(d.site.contactEndpoint)}" novalidate${L('contact.form')}>
          <div class="r3"><label>Mandate<select name="type"><option value="Venture partnership">Venture</option><option value="Advisory mandate">Advisory</option><option value="Engineering mandate">Engineering</option><option value="Research collaboration">Research</option><option value="Speaking">Speaking</option><option value="Other">Other</option></select></label><label>Budget (CAD)<select name="budget"><option>To discuss</option><option>Under 25k</option><option>25k to 100k</option><option>100k and above</option></select></label><label>Timeline<select name="timeline"><option>Exploratory</option><option>This quarter</option><option>Next quarter</option><option>Ongoing</option></select></label></div>
          <div class="r2"><label>Name<input name="name" autocomplete="name" required></label><label>Email<input name="email" type="email" autocomplete="email" required></label></div>
          <label>The brief<textarea name="message" required placeholder="What you are building, what you need, what good looks like."></textarea></label>
          <div class="hp" aria-hidden="true"><label>Leave empty<input name="_honey" tabindex="-1" autocomplete="off"></label></div>
          <div><button class="btn" type="submit">Send the brief ${svg.out}</button></div>
          <p class="status" id="brief-status" role="status" aria-live="polite"></p>
        </form>
      </div>
      <div class="clist">
        <div class="ci"${L('contact.email')}><span class="ic">${svg.mail}</span><div><small>EMAIL</small><span class="v">${esc(d.site.email)}<button class="copy" type="button" data-copy="${esc(d.site.email)}">Copy</button></span></div></div>
        ${prof.map((p, i) => `<div class="ci"${L('contact.p' + i)}><span class="ic ic-t">${p.name === 'GitHub' ? svg.code : esc({ LinkedIn: 'in', YouTube: 'yt', 'about.me': 'me' }[p.name] || p.name.slice(0, 2).toLowerCase())}</span><div><small>${esc(p.name.toUpperCase())}</small><span class="v"><a href="${esc(p.url)}" target="_blank" rel="me noopener">${esc(p.handle)}</a></span></div></div>`).join('')}
        <div class="ci"${L('contact.based')}><span class="ic">${svg.pin}</span><div><small>BASED IN</small><span class="v">Toronto, Canada</span></div></div>
      </div>
      <a class="reel" id="reelCard" href="/lab/"${L('contact.reel', 'drag')}><span class="eyebrow">THE LAB</span><div class="reel-row"><span class="reel-h">Ship the<br><span class="grad">real thing.</span></span><span class="reel-go">${svg.out}</span></div></a>
    </div>
  </div>
</section>
</main>

<footer class="foot2" data-section="Footer">
  <div class="wrap">
    <div class="cols">
      <div><h2>Toronto, local time</h2><div class="clock" data-clock>--:--:--</div><p class="eyebrow">${esc(d.site.coordinates)}</p><p class="eyebrow" style="margin-top:14px">Press <kbd class="kk">\`</kbd> for the console, <kbd class="kk">Ctrl K</kbd> to search the record</p></div>
      <div><h2>Record</h2><ul><li><a href="/work/">Work</a></li><li><a href="/journey/">Journey</a></li><li><a href="/about/">About</a></li><li><a href="/resume/">Resume</a></li><li><a href="/writing/">Writing</a></li><li><a href="/journal/">Journal</a></li><li><a href="/now/">Now</a></li><li><a href="/roadmap/">Roadmaps</a></li><li><a href="/bangla/">Bangla</a></li></ul></div>
      <div><h2>Profiles</h2><ul>${prof.map(p => `<li><a href="${esc(p.url)}" target="_blank" rel="me noopener">${esc(p.name)}</a></li>`).join('')}<li><a href="/contact/">Contact</a></li><li><a href="/guestbook/">Guestbook</a></li></ul></div>
      <div><h2>System</h2><ul><li><button class="linkish" type="button" data-replay>Replay the build</button></li><li><button class="linkish" type="button" data-palette>Command palette</button></li><li><button class="linkish" type="button" data-grid-toggle>Grid overlay</button></li><li><button class="linkish" type="button" data-motion-toggle aria-pressed="false">Reduce motion</button></li><li><a href="/build/">Build record</a></li><li><a href="/lab/">Lab</a></li><li><a href="/uses/">Uses</a></li><li><a href="/patterns/">Patterns registry</a></li><li><a href="/legal/">Legal and privacy</a></li></ul></div>
    </div>
    <div class="support-links"><nav aria-label="Support this work"><a href="https://github.com/sponsors/JesunAhmadUshno">Sponsor this work</a><a href="https://github.com/sponsors/JesunAhmadUshno">Donate</a><a href="https://buymeacoffee.com/jesun">Buy Me a Coffee</a><a href="https://calendly.com/jesunahmadushno/30min">Work with me</a></nav></div>
<div class="base"><span>&copy; ${new Date().getFullYear()} JESUN AHMAD USHNO. ALL RIGHTS RESERVED. <span data-hits></span></span><span>BUILD ${fp}</span></div>
    <a href="/trap/" class="hp" tabindex="-1" aria-hidden="true" rel="nofollow">archive index</a>
    <i hidden data-fp="${fp}"></i>
  </div>
</footer>

<nav class="srail" aria-label="Sections">${[['home', '00', 'Hero'], ['work', '01', 'Work'], ['studies', '02', 'Studies'], ['ventures', '03', 'Ventures'], ['recognition', '04', 'Recognition'], ['proof', '05', 'Before after'], ['about', '06', 'Systems'], ['journey', '07', 'Journey'], ['testimony', '08', 'Testimony'], ['lab', '09', 'Lab'], ['contact', '10', 'Contact']].map(([id, n, t]) => `<a href="#${id}" data-rail="${id}"><span>${n}</span><em>${t}</em></a>`).join('')}<i class="srail-prog" aria-hidden="true"></i></nav>
<button class="dock" id="dock" type="button" hidden aria-haspopup="dialog" aria-controls="console" aria-label="Open the fleet console"><i></i><span id="dock-text">FLEET ONLINE</span><kbd>\`</kbd></button>
<div class="console" id="console" role="dialog" aria-modal="true" aria-label="Console" hidden><div class="con-h"><span>jesun@fleet:~$</span><span>ESC to close</span></div><div class="con-out" id="con-out" role="log" aria-live="polite"></div><label class="con-in"><span aria-hidden="true">&gt;</span><span class="sr">Console command</span><input id="con-in" autocomplete="off" spellcheck="false" autocapitalize="off"></label></div>
<div class="hcur" id="hcur" aria-hidden="true"><i class="h"></i><i class="v"></i><b></b><span></span></div>
<div class="rulers" aria-hidden="true"></div>
<div id="boot" hidden aria-hidden="true"><canvas id="matrix"></canvas><div class="scanlines"></div><div class="boot-box" id="boot-box"></div></div>
<div id="agent-layer" aria-hidden="true" hidden><canvas id="trail"></canvas><div id="sel-layer"></div></div>
<aside id="feed" hidden aria-hidden="true"><div class="fh"><img src="/img/avatar-head-96.webp" alt="" width="26" height="26"><div><b>Jesun Agent Portfolio</b><span id="feed-meta">Building jesunahmadushno.com</span></div><i class="spin"></i></div><div class="sum" id="feed-sum">Starting the fleet...</div><ol id="feed-list"></ol></aside>
<button id="skip" type="button" hidden>Skip the build</button>
<div id="hud" role="region" aria-label="Build controls" hidden>
  <div class="hud-live">
    <span class="hud-dots" id="hudDots"></span><span id="hudAgents">18 agents</span>
    <span class="hud-track"><span class="hud-fill" id="hudFill"></span></span>
    <span class="hud-count" id="hudCount">0 / 0 layers</span>
    <button class="hud-btn" id="hudPause" type="button" aria-pressed="false">Touring</button>
    <select id="hudSpeed" aria-label="Build speed"><option value="1">1x</option><option value="2">2x</option><option value="4">4x</option></select>
    <button class="hud-btn ghost" id="hudChaos" type="button" title="Make one agent fail. The foreman reassigns its task.">Fail a seat</button>
  </div>
  <div class="hud-done"><span id="hudDoneText">Built</span><button class="hud-btn" id="hudReplay" type="button">Replay</button></div>
  <button class="hud-x" id="hudClose" type="button" aria-label="End the build">${svg.x}</button>
</div>
</div>`;
}
