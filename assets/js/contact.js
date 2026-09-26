/* Contact form: posts to the formsubmit ajax endpoint, no page reload.
 * NOTE: the first-ever submission triggers a formsubmit activation email
 * to jesunahmadushno@gmail.com that must be confirmed before delivery works.
 * No em dash used anywhere in this file, per house rule.
 */
(function () {
  'use strict';

  var ENDPOINT = 'https://formsubmit.co/ajax/jesunahmadushno@gmail.com';

  var FALLBACK = {
    en: {
      'cf-sending': 'Sending...',
      'cf-ok': 'Message sent. I will get back to you soon.',
      'cf-err': 'Something went wrong. Please email me directly instead.',
      'cf-req': 'Please add your name, a valid email, and a message.'
    },
    bn: {
      'cf-sending': 'পাঠানো হচ্ছে...',
      'cf-ok': 'বার্তা পাঠানো হয়েছে। শীঘ্রই উত্তর দেব।',
      'cf-err': 'কিছু একটা সমস্যা হয়েছে। সরাসরি ইমেইল করো।',
      'cf-req': 'নাম, সঠিক ইমেইল আর বার্তা দাও।'
    }
  };

  function lang() {
    try { return localStorage.getItem('jesundev-lang') || 'en'; } catch (e) { return 'en'; }
  }

  function t(key) {
    var L = lang();
    try {
      if (window.__STRINGS && window.__STRINGS[L] && typeof window.__STRINGS[L][key] === 'string') {
        return window.__STRINGS[L][key];
      }
    } catch (e) { /* fall through to local table */ }
    return (FALLBACK[L] && FALLBACK[L][key]) || FALLBACK.en[key] || key;
  }

  function init() {
    var form = document.getElementById('contact-form');
    if (!form) return;
    var status = document.getElementById('cf-status');
    var btn = form.querySelector('button[type="submit"]');
    var els = form.elements;

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = String(els['name'].value || '').trim();
      var email = String(els['email'].value || '').trim();
      var msg = String(els['message'].value || '').trim();
      var okEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

      if (name.length < 2 || !okEmail || msg.length < 10) {
        status.textContent = t('cf-req');
        status.className = 'cf-status mono err';
        return;
      }

      btn.disabled = true;
      status.textContent = t('cf-sending');
      status.className = 'cf-status mono';

      fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          name: name,
          email: email,
          message: msg,
          _honey: String(els['_honey'].value || ''),
          _subject: 'jesunahmadushno.com contact form',
          _template: 'table'
        })
      })
        .then(function (r) { return r.json(); })
        .then(function (j) {
          if (j && (j.success === 'true' || j.success === true)) {
            status.textContent = t('cf-ok');
            status.className = 'cf-status mono ok';
            form.reset();
          } else {
            throw new Error('formsubmit did not confirm');
          }
        })
        .catch(function () {
          status.textContent = t('cf-err');
          status.className = 'cf-status mono err';
        })
        .then(function () { btn.disabled = false; });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
