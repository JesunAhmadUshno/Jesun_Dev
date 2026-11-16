# Decision ledger

Date | Category | Decision / Update | Status
--- | --- | --- | ---
2026-11-14 | Data | Studies, verdicts and organisations sync daily from public GitHub (scripts/sync-github.mjs). Verdicts copy from the profile roadmap, never edited here. | Done
2026-11-14 | URLs | New live pages /dashboard/ and /site/ redirect to /build/, so old links keep working. | Done
2026-11-14 | Fonts | Fonts are self-hosted (Latin subset). No requests to Google Fonts. | Done
2026-11-14 | Design | DESIGN.md is the token source of truth. Shared tokens live in src/styles/tokens.css. | Done
2026-11-14 | Lab | The chess section became an arcade with four engines. Engines are pure functions in src/scripts/engines.js with tests. | Done
2026-11-14 | Motion | The agent build is the one big moment. Section entrances run only on visits without it. | Done
2026-11-14 | Ventures | "Founders HQ" not found anywhere public. Waiting for the owner to confirm what it is. | Open
2026-11-14 | Agent | Cortex, the site agent: planner, 11 page tools, retrieval over the record, voice, memory, optional free Workers AI answers capped at 600 a day. | Done
2026-11-14 | Diagrams | diagram-design skill in the site skin: "How the agent answers" on /lab/ and "How this site ships" on /build/. Both pass the skill's geometry and self checks. | Done
2026-11-14 | Art | Synaptic Weather (algorithmic-art skill): a seeded flow field on /lab/ that storms when Cortex thinks. | Done
2026-11-14 | Hosting | _routes.json limits Functions to /api and /trap; CSP, HSTS sent as headers; assets cache-busted by content hash. | Done
2026-11-15 | Ventures | Founders HQ and The InfoSec Tribune added, both Founder, both marked in build with no public link, on Jesun's instruction. | Done
2026-11-15 | Agent | Cortex shows its real working: query tokens with hit counts, candidate passages with BM25 scores, coverage, margin and a confidence call, from retrieve.js explain(). | Done
2026-11-15 | Photos | 2026 photo set added as framed strips on Journey, About and Now. Originals stay private; derivatives are watermarked. | Done
2026-11-15 | Avatar | Cortex boots as a dot field: lattice, brain, his own face, sphere, then rests on the face. The face is a point cloud sampled from front-skyline.jpg by scripts/facemap.py, with per point depth, brightness and a region tag, so the head has volume, the eyes blink and the mouth moves. The portrait cloud is a lazy chunk, not part of first paint. | Done
2026-11-15 | Avatar | The resting face tracks the pointer across the panel, looks around on its own when left alone, and dissolves to the sphere while Cortex works. Reduced motion gets a still portrait and no tracking. | Done
2026-11-15 | Model | Three tiers in /api/cortex: Gemini with live Google Search, then Workers AI on the record, then the on device brain. Separate daily caps, both free tiers. Google's search suggestions widget is passed through, scripts stripped. | Done
2026-11-15 | Keys | The Gemini key ships in functions/api/cortex.js on Jesun's explicit instruction, so the live tier works with no setup. It is server side only and never reaches a browser; a GEMINI_API_KEY secret overrides it. | Done
2026-11-15 | Leads | Cortex offers once, in plain sight, to pass a note to Jesun when a visitor sounds like they are weighing working with him. The visitor types name, email and need, and presses send. Declining retires the offer for the session. No covert collection: proposed, declined, reason recorded. | Done
2026-11-15 | Voice | Answers are written as a consultant writes: answer first, at most three more sentences, prose by default, no em dash, no emoji, no restating the question. | Done
2026-11-15 | Avatar | Face map rebuilt from the studio portrait (jesun-portrait-black-coat.jpg), replacing the dusk skyline shot. Dot density now follows the light, not the dark mass, with unsharp and an S curve applied first; 2,280 points, judged at the real stage size. | Done
2026-11-15 | Avatar | Brain redrawn as a lateral anatomy (gyral edge, Sylvian fissure, temporal lobe, cerebellum with folia, brainstem). Outline and sulcus edges are sampled as their own bright pool; the interior fills behind. Brain and lattice sway, only the sphere rotates. | Done
2026-11-15 | Voice | New speech.js: picks the best installed voice (Natural, Online, Premium, Google) instead of the system default, reads in sentence breaths at rate .96 and pitch .94, and drives the mouth from real word boundaries. Eight tests. | Done
2026-11-15 | Companion | Jesun's full body 3D avatar (seven states from the avatar pack) now stands on a hologram pad above the Cortex orb on every page. scripts/avatar-key.py keys the white studio backdrop out of every frame (border flood plus large enclosed regions, un-mixed edges, baked floor shadow dropped) and encodes VP9 with alpha, an animated WebP for WebKit, and a still per state. | Done
2026-11-15 | Companion | Behaviour: one gesture per home section on first arrival (point at the work, celebrate the recognition and the journey, think in the lab), thinks and talks with Cortex, steps aside when the panel opens, idles with small gestures of its own, turns toward the pointer and leans with the scroll. Clips load one state at a time after first paint. Reduced motion: one still, no motion. Hide control lasts the visit. The React and Framer Motion component was ported to plain JavaScript because the site has no framework. | Done
2026-11-15 | Photo | Journey graduation cutout rebuilt at full resolution from the real UNF photo: grey phone fringe keyed out, edge colours rebuilt from the interior, red halo replaced with a soft backlight, hard left and bottom crops faded. The other graduation shots were not used because they appear generated. | Done
2026-11-15 | Hero | Fixed the giant word breaking on scroll: the parallax wrote transform, which wiped the CSS translateX(-50%) centring and threw the word half its width right. It now writes the separate translate property, which stacks on the centring. | Done
2026-11-15 | Companion | Stays off stage while the hero (his real portrait) is in view, and greets with a wave as the reader scrolls in. Below 1200px wide there is no free margin, so he makes cameos: in for each gesture, out when it ends, and no unprompted idle gestures. | Done
