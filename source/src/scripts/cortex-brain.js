// Cortex brain: turns a sentence into a visible plan of steps, and answers only from the site's record.
// Pure functions, no DOM, so the same brain runs in tests, in the browser and behind the API.
// Copyright Jesun Ahmad Ushno. All rights reserved.
import { search, bestSentence } from './retrieve.js';

const SECTIONS = {
  home: ['home', 'top', 'start', 'hero'], work: ['work', 'projects', 'portfolio', 'products', 'builds'],
  studies: ['studies', 'study', 'research', 'judge spine'], ventures: ['ventures', 'companies', 'startups', 'immitly', 'brimwood', 'climeam'],
  recognition: ['recognition', 'credentials', 'awards', 'distinction'], proof: ['before and after', 'old site', 'noise', 'signal'],
  about: ['about', 'skills', 'toolkit', 'education', 'systems'], journey: ['journey', 'timeline', 'story', 'history', 'career'],
  testimony: ['testimony', 'recommendations', 'reviews', 'what people say', 'testimonials'], lab: ['lab', 'demos', 'experiments'],
  contact: ['contact', 'reach', 'email him', 'get in touch']
};
const PAGES = { resume: '/resume/', writing: '/writing/', journal: '/journal/', now: '/now/', uses: '/uses/', guestbook: '/guestbook/', build: '/build/' };
const GAMES = [['c4', /connect ?(four|4)/], ['ttt', /tic.?tac.?toe|noughts/], ['rps', /rock.?paper|scissors|mind ?reader/], ['chess', /\bchess\b/]];
const RUNGS = [['v1.0 Released', /\breleased?\b|v1/], ['Evaluated', /\bevaluated\b/], ['Functional', /\bfunctional\b/], ['Proposed', /\bproposed\b/], ['Draft', /\bdrafts?\b/]];
const TYPES = [['Venture partnership', /venture|partner|co.?found/], ['Advisory mandate', /advis|consult|board/], ['Research collaboration', /research|paper|study|collab/], ['Speaking', /speak|talk|panel|podcast/], ['Engineering mandate', /build|engineer|project|hire|ship|develop|ai|agent|data/]];
const has = (q, words) => words.some(w => new RegExp(`\\b${w}\\b`).test(q));
const NAV = /\b(go|take|show|open|jump|navigate|scroll|bring|see)\b/;

// The plan is what the visitor watches: every step says what Cortex is doing, tools act on the page.
export function plan(input) {
  const q = String(input || '').toLowerCase().replace(/[^a-z0-9 .?']+/g, ' ').replace(/\s+/g, ' ').trim();
  const steps = [{ say: 'Parsing the request' }];
  const add = (tool, arg, say) => steps.push({ tool, arg, say });
  if (!q) return { q, steps: [...steps, { say: 'Nothing to act on yet' }], intent: 'empty' };

  if (/^(hi|hey|hello|salam|yo|good (morning|evening|afternoon))\b/.test(q) && q.split(' ').length <= 4) return { q, intent: 'greet', steps: [...steps, { say: 'Greeting a new visitor' }] };
  if (/\b(tour|walk me through|show me around|guide me|give me the tour|walkthrough)\b/.test(q)) { steps.push({ tool: 'tour', arg: null, say: 'Planning a route through the page' }); return { q, intent: 'tour', steps }; }
  if (/\bhow do you (work|think|answer)\b|\byour (architecture|brain)\b/.test(q)) { steps.push({ tool: 'open', arg: '/lab/#cortex', say: 'Opening my own diagram' }); return { q, intent: 'nav', steps }; }
  if (/\b(who|what) are you\b|\byour name\b|are you (an? )?(ai|bot|human)/.test(q)) return { q, intent: 'self', steps: [...steps, { say: 'Reading my own spec' }] };
  if (/\b(help|what can you do|commands|abilities)\b/.test(q)) return { q, intent: 'help', steps: [...steps, { say: 'Listing my tools' }] };

  for (const [g, re] of GAMES) if (re.test(q) && (/\b(play|game|challenge|beat|start|open)\b/.test(q) || q.split(' ').length <= 4)) { add('game', g, 'Opening the arcade engine'); return { q, intent: 'game', steps }; }
  if (/\b(arcade|games?)\b/.test(q)) { add('game', 'chess', 'Opening the arcade'); return { q, intent: 'game', steps }; }

  if (/\b(reduce|less|stop|calm|no) (the )?(motion|animation)s?\b|\bmotion (off|less)\b/.test(q)) { add('motion', 'off', 'Turning motion down'); return { q, intent: 'control', steps }; }
  if (/\b(full|more|turn on) (motion|animation)s?\b|\bmotion on\b/.test(q)) { add('motion', 'on', 'Turning motion back on'); return { q, intent: 'control', steps }; }
  if (/\b(replay|rebuild|run) (the )?(build|swarm|agents)\b|\bbuild (it )?again\b/.test(q)) { add('replay', null, 'Dispatching the fleet to rebuild the page'); return { q, intent: 'control', steps }; }
  if (/\b(copy|give me|what is) (his )?e.?mail\b|\bemail address\b/.test(q)) { add('email', null, 'Copying the address'); return { q, intent: 'control', steps }; }
  if (/\bjudge\b/.test(q) && /\b(case|vote|show|try|play)\b/.test(q)) { add('judge', null, 'Loading a judge case'); return { q, intent: 'judge', steps }; }
  if (/\b(run|start|show)\b.*\b(pso|swarm|particle|wavelet|scan|demo)\b/.test(q)) { add('goto', /wave|scan/.test(q) ? 'lab' : 'lab', 'Routing to the live demos'); add('demo', /wave|scan/.test(q) ? 'wave' : 'pso', 'Starting the run'); return { q, intent: 'demo', steps }; }

  const rung = RUNGS.find(([, re]) => re.test(q));
  if (rung && /\bstud(y|ies)|labs?|verdicts?|research\b/.test(q)) { add('studies', rung[0], `Filtering studies to ${rung[0]}`); return { q, intent: 'studies', steps }; }

  if (/\b(hire|work with|collaborate|partner|engage|book|mandate|brief|need (him|you)|build (me|us))\b/.test(q)) {
    const t = TYPES.find(([, re]) => re.test(q)); add('brief', { type: t ? t[0] : 'Other', message: input.trim() }, 'Drafting a brief from your words'); return { q, intent: 'brief', steps };
  }
  for (const [p, url] of Object.entries(PAGES)) if (new RegExp(`\\b${p}\\b`).test(q) && NAV.test(q)) { add('open', url, `Opening ${p}`); return { q, intent: 'nav', steps }; }
  if (NAV.test(q)) for (const [id, words] of Object.entries(SECTIONS)) if (has(q, [id, ...words])) { add('goto', id, `Moving to ${id}`); return { q, intent: 'nav', steps }; }

  steps.push({ say: 'Searching the record' }, { say: 'Checking sources' });
  return { q, intent: 'ask', steps };
}

const SELF = 'I am Cortex, the agent that runs this site. I can move you around, open the games, filter his studies, draft a brief for him, run the live demos, and answer questions. Every answer comes from this site\'s own record, with sources. I do not guess.';
const HELP = 'Try: "give me the tour", "show me the evaluated studies", "play connect four", "what did he publish", "take me to the lab", "I want to hire him for an AI project", "replay the build", or "reduce motion".';

// Compose an answer from retrieved passages only. Off-record questions get a plain refusal.
export function compose(input, ix, k = 3) {
  const p = plan(input);
  if (p.intent === 'greet') return { text: 'Hello. I am Cortex, the agent inside this site. Ask me anything about his work, or tell me what to do. ' + HELP, sources: [], onRecord: true, plan: p };
  if (p.intent === 'self') return { text: SELF, sources: [], onRecord: true, plan: p };
  if (p.intent === 'help') return { text: HELP, sources: [], onRecord: true, plan: p };
  if (p.intent !== 'ask') return { text: '', sources: [], onRecord: true, plan: p };
  const hits = ix ? search(ix, input, k) : [];
  if (!hits.length) return { text: 'That is not on the record, so I will not guess. ' + HELP, sources: [], onRecord: false, plan: p };
  const top = hits[0], lead = bestSentence(top.p.x, input);
  const more = hits.slice(1).filter(h => h.score > top.score * .78 && !h.p.id.startsWith('s-')).map(h => bestSentence(h.p.x, input)).filter(s => s && !lead.includes(s.slice(0, 40)));
  const text = [lead, ...more.slice(0, 1)].join(' ');
  return { text, sources: hits.slice(0, k).map(h => ({ title: h.p.t, url: h.p.u })), onRecord: true, plan: p, passages: hits.map(h => h.p) };
}
