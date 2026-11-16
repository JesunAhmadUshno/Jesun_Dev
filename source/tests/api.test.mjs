// API tests against a real SQLite database standing in for D1. Run: node --test tests/
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import * as contact from '../functions/api/contact.js';
import * as guestbook from '../functions/api/guestbook.js';
import * as hits from '../functions/api/hits.js';

function d1() {
  const db = new DatabaseSync(':memory:'); db.exec(fs.readFileSync('schema.sql', 'utf8'));
  const norm = sql => sql.replace(/\?(\d+)/g, '?');
  return { _db: db, prepare(sql) { let args = []; const st = db.prepare(norm(sql)); const api = { bind(...a) { args = a; return api; }, async first() { return st.get(...args) || null; }, async all() { return { results: st.all(...args) }; }, async run() { const r = st.run(...args); return { meta: { changes: Number(r.changes) } }; } }; return api; } };
}
const req = (body, ip = '1.2.3.4', method = 'POST') => new Request('https://x.test/api', { method, headers: { 'Content-Type': 'application/json', 'CF-Connecting-IP': ip }, body: body === undefined ? undefined : JSON.stringify(body) });
const brief = { name: 'Ada', email: 'ada@example.com', message: 'We need an agent fleet for claims triage.', type: 'Engineering mandate', budget: 'Under 25k', timeline: 'This quarter' };

test('contact: stores a valid brief', async () => {
  const env = { DB: d1(), HASH_SALT: 's' };
  const r = await contact.onRequestPost({ request: req(brief), env });
  assert.equal(r.status, 200); const j = await r.json(); assert.equal(j.ok, true);
  assert.equal(env.DB._db.prepare('SELECT COUNT(*) c FROM briefs').get().c, 1);
});
test('contact: rejects a bad email and a short message', async () => {
  const env = { DB: d1() };
  assert.equal((await contact.onRequestPost({ request: req({ ...brief, email: 'nope' }), env })).status, 400);
  assert.equal((await contact.onRequestPost({ request: req({ ...brief, message: 'hi' }), env })).status, 400);
});
test('contact: honeypot gets a quiet success and stores nothing', async () => {
  const env = { DB: d1() };
  const r = await contact.onRequestPost({ request: req({ ...brief, _honey: 'x' }), env });
  assert.equal(r.status, 200); assert.equal(env.DB._db.prepare('SELECT COUNT(*) c FROM briefs').get().c, 0);
});
test('contact: rate limit after 5 per hour from one visitor', async () => {
  const env = { DB: d1() };
  for (let i = 0; i < 5; i++) assert.equal((await contact.onRequestPost({ request: req(brief), env })).status, 200);
  assert.equal((await contact.onRequestPost({ request: req(brief), env })).status, 429);
  assert.equal((await contact.onRequestPost({ request: req(brief, '9.9.9.9'), env })).status, 200);
});
test('contact: unknown select values are normalised', async () => {
  const env = { DB: d1() };
  await contact.onRequestPost({ request: req({ ...brief, type: '<script>' }), env });
  assert.equal(env.DB._db.prepare('SELECT type FROM briefs').get().type, 'Other');
});
test('guestbook: post then list, links refused', async () => {
  const env = { DB: d1(), GUESTBOOK_OPEN: '1' };
  assert.equal((await guestbook.onRequestPost({ request: req({ name: 'Sam', note: 'Great build.' }), env })).status, 201);
  assert.equal((await guestbook.onRequestPost({ request: req({ name: 'Spam', note: 'visit https://spam.example' }), env })).status, 400);
  const j = await (await guestbook.onRequestGet({ env })).json();
  assert.equal(j.notes.length, 1); assert.equal(j.notes[0].name, 'Sam');
});
test('hits: one count per visitor per day, no IP stored', async () => {
  const env = { DB: d1(), HASH_SALT: 's' };
  await hits.onRequestPost({ request: req(undefined), env }); await hits.onRequestPost({ request: req(undefined), env });
  const j = await (await hits.onRequestPost({ request: req(undefined, '5.5.5.5'), env })).json();
  assert.equal(j.total, 2);
  const row = env.DB._db.prepare('SELECT k FROM visits LIMIT 1').get();
  assert.ok(!row.k.includes('1.2.3.4') && row.k.length === 24);
});

test('api: cross-site and non-JSON posts are refused', async () => {
  const env = { DB: d1(), HASH_SALT: 's' };
  const body = JSON.stringify({ name: 'Ada', email: 'ada@example.com', message: 'We need an agent fleet for claims triage.' });
  const xsite = new Request('https://x.test/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json', Origin: 'https://evil.example' }, body });
  assert.equal((await contact.onRequestPost({ request: xsite, env })).status, 400);
  const form = new Request('https://x.test/api/contact', { method: 'POST', headers: { 'Content-Type': 'text/plain' }, body });
  assert.equal((await contact.onRequestPost({ request: form, env })).status, 400);
});

test('guestbook: notes are held for approval by default', async () => {
  const env = { DB: d1() };
  const r = await guestbook.onRequestPost({ request: req({ name: 'Sam', note: 'Great build.' }), env });
  assert.equal(r.status, 201); assert.equal((await r.json()).held, true);
  assert.equal((await (await guestbook.onRequestGet({ env })).json()).notes.length, 0);
});
