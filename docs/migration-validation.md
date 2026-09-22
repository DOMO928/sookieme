# Next.js migration validation

Validated on 2026-09-22. This record covers the Astro → Next.js App Router migration and the Korean copy revision.

## Automated checks

- `npm run check`: Next route type generation and strict TypeScript check pass.
- `npm run build`: production static export succeeds.
- `npm test`: all 17 tests pass.
- `npm audit`: no reported dependency vulnerabilities at the time of validation.
- All 30 content URLs across Korean, English and German retain their canonical URLs, alternate-language links, local assets and anchors.
- Each route has static HTML and an RSC navigation payload, one main landmark and one h1. Image alternative text and dimensions are checked.
- All three translation catalogs have matching keys and valid ICU messages. Full catalogs and the syntax highlighter are absent from browser JavaScript.
- The static 404 is branded, marked noindex and links home. Localized error pages remain available.
- Media size/streaming layout, source archives, fallback images, WASM and the résumé are checked. Preserved company source and private renderer archives are excluded.
- English and German main content was compared with the preceding Astro export. The only intentional text differences are shared video fallback-link labels.

## Browser checks

Performed in the Codex in-app Chromium browser against the production export, with an additional Next development-mode run:

- Home → Renderer → English → German → browser back retained the same canvas and renderer instance.
- Native section anchors and language switching preserve both query parameters and the section hash.
- About renders with its dedicated form. Study and project navigation change the form without creating a second canvas.
- Bluebeaker and Amos recordings load and play when visible. Offscreen media remains paused.
- The XR gallery advances with its controls and left/right keyboard navigation. The position label updates.
- Study disclosure opens and the highlighted shader example renders.
- Lab switches between Rust/wgpu, WebGL2 and static images. Unsupported debug controls and measurement buttons are disabled appropriately.
- Rapid backend changes return to a working WebGPU renderer with one canvas. No graphics or hydration errors were observed.
- A ten-second rAF sample completes; changing form during another sample cancels that measurement with an explanation. This checks the measuring feature, not cross-device GPU performance.
- React Strict Mode navigation retains one GPU runtime. A Next smooth-scroll configuration warning found during this check was fixed by marking the root HTML element.
- The German About layout was checked in a 320px frame and Korean XR at 390px. Neither overflowed horizontally; the language selector and content remained readable.

## Scope and limitations

These checks are evidence for the tested build, not a guarantee that every device is bug-free. Physical iOS/Android hardware and independent Firefox/Safari sessions were not tested in this run. The existing reduced-motion/data-saving behavior is preserved. The global static 404 uses Next.js's documented experimental `globalNotFound` option; its emitted output is covered by the test suite.

## Delivery

The production deployment and Git delivery are recorded separately in the task result so that a local validation record does not imply an unperformed remote action.
