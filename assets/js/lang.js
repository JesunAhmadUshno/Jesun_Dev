/* Bangla / English toggle. Persists in localStorage. */
(function () {
  'use strict';

  var STRINGS = {
    en: {
      'nav-about': 'about', 'nav-experience': 'experience', 'nav-team': 'team',
      'nav-projects': 'projects', 'nav-playground': 'playground', 'nav-writing': 'writing',
      'nav-contact': 'contact',
      'hero-sub': 'I build minds like companies and companies like minds. Applied AI, data pipelines, and a 49-seat autonomous crew that ships while I sleep.',
      'cta-crew': 'Meet the crew', 'cta-contact': 'Get in touch',
      'k-about': '// 01 . about', 'k-experience': '// 02 . experience', 'k-team': '// 03 . team',
      'k-projects': '// 04 . projects', 'k-playground': '// 05 . playground',
      'k-writing': '// 06 . writing', 'k-contact': '// 07 . contact',
      'h2-about': 'Engineer by craft,<br/>vibe coder by soul.',
      'h2-experience': 'The journey so far.',
      'h2-team': 'The crew behind<br/>the <span class="grad">machine.</span>',
      'h2-projects': 'Selected work.',
      'h2-playground': 'Try the <span class="grad">language.</span>',
      'h2-writing': 'Writing.',
      'h2-contact': 'Ready to create<br/>something <span class="grad">amazing?</span>',
      'sub-team': 'Jesun.Ai runs on an autonomous AI crew across three entities. Click any member for their full portfolio.',
      'sub-projects': 'A mix of academic research, AI experiments, and real-world tools.',
      'sub-contact': 'Based in Toronto. Open to full-time roles, freelance collaborations, and interesting problems.',
      'sub-playground': 'Jesun.Code executes for real in your browser via the actual v0.6.0 interpreter. Nothing is faked.',
      'sub-writing': 'Essays and notes, fresh from Medium.',
      'jc-code-label': 'Code', 'jc-stdin-label': 'Input (for ask statements)',
      'jc-run': 'Run', 'jc-stop': 'Stop', 'jc-examples': 'Examples:',
      'term-hint': 'Interactive terminal. Type "help".',
      'now-kicker': '// now',
      'now-text': 'Running a 49-seat autonomous AI crew at Jesun.Ai, building Jesun.Code toward v1.0 self-hosting, and working as an AI Engineer & Data Specialist at Gallea Ai in Toronto.',
      'stats-kicker': '// live signal',
      'shiplog-title': 'Ship log',
      'shiplog-sub': 'Latest public pushes, straight from GitHub.'
    },
    bn: {
      'nav-about': 'পরিচিতি', 'nav-experience': 'অভিজ্ঞতা', 'nav-team': 'টিম',
      'nav-projects': 'প্রজেক্ট', 'nav-playground': 'প্লেগ্রাউন্ড', 'nav-writing': 'লেখা',
      'nav-contact': 'যোগাযোগ',
      'hero-sub': 'আমি মন বানাই কোম্পানির মতো করে, আর কোম্পানি বানাই মনের মতো করে। অ্যাপ্লাইড AI, ডেটা পাইপলাইন, আর ৪৯ সিটের স্বয়ংক্রিয় ক্রু, যারা আমি ঘুমিয়ে থাকলেও শিপ করে।',
      'cta-crew': 'ক্রুদের দেখো', 'cta-contact': 'যোগাযোগ করো',
      'k-about': '// ০১ . পরিচিতি', 'k-experience': '// ০২ . অভিজ্ঞতা', 'k-team': '// ০৩ . টিম',
      'k-projects': '// ০৪ . প্রজেক্ট', 'k-playground': '// ০৫ . প্লেগ্রাউন্ড',
      'k-writing': '// ০৬ . লেখা', 'k-contact': '// ০৭ . যোগাযোগ',
      'h2-about': 'পেশায় ইঞ্জিনিয়ার,<br/>আত্মায় ভাইব কোডার।',
      'h2-experience': 'এ পর্যন্ত পথচলা।',
      'h2-team': 'মেশিনের পেছনের <span class="grad">ক্রু।</span>',
      'h2-projects': 'বাছাই করা কাজ।',
      'h2-playground': '<span class="grad">ভাষাটা</span> চালিয়ে দেখো।',
      'h2-writing': 'লেখালেখি।',
      'h2-contact': 'দারুণ কিছু বানাতে<br/><span class="grad">প্রস্তুত?</span>',
      'sub-team': 'Jesun.Ai চলে তিনটি এনটিটি জুড়ে স্বয়ংক্রিয় AI ক্রু দিয়ে। পূর্ণ পোর্টফোলিও দেখতে যেকোনো সদস্যে ক্লিক করো।',
      'sub-projects': 'একাডেমিক গবেষণা, AI এক্সপেরিমেন্ট আর বাস্তব টুলের মিশ্রণ।',
      'sub-contact': 'টরন্টোতে থাকি। ফুল-টাইম রোল, ফ্রিল্যান্স কাজ আর মজার সমস্যার জন্য উন্মুক্ত।',
      'sub-playground': 'Jesun.Code তোমার ব্রাউজারেই সত্যিকারের চলে, আসল v0.6.0 ইন্টারপ্রেটার দিয়ে। কিছুই নকল নয়।',
      'sub-writing': 'Medium থেকে সরাসরি প্রবন্ধ আর নোট।',
      'jc-code-label': 'কোড', 'jc-stdin-label': 'ইনপুট (ask স্টেটমেন্টের জন্য)',
      'jc-run': 'চালাও', 'jc-stop': 'থামাও', 'jc-examples': 'উদাহরণ:',
      'term-hint': 'ইন্টার‌্যাক্টিভ টার্মিনাল। "help" লিখো।',
      'now-kicker': '// এখন',
      'now-text': 'Jesun.Ai-তে ৪৯ সিটের স্বয়ংক্রিয় AI ক্রু চালাচ্ছি, Jesun.Code-কে v1.0 সেলফ-হোস্টিংয়ের দিকে নিয়ে যাচ্ছি, আর টরন্টোতে Gallea Ai-তে AI ইঞ্জিনিয়ার ও ডেটা স্পেশালিস্ট হিসেবে কাজ করছি।',
      'stats-kicker': '// লাইভ সিগন্যাল',
      'shiplog-title': 'শিপ লগ',
      'shiplog-sub': 'সরাসরি GitHub থেকে সর্বশেষ পাবলিক পুশ।'
    }
  };

  var PHRASES = {
    en: ['AI Engineer & Data Specialist', 'Vibe Coder', 'Founder of Jesun.Ai', 'Builder of Jesun.Code'],
    bn: ['এআই ইঞ্জিনিয়ার ও ডেটা স্পেশালিস্ট', 'ভাইব কোডার', 'Jesun.Ai-এর প্রতিষ্ঠাতা', 'Jesun.Code-এর নির্মাতা']
  };

  function current() {
    try { return localStorage.getItem('jesundev-lang') || 'en'; } catch (e) { return 'en'; }
  }

  function apply(lang) {
    document.documentElement.lang = lang;
    var table = STRINGS[lang] || STRINGS.en;
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var v = table[el.getAttribute('data-i18n')];
      if (typeof v === 'string') el.innerHTML = v;
    });
    ['lang-btn', 'lang-btn-m'].forEach(function (id) {
      var b = document.getElementById(id);
      if (b) b.textContent = lang === 'en' ? 'বাংলা' : 'EN';
    });
    try { localStorage.setItem('jesundev-lang', lang); } catch (e) {}
    if (window.__setTypedPhrases) window.__setTypedPhrases(PHRASES[lang] || PHRASES.en);
  }

  document.addEventListener('DOMContentLoaded', function () {
    apply(current());
    ['lang-btn', 'lang-btn-m'].forEach(function (id) {
      var b = document.getElementById(id);
      if (b) b.addEventListener('click', function () {
        apply(current() === 'en' ? 'bn' : 'en');
      });
    });
  });

  window.__applyLang = apply;
})();
