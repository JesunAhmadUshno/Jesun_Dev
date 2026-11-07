/* Jesun.Code runner for the dashboard. Same approach as the homepage's assets/js/py-worker.js:
   the vendored interpreter (assets/jesun/jesun.py) runs inside Pyodide 0.26.4, and every byte of
   output comes from jesun.execute(). Pyodide is fetched from the CDN only after the visitor presses Run. */
let boot = null;
async function start(pyUrl) {
  importScripts('https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.js');
  const pyodide = await loadPyodide({ indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/' });
  const resp = await fetch(pyUrl);
  if (!resp.ok) throw new Error(`could not fetch jesun.py (${resp.status})`);
  pyodide.FS.writeFile('/jesun.py', await resp.text());
  pyodide.runPython("import sys; sys.path.insert(0, '/'); import jesun");
  postMessage({ type: 'ready', version: String(pyodide.runPython('jesun.VERSION')) });
  return pyodide;
}
onmessage = (e) => {
  const msg = e.data || {};
  if (msg.type !== 'run') return;
  boot ||= start(msg.pyUrl);
  boot.then((pyodide) => {
    const t0 = performance.now();
    try {
      pyodide.globals.set('__jc_src', msg.source);
      pyodide.globals.set('__jc_stdin', msg.stdin || '');
      const out = pyodide.runPython('jesun.execute(__jc_src, __jc_stdin)');
      postMessage({ type: 'done', output: String(out), ms: performance.now() - t0 });
    } catch (err) {
      postMessage({ type: 'done', output: `The runner hit a problem outside the language: ${err?.message || err}`, ms: performance.now() - t0 });
    }
  }).catch((err) => postMessage({ type: 'error', message: String(err?.message || err) }));
};
