<div align="center">

# JESUN<span style="color: #10b981">.DEV</span>

**AI Engineering & Data Analytics Portfolio**

[![Live Demo](https://img.shields.io/badge/🌐_Live-jesunahmadushno.com-10b981?style=for-the-badge)](http://jesunahmadushno.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)
[![GitHub Stars](https://img.shields.io/github/stars/JesunAhmadUshno/Jesun_Dev?style=for-the-badge&color=purple)](https://github.com/JesunAhmadUshno/Jesun_Dev)

[Live Demo](http://jesunahmadushno.com/) • [Live dashboard](https://jesunahmadushno.com/dashboard/) • [Features](#features) • [Setup](#running-locally) • [Support](#-support)

*A static personal portfolio that runs its own programming language and its own Q&A twin entirely in the browser, in English and Bangla.*

Live dashboard: https://jesunahmadushno.com/dashboard/

---

</div>

## Overview

jesunahmadushno.com is plain static HTML, CSS and JavaScript served by GitHub Pages from this repository, with no build step and no server. The **live dashboard** at [/dashboard/](https://jesunahmadushno.com/dashboard/) runs the same files and shows what they do: a Jesun.Code playground, the twin with its per-topic scores, EN/BN string parity, a sitemap audit, and an engineering scorecard ([docs/research-review.md](docs/research-review.md)).

## Features

- **Jesun.Code playground**: the vendored interpreter (`assets/jesun/jesun.py`, its own `VERSION` is 0.6.0) runs in Pyodide 0.26.4 inside a Web Worker (`assets/js/playground.js`, `assets/js/py-worker.js`). Output comes from `jesun.execute()`, not a mock.
- **Guided twin**: rule-based keyword Q&A over `assets/js/twin-data.js` (`assets/js/twin.js`). It is not a language model and sends nothing anywhere.
- **English and Bangla**: `content-strings.json` holds matched EN/BN strings, applied by `assets/js/lang.js`; a Bangla mirror lives under `bangla/`.
- **Interactive extras**: a chess board with a minimax engine (`assets/js/chess.js`, rules from chess.js@1.0.0), a three.js hero (`assets/js/hero3d.js`), a terminal (`assets/js/terminal.js`) and live GitHub activity (`assets/js/live.js`).
- **Search metadata**: canonical links, descriptions, Open Graph, Twitter cards and JSON-LD on every page in `sitemap.xml`, plus `llms.txt`.

## Running locally

```bash
git clone https://github.com/JesunAhmadUshno/Jesun_Dev.git
cd Jesun_Dev
python3 -m http.server 8080   # then visit http://localhost:8080
```

## Checks and the dashboard

```bash
cd site
npm ci
npm run build     # extracts data, runs the twin, i18n and claims checks, then builds
npm test          # the checks alone
npm run publish   # build and copy site/dist to dashboard/ for the branch-based Pages build
```

The checks need Node 22 and Python 3. `.github/workflows/pages.yml` runs them on every push to `main`.

## Project structure

```
Jesun_Dev/
├── index.html, about.html, uses.html   # main pages
├── projects/                           # one page per project
├── roadmap/, muse-n8n-extraction-101/, knowledge-panel-service/, privacy/, terms/
├── bangla/                             # Bangla mirror
├── assets/js/                          # twin, chess, playground, i18n, motion and live widgets
├── assets/jesun/                       # vendored Jesun.Code interpreter + examples
├── content-strings.json                # EN/BN strings
├── site/                               # dashboard source (React + Vite) and its checks
├── dashboard/                          # built dashboard served at /dashboard/
├── docs/research-review.md             # engineering scorecard
└── sitemap.xml, llms.txt, robots.txt, CNAME
```

## 🔮 Featured Projects

| Project | Description | Tech |
|---------|-------------|------|
| [**PRISM**](https://github.com/JesunAhmadUshno/PRISM) | Zero-trust browser-based data analytics | Pyodide, React, WASM |
| [**NoPara**](https://github.com/JesunAhmadUshno/NoPara) | 100% private media converter | FFmpeg.wasm, React |
| [**SonicClear**](https://github.com/JesunAhmadUshno/SonicClear-AI-Studio-Grade-Audio-Enhancer) | AI audio enhancement | PyTorch, FastAPI |
| **Fabric Defect Detection** | Published research with Neural Networks | TensorFlow, CV |

## 📜 Certifications Highlight

- 🔴 **Oracle** — Cloud Infrastructure AI Foundations Associate
- 🔵 **Microsoft** — Career Essentials in Data Analysis
- 🟢 **Cisco** — Junior Cybersecurity Analyst Path (7 certs)
- 🟣 **KPMG** — Digital & Data Foundations (6 certs)
- 🟡 **SkillFront** — Certified Lean Six Sigma White Belt

## ☕ Support

If you find this portfolio inspiring or useful, consider supporting my work:

[![Buy Me A Coffee](https://img.shields.io/badge/Buy%20Me%20A%20Coffee-FFDD00?style=for-the-badge&logo=buy-me-a-coffee&logoColor=black)](https://buymeacoffee.com/jesun)

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

**[🌐 Launch Portfolio](http://jesunahmadushno.com/)**

*Designed & engineered by Jesun Ahmad Ushno*

[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=flat-square&logo=linkedin&logoColor=white)](https://linkedin.com/in/jesunahmadushno)
[![GitHub](https://img.shields.io/badge/GitHub-100000?style=flat-square&logo=github&logoColor=white)](https://github.com/JesunAhmadUshno)

© 2026 Jesun Ahmad Ushno. All rights reserved.

</div>
