// The research record: studies, verdict ladder, judge the judge, organisations.
// Every figure comes from src/data/github-record.json, written by scripts/sync-github.mjs.
// Copyright Jesun Ahmad Ushno. All rights reserved.
import { esc } from './parts.mjs';

export const RUNG_CLASS = ['r0', 'r1', 'r2', 'r3', 'r4'];
export const rungOf = (rec, v) => (v ? rec.ladder.findIndex(l => v.startsWith(l)) : -1);
export const studiesOnly = rec => rec.studies.filter(s => s.kind === 'study');
const fmt = s => new Date(s + 'T12:00:00Z').toLocaleDateString('en-CA', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });

// The five rungs as a stepped bar. Height follows the count, label always shows the number.
export function ladder(rec) {
  const max = Math.max(1, ...rec.ladder.map(l => rec.counts[l] || 0));
  return `<ol class="ladder" aria-label="Verdict ladder, Standard v2">${rec.ladder.map((l, i) => `<li class="${RUNG_CLASS[i]}"><button type="button" data-rung="${i}" aria-pressed="false"><span class="bar" style="--h:${Math.max(6, Math.round((rec.counts[l] || 0) / max * 100))}%"></span><b>${rec.counts[l] || 0}</b><span class="slab">${esc(l)}</span></button></li>`).join('')}</ol>`;
}

export function studyCard(rec, s) {
  const r = rungOf(rec, s.verdict);
  const text = s.question || s.summary || '';
  return `<article class="study ${r >= 0 ? RUNG_CLASS[r] : 'rx'}" id="${esc(s.repo.toLowerCase())}" data-rung="${r}" data-track="${esc(s.track)}" data-q="${esc((s.repo + ' ' + text + ' ' + (s.headline || '') + ' ' + s.trackTitle).toLowerCase())}">
<header><span class="label">${esc(s.trackTitle)}</span><span class="verdict">${esc(s.verdict || 'Not yet graded')}</span></header>
<h3><a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.repo)}</a></h3>
${text ? `<p class="q">${esc(text)}</p>` : ''}${s.headline ? `<p class="hl"><span class="label">Headline</span> ${esc(s.headline)}</p>` : ''}
<footer>${s.planLocked ? '<span class="slock">Plan locked before data</span>' : ''}${s.updated ? `<span>Updated ${esc(s.updated)}</span>` : ''}<a href="${esc(s.url)}" target="_blank" rel="noopener">Repo</a>${s.dashboard ? `<a href="${esc(s.dashboard)}" target="_blank" rel="noopener">Live dashboard</a>` : ''}</footer>
</article>`;
}

// One judge case, rendered on the server; the client steps through the rest from the embedded JSON.
export function judgePanel(rec, idPrefix = 'jj') {
  const j = rec.judge; if (!j || !j.cases.length) return '';
  const c = j.cases[0];
  const vote = (id, side) => `https://github.com/JesunAhmadUshno/JesunAhmadUshno/issues/new?title=${encodeURIComponent(`judge: ${id} ${side}`)}&body=${encodeURIComponent('Press "Submit new issue" to cast this vote. A bot records it within a minute, replies with the running tally, and closes the issue.')}`;
  const total = j.tally.agree + j.tally.disagree;
  return `<div class="judge" data-judge id="${idPrefix}"><span class="sr" role="status" aria-live="polite" data-jlive></span>
<div class="judge-head"><span class="label">Judge the judge / case <b data-jn>${c.n}</b> of ${j.cases.length}</span><button type="button" class="judge-next" data-jnext>Next case</button></div>
<dl><div><dt>Question</dt><dd data-jq>${esc(c.question)}</dd></div><div><dt>Gold answer</dt><dd data-jg>${esc(c.gold)}</dd></div><div><dt>System answer</dt><dd data-ja>${esc(c.answer)}</dd></div><div class="said"><dt>The judge said</dt><dd><span class="pill" data-jv data-v="${esc(c.judge)}">${esc(c.judge)}</span></dd></div></dl>
<p class="judge-ask">Is the judge right? Your vote is a GitHub issue on his profile repository. A bot records one vote per account per case.</p>
<div class="judge-vote"><a class="btn" data-jyes href="${esc(vote(c.id, 'agree'))}" target="_blank" rel="noopener">Yes, the judge is right</a><a class="btn ghost" data-jno href="${esc(vote(c.id, 'disagree'))}" target="_blank" rel="noopener">No, the judge is wrong</a></div>
<p class="src">${total ? `Across all cases: ${j.tally.agree} agree, ${j.tally.disagree} disagree.` : 'Across all cases: no votes yet. The first vote starts the record.'} Cases: 30 fixed SQuAD items from rag-eval-harness at commit 974bed0. Judge: an embedding judge that has never been checked against people.</p>
</div>`;
}

export function orgBlock(d, rec) {
  const V = Object.fromEntries(d.ventures.map(v => [v.slug, v]));
  return `<div class="orgs">${d.ventures.map(v => {
    const o = (rec.orgs || []).find(x => v.org && x.url === v.org);
    return `<div class="org-card"><span class="label sig">${esc(v.title)}</span><h3 class="h3">${esc(v.name)}</h3><p>${esc(v.descriptor || v.what)}</p>${v.stage ? `<p class="label">${esc(v.stage)}</p>` : ''}${v.facts ? `<ul>${v.facts.map(f => `<li>${esc(f)}</li>`).join('')}</ul>` : ''}<p class="links">${v.url ? `<a href="${esc(v.url)}" target="_blank" rel="noopener">${esc(v.url.replace(/^https:\/\//, ''))}</a>` : ''}${v.org ? `<a href="${esc(v.org)}" target="_blank" rel="noopener">GitHub organisation</a>` : ''}${o ? o.repos.map(r => `<a href="${esc(r.url)}" target="_blank" rel="noopener">${esc(r.repo)}</a>`).join('') : ''}</p>${v.factsSource ? `<p class="src">Source: ${esc(v.factsSource)}</p>` : ''}</div>`;
  }).join('')}</div>`;
}

export function studiesPageBody(d, rec, { secHead, answer }) {
  const st = studiesOnly(rec);
  const products = rec.studies.filter(s => s.kind === 'product');
  const tracks = rec.tracks.filter(t => st.some(s => s.track === t.id));
  return `<section class="sec" style="border-top:0" data-studies><div class="wrap">
${secHead({ label: 'Studies / the research record', title: 'How far can we <em>trust the judge?</em>', side: `Synced from GitHub on ${fmt(rec.synced)}. Verdicts are copied from his roadmap, never edited here.` })}
${answer('Summary', `Jesun Ahmad Ushno runs ${rec.totals.studies} public studies under one written standard, Standard v2, adopted ${rec.standardAdopted}. Each study states its question first. A five-rung verdict ladder grades it: ${rec.ladder.join(', ')}. ${rec.totals.graded} studies carry a verdict today, ${rec.totals.planLocked} locked their plan before seeing data, and ${rec.totals.dashboards} repositories publish a live dashboard. The research spine is one question: how far can an automated judge be trusted?`)}
${ladder(rec)}
<div class="sfilter" role="search"><label class="sr" for="sq">Search the studies</label><input id="sq" type="search" placeholder="Search questions, repos, headlines" autocomplete="off" data-sq><div class="chips" role="group" aria-label="Track">${[['all', 'All tracks'], ...tracks.map(t => [t.id, t.title])].map(([id, t], i) => `<button class="chip" type="button" data-strack="${esc(id)}" aria-pressed="${i ? 'false' : 'true'}">${esc(t)}</button>`).join('')}</div><p class="label" aria-live="polite" data-scount>${st.length} studies shown</p></div>
<div class="studies">${st.map(s => studyCard(rec, s)).join('')}</div>
<p class="empty label" data-sempty hidden>No study matches. Clear the search or pick another rung.</p>
<p class="src" style="margin-top:20px">The full index, with the written method, lives at <a href="https://github.com/JesunAhmadUshno/full-spectrum-portfolio-index" target="_blank" rel="noopener">full-spectrum-portfolio-index</a>.</p>
</div></section>
<section class="sec" id="judge"><div class="wrap">${secHead({ label: 'Judge the judge', title: 'You are <em>the check.</em>', side: 'Thirty fixed cases. Fifteen the judge passed, fifteen it failed.' })}${judgePanel(rec, 'jj-page')}</div></section>
<section class="sec" id="organisations"><div class="wrap">${secHead({ label: 'Organisations', title: 'Ventures with <em>public repositories.</em>' })}${orgBlock(d, rec)}</div></section>
<section class="sec" id="products"><div class="wrap">${secHead({ label: 'Products', title: 'Shipped <em>tools.</em>', side: 'Products sit outside the study ladder. Case files for the main ones are on the Work page.' })}<div class="chips plain">${products.map(p => `<a class="chip" href="${esc(p.url)}" target="_blank" rel="noopener">${esc(p.repo)}</a>`).join('')}</div></div></section>
<script type="application/json" id="judge-data">${JSON.stringify(rec.judge ? rec.judge.cases : []).replace(/</g, '\\u003c')}</script>`;
}

// Home section: ladder, a living wall of studies, and the judge.
export function homeStudies(d, rec, L, H2) {
  const st = studiesOnly(rec);
  const tiles = st.map((s, i) => { const r = rungOf(rec, s.verdict); return `<a style="--i:${i}" tabindex="${s === st[0] ? 0 : -1}" class="stile ${r >= 0 ? RUNG_CLASS[r] : 'rx'}" href="/studies/#${esc(s.repo.toLowerCase())}" data-rung="${r}" data-track="${esc(s.track)}" data-tq="${esc(s.question || s.summary || '')}" data-tv="${esc(s.verdict || 'Not yet graded')}" data-tu="${esc(s.updated || '')}" aria-label="${esc(s.repo)}, ${esc(s.verdict || 'not yet graded')}"><i></i><span>${esc(s.repo)}</span></a>`; }).join('');
  return `<section class="section" id="studies" data-section="Studies">
  <div class="wrap">
    <div class="sec-head"><div class="eyebrow"${L('studies.label')}>02 / Research spine / ${rec.totals.studies} studies</div>${H2('studies.title', 'How far can we<br><span class="grad">trust the judge?</span>', 'TRUST THE JUDGE?')}</div>
    <div class="spine">
      <div class="spine-l">
        <p class="spine-p"${L('studies.copy', 'type')}>${rec.totals.studies} public studies, one written standard. Each states its question first and earns a verdict on a five-rung ladder. Tap a rung to light its studies.</p>
        <div${L('studies.ladder')}>${ladder(rec)}</div>
        <p class="src">${rec.totals.planLocked} plans locked before data. ${rec.totals.dashboards} live dashboards. Synced from GitHub ${esc(rec.synced)}.</p>
        <div class="swall" role="group" aria-label="Studies by verdict. Use arrow keys to move, Enter to open."${L('studies.wall')}>${tiles}</div>
        <p class="swall-read" aria-live="polite" data-wallread>Point at a study, or tab to it, to read its question.</p>
        <a class="btn ghost" href="/studies/"${L('studies.cta')}>All ${rec.totals.studies} studies ${'<svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M4 12L12 4M5 4h7v7"/></svg>'}</a>
      </div>
      <div class="spine-r"${L('studies.judge', 'drag')}>${judgePanel(rec, 'jj-home')}</div>
    </div>
  </div>
</section>
<script type="application/json" id="judge-data">${JSON.stringify(rec.judge ? rec.judge.cases : []).replace(/</g, '\\u003c')}</script>`;
}

// Latest shipped: the most recently updated public repositories, studies and products together.
const cleanSum = t => (t && !/^(!|Live|Welcome)/.test(t) ? t : '');
export function latestShipped(rec, n = 6, { home = false } = {}) {
  const items = rec.studies.filter(s => s.kind !== 'index' && s.updated).slice().sort((a, b) => b.updated.localeCompare(a.updated) || a.repo.localeCompare(b.repo)).slice(0, n);
  return `<ol class="ship${home ? ' ship-home' : ''}" aria-label="Most recently updated repositories">${items.map(s => {
    const r = rungOf(rec, s.verdict); const text = s.question || cleanSum(s.summary);
    return `<li class="${r >= 0 ? RUNG_CLASS[r] : s.kind === 'product' ? 'rp' : 'rx'}"><time datetime="${esc(s.updated)}">${esc(s.updated)}</time><div><a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.repo)}</a><span class="ship-k">${esc(s.kind === 'product' ? 'Product' : s.trackTitle)}${s.verdict ? ' / ' + esc(s.verdict) : ''}</span>${text ? `<p>${esc(text.length > 170 ? text.slice(0, 167).replace(/\s+\S*$/, '') + '...' : text)}</p>` : ''}</div>${s.dashboard ? `<a class="ship-d" href="${esc(s.dashboard)}" target="_blank" rel="noopener">Dashboard</a>` : '<span></span>'}</li>`;
  }).join('')}</ol>`;
}
