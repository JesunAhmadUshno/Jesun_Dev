// Shared template parts. Copyright Jesun Ahmad Ushno. All rights reserved.
export const esc = s => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
export const icon = {
  arrow: '<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M3 8h10M9 4l4 4-4 4"/></svg>',
  out: '<svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M5 11L11 5M6 5h5v5"/></svg>',
  grip: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M6 4L2 8l4 4M10 4l4 4-4 4"/></svg>',
  search: '<svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><circle cx="7" cy="7" r="5"/><path d="M11 11l4 4"/></svg>'
};
export const NAV = [['Work', '/work/'], ['Studies', '/studies/'], ['Lab', '/lab/'], ['Journey', '/journey/'], ['About', '/about/'], ['Writing', '/writing/'], ['Now', '/now/'], ['Contact', '/contact/']];

export function header(path) {
  const links = NAV.map(([t, h]) => `<a href="${h}"${path.startsWith(h) ? ' aria-current="page"' : ''}>${t}</a>`).join('');
  return `<a class="skiplink" href="#main">Skip to content</a>
<header class="top" role="banner"><div class="wrap top-in">
<a class="brand" href="/" aria-label="Jesun Ahmad Ushno, home">JESUN<span class="dot">.</span></a>
<nav class="nav" id="site-nav" aria-label="Main">${links}</nav>
<button class="kbtn menu-btn" type="button" aria-expanded="false" aria-controls="site-nav">Menu</button>
<button class="kbtn" type="button" data-palette aria-label="Open command palette"><kbd class="k-mod">Ctrl</kbd><kbd>K</kbd><span class="k-label">Command</span></button>
</div></header>`;
}

export function footer(d, fp) {
  const prof = d.profiles.filter(p => p.verified).map(p => `<li><a href="${esc(p.url)}" rel="me noopener" target="_blank">${esc(p.name)}</a></li>`).join('');
  return `<footer class="foot" role="contentinfo"><div class="wrap">
<div class="foot-grid">
<div><h2>Toronto, local time</h2><div class="clock num" data-clock>--:--:--</div><p class="label">${esc(d.site.coordinates)}</p></div>
<div><h2>Record</h2><ul><li><a href="/work/">Work</a></li><li><a href="/studies/">Studies</a></li><li><a href="/journey/">Journey</a></li><li><a href="/about/">About</a></li><li><a href="/resume/">Resume</a></li><li><a href="/writing/">Writing</a></li><li><a href="/journal/">Journal</a></li><li><a href="/now/">Now</a></li><li><a href="/roadmap/">Roadmaps</a></li><li><a href="/bangla/">Bangla</a></li></ul></div>
<div><h2>Profiles</h2><ul>${prof}<li><a href="/contact/">Contact</a></li></ul></div>
<div><h2>System</h2><ul><li><button class="linkish" type="button" data-replay>Replay the build</button></li><li><button class="linkish" type="button" data-palette>Command palette</button></li><li><button class="linkish" type="button" data-grid-toggle>Grid overlay</button></li><li><a href="/lab/">Lab</a></li><li><a href="/uses/">Uses</a></li><li><a href="/patterns/">Patterns registry</a></li><li><a href="/legal/">Legal and privacy</a></li><li><a href="#main">Back to top</a></li></ul></div>
</div>
<div class="foot-base"><span class="label">&copy; ${new Date().getFullYear()} Jesun Ahmad Ushno. All rights reserved. Design, code, copy and interaction patterns are his property.</span><span class="label">Built with HTML, CSS and plain JavaScript. Inter, Inter Display, DejaVu Sans Mono. No trackers. Build <b>${fp}</b></span></div>
<a href="/trap/" class="hp" tabindex="-1" aria-hidden="true" rel="nofollow">archive index</a>
<i hidden data-fp="${fp}"></i>
</div></footer>`;
}

export function layout({ d, path, title, desc, body, fp, jsonld, ogImage, type = 'website', bodyAttrs = '', head = '', noindex = false, hreflang = '', css = '/css/site.css', script = '/js/main.js', chrome = true }) {
  const url = d.site.url + path;
  const robots = noindex ? 'noindex, nofollow, noai, noimageai' : 'index, follow, max-image-preview:large, noai, noimageai';
  const csp = "default-src 'self'; script-src 'self' https://static.cloudflareinsights.com; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self' https://formsubmit.co https://cloudflareinsights.com; form-action 'self' https://formsubmit.co; base-uri 'self'; object-src 'none'";
  const analytics = d.site.analytics.token ? `<script defer src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon='{"token":"${esc(d.site.analytics.token)}"}'></script>` : '';
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta http-equiv="Content-Security-Policy" content="${csp}">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<meta name="robots" content="${robots}">
<meta name="author" content="Jesun Ahmad Ushno">
<meta name="theme-color" content="#0B0B0C">
<meta name="build" content="${fp}">
${path === '/' ? '<meta name="page" content="home">' : ''}
<link rel="canonical" href="${url}">
${hreflang}
<meta property="og:type" content="${type}">
<meta property="og:site_name" content="Jesun Ahmad Ushno">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${d.site.url}${ogImage}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="/favicon.png" type="image/png" sizes="192x192">
<link rel="icon" href="/img/icon-32.png" type="image/png" sizes="32x32">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
<link rel="alternate" type="application/rss+xml" title="Writing, Jesun Ahmad Ushno" href="/writing/feed.xml">
<link rel="alternate" type="application/rss+xml" title="Journal, Jesun Ahmad Ushno" href="/journal/feed.xml">
<link rel="preload" href="/fonts/Anton.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/fonts/Manrope.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="${css}?v=${fp}">
<script src="/js/arm.js?v=${fp}"></script>
${head}
<script type="application/ld+json">${JSON.stringify(jsonld)}</script>
${analytics}
</head>
<body${bodyAttrs}>
${chrome ? `${header(path)}
<main id="main" tabindex="-1">
${body}
</main>
${footer(d, fp)}` : body}
<script type="module" src="${script}?v=${fp}"></script>
</body>
</html>`;
}

export function secHead({ label, title, side = '', layer = '' }) {
  const L = n => (layer ? ` data-layer="${layer}.${n}"` : '');
  return `<div class="sec-head"><p class="label"${L('label')}>${label}</p><h2 class="h2"${L('title')}${layer ? ' data-entry="drag"' : ''}>${title}</h2>${side ? `<p class="side"${L('side')}>${side}</p>` : ''}</div>`;
}

export function projectCard(p, layer) {
  const proof = [p.repo && `<a href="${esc(p.repo)}" target="_blank" rel="noopener">Repo ${icon.out}</a>`, p.demo && `<a href="${esc(p.demo)}"${p.demo.startsWith('http') ? ' target="_blank" rel="noopener"' : ''}>${p.demo.startsWith('/') ? 'Run it' : 'Live demo'} ${icon.out}</a>`, p.paper && `<a href="${esc(p.paper)}" target="_blank" rel="noopener">Paper ${icon.out}</a>`].filter(Boolean).join('');
  const glyph = p.name.replace(/[^A-Za-z]/g, '').slice(0, 2).toUpperCase();
  const search = (p.name + ' ' + p.summary + ' ' + p.stack.join(' ') + ' ' + p.catLabel).toLowerCase();
  return `<article class="card" data-cat="${p.cat}" data-search="${esc(search)}"${layer ? ` data-layer="work.${p.slug}" data-entry="drag"` : ''}><div class="card-in">
<div class="card-art" aria-hidden="true"><div class="spec"><b>${esc(p.catLabel)}</b>${p.stack.slice(0, 3).map(s => `<span>${esc(s)}</span>`).join('')}</div><span class="glyph">${glyph}</span><canvas class="gen" data-seed="${esc(p.slug)}"></canvas></div>
<div class="card-body"><div class="card-top"><h3><a href="/projects/${p.slug}.html">${esc(p.name)}</a></h3><span class="label">${esc(p.year || p.catLabel.split(' /')[0])}</span></div>
<p>${esc(p.summary)}</p><div class="proof">${proof}</div></div></div></article>`;
}

export function workGrid(projects, { layer = false, all = true } = {}) {
  const cats = [['all', 'All'], ['agents', 'Agents'], ['ml', 'ML'], ['data', 'Data / Privacy'], ['research', 'Research']].filter(([c]) => c === 'all' || projects.some(p => p.cat === c));
  return `<div class="tools"><div class="chips" role="group" aria-label="Filter work">${cats.map(([c, t], i) => `<button class="chip" type="button" data-cat-btn="${c}" aria-pressed="${i === 0}"${layer ? ` data-layer="filter.${c}"` : ''}>${t}</button>`).join('')}</div>
<label class="search"${layer ? ' data-layer="work.search"' : ''}>${icon.search}<span class="sr">Search work</span><input type="search" data-search placeholder="Search work..." autocomplete="off"></label></div>
<p class="label" aria-live="polite"><span data-shown>${projects.length}</span> of ${projects.length} records shown</p>
<div class="grid" data-grid>${projects.map(p => projectCard(p, layer)).join('')}</div>
<p class="empty" data-empty hidden>No record matches. Clear the search or pick All.</p>`;
}

export function picture(name, alt, { w = 760, h, cls = '', eager = false, sizes = '(max-width: 900px) 90vw, 460px' } = {}) {
  return `<picture><source type="image/webp" srcset="/img/${name}-480.webp 480w, /img/${name}-760.webp 760w" sizes="${sizes}"><img class="${cls}" src="/img/${name}-760.jpg" srcset="/img/${name}-480.jpg 480w, /img/${name}-760.jpg 760w" sizes="${sizes}" alt="${esc(alt)}" width="${w}" height="${h}" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async"></picture>`;
}

export function brief(d, compact = false) {
  return `<form class="brief" id="brief" action="${esc(d.site.contactEndpoint)}" method="post" novalidate>
<div class="row">
<div class="field"><label for="b-type">Mandate type</label><select id="b-type" name="type"><option>Venture partnership</option><option>Advisory mandate</option><option>Engineering mandate</option><option>Research collaboration</option><option>Speaking</option><option>Other</option></select></div>
<div class="field"><label for="b-budget">Budget band (CAD)</label><select id="b-budget" name="budget"><option>Prefer to discuss</option><option>Under 25k</option><option>25k to 100k</option><option>100k and above</option></select></div>
<div class="field"><label for="b-time">Timeline</label><select id="b-time" name="timeline"><option>Exploratory</option><option>This quarter</option><option>Next quarter</option><option>Ongoing</option></select></div>
</div>
<div class="row" style="grid-template-columns:1fr 1fr"><div class="field"><label for="b-name">Name</label><input id="b-name" name="name" autocomplete="name" required></div><div class="field"><label for="b-email">Email</label><input id="b-email" name="email" type="email" autocomplete="email" required></div></div>
<div class="field"><label for="b-msg">The brief</label><textarea id="b-msg" name="message" required placeholder="What you are building, what you need, and what good looks like."></textarea></div>
<div class="hp" aria-hidden="true"><label for="b-honey">Leave empty</label><input id="b-honey" name="_honey" tabindex="-1" autocomplete="off"></div>
<div><button class="btn" type="submit">Send the brief ${icon.arrow}</button></div>
<p class="status" id="brief-status" role="status" aria-live="polite"></p>
${compact ? '' : '<p class="src">The form sends your name, email and brief to Jesun\'s inbox through FormSubmit. Nothing else is collected. See <a href="/legal/#privacy">privacy</a>.</p>'}
</form>`;
}

export function cutout(name, alt, w, h, sizes = '(max-width: 900px) 90vw, 460px') {
  return `<img class="cutimg" src="/img/${name}-820.webp" srcset="/img/${name}-520.webp 520w, /img/${name}-820.webp 820w" sizes="${sizes}" alt="${esc(alt)}" width="${w}" height="${h}" loading="lazy" decoding="async" draggable="false">`;
}

// Photo frames: the site's own treatment for real photographs. Corner brackets, a mono caption,
// and a scan sweep on hover. Every frame states where and when, so a photo carries a receipt too.
export function frames(items, { cls = '' } = {}) {
  return `<div class="frames ${cls}">${items.map(f => {
    const ws = f.widths, big = ws[ws.length - 1];
    const srcset = ws.map(w => `/img/${f.name}-${w}.webp ${w}w`).join(', ');
    return `<figure class="frm" data-protect>
<span class="frm-br tl" aria-hidden="true"></span><span class="frm-br tr" aria-hidden="true"></span><span class="frm-br bl" aria-hidden="true"></span><span class="frm-br br" aria-hidden="true"></span>
<img src="/img/${f.name}-${big}.webp" srcset="${srcset}" sizes="${f.sizes || '(max-width: 760px) 92vw, 340px'}" alt="${esc(f.alt)}" width="${f.w}" height="${f.h}" loading="lazy" decoding="async" draggable="false">
<span class="frm-scan" aria-hidden="true"></span>
<figcaption><b>${esc(f.cap)}</b><span>${esc(f.tag)}</span></figcaption></figure>`;
  }).join('')}</div>`;
}
