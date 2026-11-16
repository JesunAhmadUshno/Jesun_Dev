// BM25 retrieval over the site's own record. No model, no network beyond the site's own index file.
// Copyright Jesun Ahmad Ushno. All rights reserved.
const STOP = new Set('a an and are as at be by did do does for from has have he him his how i in is it its me of on or that the their this to was what when where which who why will with you your about tell'.split(' '));
const SYN = { published: 'publish', papers: 'paper', research: 'paper', wrote: 'publish', founded: 'founder', founder: 'founder', cofounder: 'founder', companies: 'venture', company: 'venture', ventures: 'venture', startups: 'venture', school: 'university', studied: 'university', degree: 'msc', masters: 'msc', job: 'role', work: 'role', worked: 'role', email: 'contact', reach: 'contact', hire: 'contact', skills: 'stack', tools: 'stack', languages: 'stack', agents: 'fleet', agent: 'fleet', seats: 'fleet', crew: 'fleet', team: 'fleet', located: 'based', city: 'toronto', charity: 'mias', relief: 'mias', families: 'mias' };
const stem = w => (SYN[w] || w).replace(/(ing|ed|es|s)$/, m => (w.length > 4 ? '' : m));
const QSYN = { live: 'based', lives: 'based', living: 'based', home: 'based' };
export const tokens = (t, isQuery) => String(t).toLowerCase().normalize('NFKD').replace(/[^a-z0-9.+# ]+/g, ' ').split(/\s+/).filter(w => w && !STOP.has(w)).map(w => (isQuery && QSYN[w]) || w).map(stem);

export function buildIndex(passages) {
  const docs = passages.map(p => { const tk = tokens(p.t + ' ' + p.t + ' ' + p.x); const tf = new Map(); for (const w of tk) tf.set(w, (tf.get(w) || 0) + 1); return { p, tf, len: tk.length }; });
  const df = new Map(); for (const d of docs) for (const w of d.tf.keys()) df.set(w, (df.get(w) || 0) + 1);
  const avg = docs.reduce((a, d) => a + d.len, 0) / Math.max(1, docs.length);
  return { docs, df, avg, N: docs.length };
}
export function search(ix, query, k = 5) {
  const q = [...new Set(tokens(query, true))]; if (!q.length) return [];
  const K1 = 1.4, B = .72, out = [];
  for (const d of ix.docs) {
    let s = 0, hit = 0;
    for (const w of q) {
      const f = d.tf.get(w) || 0; if (!f) continue; hit++;
      const n = ix.df.get(w) || 0, idf = Math.log(1 + (ix.N - n + .5) / (n + .5));
      s += idf * f * (K1 + 1) / (f + K1 * (1 - B + B * d.len / ix.avg));
    }
    if (s > 0 && hit / q.length >= .34) {
      const prior = Math.sqrt(Math.min(1, d.len / 18)) * (d.p.s === 'FAQ' || d.p.s === 'canonical description' ? 1.12 : 1) * (d.p.id.startsWith('s-') ? .7 : 1);
      out.push({ p: d.p, score: s * (hit / q.length) * prior });
    }
  }
  return out.sort((a, b) => b.score - a.score).slice(0, k);
}
// Pick the sentence in a passage that best matches the query, quoted word for word.
export function bestSentence(text, query) {
  const t = String(text).trim(); if (t.length <= 480) return t; // passages up to a short paragraph are quoted whole
  const q = new Set(tokens(query, true)), parts = t.match(/[^.!?]+[.!?]?/g) || [t];
  let bi = 0, bs = -1;
  parts.forEach((s, i) => { const n = tokens(s).filter(w => q.has(w)).length; if (n > bs) { bs = n; bi = i; } });
  let out = parts[bi].trim(); if (bi + 1 < parts.length && out.length < 160) out += ' ' + parts[bi + 1].trim();
  return out;
}
let cache = null;
export async function loadIndex(url) {
  if (cache) return cache;
  cache = fetch(url).then(r => { if (!r.ok) throw new Error('index ' + r.status); return r.json(); }).then(j => buildIndex(j.p));
  try { return await cache; } catch (e) { cache = null; throw e; }
}

// explain(): the same ranking as search(), with its working shown. Cortex renders these numbers
// directly, so what the visitor watches is the real retrieval, not an animation of one.
export function explain(ix, query, k = 5) {
  const q = [...new Set(tokens(query, true))];
  const out = { tokens: q, scanned: ix.N, matched: 0, hits: [], rejected: 0, dropped: [] };
  if (!q.length) return out;
  const K1 = 1.4, B = .72, all = [];
  const tokenHits = Object.fromEntries(q.map(w => [w, 0]));
  for (const d of ix.docs) {
    let s = 0, hit = 0; const per = [];
    for (const w of q) {
      const f = d.tf.get(w) || 0; if (!f) continue; hit++; tokenHits[w]++;
      const n = ix.df.get(w) || 0, idf = Math.log(1 + (ix.N - n + .5) / (n + .5));
      const part = idf * f * (K1 + 1) / (f + K1 * (1 - B + B * d.len / ix.avg));
      s += part; per.push({ w, f, idf: +idf.toFixed(2), part: +part.toFixed(2) });
    }
    if (!s) continue;
    const cover = hit / q.length;
    const prior = Math.sqrt(Math.min(1, d.len / 18)) * (d.p.s === 'FAQ' || d.p.s === 'canonical description' ? 1.12 : 1) * (d.p.id.startsWith('s-') ? .7 : 1);
    all.push({ p: d.p, raw: +s.toFixed(2), cover: +cover.toFixed(2), prior: +prior.toFixed(2), score: s * cover * prior, per, kept: cover >= .34 });
  }
  all.sort((a, b) => b.score - a.score);
  const kept = all.filter(h => h.kept);
  out.matched = kept.length; out.rejected = all.length - kept.length;
  out.tokenHits = tokenHits;
  out.dropped = all.filter(h => !h.kept).slice(0, 2).map(h => ({ t: h.p.t, cover: h.cover }));
  out.hits = kept.slice(0, k).map(h => ({ ...h, score: +h.score.toFixed(2) }));
  const [a, b] = out.hits;
  out.margin = a && b ? +(a.score / Math.max(.01, b.score)).toFixed(2) : a ? 9 : 0;
  out.confidence = !a ? 'none' : a.cover >= .99 && out.margin >= 1.5 ? 'high' : a.cover >= .6 ? 'medium' : 'low';
  return out;
}
