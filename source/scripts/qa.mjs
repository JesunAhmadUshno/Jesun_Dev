// Visual and behaviour QA: screenshots, console errors, boot run, skip, replay, reduced motion.
import { createRequire } from 'node:module';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
const require = createRequire(import.meta.url);
let chromium; try { ({ chromium } = require('playwright')); } catch (e) { ({ chromium } = require('/opt/npm-tools/node_modules/playwright')); }
const srv = spawn('python3', ['-m', 'http.server', '8093', '--directory', 'dist'], { stdio: 'ignore' });
await new Promise(r => setTimeout(r, 700));
const B = 'http://localhost:8093';
const browser = await chromium.launch({ executablePath: fs.existsSync('/usr/bin/google-chrome') ? '/usr/bin/google-chrome' : undefined });
const out = process.env.QA_OUT || '/tmp/claude-0/qa'; fs.mkdirSync(out, { recursive: true });
const res = { console: [], pages: {} };
async function shot(path, name, vp, opts = {}) {
  const ctx = await browser.newContext({ viewport: vp, reducedMotion: opts.reduce ? 'reduce' : 'no-preference' });
  await ctx.addInitScript(() => { try { localStorage.setItem('jesun.boot', '1'); } catch (e) {} });
  const pg = await ctx.newPage();
  pg.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') res.console.push(`${name}: ${m.text()}`); });
  pg.on('pageerror', e => res.console.push(`${name}: PAGEERROR ${e.message}`));
  await pg.goto(B + path, { waitUntil: 'networkidle' });
  await pg.waitForTimeout(opts.wait || 600);
  if (opts.scroll) { for (let y = 0; y < 30000; y += 700) { await pg.evaluate(v => window.scrollTo(0, v), y); await pg.waitForTimeout(60); } await pg.evaluate(() => window.scrollTo(0, 0)); await pg.waitForTimeout(300); }
  const w = await pg.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1 ? document.documentElement.scrollWidth : 0);
  if (w) res.console.push(`${name}: HORIZONTAL OVERFLOW ${w}px`);
  await pg.screenshot({ path: `${out}/${name}.png`, fullPage: true });
  await ctx.close();
}
for (const [p, n] of [['/', 'home'], ['/lab/', 'lab'], ['/journey/', 'journey'], ['/about/', 'about'], ['/work/', 'work'], ['/projects/prism.html', 'prism'], ['/writing/', 'writing'], ['/journal/site-rebuilt/', 'journal-post'], ['/now/', 'now'], ['/contact/', 'contact'], ['/resume/', 'resume'], ['/legal/', 'legal'], ['/404.html', '404']]) {
  await shot(p, n + '-desktop', { width: 1440, height: 900 }, { reduce: true, scroll: false });
  await shot(p, n + '-mobile', { width: 390, height: 844 }, { reduce: true });
}
// Boot: cold load, run to completion, measure
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const pg = await ctx.newPage();
  pg.on('pageerror', e => res.console.push('boot: PAGEERROR ' + e.message));
  const t0 = Date.now();
  await pg.goto(B + '/', { waitUntil: 'load' });
  await pg.waitForTimeout(3000); await pg.screenshot({ path: `${out}/boot-03s.png` });
  await pg.waitForTimeout(9000); await pg.screenshot({ path: `${out}/boot-12s.png` });
  await pg.waitForFunction(() => !document.documentElement.classList.contains('boot-armed'), null, { timeout: 120000 }).catch(() => res.console.push('boot: did not finish in 120s'));
  res.bootSeconds = (Date.now() - t0) / 1000;
  res.bootText = await pg.evaluate(() => document.getElementById('hud-done-text')?.textContent);
  res.bootHidden = await pg.evaluate(() => [...document.querySelectorAll('[data-layer]')].filter(e => getComputedStyle(e).opacity !== '1').length);
  await pg.screenshot({ path: `${out}/boot-end.png` });
  // Replay then skip at 4s
  await pg.click('#hud-replay'); await pg.waitForTimeout(4000); await pg.click('#skip');
  await pg.waitForTimeout(300);
  res.skipHidden = await pg.evaluate(() => [...document.querySelectorAll('[data-layer]')].filter(e => getComputedStyle(e).opacity !== '1' || e.style.transform).length);
  res.skipArmed = await pg.evaluate(() => document.documentElement.classList.contains('boot-armed'));
  // Return visit: no boot
  await pg.goto(B + '/', { waitUntil: 'load' }); await pg.waitForTimeout(500);
  res.returnArmed = await pg.evaluate(() => document.documentElement.classList.contains('boot-armed'));
  await ctx.close();
}
// Reduced motion cold visit: no boot
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
  const pg = await ctx.newPage(); await pg.goto(B + '/', { waitUntil: 'load' });
  res.reducedArmed = await pg.evaluate(() => document.documentElement.classList.contains('boot-armed'));
  await ctx.close();
}
// Performance on home: LCP, CLS, transfer
{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  await ctx.addInitScript(() => { try { localStorage.setItem('jesun.boot', '1'); } catch (e) {} });
  const pg = await ctx.newPage();
  const cdp = await ctx.newCDPSession(pg);
  await cdp.send('Network.enable'); await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 150, downloadThroughput: 1.6 * 1024 * 1024 / 8, uploadThroughput: 750 * 1024 / 8 });
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
  let bytes = 0; pg.on('response', async r => { try { const b = await r.body(); bytes += b.length; } catch (e) {} });
  await pg.addInitScript(() => { window.__lcp = 0; window.__cls = 0; new PerformanceObserver(l => { for (const e of l.getEntries()) window.__lcp = e.startTime; }).observe({ type: 'largest-contentful-paint', buffered: true }); new PerformanceObserver(l => { for (const e of l.getEntries()) if (!e.hadRecentInput) window.__cls += e.value; }).observe({ type: 'layout-shift', buffered: true }); });
  await pg.goto(B + '/', { waitUntil: 'networkidle' }); await pg.waitForTimeout(1500);
  res.perf = await pg.evaluate(() => ({ lcpMs: Math.round(window.__lcp), cls: +window.__cls.toFixed(4), domContentLoaded: Math.round(performance.getEntriesByType('navigation')[0].domContentLoadedEventEnd) }));
  res.perf.transferKB = Math.round(bytes / 1024);
  res.perf.conditions = 'mobile 390x844, 4x CPU throttle, 1.6 Mbps, 150 ms latency (Fast 3G-like)';
  await ctx.close();
}
await browser.close(); srv.kill();
fs.writeFileSync('build-log/qa.json', JSON.stringify(res, null, 1));
console.log(JSON.stringify(res, null, 1));
