// QA for the Agent Portfolio home: static render, interactions, full build run, mobile.
// Copyright Jesun Ahmad Ushno. All rights reserved.
import { createRequire } from 'node:module'; import { spawn } from 'node:child_process'; import fs from 'node:fs';
const require = createRequire(import.meta.url);
let chromium; try { ({ chromium } = require('playwright')); } catch (e) { ({ chromium } = require('/opt/npm-tools/node_modules/playwright')); }
const PORT = 8099, OUT = process.env.QA_OUT || '/tmp/claude-0/qa3'; fs.mkdirSync(OUT, { recursive: true });
const srv = spawn('python3', ['-m', 'http.server', String(PORT), '--directory', 'dist'], { stdio: 'ignore' });
await new Promise(r => setTimeout(r, 700));
const browser = await chromium.launch({ executablePath: fs.existsSync('/usr/bin/google-chrome') ? '/usr/bin/google-chrome' : undefined });
const res = { errors: [] };
const ctxFor = async (vp, skipBoot) => { const c = await browser.newContext({ viewport: vp }); if (skipBoot) await c.addInitScript(() => { try { localStorage.setItem('jesun.boot', '1'); } catch (e) {} }); return c; };
const watch = (pg, n) => { pg.on('pageerror', e => res.errors.push(`${n}: ${e.message}`)); };
// 1. Static hero and interactions
{
  const c = await ctxFor({ width: 1440, height: 900 }, true), pg = await c.newPage(); watch(pg, 'static');
  await pg.goto(`http://localhost:${PORT}/`, { waitUntil: 'networkidle' }); await pg.waitForTimeout(800);
  await pg.mouse.move(820, 300); await pg.waitForTimeout(300); await pg.mouse.down(); await pg.mouse.up(); await pg.waitForTimeout(250);
  await pg.screenshot({ path: `${OUT}/hero.png` });
  res.nodes = await pg.evaluate(() => !!document.getElementById('net').width);
  await pg.keyboard.press('Backquote'); await pg.waitForTimeout(150); await pg.keyboard.type('ventures'); await pg.keyboard.press('Enter'); await pg.waitForTimeout(150);
  res.console = await pg.evaluate(() => document.getElementById('con-out').textContent.includes('Immitly'));
  await pg.screenshot({ path: `${OUT}/console.png` });
  await pg.keyboard.press('Escape');
  res.consoleClosed = await pg.evaluate(() => document.getElementById('console').hidden);
  await pg.waitForTimeout(6000); res.word = await pg.evaluate(() => document.querySelector('.giant').textContent);
  res.overflow = await pg.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  await pg.screenshot({ path: `${OUT}/full.png`, fullPage: true });
  await c.close();
}
// 2. Full build
{
  const c = await ctxFor({ width: 1440, height: 900 }, false), pg = await c.newPage(); watch(pg, 'build');
  const t0 = Date.now(); await pg.goto(`http://localhost:${PORT}/`, { waitUntil: 'load' });
  await pg.waitForTimeout(2600); await pg.screenshot({ path: `${OUT}/b-matrix.png` }); res.bootLines = await pg.evaluate(() => document.getElementById('boot-box').innerText);
  await pg.waitForTimeout(8000); await pg.click('#hudChaos').catch(() => res.errors.push('no chaos button')); await pg.waitForTimeout(1500); await pg.screenshot({ path: `${OUT}/b-swarm.png` });
  res.bootBox = await pg.evaluate(() => document.getElementById('boot-box') && document.getElementById('boot-box').textContent);
  await pg.waitForFunction(() => !document.documentElement.classList.contains('touring'), null, { timeout: 150000 }).catch(() => res.errors.push('build did not finish'));
  res.buildSeconds = (Date.now() - t0) / 1000; res.buildText = await pg.evaluate(() => document.getElementById('hudDoneText').textContent);
  res.feed = await pg.evaluate(() => [...document.querySelectorAll('#feed-list li')].map(l => l.textContent).join(' | '));
  res.hiddenAfter = await pg.evaluate(() => [...document.querySelectorAll('[data-layer]')].filter(e => +getComputedStyle(e).opacity < .9).length);
  await pg.click('#hudReplay'); await pg.waitForTimeout(3000); await pg.click('#skip'); await pg.waitForTimeout(300);
  res.hiddenAfterSkip = await pg.evaluate(() => [...document.querySelectorAll('[data-layer]')].filter(e => +getComputedStyle(e).opacity < .9 || e.style.transform).length);
  await c.close();
}
// 2b. Twin and palette retrieval
{
  const c = await ctxFor({ width: 1440, height: 900 }, true), pg = await c.newPage(); watch(pg, 'twin');
  await pg.goto(`http://localhost:${PORT}/lab/`, { waitUntil: 'networkidle' });
  await pg.fill('#twin-q', 'What did he publish?'); await pg.keyboard.press('Enter'); await pg.waitForTimeout(900);
  res.twin = await pg.evaluate(() => { const m = [...document.querySelectorAll('#twin-log .msg')].pop(); return m && m.innerText.slice(0, 220); });
  await pg.fill('#twin-q', 'What is his salary?'); await pg.keyboard.press('Enter'); await pg.waitForTimeout(700);
  res.twinRefuse = await pg.evaluate(() => [...document.querySelectorAll('#twin-log .msg')].pop().innerText.slice(0, 60));
  await pg.keyboard.press('Control+k'); await pg.keyboard.type('wavelet'); await pg.waitForTimeout(600);
  res.palette = await pg.evaluate(() => [...document.querySelectorAll('.pal li')].map(l => l.innerText.replace(/\s+/g, ' ')).slice(0, 3));
  await pg.screenshot({ path: `${OUT}/twin.png` }); await c.close();
}
// 3. Mobile
{
  const c = await ctxFor({ width: 390, height: 844 }, true), pg = await c.newPage(); watch(pg, 'mobile');
  await pg.goto(`http://localhost:${PORT}/`, { waitUntil: 'networkidle' }); await pg.waitForTimeout(600);
  res.mobileOverflow = await pg.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  await pg.screenshot({ path: `${OUT}/mobile.png`, fullPage: true }); await c.close();
}
// 4. Reduced motion: no boot, everything visible
{
  const c = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' }), pg = await c.newPage(); watch(pg, 'reduced');
  await pg.goto(`http://localhost:${PORT}/`, { waitUntil: 'networkidle' });
  res.reducedHidden = await pg.evaluate(() => [...document.querySelectorAll('[data-layer]')].filter(e => +getComputedStyle(e).opacity < .9).length);
  res.reducedArmed = await pg.evaluate(() => document.documentElement.classList.contains('boot-armed')); await c.close();
}
await browser.close(); srv.kill();
fs.writeFileSync('build-log/qa-home.json', JSON.stringify(res, null, 1));
console.log(JSON.stringify(res, null, 1));
