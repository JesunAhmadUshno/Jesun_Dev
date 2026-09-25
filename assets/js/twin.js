/* Jesun.Dev AI twin widget.
 * Guided, rule-based Q&A over TWIN_DATA (twin-data.js). It never pretends to
 * be a live language model: answers are keyword-matched from site data,
 * computed locally in the browser. Nothing is sent anywhere.
 *
 * i18n: fetches content-strings.json (override via window.__TWIN_STRINGS_URL),
 * applies keys prefixed "twin-", and re-applies when <html lang> changes
 * (the site's lang.js toggles it). Default visible copy is English.
 */
(function (root) {
  'use strict';

  function getData() {
    if (typeof require === 'function') {
      try { return require('./twin-data.js'); } catch (e) { /* browser path below */ }
    }
    return root.TWIN_DATA || null;
  }

  /* ---------- matching ---------- */

  var STOPWORDS = {
    a: 1, an: 1, the: 1, is: 1, are: 1, was: 1, were: 1, be: 1, been: 1,
    do: 1, does: 1, did: 1, can: 1, could: 1, would: 1, should: 1, will: 1,
    what: 1, which: 1, how: 1, when: 1, why: 1, whom: 1,
    i: 1, me: 1, my: 1, you: 1, your: 1, he: 1, him: 1, his: 1,
    she: 1, her: 1, it: 1, its: 1, we: 1, our: 1, they: 1, their: 1, them: 1,
    of: 1, to: 1, in: 1, on: 1, at: 1, for: 1, with: 1, and: 1, or: 1,
    as: 1, by: 1, from: 1, that: 1, this: 1, these: 1, those: 1, there: 1,
    here: 1, about: 1, tell: 1, please: 1, know: 1, like: 1,
    s: 1, t: 1, d: 1, ll: 1, ve: 1, re: 1, m: 1, don: 1
  };

  function contentTokens(s) {
    return normalize(s).split(' ').filter(function (w) { return w && !STOPWORDS[w]; });
  }

  function normalize(s) {
    return String(s == null ? '' : s)
      .toLowerCase()
      .replace(/[^\p{L}\p{N}\s]/gu, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function lev(a, b) {
    var m = a.length, n = b.length;
    if (!m) return n;
    if (!n) return m;
    var d = [], i, j;
    for (i = 0; i <= m; i++) d[i] = [i];
    for (j = 0; j <= n; j++) d[0][j] = j;
    for (i = 1; i <= m; i++) {
      for (j = 1; j <= n; j++) {
        var cost = a.charAt(i - 1) === b.charAt(j - 1) ? 0 : 1;
        d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost);
      }
    }
    return d[m][n];
  }

  /* fuzzy token match: exact > substring > small edit distance */
  function tokenScore(qw, kw) {
    if (qw === kw) return 1;
    if (qw.length < 3 || kw.length < 3) return 0;
    if (qw.indexOf(kw) >= 0 || kw.indexOf(qw) >= 0) return 0.8;
    var tol = Math.max(qw.length, kw.length) <= 5 ? 1 : 2;
    if (lev(qw, kw) <= tol) return 0.6;
    return 0;
  }

  /* Per entry, each unique keyword token contributes its best match against
     an unused query token (greedy). This rewards multi-token coverage
     (e.g. "jesun code") while a token repeated across keys counts once. */
  function entryScore(qtokens, entry) {
    var seen = {}, total = 0, used = {};
    entry.keys.forEach(function (raw) {
      contentTokens(raw).forEach(function (kt) {
        if (seen[kt]) return;
        seen[kt] = 1;
        var best = 0, bestJ = -1, j;
        for (j = 0; j < qtokens.length; j++) {
          if (used[j]) continue;
          var s = tokenScore(qtokens[j], kt);
          if (s > best) { best = s; bestJ = j; }
        }
        if (bestJ >= 0) used[bestJ] = 1;
        total += best;
      });
    });
    return total;
  }

  function twinAnswer(query, lang) {
    var data = getData();
    var L = (lang === 'bn') ? 'bn' : 'en';
    if (!data) return '';
    var qtokens = contentTokens(query);
    if (!qtokens.length) return data.fallback[L];
    var best = null, bestScore = 0;
    data.entries.forEach(function (e) {
      var s = entryScore(qtokens, e);
      if (s > bestScore) { bestScore = s; best = e; }
    });
    /* threshold 1: at least one solid keyword hit, never a lone fuzzy guess */
    if (best && bestScore >= 1) return best.a[L];
    return data.fallback[L];
  }

  /* ---------- browser widget ---------- */

  var STRINGS_CACHE = null;

  function currentLang() {
    try { return localStorage.getItem('jesundev-lang') || 'en'; } catch (e) { return 'en'; }
  }

  function escH(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function linkify(s) {
    return s.replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" target="_blank" rel="noopener">$1</a>');
  }

  function applyTwinStrings(lang, strings) {
    if (!strings || !strings[lang]) return;
    var table = strings[lang];
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var k = el.getAttribute('data-i18n');
      if (k.indexOf('twin-') !== 0) return;
      var v = table[k];
      if (typeof v !== 'string') return;
      if (k === 'twin-placeholder') {
        var inp = document.getElementById('twin-in');
        if (inp) inp.setAttribute('placeholder', v);
      } else {
        el.innerHTML = v;
      }
    });
    /* refresh chip labels in the new language */
    var data = getData();
    var box = document.getElementById('twin-chips');
    if (data && box) {
      var btns = box.querySelectorAll('.twin-chip');
      data.chips.forEach(function (c, i) {
        if (btns[i]) btns[i].textContent = c[lang] || c.en;
      });
    }
  }

  function loadTwinStrings() {
    var url = root.__TWIN_STRINGS_URL || 'content-strings.json';
    if (typeof fetch !== 'function') return;
    fetch(url).then(function (r) {
      if (!r.ok) throw new Error('strings ' + r.status);
      return r.json();
    }).then(function (j) {
      STRINGS_CACHE = j;
      applyTwinStrings(currentLang(), j);
    }).catch(function () { /* default English copy stays */ });
  }

  function initWidget() {
    var data = getData();
    var log = document.getElementById('twin-log');
    var form = document.getElementById('twin-form');
    var input = document.getElementById('twin-in');
    var chipsBox = document.getElementById('twin-chips');
    if (!data || !log || !form || !input) return;

    function addMsg(who, text) {
      var div = document.createElement('div');
      div.className = 'twin-msg twin-' + who;
      div.innerHTML = linkify(escH(text));
      log.appendChild(div);
      log.scrollTop = log.scrollHeight;
    }

    function ask(q) {
      q = String(q == null ? '' : q).trim();
      if (!q) return;
      addMsg('user', q);
      addMsg('bot', twinAnswer(q, currentLang()));
    }

    if (chipsBox) {
      chipsBox.innerHTML = '';
      data.chips.forEach(function (c) {
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'twin-chip';
        b.textContent = c[currentLang()] || c.en;
        b.addEventListener('click', function () { ask(c.q); input.focus(); });
        chipsBox.appendChild(b);
      });
    }

    addMsg('bot', data.greeting[currentLang()] || data.greeting.en);

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      ask(input.value);
      input.value = '';
      input.focus();
    });

    loadTwinStrings();

    if (typeof MutationObserver !== 'undefined') {
      new MutationObserver(function () {
        if (STRINGS_CACHE) applyTwinStrings(currentLang(), STRINGS_CACHE);
      }).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
    }
  }

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initWidget);
    } else {
      initWidget();
    }
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
      twinAnswer: twinAnswer,
      normalize: normalize,
      entryScore: entryScore,
      tokenScore: tokenScore
    };
  } else {
    root.twinAnswer = twinAnswer;
  }
})(typeof window !== 'undefined' ? window : this);
