/* Jesun.Code live playground UI.
   Real execution only: code runs through the vendored interpreter in a
   Pyodide web worker. Stop button terminates a runaway worker. */
(function () {
  'use strict';

  var codeEl = document.getElementById('jc-code');
  var stdinEl = document.getElementById('jc-stdin');
  var outEl = document.getElementById('jc-output');
  var runBtn = document.getElementById('jc-run');
  var stopBtn = document.getElementById('jc-stop');
  var statusEl = document.getElementById('jc-status');
  if (!codeEl || !window.Worker) return;

  var worker = null;
  var runId = 0;
  var pending = {};
  var booting = false;

  function setStatus(t) { if (statusEl) statusEl.textContent = t; }
  function print(t) {
    outEl.textContent += t;
    outEl.scrollTop = outEl.scrollHeight;
  }

  function spawn() {
    if (worker) worker.terminate();
    worker = new Worker('assets/js/py-worker.js');
    booting = true;
    setStatus('loading the Jesun.Code runtime (first run downloads Pyodide, ~10 MB)...');
    runBtn.disabled = true;
    worker.onmessage = function (e) {
      var m = e.data || {};
      if (m.type === 'ready') {
        booting = false;
        runBtn.disabled = false;
        setStatus('runtime ready: Jesun.Code v' + m.version + ' (real interpreter, in your browser)');
      } else if (m.type === 'done') {
        var cb = pending[m.id];
        delete pending[m.id];
        runBtn.disabled = false;
        stopBtn.classList.add('hidden');
        setStatus('done.');
        if (cb) cb(m.output);
      } else if (m.type === 'error') {
        booting = false;
        setStatus('could not start the runtime: ' + m.message);
      }
    };
    worker.onerror = function () {
      booting = false;
      setStatus('worker failed to start (network or browser blocked it).');
    };
    // kick off boot immediately
    worker.postMessage({ type: 'run', id: -1, source: 'note warmup\n', stdin: '' });
    pending[-1] = function () {};
  }

  runBtn.addEventListener('click', function () {
    if (booting) return;
    var id = ++runId;
    outEl.textContent = '';
    setStatus('running...');
    runBtn.disabled = true;
    stopBtn.classList.remove('hidden');
    pending[id] = function (output) { print(output); };
    worker.postMessage({ type: 'run', id: id, source: codeEl.value, stdin: stdinEl.value });
  });

  stopBtn.addEventListener('click', function () {
    pending = {};
    setStatus('stopped. Restarting the runtime...');
    stopBtn.classList.add('hidden');
    spawn();
  });

  // example loader
  document.querySelectorAll('[data-jc-example]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var name = btn.getAttribute('data-jc-example');
      fetch('assets/jesun/examples/' + name + '.jc').then(function (r) {
        if (!r.ok) throw new Error('missing example');
        return r.text();
      }).then(function (t) {
        codeEl.value = t;
        outEl.textContent = '';
        setStatus('example loaded: ' + name + '.jc (from the language repo)');
      }).catch(function () {
        setStatus('could not load that example.');
      });
    });
  });

  spawn();
})();
