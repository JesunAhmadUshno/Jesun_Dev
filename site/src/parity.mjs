// EN/BN key parity for content-strings.json, grouped by key prefix (text before the first "-").
export function parity(strings) {
  const en = strings.en || {}, bn = strings.bn || {};
  const keys = [...new Set([...Object.keys(en), ...Object.keys(bn)])].sort();
  const groups = {};
  for (const k of keys) {
    const g = k.includes('-') ? k.slice(0, k.indexOf('-')) : k;
    const row = (groups[g] ||= { group: g, total: 0, both: 0, missingBn: [], missingEn: [], empty: [] });
    row.total++;
    const hasEn = typeof en[k] === 'string', hasBn = typeof bn[k] === 'string';
    if (hasEn && hasBn) row.both++;
    if (!hasBn) row.missingBn.push(k);
    if (!hasEn) row.missingEn.push(k);
    if ((hasEn && !en[k].trim()) || (hasBn && !bn[k].trim())) row.empty.push(k);
  }
  const list = Object.values(groups).sort((a, b) => b.total - a.total || a.group.localeCompare(b.group));
  return { keys, enCount: Object.keys(en).length, bnCount: Object.keys(bn).length, groups: list };
}
