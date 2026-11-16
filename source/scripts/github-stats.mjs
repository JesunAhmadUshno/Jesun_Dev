// Freshness: pull public GitHub stats at build time through the free REST API.
// If the API fails, the last verified numbers in the data file stay and the build still passes.
// Copyright Jesun Ahmad Ushno. All rights reserved.
import fs from 'node:fs';
const F = 'src/data/jesun.json';
const d = JSON.parse(fs.readFileSync(F, 'utf8'));
const H = { 'User-Agent': 'jesunahmadushno-site-build', Accept: 'application/vnd.github+json', ...(process.env.GITHUB_TOKEN ? { Authorization: 'Bearer ' + process.env.GITHUB_TOKEN } : {}) };
const get = async u => { const r = await fetch(u, { headers: H, signal: AbortSignal.timeout(15000) }); if (!r.ok) throw new Error(u + ' ' + r.status); return r.json(); };
try {
  const u = await get(`https://api.github.com/users/${d.github.user}`);
  const events = await get(`https://api.github.com/users/${d.github.user}/events/public?per_page=50`);
  const recent = [];
  for (const e of events) {
    if (e.type !== 'PushEvent' && e.type !== 'CreateEvent' && e.type !== 'ReleaseEvent') continue;
    const repo = e.repo.name.split('/')[1];
    if (recent.some(r => r.repo === repo)) continue;
    const text = e.type === 'PushEvent' ? `${e.payload.size || 1} commit(s) pushed` : e.type === 'ReleaseEvent' ? 'release published' : `${e.payload.ref_type} created`;
    recent.push({ repo, date: e.created_at.slice(0, 10), text });
    if (recent.length >= 6) break;
  }
  if (typeof u.public_repos !== 'number' || u.public_repos < 1) throw new Error('implausible repo count');
  d.github = { ...d.github, public_repos: u.public_repos, followers: u.followers, recent, fetched: new Date().toISOString().slice(0, 10), fetchedBy: 'GitHub REST API, build time' };
  const s = d.stats.find(x => x.live === 'github.public_repos');
  if (s) { s.value = u.public_repos; s.display = String(u.public_repos); s.date = d.github.fetched; }
  fs.writeFileSync(F, JSON.stringify(d, null, 1));
  console.log(`github ok: ${u.public_repos} repos, ${recent.length} recent ships`);
} catch (e) {
  console.log(`github fetch failed (${e.message}). Keeping last verified numbers from ${d.github.fetched}. Build continues.`);
}
