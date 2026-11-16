# jesunahmadushno.com, version 2

The site of Jesun Ahmad Ushno. All rights reserved (see LICENSE).

## Run it

```bash
npm install          # esbuild, marked, sharp, puppeteer
npm run build        # dist/ from src/data/jesun.json and src/content
npm run lint         # hard gates: em dash, banned names, links, alt, meta, JSON-LD, budgets
npm run score        # writes SEO-AEO-GEO-SCORECARD.md
npm run serve        # http://localhost:8080
```

Optional: `npm run fresh` (GitHub stats), `npm run screens` (before/after shots and resume PDF; needs Chrome), `node scripts/qa.mjs` (visual and behaviour QA), `npm run images` (photo derivatives from private-originals/, which is never committed).

## Add a project in under two minutes

Add one object to `projects` in `src/data/jesun.json`:

```json
{ "slug": "new-thing", "name": "New Thing", "cat": "agents", "catLabel": "Agents", "year": "2026",
  "summary": "One sentence.", "body": "One paragraph.", "stack": ["Python"],
  "repo": "https://github.com/JesunAhmadUshno/new-thing", "demo": "", "source": "where this fact comes from", "featured": false }
```

Build. The card, the page at /projects/new-thing.html, the sitemap entry, the OG image and the JSON-LD all appear.

## Add a post or journal entry

Copy `src/content/writing/_template.md` to `src/content/writing/2026-12-01-title.md` (or `journal/`). Fill the front matter. Build. Index, RSS, sitemap, OG image and Article data generate themselves. The lint fails the build on an em dash, a hype word, or numbers without a `sources:` line.

## Files

| File | What |
| --- | --- |
| JESUN-DOSSIER.md | Research, every fact tagged |
| FUSION-PLAN.md | The plan this build follows |
| RECEIPTS.md | Every claim and every build number, with sources |
| SEO-AEO-GEO-SCORECARD.md | Generated, evidence per criterion |
| PATTERNS.md | Dated pattern registry |
| TAKEDOWN-KIT.md | DMCA kit |
| build-log/ | Fingerprints, lint and QA results |

Going live is Jesun's decision. Nothing in this repository deploys.

## Home experience (v2.1)

The home page is the Agent Portfolio design (src/templates/home.mjs, src/styles/home.css, src/scripts/home.js):

1. Red matrix rain with glitch slices and a terminal boot box.
2. A glitch cut hands over to a colourful agent swarm, linked by network lines and led by the foreman (the 3D avatar).
3. A live activity card logs every step ("Created a file", "Edited a file", "Ran a command", "Used artifacts").
4. A spiral finale; the HUD reports the measured build time.
5. A network constellation sits behind the hero, and every portrait is a cut-out with no background (scripts/cutouts.py).

## Backend (full stack, Cloudflare free tier)

| Route | What it does |
| --- | --- |
| POST /api/contact | Validates the brief, stores it in D1, forwards it to Jesun's inbox through FormSubmit. Honeypot plus 5 per hour per visitor. |
| GET, POST /api/guestbook | Lists and stores short notes. No links or markup. 3 per hour. |
| GET /api/stats | Public GitHub numbers, cached 6 hours at the edge. |
| POST /api/hits | One visit per visitor per day. No cookies, no IP stored (salted daily hash). |
| _middleware | Security headers on every response; logs hits on the /trap/ path. |

Set up once:

```bash
npx wrangler d1 create jesun        # copy the id into wrangler.toml
npx wrangler d1 execute jesun --file=schema.sql
npx wrangler pages secret put HASH_SALT
npx wrangler pages dev dist         # local full-stack run
```

Tests: `npm test` runs the handlers against a real SQLite database (7 tests).
The front end falls back cleanly when the API is offline (static hosting or preview).
