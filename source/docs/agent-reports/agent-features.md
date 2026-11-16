# AI, ML and agentic features: candidates, grades, top 10 specs

Strategist report for the Jesun portfolio. Read-only pass over src/data/jesun.json, src/templates/home.mjs, src/scripts/home.js, scifi.js, lab.js, demos.js and functions/.

## Hard rules every feature must pass

Free only. No API keys in the browser. Receipts only: no invented numbers or claims. Privacy by default. English only. No em dash. The two banned names never appear. Reduced motion gets a complete static page.

## What already exists

Matrix boot, swarm build with named seats and an activity feed, foreman avatar, geometric network, decode headings, word cycle, console, HUD cursor, section rail, fleet dock, rule-based twin, terminal, wavelet and elitist PSO demos, fleet routing simulation, local CSV analysis, fleet seat map, chess engine, free backend (contact, guestbook, stats, hits).

## Rubric

Each candidate is scored 1 to 5 on six criteria. Total out of 30.

| Code | Criterion | 5 means |
| --- | --- | --- |
| I | Impact | A visitor remembers it and tells someone |
| F | Fit with his record | It shows something he actually does (fleets, receipts, privacy, his papers) |
| T | Technical honesty | It is real computation, labelled truthfully, no fake AI |
| E | Effort (inverse) | Under 4 hours |
| P | Performance cost (inverse) | No measurable cost on a mid phone |
| A | Accessibility | Works by keyboard, screen reader and reduced motion |

## Candidates (44)

Effort in hours. Risk: L low, M medium, H high. Wow 1 to 10.

### Agent behaviour on the page

| # | Feature | Why it fits Jesun | Hrs | Risk | Wow | I | F | T | E | P | A | Total |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Agent patrol: after the build, 3 seats roam and stop at a stat to show its source in a speech chip | Every claim carries a receipt, shown by his fleet | 4 | M | 9 | 5 | 5 | 5 | 4 | 4 | 3 | 26 |
| 2 | Hand-off trails: one agent passes a "packet" to another between sections, logged in the feed | He runs agents as a company with hand-offs | 3 | L | 7 | 4 | 5 | 5 | 4 | 4 | 3 | 25 |
| 3 | Explain mode: click any element, the agent that placed it says what it did and which data field it came from | Receipts plus fleet in one gesture | 5 | M | 9 | 5 | 5 | 5 | 3 | 5 | 4 | 27 |
| 4 | Summon on demand: dock button sends 6 agents to rebuild only the section in view | Agentic and fast, no full replay | 3 | L | 8 | 4 | 4 | 5 | 4 | 4 | 3 | 24 |
| 5 | Agent cursor follows visitor focus: Tab focus gets a seat that "escorts" keyboard users | Accessibility as a feature | 3 | M | 6 | 3 | 3 | 5 | 4 | 5 | 5 | 25 |
| 6 | Fleet standup: console command "standup" prints each seat's last action from this session | Org chart thinking | 2 | L | 6 | 3 | 5 | 5 | 5 | 5 | 5 | 28 |
| 7 | Seat profile cards: hover a seat on The System map, see role, department, actions this session | Fleet as software | 2 | L | 5 | 3 | 5 | 5 | 5 | 5 | 4 | 27 |
| 8 | Build replay scrubber: a timeline of the build log, drag to any moment | Observability, like his pipeline mindset | 8 | H | 8 | 4 | 4 | 5 | 2 | 3 | 3 | 21 |
| 9 | Error drill: console "chaos" kills a seat mid-build, foreman reassigns its task, feed logs it | Robust systems that hold | 4 | M | 8 | 4 | 5 | 5 | 4 | 4 | 3 | 25 |
| 10 | Agent voices: each seat speaks one line via Web Speech API on request | Fun but off-brand noise | 3 | M | 5 | 2 | 2 | 4 | 4 | 4 | 2 | 18 |

### On-device ML (real, small, client-side)

| # | Feature | Why it fits Jesun | Hrs | Risk | Wow | I | F | T | E | P | A | Total |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 11 | Semantic site search: TF-IDF plus BM25 over the data file and posts, built at build time, ranked in the palette | RAG is his stack; retrieval without a server | 5 | L | 8 | 5 | 5 | 5 | 3 | 5 | 5 | 28 |
| 12 | Twin upgrade to retrieval: twin answers by retrieving the best data passages (BM25) and shows citations | Every claim carries a receipt | 5 | L | 9 | 5 | 5 | 5 | 3 | 5 | 5 | 28 |
| 13 | Drawing pad that computes PulseKey-style metrics (speed, pauses, jitter, pressure) live from your stroke | His real PulseKey work, research not clinical | 6 | M | 9 | 5 | 5 | 5 | 3 | 5 | 3 | 26 |
| 14 | Handwritten digit recogniser: tiny MLP weights trained offline, under 200 KB, runs in the browser | Shows ML engineering end to end | 8 | M | 7 | 4 | 3 | 5 | 2 | 4 | 3 | 21 |
| 15 | Webcam fabric inspection using the wavelet method | Camera APIs blocked in the preview; privacy risk | 6 | H | 7 | 3 | 5 | 5 | 3 | 3 | 2 | 21 |
| 16 | Live k-means: drop points, watch clusters form | Classic data analytics, his MSc | 3 | L | 6 | 3 | 4 | 5 | 4 | 5 | 3 | 24 |
| 17 | Anomaly detector on the CSV demo: z-score and IQR flags per column | Data quality, his KPMG audit side | 2 | L | 6 | 3 | 5 | 5 | 5 | 5 | 5 | 28 |
| 18 | Time-series forecast on his GitHub activity (moving average, labelled as such) | Live data plus honest modelling | 4 | M | 6 | 3 | 4 | 4 | 4 | 5 | 4 | 24 |
| 19 | Gesture control of the network with hand tracking (MediaPipe) | Model download about 8 MB, camera needed | 8 | H | 8 | 4 | 2 | 5 | 2 | 1 | 2 | 16 |
| 20 | Audio denoise toy (spectral gating on a sample clip), the SonicClear idea | His SonicClear project | 6 | M | 7 | 4 | 5 | 4 | 3 | 4 | 3 | 23 |

### Semantic search and the twin

| # | Feature | Why it fits Jesun | Hrs | Risk | Wow | I | F | T | E | P | A | Total |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 21 | Twin streams its answer token by token with a visible "retrieved 3 passages" trace | Looks like a model, stays honest | 2 | L | 7 | 4 | 4 | 4 | 5 | 5 | 4 | 26 |
| 22 | Twin suggests follow-up questions from related passages | Guided, recruiter friendly | 2 | L | 5 | 3 | 4 | 5 | 5 | 5 | 5 | 27 |
| 23 | Twin answers become shareable links (#ask-ventures) | Utility for people who forward him | 2 | L | 5 | 3 | 3 | 5 | 5 | 5 | 5 | 26 |
| 24 | Twin on every page as a corner chip | More reach, more clutter | 3 | M | 5 | 3 | 3 | 5 | 4 | 4 | 3 | 22 |
| 25 | Optional real LLM via WebLLM in the browser | Downloads hundreds of MB; fails the 2 MB limit | 10 | H | 8 | 3 | 3 | 4 | 1 | 1 | 2 | 14 |

### Live data from the free backend

| # | Feature | Why it fits Jesun | Hrs | Risk | Wow | I | F | T | E | P | A | Total |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 26 | Live ship log: latest public GitHub pushes via /api/stats extension, cached 6 h | Receipts that update themselves | 3 | L | 7 | 4 | 5 | 5 | 4 | 5 | 5 | 28 |
| 27 | Guestbook notes float as network nodes in the hero | Visitors join the network | 3 | M | 7 | 4 | 3 | 5 | 4 | 4 | 3 | 23 |
| 28 | Visitor globe of countries (country only, from Cloudflare header, aggregated) | Privacy risk perception; low fit | 5 | M | 7 | 4 | 2 | 5 | 3 | 3 | 3 | 20 |
| 29 | Build health badge: last CI run, lint result, scorecard totals, from a build-time JSON | Verification is done, shown | 2 | L | 7 | 4 | 5 | 5 | 5 | 5 | 5 | 29 |
| 30 | Brief triage: the contact API tags a brief by mandate and replies with an honest expected response window set by Jesun | Automation he would run | 3 | M | 6 | 3 | 5 | 4 | 4 | 5 | 5 | 26 |

### Automation (CI and schedules)

| # | Feature | Why it fits Jesun | Hrs | Risk | Wow | I | F | T | E | P | A | Total |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 31 | Build provenance page: every build lists fingerprint, lint counts, test results, budgets, generated in CI | His "if it can't be verified" rule | 3 | L | 7 | 4 | 5 | 5 | 4 | 5 | 5 | 28 |
| 32 | Now-page auto expiry already exists; add a "stale" warning in the dock when any line is over 60 days | Freshness as a system | 1 | L | 4 | 2 | 5 | 5 | 5 | 5 | 5 | 27 |
| 33 | Visual regression in CI (screenshot diff of hero and cards) | Robustness, invisible to visitors | 4 | M | 3 | 2 | 4 | 5 | 4 | 5 | 5 | 25 |
| 34 | Weekly receipts check: CI re-fetches every proof link and flags dead ones | Receipts stay true | 3 | L | 4 | 2 | 5 | 5 | 4 | 5 | 5 | 26 |

### Sci-fi presentation and sound

| # | Feature | Why it fits Jesun | Hrs | Risk | Wow | I | F | T | E | P | A | Total |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 35 | Procedural UI sound (Web Audio, no files), off by default, toggle in HUD | Reel had a sound toggle | 2 | L | 6 | 3 | 3 | 5 | 5 | 5 | 4 | 25 |
| 36 | Holo scan reveals data labels on the portrait (cheekbone, hairline tags) | Visual only, can read as gimmick | 3 | M | 6 | 3 | 2 | 3 | 4 | 5 | 3 | 20 |
| 37 | Section "transmission" transitions: each section enters with a one-line signal header and checksum | Dossier feel | 3 | L | 6 | 3 | 4 | 4 | 4 | 5 | 4 | 24 |
| 38 | Night ops mode: console "ops" dims to a red operations theme | Fun toggle | 2 | L | 5 | 3 | 2 | 5 | 5 | 5 | 4 | 24 |
| 39 | Boot reads real build data (layer count, seat count, fingerprint, scorecard) instead of fixed lines | Honest boot, receipts in the opening shot | 1 | L | 6 | 3 | 5 | 5 | 5 | 5 | 5 | 28 |

### Recruiter and investor utility

| # | Feature | Why it fits Jesun | Hrs | Risk | Wow | I | F | T | E | P | A | Total |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 40 | "Brief me in 60 seconds" mode: the fleet auto-tours only the 6 key facts with voice-free captions | Busy executives | 4 | M | 8 | 5 | 4 | 5 | 4 | 4 | 4 | 26 |
| 41 | Role lens: pick Investor, Partner or Engineer and the page reorders and highlights matching records | Executive positioning | 4 | M | 7 | 4 | 4 | 5 | 4 | 5 | 4 | 26 |
| 42 | One-page brief export: generate a printable fact sheet from the data file | Download blocked in artifact; fine on live site | 3 | M | 5 | 3 | 4 | 5 | 4 | 5 | 4 | 25 |
| 43 | Proof graph: interactive graph linking claims to sources (DOI, repo, resume) | Receipts as a network, matches hero | 5 | M | 8 | 4 | 5 | 5 | 3 | 4 | 4 | 25 |
| 44 | Compare mode for ventures: side by side titles, what, status | Thin data today | 2 | L | 3 | 2 | 3 | 5 | 5 | 5 | 5 | 25 |

## Top 10 (ranked by total, ties broken by wow)

| Rank | # | Feature | Total | Wow |
| --- | --- | --- | --- | --- |
| 1 | 29 + 31 | Build provenance and health badge (merged) | 29 | 7 |
| 2 | 12 + 21 + 22 | Retrieval twin with citations, streamed answer, follow-ups (merged) | 28 | 9 |
| 3 | 11 | Semantic site search in the palette | 28 | 8 |
| 4 | 26 | Live ship log | 28 | 7 |
| 5 | 39 | Boot reads real build data | 28 | 6 |
| 6 | 17 | Anomaly flags in the local analysis demo | 28 | 6 |
| 7 | 3 | Explain mode: click an element, its agent explains | 27 | 9 |
| 8 | 1 | Agent patrol with receipts | 26 | 9 |
| 9 | 13 | Drawing pad with PulseKey-style metrics | 26 | 9 |
| 10 | 9 | Chaos drill: seat fails, foreman reassigns | 25 | 8 |

Rejected on the hard rules: 25 (WebLLM, fails 2 MB), 19 (hand tracking, 8 MB and camera), 15 (camera blocked in preview, privacy). 28 cut on privacy perception.

## Build-ready specs

### 1. Build provenance and health badge

- Where: scripts/build.mjs writes dist/build.json; new page /build/ in build.mjs; badge in the fleet dock (scifi.js consoleAndDock).
- Data: fingerprint, build date, page count, layer count (count of data-layer in the home HTML), lint.json totals, api test pass count (CI writes build-log/test.json), scorecard totals, budgets (JS and CSS bytes).
- UI: dock gains a second chip "BUILD OK 0 errors / 7 tests". /build/ shows a table: measure, value, source file. Console command "build-info" prints the same.
- Interaction: click the chip to open /build/.
- Failure: if build.json is missing or a value is absent, show "not recorded", never a guess.
- Reduced motion: static.
- Acceptance: build.json exists after npm run build; every value matches lint.json and qa files; /build/ passes lint; dock text equals build.json values; no em dash.

### 2. Retrieval twin with citations

- Where: build.mjs emits dist/index/passages.json (chunked data file, FAQ, journey, projects, publications, recommendations, journal). New src/scripts/retrieve.js (BM25, about 2 KB). lab.js twin uses it.
- Data: passages {id, text, source label, url}. Target under 120 KB.
- UI: answer types out over 400 to 900 ms; below it "Retrieved 3 passages" with source chips linking to the page and anchor; 2 follow-up chips built from the next best passages' titles.
- Interaction: Enter to ask; chips ask; answer link copies #ask-slug.
- Honesty: the twin never generates text. It shows the top passage verbatim plus a one-line lead ("From the record:"). Label stays "rule-based retrieval, not a live model".
- Failure: if passages.json fails to load, fall back to the current keyword table and say so in a dim line. Score under threshold: "Not on the record" plus contact link.
- Reduced motion: no typing effect, full answer at once.
- Acceptance: 20 test questions in tests/twin.test.mjs (for example "What did he publish", "Is he on Medium", "Who is Adam Sayani") return a passage whose source contains the expected fact; nothing returned for "What is his salary"; bundle growth under 140 KB; no banned names in passages.json (lint).

### 3. Semantic site search in the palette

- Where: palette.js uses retrieve.js and passages.json.
- UI: typing 3 or more characters shows a "Records" group under the commands, top 6 passages with page label and a 90-character excerpt, matched terms in Signal Red.
- Interaction: arrow keys, Enter opens url#anchor. Works on every page.
- Failure: commands still work if the index is missing.
- Acceptance: "wavelet" returns the paper entry first; "KPMG" returns journey and resume; keyboard-only flow passes; under 30 ms per query on 1,000 passages (unit benchmark).

### 4. Live ship log

- Where: functions/api/stats.js gains recent public events (6, deduped by repo), same 6 h edge cache. Home dossier strip and /now/ show them. Build-time copy from scripts/github-stats.mjs is the fallback.
- UI: "Shipped" list: repo, verb, relative date, link.
- Failure: API down shows the build-time list with "as of DATE"; nothing renders if both are empty.
- Privacy: public data only, no tokens in the browser.
- Acceptance: handler unit test with a mocked GitHub response; fallback renders with API offline (preview); dates are real ISO values.

### 5. Boot reads real build data

- Where: home.js matrixBoot lines.
- Data: S.layers.length, seat count from data, window.__FP, scorecard and lint totals from build.json (feature 1).
- Lines: "> jesun --boot", "registry: 182 layers", "fleet: 36 seats, foreman online", "lint: 0 errors / tests: 7 passed", "build 227b18bc signed".
- Failure: any missing value prints "unrecorded".
- Acceptance: every number in the boot box equals the DOM count or build.json (QA script compares).

### 6. Anomaly flags in the local analysis demo

- Where: demos.js csv().
- Logic: per numeric column, z-score above 3 and IQR outliers (1.5 x IQR); per text column, near-duplicate values by lowercase trim ("Ontario" vs "ontario"). Empty cells counted.
- UI: a "Flags" column and a list "Row 5: returns 40 is above Q3 + 1.5 IQR".
- Acceptance: the shipped sample flags the empty Quebec value and nothing invented; a test CSV with a planted outlier is flagged; no network requests (existing counter stays 0).

### 7. Explain mode

- Where: home.js keeps a map element -> {agent name, colour, type, layer name, data source} filled during the build (and filled deterministically by seat rotation when the build is skipped).
- UI: console "explain" or a dock toggle turns it on. Hover outlines any data-layer element; click shows a chip: "Placed by Atlas. Source: data.projects[0].summary (live site case study)."
- Data source: data-src attribute added in home.mjs to every layer that renders data (field path plus the record's source field).
- Failure: elements without data-src show "Layout element, no claim".
- Reduced motion: chip appears without animation.
- Accessibility: chip is a focusable button target; Esc closes; works by keyboard with Tab plus Enter while mode is on.
- Acceptance: every element showing a number has a data-src (lint check); toggling off removes all listeners.

### 8. Agent patrol with receipts

- Where: home.js after end(true); 3 seats.
- Behaviour: every 9 to 14 s, while the hero or dossier is visible and the tab is visible, one seat flies to a stat, shows a chip with the source text for 3 s, then parks at the dock.
- Off switches: console "patrol off", any user scroll pauses it, the build replay cancels it, reduced motion never starts it, mobile never starts it.
- Acceptance: no patrol during the build; chips show only stats.source strings; CPU idle when the tab is hidden (rAF stopped).

### 9. Drawing pad with PulseKey-style metrics

- Where: lab page, new panel in demos.js; link from the PulseKey project page.
- Logic: pointer events with timestamps and pressure; metrics: path length, mean speed, speed variance, pause count (gaps over 150 ms), jitter (mean angular change), pressure mean and range (or "not reported by this device").
- UI: canvas, Clear button, metrics table, and a fixed label: "Signal features only. This is not a health measurement."
- Privacy: nothing stored or sent.
- Failure: mouse gives no pressure; the table says so.
- Reduced motion: no stroke trail animation; metrics still compute.
- Acceptance: a scripted stroke in QA produces stable values; no network requests; label present.

### 10. Chaos drill

- Where: home.js; console command "chaos" during a build, or a HUD button "Fail a seat".
- Behaviour: one busy seat turns grey, its selection box flashes red, the feed logs "Forge lost. Foreman reassigned work/prism to Nova.", the task restarts with another seat, the build still finishes with the full count.
- Acceptance: after chaos the final layer count equals the registry total; no stuck hidden layer (QA hiddenAfter = 0); works at 1x, 2x, 4x.

## Notes for the lead

- Features 2, 3 and 5 share one index built at build time. Build it once.
- Feature 1 feeds 5 and 10. Do it first.
- Every new text string must pass the existing lint (em dash, banned names, hype words).
