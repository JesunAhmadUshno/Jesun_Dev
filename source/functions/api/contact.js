// POST /api/contact: validate the brief, store it in D1, forward it to Jesun's inbox.
import { safe, json, bad, visitorKey, rateLimited, clean, oneLine, isEmail, readJson } from '../_lib.js';
const TYPES = ['Venture partnership', 'Advisory mandate', 'Engineering mandate', 'Research collaboration', 'Speaking', 'Other'];
const BUDGETS = ['To discuss', 'Prefer to discuss', 'Under 25k', '25k to 100k', '100k and above'];
const TIMES = ['Exploratory', 'This quarter', 'Next quarter', 'Ongoing'];
async function onRequestPost_({ request, env }) {
  const b = await readJson(request); if (!b) return bad('Send JSON.');
  if (b._honey) return json({ ok: true }); // bots get a quiet success
  const name = oneLine(b.name, 120), email = oneLine(b.email, 200).toLowerCase(), message = clean(b.message, 5000);
  const type = TYPES.includes(b.type) ? b.type : 'Other', budget = BUDGETS.includes(b.budget) ? b.budget : 'Prefer to discuss', timeline = TIMES.includes(b.timeline) ? b.timeline : 'Exploratory';
  if (!name) return bad('Add your name.');
  if (!isEmail(email)) return bad('Add a valid email.');
  if (message.length < 10) return bad('Write at least one full sentence.');
  const key = await visitorKey(request, env);
  if (await rateLimited(env, key, 'contact', 5)) return bad('Too many briefs from here this hour. Email directly.', 429);
  const id = crypto.randomUUID();
  await env.DB.prepare('INSERT INTO briefs (id, created_at, name, email, type, budget, timeline, message) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)').bind(id, new Date().toISOString(), name, email, type, budget, timeline, message).run();
  if (env.FORWARD_URL) { // free email delivery through FormSubmit, server side
    try { await fetch(env.FORWARD_URL, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify({ name, email, type, budget, timeline, message, _subject: `Brief: ${type} from ${name}`, _template: 'table' }) }); } catch (e) { /* stored in D1 either way */ }
  }
  return json({ ok: true, id });
}
export const onRequest = () => bad('Use POST.', 405);

export const onRequestPost = safe(onRequestPost_);
