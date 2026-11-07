// Loads the production twin (assets/js/twin.js + twin-data.js) unchanged and
// adds an explainability view. Shared by the browser (sources via Vite ?raw)
// and the Node checks (sources via fs), so both run the exact same code.
export function loadTwin(twinSrc, dataSrc) {
  const dm = { exports: {} };
  new Function('module', 'exports', 'window', dataSrc)(dm, dm.exports, undefined);
  const data = dm.exports;
  // Only the export list is widened so the dashboard can see the tokeniser;
  // matching logic is untouched. `document` is shadowed so the homepage widget does not boot.
  const patched = twinSrc.replace('normalize: normalize,', 'normalize: normalize, contentTokens: contentTokens,');
  if (patched === twinSrc) throw new Error('twin.js export list changed; update twin-core.mjs');
  const tm = { exports: {} };
  new Function('module', 'exports', 'require', 'document', 'window', patched)(tm, tm.exports, () => data, undefined, undefined);
  const api = tm.exports;
  // Per-topic scores for a query, highest first, using the production entryScore.
  function rank(query) {
    const q = api.contentTokens(query);
    const scores = data.entries.map((e) => ({ id: e.id, score: q.length ? api.entryScore(q, e) : 0 }));
    return { tokens: q, scores: [...scores].sort((a, b) => b.score - a.score) };
  }
  return { data, ...api, rank };
}
