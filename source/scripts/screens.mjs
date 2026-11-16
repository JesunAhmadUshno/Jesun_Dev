// Real before/after screenshots and the resume PDF, rendered with a headless browser.
// Copyright Jesun Ahmad Ushno. All rights reserved.
import { createRequire } from 'node:module';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import sharp from 'sharp';
const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require('playwright')); } catch (e) { ({ chromium } = require('/opt/npm-tools/node_modules/playwright')); }
const OLD = process.env.OLD_SITE || '../bundle2/jesunahmadushno-super-bundle/current-site-jesunahmadushno.com';
const serve = (dir, port) => spawn('python3', ['-m', 'http.server', String(port), '--directory', dir], { stdio: 'ignore' });
const s1 = serve('dist', 8091), s2 = fs.existsSync(OLD) ? serve(OLD, 8092) : null;
await new Promise(r => setTimeout(r, 800));
const exe = process.env.CHROME || (fs.existsSync('/usr/bin/google-chrome') ? '/usr/bin/google-chrome' : undefined);
const browser = await chromium.launch({ executablePath: exe });
const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, reducedMotion: 'reduce' });
const pg = await ctx.newPage();
fs.mkdirSync('src/img', { recursive: true }); fs.mkdirSync('src/static/resume', { recursive: true });
if (s2) {
  await pg.goto('http://localhost:8092/', { waitUntil: 'load' }).catch(() => {});
  await pg.waitForTimeout(6000);
  await pg.evaluate(() => { document.querySelectorAll('[id*=boot],[class*=boot],[class*=loader]').forEach(e => e.remove()); document.body.style.overflow = 'auto'; });
  await pg.waitForTimeout(500);
  await sharp(await pg.screenshot()).webp({ quality: 74 }).toFile('src/img/before-old-site.webp');
}
await pg.goto('http://localhost:8091/', { waitUntil: 'networkidle' });
await pg.waitForTimeout(800);
await sharp(await pg.screenshot()).webp({ quality: 74 }).toFile('src/img/after-rebuild.webp');
await pg.goto('http://localhost:8091/resume/', { waitUntil: 'networkidle' });
await pg.emulateMedia({ media: 'screen' });
await pg.addStyleTag({ content: '.top,.foot,body::after{display:none!important} .sec{padding-block:24px!important} body{background:#0B0B0C}' });
const pdf = await pg.pdf({ format: 'Letter', printBackground: true, margin: { top: '0.4in', bottom: '0.4in', left: '0.3in', right: '0.3in' } });
fs.writeFileSync('src/static/resume/Jesun-Ahmad-Ushno-Resume.pdf', pdf);
fs.writeFileSync('src/static/Jesun_Resume.pdf', pdf);
await browser.close(); s1.kill(); if (s2) s2.kill();
console.log('screens and resume ok');
