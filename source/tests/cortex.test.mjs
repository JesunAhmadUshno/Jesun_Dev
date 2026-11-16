// Cortex, the site agent: the planner must pick the right tool, stay on the record and never leak banned names.
// Copyright Jesun Ahmad Ushno. All rights reserved.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { plan, compose } from '../src/scripts/cortex-brain.js';
import { buildIndex } from '../src/scripts/retrieve.js';

const P = JSON.parse(fs.readFileSync('dist/index/passages.json', 'utf8')).p;
const IX = buildIndex(P);
const tool = q => plan(q).steps.filter(s => s.tool).map(s => s.tool);

test('navigation requests become goto steps', () => {
  assert.deepEqual(plan('take me to the studies').steps.find(s => s.tool === 'goto').arg, 'studies');
  assert.equal(plan('show me his work').steps.find(s => s.tool === 'goto').arg, 'work');
  assert.equal(plan('open the lab').steps.find(s => s.tool === 'goto').arg, 'lab');
});
test('game requests open the arcade with the right game', () => {
  assert.equal(plan('play connect four').steps.find(s => s.tool === 'game').arg, 'c4');
  assert.equal(plan('I want to play chess').steps.find(s => s.tool === 'game').arg, 'chess');
  assert.equal(plan('rock paper scissors').steps.find(s => s.tool === 'game').arg, 'rps');
  assert.equal(plan('tic tac toe').steps.find(s => s.tool === 'game').arg, 'ttt');
});
test('study filters map to ladder rungs', () => {
  const s = plan('show me the evaluated studies').steps.find(x => x.tool === 'studies');
  assert.equal(s.arg, 'Evaluated');
  assert.equal(plan('which studies are released').steps.find(x => x.tool === 'studies').arg, 'v1.0 Released');
});
test('hiring intent drafts a brief', () => {
  assert.ok(tool('I want to hire him for an engineering project').includes('brief'));
  assert.equal(plan('work with him on a venture').steps.find(s => s.tool === 'brief').arg.type, 'Venture partnership');
});
test('site controls', () => {
  assert.ok(tool('reduce motion please').includes('motion'));
  assert.ok(tool('replay the build').includes('replay'));
  assert.ok(tool('copy his email').includes('email'));
  assert.ok(tool('show me a judge case').includes('judge'));
});
test('plain questions retrieve and answer from the record with sources', () => {
  const r = compose('what did he publish', IX);
  assert.ok(r.text.length > 40);
  assert.ok(r.sources.length >= 1);
  assert.match(r.text, /AIP|paper/i);
});
test('off-record questions are refused, not invented', () => {
  const r = compose('what is his favourite pizza topping', IX);
  assert.equal(r.onRecord, false);
  assert.match(r.text, /not on the record/i);
});
test('every question plan begins with a visible thought step', () => {
  for (const q of ['hello', 'play chess', 'what are his ventures', 'zzzz']) assert.ok(plan(q).steps[0].say);
});
test('the agent never speaks banned names', () => {
  const banned = [['Jesun', 'Ai'].join('.'), ['Jesun', 'Code'].join('.')].map(s => s.toLowerCase());
  for (const q of ['who are you', 'what is jesun code', 'tell me about jesun ai', 'what are his ventures']) {
    const r = compose(q, IX); const all = (r.text + JSON.stringify(plan(q))).toLowerCase();
    for (const b of banned) assert.equal(all.includes(b), false, q);
  }
});

// The API endpoint: grounded, capped, and always able to fall back to the local agent.
import { DatabaseSync } from 'node:sqlite';
import * as api from '../functions/api/cortex.js';
function d1() {
  const db = new DatabaseSync(':memory:'); db.exec(fs.readFileSync('schema.sql', 'utf8'));
  const norm = sql => sql.replace(/\?(\d+)/g, '?');
  return { prepare(sql) { let args = []; const st = db.prepare(norm(sql)); const o = { bind(...a) { args = a; return o; }, async first() { return st.get(...args) || null; }, async run() { st.run(...args); return {}; } }; return o; } };
}
const passages = fs.readFileSync('dist/index/passages.json', 'utf8');
const ASSETS = { fetch: async () => new Response(passages, { headers: { 'Content-Type': 'application/json' } }) };
const ask = q => new Request('https://x.test/api/cortex', { method: 'POST', headers: { 'Content-Type': 'application/json', 'CF-Connecting-IP': '5.5.5.5' }, body: JSON.stringify({ q }) });

test('api: without a model binding it tells the browser to fall back', async () => {
  const r = await api.onRequestPost({ request: ask('what did he publish'), env: { DB: d1(), ASSETS } });
  const j = await r.json(); assert.equal(j.fallback, true);
});
test('api: answers from retrieved passages and scrubs banned names and em dashes', async () => {
  let seen = '';
  const AI = { run: async (m, o) => { seen = o.messages[1].content; return { response: 'He published two papers ' + String.fromCharCode(0x2014) + ' see ' + ['Jesun', 'Code'].join('.') + ' [1].' }; } };
  const j = await (await api.onRequestPost({ request: ask('what did he publish'), env: { DB: d1(), ASSETS, AI } })).json();
  assert.equal(j.ok, true); assert.match(seen, /RECORD:/); assert.ok(j.sources.length);
  assert.equal(j.text.includes(String.fromCharCode(0x2014)), false); assert.equal(/jesun\.code/i.test(j.text), false);
});
test('api: off-record questions never reach the model', async () => {
  let called = false; const AI = { run: async () => { called = true; return { response: 'x' }; } };
  const j = await (await api.onRequestPost({ request: ask('zxqv blorf'), env: { DB: d1(), ASSETS, AI } })).json();
  assert.equal(called, false); assert.equal(j.onRecord, false);
});

test('api: uncited model answers fall back to the local agent', async () => {
  const AI = { run: async () => ({ response: 'He is great at everything.' }) };
  const j = await (await api.onRequestPost({ request: ask('what did he publish'), env: { DB: d1(), ASSETS, AI } })).json();
  assert.equal(j.fallback, true); assert.equal(j.reason, 'uncited');
});

test('tour requests become the tour tool', () => {
  for (const q of ['give me the tour', 'show me around', 'walk me through the site']) assert.equal(plan(q).steps.find(s => s.tool === 'tour') ? 1 : 0, 1, q);
});
