/* Interactive terminal. Real responses from site data. */
(function () {
  'use strict';
  var term = document.getElementById('term');
  var out = document.getElementById('term-out');
  var input = document.getElementById('term-in');
  if (!term || !out || !input) return;

  function line(t, cls) {
    var d = document.createElement('div');
    d.className = 'term-line' + (cls ? ' ' + cls : '');
    d.textContent = t;
    out.appendChild(d);
    out.scrollTop = out.scrollHeight;
  }

  var COMMANDS = {
    help: function () {
      line('commands: help, whoami, about, now, team, projects, playground, writing, contact, socials, clear');
    },
    whoami: function () { line('jesun: ai engineer, data specialist, vibe coder. toronto.'); },
    about: function () {
      line('MSc Data Analytics, University of Niagara Falls Canada (2026, with distinction, CGPA 3.9154).');
      line('AI Engineer & Data Specialist at Gallea Ai. Ex-KPMG IT Advisory. Published ML researcher. MIAS Foundation co-founder.');
    },
    now: function () {
      line('now: running a 49-seat autonomous AI crew (Jesun.Ai), building Jesun.Code toward v1.0 self-hosting, and shipping daily AI content.');
    },
    team: function () {
      line('49 AI seats across Personal Socials (10), Jesun.Ai (31), Jesun.Code (8).');
      line('open the team section: type "go team" or scroll up.');
    },
    projects: function () {
      line('Jesun.Code (plain-English programming language), PRISM (zero-trust analytics), SonicClear (audio AI), NoPara (private media converter), BigFish, TriDrop.');
      line('open the projects section: type "go projects" or scroll up.');
    },
    playground: function () { line('the Jesun.Code playground is right above this terminal. It runs the real interpreter in your browser.'); },
    writing: function () { line('essays on Medium: medium.com/@jesunahmadushno'); },
    contact: function () {
      line('email: jesunahmadushno@gmail.com');
      line('linkedin: linkedin.com/in/jesunahmadushno');
      line('book 30 min: calendly.com/jesunahmadushno/30min');
    },
    socials: function () {
      line('github: github.com/JesunAhmadUshno');
      line('linkedin: linkedin.com/in/jesunahmadushno');
      line('medium: medium.com/@jesunahmadushno');
    },
    clear: function () { out.innerHTML = ''; }
  };

  function go(target) {
    var el = document.getElementById(target);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
    else line('unknown section: ' + target);
  }

  input.addEventListener('keydown', function (e) {
    if (e.key !== 'Enter') return;
    var raw = input.value.trim();
    input.value = '';
    line('> ' + raw, 'term-echo');
    if (!raw) return;
    var parts = raw.toLowerCase().split(/\s+/);
    if (parts[0] === 'go' && parts[1]) { go(parts[1]); return; }
    var fn = COMMANDS[parts[0]];
    if (fn) fn();
    else line('unknown command: ' + parts[0] + '. try "help".', 'term-dim');
  });

  term.addEventListener('click', function () { input.focus(); });
  line('welcome to jesun.dev shell. type "help".', 'term-dim');
})();
