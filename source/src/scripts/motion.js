// One entrance per section, each with its own motion. It runs once per section on visits where the
// agent build does not run, and never with reduced motion. Content is visible without script.
// Copyright Jesun Ahmad Ushno. All rights reserved.
const H = document.documentElement;
const rm = () => { try { if (localStorage.getItem('jesun.rm') === '1') return true; } catch (e) { /* blocked */ } return matchMedia('(prefers-reduced-motion: reduce)').matches; };
const IDS = ['work', 'studies', 'ventures', 'recognition', 'proof', 'about', 'journey', 'testimony', 'lab', 'contact'];
export function sectionMotion() {
  const quote = document.querySelector('.quote');
  const ink = () => quote && quote.classList.add('inked');
  if (rm() || !('IntersectionObserver' in window)) { ink(); return; }
  const start = () => {
    if (H.classList.contains('touring') || H.classList.contains('boot-armed')) return false;
    const secs = IDS.map(id => document.getElementById(id)).filter(Boolean);
    // Sections already on screen are marked done first, so nothing visible blinks out.
    for (const s of secs) { const r = s.getBoundingClientRect(); if (r.top < innerHeight * .9 && r.bottom > 0) s.classList.add('in'); }
    H.classList.add('mx');
    const io = new IntersectionObserver(es => { for (const e of es) if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }, { rootMargin: '0px 0px -12% 0px' });
    secs.filter(s => !s.classList.contains('in')).forEach(s => io.observe(s));
    if (quote) new IntersectionObserver((es, o) => { if (es.some(e => e.isIntersecting)) { ink(); o.disconnect(); } }, { threshold: .4 }).observe(quote);
    return true;
  };
  // On a visit where the agents build the page, the build is the one orchestrated moment: skip entrances.
  if (H.classList.contains('touring') || H.classList.contains('boot-armed')) { if (quote) new IntersectionObserver((es, o) => { if (es.some(e => e.isIntersecting)) { ink(); o.disconnect(); } }, { threshold: .4 }).observe(quote); return; }
  start();
}

// Decorative CSS animations pause while their section is off screen (production audit, P1).
export function pauseOffscreen() {
  if (!('IntersectionObserver' in window)) return;
  const io = new IntersectionObserver(es => { for (const e of es) e.target.classList.toggle('off', !e.isIntersecting); }, { rootMargin: '200px 0px' });
  document.querySelectorAll('section.section, footer').forEach(s => io.observe(s));
}
