/* Jesun.Code playground worker.
   Runs the REAL Jesun.Code interpreter (vendored at assets/jesun/jesun.py)
   inside Pyodide. No faked output: every byte comes from jesun.execute(). */
'use strict';

var bootPromise = null;

async function boot() {
  importScripts('https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.js');
  var pyodide = await loadPyodide({ indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/' });
  var resp = await fetch('../jesun/jesun.py');
  if (!resp.ok) throw new Error('could not fetch jesun.py (' + resp.status + ')');
  var src = await resp.text();
  pyodide.FS.writeFile('/jesun.py', src);
  pyodide.runPython("import sys; sys.path.insert(0, '/'); import jesun");
  var version = pyodide.runPython('jesun.VERSION');
  postMessage({ type: 'ready', version: String(version) });
  return pyodide;
}

onmessage = function (e) {
  var msg = e.data || {};
  if (msg.type !== 'run') return;
  if (!bootPromise) bootPromise = boot();
  bootPromise.then(function (pyodide) {
    try {
      pyodide.globals.set('__jc_src', msg.source);
      pyodide.globals.set('__jc_stdin', msg.stdin || '');
      var out = pyodide.runPython('jesun.execute(__jc_src, __jc_stdin)');
      postMessage({ type: 'done', id: msg.id, output: String(out) });
    } catch (err) {
      postMessage({ type: 'done', id: msg.id,
        output: 'The runner hit a problem outside the language: ' + String((err && err.message) || err) });
    }
  }).catch(function (err) {
    postMessage({ type: 'error', message: String((err && err.message) || err) });
  });
};
