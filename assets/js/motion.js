/* ============================================================
 * JESUN.DEV motion layer (Vega, Motion Designer)
 *
 * Particle hero canvas, custom neon cursor, reveal stagger.
 * Defensive by design: every feature checks its APIs first and
 * the whole file exits early when prefers-reduced-motion is set.
 * No em dash characters anywhere in this file.
 * ============================================================ */
(function () {
  'use strict';

  /* ---- reduced motion: everything stays off ---- */
  var reduced = false;
  try {
    reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch (e) {
    reduced = false;
  }
  if (reduced) {
    return;
  }

  /* shared stats so the parent agent can measure what ran */
  var stats = { particles: 0, canvasW: 0, canvasH: 0, cursor: false, staggerGroups: 0 };

  /* ============================================================
   * 1. Particle background behind the hero.
   * Drifting nodes in neon green/cyan with faint connecting
   * traces. Capped count, delta-time rAF, paused when the tab
   * is hidden or the hero is off screen.
   * ============================================================ */
  function initParticles() {
    if (!window.requestAnimationFrame) {
      return;
    }
    var hero = document.querySelector('.hero');
    if (!hero) {
      return;
    }
    var canvas = document.createElement('canvas');
    canvas.className = 'particle-layer';
    canvas.setAttribute('aria-hidden', 'true');
    var ctx = canvas.getContext ? canvas.getContext('2d') : null;
    if (!ctx) {
      return;
    }
    hero.insertBefore(canvas, hero.firstChild);

    var dpr = 1;
    try {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
    } catch (e) {
      dpr = 1;
    }

    var W = 0;
    var H = 0;
    var parts = [];
    var rafId = 0;
    var lastT = 0;
    var ticking = false;
    var LINK_DIST = 130; /* px */
    var LINK_DIST2 = LINK_DIST * LINK_DIST;
    var mouse = { x: -9999, y: -9999 };

    /* area based budget: about one node per 16000 px2, 28 to 110 */
    function particleCount() {
      var n = Math.round((W * H) / 16000);
      if (n < 28) {
        n = 28;
      }
      if (n > 110) {
        n = 110;
      }
      return n;
    }

    function build() {
      parts = [];
      var n = particleCount();
      for (var i = 0; i < n; i++) {
        parts.push({
          x: Math.random() * W,
          y: Math.random() * H,
          vx: (Math.random() - 0.5) * 36, /* px per second */
          vy: (Math.random() - 0.5) * 36,
          r: 0.8 + Math.random() * 1.5,
          c: Math.random() < 0.62 ? '0,255,136' : '34,211,238'
        });
      }
      stats.particles = n;
      stats.canvasW = W;
      stats.canvasH = H;
    }

    function resize() {
      var r = hero.getBoundingClientRect();
      W = Math.max(1, Math.round(r.width));
      H = Math.max(1, Math.round(r.height));
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      canvas.style.width = W + 'px';
      canvas.style.height = H + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      build();
    }

    var resizeTimer = 0;
    function onResize() {
      if (resizeTimer) {
        window.clearTimeout(resizeTimer);
      }
      resizeTimer = window.setTimeout(function () {
        resizeTimer = 0;
        resize();
      }, 200);
    }

    function step(t) {
      rafId = 0;
      if (!ticking) {
        return;
      }
      var dt = lastT ? (t - lastT) / 1000 : 0.016;
      lastT = t;
      if (dt > 0.1) {
        dt = 0.1; /* clamp tab-switch jumps */
      }

      ctx.clearRect(0, 0, W, H);

      var i, j, p, q, dx, dy, d2, alpha;

      for (i = 0; i < parts.length; i++) {
        p = parts[i];
        p.x += p.vx * dt;
        p.y += p.vy * dt;

        /* gentle mouse repel */
        dx = p.x - mouse.x;
        dy = p.y - mouse.y;
        d2 = dx * dx + dy * dy;
        if (d2 > 1 && d2 < 14400) {
          var d = Math.sqrt(d2);
          var push = (120 - d) / 120 * 26 * dt;
          p.x += (dx / d) * push;
          p.y += (dy / d) * push;
        }

        /* wrap around edges */
        if (p.x < -8) {
          p.x = W + 8;
        } else if (p.x > W + 8) {
          p.x = -8;
        }
        if (p.y < -8) {
          p.y = H + 8;
        } else if (p.y > H + 8) {
          p.y = -8;
        }
      }

      /* connecting traces */
      ctx.lineWidth = 1;
      for (i = 0; i < parts.length; i++) {
        p = parts[i];
        for (j = i + 1; j < parts.length; j++) {
          q = parts[j];
          dx = p.x - q.x;
          dy = p.y - q.y;
          d2 = dx * dx + dy * dy;
          if (d2 < LINK_DIST2) {
            alpha = (1 - Math.sqrt(d2) / LINK_DIST) * 0.16;
            ctx.strokeStyle = 'rgba(' + p.c + ',' + alpha.toFixed(3) + ')';
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.stroke();
          }
        }
      }

      /* nodes */
      for (i = 0; i < parts.length; i++) {
        p = parts[i];
        ctx.fillStyle = 'rgba(' + p.c + ',0.55)';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, 6.2832);
        ctx.fill();
      }

      rafId = window.requestAnimationFrame(step);
    }

    function start() {
      if (!ticking && !document.hidden) {
        ticking = true;
        lastT = 0;
        rafId = window.requestAnimationFrame(step);
      }
    }

    function stop() {
      ticking = false;
      if (rafId) {
        window.cancelAnimationFrame(rafId);
        rafId = 0;
      }
    }

    document.addEventListener('visibilitychange', function () {
      if (document.hidden) {
        stop();
      } else {
        start();
      }
    });

    if (window.IntersectionObserver) {
      var heroIO = new IntersectionObserver(function (entries) {
        if (entries[0].isIntersecting) {
          start();
        } else {
          stop();
        }
      });
      heroIO.observe(hero);
    }

    hero.addEventListener('mousemove', function (e) {
      var r = hero.getBoundingClientRect();
      mouse.x = e.clientX - r.left;
      mouse.y = e.clientY - r.top;
    }, { passive: true });
    hero.addEventListener('mouseleave', function () {
      mouse.x = -9999;
      mouse.y = -9999;
    });

    window.addEventListener('resize', onResize);
    resize();
    start();
  }

  /* ============================================================
   * 2. Custom neon cursor.
   * Dot snaps to the pointer, ring eases after it and scales up
   * over links and buttons. Only on fine pointers. cursor:none
   * applies solely through the html.vc-cursor class, so if this
   * script fails or is blocked the native cursor stays.
   * ============================================================ */
  function initCursor() {
    var fine = false;
    try {
      fine = window.matchMedia('(pointer: fine)').matches;
    } catch (e) {
      fine = false;
    }
    if (!fine || !window.requestAnimationFrame) {
      return;
    }

    var root = document.documentElement;
    var dot = document.createElement('div');
    dot.className = 'vc-dot';
    dot.setAttribute('aria-hidden', 'true');
    var ring = document.createElement('div');
    ring.className = 'vc-ring';
    ring.setAttribute('aria-hidden', 'true');
    document.body.appendChild(dot);
    document.body.appendChild(ring);

    root.classList.add('vc-cursor');
    stats.cursor = true;

    var mx = window.innerWidth / 2;
    var my = window.innerHeight / 2;
    var rx = mx;
    var ry = my;
    var rafId = 0;
    var lastT = 0;

    function frame(t) {
      rafId = 0;
      var dt = lastT ? (t - lastT) / 1000 : 0.016;
      lastT = t;
      if (dt > 0.1) {
        dt = 0.1;
      }
      /* ease factor gives a soft trailing ring */
      var k = 1 - Math.pow(0.0001, dt);
      rx += (mx - rx) * k;
      ry += (my - ry) * k;
      dot.style.transform = 'translate3d(' + mx + 'px,' + my + 'px,0) translate(-50%,-50%)';
      ring.style.transform = 'translate3d(' + rx + 'px,' + ry + 'px,0) translate(-50%,-50%)';
      rafId = window.requestAnimationFrame(frame);
    }
    rafId = window.requestAnimationFrame(frame);

    document.addEventListener('mousemove', function (e) {
      mx = e.clientX;
      my = e.clientY;
      root.classList.add('vc-show');
    }, { passive: true });

    document.addEventListener('mouseleave', function () {
      root.classList.remove('vc-show');
    });

    /* scale up on hoverable elements, delegated */
    document.addEventListener('mouseover', function (e) {
      var t = e.target && e.target.closest ? e.target.closest('a,button') : null;
      if (t) {
        root.classList.add('vc-hover');
      } else {
        root.classList.remove('vc-hover');
      }
    }, { passive: true });

    document.addEventListener('visibilitychange', function () {
      if (document.hidden) {
        if (rafId) {
          window.cancelAnimationFrame(rafId);
          rafId = 0;
        }
        lastT = 0;
      } else if (!rafId) {
        rafId = window.requestAnimationFrame(frame);
      }
    });
  }

  /* ============================================================
   * 3. Reveal stagger.
   * The existing .reveal observer in script.js stays untouched.
   * This only adds incremental transition delays to .reveal
   * children inside [data-stagger] groups for a cascade effect.
   * ============================================================ */
  function initStagger() {
    var groups = document.querySelectorAll('[data-stagger]');
    var gi, items, i;
    for (gi = 0; gi < groups.length; gi++) {
      items = groups[gi].querySelectorAll('.reveal');
      for (i = 0; i < items.length; i++) {
        items[i].style.transitionDelay = (Math.min(i, 6) * 60) + 'ms';
      }
    }
    stats.staggerGroups = groups.length;
  }

  function boot() {
    try {
      initParticles();
    } catch (e) {
      /* particle failure never breaks the rest */
    }
    try {
      initCursor();
    } catch (e) {
      document.documentElement.classList.remove('vc-cursor');
    }
    try {
      initStagger();
    } catch (e) {
      /* stagger is decorative */
    }
    window.__motionStats = stats;
    if (window.console && console.info) {
      console.info('[motion] particles=' + stats.particles +
        ' (' + stats.canvasW + 'x' + stats.canvasH + '),' +
        ' cursor=' + stats.cursor +
        ', staggerGroups=' + stats.staggerGroups);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
