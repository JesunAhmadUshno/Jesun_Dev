import { useEffect, useMemo, useRef, useState } from 'react';
import twinSrc from '../../assets/js/twin.js?raw';
import twinDataSrc from '../../assets/js/twin-data.js?raw';
import strings from '../../content-strings.json';
import reviewMd from '../../docs/research-review.md?raw';
import pyUrl from '../../assets/jesun/jesun.py?url';
import audit from './data/audit.json';
import anatomy from './data/anatomy.json';
import langTable from './data/lang.json';
import { loadTwin } from './twin-core.mjs';
import { parity } from './parity.mjs';

const REPO = 'https://github.com/JesunAhmadUshno/Jesun_Dev';
const HOME = 'https://jesunahmadushno.com/';
const blob = (p, line) => `${REPO}/blob/main/${p}${line ? `#L${line}` : ''}`;
const fmt = (n) => n.toLocaleString('en-US');

const twin = loadTwin(twinSrc, twinDataSrc);
const par = parity(strings);
const examples = Object.fromEntries(
  Object.entries(import.meta.glob('../../assets/jesun/examples/*.jc', { query: '?raw', import: 'default', eager: true }))
    .map(([p, src]) => [p.split('/').pop(), src]),
);
const VERSION = anatomy.constants.VERSION;

const SECTIONS = [['top', 'Overview', '◎'], ['playground', 'Playground', '❯_'], ['twin', 'Twin', '?'], ['parity', 'Parity', 'অ'], ['audit', 'Site audit', '✓'], ['anatomy', 'Interpreter', '{}'], ['scorecard', 'Scorecard', '▤']];

function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll('.reveal');
    if (!('IntersectionObserver' in window)) { els.forEach((e) => e.classList.add('in')); return; }
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: 0.08 });
    els.forEach((e) => io.observe(e));
    return () => io.disconnect();
  }, []);
}

function MenuBar() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => { const t = setInterval(() => setNow(new Date()), 30000); return () => clearInterval(t); }, []);
  return (
    <div className="menubar" role="banner">
      <span className="apple" aria-hidden="true">◆</span>
      <a className="app" href="#top">Jesun.Dev Lab</a>
      <a className="m" href={HOME}>jesunahmadushno.com</a>
      <a className="m" href={blob('docs/research-review.md')}>Review</a>
      <span className="spacer" />
      <span className="status"><i /> Checked at build</span>
      <a href={REPO}>GitHub ↗</a>
      <span className="clock">{now.toLocaleString('en-US', { weekday: 'short', hour: 'numeric', minute: '2-digit' })}</span>
    </div>
  );
}

function Dock() {
  const [active, setActive] = useState('top');
  useEffect(() => {
    const io = new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting && setActive(e.target.id)), { rootMargin: '-45% 0px -50% 0px' });
    SECTIONS.forEach(([id]) => { const el = document.getElementById(id); if (el) io.observe(el); });
    return () => io.disconnect();
  }, []);
  return (
    <nav className="dock" aria-label="Sections">
      {SECTIONS.map(([id, label, icon]) => (
        <a key={id} href={`#${id}`} className={active === id ? 'on' : ''} aria-current={active === id ? 'true' : undefined}>
          <span className="ico" aria-hidden="true">{icon}</span><span className="lbl">{label}</span>
        </a>
      ))}
    </nav>
  );
}

// Inline markdown used by the review doc: `code` and **bold** only.
function Md({ text }) {
  return text.split(/(`[^`]+`|\*\*[^*]+\*\*)/).map((s, i) => {
    if (s.startsWith('`')) {
      const p = s.slice(1, -1);
      return /^[\w./-]+\.(js|mjs|json|py|html|md|yml|xml|txt)$|^CNAME$|^\.gitignore$/.test(p) ? <a key={i} href={blob(p)}><code>{p}</code></a> : <code key={i}>{p}</code>;
    }
    if (s.startsWith('**')) return <b key={i}>{s.slice(2, -2)}</b>;
    return s;
  });
}

export default function App() {
  useReveal();
  return (
    <div className="wrap">
      <MenuBar />
      <div className="glow" aria-hidden="true" />
      <Hero />
      <Playground />
      <Twin />
      <Parity />
      <Audit />
      <Anatomy />
      <Scorecard />
      <Dock />
      <footer>
        <a href={HOME}>jesunahmadushno.com</a> · <a href={REPO}>GitHub</a> · <a href={blob('LICENSE')}>MIT licence</a>
        <br />Every number on this page is read from the repository at build time; the twin and parity views compute live from the same files, and the playground runs the real vendored interpreter.
      </footer>
    </div>
  );
}

function Hero() {
  const lp = SOURCES.lang.par, lgaps = gapsOf(lp).length;
  return (
    <header className="card hero window" id="top" data-title="Jesun_Dev — README">
      <div className="head">
        <p className="eyebrow">Static portfolio · no server · EN and বাংলা</p>
        <span className="pill info">● interpreter v{VERSION}</span>
      </div>
      <h1>A portfolio that runs <em>its own language</em> and its own Q&amp;A twin in your browser.</h1>
      <p className="sub">
        jesunahmadushno.com is plain static files. Inside it are a vendored Jesun.Code interpreter that runs in Pyodide, a rule-based bilingual twin
        that answers from site data, and a full English and Bangla string table. This dashboard runs those same files and checks them on every build.
      </p>
      <div className="actions">
        <a className="btn primary" href="#playground">Run Jesun.Code</a>
        <a className="btn ghost" href="#twin">Ask the twin</a>
        <span className="hint">Checks run with <code>npm run build</code> in <code>site/</code></span>
      </div>
      <div className="tiles">
        <div className="tile"><div className="num">{twin.data.entries.length}</div><div className="cap">twin topics in <a href={blob('assets/js/twin-data.js')}>twin-data.js</a></div></div>
        <div className="tile"><div className="num">{lp.enCount}/{lp.bnCount}</div><div className="cap">EN / BN keys in <a href={blob(SOURCES.lang.file)}>lang.js</a>, {lgaps ? `${lgaps} without English` : 'full parity'}</div></div>
        <div className="tile"><div className="num">{audit.pages.length}</div><div className="cap">pages in <a href={blob('sitemap.xml')}>sitemap.xml</a>, all audited</div></div>
        <div className="tile"><div className="num">{anatomy.nodes.length}</div><div className="cap">syntax-tree node classes in <a href={blob(anatomy.file)}>jesun.py</a></div></div>
      </div>
    </header>
  );
}

function Playground() {
  const names = Object.keys(examples);
  const [name, setName] = useState(names.includes('hello.jc') ? 'hello.jc' : names[0]);
  const [src, setSrc] = useState(examples[name]);
  const [stdin, setStdin] = useState('Mara');
  const [state, setState] = useState({ phase: 'idle', out: '', ms: null, version: null });
  const worker = useRef(null);
  useEffect(() => () => worker.current?.terminate(), []);

  const pick = (n) => { setName(n); setSrc(examples[n]); };
  const run = () => {
    if (!worker.current) {
      worker.current = new Worker(new URL('./jc-worker.js', import.meta.url));
      worker.current.onmessage = (e) => {
        const m = e.data;
        if (m.type === 'ready') setState((s) => ({ ...s, version: m.version, phase: 'running' }));
        if (m.type === 'done') setState((s) => ({ ...s, phase: 'done', out: m.output, ms: m.ms }));
        if (m.type === 'error') { setState((s) => ({ ...s, phase: 'error', out: `Could not start the runner: ${m.message}` })); worker.current?.terminate(); worker.current = null; }
      };
      setState((s) => ({ ...s, phase: 'loading', out: '' }));
    } else setState((s) => ({ ...s, phase: 'running', out: '' }));
    worker.current.postMessage({ type: 'run', source: src, stdin: stdin + '\n', pyUrl: new URL(pyUrl, location.href).href });
  };
  const stop = () => { worker.current?.terminate(); worker.current = null; setState((s) => ({ ...s, phase: 'stopped', out: s.out || 'Stopped. The next run starts a fresh interpreter.' })); };
  const busy = state.phase === 'loading' || state.phase === 'running';
  const status = { idle: 'Not started: nothing is downloaded until you press Run', loading: 'Downloading Pyodide 0.26.4 (about 10 MB, first run only)…', running: 'Running…', done: `Finished in ${state.ms?.toFixed(0)} ms`, stopped: 'Stopped', error: 'Runner failed to start' }[state.phase];

  return (
    <section id="playground" className="card window reveal" data-title="playground.jc — Jesun.Code">
      <div className="head">
        <div>
          <p className="eyebrow">Live, in your browser</p>
          <h2>Write English, get output: the real interpreter, not a mock-up.</h2>
          <p className="sub">
            The vendored <a href={blob(anatomy.file)}>jesun.py</a> ({fmt(anatomy.lines)} lines) runs inside Pyodide in a Web Worker, the same way the homepage’s{' '}
            <a href={blob('assets/js/py-worker.js')}>py-worker.js</a> does. Its own <code>VERSION</code> reads <b>{VERSION}</b>; the site headline advertises a newer Jesun.Code release that is not vendored here.
          </p>
        </div>
        <span className={`pill ${state.phase === 'error' ? 'bad' : state.version ? 'good' : 'info'}`}>{state.version ? `jesun.VERSION = ${state.version}` : `interpreter v${VERSION}`}</span>
      </div>
      <div className="seg wrapseg" role="group" aria-label="Example program">
        {names.map((n) => <button key={n} aria-pressed={name === n} onClick={() => pick(n)}>{n}</button>)}
      </div>
      <div className="grid2 jc">
        <div className="field">
          <label htmlFor="jc-src">Program <span>{src.split('\n').length} lines</span></label>
          <textarea id="jc-src" className="code" spellCheck="false" value={src} onChange={(e) => setSrc(e.target.value)} rows={16} />
        </div>
        <div className="field">
          <label htmlFor="jc-out">Output <span>{status}</span></label>
          <pre id="jc-out" className="code out" aria-live="polite" tabIndex={0}>{state.out || (state.phase === 'idle' ? 'Press Run to start the interpreter.' : '')}</pre>
        </div>
      </div>
      <div className="actions" style={{ marginTop: 12 }}>
        <div className="field stdin"><label htmlFor="jc-in">Typed input for the program’s ask lines</label><input id="jc-in" type="text" value={stdin} onChange={(e) => setStdin(e.target.value)} /></div>
        <button className="btn primary" onClick={run} disabled={busy}>{busy ? 'Running…' : 'Run'}</button>
        <button className="btn ghost" onClick={stop} disabled={!busy}>Stop</button>
      </div>
      <p className="hint">
        Limits read from source: call depth {anatomy.constants.MAX_CALL_DEPTH}, loop runs {fmt(anatomy.constants.MAX_LOOP_RUNS)}. Phase-2 statements (ask ai, terminals, agents) need a host machine and are not exercised here.
        The build runs all {names.length} examples through CPython and checks known answers (for example factorial of 5 is 120).
      </p>
    </section>
  );
}

function Twin() {
  const [lang, setLang] = useState('en');
  const [q, setQ] = useState('What is Jesun.Code?');
  const r = useMemo(() => twin.rank(q), [q]);
  const answer = twin.twinAnswer(q, lang);
  const top = r.scores[0];
  const matched = top && top.score >= 1 ? top.id : null;
  const selfRoute = useMemo(() => {
    const misses = []; let total = 0;
    for (const e of twin.data.entries) for (const k of e.keys) { total++; if (twin.twinAnswer(k, 'en') !== e.a.en) misses.push([e.id, k]); }
    return { total, misses };
  }, []);
  const shown = r.scores.slice(0, 8);
  const max = Math.max(2, ...shown.map((s) => s.score));
  const W = 460, rowH = 26, H = shown.length * rowH + 24, l = 110, rr = 36;
  const x = (v) => l + (v / max) * (W - l - rr);
  return (
    <section id="twin" className="card window reveal" data-title="twin.js — ask the twin">
      <div className="head">
        <div>
          <p className="eyebrow">Live, rule-based</p>
          <h2>Ask a question and see exactly why the twin answered it.</h2>
          <p className="sub">
            This runs the homepage’s own <a href={blob('assets/js/twin.js')}>twin.js</a> over <a href={blob('assets/js/twin-data.js')}>twin-data.js</a>, unchanged.
            It is keyword matching, not a language model: each topic scores the best fuzzy match per keyword, and an answer needs a score of at least 1. Nothing leaves your browser.
          </p>
        </div>
        <div className="seg" role="group" aria-label="Answer language">
          {[['en', 'English'], ['bn', 'বাংলা']].map(([k, t]) => <button key={k} aria-pressed={lang === k} onClick={() => setLang(k)}>{t}</button>)}
        </div>
      </div>
      <div className="field">
        <label htmlFor="twin-q">Your question <span>{r.tokens.length ? `tokens: ${r.tokens.join(' · ')}` : 'no content words'}</span></label>
        <input id="twin-q" type="text" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      <div className="chips">
        {twin.data.chips.map((c) => <button key={c.q} type="button" className="chip" onClick={() => setQ(c.q)}>{c[lang] || c.en}</button>)}
      </div>
      <div className="grid2" style={{ marginTop: 16 }}>
        <div>
          <h3>Answer <span className={`pill ${matched ? 'good' : 'warn'}`}>{matched ? `topic: ${matched}` : 'fallback'}</span></h3>
          <p className="answer" lang={lang}>{answer}</p>
        </div>
        <div>
          <h3>Top topic scores</h3>
          <svg className="chart" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Twin topic scores for the current question; top topic ${top?.id} with ${top?.score.toFixed(1)}`}>
            <line x1={x(1)} x2={x(1)} y1={0} y2={H - 18} stroke="var(--muted)" strokeDasharray="4 4" />
            <text x={x(1)} y={H - 4} textAnchor="middle">threshold 1</text>
            {shown.map((s, i) => (
              <g key={s.id} transform={`translate(0 ${i * rowH})`}>
                <text x={l - 8} y={16} textAnchor="end" style={{ fill: s.id === matched ? 'var(--text)' : undefined }}>{s.id}</text>
                <rect x={l} y={5} height={14} rx={4} width={Math.max(0, x(s.score) - l)} fill={s.id === matched ? 'var(--primary)' : 'var(--grid)'} />
                <text x={x(s.score) + 6} y={16}>{s.score.toFixed(1)}</text>
              </g>
            ))}
          </svg>
        </div>
      </div>
      <p className="hint" style={{ marginTop: 12 }}>
        Self-routing, computed live: {selfRoute.total - selfRoute.misses.length} of {selfRoute.total} topic keywords lead back to their own topic.
        Misses: {selfRoute.misses.map(([id, k]) => `“${k}” (${id})`).join(', ')}. Causes include stopwords and keyword overlap; see the scorecard.
      </p>
    </section>
  );
}

const SOURCES = {
  lang: { file: langTable.file, label: 'lang.js (drives the toggle)', table: langTable, par: parity(langTable) },
  json: { file: 'content-strings.json', label: 'content-strings.json', table: strings, par },
};
// Keys present in both sources whose text differs: the two copies have drifted.
const drift = Object.keys(strings.en).flatMap((k) => ['en', 'bn'].filter((L) => k in langTable[L] && langTable[L][k] !== strings[L][k]).map((L) => [k, L]));
const gapsOf = (p) => p.groups.flatMap((g) => [...g.missingEn.map((k) => [k, 'EN']), ...g.missingBn.map((k) => [k, 'BN'])]);

function Parity() {
  const [src, setSrc] = useState('lang');
  const [filter, setFilter] = useState('');
  const [group, setGroup] = useState('all');
  const S = SOURCES[src], P = S.par, T = S.table;
  const f = filter.trim().toLowerCase();
  const rows = P.keys.filter((k) => (group === 'all' || k.startsWith(`${group}-`) || k === group)
    && (!f || k.includes(f) || (T.en[k] || '').toLowerCase().includes(f) || (T.bn[k] || '').includes(filter.trim())));
  const strip = (s) => (s || '').replace(/<[^>]+>/g, '');
  const gaps = gapsOf(P);
  const langGaps = gapsOf(SOURCES.lang.par);
  return (
    <section id="parity" className="card window reveal" data-title={`${S.file.split('/').pop()} — bilingual parity`}>
      <div className="head">
        <div>
          <p className="eyebrow">Computed from the string tables</p>
          <h2>Two string tables, {langGaps.length} keys with no English text, and {drift.length} drifted {drift.length === 1 ? 'value' : 'values'}.</h2>
          <p className="sub">
            The language switch reads the inline table in <a href={blob(SOURCES.lang.file)}>lang.js</a> ({SOURCES.lang.par.enCount} EN / {SOURCES.lang.par.bnCount} BN keys).
            {' '}<a href={blob('content-strings.json')}>content-strings.json</a> repeats {par.keys.length} of those keys with full parity, but only <code>twin-</code> keys are read from it.
            {langGaps.length > 0 && <> The {langGaps.length} keys missing in English mean those labels stay in Bangla after switching back to English.</>} Parity is coverage, not translation quality.
          </p>
        </div>
        <div className="seg" role="group" aria-label="String table">
          {Object.entries(SOURCES).map(([k, v]) => <button key={k} aria-pressed={src === k} onClick={() => { setSrc(k); setGroup('all'); }}>{v.file.split('/').pop()}</button>)}
        </div>
      </div>
      <div className="bars parity">
        {P.groups.map((g) => (
          <button key={g.group} className={`bar-row pick ${group === g.group ? 'sel' : ''}`} onClick={() => setGroup(group === g.group ? 'all' : g.group)} aria-pressed={group === g.group}>
            <div className="lab"><span className="mono">{g.group}-</span><b>{g.both}/{g.total}</b></div>
            <div className="track"><div className="fill" style={{ width: `${(g.both / g.total) * 100}%`, background: g.both === g.total ? 'var(--good)' : 'var(--warn)' }} /></div>
          </button>
        ))}
      </div>
      <p className="hint" style={{ marginTop: 12 }}>
        {gaps.length ? <>Missing in {S.file.split('/').pop()}: {gaps.map(([k, L]) => `${k} (${L})`).join(', ')}.</> : <>No key is missing in either language in {S.file.split('/').pop()}.</>}
        {' '}Drift between the two tables: {drift.length ? drift.map(([k, L]) => `${k} (${L.toUpperCase()})`).join(', ') : 'none'}.
      </p>
      <div className="controls">
        <div className="field"><label htmlFor="par-q">Search keys or text <span>{rows.length} of {P.keys.length}{group !== 'all' ? ` in ${group}-` : ''}</span></label><input id="par-q" type="text" value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="e.g. chess, twin, যোগাযোগ" /></div>
      </div>
      <div className="scroll-x tablebox">
        <table>
          <thead><tr><th>Key</th><th>English</th><th>বাংলা</th></tr></thead>
          <tbody>{rows.map((k) => <tr key={k}><td className="mono">{k}</td><td>{k in T.en ? strip(T.en[k]) : <span className="no">missing</span>}</td><td lang="bn">{k in T.bn ? strip(T.bn[k]) : <span className="no">missing</span>}</td></tr>)}</tbody>
        </table>
      </div>
    </section>
  );
}

const AUDIT_FIELDS = [
  ['canonical', 'Canonical link', (p) => p.canonical],
  ['description', 'Meta description', (p) => p.description],
  ['og', 'Open Graph tags', (p) => p.og > 0],
  ['twitter', 'Twitter card tags', (p) => p.twitter > 0],
  ['ld', 'JSON-LD block', (p) => p.ldBlocks > 0],
  ['hreflang', 'hreflang links', (p) => p.hreflang > 0],
];

function Audit() {
  const [only, setOnly] = useState(null);
  const pages = audit.pages;
  const cov = AUDIT_FIELDS.map(([k, label, fn]) => ({ k, label, n: pages.filter(fn).length }));
  const rows = only ? pages.filter((p) => !AUDIT_FIELDS.find(([k]) => k === only)[2](p)) : pages;
  const W = 460, rowH = 30, H = cov.length * rowH + 22, l = 140, r = 40;
  const x = (n) => l + (n / pages.length) * (W - l - r);
  const short = (f) => f.replace(/index\.html$/, '') || '/';
  return (
    <section id="audit" className="card window reveal" data-title="sitemap.xml — site audit">
      <p className="eyebrow">Parsed at build time</p>
      <h2>Every page in the sitemap, checked for the tags search engines read.</h2>
      <p className="sub">
        A build script reads the {pages.length} <code>&lt;loc&gt;</code> entries in <a href={blob('sitemap.xml')}>sitemap.xml</a>, opens each matching HTML file and records its head tags.
        Click a bar to list the pages that lack it. hreflang is only expected on pages with a Bangla twin.
      </p>
      <div className="grid2" style={{ marginTop: 16 }}>
        <svg className="chart" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Tag coverage across ${pages.length} sitemap pages`}>
          {[0, 0.5, 1].map((t) => <g key={t}><line className="axis" x1={x(t * pages.length)} x2={x(t * pages.length)} y1={0} y2={H - 18} /><text x={x(t * pages.length)} y={H - 4} textAnchor="middle">{Math.round(t * pages.length)}</text></g>)}
          {cov.map((c, i) => (
            <g key={c.k} transform={`translate(0 ${i * rowH})`} className="pickable" onClick={() => setOnly(only === c.k ? null : c.k)}>
              <text x={l - 8} y={18} textAnchor="end" style={{ fill: only === c.k ? 'var(--text)' : undefined }}>{c.label}</text>
              <rect x={l} y={6} height={16} rx={4} width={x(pages.length) - l} fill="var(--grid)" />
              <rect x={l} y={6} height={16} rx={4} width={x(c.n) - l} fill={c.n === pages.length ? 'var(--good)' : only === c.k ? 'var(--warn)' : 'var(--primary)'} />
              <text x={x(pages.length) + 6} y={18}>{c.n}/{pages.length}</text>
            </g>
          ))}
        </svg>
        <div>
          <div className="seg wrapseg" role="group" aria-label="Show pages missing a tag">
            <button aria-pressed={!only} onClick={() => setOnly(null)}>All pages</button>
            {cov.filter((c) => c.n < pages.length).map((c) => <button key={c.k} aria-pressed={only === c.k} onClick={() => setOnly(c.k)}>Missing {c.label}</button>)}
          </div>
          <p className="hint">{only ? `${rows.length} page(s) without ${cov.find((c) => c.k === only).label.toLowerCase()}.` : `${cov.filter((c) => c.n === pages.length).length} of ${cov.length} tag types are on every page.`} The homepage JSON-LD lists {pages[0].sameAs} sameAs profiles.</p>
        </div>
      </div>
      <div className="scroll-x" style={{ marginTop: 12 }}>
        <table>
          <thead><tr><th>Page</th><th>Canonical</th><th>Description</th><th>OG</th><th>Twitter</th><th>hreflang</th><th>JSON-LD types</th><th>KB</th></tr></thead>
          <tbody>
            {rows.map((p) => (
              <tr key={p.file}>
                <td><a href={blob(p.file)} className="mono">{short(p.file)}</a></td>
                <td className={p.canonical ? 'ok' : 'no'}>{p.canonical ? '✓' : '✗'}</td>
                <td className={p.description ? 'ok' : 'no'}>{p.description ? '✓' : '✗'}</td>
                <td>{p.og}</td><td>{p.twitter}</td><td>{p.hreflang}</td>
                <td className="types">{p.ldTypes.length ? p.ldTypes.join(', ') : <span className="hint">none</span>}</td>
                <td>{(p.bytes / 1024).toFixed(0)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

const GROUPS = [['core', 'Core language', 'var(--primary)'], ['bridge', 'Python bridge and files', 'var(--warn)'], ['phase2', 'Phase 2: AI, terminals, agents', 'var(--good)']];

function Anatomy() {
  const [sel, setSel] = useState('core');
  const counts = GROUPS.map(([k, label, c]) => ({ k, label, c, n: anatomy.nodes.filter((n) => n.group === k).length }));
  const total = anatomy.nodes.length;
  const W = 960, H = 56;
  let acc = 0;
  const C = anatomy.constants;
  return (
    <section id="anatomy" className="card window reveal" data-title="jesun.py — interpreter anatomy">
      <p className="eyebrow">Parsed from source, no runtime claims</p>
      <h2>{total} syntax-tree node classes, and most of them are the plain-English core.</h2>
      <p className="sub">
        A regular expression lists the classes that sit between the lexer’s <code>Token</code> and the <code>Parser</code> in <a href={blob(anatomy.file)}>jesun.py</a>.
        Grouping is by name pattern (see <a href={blob('site/src/extract.mjs')}>extract.mjs</a>), a reading aid rather than a measured property. Click a segment to list its classes with source links.
      </p>
      <svg className="chart" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Node classes by group: ${counts.map((c) => `${c.label} ${c.n}`).join(', ')}`} style={{ marginTop: 16 }}>
        {counts.map((c) => {
          const x0 = acc; acc += (c.n / total) * W;
          return (
            <g key={c.k} className="pickable" onClick={() => setSel(c.k)}>
              <rect x={x0 + 1} y={0} width={Math.max(0, (c.n / total) * W - 2)} height={34} rx={8} fill={c.c} opacity={sel === c.k ? 1 : 0.35} />
              <text x={x0 + 10} y={22} style={{ fill: '#fff', fontWeight: 700, fontSize: 13 }}>{c.n}</text>
              <text x={x0 + 4} y={52}>{c.label}</text>
            </g>
          );
        })}
      </svg>
      <div className="seg wrapseg" role="group" aria-label="Class group" style={{ marginTop: 12 }}>
        {counts.map((c) => <button key={c.k} aria-pressed={sel === c.k} onClick={() => setSel(c.k)}>{c.label} ({c.n})</button>)}
      </div>
      <div className="chips classes">
        {anatomy.nodes.filter((n) => n.group === sel).map((n) => <a key={n.name} className="chip mono" href={blob(anatomy.file, n.line)}>{n.name}<small>L{n.line}</small></a>)}
      </div>
      <div className="tiles">
        <div className="tile"><div className="num">{C.MAX_CALL_DEPTH}</div><div className="cap"><code>MAX_CALL_DEPTH</code>: recursion guard</div></div>
        <div className="tile"><div className="num">{fmt(C.MAX_LOOP_RUNS)}</div><div className="cap"><code>MAX_LOOP_RUNS</code>: runaway-loop guard</div></div>
        <div className="tile"><div className="num">{C.AI_TIMEOUT}s</div><div className="cap"><code>AI_TIMEOUT</code> for <code>ask ai</code></div></div>
        <div className="tile"><div className="num">{C._MAX_AGENT_DEPTH}</div><div className="cap"><code>_MAX_AGENT_DEPTH</code>: agents calling agents</div></div>
      </div>
      <p className="hint" style={{ marginTop: 12 }}>Runtime and error classes outside the syntax tree: {anatomy.infra.join(', ')}.</p>
    </section>
  );
}

function parseReview(md) {
  const rows = md.split('\n').filter((l) => /^\| (?!Area|---)/.test(l))
    .map((l) => l.split('|').slice(1, -1).map((c) => c.trim()))
    .map(([area, grade, evidence, status]) => ({ area, grade, evidence, status }));
  const threats = (md.split('## Threats to validity')[1] || '').split('\n## ')[0].split('\n').filter((l) => l.startsWith('- ')).map((l) => l.slice(2));
  const overall = ((md.match(/Overall grade: \*\*([^*]+)\*\*/) || [])[1] || '').replace(/\.$/, '');
  return { rows, threats, overall };
}

function Scorecard() {
  const { rows, threats, overall } = useMemo(() => parseReview(reviewMd), []);
  const [show, setShow] = useState('all');
  const kind = (s) => (s.startsWith('Fixed') ? 'fixed' : s.startsWith('Measured') ? 'measured' : 'open');
  const vis = rows.filter((r) => show === 'all' || kind(r.status) === show);
  const tone = (g) => (g.startsWith('A') ? 'good' : g.startsWith('B') ? 'info' : g.startsWith('C') ? 'warn' : 'bad');
  return (
    <section id="scorecard" className="card window reveal" data-title="research-review.md — engineering scorecard">
      <div className="head">
        <div>
          <p className="eyebrow">Graded openly</p>
          <h2>What is proven, what was fixed, and what still needs work.</h2>
          <p className="sub">
            Read at build time from <a href={blob('docs/research-review.md')}>docs/research-review.md</a>, so this table and the review cannot disagree. Overall: <b>{overall}</b>.
            Settings changes (repository description, HTTPS, Pages build mode) are left to the owner on purpose.
          </p>
        </div>
        <div className="seg" role="group" aria-label="Filter scorecard">
          {[['all', 'All'], ['fixed', 'Fixed now'], ['open', 'Open']].map(([k, t]) => <button key={k} aria-pressed={show === k} onClick={() => setShow(k)}>{t}</button>)}
        </div>
      </div>
      <div className="score">
        {vis.map((r) => (
          <div className="tile" key={r.area}>
            <div className="head" style={{ marginBottom: 6 }}><h3>{r.area}</h3><span className={`pill ${tone(r.grade)}`}>{r.grade}</span></div>
            <p className="hint" style={{ margin: '0 0 6px' }}><Md text={r.evidence} /></p>
            <p style={{ margin: 0, fontSize: 13 }}><Md text={r.status} /></p>
          </div>
        ))}
      </div>
      <h3 style={{ marginTop: 20 }}>Limits of these checks</h3>
      <ul className="limits">{threats.map((t) => <li key={t}><Md text={t} /></li>)}</ul>
    </section>
  );
}
