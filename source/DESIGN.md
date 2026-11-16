# DESIGN.md: jesunahmadushno.com

The source of truth for how the site looks. Add a token here first, then use it in CSS.
Token files: `src/styles/tokens.css` (shared), the `:root` block of `src/styles/home.css` (home) and of `src/styles/site.css` (inner pages).

## Colors

| Token (home / inner) | Value | Role |
| --- | --- | --- |
| `--bg` / `--ink` | #05060A | Page background |
| `--panel` / `--ink-2` | #0B0D14 | Raised surface: cards, forms |
| `--panel2` / `--ink-3` | #10131C | Second surface |
| `--line` / `--rule` | #1A1D28 | Hairline borders |
| `--line2` / `--rule-2` | #262A38 | Stronger borders, inputs |
| `--fg` / `--paper` | #F4F4F2 | Main text |
| `--muted` / `--paper-2`, `--dim` | #9BA0AE | Secondary text |
| `--dim` / `--faint` | #6E7384 | Tertiary text, only at 12px and up |
| `--a1` | #E8323F | Gradient start |
| `--a2` | #FF5964 | Gradient end |
| `--accent` / `--signal` | #FF4655 | The one brand accent: links, focus, live marks |
| `--grad` | 100deg #E8323F to #FF5964 | Display words, primary buttons |
| `--ok` | #3DDC84 | Online, passed, released, terminal text |
| `--info` | #4D7CFE | Functional rung, Tic-tac-toe, selection |
| `--warn` | #F5A524 | Proposed rung, Connect Four machine disc |
| `--violet` | #B07CFF | Evaluated rung |
| `--glitch-a`, `--glitch-b` | #FF2D55, #22D3EE | Heading glitch split only |

Verdict ladder colors (`src/styles/studies.css`): Draft #8A90A2, Proposed `--warn`, Functional `--info`, Evaluated `--violet`, v1.0 Released `--ok`.

Canvas drawings in JavaScript (network, swarm, wave scan, card art) cannot read CSS variables cheaply, so they use the same hex values as literals. Keep them in step with this table.

## Type

| Role | Family | Use |
| --- | --- | --- |
| Display | Anton 400, uppercase | Headings, giant word, big numbers, game names |
| Body | Manrope 400 to 800 | Paragraphs, buttons, nav |
| Data | IBM Plex Mono 400 to 700 | Labels, code, scores, small meta |
| Signature | Caveat 700 | The signature and the hero greeting only |

Fonts are self-hosted from `src/fonts` (Latin subset, SIL Open Font License). No third-party font requests.

Scale: section heading `clamp(44px, 7.2vw, 104px)`, card heading 24 to 32px, body 15 to 17px, labels 10 to 12px with 0.08 to 0.16em letter spacing.

## Spacing, radius, motion

- Side gutter: at least 16px, with safe-area insets. Content width: 1320px.
- Section padding: `clamp(72px, 10vw, 140px)` top and bottom.
- Gaps: 8, 12, 16, 20, 28px inside components; `clamp(28px, 4vw, 56px)` between columns.
- Radius: `--r-sm` 6px inputs, `--r-md` 10px cards, `--r-lg` 14px feature panels, `--r-pill` buttons and chips.
- Easing: `--ease-out` for anything entering or answering a click, `--ease-in-out` for things moving on screen. Animate transform and opacity only.
- Motion budget: the agent build is the one big moment. Section entrances run only on visits without the build. Every animation has a reduced-motion off switch (`prefers-reduced-motion` and the `.rm` class from the footer toggle).

## Breakpoints

1000px (contact stacks), 900px (two-column sections stack), 860px (research spine stacks), 600px (form rows stack), 420px (small labels shrink).

## Components

Buttons (`.btn`, `.btn.ghost`), chips (`.chip`), cards (`.card`), study card (`.study`), ladder (`.ladder`), judge panel (`.judge`), signature seal (`.quote`), game tabs (`.gtab`), lab tiles (`.ltile`), shipped list (`.ship`). Reuse these before making a new one.

## Rules that never bend

No em dash anywhere. Neither of the two retired product names appears (the lint in `scripts/lint.mjs` holds the list). Every number has a source in `src/data`.
