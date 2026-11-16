# Motion and robustness audit: swarm build tour and sci-fi layer

Scope: src/scripts/home.js, src/scripts/scifi.js, src/scripts/core.js, src/styles/home.css (the version on disk before the lead's current edits; the tested build is a frozen copy of dist at robust-dist, build 227b18bcdf26).
Method: code read, plus real Playwright runs (Chrome, fonts and /api blocked). Test scripts and raw results: scratchpad/robust/ (common.mjs, t1 to t4, t1.json, t2.json).

## 1. Test results (evidence)

| Test | Result |
| --- | --- |
| Cold full tour, 1440x900 (run alone) | Completes. "Built by 30 agents in 49.7s". 0 layers hidden after. |
| Cold full tour, 1440x900 (run in parallel with mobile) | Completes, 69.9s reported, 81.7s wall. 0 hidden. |
| Stuck cursors, desktop | 531 events where an agent kept the same screen spot for over 2 s while the page scrolled more than 50 px. All 30 agents plus the foreman. Longest 8.1 s. |
| Off-screen cursors, desktop | 16 events, 4 agents off screen for over 2 s. Mostly the finale scatter, which sends agents off screen while the tour is still "touring". |
| Mobile tour, 390x844 touch | Completes, 8 agents, 92.4s (under parallel load). 0 hidden, 0 overflow. 201 stuck events (9 agents), 17 off-screen events. |
| Skip at 2 s (during the matrix boot) | FAIL. The Skip button cannot be clicked: the boot overlay (z 90) covers it (z 72). Click timed out after 3 s. 181 layers hidden at that moment. Only a key press can end the boot. |
| Skip at 10 s and 30 s | Pass. 0 hidden, 0 agents left, 0 selection boxes left. Focus falls to BODY (lost). At 30 s the page stays scrolled at 1341 px. |
| Replay twice in a row | Pass visually (30 agents, 49.7s, 0 hidden). LEAK: window scroll listeners 4, then 5, then 6 (one per finished tour, from normalMode). |
| Double replay call | Guarded: 19 cursors (18 plus foreman), no duplicate tour. |
| Resize mid-tour (1440 to 1024 to 1440) | Pass: trail canvas follows the viewport (1440 = 1440), 0 hidden, 49.6s. 390 stuck events. |
| Tab hidden mid-tour | No auto-pause: the Pause button still read "Touring" after visibilitychange to hidden. Code review: performance.now keeps counting while hidden, so the reported build time includes hidden time. (The CDP frozen lifecycle test did not freeze rAF in headless Chrome, so the time effect is from code, not measured.) |
| Tab during tour | Tab does not end the tour. First Tab goes to "Skip to content", next Tabs go to page links that are still at opacity 0 (invisible focus). Esc ends the tour and leaves focus on a link. |
| Console focus trap | FAIL. After opening the console, 4 of 4 Tab presses moved focus out of the console, which is marked aria-modal. |
| Pointer over tour controls | FAIL. During the tour the Pause button and speed select have cursor "none" and the HUD cursor is hidden: the visitor sees no pointer over them. |
| Pointer over the console | FAIL. Console cursor is "none" and the HUD cursor (z 175) sits under the console (z 185): no visible pointer. |
| home.js blocked (offline, CSP, parse error) | CRITICAL FAIL. The page stays black: boot overlay visible, class boot-armed stays, 181 of 181 layers at opacity 0. No failsafe. |
| Reduced motion | Pass: no boot, no HUD cursor, word static, scan and ring animations "none", 0 hidden. Replay button does nothing and gives no message. |
| Touch device | Pass: HUD cursor off, 0 overflow. |
| Console warning | Every run: "Canvas2D: Multiple readback operations using getImageData..." from the matrix glitch slice. |

### Performance (1440x900, dist served locally, rAF and CDP Performance metrics)

| Scenario | Avg frame | Script ms per s | Task ms per s |
| --- | --- | --- | --- |
| Hero, mouse moving (first run, t3) | 40.8 ms, 116 of 149 frames over 33 ms, 29 long tasks | 226 | 904 |
| Hero, mouse moving (t4 baseline) | 17.2 ms | 187 | 613 |
| Hero, idle mouse | 17.0 ms | 165 | 550 |
| Hero, network canvas hidden | 16.7 ms | 4 | 203 |
| Hero, CPU 4x throttle | 174 ms (about 6 fps), 34 long tasks | 300 | 956 |
| Tour, no throttle | 17.3 ms, 12 frames over 33 ms | 74 | 544 |
| Tour, CPU 4x | 76 ms, 64 long tasks | 206 | 951 |
| Matrix boot, CPU 4x | n/a | 238 | 990 |

Finding: the hero network canvas costs about 160 to 270 ms of script and about 350 to 400 ms of raster per second even with the mouse still. Turning off the holo overlays, the image filter or the ring animation changes almost nothing. On a 4x slower CPU the hero drops to about 6 fps. Causes in code: one beginPath, fill or stroke per node (260 nodes) and per link, DPR up to 2 on a canvas the size of the hero, full redraw every frame even when idle, and a node rebuild on every resize event (mobile URL bar).

## 2. Other code findings (not covered above)

1. timeline.clear() drops every pending tween without resolving it. Each skip or end leaves the awaiting async functions (place, fly, camera, countIn) suspended forever: small leak per run, and any count-up running in normal mode is frozen mid-number.
2. pick() returns S.agents[0] when no agent is free, so two placements can drive the same cursor at once (it jumps between targets, then is freed early).
3. The user can drag the scrollbar during the tour (wheel and touch are blocked, the scrollbar is not). The next camera move snaps back, and cursors aimed at old positions miss.
4. Matrix canvas is sized once; a resize during the boot leaves it stretched or cut.
5. Before/after slider listens for pointerup only; pointercancel (touch scroll, alt-tab) leaves dragging stuck on.
6. HUD cursor label prints fractional coordinates at zoom levels (user saw "Y2355.5").
7. sectionRail and the dock run unthrottled scroll handlers plus a setInterval(800 ms) and a setInterval(1 s) that never stop, even on a hidden tab.
8. Word cycle uses chained setTimeout that keeps scheduling while the tab is hidden (cheap, but not paused).
9. start(): after "await fly(S.foreman...)" and "await wait(250)" there is no token check before "S.foreman.busy = false" (safe today only because cleared tweens never resolve; it throws once fix 12 below lands).
10. Reported build time is wall time at any speed (fine), but includes hidden-tab time (see fix 5).

## 3. Rubric (10 x 100 = 1000)

| # | Criterion | Score | Evidence |
| --- | --- | --- | --- |
| 1 | Correctness | 55 | Tour ends with the exact registry count and 0 hidden layers in every completed run. Minus: all 31 cursors stuck while scrolling (531 events, 8.1 s max); Skip unclickable during boot; shared-cursor double assignment possible. |
| 2 | Resilience | 40 | Resize mid-tour and double replay are handled. Minus: blocked home.js leaves a black page with 181 hidden layers; no pause on hidden tab; scrollbar drag not handled; matrix canvas not resized. |
| 3 | Performance | 50 | Tour 17.3 ms frames unthrottled. Minus: hero network 160 to 270 ms script per second at idle, 6 fps at 4x CPU, 64 long tasks during the 4x tour, getImageData readback warning. |
| 4 | Accessibility | 50 | Reduced motion respected, skip link present, HUD and skip are buttons. Minus: focus lost to BODY after skip, Tab lands on invisible links during the tour, console has no focus trap (4 of 4 escapes), invisible pointer over Pause, speed and the console. |
| 5 | Memory and cleanup | 65 | Intervals stable at 5 across replays; card art loops stop on pointerleave; cursors and boxes removed on end. Minus: +1 scroll listener and +1 IntersectionObserver per finished tour; orphaned tween promises after every clear. |
| 6 | Mobile | 60 | 8 agents, 0 overflow, controls show a pointer. Minus: 201 stuck and 17 off-screen events; node rebuild on every resize (URL bar). |
| 7 | Reduced motion | 90 | No boot, no cursor, static word, CSS animations off, content complete. Minus: Replay is silent with no explanation. |
| 8 | Error handling | 55 | start() has try/catch to end(false); all fetches catch. Minus: no global failsafe for the CSS that hides content; errors are swallowed with no log. |
| 9 | Testability | 55 | qa-home.mjs exists; window.__replayBoot is a hook. Minus: no exposed tour state or event for tests, no unit tests for core.js tween/timeline, timings are wall-clock only. |
| 10 | Code clarity | 60 | Clear section comments and small helpers. Minus: very long one-line functions, magic numbers (conc 9, 0.5 viewport, 170 px), glitch logic duplicated in home.js and the console, one global mutable S. |
| | Total | 580 / 1000 | |

## 4. Top 12 fixes, exact patches

Old code is copied from the files as they were before the lead's edits. If a hunk no longer matches, apply the same change by hand.

### Fix 1. Failsafe when home.js never starts (critical)

File: src/scripts/arm.js
Old:
```js
    if (!reduce && (force || done !== '1')) H.classList.add('boot-armed');
  } catch (e) {}
})();
```
New:
```js
    if (!reduce && (force || done !== '1')) {
      H.classList.add('boot-armed');
      // Failsafe: if the home module never starts (blocked, offline, parse error), show the page.
      setTimeout(function () {
        if (window.__homeReady) return;
        H.classList.remove('boot-armed', 'tour-armed', 'touring');
        var b = document.getElementById('boot'); if (b) b.hidden = true;
      }, 4000);
    }
  } catch (e) {}
})();
```
File: src/scripts/home.js
Old:
```js
if (H.classList.contains('boot-armed') && !reduced()) {
  H.classList.add('tour-armed');
```
New:
```js
window.__homeReady = true; // set only after every module above initialised without throwing
if (H.classList.contains('boot-armed') && !reduced()) {
  H.classList.add('tour-armed');
```

### Fix 2. Skip button usable during the matrix boot

File: src/styles/home.css
Old:
```css
#skip{position:fixed;z-index:72;
```
New:
```css
#skip{position:fixed;z-index:96;
```

### Fix 3. Visible pointer over tour controls and the console

File: src/styles/home.css (append at the end)
New:
```css
html.hcur-on .ap #hud button,html.hcur-on .ap #hud select,html.hcur-on .ap #skip,html.touring .ap button,html.touring .ap select{cursor:pointer}
html.hcur-on .console,html.hcur-on .console *{cursor:auto}
html.hcur-on .console input{cursor:text}
```

### Fix 4. Stop the scroll listener and observer leak on every replay

File: src/scripts/home.js
Old:
```js
function normalMode() {
  if ('IntersectionObserver' in window) {
```
New:
```js
let normalArmed = false;
function normalMode() {
  if (normalArmed) return; // one observer and one parallax listener for the page lifetime
  normalArmed = true;
  if ('IntersectionObserver' in window) {
```

### Fix 5. Pause on hidden tab and keep hidden time out of the build time

File: src/scripts/home.js
Old:
```js
addEventListener('resize', () => { if (S.on) sizeCanvas(); });
```
New:
```js
addEventListener('resize', () => { if (S.on) { sizeCanvas(); S.camY = scrollY; } });
// Pause the build while the tab is hidden; hidden time does not count as build time.
let autoPaused = false;
document.addEventListener('visibilitychange', () => {
  if (!S.on) return;
  if (document.hidden && !timeline.paused) { autoPaused = true; timeline.pause(true); S.pAt = performance.now(); }
  else if (!document.hidden && autoPaused) { autoPaused = false; timeline.pause(false); S.paused += performance.now() - S.pAt; }
});
```

### Fix 6. Focus management at start and end of the tour

File: src/scripts/home.js
Old:
```js
  skip.hidden = false;
  // 1. Matrix boot
```
New:
```js
  skip.hidden = false;
  try { skip.focus({ preventScroll: true }); } catch (x) { /* ignore */ }
  // 1. Matrix boot
```
Old:
```js
  layerEl.hidden = true; skip.hidden = true;
```
New:
```js
  const ae = document.activeElement, hadFocus = !ae || ae === document.body || (ae.closest && ae.closest('#skip,#hud'));
  layerEl.hidden = true; skip.hidden = true;
```
Old:
```js
  } else { hud.hidden = true; feedEl.hidden = true; }
  normalMode();
}
```
New:
```js
  } else { hud.hidden = true; feedEl.hidden = true; }
  if (hadFocus) { const m = completed ? $('#hudReplay') : $('#main'); try { m.focus({ preventScroll: true }); } catch (x) { /* ignore */ } }
  normalMode();
}
```

### Fix 7. Tab outside the build controls ends the tour (no focus on invisible links)

File: src/scripts/home.js
Old:
```js
  if (!S.on || e.key === 'Tab' || e.key === 'Shift') return;
```
New:
```js
  if (!S.on || e.key === 'Shift') return;
  if (e.key === 'Tab' && document.activeElement && document.activeElement.closest && document.activeElement.closest('#hud,#skip')) return; // move between build controls
```

### Fix 8. Scrollbar drag or any outside scroll hands control back to the visitor

File: src/scripts/home.js
Old:
```js
function block(e) { if (S.on) e.preventDefault(); }
```
New:
```js
function block(e) { if (S.on) e.preventDefault(); }
function onUserScroll() { if (S.on && S.camY != null && Math.abs(scrollY - S.camY) > 80) end(false); } // scrollbar drag
```
Old:
```js
  return tween(Math.min(900, 480 + Math.abs(target - from) / 3), k => window.scrollTo(0, from + (target - from) * k));
```
New:
```js
  return tween(Math.min(900, 480 + Math.abs(target - from) / 3), k => { S.camY = from + (target - from) * k; window.scrollTo(0, S.camY); });
```
Old:
```js
  window.scrollTo(0, 0);
  addEventListener('wheel', block, { passive: false }); addEventListener('touchmove', block, { passive: false }); addEventListener('keydown', onKey);
```
New:
```js
  window.scrollTo(0, 0); S.camY = 0;
  addEventListener('wheel', block, { passive: false }); addEventListener('touchmove', block, { passive: false }); addEventListener('keydown', onKey);
  addEventListener('scroll', onUserScroll, { passive: true });
```
Old:
```js
  removeEventListener('wheel', block); removeEventListener('touchmove', block); removeEventListener('keydown', onKey);
```
New:
```js
  removeEventListener('wheel', block); removeEventListener('touchmove', block); removeEventListener('keydown', onKey); removeEventListener('scroll', onUserScroll);
```
Note: if the lead's stuck-cursor fix also scrolls (for example by easing the camera), every programmatic scrollTo must update S.camY first.

### Fix 9. Matrix glitch slice without CPU readback, and resize the rain

File: src/scripts/home.js
Old:
```js
    if (++glitchT % 38 === 0) { // horizontal glitch slice
      const sy = Math.random() * innerHeight, sh = 8 + Math.random() * 40;
      try { const img = ctx.getImageData(0, sy * d, cv.width, sh * d); ctx.putImageData(img, (Math.random() - .5) * 60 * d, sy * d); } catch (x) { /* ignore */ }
    }
```
New:
```js
    if (++glitchT % 38 === 0) { // horizontal glitch slice: canvas-to-canvas copy, no getImageData
      const sy = Math.random() * innerHeight * d, sh = (8 + Math.random() * 40) * d, off = (Math.random() - .5) * 60 * d;
      ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.drawImage(cv, 0, sy, cv.width, sh, off, sy, cv.width, sh); ctx.restore();
    }
```
Old:
```js
  raf = requestAnimationFrame(rain);
  const lines = [
```
New:
```js
  raf = requestAnimationFrame(rain);
  const onRz = () => { cv.width = innerWidth * d; cv.height = innerHeight * d; ctx.setTransform(d, 0, 0, d, 0, 0); };
  addEventListener('resize', onRz);
  const lines = [
```
Old:
```js
      cancelAnimationFrame(raf); boot.hidden = true; document.body.classList.remove('screen-glitch');
    },
    kill() { cancelAnimationFrame(raf); boot.hidden = true; }
```
New:
```js
      cancelAnimationFrame(raf); removeEventListener('resize', onRz); boot.hidden = true; document.body.classList.remove('screen-glitch');
    },
    kill() { cancelAnimationFrame(raf); removeEventListener('resize', onRz); boot.hidden = true; document.body.classList.remove('screen-glitch'); }
```

### Fix 10. Network canvas: batch drawing, cap DPR, idle at 30 fps, rebuild only on width change

File: src/scripts/scifi.js
Old:
```js
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.beginPath();
```
New:
```js
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); // caller opens the path, so shapes batch into one draw
```
Old:
```js
  if (s === 'dot') ctx.arc(0, 0, r * .55, 0, 6.283);
```
New:
```js
  if (s === 'dot') { ctx.moveTo(r * .55, 0); ctx.arc(0, 0, r * .55, 0, 6.283); }
```
Old:
```js
    const d = Math.min(2, devicePixelRatio || 1); W = c.clientWidth; Hh = c.clientHeight; c.width = W * d; c.height = Hh * d; ctx.setTransform(d, 0, 0, d, 0, 0);
```
New:
```js
    const d = Math.min(1.5, devicePixelRatio || 1); W = c.clientWidth; Hh = c.clientHeight; c.width = W * d; c.height = Hh * d; ctx.setTransform(d, 0, 0, d, 0, 0);
```
Old:
```js
    t++; ctx.clearRect(0, 0, W, Hh);
```
New:
```js
    t++;
    if (mx < -9000 && !waves.length && (t & 1)) { raf = vis && !document.hidden && !RM ? requestAnimationFrame(frame) : 0; return; } // idle: 30 fps
    ctx.clearRect(0, 0, W, Hh);
```
Old:
```js
    ctx.lineWidth = 1;
    for (let i = 0; i < nodes.length; i++) {
```
New:
```js
    ctx.lineWidth = 1;
    const hotB = [[], [], [], [], []], coolB = [[], [], [], [], []]; // links bucketed by alpha: 10 strokes per frame instead of one per link
    for (let i = 0; i < nodes.length; i++) {
```
Old:
```js
        ctx.strokeStyle = hot ? `rgba(255,89,100,${(1 - d / LINK) * .7})` : `rgba(255,70,85,${(1 - d / LINK) * .22})`;
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
```
New:
```js
        (hot ? hotB : coolB)[Math.min(4, (5 * (1 - d / LINK)) | 0)].push(a.x, a.y, b.x, b.y);
```
Old:
```js
    // cursor tethers and readout
```
New:
```js
    for (let q = 0; q < 5; q++) for (const [B, rgb, mul] of [[coolB, '255,70,85', .22], [hotB, '255,89,100', .7]]) {
      const Lq = B[q]; if (!Lq.length) continue;
      ctx.strokeStyle = `rgba(${rgb},${((q + .5) / 5 * mul).toFixed(3)})`; ctx.beginPath();
      for (let i = 0; i < Lq.length; i += 4) { ctx.moveTo(Lq[i], Lq[i + 1]); ctx.lineTo(Lq[i + 2], Lq[i + 3]); }
      ctx.stroke();
    }
    // cursor tethers and readout
```
Old:
```js
    for (const n of nodes) {
      const lit = Math.hypot(n.x - mx, n.y - my) < 170;
      drawShape(ctx, n.s, n.x, n.y, n.size * (lit ? 1.35 : 1), n.rot);
      if (n.s === 'cross' || n.s === 'tri' || n.s === 'hex') { ctx.strokeStyle = n.c || (lit ? '#FF4655' : 'rgba(244,244,242,.45)'); ctx.lineWidth = 1.2; ctx.stroke(); }
      else { ctx.fillStyle = n.c || (lit ? '#FF4655' : 'rgba(244,244,242,.55)'); ctx.fill(); }
    }
```
New:
```js
    const groups = new Map(); // one path per colour and mode instead of one per node
    for (const n of nodes) {
      const lit = Math.hypot(n.x - mx, n.y - my) < 170, line = n.s === 'cross' || n.s === 'tri' || n.s === 'hex';
      const key = (line ? 's' : 'f') + (n.c || (lit ? '#FF4655' : line ? 'rgba(244,244,242,.45)' : 'rgba(244,244,242,.55)'));
      (groups.get(key) || groups.set(key, []).get(key)).push([n, lit]);
    }
    ctx.lineWidth = 1.2;
    for (const [key, arr] of groups) {
      ctx.beginPath();
      for (const [n, lit] of arr) drawShape(ctx, n.s, n.x, n.y, n.size * (lit ? 1.35 : 1), n.rot);
      if (key[0] === 's') { ctx.strokeStyle = key.slice(1); ctx.stroke(); } else { ctx.fillStyle = key.slice(1); ctx.fill(); }
    }
```
Old:
```js
  addEventListener('resize', () => { size(); if (RM) frame(); else kick(); });
```
New:
```js
  let rzT = 0, lastW = W;
  addEventListener('resize', () => {
    clearTimeout(rzT);
    rzT = setTimeout(() => {
      if (Math.abs(c.clientWidth - lastW) < 40) { const d = Math.min(1.5, devicePixelRatio || 1); Hh = c.clientHeight; c.height = Hh * d; ctx.setTransform(d, 0, 0, d, 0, 0); } // URL bar: keep nodes
      else { size(); lastW = W; }
      if (RM) frame(); else kick();
    }, 120);
  });
```

### Fix 11. Console keeps focus while open (it is aria-modal)

File: src/scripts/scifi.js
Old:
```js
    if (e.key === 'Escape') { close(); return; }
    if (e.key !== 'Enter') return;
```
New:
```js
    if (e.key === 'Escape') { close(); return; }
    if (e.key === 'Tab') { e.preventDefault(); return; } // modal: the input is the only stop
    if (e.key !== 'Enter') return;
```
Plus fix 3 for the pointer over the console.

### Fix 12. timeline.clear() resolves pending tweens, so no async step hangs forever

File: src/scripts/core.js
Old:
```js
    const job = t => {
      const k = clamp((t - start) / ms, 0, 1);
      onUpdate(easing(k), k);
      if (k >= 1) { clock.jobs.delete(job); res(); }
    };
    add(job);
```
New:
```js
    const job = t => {
      const k = clamp((t - start) / ms, 0, 1);
      onUpdate(easing(k), k);
      if (k >= 1) { clock.jobs.delete(job); res(); }
    };
    job.res = res;
    add(job);
```
Old:
```js
  clear() { clock.jobs.clear(); clock.paused = false; clock.scale = 1; },
```
New:
```js
  clear() { const jobs = Array.from(clock.jobs); clock.jobs.clear(); clock.paused = false; clock.scale = 1; for (const j of jobs) j.res(); }, // awaiting code resumes and hits its token check
```
Required companion (home.js), because resumed code must stop cleanly:
Old:
```js
    await fly(S.foreman, innerWidth * .52, innerHeight * .4); await wait(250); S.foreman.busy = false;
```
New:
```js
    await fly(S.foreman, innerWidth * .52, innerHeight * .4); if (my !== S.token) return;
    await wait(250); if (my !== S.token) return; S.foreman.busy = false;
```
And in finale:
Old:
```js
  const f = S.foreman; await fly(f, cx - 20, cy - 20);
```
New:
```js
  const f = S.foreman; if (!f) return; await fly(f, cx - 20, cy - 20); if (my !== S.token) return;
```

## 5. Smaller fixes worth taking

- Batch size never above the free agents, so pick() never shares a cursor: in start(), change `batch.length < conc` to `batch.length < Math.min(conc, S.agents.filter(a => !a.busy && !a.arriving).length)`.
- Reduced motion: Replay shows a message instead of doing nothing: in start(), `if (reduced()) { toast('Motion is reduced on this device, so the build animation is off.'); return; }`.
- HUD cursor: `X${String(Math.round(e.clientX))...} Y${String(Math.round(e.clientY + scrollY))...}`.
- Slider: add `ba.addEventListener('pointercancel', () => { dragging = false; }); ba.addEventListener('lostpointercapture', () => { dragging = false; });`.
- sectionRail and dock: run both from one rAF-throttled scroll handler; skip the 800 ms and 1 s intervals while document.hidden.
- Finale: end the "touring" state before the scatter, or exclude the scatter from cursor analysis (it causes most off-screen events).
- Expose `window.__tour = { state: () => ({ on: S.on, landed: S.landed, total: S.layers.length }) }` and dispatch a `tour:end` event, so QA does not poll class names.
