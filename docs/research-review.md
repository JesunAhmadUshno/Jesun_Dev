# Engineering review: Jesun_Dev

This repository is a product, not a study: the static portfolio served at jesunahmadushno.com.
It is graded here on a doctoral-style engineering rubric: is the question (what the product
claims to do) clear, is there evidence that it does it, can anyone reproduce that evidence,
and are the limits stated. Every grade below cites a file in this repository.

Overall grade: **C+ before this review, B- after the cheap fixes below.** The product is honest
in most of its own copy (the twin calls itself rule-based, the playground names the real
interpreter version), but until now nothing checked those claims automatically.

## Scorecard

The dashboard (`site/`) reads this table at build time, so the page and this file cannot drift.

| Area | Grade | Evidence | Status |
| --- | --- | --- | --- |
| Question and claims | B | `index.html`, `projects/jesun-code.html`, `assets/js/twin-data.js` | Open: the GitHub repository description still says the twin uses Gemini 2.5 while `twin-data.js` says it is not a language model. Changing it is a settings change for the Owner. |
| Correctness evidence | C | `site/src/twin.check.mjs`, `site/src/claims.check.mjs` | Fixed now: known-answer checks for the twin (routing, fallback, EN and BN answers) and for the 4 bundled Jesun.Code examples run on every build. |
| Testing and CI | C- | `.github/workflows/pages.yml`, `site/package.json` | Fixed now: the repo had no tests; three checks now run inside `npm run build` and in the Pages workflow. Open: `assets/js/chess.js` needs the chess.js@1.0.0 library to test; a perft test needs that package vendored or installed in CI (about 1 minute, no paid compute). |
| Claims consistency | C | `site/src/claims.check.mjs`, `sitemap.xml` | Fixed now: the build fails if the shown interpreter version differs from `jesun.VERSION`, if a sitemap page loses its canonical link or meta description, or if the dashboard hard-codes a version or test count. |
| Bilingual parity | B- | `assets/js/lang.js`, `content-strings.json`, `site/src/i18n.check.mjs` | Fixed now: parity of `content-strings.json` is asserted on every build, and the build reports gaps in the table the language switch actually reads (`lang.js`). Found: `lang.js` has 4 guestbook keys with Bangla text and no English, so those labels stay in Bangla after switching back to English, and the two tables already disagree on `ach-1-desc`. Open: one source of truth for strings (a content change for the Owner), and a Bangla-speaking reviewer for translation quality. |
| Reproducibility | B- | `site/package-lock.json`, `assets/js/py-worker.js` | Fixed now: exact-pinned dashboard dependencies and a lockfile. Open: the homepage loads three@0.170.0, chess.js@1.0.0 and Pyodide 0.26.4 from a CDN at runtime; reproducible offline builds need them vendored. |
| Version honesty | C+ | `assets/jesun/jesun.py`, `projects/jesun-code.html` | Open: the vendored interpreter reports 0.6.0 while the site headline is Jesun.Code v2.0.0. The playground says so plainly. Closing the gap needs the v2.0.0 interpreter copied from the Jesun.Code repository and the examples re-run. |
| Twin quality | B- | `assets/js/twin.js`, `assets/js/twin-data.js` | Measured now: the twin check counts how many of each topic's own keywords route back to that topic and lists the misses (the dashboard shows them live). Open: misses come from stopwords ("about"), greedy token reuse ("salam" before "salaam") and key overlap; fixing them is a content change for the Owner. |
| Performance and accessibility | D | `index.html` | Open: no Lighthouse or axe results are committed although `index.html` is about 150 KB with 3D, motion and chess scripts. Needs one Lighthouse and one axe run per sitemap page (a few minutes on a laptop, no paid compute) committed as JSON. |
| Runtime dependencies and failure | C | `assets/js/live.js` | Open: live widgets use the unauthenticated GitHub API (60 requests per hour per IP) and rss2json. They fail gracefully but nothing records failure rates; that needs a privacy-safe counter, which is an Owner decision. |
| Deployment hygiene | C | `CNAME`, `.gitignore` | Fixed now: `.gitignore` added. Open: Pages runs a legacy Jekyll build with no `.nojekyll`, so `site/` source is also published; HTTPS is not enforced on the custom domain; the resume PDF is kept at two paths. All three change the live site and are left to the Owner. |
| Documentation | C | `README.md` | Fixed now: README structure and features updated to match the current site and linked to the live dashboard. |

## Threats to validity of the checks themselves

- The twin check measures self-routing on the topic keywords. It says nothing about questions phrased in ways the keywords do not anticipate.
- The site audit parses HTML with regular expressions. It is reliable for the attribute-quoted head tags this site uses and would miss unquoted attributes.
- The interpreter checks run the vendored 0.6.0 copy with CPython 3. The browser runs the same file in Pyodide 0.26.4; the dashboard does not claim the two are byte-identical beyond what a visitor can see by pressing Run.
- The grouping of interpreter classes into core, Python bridge and phase-2 is by class name pattern (see `site/src/extract.mjs`). It is a reading aid, not a statement about runtime behaviour.

## Related work

Rule-based question answering over a fixed knowledge base predates neural chat by decades (ELIZA, 1966; FAQ retrieval systems). The twin is closer to keyword FAQ retrieval than to a conversational agent, and says so. Plain-English programming languages have precedents in COBOL, AppleScript and Inform 7; Jesun.Code sits in that line.
