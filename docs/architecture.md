# Architecture and maintenance

## Stack

| Concern | Implementation |
| --- | --- |
| Pages and routing | Next.js 16 App Router, React 19, TypeScript |
| Delivery | Static export on Vercel |
| Styles | Responsive CSS and local fonts |
| Graphics | Rust, wgpu, WGSL, WebAssembly |
| Compatibility | WebGL2 and static WebP fallback |
| Languages | next-intl, server-only KO / EN / DE catalogs |
| Checks | TypeScript, Node tests, GitHub Actions, browser verification |

## Routes and content

`app/[[...path]]` is a finite, statically generated route registry. It preserves the original Korean URLs, `/en/` and `/de/` without redirects or middleware. The root layout receives the route parameters and emits the correct initial HTML language and fallback graphic. `dynamicParams: false` prevents unknown URLs from rendering an unintended page.

`content/pages` contains React Server Components. Shared media, diagrams and introductory sections live in `components`. Locale files use stable keys, so editing Korean copy no longer requires changing a source-text lookup key. `next-intl` formats messages on the build side; the full catalogs stay out of browser JavaScript.

The localized error routes and global static 404 carry `noindex`. Because the root layout is under a dynamic segment, the global 404 uses Next.js's documented `globalNotFound` option, currently experimental. It only affects the generated error page; normal content does not depend on it. The exported error page is checked as a static artifact.

## Persistent graphics

The GPU controller owns its canvas. `GraphicsStage` provides a React host and acquires a retained runtime. A deferred release bridges layout cleanup/setup, including React Strict Mode. Normal navigation transfers the same canvas and renderer. The final release aborts listeners, disconnects observers, cancels animation and frees GPU resources.

Initialization uses an epoch. Switching rendering backends or unmounting while WebGPU starts makes the earlier result stale; a stale renderer is destroyed rather than attached to the new host.

Route and locale updates synchronize the document language, form selection, reading state and Lab labels. Particle positions and velocities remain in GPU memory. WebGL2 uses an analytic compatibility renderer; static mode and GPU failure display the route-specific WebP.

## Other interactions

Next.js links handle local navigation and preserve native link behavior. Language switching retains the current query and anchor. `PageBehaviors` installs video and gallery behavior for the current route, then disposes it before the next setup. Reduced-motion and data-saving preferences govern autoplay, including changes while the page is open; native video controls remain available. Queued programmatic pause events are consumed separately from manual pauses, so scrolling away and back does not incorrectly block autoplay.

## Maintenance

Use Node 24 and npm with the lockfile. Run `npm ci`, `npm run format:check`, `npm run check`, `npm run build`, then `npm test`. CI also runs `npm run check:rust` and `cargo fmt --manifest-path graphics-rust/Cargo.toml --check`. `npm run preview` serves the production export locally. After Korean copy changes, rebuild the font subset using `scripts/subset-font.py`. Rust changes also require `npm run build:wasm` and browser checks of both GPU backends.

The repository contains only the portfolio and published assets. Preserved company code, private source documents, local QA captures, deployment credentials and the parent history workspace remain outside it. Public Field / Form downloads are generated during the build.

## References

- [Next.js static exports](https://nextjs.org/docs/app/guides/static-exports)
- [Layouts](https://nextjs.org/docs/app/api-reference/file-conventions/layout)
- [Internationalization](https://nextjs.org/docs/app/guides/internationalization)
- [next-intl App Router](https://next-intl.dev/docs/getting-started/app-router)
- [Global not-found pages](https://nextjs.org/docs/app/api-reference/file-conventions/not-found)

### Vercel build directory

Vercel's Next.js adapter reads the build manifests from `.next`, including for `output: 'export'`. Keep Vercel's Output Directory at `.next`; the separate `out` directory is for the local static preview and portable static hosting. Pointing the Next.js adapter at `out` prevents it from finding `routes-manifest.json`. The Vercel project preset is Next.js.
