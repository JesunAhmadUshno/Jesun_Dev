---
title: This site, rebuilt as the record
date: 2026-11-01
description: The site was rebuilt from one data file. Every number on it carries a source line.
tags: [build, site]
sources: [this repository]
---
The site now builds from one data file. Every page, card, feed, sitemap entry and structured data block reads from it.

Rules the build enforces on every run:

- No em dash anywhere. The lint fails the build.
- No number without a source line.
- No tracker, no ad script, no third-party font. The only network call the site makes on its own is the contact form.
- Reduced motion gets the complete page with no animation.

The swarm that assembles the home page is the fleet model made visible: named seats, one foreman, a log of who placed what.
