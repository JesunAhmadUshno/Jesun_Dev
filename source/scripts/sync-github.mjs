// Sync the public GitHub record into src/data/github-record.json.
// Reads each public repository's README with a shallow git fetch (no API key, no rate limit),
// plus roadmap.json and tracks.json from the profile repository. Fails closed: if the profile
// data cannot be read, the previous record stays and the build still passes.
// Copyright Jesun Ahmad Ushno. All rights reserved.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const OWNER = 'JesunAhmadUshno';
const ORGS = [
  { org: 'Immitly', repos: ['immitly-dashboard-public'] },
  { org: 'Brimwood-Innovation', repos: ['brimwood-website'] }
];
const WORK = process.env.SYNC_DIR || path.join(process.env.TMPDIR || '/tmp', 'jesun-sync');
const OUT = 'src/data/github-record.json';
// Repos that must never surface on the site (banned names, scratch, forks of others' work).
const NEVER = /^(jesun-code|jesun-code-examples|jesun-code-tmlanguage|sig-install-tmp|linguist|podcast-test|jesun-reflection|canada-pr-economic-dashboard)$/i;
const INDEX = 'full-spectrum-portfolio-index';

fs.mkdirSync(WORK, { recursive: true });
const git = (args, cwd) => execFileSync('git', args, { cwd, stdio: ['ignore', 'pipe', 'pipe'], timeout: 60000 }).toString();
function readRepoFiles(full, files) {
  const dir = path.join(WORK, full.replace('/', '__'));
  try {
    let ref = 'HEAD';
    if (!fs.existsSync(dir)) git(['clone', '-q', '--depth', '1', '--filter=blob:none', '--no-checkout', `https://github.com/${full}.git`, dir]);
    else { git(['fetch', '-q', '--depth', '1', 'origin', 'HEAD'], dir); ref = 'FETCH_HEAD'; } // a re-run reads the newly fetched commit, not the old one
    const out = {};
    for (const f of files) { try { out[f] = git(['show', `${ref}:${f}`], dir); } catch (e) { out[f] = null; } }
    let date = null; try { date = git(['log', '-1', '--format=%cs', ref], dir).trim(); } catch (e) { /* none */ }
    return { ok: true, files: out, date };
  } catch (e) { return { ok: false, files: {}, date: null }; }
}
const clean = s => String(s || '').replace(/\*\*/g, '').replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').replace(/`/g, '').replace(/\s+/g, ' ').trim();
function field(md, name) {
  const m = String(md || '').match(new RegExp(`\\*\\*${name}\\.\\*\\*\\s*([\\s\\S]*?)(?:\\n\\s*\\n|\\n\\*\\*[A-Z][a-z ]+\\.\\*\\*)`));
  return m ? clean(m[1]) : null;
}
function firstPara(md) {
  const lines = String(md || '').split('\n'); let i = 0;
  while (i < lines.length && (/^\s*(#|<|!\[|\s*$)/.test(lines[i]))) i++;
  const para = []; while (i < lines.length && lines[i].trim()) para.push(lines[i++]);
  return clean(para.join(' ')).slice(0, 320) || null;
}
const dash = md => { const l = String(md || '').split('\n').find(x => /live dashboard/i.test(x)); const m = l && l.match(/https:\/\/[^\s)"'<>\]]+/); return m ? m[0].replace(/[*.,;:!]+$/, '') : null; };
const short = (s, n) => (s && s.length > n ? s.slice(0, n - 1).replace(/\s+\S*$/, '') + '...' : s);

const prev = fs.existsSync(OUT) ? JSON.parse(fs.readFileSync(OUT, 'utf8')) : null;
const profile = readRepoFiles(`${OWNER}/${OWNER}`, ['data/roadmap.json', 'data/tracks.json', 'data/judge-cases.json', 'data/votes.json']);
if (!profile.ok || !profile.files['data/roadmap.json'] || !profile.files['data/tracks.json']) {
  console.log('sync: profile data unreachable. Keeping the previous record' + (prev ? ' from ' + prev.synced : '') + '.');
  process.exit(0);
}
const roadmap = JSON.parse(profile.files['data/roadmap.json']);
const tracks = JSON.parse(profile.files['data/tracks.json']);
const judge = profile.files['data/judge-cases.json'] ? JSON.parse(profile.files['data/judge-cases.json']) : null;
const votes = profile.files['data/votes.json'] ? JSON.parse(profile.files['data/votes.json']) : null;
const verdictOf = new Map(roadmap.repos.map(r => [r.repo, r]));
const prevOf = new Map(((prev && prev.studies) || []).map(x => [x.repo, x]));

const studies = [];
for (const t of tracks.tracks) {
  for (const name of t.repos) {
    if (NEVER.test(name)) continue;
    const r = readRepoFiles(`${OWNER}/${name}`, ['README.md']);
    const md = r.files['README.md'];
    if (!r.ok && prevOf.has(name)) { studies.push({ ...prevOf.get(name), readable: false }); process.stdout.write('x'); continue; } // keep the last good copy
    const v = verdictOf.get(name);
    studies.push({
      repo: name, track: t.id, trackTitle: t.title,
      kind: name === INDEX ? 'index' : t.id === 'apps' ? 'product' : 'study',
      question: short(field(md, 'Question'), 260),
      headline: short(field(md, 'Headline'), 320),
      summary: field(md, 'Question') ? null : short(firstPara(md), 240),
      verdict: v ? v.verdict : (field(md, 'Verdict') || '').split('.')[0] || null,
      planLocked: v ? !!v.plan_locked : null,
      dashboard: dash(md),
      url: `https://github.com/${OWNER}/${name}`,
      updated: r.date, readable: r.ok
    });
    process.stdout.write('.');
  }
}
const orgs = ORGS.map(o => ({
  org: o.org, url: `https://github.com/${o.org}`,
  repos: o.repos.map(n => { const r = readRepoFiles(`${o.org}/${n}`, ['README.md']); return { repo: n, url: `https://github.com/${o.org}/${n}`, summary: short(firstPara(r.files['README.md']), 240), updated: r.date }; })
}));
// Judge the judge: the open case and the running tally, straight from the profile repository.
let judgeOut = null;
if (judge && Array.isArray(judge.cases)) {
  const tally = { agree: 0, disagree: 0 };
  const per = (votes && votes.cases) || votes || {};
  for (const k of Object.keys(per)) { const c = per[k] || {}; tally.agree += (c.agree || []).length || c.agree || 0; tally.disagree += (c.disagree || []).length || c.disagree || 0; }
  judgeOut = { source: judge.source, cases: judge.cases.slice(0, 30), tally };
}
const LADDER = ['Draft', 'Proposed', 'Functional', 'Evaluated', 'v1.0 Released'];
const rung = v => { if (!v) return -1; const i = LADDER.findIndex(l => v.startsWith(l)); return i; };
const counts = Object.fromEntries(LADDER.map(l => [l, studies.filter(s => s.kind === 'study' && s.verdict && s.verdict.startsWith(l)).length]));
const rec = {
  note: 'Generated by scripts/sync-github.mjs from public GitHub data. Verdicts are copied from the profile roadmap (Standard v2), never edited here.',
  synced: new Date().toLocaleDateString('en-CA', { timeZone: 'America/Toronto' }), standardAdopted: roadmap.adopted,
  ladder: LADDER, counts,
  totals: { repos: studies.length, studies: studies.filter(s => s.kind === 'study').length, products: studies.filter(s => s.kind === 'product').length, graded: studies.filter(s => s.kind === 'study' && s.verdict).length, planLocked: studies.filter(s => s.planLocked).length, dashboards: studies.filter(s => s.dashboard).length, tracks: tracks.tracks.length },
  tracks: tracks.tracks.map(t => ({ id: t.id, title: t.title })),
  studies: studies.sort((a, b) => rung(b.verdict) - rung(a.verdict) || String(b.updated).localeCompare(String(a.updated))),
  orgs, judge: judgeOut
};
const readable = studies.filter(s => s.readable).length;
if (studies.length && readable / studies.length < .8) { console.log(`\nsync: only ${readable} of ${studies.length} repos were readable. Keeping the previous record.`); process.exit(0); }
fs.writeFileSync(OUT + '.tmp', JSON.stringify(rec, null, 1)); fs.renameSync(OUT + '.tmp', OUT); // atomic: never a half-written record
console.log(`\nsync: ${rec.totals.studies} studies, ${rec.totals.products} products, ${studies.length} repos (${studies.filter(s => s.readable).length} readable), ${rec.totals.planLocked} plan-locked, ${rec.totals.dashboards} live dashboards, ${orgs.length} organisations.`);
