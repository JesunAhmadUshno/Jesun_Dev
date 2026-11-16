// POST /api/cortex: Cortex answers in three tiers, best first, and never breaks.
//
//   1. Gemini with live Google Search, when GEMINI_API_KEY is set as a Cloudflare secret.
//      This is the live tier: it can research the open web and cite what it found.
//   2. Workers AI on the free plan, grounded only in this site's record.
//   3. Nothing. The browser then answers from its own on-device brain.
//
// The key never ships to the browser. It is read from the server environment only, so a visitor
// cannot see it or spend it. The server also retrieves the site passages itself, so a visitor
// cannot inject their own "record".
// Copyright Jesun Ahmad Ushno. All rights reserved.
import { safe, json, bad, visitorKey, rateLimited, clean, readJson } from '../_lib.js';
import { buildIndex, search } from '../../src/scripts/retrieve.js';

// The Gemini key is read from the server environment only: set it once as a Cloudflare secret,
//   npx wrangler pages secret put GEMINI_API_KEY
// It is never written into this file. The repository is public, and a key committed to a public
// repository is visible to anyone and is disabled by Google's leak scanning within minutes.
const KEY = '';

const MODEL = '@cf/meta/llama-3.1-8b-instruct-fp8-fast';
const GEMINI = 'gemini-flash-latest';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI}:generateContent`;
const CAP = { gemini: 400, workers: 600 }; // both free tiers, both kept well under the limit
const BANNED = /jesun\s*\.\s*(ai|code)/gi;
const TIMEOUT = 12000;
let IX = null;

async function index(env, request) {
  if (IX) return IX;
  const r = await env.ASSETS.fetch(new URL('/index/passages.json', request.url));
  if (!r.ok) throw new Error('index');
  IX = buildIndex((await r.json()).p);
  return IX;
}

// One counter per tier per day, so a busy Gemini day never eats the Workers AI budget.
async function underDailyCap(env, tier) {
  const day = new Date().toISOString().slice(0, 10) + 'd';
  const b = 'cortex-' + tier;
  const row = await env.DB.prepare('SELECT n FROM rate WHERE k = ?1 AND bucket = ?2 AND hour = ?3').bind('all', b, day).first();
  if (row && row.n >= CAP[tier]) return false;
  await env.DB.prepare('INSERT INTO rate (k, bucket, hour, n) VALUES (?1, ?2, ?3, 1) ON CONFLICT(k, bucket, hour) DO UPDATE SET n = n + 1').bind('all', b, day).run();
  return true;
}

// Every answer passes through here: no em dash, and no product named with his first name and a dot.
function scrub(s) {
  return String(s || '').replace(/\u2014/g, ', ').replace(BANNED, 'his project').trim();
}

const RULES = [
  'You are Cortex, the agent that lives inside the personal website of Jesun Ahmad Ushno: a software engineer, AI engineer and founder based in Toronto.',
  'Two sources, and you must keep them apart.',
  'RECORD is the site itself. Every claim about Jesun, his work, his studies, his ventures, his numbers and his history must come from RECORD and nothing else. If RECORD does not answer a question about him, say "That is not on the record, so I will not guess." Never invent a number, a name, an employer, a date or an opinion about him.',
  'The live web is for everything else: current events, general knowledge, how a technology works, what a company does, prices, papers, news. Search when the answer would be better fresh, and say where it came from.',
  'Cite RECORD items as [1], [2]. Name a web source by its site, in plain words.',
  'Write the way a senior consultant writes to a client who is paying by the hour.',
  'Lead with the answer in the first sentence. Then at most three sentences of substance. Stop.',
  'Plain English. Short sentences. Active voice. One idea per sentence. No filler openers, no "great question", no restating the question, no summary of what you just said.',
  'Prose by default. Use a short list only when the content is genuinely a set of parallel items, never for one or two things, and never a list of single words.',
  'Never use the em dash character. Use a comma, a colon or brackets.',
  'No emoji. No exclamation marks. No bold shouting. No headings inside a chat reply.',
  'Never mention any product named with his first name followed by a dot.',
  'Refer to him in the third person. Be warm, precise and a little dry. Never flatter, and never oversell him.',
  'If the visitor sounds like they are weighing hiring him or working with him, answer the question first, then add one short sentence offering to pass their note to him. Ask once. If they decline or ignore it, never raise it again.'
].join(' ');

async function gemini(gkey, q, record, turns) {
  const ctl = new AbortController();
  const to = setTimeout(() => ctl.abort(), TIMEOUT);
  const contents = [];
  for (const t of (turns || []).slice(-6)) {
    const text = clean(t.text, 500);
    if (text) contents.push({ role: t.role === 'user' ? 'user' : 'model', parts: [{ text }] });
  }
  contents.push({ role: 'user', parts: [{ text: `RECORD:\n${record}\n\nQUESTION: ${q}` }] });
  try {
    const r = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-goog-api-key': gkey },
      signal: ctl.signal,
      body: JSON.stringify({
        contents,
        tools: [{ google_search: {} }],
        systemInstruction: { parts: [{ text: RULES }] },
        generationConfig: { temperature: 0.35, maxOutputTokens: 700, topP: 0.9 }
      })
    });
    if (!r.ok) return null;
    const j = await r.json();
    const c = j && j.candidates && j.candidates[0];
    if (!c) return null;
    const text = scrub((c.content && c.content.parts || []).map(p => p.text || '').join(' '));
    if (!text) return null;
    // Whatever Gemini actually read on the web, surfaced so the visitor can check it.
    const web = [];
    const gm = c.groundingMetadata || {};
    for (const ch of (gm.groundingChunks || [])) {
      const w = ch && ch.web;
      if (w && w.uri && !web.some(x => x.url === w.uri)) web.push({ title: clean(w.title || w.domain || 'source', 120), url: w.uri, web: true });
      if (web.length >= 4) break;
    }
    const searched = (gm.webSearchQueries || []).slice(0, 4).map(s => clean(s, 120));
    // Google requires the search suggestions widget to be shown with any grounded answer.
    // Scripts are stripped before it leaves the server, so only its markup and styles pass.
    let widget = String((gm.searchEntryPoint || {}).renderedContent || '');
    widget = widget.replace(/<script[\s\S]*?<\/script>/gi, '').replace(/\son[a-z]+\s*=/gi, ' data-x=');
    if (widget.length > 20000) widget = '';
    return { text, web, searched, widget };
  } catch (e) { return null; } finally { clearTimeout(to); }
}

async function workers(env, q, record) {
  const system = RULES + ' You have no web access in this mode, so answer only from RECORD.';
  const out = await env.AI.run(MODEL, {
    messages: [{ role: 'system', content: system }, { role: 'user', content: `RECORD:\n${record}\n\nQUESTION: ${q}` }],
    max_tokens: 260, temperature: 0.2
  });
  const text = scrub(out && (out.response || out.result || ''));
  if (!text) return null;
  // An answer that cites nothing is not on the record: let the local agent answer instead.
  if (!/\[\d\]/.test(text) && !/not on the record/i.test(text)) return null;
  return { text, web: [], searched: [] };
}

async function onRequestPost_({ request, env }) {
  const b = await readJson(request); if (!b) return bad('Send JSON.');
  const q = clean(b.q, 400); if (q.length < 2) return bad('Ask a question.');
  const gkey = String(env.GEMINI_API_KEY || KEY || '');
  const hasGemini = gkey.length > 20;
  if (!hasGemini && !env.AI) return json({ ok: false, fallback: true, reason: 'no-model' });
  const key = await visitorKey(request, env);
  if (await rateLimited(env, key, 'cortex', 30)) return json({ ok: false, fallback: true, reason: 'rate' }, 429);

  let hits;
  try { hits = search(await index(env, request), q, 5); } catch (e) { return json({ ok: false, fallback: true, reason: 'index' }); }
  const record = hits.length ? hits.map((h, i) => `[${i + 1}] ${h.p.t}: ${h.p.x}`).join('\n') : '(no matching passage on this site)';
  const cited = hits.slice(0, 3).map(h => ({ title: h.p.t, url: h.p.u }));

  // Tier one: live. Gemini can read the open web, so it answers anything the record cannot.
  if (hasGemini && await underDailyCap(env, 'gemini')) {
    const g = await gemini(gkey, q, record, Array.isArray(b.turns) ? b.turns : []);
    if (g) {
      return json({
        ok: true, live: true, model: GEMINI,
        onRecord: !/not on the record/i.test(g.text),
        text: g.text,
        searched: g.searched,
        widget: g.widget || '',
        sources: [...cited, ...g.web].slice(0, 6)
      });
    }
  }

  // Tier two: the free Workers model, grounded in the record alone.
  if (!hits.length) return json({ ok: true, onRecord: false, text: 'That is not on the record, so I will not guess.', sources: [] });
  if (!env.AI) return json({ ok: false, fallback: true, reason: 'no-model' });
  if (!(await underDailyCap(env, 'workers'))) return json({ ok: false, fallback: true, reason: 'daily-cap' });
  try {
    const w = await workers(env, q, record);
    if (!w) return json({ ok: false, fallback: true, reason: 'uncited' });
    return json({ ok: true, live: false, onRecord: !/not on the record/i.test(w.text), text: w.text, sources: cited, model: MODEL });
  } catch (e) { return json({ ok: false, fallback: true, reason: 'model' }); }
}
export const onRequest = () => bad('Use POST.', 405);

export const onRequestPost = safe(onRequestPost_);
