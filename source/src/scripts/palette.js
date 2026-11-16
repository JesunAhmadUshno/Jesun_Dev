// Command palette (Cmd+K / Ctrl+K). Copyright Jesun Ahmad Ushno. All rights reserved.
import { $, $$, href } from './core.js';
import { loadIndex, search, bestSentence } from './retrieve.js';
import data from '../data/jesun.json';
import { runEgg } from './eggs.js';

const go = p => () => { location.href = href(p); };
const ITEMS = [
  ['Home', 'page', go('/')], ['Work', 'page', go('/work/')], ['Studies', 'page', go('/studies/')], ['Judge the judge', 'study', go('/studies/#judge')], ['Lab', 'page', go('/lab/')],
  ['Journey', 'page', go('/journey/')], ['About', 'page', go('/about/')], ['Writing', 'page', go('/writing/')],
  ['Journal', 'page', go('/journal/')], ['Now', 'page', go('/now/')], ['Contact', 'page', go('/contact/')],
  ['Resume', 'page', go('/resume/')], ['Uses', 'page', go('/uses/')], ['Legal and privacy', 'page', go('/legal/')],
  ['Terminal', 'lab', go('/lab/#terminal')], ['Digital twin', 'lab', go('/lab/#twin')], ['Systems wall', 'lab', go('/lab/#wall')],
  ['The System (fleet seats)', 'lab', go('/lab/#system')], ['Chess', 'lab', go('/lab/#chess')],
  ...data.projects.map(p => [p.name, 'project', go('/projects/' + p.slug + '.html')]),
  ...data.ventures.map(v => [v.name + ' (' + v.title + ')', 'venture', go('/work/#ventures')]),
  ['Ask Cortex, the site agent', 'agent', () => { if (window.__cortex) window.__cortex.open(); }],
  ['Replay the build', 'action', () => runEgg('replay')],
  ['Toggle grid overlay', 'action', () => runEgg('grid')],
  ['Download resume (PDF)', 'action', go('/resume/Jesun-Ahmad-Ushno-Resume.pdf')],
  ['Copy email', 'action', () => runEgg('email')],
  ['Fleet roll call', 'egg', () => runEgg('rollcall')],
  ['Coffee', 'egg', () => runEgg('coffee')],
  ['Sign the build', 'egg', () => runEgg('sign')]
];

let back = null, idx = 0, list = [], IX = null;
function render(q) {
  const ul = $('ul', back);
  const words = q.toLowerCase().trim();
  list = ITEMS.filter(i => !words || (i[0] + ' ' + i[1]).toLowerCase().includes(words)).slice(0, 40);
  if (words.length >= 3 && IX) {
    for (const h of search(IX, words, 6)) { const ex = bestSentence(h.p.x, words); list.push([h.p.t + ': ' + (ex.length > 90 ? ex.slice(0, 88) + '...' : ex), 'record', go(h.p.u)]); }
  }
  idx = Math.min(idx, Math.max(0, list.length - 1));
  ul.innerHTML = '';
  list.forEach((it, i) => {
    const li = document.createElement('li');
    li.id = 'pal-' + i; li.setAttribute('role', 'option'); li.setAttribute('aria-selected', String(i === idx));
    li.innerHTML = '<b></b><span></span>';
    li.firstChild.textContent = it[0]; li.lastChild.textContent = it[1];
    li.addEventListener('click', () => { close(); it[2](); });
    ul.appendChild(li);
  });
  if (!list.length) { const li = document.createElement('li'); li.setAttribute('role', 'option'); li.setAttribute('aria-disabled', 'true'); li.innerHTML = '<b>No results</b><span>Try another word, or ask Cortex with /</span>'; ul.appendChild(li); }
  const live = $('.pal-live', back); if (live) live.textContent = list.length ? `${list.length} results` : 'No results';
  $('input', back).setAttribute('aria-activedescendant', list.length ? 'pal-' + idx : '');
  const sel = $('#pal-' + idx); if (sel) sel.scrollIntoView({ block: 'nearest' });
}
let lastFocus = null;
export function openPalette() {
  if (back) return;
  lastFocus = document.activeElement;
  back = document.createElement('div');
  back.className = 'pal-back';
  back.innerHTML = '<div class="pal" role="dialog" aria-modal="true" aria-label="Command palette"><span class="pal-live sr" role="status" aria-live="polite"></span><input type="text" role="combobox" aria-expanded="true" aria-controls="pal-list" aria-label="Type a command" placeholder="> jump to, run, replay..." autocomplete="off" spellcheck="false"><ul id="pal-list" role="listbox"></ul></div>';
  document.body.appendChild(back);
  const input = $('input', back);
  idx = 0; render('');
  input.focus();
  loadIndex(href('/index/passages.json')).then(ix => { IX = ix; if (back && input.value) render(input.value); }).catch(() => {});
  input.addEventListener('input', () => { idx = 0; render(input.value); });
  input.addEventListener('keydown', e => {
    if (e.key === 'ArrowDown') { idx = Math.min(list.length - 1, idx + 1); render(input.value); e.preventDefault(); }
    else if (e.key === 'ArrowUp') { idx = Math.max(0, idx - 1); render(input.value); e.preventDefault(); }
    else if (e.key === 'Enter' && list[idx]) { const f = list[idx][2]; close(); f(); }
    else if (e.key === 'Escape') close();
    else if (e.key === 'Tab') e.preventDefault();
  });
  back.addEventListener('click', e => { if (e.target === back) close(); });
}
export function close() {
  if (!back) return;
  back.remove(); back = null;
  if (lastFocus && lastFocus.focus) lastFocus.focus();
}
export function initPalette() {
  addEventListener('keydown', e => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); back ? close() : openPalette(); }
  });
  $$('.k-mod').forEach(el => { el.textContent = /Mac|iPhone|iPad/.test(navigator.platform) ? '⌘' : 'Ctrl'; });
}
