# Current design decisions

Updated after the 2026-09-23 About revision. This document describes the current site; earlier planning notes that no longer match the published content have been removed.

- **Identity:** a name-led About page with Frontend & Graphics Engineer and four narrative sections: Art & code, Working in startups, Across cultures, and Curiosity & interaction. The page connects installation art and software through making, describes intensive experience in short startup development cycles, adds the perspective of long-term life in Germany, and explains the willingness to learn across disciplines for a concrete goal and the interest in interaction. Field / Form provides a relevant hands-on example. Career chronology stays in the résumé; work, résumé and contact links follow the narrative.
- **Work structure:** Renderer, Interactive and Study. Interactive groups projects by 3D Apps, Web Platforms and XR. XR includes three separate exhibition projects.
- **Navigation:** Work and About beside the wordmark; résumé and compact language labels (한 / EN / DE) as secondary navigation, with full language names retained in accessible labels and tooltips. Mobile uses two rows. Project sections have a padded sticky menu with reading position, keyboard support and a separate return link.
- **XR detail:** three exhibitions followed by an Implementation section scoped to the AlvaAR / Three.js integration. The gallery retains its source sequence and attribution. Gangwon's portrait thumbnail is cropped around the AR rabbit.
- **Source:** an official white GitHub Invertocat link beside the shared footer copyright, with a 44px target and a localized accessible name. It points to this portfolio, not to historical company repositories.
- **Visual direction:** the continuous canvas, route-specific forms and restrained typography remain. No new framing or page-level visual concept is introduced.

Reference rationale: [Maxime Heckel](https://maximeheckel.com/) for connecting professional background, curiosity and interactive work; [Aras Pranckevičius](https://aras-p.info/) for direct access to graphics work and code. The About structure also draws on [Josh W. Comeau](https://www.joshwcomeau.com/about-josh/) for connecting personal interests to things visitors can try. These are structural references, not copied biography, design or source. The maker perspective, startup experience and personal interests were supplied by Jaesook; the portfolio interaction example reflects Jaesook’s design direction during this project.

The latest production code findings, tests and coverage limits are in [the production review](production-review-2026-09-22.md). Local browser captures remain in the ignored `qa` directory.

The GitHub mark is the unmodified `GitHub_Invertocat_White.svg` from the [official logo download](https://brand.github.com/GitHub_Logos.zip), used to link to this repository under the [GitHub logo guidance](https://brand.github.com/foundations/logo).
