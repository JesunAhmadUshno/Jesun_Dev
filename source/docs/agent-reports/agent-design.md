# Design audit: Jesun portfolio home (agent: DESIGN, UX and UI)

Scope: home page only (src/templates/home.mjs, src/styles/home.css, dist/index.html). Read-only audit, no project files edited.

Method: dist copied to scratchpad/design-dist, served on port 8201, build animation skipped (localStorage jesun.boot=1). Rendered with Chrome at 1920x1200, 1440x900, 1280x720, 768x1024, 390x844, full page plus hero. Probes: element boxes, overflow, keyboard tab order, computed contrast, select widths, collision checks.

Render note: Google Fonts were blocked in this environment, so Anton fell back to Arial in the captures. The owner's own screenshot shows Anton loaded. Typography is graded on the Anton version. The fallback itself is graded as a robustness gap (2.10).

Screenshots (scratchpad folder):
- design-hero-1920.png, design-hero-1440.png, design-hero-390.png
- design-recognition-collision.png
- design-contact-truncation.png
- design-journey-empty-column.png
- Full set: scratchpad/dshots/ (hero-*.png, full-*.png, s1440-*.png, s390-*.png, focus-1440.png, card-hover.png, info.json)

## Score summary

| # | Dimension | Score |
| --- | --- | --- |
| 1 | Composition and hierarchy | 52 / 100 |
| 2 | Typography | 64 / 100 |
| 3 | Color and contrast | 63 / 100 |
| 4 | Imagery and the portrait | 60 / 100 |
| 5 | Motion design | 61 / 100 |
| 6 | Interaction feedback | 70 / 100 |
| 7 | Navigation and wayfinding | 62 / 100 |
| 8 | Responsive behaviour | 66 / 100 |
| 9 | Accessibility | 68 / 100 |
| 10 | Polish and consistency | 55 / 100 |
| | Total | 621 / 1000 |

## 1. Composition and hierarchy (52)

| Criterion | Score | Evidence | Fix |
| --- | --- | --- | --- |
| 1.1 Hero has one dominant focal point | 6 | hero-1440: word, portrait, name and rail all compete at similar weight | Make the portrait the anchor (see 4.1); keep the word behind at 0.9 opacity |
| 1.2 Portrait overlaps the backdrop word | 4 | info.json 1920: word y 158 to 439, portrait top y 538. No overlap at all at 1920. 1440: 70 px overlap only | .hero-mid{position:absolute;left:50%;bottom:0;transform:translateX(-50%);height:min(86svh,1080px);z-index:3} and .portrait.holo img{height:100%;width:auto} |
| 1.3 Left and right columns balanced | 6 | hero-1920: name at x 341, rail at x 1369, big empty bands outside the 1320 wrap | Widen hero wrap: .hero .wrap{max-width:1600px} |
| 1.4 Section rhythm varies | 4 | s1440-1/2/3: nine sections share one template: eyebrow, two-line headline, content | Vary: give Ventures, Lab and Testimony a different opening (full-bleed visual, no eyebrow) |
| 1.5 Content is not repeated | 3 | Stats appear twice in a row (hero rail and dossier receipts). MSc with Distinction appears 6 times (rail, dossier, recognition big word, recognition row, about edu, journey entry, milestones) | Remove .receipts grid from the dossier; replace with one sources line. Remove "MSc with Distinction" from milestones |
| 1.6 White space is intentional | 5 | s1440-3: Lab section is a giant headline plus 4 lines of text and 700 px of empty right side | Put a live visual in .labx right column (PSO canvas or a terminal loop) |
| 1.7 Journey columns use the height | 5 | design-journey-empty-column: milestones end at 30 percent of the section, 900 px blank below | .jour>.col{position:sticky;top:96px;align-self:start} |
| 1.8 Grid alignment across sections | 7 | Left edges align on the 40 px gutter at all widths | Keep |
| 1.9 Clear primary action | 6 | "See my work" button is small (40 px tall) and sits at the fold edge at 1440 | .hero .btn{padding:16px 26px;font-size:13px}; move the location line under the credo |
| 1.10 Dossier strip earns its place | 6 | It holds the canonical bio, which SEO needs, but reads as a second hero | Shrink to one line plus a "Read the record" link, or merge into the About section |

## 2. Typography (64)

| Criterion | Score | Evidence | Fix |
| --- | --- | --- | --- |
| 2.1 Display face has character | 8 | Owner screenshot: Anton reads as poster type, right for the reel grammar | Keep |
| 2.2 Type scale is consistent | 6 | info.json h2 sizes: 104, 104 ... 60 (milestones), 75 to 84 (contact). Two outliers | Define --h2:clamp(44px,7vw,104px) and --h3:clamp(32px,4vw,60px); use only these |
| 2.3 Headline treatment not formulaic | 3 | Nine headlines all end "white line, red line." This is the most common generated-page tell | Keep the red second line only in Hero, Work and Contact. Others: one colour with a red full stop |
| 2.4 Body line length | 8 | Credo and proof text under 60 characters | Keep |
| 2.5 Role line wraps cleanly | 5 | hero-1440: "SOFTWARE ENGINEER / & / FOUNDER" orphaned ampersand at 1440 and 1920 | .role{max-width:none} and use "Software engineer<br>and founder" |
| 2.6 Small text legible | 4 | 76 leaf elements under 11 px on desktop. Holo tags 9.5 px, receipts small 10 px, scroll cue 10 px | Minimum 11 px: .holo-tag,.receipts small,.scrollcue,.stat .src{font-size:11px} |
| 2.7 Script face used sparingly | 8 | Caveat only on "Hello, I'm" and the quote signature | Keep |
| 2.8 Mono used with purpose | 6 | Mono is on every eyebrow, label, tag, chip and readout. It stops meaning "data" | Keep mono for readouts and the console; set eyebrows in Manrope 600 |
| 2.9 Card titles hold their weight | 6 | card-hover.png: 40 px red numeral beside an 18 px title. The numeral wins | .card-title{font-size:22px}; .card-num{font-size:32px;opacity:.85} |
| 2.10 Fallback is safe | 10 | Anton loads in production (owner screenshot). The Arial fallback risk is booked once, in 8.4 | Self-host Anton woff2 (OFL) in /fonts |

## 3. Color and contrast (63)

| Criterion | Score | Evidence | Fix |
| --- | --- | --- | --- |
| 3.1 Palette discipline | 6 | Red, blue, green, yellow, purple, pink, cyan all appear in the hero network plus tags | Hero network: red and paper only, plus at most one cool accent (#4D7CFE). Keep the multicolour palette for the agent cursors only |
| 3.2 Accent used for meaning | 5 | Red marks headline lines, numerals, years, buttons, tags, icons, rail, laurels. Too many jobs | Reserve red for action and the single key fact per section |
| 3.3 Muted text contrast | 4 | Computed: --dim #6E7384 on #05060A = 4.29:1 (receipts small, .wm, .cap, .scrollcue, testimony small). Fails WCAG AA 4.5 | :root{--dim:#8A8FA0} gives about 6.1:1 |
| 3.4 Eyebrow contrast | 9 | .eyebrow 7.75:1 | Keep |
| 3.5 Red text on dark | 7 | #FF4655 on #05060A about 5.4:1, fine for large text | Keep red off body-size text |
| 3.6 Gradient use | 6 | Gradient on buttons, headline words, quote card and reel card | Keep it on buttons and the quote card only |
| 3.7 Dark ground depth | 7 | Ground #05060A with panel #0B0D14 gives two levels | Add a third level only for the console |
| 3.8 Status colours consistent | 6 | Green means "online" on tags and dock, but chips and HUD use blue (#4D7CFE) for selected states | Use blue only for selection, green only for live status |
| 3.9 Images sit on the palette | 7 | Portrait rim light red and blue matches | Keep |
| 3.10 Glow is controlled | 6 | Portrait has three drop shadows plus scan glow plus ring | Drop one drop-shadow layer |

## 4. Imagery and the portrait (60)

| Criterion | Score | Evidence | Fix |
| --- | --- | --- | --- |
| 4.1 Portrait size matches its role | 4 | Owner feedback plus info.json: 560 x 710 at 1440, 560 x 760 at 1920. It is a supporting image, not the subject | Height min(86svh,1080px), absolute and centered (see 1.2) |
| 4.2 Cut-out edge quality | 6 | Black coat cut-out clean; shoulders end in a hard horizontal line in hero-1920 | Radial mask: .portrait.holo img{mask-image:radial-gradient(ellipse 62% 78% at 50% 36%,#000 62%,transparent 100%)} |
| 4.3 Frame elements scale with the photo | 5 | Ring is 118 percent of the box; when the photo grows the ring will dominate | Size the ring to the head: .holo-ring{width:64%;top:-4%} |
| 4.4 Data tags readable and placed | 6 | t1 and t3 sit on the coat; t2 crosses the right shoulder; 9.5 px | 11 px, and pin tags to the frame edge, not the body |
| 4.5 Card art is unique per project | 8 | s1440-0: nine distinct generative patterns | Keep |
| 4.6 Card art does not fight the text | 5 | s390-1: code lines run through the wave lines | .card .art .code{background:rgba(5,6,10,.7);padding:6px 8px;border-radius:4px} |
| 4.7 Before and after reads at a glance | 7 | proof.png: both images load; old green site vs new red site | Add a 2 second auto sweep when it enters view |
| 4.8 Photo variety on the page | 5 | Only one photo on the home page; graduation and sweater cut-outs unused here | Use the graduation cut-out in the Journey section beside the 2026 entry |
| 4.9 Avatar use | 7 | Avatar is the foreman cursor and the twin face | Show it in the dock as well |
| 4.10 Image weight | 7 | Portrait 820 webp about 40 KB | Add an 1100 w source for the bigger hero |

## 5. Motion design (61)

| Criterion | Score | Evidence | Fix |
| --- | --- | --- | --- |
| 5.1 One signature moment | 8 | Matrix boot, then the swarm build | Keep |
| 5.2 Ambient motion volume | 4 | At rest the hero runs: network drift, two rotating rings, scan beam, word decode, name glitch every 7 s, blinking status dot, blinking dock dot | Stop the scan after 3 passes; glitch only on hover; one blinking element |
| 5.3 Motion answers the user | 7 | Network reacts to pointer and click shockwave; card art on hover | Keep |
| 5.4 Reduced motion respected | 9 | QA: reducedArmed false, 0 hidden layers | Keep |
| 5.5 Scroll reveals | 5 | Heading decode on enter is good; nothing else in a section responds to scroll | Count-up on the receipts and a draw-in for the journey line |
| 5.6 Easing quality | 7 | Cubic and quad curves throughout | Keep |
| 5.7 Word cycle is legible | 6 | 1 s scramble every 5.2 s; reads as noise while the user reads the name | Slow to every 9 s and only when the pointer is still |
| 5.8 Build pacing | 6 | 49 s; long for a returning visitor even with skip | Speed select default 2x after first visit |
| 5.9 Cursor motion during build | 4 | Owner report: cursors look stuck when the camera scrolls (idle agents stay at fixed viewport positions) | Lead is fixing: steer idle agents to the active batch and shift them by scroll delta |
| 5.10 Exit of the build | 5 | Agents dock and the HUD stays; no clear hand-off to the page | Fade HUD after 6 s and pulse the "See my work" button once |

## 6. Interaction feedback (70)

| Criterion | Score | Evidence | Fix |
| --- | --- | --- | --- |
| 6.1 Hover states on all controls | 7 | Buttons, chips, cards, links change | Add pressed state: .btn:active{transform:translateY(1px)} |
| 6.2 Focus visible | 9 | Tab order probe: every stop shows a 2 px solid outline | Keep |
| 6.3 Filter chips | 7 | aria-pressed toggles | Show a count per chip ("Agents 1") |
| 6.4 Search feedback | 6 | Empty state text exists; no live count | Add "3 of 9" beside the search |
| 6.5 Form validation | 7 | Status text on invalid input | Mark the invalid field: [aria-invalid="true"]{border-color:#FF4655} |
| 6.6 Copy action | 7 | Button text flips to Copied | Keep |
| 6.7 Console | 8 | Backtick opens, Esc closes, commands answer | Show a one-line hint "Press ` for the console" in the footer |
| 6.8 Slider affordance | 7 | Handle is clear; keyboard works | Add aria-valuetext "55 percent new site" |
| 6.9 Custom cursor | 6 | Crosshair locks on links; hides the system cursor | Keep the system cursor on text areas and the console |
| 6.10 Button labels | 6 | "See my work", "Send the brief", "Enter the Lab", "See the fleet" | Fine; drop the arrow icon from text buttons that are not links out |

## 7. Navigation and wayfinding (62)

| Criterion | Score | Evidence | Fix |
| --- | --- | --- | --- |
| 7.1 Header fits at all widths | 4 | Owner screenshot: "Let's talk" breaks into a vertical "L T" at the right edge | .talk{white-space:nowrap}; @media(max-width:1600px){.head-right .soc{display:none}}; .nav{gap:clamp(14px,1.6vw,28px)} |
| 7.2 Section index is consistent | 3 | Rail says 02 Work, 03 Ventures; eyebrows say 01 Selected work, 02 Ventures. Off by one everywhere | Use one numbering. Best: drop numbers from eyebrows; the rail is the index |
| 7.3 Current section shown | 7 | Rail highlights the active section | Also highlight the header link (scrollspy) |
| 7.4 Anchor jumps smooth | 6 | Native jump, no offset for the 72 px header on some anchors | html{scroll-padding-top:84px} on home.css too |
| 7.5 Way back to top | 6 | Footer logo only | Add a "Top" item to the rail |
| 7.6 Mobile menu | 5 | Nav hidden under 960 px; no menu button on home | Add the same Menu button the inner pages use |
| 7.7 Deep pages reachable | 8 | Lab, Writing, Journey links plus palette | Keep |
| 7.8 Palette discoverable | 6 | "Ctrl K" chip, shows Ctrl on Mac until JS swaps | Fine |
| 7.9 External links marked | 7 | GitHub and LinkedIn open in new tabs | Keep |
| 7.10 Footer as map | 10 | Four clear columns | Keep |

## 8. Responsive behaviour (66)

| Criterion | Score | Evidence | Fix |
| --- | --- | --- | --- |
| 8.1 No horizontal scroll | 7 | 0 px at 768 to 1920; 2 px at 390 (giant span 430 px wide) | .hero{overflow:hidden} already; add .giant-wrap{overflow:hidden;max-width:100vw} |
| 8.2 Hero at 390 | 7 | design-hero-390: stack order name, CTA, portrait, stats works | Reduce network opacity behind text on mobile |
| 8.3 Hero at 768 | 6 | Portrait 360 px centered, lots of empty space either side | Portrait width min(100%,460px) at 600 to 900 |
| 8.4 Giant word fits | 5 | With fallback font it clips at 390, 1280 and 1440 | Fit-to-width script (measure scrollWidth, set font-size) |
| 8.5 Work grid steps | 8 | 3, 2, 1 columns | Keep |
| 8.6 Forms on small screens | 7 | Fields stack under 600 px | Keep |
| 8.7 Contact selects at desktop | 4 | design-contact-truncation: "Venture partne", "Prefer to discu" cut | .bform .r3{grid-template-columns:1fr 1fr} plus timeline full width, or shorter option labels |
| 8.8 Large screens | 6 | 1920: content capped at 1320; hero feels small | Hero wrap 1600, section wraps 1440 |
| 8.9 Touch targets | 8 | Chips 32 px, buttons 40 px plus | Chips to 36 px tall |
| 8.10 Fixed UI on mobile | 8 | Dock hidden in hero; rail hidden under 1100 | Keep |

## 9. Accessibility (68)

| Criterion | Score | Evidence | Fix |
| --- | --- | --- | --- |
| 9.1 Skip link | 9 | First tab stop | Keep |
| 9.2 Contrast AA | 4 | --dim 4.29:1 fails on small text (see 3.3) | --dim:#8A8FA0 |
| 9.3 Minimum text size | 5 | 9.5 to 10.5 px text in tags, receipts, sources | 11 px minimum |
| 9.4 Decorative layers hidden | 9 | Canvas, ring, tags, rulers aria-hidden | Keep |
| 9.5 Dynamic text safe for readers | 5 | Heading decode and word cycle rewrite text nodes; a screen reader can read scrambled glyphs | Put aria-label with the real text on each .h2 and .giant-wrap aria-hidden (already); wrap scrambled text in aria-hidden spans |
| 9.6 Dialog semantics | 8 | Console role dialog, Esc closes, focus returns | Trap Tab inside the console while open |
| 9.7 Landmarks | 8 | header, nav, main, footer, aside | Keep |
| 9.8 Form labels | 8 | Every field labelled | Keep |
| 9.9 Motion opt-out | 9 | prefers-reduced-motion honoured | Add a visible "Reduce motion" toggle in the footer |
| 9.10 Cursor replacement | 3 | cursor:none on all links and buttons on desktop | Keep the system pointer visible under the crosshair (cursor:crosshair) |

## 10. Polish and consistency (55)

| Criterion | Score | Evidence | Fix |
| --- | --- | --- | --- |
| 10.1 No collisions | 3 | design-recognition-collision: right laurel ends at x 729, "Selected recognition" label starts at x 707. 22 px overlap | .big .w{font-size:clamp(40px,4.8vw,80px)} and .rec{gap:clamp(48px,7vw,120px)} |
| 10.2 Eyebrow casing | 5 | "Recognition & Credentials" title case; others sentence case | One case rule |
| 10.3 Icon set consistent | 5 | LinkedIn, YouTube and about.me share the same person icon | Distinct glyphs or text initials (in, yt, me) |
| 10.4 Line endings | 6 | Every headline ends in a red full stop, including "words." and "signal." | Keep it as a signature, but remove it from eyebrows and buttons |
| 10.5 Copy repetition | 4 | "Every system, a receipt." plus "Every claim carries a receipt" plus "Every line here has a document" plus "receipts" in the console | Use the receipt idea once in the hero and once in the dossier |
| 10.6 Client strip edges | 5 | "MI" cut mid-word at the strip edge | .strip{mask-image:linear-gradient(90deg,transparent,#000 6%,#000 94%,transparent)} plus a slow marquee |
| 10.7 Footer details | 6 | A small orphan "JESUN." under the coordinates | Remove it or set it at display size |
| 10.8 Ventures depth | 5 | Three short lines, no link, no status, no visual | Larger panels with role, what it does, and a "Visit" slot that shows only when ventures[].url exists |
| 10.9 Section end states | 6 | Lab and Contact end in open space | Close each with one action |
| 10.10 Build signature visible | 10 | Build id in footer and dock | Keep |

## Top 15 fixes, ranked by visual impact per hour

1. Hero portrait as the anchor (owner request). .hero-mid{position:absolute;left:50%;bottom:0;transform:translateX(-50%);height:min(86svh,1080px);z-index:3;width:auto} .portrait.holo{height:100%} .portrait.holo img{height:100%;width:auto;mask-image:radial-gradient(ellipse 62% 78% at 50% 36%,#000 62%,transparent 100%)} .hero-left,.rail{position:relative;z-index:4}. Head then overlaps the lower half of PORTFOLIO at every desktop width.
2. Resize the holo frame to the new photo. .holo-ring{width:64%;top:-4%} .brk.tl,.brk.bl{left:14%} .brk.tr,.brk.br{right:14%} .brk.bl,.brk.br{bottom:30%}; tags at 11 px pinned to bracket corners.
3. Fit PORTFOLIO to the hero width. Self-host Anton (OFL) as /fonts/Anton.woff2; add a small script that sets .giant font-size so scrollWidth equals 96 percent of the hero width, rerun on resize and after each word decode.
4. Header never breaks. .talk{white-space:nowrap} .nav{gap:clamp(14px,1.6vw,28px)} @media(max-width:1600px){.head-right .soc{display:none}} @media(max-width:960px){add the Menu button and drawer}.
5. Contrast and size floor. :root{--dim:#8A8FA0}; .holo-tag,.receipts small,.scrollcue,.stat .src,.tq small,.cap{font-size:11px}.
6. Fix the recognition collision. .big .w{font-size:clamp(40px,4.8vw,80px)} .rec{gap:clamp(48px,7vw,120px)}.
7. One section index. Remove the "01 / " to "09 / " prefixes from section eyebrows in home.mjs; the right rail stays the only numbered index.
8. Stop repeating stats. Delete the .receipts grid in the dossier; under the canonical paragraph add one line "Sources: GitHub, AIP DOIs, resume, UNF" with links; show .stat .src as a 1-line tooltip on hover.
9. Break the headline formula. Keep white plus red lines for Hero, Work, Contact. Change Ventures, Recognition, Systems, Journey, Testimony, Lab to one colour with a red full stop only.
10. Sticky milestones in Journey. .jour>.col{position:sticky;top:96px;align-self:start}; add the graduation cut-out under the milestones.
11. Give the Lab section a live visual. Right column: a 16:10 canvas running the PSO demo in a loop (import from demos.js) with a "Run it in the Lab" link.
12. Calm the hero at rest. Scan beam runs 3 passes then stops; name glitch only on hover; word cycle every 9 s; one blinking element (the status dot).
13. Contact selects readable. .bform .r3{grid-template-columns:1fr 1fr} .bform .r3 label:last-child{grid-column:1/-1}, or shorter labels (Venture, Advisory, Engineering, Research, Speaking, Other).
14. Client strip polish. .strip{mask-image:linear-gradient(90deg,transparent,#000 6%,#000 94%,transparent)} plus a 40 s linear marquee (paused on hover and under reduced motion).
15. Safer cursor and readable decode. Replace cursor:none with cursor:crosshair; add aria-label with the final text to each .h2 before decoding.

Out of scope, noted: the owner's stuck-cursor report (5.9) is an engine fix the lead is doing; a 2 px mobile overflow comes from .giant at 390 px.
