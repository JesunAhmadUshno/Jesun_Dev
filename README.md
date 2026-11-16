# jesunahmadushno.com

The personal site of Jesun Ahmad Ushno, software engineer and founder in Toronto.

## Layout

| Path | What it is |
| --- | --- |
| `/` (repository root) | The built site. GitHub Pages serves this folder as it is, with `CNAME` and `.nojekyll`. |
| `source/` | Everything the site is built from: templates, scripts, styles, data, tests. |
| `source/functions/` | Cloudflare Pages Functions (contact, guestbook, Cortex live model). They run only on Cloudflare Pages, not on GitHub Pages; on GitHub Pages the site falls back to its on-device features. |
| Older files at the root | Files from the first version of the site, kept so every old link keeps working. |

## Update the site

```
cd source
npm install
npm run publish     # build, lint, test, then copy the build to the root
git add -A && git commit -m "Update site" && git push
```

GitHub Pages picks up the push within a minute or two.

## Rules the build enforces

- Every number traces to a source in `source/src/data/`.
- No em dash anywhere in the copy.
- No secret in this repository. API keys are set as Cloudflare secrets, never committed.

## Licence

All rights reserved. See `LICENSE` and `NOTICE`.
