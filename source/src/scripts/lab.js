// The Lab: terminal, twin, systems wall, chess. Copyright Jesun Ahmad Ushno. All rights reserved.
import { $, $$, href } from './core.js';
import { loadIndex, search, bestSentence } from './retrieve.js';
import data from '../data/jesun.json';
import { runEgg } from './eggs.js';
import { initDemos } from './demos.js';
import { initChess } from './chess.js';
import './arcade.js';
import { synaptic } from './synaptic.js';
synaptic(document.getElementById('synaptic'));

/* ---------- Terminal ---------- */
(function terminal() {
  const out = $('#term-out'), input = $('#term-in'); if (!out || !input) return;
  const line = (t, cls) => { const d = document.createElement('div'); d.className = 'ln' + (cls ? ' ' + cls : ''); d.textContent = t; out.appendChild(d); out.scrollTop = out.scrollHeight; };
  const history = []; let hi = 0;
  const C = {
    help: () => line('commands: help, whoami, ventures, projects, papers, stack, now, fleet, contact, socials, resume, go <section>, clear'),
    whoami: () => { line(data.person.name + ' (' + data.person.alternateName + ')'); line(data.person.jobTitle + '. Toronto.'); line(data.person.headline); },
    ventures: () => data.ventures.forEach(v => line(v.title.padEnd(11) + ' ' + v.name + ': ' + v.what)),
    projects: () => data.projects.forEach(p => line(p.name.padEnd(26) + ' ' + p.catLabel)),
    papers: () => data.publications.filter(p => p.type === 'ScholarlyArticle').forEach(p => line(p.date + '  ' + p.title + '  doi:' + p.doi)),
    stack: () => data.stack.forEach(s => line(s.group.padEnd(18) + ' ' + s.items.join(', '))),
    now: () => data.now.forEach(n => line(n.date + '  ' + n.text)),
    fleet: () => data.fleet.departments.forEach(d => line(d.name.padEnd(22) + ' ' + d.seats.map(s => s[1]).join(', '))),
    contact: () => { line('email:  ' + data.site.email); line('brief:  /contact/'); },
    socials: () => data.profiles.filter(p => p.verified).forEach(p => line(p.name.padEnd(10) + ' ' + p.url)),
    resume: () => { line('opening /resume/'); location.href = href('/resume/'); },
    clear: () => { out.innerHTML = ''; },
    // Hidden eggs: not listed in help.
    'sudo': a => a.join(' ') === 'hire' ? line('Mandates are not bought from a terminal. Send a brief: /contact/', 'err') : line('sudo: nice try.', 'err'),
    'coffee': () => runEgg('coffee', t => line(t)),
    'rollcall': () => runEgg('rollcall', t => line(t)),
    'sign': () => runEgg('sign', t => line(t))
  };
  const run = raw => {
    line('> ' + raw, 'echo'); if (!raw) return;
    const [cmd, ...args] = raw.trim().split(/\s+/); const k = cmd.toLowerCase();
    if (k === 'go' && args[0]) { const el = document.getElementById(args[0]); if (el) el.scrollIntoView({ behavior: 'smooth' }); else location.href = href('/' + args[0] + '/'); return; }
    if (C[k]) C[k](args); else line('command not found: ' + k + '. type "help".', 'err');
  };
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') { const v = input.value; input.value = ''; if (v.trim()) { history.push(v); hi = history.length; } run(v.trim()); }
    else if (e.key === 'ArrowUp') { if (hi > 0) { hi--; input.value = history[hi]; } e.preventDefault(); }
    else if (e.key === 'ArrowDown') { if (hi < history.length) { hi++; input.value = history[hi] || ''; } e.preventDefault(); }
  });
  $('#terminal').addEventListener('click', e => { if (!e.target.closest('a,button,input')) input.focus(); });
  line('jesun shell. local only. type "help". three commands are not listed.', 'dim');
})();

/* ---------- Digital twin: rule-based answers from the data file ---------- */
(function twin() {
  const log = $('#twin-log'), form = $('#twin-form'); if (!log || !form) return;
  const say = (t, me) => { const d = document.createElement('div'); d.className = 'msg ' + (me ? 'me' : 'twin-a'); d.textContent = t; log.appendChild(d); log.scrollTop = log.scrollHeight; };
  const v = data.ventures, papers = data.publications.filter(p => p.type === 'ScholarlyArticle');
  const KB = [
    [['who', 'about', 'yourself', 'jesun', 'intro'], () => data.description],
    [['venture', 'immitly', 'brimwood', 'climeam', 'company', 'founder', 'found'], () => v.map(x => x.name + ' (' + x.title + '): ' + x.what).join(' ')],
    [['paper', 'research', 'publish', 'doi', 'wavelet', 'pso', 'swarm'], () => papers.map(p => p.title + ' (' + p.venue + ', ' + p.date + ', DOI ' + p.doi + ').').join(' ') + ' Both methods run live on the systems wall below.'],
    [['book'], () => 'He wrote "' + data.publications.find(p => p.type === 'Book').title + '" (2025). It is self-reported on his resume; no public listing link is on record yet.'],
    [['stack', 'tech', 'language', 'python', 'tools', 'cloud'], () => data.stack.map(s => s.group + ': ' + s.items.join(', ')).join('. ') + '.'],
    [['project', 'work', 'built', 'build', 'prism', 'bigfish', 'nopara', 'tridrop', 'sonicclear', 'pulsekey'], q => { const p = data.projects.find(x => q.includes(x.name.toLowerCase())); return p ? p.name + ': ' + p.summary : 'Selected work: ' + data.projects.filter(x => x.featured).map(x => x.name).join(', ') + '. Ask about any one by name.'; }],
    [['degree', 'msc', 'study', 'education', 'university', 'cgpa', 'gpa', 'distinction'], () => 'MSc Data Analytics, University of Niagara Falls Canada, conferred 21 June 2026 with Distinction, CGPA 3.9154. BSc Computer Engineering, AIUB, 2018 to 2023.'],
    [['kpmg', 'audit', 'iso', 'power'], () => 'At KPMG Bangladesh (Apr 2023 to Nov 2024) he rose from Officer to Consultant in IT Advisory: 20+ Power Automate workflows, 20+ Power BI dashboards, 5+ ISO 27001 audits, and PowerApps used by 500+ people.'],
    [['mias', 'foundation', 'relief', 'charity', 'families'], () => 'He co-founded the MIAS Foundation (2018 to 2024). Its flood relief reached 50,000+ families and its education work supported 5,000 children.'],
    [['fleet', 'agent', 'seat', 'team', 'crew', 'system'], () => 'He runs his work through an agent fleet: software seats with names and jobs, organised like a company. The seat map is in The System section of this Lab.'],
    [['where', 'live', 'based', 'location', 'toronto', 'from'], () => 'Toronto, Ontario. Originally from Bangladesh.'],
    [['contact', 'email', 'reach', 'hire', 'work with', 'mandate'], () => 'Send a brief at /contact/ or email ' + data.site.email + '. He reads every message himself.'],
    [['hello', 'hi', 'hey', 'salam'], () => 'Hello. I am a rule-based twin built from this site\'s data file. I am not a live language model. Ask about his ventures, papers, projects or stack.']
  ];
  const answer = q => {
    const s = q.toLowerCase();
    let best = null, score = 0;
    for (const [keys, fn] of KB) { const n = keys.filter(k => s.includes(k)).length; if (n > score) { score = n; best = fn; } }
    return best ? best(s) : 'That is outside my data. I only answer from what this site publishes. Try ventures, papers, projects, stack or contact.';
  };
  // Retrieval first: quote the record word for word with its source. The keyword table is the fallback.
  const sayRich = (lead, quote, hits) => {
    const d = document.createElement('div'); d.className = 'msg twin-a';
    const b = document.createElement('p'); b.style.margin = '0'; b.textContent = lead + ' "' + quote + '"'; d.appendChild(b);
    const src = document.createElement('div'); src.className = 'twin-src';
    hits.forEach((h, i) => { const a = document.createElement('a'); a.href = href(h.p.u); a.textContent = (i ? '' : 'Source: ') + h.p.t + (h.p.s ? ' (' + h.p.s + ')' : ''); src.appendChild(a); });
    d.appendChild(src);
    const nx = document.createElement('div'); nx.className = 'twin-next';
    hits.slice(1, 3).forEach(h => { const c = document.createElement('button'); c.type = 'button'; c.className = 'chip'; c.textContent = 'Ask: ' + h.p.t; c.addEventListener('click', () => ask(h.p.t)); nx.appendChild(c); });
    d.appendChild(nx); log.appendChild(d); log.scrollTop = log.scrollHeight;
  };
  const ask = async q => {
    if (!q.trim()) return; say(q, true);
    try {
      const ix = await loadIndex(href('/index/passages.json'));
      const hits = search(ix, q, 3);
      if (hits.length) { setTimeout(() => sayRich('From the record:', bestSentence(hits[0].p.x, q), hits), 220); return; }
      setTimeout(() => say('That is not on the record. I only answer from what this site publishes, word for word. Ask about his ventures, papers, projects, stack or how to reach him.'), 220);
    } catch (e) { setTimeout(() => say(answer(q)), 220); }
  };
  form.addEventListener('submit', e => { e.preventDefault(); const i = $('input', form); ask(i.value); i.value = ''; });
  $$('[data-ask]').forEach(b => b.addEventListener('click', () => ask(b.dataset.ask)));
  say('I am Jesun\'s twin. I search his record and quote it word for word with the source. I am not a live language model, and I never make things up.');
})();

initDemos();
initChess();
