/* Jesun.Code v1.0 countdown strip.
 * Target: 2026-09-27T19:00:00-04:00 (America/Toronto).
 * After the drop, flips to the "live" state with a GitHub link.
 * No em dash used anywhere in this file, per house rule.
 */
(function () {
  'use strict';

  var TARGET = Date.parse('2026-09-27T19:00:00-04:00');

  function pad(n) { return (n < 10 ? '0' : '') + n; }

  function init() {
    var timer = document.getElementById('cd-timer');
    var live = document.getElementById('cd-live');
    var pre = document.getElementById('cd-pre');
    if (!timer || !live) return;

    var dEl = document.getElementById('cd-d');
    var hEl = document.getElementById('cd-h');
    var mEl = document.getElementById('cd-m');
    var sEl = document.getElementById('cd-s');

    function flip() {
      timer.classList.add('hidden');
      if (pre) pre.classList.add('hidden');
      live.classList.remove('hidden');
    }

    function tick() {
      var diff = TARGET - Date.now();
      if (diff <= 0) { flip(); return; }
      var s = Math.floor(diff / 1000);
      dEl.textContent = pad(Math.floor(s / 86400));
      hEl.textContent = pad(Math.floor(s / 3600) % 24);
      mEl.textContent = pad(Math.floor(s / 60) % 60);
      sEl.textContent = pad(s % 60);
    }

    tick();
    window.setInterval(tick, 1000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
