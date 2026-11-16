# SEO, AEO and GEO scorecard

Generated 2026-11-16 by scripts/scorecard.mjs from dist/, build-log/lint.json and build-log/qa.json. Regenerated on every CI run.

Rules: 1000 points per discipline. Every criterion shows its evidence. Every deduction names its reason. PENDING-LIVE criteria score 0 until checked on the live domain. Nothing rounds up.

| Discipline | Score | Pending live | Named deductions |
| --- | --- | --- | --- |
| SEO | 850 / 1000 | 130 | 20 |
| AEO | 900 / 1000 | 100 | 0 |
| GEO | 900 / 1000 | 100 | 0 |

Verdict: not 1000/1000 yet. The gap is the PENDING-LIVE work (only provable after launch) plus the named deductions below, each with its unblock step.

## SEO: 850 / 1000

| Criterion | Points | Evidence | Deduction or next step |
| --- | --- | --- | --- |
| Unique title on every indexable page | 60 / 60 | 35 pages, 35 unique titles (lint) |  |
| Meta description on every page, within length | 20 / 40 | 35/35 present; 2 above 160 characters | Deduction 20: home and about carry the 360-character canonical description word for word, as Phase 7 requires. Search engines truncate it. Unblock: Jesun approves a 155-character canonical, or accepts the trade. |
| Canonical URL on every page | 60 / 60 | grep rel="canonical" across dist |  |
| XML sitemap lists every indexable page | 60 / 60 | 39 URLs in sitemap.xml; missing: none |  |
| Image entries in the sitemap | 30 / 30 | 4 image entries |  |
| robots.txt allows search, names the sitemap | 50 / 50 | robots.txt: "User-agent: * / Allow: /", Sitemap line present; Googlebot and Bingbot not blocked |  |
| hreflang for English and Bangla editions | 40 / 40 | Reciprocal hreflang links in both article heads and in the sitemap |  |
| Valid structured data on every template | 100 / 100 | All JSON-LD parses (lint). Person+WebSite+WebPage on 35/35. BreadcrumbList missing on: none | Google Rich Results Test is a live check; listed below as PENDING-LIVE inside the Lighthouse item. |
| One h1 per page | 40 / 40 | lint: h1 count gate |  |
| Internal links resolve, no orphan page | 80 / 80 | 1498 internal links and 91 anchors checked; orphans: none |  |
| Legacy URL map returns 200 or a clean redirect | 80 / 80 | 25 legacy URLs checked by lint; redirects use meta refresh + canonical (GitHub Pages) and a _redirects file with 301s for Cloudflare Pages | GitHub Pages cannot send a true 301. On Cloudflare the _redirects file does. |
| Real 404 page that routes back into the site | 30 / 30 | 404.html with home, work and palette routes |  |
| Image SEO: alt, dimensions, modern formats, descriptive names | 60 / 60 | 16 img tags, all with alt and size; WebP sources via <picture>; canonical headshot at /img/jesun-ahmad-ushno.jpg |  |
| Mobile viewport, no horizontal overflow | 40 / 40 | qa.mjs at 390x844 on 13 templates: no overflow |  |
| Core Web Vitals in lab (LCP under 1.8 s, CLS under 0.05) | 100 / 100 | LCP 976 ms, CLS 0, 290 KB transferred; mobile 390x844, 4x CPU throttle, 1.6 Mbps, 150 ms latency (Fast 3G-like) | Lab numbers from a local server. Field data (CrUX) is PENDING-LIVE. |
| Lighthouse SEO 100 and Rich Results Test on the live domain | PENDING-LIVE (0 of 80) | PENDING-LIVE | After launch: CI Lighthouse job on the live URL, and search.google.com/test/rich-results for /, /about/, a project and a writing entry. |
| Search Console: sitemap submitted, pages indexed, no coverage errors | PENDING-LIVE (0 of 50) | PENDING-LIVE | After launch: submit sitemap.xml in Google Search Console and Bing Webmaster Tools; re-check in 14 days. |

## AEO: 900 / 1000

| Criterion | Points | Evidence | Deduction or next step |
| --- | --- | --- | --- |
| Answer-first summary (40 to 60 words) on key pages | 200 / 200 | home: 61 words; about/: 59 words; work/: 45 words; journey/: 52 words; writing/: 47 words; contact/: 42 words; now/: 52 words |  |
| Question-shaped headings where they earn it (About, Ventures, Contact, FAQ) | 150 / 150 | About h1 "Who is Jesun Ahmad Ushno?", Ventures h2 "What ventures has he founded?", Contact h1 "How do I contact him?", FAQ summaries are questions |  |
| Honest FAQ answered from receipts | 150 / 150 | 6 questions on /about/#faq; every answer uses data-file facts only |  |
| FAQPage structured data where it truthfully applies | 100 / 100 | FAQPage node on /about/ mirrors the visible FAQ exactly |  |
| Speakable summary on About | 80 / 80 | SpeakableSpecification -> #bio (the canonical description) |  |
| Visible date and byline on every article | 120 / 120 | 7/7 article pages show "By Jesun Ahmad Ushno" and a published date |  |
| Article structured data on articles | 100 / 100 | 7/7 carry Article, BlogPosting, ScholarlyArticle or Book |  |
| Featured snippet or voice answer captured for "Who is Jesun Ahmad Ushno" | PENDING-LIVE (0 of 100) | PENDING-LIVE | After launch and indexing: search the question on google.ca and google.com, record whether the answer block is used. |

## GEO: 900 / 1000

| Criterion | Points | Evidence | Deduction or next step |
| --- | --- | --- | --- |
| llms.txt: who he is, ventures with titles, key pages | 150 / 150 | dist/llms.txt generated from the data file; banned names absent (lint) |  |
| Citable facts with source and date beside them | 100 / 100 | 5 source lines on the home data strip; llms.txt lists facts with sources in brackets |  |
| Quotable one-line definitions of each venture | 50 / 50 | About page and llms.txt carry one sentence per venture |  |
| Original data presented as primary source (pattern registry, verified counts) | 100 / 100 | /patterns/ publishes the dated registry with a Dataset node and the build fingerprint; verified counts carry sources on the home strip |  |
| Author entity clarity: byline linked to the Person @id | 100 / 100 | 7/7 articles: author {"@id": "#person"} |  |
| Outbound citations to primary sources | 100 / 100 | 28 links to GitHub repositories and DOIs on /work/ alone |  |
| Freshness signals (dateModified, visible updated lines) | 100 / 100 | dateModified on every WebPage node; /now/ shows its update date; journal shows dates |  |
| E-E-A-T assembled: credentials with proof, testimony, corrections policy | 150 / 150 | Recognition rows with proof links; ten verbatim recommendations; corrections note on /legal/ |  |
| Answer engines may retrieve and cite while training is refused | 50 / 50 | robots.txt blocks training crawlers (GPTBot, ClaudeBot, CCBot, Google-Extended and others) and leaves search and user-requested agents allowed |  |
| Observed citations in ChatGPT, Perplexity, Claude and AI Overviews | PENDING-LIVE (0 of 100) | PENDING-LIVE | After launch: ask each engine "Who is Jesun Ahmad Ushno?" and record whether it cites jesunahmadushno.com. |

## Rubric for judgment criteria

- Answer-first: counted as present only if a block labelled On record, Summary or Answer, or the speakable bio, opens the page and holds 40 to 65 words.
- Question headings: a heading counts only if it is a real question a person would type.
- FAQ: an answer counts only if every fact in it is in the data file with a source.
- Citable facts: a fact counts only if its source sits beside it on the page, not in a footnote elsewhere.
