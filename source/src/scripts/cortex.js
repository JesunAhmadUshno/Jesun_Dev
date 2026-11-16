// Cortex: the agent that runs this site. A living orb, a chat that plans in the open, tools that act
// on the page, voice in and out, memory across pages, and quiet suggestions while you read.
// Answers come from the site's own record. When the free model endpoint is deployed, it writes the
// answer from retrieved passages; otherwise the local agent answers. Copyright Jesun Ahmad Ushno.
import { plan, compose } from './cortex-brain.js';
import { avatar } from './avatar.js';
import { say, stop as stopSpeech } from './speech.js';
import { loadIndex, explain } from './retrieve.js';
import { href } from './core.js';
import data from '../data/jesun.json';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const H = document.documentElement;
const RM = () => { try { if (localStorage.getItem('jesun.rm') === '1') return true; } catch (e) { /* blocked */ } return matchMedia('(prefers-reduced-motion: reduce)').matches; };
const ss = { get(k) { try { return JSON.parse(sessionStorage.getItem(k) || 'null'); } catch (e) { return null; } }, set(k, v) { try { sessionStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* blocked */ } } };
const isHome = !!document.querySelector('meta[name="page"][content="home"]');
const wait = ms => new Promise(r => setTimeout(r, RM() ? 0 : ms));
const SR = window.SpeechRecognition || window.webkitSpeechRecognition;

/* ---------------- UI ---------------- */
function mount() {
  const orb = document.createElement('button');
  orb.className = 'cx-orb'; orb.type = 'button'; orb.id = 'cx-orb';
  orb.setAttribute('aria-label', 'Open Cortex, the site agent'); orb.setAttribute('aria-expanded', 'false'); orb.setAttribute('aria-controls', 'cx-panel');
  orb.innerHTML = '<canvas aria-hidden="true"></canvas><span class="cx-orb-ring" aria-hidden="true"></span><span class="cx-tip" aria-hidden="true">Ask Cortex <kbd>/</kbd></span>';
  const panel = document.createElement('section');
  panel.className = 'cx-panel'; panel.id = 'cx-panel'; panel.hidden = true;
  panel.setAttribute('role', 'dialog'); panel.setAttribute('aria-label', 'Cortex, the site agent');
  panel.innerHTML = `
  <div class="cx-stage"><canvas class="cx-av" aria-hidden="true"></canvas><span class="cx-phase" data-phase>lattice</span></div>
  <header class="cx-head"><div class="cx-id"><b>Cortex</b><span>Site agent</span></div>
    <div class="cx-vitals" aria-label="Agent vitals"><span><i data-v="neurons">-</i> passages</span><span><i data-v="tools">11</i> tools</span><span><i data-v="mem">0</i> turns</span></div>
    <div class="cx-acts">${SR ? '<button type="button" class="cx-ic" data-mic aria-label="Speak a question" aria-pressed="false"><svg viewBox="0 0 16 16" aria-hidden="true"><rect x="5.5" y="1.5" width="5" height="9" rx="2.5"/><path d="M3 8a5 5 0 0 0 10 0M8 13v2"/></svg></button>' : ''}${'speechSynthesis' in window ? '<button type="button" class="cx-ic" data-voice aria-label="Read answers aloud" aria-pressed="false"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M2 6h3l4-3v10L5 10H2z"/><path d="M11 5.5a3.5 3.5 0 0 1 0 5M12.5 3.5a6 6 0 0 1 0 9"/></svg></button>' : ''}<button type="button" class="cx-ic" data-close aria-label="Close Cortex"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 3l10 10M13 3L3 13"/></svg></button></div></header>
  <div class="cx-log" aria-live="polite" aria-relevant="additions"></div>
  <div class="cx-chips" role="group" aria-label="Suggestions"></div>
  <form class="cx-form"><label class="sr" for="cx-in">Ask Cortex or give it a task</label><input id="cx-in" autocomplete="off" maxlength="400" placeholder="Ask, or tell me what to do"><button type="submit" class="cx-send" aria-label="Send"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M2 8h11M9 4l4 4-4 4"/></svg></button></form>
  <p class="cx-foot">Facts about Jesun come from this site's record. Anything else can come from a live web search. Every answer carries its sources. <span data-engine>Local agent</span></p>`;
  document.body.append(orb, panel);
  return { orb, panel, log: $('.cx-log', panel), input: $('#cx-in', panel), form: $('.cx-form', panel), chips: $('.cx-chips', panel), av: $('.cx-av', panel), phase: $('[data-phase]', panel) };
}

/* ---------------- The living orb ---------------- */
function orbLife(c, state) {
  const x = c.getContext('2d'), d = Math.min(2, devicePixelRatio || 1), S = 56; c.width = S * d; c.height = S * d; x.setTransform(d, 0, 0, d, 0, 0);
  const N = Array.from({ length: 14 }, (_, i) => ({ a: i / 14 * 6.283, r: 10 + (i % 3) * 5, s: .004 + (i % 5) * .002 }));
  let t = 0, raf = 0, last = 0;
  const draw = now => {
    raf = requestAnimationFrame(draw);
    // 20 fps while idle, full rate only while thinking: it should breathe, not burn the CPU.
    if (!state.busy && now && now - last < 50) return; last = now || 0;
    t += state.busy ? 3 : 2.5; x.clearRect(0, 0, S, S);
    const beat = 1 + Math.sin(t * (state.busy ? .2 : .05)) * .06, cx = S / 2, cy = S / 2;
    const g = x.createRadialGradient(cx, cy, 2, cx, cy, 26 * beat); g.addColorStop(0, state.busy ? 'rgba(255,89,100,.95)' : 'rgba(255,70,85,.85)'); g.addColorStop(.55, 'rgba(232,50,63,.35)'); g.addColorStop(1, 'rgba(232,50,63,0)');
    x.fillStyle = g; x.beginPath(); x.arc(cx, cy, 26 * beat, 0, 6.283); x.fill();
    const pts = N.map(n => { n.a += n.s * (state.busy ? 4 : 1); const r = n.r * beat; return [cx + Math.cos(n.a) * r, cy + Math.sin(n.a * 1.3) * r * .8]; });
    x.lineWidth = .6;
    for (let i = 0; i < pts.length; i++) for (let j = i + 1; j < pts.length; j++) { const dd = Math.hypot(pts[i][0] - pts[j][0], pts[i][1] - pts[j][1]); if (dd < 14) { x.strokeStyle = `rgba(255,220,224,${(1 - dd / 14) * .7})`; x.beginPath(); x.moveTo(...pts[i]); x.lineTo(...pts[j]); x.stroke(); } }
    x.fillStyle = '#FFE3E6'; for (const p of pts) { x.beginPath(); x.arc(p[0], p[1], 1.2, 0, 6.283); x.fill(); }
  };
  if (RM()) { state.busy = false; draw(0); cancelAnimationFrame(raf); return; }
  const run = () => { cancelAnimationFrame(raf); raf = 0; if (!document.hidden) draw(0); };
  document.addEventListener('visibilitychange', run); run();
}

/* ---------------- Tools: how Cortex acts on the page ---------------- */
function spotlight(el) {
  if (!el) return;
  el.scrollIntoView({ behavior: RM() ? 'auto' : 'smooth', block: 'start' });
  const target = el.querySelector('.h2, h2, h1') || el;
  target.classList.remove('cx-lock'); void target.offsetWidth; target.classList.add('cx-lock');
  setTimeout(() => target.classList.remove('cx-lock'), 2400);
  // A Cortex cursor flies from the orb to the target, so the visitor sees the agent doing the work.
  if (RM()) return;
  const orb = $('#cx-orb'), o = orb.getBoundingClientRect();
  const cur = document.createElement('div'); cur.className = 'cx-cursor'; cur.innerHTML = '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M3 2l13 6-6 1.6L8 16z"/></svg><span>Cortex</span>';
  cur.style.transform = `translate(${o.left}px,${o.top}px)`; document.body.appendChild(cur);
  setTimeout(() => { const r = target.getBoundingClientRect(); cur.style.transform = `translate(${Math.max(12, r.left + 24)}px,${Math.max(80, Math.min(innerHeight - 60, r.top + 20))}px)`; }, 650);
  setTimeout(() => { cur.classList.add('out'); setTimeout(() => cur.remove(), 400); }, 2300);
}

/* Guided tour: Cortex walks the page, one section at a time, saying only what the page itself shows. */
const T = { on: false };
const txt = (sel, root = document) => { const el = root.querySelector(sel); return el ? el.textContent.replace(/\s+/g, ' ').trim() : ''; };
const STOPS = [
  ['work', () => `${$$('#work .card').length} case files. Each one links to its repo, its live system or its paper.`],
  ['studies', () => { const r = $$('#studies .ladder button').map(b => [b.querySelector('.slab').textContent, b.querySelector('b').textContent]); const n = $$('#studies .stile').length; const ev = r.find(x => x[0].startsWith('Evaluated')), rel = r.find(x => x[0].startsWith('v1.0')); return `${n} studies on one written standard${ev ? `, ${ev[1]} evaluated` : ''}${rel ? `, ${rel[1]} released` : ''}. Every verdict is copied from his roadmap.`; }],
  ['ventures', () => `His offices: ${$$('#ventures .vent h3').map(h => h.textContent.trim()).join(', ')}.`],
  ['recognition', () => txt('#recognition .big-label') || 'Credentials, each with a document behind it.'],
  ['proof', () => 'Scroll here and the old site rebuilds into this one, layer by layer.'],
  ['journey', () => txt('#journey .eyebrow').replace(/^\d+\s*\/\s*/, '').replace(/\s*\/\s*/g, ': ') || 'The journey.'],
  ['testimony', () => `${$$('#testimony .tq figure').length} people he worked with, quoted word for word.`],
  ['lab', () => 'His two published methods, running live, plus four game engines to challenge.'],
  ['contact', () => 'Tell me what you need, and I will draft the brief for you.']
];
const homeOr = (id, fn) => { if (isHome && document.getElementById(id)) return fn(document.getElementById(id)); location.href = href('/#' + id); return 'navigating'; };
function applyPendingBrief() {
  const b = ss.get('cortex.brief'); const f = $('#brief'); if (!b || !f) return;
  ss.set('cortex.brief', null);
  const t = f.querySelector('[name="type"]'); if (t && [...t.options].some(o => o.value === b.type)) t.value = b.type;
  const m = f.querySelector('[name="message"]'); if (m && !m.value) m.value = b.message;
  spotlight(f.closest('section') || f); setTimeout(() => { const n = f.querySelector('[name="name"]'); if (n) n.focus({ preventScroll: true }); }, RM() ? 0 : 700);
}
const TOOLS = {
  goto: id => homeOr(id, el => { spotlight(el); return `On ${id}.`; }),
  open: url => { location.href = href(url); return 'Opening.'; },
  game: g => { if (document.querySelector('[data-arcade]')) { location.hash = g; spotlight($('#arcade')); return 'Game loaded. Your move.'; } location.href = href('/lab/#' + g); return 'Opening the arcade.'; },
  studies: rung => {
    const root = $('#studies .ladder') ? $('#studies') : $('[data-studies]');
    if (!root) { location.href = href('/studies/?rung=' + encodeURIComponent(rung)); return 'Opening the studies.'; }
    const b = $$('.ladder button', root).find(x => x.querySelector('.slab').textContent.startsWith(rung));
    if (b && b.getAttribute('aria-pressed') !== 'true') b.click();
    spotlight(root.closest('section') || root);
    const n = b ? b.querySelector('b').textContent : '?';
    return `${n} ${n === '1' ? 'study is' : 'studies are'} ${rung}. They are lit up now.`;
  },
  brief: b => { ss.set('cortex.brief', b); if (isHome && $('#brief')) { applyPendingBrief(); return 'I drafted the brief from your words. Add your name and email, then send it.'; } location.href = href('/#contact'); return 'Opening the brief.'; },
  motion: v => { try { localStorage.setItem('jesun.rm', v === 'off' ? '1' : '0'); } catch (e) { /* blocked */ } H.classList.toggle('rm', v === 'off'); return v === 'off' ? 'Motion is down. It stays down on every page.' : 'Motion is back on. Reload to see the full build.'; },
  replay: () => { if (window.__replayBoot) { close(); setTimeout(() => window.__replayBoot(), 300); return 'Fleet dispatched.'; } location.href = href('/#boot'); return 'Heading home to rebuild.'; },
  email: async () => { try { await navigator.clipboard.writeText(data.site.email); return `Copied: ${data.site.email}`; } catch (e) { return `His email: ${data.site.email}`; } },
  judge: () => { if ($('[data-judge]')) { const j = $('[data-judge]'); spotlight(j.closest('section') || j); const n = $('[data-jnext]', j); if (n) setTimeout(() => n.focus({ preventScroll: true }), RM() ? 0 : 800); return 'Here is a case. Is the judge right?'; } location.href = href('/studies/#judge'); return 'Opening the judge.'; },
  tour: async () => {
    if (!(isHome && document.getElementById('work'))) { ss.set('cortex.pending', 'tour'); location.href = href('/#home'); return 'Heading home for the tour.'; }
    if (T.on) return 'The tour is already running.';
    T.on = true; document.getElementById('cx-panel').classList.add('cx-touring'); const say = window.__cortexSay || (() => {});
    for (const [id, line] of STOPS) {
      if (!T.on) break; const el = document.getElementById(id); if (!el) continue;
      spotlight(el); await say(line(), id);
      await new Promise(r => { const t = setTimeout(r, RM() ? 2600 : 4600); T.skip = () => { clearTimeout(t); r(); }; });
    }
    const done = T.on; T.on = false; T.skip = null; document.getElementById('cx-panel').classList.remove('cx-touring');
    return done ? 'Tour complete. Ask me about anything you saw.' : 'Tour stopped.';
  },
  demo: k => { const run = $('#pso-run'); if (run && k === 'pso') { spotlight($('#pso')); setTimeout(() => run.click(), RM() ? 0 : 900); return 'Swarm running: 120 iterations.'; } return homeOr('lab', el => { spotlight(el); return 'The swarm is live in the Lab.'; }); }
};


/* The reasoning panel: the real retrieval, drawn as it happens. Every number here comes from
   explain() in retrieve.js, so this is the agent's actual working, not an animation of one. */
async function reasonPanel(log, ex, wait) {
  const box = document.createElement('div'); box.className = 'cx-reason';
  box.innerHTML = `<button class="cx-rhead" type="button" aria-expanded="true"><span>Reasoning</span><em data-rstage>reading the question</em><i aria-hidden="true"></i></button>
<div class="cx-rbody"><div class="cx-rtok" data-rtok></div><p class="cx-rline" data-rscan></p><ol class="cx-rcand" data-rcand></ol></div><p class="cx-rsum" data-rsum></p>`;
  const head = box.querySelector('.cx-rhead');
  head.addEventListener('click', () => { const open = box.classList.toggle('shut'); head.setAttribute('aria-expanded', String(!open)); });
  log.appendChild(box); log.scrollTop = log.scrollHeight;
  const stage = t => { box.querySelector('[data-rstage]').textContent = t; };
  const tok = box.querySelector('[data-rtok]');
  for (const w of ex.tokens) {
    const n = (ex.tokenHits && ex.tokenHits[w]) || 0;
    const c = document.createElement('span'); c.className = 'cx-tok' + (n ? '' : ' miss');
    c.innerHTML = `${w}<i>${n}</i>`; c.title = n ? `${n} passages contain this` : 'no passage contains this';
    tok.appendChild(c); await wait(90);
  }
  stage('scoring the record');
  box.querySelector('[data-rscan]').textContent = `${ex.scanned} passages scanned. ${ex.matched} matched${ex.rejected ? `, ${ex.rejected} dropped below coverage` : ''}.`;
  await wait(220);
  const list = box.querySelector('[data-rcand]'), top = ex.hits[0] ? ex.hits[0].score : 1;
  for (const h of ex.hits.slice(0, 4)) {
    const li = document.createElement('li');
    li.innerHTML = `<span class="cx-cname">${h.p.t}</span><span class="cx-cbar"><i style="--w:${Math.max(6, Math.round(h.score / top * 100))}%"></i></span><b>${h.score.toFixed(2)}</b>`;
    li.title = `BM25 ${h.raw}, coverage ${Math.round(h.cover * 100)} percent, prior ${h.prior}`;
    list.appendChild(li); await wait(150);
  }
  if (ex.hits[0]) list.firstChild.classList.add('win');
  stage('answering');
  const c = ex.confidence;
  box.querySelector('[data-rsum]').innerHTML = ex.hits.length
    ? `Chose <b>${ex.hits[0].p.t}</b>. Coverage ${Math.round(ex.hits[0].cover * 100)} percent, ${ex.margin >= 9 ? 'no rival' : `${ex.margin}x clear of the next`}. <span class="cx-conf ${c}">${c} confidence</span>`
    : 'Nothing on the record matches, so I will not guess.';
  log.scrollTop = log.scrollHeight;
  return box;
}

/* ---------------- Conversation ---------------- */
export function initCortex() {
  if ($('#cx-orb')) return;
  const ui = mount(), state = { av: null, busy: false, open: false, voice: false, turns: ss.get('cortex.turns') || [], ix: null, last: null };
  orbLife($('canvas', ui.orb), state);
  $('[data-v="mem"]', ui.panel).textContent = state.turns.length;
  // The record loads the first time Cortex is opened, not on every page view.
  const ensureIndex = () => state.ix ? Promise.resolve(state.ix) : loadIndex(href('/index/passages.json')).then(ix => { state.ix = ix; $('[data-v="neurons"]', ui.panel).textContent = ix.N; return ix; }).catch(() => null);

  const bubble = (who, text, extra) => {
    const m = document.createElement('div'); m.className = 'cx-msg ' + who;
    const p = document.createElement('p'); p.textContent = text; m.appendChild(p);
    if (extra) m.appendChild(extra); ui.log.appendChild(m); ui.log.scrollTop = ui.log.scrollHeight;
    // Once there is something to read, the stage steps back and the log takes the room.
    if (ui.log.children.length > 1) ui.panel.classList.add('cx-chatting');
    return p;
  };
  const chips = list => { ui.chips.innerHTML = ''; for (const c of list) { const b = document.createElement('button'); b.type = 'button'; b.className = 'cx-chip'; b.textContent = c; b.addEventListener('click', () => ask(c)); ui.chips.appendChild(b); } };
  const SUGGEST = { home: ['Give me the tour', 'What does he build?', 'Show me the evaluated studies', 'Play connect four', 'I want to hire him for an AI project'], studies: ['Show me the released study', 'Show me a judge case', 'What is the research spine?'], lab: ['How do you work?', 'Play chess', 'Run the swarm', 'What did he publish?'], work: ['What is PRISM?', 'Take me to the studies', 'What is his tech stack?'] };
  const pageKey = isHome ? 'home' : location.pathname.includes('studies') ? 'studies' : location.pathname.includes('lab') ? 'lab' : location.pathname.includes('work') ? 'work' : 'home';
  const remember = (role, text) => { state.turns.push({ role, text: text.slice(0, 400) }); state.turns = state.turns.slice(-14); ss.set('cortex.turns', state.turns); $('[data-v="mem"]', ui.panel).textContent = state.turns.length; };

  // The lips move with the text as it lands. A vowel opens the mouth wider than a consonant, and
  // a space or a full stop closes it, so the face is reading the answer out rather than chewing.
  const OPEN = { a: .95, e: .8, o: 1, i: .55, u: .7, y: .5 };
  async function type(p, text) {
    if (RM()) { p.textContent = text; return; }
    p.textContent = ''; const step = Math.max(2, Math.round(text.length / 90));
    for (let i = 0; i < text.length; i += step) {
      p.textContent = text.slice(0, i + step); ui.log.scrollTop = ui.log.scrollHeight;
      if (state.av) {
        const ch = text[i] ? text[i].toLowerCase() : ' ';
        state.av.level(ch === ' ' || ch === '.' || ch === ',' ? .05 : (OPEN[ch] || .34) * (.7 + Math.random() * .3));
      }
      await new Promise(r => setTimeout(r, 12));
    }
    if (state.av) state.av.level(0);
  }
  // The server decides which model answers. It may search the live web, so the wait is longer
  // than a local lookup, and the last few turns go with the question so follow-ups make sense.
  async function viaModel(q) {
    if (window.__PREVIEW || location.protocol === 'file:') return null;
    const ctl = new AbortController(); const to = setTimeout(() => ctl.abort(), 15000);
    try {
      const r = await fetch('/api/cortex', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, signal: ctl.signal,
        body: JSON.stringify({ q, turns: state.turns.slice(-6) })
      });
      const j = await r.json(); return j && j.ok ? j : null;
    } catch (e) { return null; } finally { clearTimeout(to); }
  }
  async function ask(raw) {
    const q = String(raw || '').trim(); if (!q || state.busy) return;
    state.busy = true; ui.orb.classList.add('busy'); ui.input.value = ''; avThink();
    dispatchEvent(new CustomEvent('cortex:think', { detail: { q } }));
    bubble('me', q); remember('user', q);
    const p = plan(q);
    // The plan is shown live: each step lights up, then checks off.
    const trace = document.createElement('ol'); trace.className = 'cx-trace'; trace.setAttribute('aria-label', 'What Cortex is doing');
    const holder = bubble('ai', ''); holder.parentNode.insertBefore(trace, holder);
    let result = '', sources = [], engine = 'Local agent', reasonBox = null;
    for (const s of p.steps) {
      const li = document.createElement('li'); li.textContent = s.say; trace.appendChild(li); ui.log.scrollTop = ui.log.scrollHeight;
      await wait(s.tool ? 380 : 240);
      if (s.tool && TOOLS[s.tool]) { try { result = (await TOOLS[s.tool](s.arg)) || result; } catch (e) { result = 'That tool did not run here. Try again on the home page.'; } }
      li.classList.add('done');
    }
    if (p.intent === 'ask' || p.intent === 'greet' || p.intent === 'self' || p.intent === 'help') {
      await ensureIndex();
      // The reasoning is drawn in the log, then moved into this message, above the answer.
      if (p.intent === 'ask' && state.ix) { reasonBox = await reasonPanel(ui.log, explain(state.ix, q, 5), wait); holder.parentNode.insertBefore(reasonBox, holder); }
      const local = compose(q, state.ix);
      // The live tier can answer things the record never covered, so every question gets offered
      // to it. If it is off, capped, slow or unsure, the on device answer is already in hand.
      const remote = p.intent === 'ask' ? await viaModel(q) : null;
      if (remote) {
        result = remote.text; sources = remote.sources || [];
        engine = remote.live ? 'Live model, web and record' : 'Model on the record';
        if (remote.live && remote.searched && remote.searched.length) {
          const s = document.createElement('div'); s.className = 'cx-searched';
          s.appendChild(Object.assign(document.createElement('b'), { textContent: 'Searched the web for' }));
          for (const term of remote.searched.slice(0, 4)) s.appendChild(Object.assign(document.createElement('span'), { textContent: term }));
          holder.parentNode.insertBefore(s, holder);
        }
      } else { result = local.text; sources = local.sources; }
      state.last = q;
    }
    $('[data-engine]', ui.panel).textContent = engine;
    avRest(true);
    await type(holder, result || 'Done.');
    if (sources.length) {
      const s = document.createElement('div'); s.className = 'cx-src';
      for (const x of sources.slice(0, 5)) {
        const a = document.createElement('a'); a.textContent = x.title;
        // A web source leaves the site, so it says so and opens safely.
        if (x.web) { a.href = x.url; a.className = 'web'; a.target = '_blank'; a.rel = 'noopener nofollow'; }
        else a.href = href(x.url);
        s.appendChild(a);
      }
      holder.parentNode.appendChild(s);
    }
    // The working folds away once the answer is on screen; the header reopens it.
    if (reasonBox) { reasonBox.classList.add('shut'); reasonBox.querySelector('.cx-rhead').setAttribute('aria-expanded', 'false'); }
    remember('ai', result || 'Done.');
    // Read aloud on the best voice installed, with the mouth following the real word boundaries
    // rather than the typing, so the lips and the sound agree.
    if (state.voice) {
      avRest(true);
      say(result, {
        onWord: v => { if (state.av) state.av.level(v); },
        onEnd: () => { if (state.av) { state.av.level(0); state.av.state(''); } phase('online', true); emit('idle'); }
      });
    }
    chips(p.intent === 'ask' ? ['Tell me more', 'Take me there', ...SUGGEST[pageKey].slice(0, 2)] : SUGGEST[pageKey]);
    maybeOffer(q);
    state.busy = false; ui.orb.classList.remove('busy'); if (state.av) state.av.state(''); emit(state.voice ? 'speak' : 'idle');
  }

  /* ---- passing a note to Jesun ----
     Cortex offers this once, in plain sight, and only when the visitor sounds like they are
     weighing working with him. Nothing about a visitor is collected quietly: the fields are on
     screen, the visitor types them, and nothing is sent until they press the button. If they
     close the card, it is not offered again for the rest of the session. */
  const HIRE = /\b(hire|hiring|freelance|consult|contract|work with|available|availability|rate|rates|quote|budget|engage|mandate|advis|collaborat|partner|co[- ]?found|build (?:me|us|our)|can he|would he|is he open|get in touch|reach (?:him|out)|contact)\b/i;
  function maybeOffer(q) {
    if (!HIRE.test(q) || ss.get('cortex.lead') || state.leadShown) return;
    state.leadShown = true;
    const card = document.createElement('form'); card.className = 'cx-lead'; card.noValidate = true;
    card.innerHTML = `<p class="cx-lead-h">Want me to pass this to Jesun?</p>
      <p class="cx-lead-s">He reads these himself. Nothing is sent until you press send.</p>
      <label><span>Your name</span><input name="name" autocomplete="name" maxlength="120" required></label>
      <label><span>Email</span><input name="email" type="email" autocomplete="email" maxlength="200" required></label>
      <label><span>What do you need?</span><textarea name="message" rows="3" maxlength="2000" required></textarea></label>
      <div class="cx-lead-b"><button type="submit">Send to Jesun</button><button type="button" data-no>No thanks</button></div>
      <p class="cx-lead-e" role="status"></p>`;
    const note = $('.cx-lead-e', card);
    $('[data-no]', card).addEventListener('click', () => { ss.set('cortex.lead', 'declined'); card.remove(); });
    $('textarea', card).value = q.length > 12 ? q : '';
    card.addEventListener('submit', async e => {
      e.preventDefault();
      const d = new FormData(card), name = String(d.get('name') || '').trim(), email = String(d.get('email') || '').trim(), message = String(d.get('message') || '').trim();
      if (!name || !/^[^@\s]+@[^@\s.]+\.[^@\s]+$/.test(email) || message.length < 10) { note.textContent = 'Add your name, a valid email and a sentence about what you need.'; return; }
      const btn = $('button[type="submit"]', card); btn.disabled = true; note.textContent = 'Sending.';
      try {
        const r = await fetch('/api/contact', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, message, type: 'Other', budget: 'Prefer to discuss', timeline: 'Exploratory' })
        });
        const j = await r.json();
        if (j && j.ok) { ss.set('cortex.lead', 'sent'); card.innerHTML = '<p class="cx-lead-h">Sent. He will come back to you by email.</p>'; }
        else { note.textContent = (j && j.error) || 'That did not send. The contact page has the same form.'; btn.disabled = false; }
      } catch (err) { note.textContent = 'No connection. The contact page has the same form.'; btn.disabled = false; }
    });
    ui.log.appendChild(card); ui.log.scrollTop = ui.log.scrollHeight;
  }

  // The dot field boots once per session: lattice, brain, face, then the agent's own constellation.
  function bootAvatar() {
    if (state.av) return;
    // The engine says which shape it is forming, so the word is never out of step with the dots.
    const WORD = { grid: 'lattice', brain: 'brain', face: 'face', orb: 'resolving', settled: 'online' };
    let booted = false;
    state.av = avatar(ui.av, {
      count: innerWidth < 520 ? 1100 : 2354,
      onPhase(name) {
        if (ui.phase) { ui.phase.textContent = WORD[name] || name; ui.phase.classList.toggle('on', name === 'settled'); }
        // Once the boot has run its course the field comes back to his face and stays there.
        // That is the resting state: it blinks, it looks where you point, it speaks.
        if (name === 'settled' && !booted) {
          booted = true;
          setTimeout(() => { if (state.av && !state.busy) { state.av.play(['face']); if (ui.phase) { ui.phase.textContent = 'online'; ui.phase.classList.add('on'); } } }, 1100);
        }
      }
    });
  }
  // While Cortex works the face dissolves into the sphere, and it reassembles to answer.
  const phase = (word, on) => { if (ui.phase) { ui.phase.textContent = word; ui.phase.classList.toggle('on', !!on); } };
  // The full body companion listens for these, so his body thinks and talks when Cortex does.
  const emit = s => { try { dispatchEvent(new CustomEvent('cortex:state', { detail: s })); } catch (e) { /* old engine */ } };
  function avThink() { emit('think'); if (!state.av) return; state.av.state('think'); state.av.play(['orb']); phase('thinking', false); }
  function avRest(speaking) { emit(speaking ? 'speak' : 'idle'); if (!state.av) return; state.av.state(speaking ? 'speak' : ''); state.av.play(['face']); phase(speaking ? 'speaking' : 'online', true); }

  function open() {
    if (state.open) return; state.open = true; emit('open'); ui.panel.hidden = false; ui.orb.setAttribute('aria-expanded', 'true'); H.classList.add('cx-open');
    requestAnimationFrame(bootAvatar);
    if (!ui.log.children.length) {
      for (const t of state.turns.slice(-6)) bubble(t.role === 'user' ? 'me' : 'ai', t.text);
      if (!state.turns.length) {
        // A small sign of life: Cortex knows the hour where you are and whether you have been here before.
        const h = new Date().getHours(), part = h < 5 ? 'Late night' : h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
        let seen = 0; try { seen = +(localStorage.getItem('jesun.cx.visits') || 0); localStorage.setItem('jesun.cx.visits', String(seen + 1)); } catch (e) { /* blocked */ }
        bubble('ai', `${part}. ${seen ? 'Good to see you again. ' : ''}I am Cortex, and I run this site. Ask me about his work, or give me a task: take the tour, open a game, filter the studies, draft a brief.`);
      }
      else bubble('ai', 'Welcome back. I kept our last turns.');
      chips(SUGGEST[pageKey]);
    }
    ensureIndex();
    setTimeout(() => ui.input.focus(), RM() ? 0 : 120);
  }
  function close() { if (!state.open) return; state.open = false; emit('close'); ui.panel.hidden = true; ui.orb.setAttribute('aria-expanded', 'false'); H.classList.remove('cx-open'); ui.orb.focus({ preventScroll: true }); }
  window.__cortex = { open, close, ask };
  // Tour narration goes into the conversation as it happens.
  window.__cortexSay = async (line, id) => { open(); const p = bubble('ai', ''); p.parentNode.classList.add('tour-line'); const tag = document.createElement('span'); tag.className = 'cx-stop'; tag.textContent = id.toUpperCase(); p.parentNode.prepend(tag); await type(p, line); remember('ai', line); if (state.voice) say(line, { onWord: v => { if (state.av) state.av.level(v); }, onEnd: () => { if (state.av) state.av.level(0); } }); };
  const stopBtn = document.createElement('button'); stopBtn.type = 'button'; stopBtn.className = 'cx-chip cx-stopbtn'; stopBtn.textContent = 'Stop the tour';
  stopBtn.addEventListener('click', () => { T.on = false; if (T.skip) T.skip(); });
  setInterval(() => { const show = T.on; if (show && !stopBtn.isConnected) ui.chips.prepend(stopBtn); if (!show && stopBtn.isConnected) stopBtn.remove(); }, 400);
  // The intro build: the orb works while the fleet builds, then offers the tour.
  addEventListener('swarm:start', () => { ui.orb.classList.add('busy'); });
  addEventListener('swarm:done', e => {
    ui.orb.classList.remove('busy');
    if (ss.get('cortex.pending') === 'tour') { ss.set('cortex.pending', null); setTimeout(() => ask('give me the tour'), 600); return; }
    if (e.detail && e.detail.completed && !state.open) { const tip = $('.cx-tip', ui.orb); tip.textContent = 'Page signed by the fleet. Want the tour? Press /'; ui.orb.classList.add('hint'); setTimeout(() => ui.orb.classList.remove('hint'), 8000); }
  });

  ui.orb.addEventListener('click', () => (state.open ? close() : open()));
  $('[data-close]', ui.panel).addEventListener('click', close);
  ui.form.addEventListener('submit', e => { e.preventDefault(); ask(ui.input.value); });
  ui.panel.addEventListener('keydown', e => { if (e.key === 'Escape') { e.preventDefault(); if (T.on) { T.on = false; if (T.skip) T.skip(); } close(); } });
  ui.input.addEventListener('keydown', e => { if (e.key === 'ArrowUp' && !ui.input.value) { const last = [...state.turns].reverse().find(t => t.role === 'user'); if (last) ui.input.value = last.text; } });
  addEventListener('keydown', e => {
    if (e.key === '/' && (document.activeElement === document.body || !document.activeElement) && !e.ctrlKey && !e.metaKey) { e.preventDefault(); open(); }
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'j') { e.preventDefault(); state.open ? close() : open(); }
  });
  const voiceBtn = $('[data-voice]', ui.panel);
  if (voiceBtn) voiceBtn.addEventListener('click', () => { state.voice = !state.voice; voiceBtn.setAttribute('aria-pressed', String(state.voice)); if (!state.voice) { stopSpeech(); if (state.av) state.av.level(0); } });
  const mic = $('[data-mic]', ui.panel);
  if (mic && SR) {
    let rec = null;
    mic.addEventListener('click', () => {
      if (rec) { rec.stop(); return; }
      rec = new SR(); rec.lang = 'en-US'; rec.interimResults = true; mic.setAttribute('aria-pressed', 'true'); ui.input.placeholder = 'Listening...';
      rec.onresult = e => { const t = [...e.results].map(r => r[0].transcript).join(' '); ui.input.value = t; if (e.results[e.results.length - 1].isFinal) ask(t); };
      rec.onend = rec.onerror = () => { rec = null; mic.setAttribute('aria-pressed', 'false'); ui.input.placeholder = 'Ask, or tell me what to do'; };
      try { rec.start(); } catch (e) { rec = null; }
    });
  }

  // Proactive: after a long read on one section, Cortex offers one relevant move. Twice a session at most.
  if (isHome && 'IntersectionObserver' in window) {
    const HINT = { studies: 'Want only the evaluated studies? Ask me.', work: 'I can open any project, or show what shipped last.', lab: 'Want a game? I can open Connect Four.', contact: 'Tell me what you need. I will draft the brief.', journey: 'Ask me how he got from Dhaka to Toronto.', testimony: 'Ask me what his managers said.' };
    let shown = ss.get('cortex.hints') || 0, timer = 0;
    const tip = $('.cx-tip', ui.orb);
    const io = new IntersectionObserver(es => { for (const e of es) if (e.isIntersecting && e.intersectionRatio > .45) { clearTimeout(timer); const id = e.target.id; if (!HINT[id] || shown >= 2) continue; timer = setTimeout(() => { if (state.open || H.classList.contains('touring')) return; tip.textContent = HINT[id]; ui.orb.classList.add('hint'); shown++; ss.set('cortex.hints', shown); setTimeout(() => ui.orb.classList.remove('hint'), 7000); }, 14000); } }, { threshold: [.45] });
    Object.keys(HINT).forEach(id => { const el = document.getElementById(id); if (el) io.observe(el); });
  }
  applyPendingBrief();
  // A pending tour from another page runs once the home page is ready (after the build, if one plays).
  if (ss.get('cortex.pending') === 'tour' && isHome && !H.classList.contains('boot-armed') && !H.classList.contains('touring')) { ss.set('cortex.pending', null); setTimeout(() => { open(); ask('give me the tour'); }, 700); }
  // Shared links: ?ask= fills the box and opens Cortex, but never runs on its own.
  try { const a = new URLSearchParams(location.search).get('ask'); if (a) { open(); ui.input.value = a.slice(0, 200); } } catch (e) { /* ignore */ }
  $$('[data-cortex-open]').forEach(b => b.addEventListener('click', () => open()));
  try { const r = new URLSearchParams(location.search).get('rung'); if (r && $('[data-studies]')) setTimeout(() => TOOLS.studies(r), 200); } catch (e) { /* ignore */ }
}
