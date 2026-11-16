// Reading answers aloud, without sounding like a 2005 satnav.
//
// The old code called speechSynthesis.speak() with no voice set, so every visitor got their
// system default: Microsoft David or Zira on Windows, Albert on a Mac. Those are the robotic
// ones. Every current system also ships neural voices for free (Windows 11 "Natural", Edge
// "Online", macOS "Premium" and "Enhanced", Chrome's "Google" set), and they sound human. This
// picks the best one installed, instead of the first one offered.
//
// It also reads in sentences rather than one long run, so the voice breathes at punctuation,
// and it reports word boundaries so the avatar's mouth follows real speech.
// Copyright Jesun Ahmad Ushno. All rights reserved.

// Worth seeking out. Higher wins.
const GOOD = [[/natural/i, 70], [/neural/i, 70], [/\bonline\b/i, 55], [/premium/i, 50], [/enhanced/i, 40], [/\bgoogle\b/i, 34], [/siri/i, 30]];
// The old robotic formant voices, and the novelty ones. Avoid unless nothing else exists.
const POOR = [/espeak/i, /\bdavid\b/i, /\bzira\b/i, /\bmark\b/i, /\bhazel\b/i, /\balbert\b/i, /\bfred\b/i, /\bjunior\b/i, /\bralph\b/i, /\bkathy\b/i, /\bbahh\b/i, /\bbells\b/i, /\bboing\b/i, /\bbubbles\b/i, /\bcellos\b/i, /\bderanged\b/i, /\bgood news\b/i, /\bbad news\b/i, /\bjester\b/i, /\borganK?\b/i, /\btrinoids\b/i, /\bwhisper\b/i, /\bwobble\b/i, /\bzarvox\b/i, /compact/i];
// Cortex speaks for him, so a male voice fits. This is a preference, never a requirement.
const MALE = /\b(andrew|brian|guy|christopher|eric|roger|ryan|steffan|davis|tony|daniel|alex|oliver|arthur|liam|aaron|reed|rishi|thomas)\b/i;

function score(v) {
  const n = v.name || '', lang = (v.lang || '').toLowerCase();
  if (!lang.startsWith('en')) return -1;
  let s = 0;
  for (const [re, pts] of GOOD) if (re.test(n)) { s += pts; break; }
  for (const re of POOR) if (re.test(n)) { s -= 45; break; }
  if (MALE.test(n)) s += 14;
  if (lang === 'en-ca') s += 8; else if (lang === 'en-us') s += 6; else if (lang === 'en-gb') s += 4;
  if (v.localService) s += 3;          // local voices start instantly and work offline
  return s;
}

let chosen = null, listed = false;
export function pickVoice(list) {
  const vs = list || (window.speechSynthesis ? speechSynthesis.getVoices() : []);
  if (!vs || !vs.length) return null;
  let best = null, bs = -Infinity;
  for (const v of vs) { const s = score(v); if (s > bs) { bs = s; best = v; } }
  return bs < 0 ? null : best;     // every voice is non English: let the browser decide
}

function voice() {
  if (chosen) return chosen;
  chosen = pickVoice();
  if (!chosen && !listed) {
    // Chrome fills the voice list asynchronously, so the first call often sees nothing.
    listed = true;
    try { speechSynthesis.addEventListener('voiceschanged', () => { chosen = pickVoice(); }, { once: true }); } catch (e) { /* older engine */ }
  }
  return chosen;
}

// Split on sentence ends, keeping the punctuation, then glue fragments that are too short to be
// worth a breath. One utterance per sentence is what makes the delivery sound considered.
export function sentences(text) {
  const raw = String(text || '').replace(/\s+/g, ' ').trim();
  if (!raw) return [];
  const parts = raw.match(/[^.!?]+[.!?]*/g) || [raw];
  const out = [];
  let cur = '';
  for (const p of parts) {
    const t = p.trim(); if (!t) continue;
    cur = cur ? cur + ' ' + t : t;
    // Flush once a chunk is long enough to be worth a breath. A one word sentence on its own
    // utterance sounds clipped, and a whole paragraph in one breath sounds like a machine.
    if (cur.length >= 44) { out.push(cur); cur = ''; }
  }
  if (cur) { if (out.length && cur.length < 24) out[out.length - 1] += ' ' + cur; else out.push(cur); }
  return out;
}

/**
 * say(text, { onWord, onEnd }) reads text aloud and resolves when it finishes or is cancelled.
 * onWord(level) fires on each word boundary with a mouth openness between 0 and 1.
 */
export function say(text, { onWord, onEnd } = {}) {
  if (!('speechSynthesis' in window)) return Promise.resolve(false);
  const lines = sentences(text);
  if (!lines.length) return Promise.resolve(false);
  stop();
  const v = voice();
  return new Promise(resolve => {
    let i = 0, done = false;
    const finish = ok => { if (done) return; done = true; if (onWord) onWord(0); if (onEnd) onEnd(); resolve(ok); };
    const next = () => {
      if (i >= lines.length) return finish(true);
      const u = new SpeechSynthesisUtterance(lines[i++]);
      if (v) { u.voice = v; u.lang = v.lang; }
      // Slightly under natural pace and a touch below default pitch. The browser default of
      // rate 1 with pitch 1 is what makes the stock voices sound clipped and synthetic.
      u.rate = .96; u.pitch = .94; u.volume = 1;
      if (onWord) u.onboundary = e => { if (e.name === 'word' || !e.name) onWord(.3 + Math.random() * .45); };
      u.onend = () => setTimeout(next, 150);      // a real pause between sentences
      u.onerror = () => finish(false);
      try { speechSynthesis.speak(u); } catch (e) { finish(false); }
    };
    next();
  });
}

export function stop() {
  try { speechSynthesis.cancel(); } catch (e) { /* nothing to cancel */ }
}

// Chrome stops speaking after about fifteen seconds unless it is nudged. This is the long
// standing workaround, and it is a no op in every other engine.
if ('speechSynthesis' in window) {
  setInterval(() => { try { if (speechSynthesis.speaking && !speechSynthesis.paused) { speechSynthesis.pause(); speechSynthesis.resume(); } } catch (e) { /* ignore */ } }, 9000);
}
