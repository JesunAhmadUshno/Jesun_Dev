// Runs assets/js/live.js against a hostile rss2json response: third-party fields must not become markup.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const src = fs.readFileSync(new URL('../../assets/js/live.js', import.meta.url), 'utf8');
const med = { innerHTML: '' };
const item = {
  title: '<img src=x onerror=alert(1)>', link: 'javascript:alert(1)', pubDate: '2026-01-02',
  description: 'hi <img src=x onerror=alert(2)',
};
const fetch = async () => ({ ok: true, json: async () => ({ items: [item] }) });
vm.runInNewContext(src, { document: { getElementById: (id) => (id === 'medium-posts' ? med : null) }, fetch, encodeURIComponent });
await new Promise((r) => setTimeout(r, 10));
const html = med.innerHTML;
assert.ok(html.includes('post-date'), `feed did not render: ${html}`);
assert.ok(!/<img/i.test(html), `unescaped markup from the feed: ${html}`);
assert.ok(!/javascript:/i.test(html), `non-http link from the feed: ${html}`);
console.log('live ok: Medium feed fields are escaped and links limited to http(s)');
