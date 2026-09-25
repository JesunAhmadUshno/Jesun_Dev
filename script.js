/* ============ JESUN.DEV v2 interactions ============ */
(function(){
  'use strict';

  /* ---- boot overlay ---- */
  var boot = document.getElementById('boot');
  function endBoot(){ if(boot) boot.classList.add('done'); }
  setTimeout(endBoot, 1500);
  if(boot) boot.addEventListener('click', endBoot);

  /* ---- nav state ---- */
  var nav = document.getElementById('nav');
  function onScroll(){ nav.classList.toggle('scrolled', window.scrollY > 40); }
  window.addEventListener('scroll', onScroll, {passive:true});
  onScroll();

  /* ---- mobile menu ---- */
  var menuBtn = document.getElementById('menu-btn');
  var mobileMenu = document.getElementById('mobile-menu');
  menuBtn.addEventListener('click', function(){ mobileMenu.classList.toggle('open'); });
  mobileMenu.querySelectorAll('a').forEach(function(a){
    a.addEventListener('click', function(){ mobileMenu.classList.remove('open'); });
  });

  /* ---- typed hero ---- */
  var phrasesEN = [
    'AI Engineer & Data Specialist',
    'Vibe Coder',
    'Founder of Jesun.Ai',
    'Builder of Jesun.Code'
  ];
  var phrases = phrasesEN;
  window.__setTypedPhrases = function(list){ phrases = list; pi = 0; ci = 0; deleting = false; };
  var typedEl = document.getElementById('typed');
  var pi = 0, ci = 0, deleting = false;
  function tick(){
    var word = phrases[pi];
    if(!deleting){
      ci++;
      typedEl.textContent = word.slice(0, ci);
      if(ci === word.length){ deleting = true; return setTimeout(tick, 1700); }
      setTimeout(tick, 55);
    } else {
      ci--;
      typedEl.textContent = word.slice(0, ci);
      if(ci === 0){ deleting = false; pi = (pi + 1) % phrases.length; return setTimeout(tick, 350); }
      setTimeout(tick, 28);
    }
  }
  setTimeout(tick, 1600);

  /* ---- reveal on scroll ---- */
  var io = new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, {threshold: 0.12, rootMargin: '0px 0px -40px 0px'});
  document.querySelectorAll('.reveal').forEach(function(el){ io.observe(el); });

  /* ---- animated counters ---- */
  function animateCount(el){
    var target = parseFloat(el.getAttribute('data-count'));
    var dec = parseInt(el.getAttribute('data-dec') || '0', 10);
    var dur = 1400, start = null;
    function frame(t){
      if(!start) start = t;
      var p = Math.min((t - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = (target * eased).toFixed(dec);
      if(p < 1) requestAnimationFrame(frame);
      else el.textContent = target.toFixed(dec);
    }
    requestAnimationFrame(frame);
  }
  var cio = new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if(e.isIntersecting){ animateCount(e.target); cio.unobserve(e.target); }
    });
  }, {threshold: 0.6});
  document.querySelectorAll('[data-count]').forEach(function(el){ cio.observe(el); });

  /* ---- active nav link ---- */
  var sections = ['about','experience','team','projects','playground','writing','contact'].map(function(id){
    return document.getElementById(id);
  });
  var links = Array.prototype.slice.call(document.querySelectorAll('.nav-links a'));
  var nio = new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if(e.isIntersecting){
        links.forEach(function(l){
          l.style.color = (l.getAttribute('href') === '#' + e.target.id) ? 'var(--green)' : '';
        });
      }
    });
  }, {rootMargin: '-45% 0px -50% 0px'});
  sections.forEach(function(s){ if(s) nio.observe(s); });
})();
