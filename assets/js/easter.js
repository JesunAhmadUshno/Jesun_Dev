/* Easter eggs: Konami party mode + hidden terminal commands.
 * Classic script, DOM only. Integrates with assets/js/terminal.js WITHOUT editing it:
 * terminal.js keeps its private COMMANDS table and its own keydown listener on #term-in.
 * This file adds a capture-phase listener on document for the Enter key: when the typed
 * command is one of the hidden ones, it echoes and answers itself and calls
 * stopPropagation() so terminal.js never sees it. Anything else falls through to
 * terminal.js untouched. No em dash used anywhere in this file, per house rule.
 */
(function () {
  'use strict';

  /* ---------------- Konami code: party mode ---------------- */

  var SEQ = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
             'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
  var pos = 0;
  var partyTimer = null;
  var PARTY_MS = 10000;

  function isTypingTarget(el) {
    return !!el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable);
  }

  function ensurePartyCss() {
    if (document.getElementById('party-css')) return;
    var s = document.createElement('style');
    s.id = 'party-css';
    s.textContent =
      'body.party-mode{animation:party-hue 2.5s linear infinite}' +
      '@keyframes party-hue{to{filter:hue-rotate(360deg)}}' +
      '.party-toast{position:fixed;right:1.2rem;bottom:1.2rem;z-index:9999;' +
      'font-family:"JetBrains Mono",monospace;font-size:0.9rem;color:#00ff88;' +
      'background:#04060a;border:1px solid #00ff88;border-radius:8px;' +
      'padding:0.7rem 1rem;box-shadow:0 0 18px rgba(0,255,136,0.45);}';
    document.head.appendChild(s);
  }

  function partyToast(msg) {
    var old = document.querySelector('.party-toast');
    if (old && old.parentNode) old.parentNode.removeChild(old);
    var d = document.createElement('div');
    d.className = 'party-toast';
    d.textContent = msg;
    document.body.appendChild(d);
    window.setTimeout(function () {
      if (d.parentNode) d.parentNode.removeChild(d);
    }, 4000);
  }

  function partyMode() {
    ensurePartyCss();
    document.body.classList.add('party-mode');
    partyToast('> achievement unlocked: 30 lives');
    if (partyTimer) window.clearTimeout(partyTimer);
    partyTimer = window.setTimeout(function () {
      document.body.classList.remove('party-mode');
      partyTimer = null;
    }, PARTY_MS);
  }

  document.addEventListener('keydown', function (e) {
    if (isTypingTarget(e.target)) { pos = 0; return; }
    var key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    if (key === SEQ[pos]) {
      pos++;
      if (pos === SEQ.length) { pos = 0; partyMode(); }
    } else {
      pos = (key === SEQ[0]) ? 1 : 0;
    }
  });

  /* ---------------- Hidden terminal commands ---------------- */

  function termLine(text, cls) {
    var out = document.getElementById('term-out');
    if (!out) return;
    var d = document.createElement('div');
    d.className = 'term-line' + (cls ? ' ' + cls : '');
    d.textContent = text;
    out.appendChild(d);
    out.scrollTop = out.scrollHeight;
  }

  function matrixRain() {
    /* Obviously playful fake "hack": 5 seconds of falling glyphs, then gone. */
    var c = document.createElement('canvas');
    c.id = 'hack-rain';
    c.style.cssText = 'position:fixed;inset:0;z-index:9998;pointer-events:none;opacity:0.85';
    document.body.appendChild(c);
    var ctx = c.getContext('2d');
    c.width = window.innerWidth;
    c.height = window.innerHeight;
    var chars = 'アイ0123456789$#<>*+-=';
    var font = 16;
    var cols = Math.floor(c.width / font);
    var drops = [];
    for (var i = 0; i < cols; i++) drops[i] = Math.floor(Math.random() * (c.height / font));
    var start = Date.now();
    function draw() {
      ctx.fillStyle = 'rgba(4,6,10,0.12)';
      ctx.fillRect(0, 0, c.width, c.height);
      ctx.fillStyle = '#00ff88';
      ctx.font = font + 'px monospace';
      for (var i = 0; i < drops.length; i++) {
        var ch = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillText(ch, i * font, drops[i] * font);
        if (drops[i] * font > c.height && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
      }
      if (Date.now() - start < 5000) {
        window.requestAnimationFrame(draw);
      } else if (c.parentNode) {
        c.parentNode.removeChild(c);
      }
    }
    draw();
  }

  var HIDDEN = {
    sudo: function () {
      termLine('sudo: permission denied.', 'term-dim');
      termLine('this shell runs on vibes, not root. nothing here ever needed privileges anyway.');
    },
    vim: function () {
      termLine('vim opened... and closed. you hit :q! like a pro.');
    },
    emacs: function () {
      termLine('emacs: a great operating system, still waiting on a decent editor.');
      termLine('(this terminal ships with neither. it has coffee instead. try "coffee".)');
    },
    nano: function () {
      termLine('nano: the honest editor. no jokes here, only respect.');
    },
    hack: function () {
      termLine('deploying elite hax0r mode...', 'term-dim');
      termLine('(just kidding. this is a cartoon. nothing is happening, and nothing can.)');
      matrixRain();
    },
    coffee: function () {
      termLine('      ( (');
      termLine('       ) )');
      termLine('    ........');
      termLine('    |      |]');
      termLine('     \\      /');
      termLine('      `----\'');
      termLine('brewing coffee... done. decaf. stay sharp.');
    },
    '42': function () {
      termLine('42: the answer to life, the universe, and everything.');
      termLine('the question is still loading. check back in 7.5 million years.');
    },
    exit: function () {
      termLine('there is no escape. this tab is home now.');
    },
    'rm': function (raw) {
      if (/rm\s+-rf\s+\/?$/.test(raw)) {
        termLine('nope. the only thing getting deleted here is this bad idea.');
      } else {
        termLine('rm: refusing to pretend. your files are safe from this terminal.');
      }
    }
  };

  /* Capture phase on document runs before terminal.js (bound on #term-in).
   * We only swallow the event when we actually handle a hidden command. */
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Enter') return;
    var input = document.getElementById('term-in');
    var out = document.getElementById('term-out');
    if (!input || !out || e.target !== input) return;
    var raw = input.value.trim();
    if (!raw) return;
    var cmd = raw.toLowerCase().split(/\s+/)[0];
    var fn = HIDDEN[cmd];
    if (!fn) return; /* not ours: let terminal.js handle it */
    e.stopPropagation();
    input.value = '';
    termLine('> ' + raw, 'term-echo');
    fn(raw);
  }, true);
})();
