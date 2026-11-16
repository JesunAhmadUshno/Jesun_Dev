/* Arms the swarm build before first paint, only when it will really run. Copyright Jesun Ahmad Ushno. */
(function () {
  var H = document.documentElement, m = document.querySelector('meta[name="build"]');
  window.__FP = m ? m.content : 'dev';
  try {
    if (!document.querySelector('meta[name="page"][content="home"]')) return;
    var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches; try { if (localStorage.getItem('jesun.rm') === '1') { reduce = true; H.classList.add('rm'); } } catch (e) {}
    var force = location.hash === '#boot' || /[?&]boot=1/.test(location.search);
    var done = null; try { done = localStorage.getItem('jesun.boot'); } catch (e) {}
    if (!reduce && (force || done !== '1')) {
      H.classList.add('boot-armed');
      // Failsafe: if the build script never starts (blocked, offline, error), show the page.
      // Slow networks (embedded previews) can take several seconds, so wait 12s before giving up,
      // and only abandon early when the site's own script actually fails.
      setTimeout(function () { if (!window.__homeReady) H.classList.remove('boot-armed', 'tour-armed'); }, 12000);
      addEventListener('error', function (e) { var f = (e && e.filename) || ''; if (!window.__homeReady && /\/js\//.test(f)) H.classList.remove('boot-armed', 'tour-armed'); });
    }
  } catch (e) {}
})();
