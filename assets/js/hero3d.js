/* ============================================================
 * JESUN.DEV hero 3D layer (Vega, Motion Designer)
 *
 * Three.js neural-mesh constellation rendered behind the hero
 * content: drifting node lattice with faint connecting traces
 * in neon green / cyan, plus a barely-there wireframe shell.
 * Sits behind the circuit SVG, the 2D particle canvas, and the
 * hero copy. Calm by design: slow rotation, gentle parallax,
 * no flashes, no fast motion.
 *
 * Pairs with hero3d.css and hero3d-snippet.html. Nova integrates.
 *
 * Defensive by design:
 *  - prefers-reduced-motion: exits before touching Three.js,
 *    the static hero (obsidian + blueprint grid + glows) stays.
 *  - no WebGL or CDN failure: init is wrapped, the hero stays
 *    fully readable, content never depends on this layer.
 *  - rAF runs only while the hero is visible (IntersectionObserver)
 *    and the tab is visible (visibilitychange).
 * No em dash characters anywhere in this file.
 * ============================================================ */
(function () {
  'use strict';

  var HERO_SEL = '.hero';
  var LAYER_ID = 'hero-3d';
  var THREE_SPECIFIER = 'three'; /* resolved by the import map in the snippet */

  var GREEN = 0x00ff88;
  var GREEN_DIM = 0x10b981;
  var CYAN = 0x22d3ee;

  /* performance budget */
  var MAX_NODES = 300;
  var MIN_NODES = 130;
  var MAX_EDGES = 1300;
  var LINK_DIST = 8.5; /* world units between linked nodes */
  var MAX_DPR = 2;

  var stats = {
    nodes: 0,
    edges: 0,
    running: false,
    webgl: false,
    reducedMotion: false,
    threeLoaded: false
  };

  function reducedMotion() {
    try {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    } catch (e) {
      return false;
    }
  }

  function webglAvailable() {
    try {
      if (!window.WebGLRenderingContext) {
        return false;
      }
      var c = document.createElement('canvas');
      return !!(
        c.getContext('webgl2') ||
        c.getContext('webgl') ||
        c.getContext('experimental-webgl')
      );
    } catch (e) {
      return false;
    }
  }

  function clamp(v, lo, hi) {
    return v < lo ? lo : (v > hi ? hi : v);
  }

  /* ============================================================
   * Scene init. Everything that can throw lives inside the
   * try/catch in boot(), so a failure here never touches the
   * hero content.
   * ============================================================ */
  function init(THREE, hero, layer) {
    var canvas = document.createElement('canvas');
    canvas.setAttribute('aria-hidden', 'true');
    layer.appendChild(canvas);

    var renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'low-power'
    });
    renderer.setClearColor(0x000000, 0);

    var dpr = 1;
    try {
      dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
    } catch (e) {
      dpr = 1;
    }
    renderer.setPixelRatio(dpr);

    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(42, 1, 0.1, 200);
    camera.position.set(0, 2.2, 38);
    camera.lookAt(0, 0, 0);

    var group = new THREE.Group();
    scene.add(group);

    var state = {
      points: null,
      lines: null,
      lineMat: null,
      shell: null,
      nodePos: [],
      nodeCol: [],
      rotY: 0,
      parX: 0,
      parY: 0,
      tgtX: 0,
      tgtY: 0
    };

    var SPAN_X = 56;
    var SPAN_Y = 30;
    var SPAN_Z = 14;

    function nodeCount() {
      var r = hero.getBoundingClientRect();
      var area = Math.max(1, r.width) * Math.max(1, r.height);
      return clamp(Math.round(area / 8500), MIN_NODES, MAX_NODES);
    }

    function disposeMesh() {
      if (state.points) {
        group.remove(state.points);
        state.points.geometry.dispose();
        state.points.material.dispose();
        state.points = null;
      }
      if (state.lines) {
        group.remove(state.lines);
        state.lines.geometry.dispose();
        state.lines.material.dispose();
        state.lines = null;
      }
    }

    function build() {
      disposeMesh();

      var n = nodeCount();
      var i, j;
      state.nodePos = [];
      state.nodeCol = [];

      var cGreen = new THREE.Color(GREEN);
      var cGreenDim = new THREE.Color(GREEN_DIM);
      var cCyan = new THREE.Color(CYAN);

      for (i = 0; i < n; i++) {
        state.nodePos.push(
          (Math.random() - 0.5) * SPAN_X,
          (Math.random() - 0.5) * SPAN_Y,
          (Math.random() - 0.5) * SPAN_Z
        );
        var pick = Math.random();
        var c = pick < 0.55 ? cGreen : (pick < 0.8 ? cGreenDim : cCyan);
        state.nodeCol.push(c.r, c.g, c.b);
      }

      /* proximity lattice: link nodes within LINK_DIST */
      var link2 = LINK_DIST * LINK_DIST;
      var linePos = [];
      var lineCol = [];
      var edgeCount = 0;
      var dx, dy, dz, d2;
      outer:
      for (i = 0; i < n; i++) {
        for (j = i + 1; j < n; j++) {
          dx = state.nodePos[i * 3] - state.nodePos[j * 3];
          dy = state.nodePos[i * 3 + 1] - state.nodePos[j * 3 + 1];
          dz = state.nodePos[i * 3 + 2] - state.nodePos[j * 3 + 2];
          d2 = dx * dx + dy * dy + dz * dz;
          if (d2 < link2) {
            linePos.push(
              state.nodePos[i * 3], state.nodePos[i * 3 + 1], state.nodePos[i * 3 + 2],
              state.nodePos[j * 3], state.nodePos[j * 3 + 1], state.nodePos[j * 3 + 2]
            );
            /* edge color: dimmed mix of the two endpoint colors */
            lineCol.push(
              state.nodeCol[i * 3] * 0.5, state.nodeCol[i * 3 + 1] * 0.5, state.nodeCol[i * 3 + 2] * 0.5,
              state.nodeCol[j * 3] * 0.5, state.nodeCol[j * 3 + 1] * 0.5, state.nodeCol[j * 3 + 2] * 0.5
            );
            edgeCount++;
            if (edgeCount >= MAX_EDGES) {
              break outer;
            }
          }
        }
      }

      var pGeo = new THREE.BufferGeometry();
      pGeo.setAttribute('position', new THREE.Float32BufferAttribute(state.nodePos, 3));
      pGeo.setAttribute('color', new THREE.Float32BufferAttribute(state.nodeCol, 3));
      var pMat = new THREE.PointsMaterial({
        size: 0.34,
        vertexColors: true,
        transparent: true,
        opacity: 0.85,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        sizeAttenuation: true
      });
      state.points = new THREE.Points(pGeo, pMat);
      group.add(state.points);

      var lGeo = new THREE.BufferGeometry();
      lGeo.setAttribute('position', new THREE.Float32BufferAttribute(linePos, 3));
      lGeo.setAttribute('color', new THREE.Float32BufferAttribute(lineCol, 3));
      state.lineMat = new THREE.LineBasicMaterial({
        vertexColors: true,
        transparent: true,
        opacity: 0.14,
        depthWrite: false,
        blending: THREE.AdditiveBlending
      });
      state.lines = new THREE.LineSegments(lGeo, state.lineMat);
      group.add(state.lines);

      stats.nodes = n;
      stats.edges = edgeCount;
    }

    /* faint wireframe shell for structure, far behind the lattice */
    var shellGeo = new THREE.WireframeGeometry(new THREE.IcosahedronGeometry(17, 1));
    var shellMat = new THREE.LineBasicMaterial({
      color: CYAN,
      transparent: true,
      opacity: 0.05,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });
    state.shell = new THREE.LineSegments(shellGeo, shellMat);
    state.shell.position.set(0, 0, -8);
    scene.add(state.shell);

    group.rotation.x = 0.16; /* gentle base tilt */

    function resize() {
      var r = hero.getBoundingClientRect();
      var w = Math.max(1, Math.round(r.width));
      var h = Math.max(1, Math.round(r.height));
      renderer.setSize(w, h, false);
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }

    var resizeTimer = 0;
    function onResize() {
      if (resizeTimer) {
        window.clearTimeout(resizeTimer);
      }
      resizeTimer = window.setTimeout(function () {
        resizeTimer = 0;
        resize();
        build(); /* re-budget nodes for the new area */
      }, 250);
    }

    /* ---- subtle mouse parallax over the hero ---- */
    hero.addEventListener('mousemove', function (e) {
      var r = hero.getBoundingClientRect();
      if (r.width < 1 || r.height < 1) {
        return;
      }
      state.tgtY = ((e.clientX - r.left) / r.width - 0.5) * 0.5;
      state.tgtX = ((e.clientY - r.top) / r.height - 0.5) * 0.3;
    }, { passive: true });
    hero.addEventListener('mouseleave', function () {
      state.tgtX = 0;
      state.tgtY = 0;
    });

    /* ---- rAF loop: only while the hero is visible ---- */
    var rafId = 0;
    var running = false;
    var lastT = 0;

    function frame(t) {
      rafId = 0;
      if (!running) {
        return;
      }
      var dt = lastT ? (t - lastT) / 1000 : 0.016;
      lastT = t;
      if (dt > 0.1) {
        dt = 0.1; /* clamp tab-switch jumps */
      }

      /* slow drift: rotation, breath, faint trace pulse */
      state.rotY += dt * 0.05;
      var k = Math.min(1, dt * 2.5);
      state.parX += (state.tgtX - state.parX) * k;
      state.parY += (state.tgtY - state.parY) * k;

      group.rotation.y = state.rotY + state.parY;
      group.rotation.x = 0.16 + state.parX;
      group.position.y = Math.sin(t * 0.00015) * 0.4;
      state.shell.rotation.y -= dt * 0.02;

      if (state.lineMat) {
        state.lineMat.opacity = 0.13 + 0.04 * (0.5 + 0.5 * Math.sin(t * 0.0005));
      }

      renderer.render(scene, camera);
      rafId = window.requestAnimationFrame(frame);
    }

    function start() {
      if (!running && !document.hidden) {
        running = true;
        stats.running = true;
        lastT = 0;
        rafId = window.requestAnimationFrame(frame);
      }
    }

    function stop() {
      running = false;
      stats.running = false;
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

    window.addEventListener('resize', onResize);

    resize();
    build();
    start();

    window.__hero3dStats = stats;
    if (window.console && console.info) {
      console.info('[hero3d] nodes=' + stats.nodes + ' edges=' + stats.edges);
    }
  }

  /* ============================================================
   * Boot: reduced-motion first (skips the CDN fetch too),
   * then WebGL check, then a dynamic import so a blocked CDN
   * is a handled no-op instead of an uncaught module error.
   * ============================================================ */
  function boot() {
    if (reducedMotion()) {
      stats.reducedMotion = true;
      return;
    }
    if (!webglAvailable()) {
      return;
    }
    var hero = document.querySelector(HERO_SEL);
    var layer = document.getElementById(LAYER_ID);
    if (!hero || !layer) {
      return;
    }
    var p;
    try {
      p = import(THREE_SPECIFIER);
    } catch (e) {
      return;
    }
    p.then(function (THREE) {
      stats.threeLoaded = true;
      stats.webgl = true;
      try {
        init(THREE, hero, layer);
      } catch (e) {
        if (window.console && console.warn) {
          console.warn('[hero3d] init failed, layer disabled');
        }
      }
    }).catch(function () {
      /* CDN unreachable: the static hero stays, content unaffected */
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
