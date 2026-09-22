# Current design decisions

Updated during the 2026-09-22 production review. This document describes the current site; earlier planning notes that no longer match the published content have been removed.

- **Identity:** a name-led About page with Frontend & Graphics Engineer, a short introduction, a brief art-study background, selected work, résumé and contact links. Career history stays in the résumé.
- **Work structure:** Renderer, Interactive and Study. Interactive groups projects by 3D Apps, Web Platforms and XR. XR includes three separate exhibition projects.
- **Navigation:** Work and About beside the wordmark; résumé and language autonyms as secondary navigation. Mobile uses two rows. Project sections have a padded sticky menu with reading position, keyboard support and a separate return link.
- **XR detail:** three exhibitions followed by an Implementation section scoped to the AlvaAR / Three.js integration. The gallery retains its source sequence and attribution. Gangwon's portrait thumbnail is cropped around the AR rabbit.
- **Source:** a quiet GitHub repository link beside the shared footer copyright. It points to this portfolio, not to historical company repositories.
- **Visual direction:** the continuous canvas, route-specific forms and restrained typography remain. No new framing or page-level visual concept is introduced.

Reference rationale: [Maxime Heckel](https://maximeheckel.com/) for concise frontend/graphics positioning and technical work; [Aras Pranckevičius](https://aras-p.info/) for direct access to graphics work and code. These are references for presentation, not claims that their designs or source were copied.

The latest production code findings, tests and coverage limits are in [the production review](production-review-2026-09-22.md). Local browser captures remain in the ignored `qa` directory.
