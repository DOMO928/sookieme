# Maintainability review

Baseline: `e8fbe2a`. The goal is to make changes understandable to the next person reading this repository, without changing the portfolio’s content, layout or graphics behavior.

## Criteria

- A reader should be able to follow a complete operation without repeatedly jumping between trivial helpers.
- Names should explain the role of state and values. Conventional mathematical names such as `uv`, `x` and `y` can stay local to a formula.
- Keep code together when it changes together. Extract a module only when it has a clear responsibility and hides useful detail.
- Make ownership, cleanup and asynchronous invalidation visible at their call sites.
- Prefer explicit, current requirements to generic configuration systems or abstractions for hypothetical reuse.

References: [Google’s code review guidance](https://google.github.io/eng-practices/review/reviewer/looking-for.html) covers understandable complexity, naming and avoiding speculative generality. [Dan Abramov’s Goodbye, Clean Code](https://overreacted.io/goodbye-clean-code/) describes a graphics-editor refactor that reduced duplication but made later changes harder. These are review criteria, not rules about function length or mandatory deduplication.

## Findings and changes

1. **Page identity:** `Page0` / `meta0` through `Page10` / `meta10` obscure the route registry. Use actual page names. Keep the small explicit registry rather than introducing dynamic registration.
2. **Graphics control flow:** `controller.ts` combines renderer ownership, frame scheduling, input, diagnostics and content reveal. Rename ambiguous state and operations, arrange coherent phases, and give repeated renderer teardown one owner. Keep the frame sequence together rather than splitting each calculation into a helper.
3. **Shader readability:** WebGL shader source is embedded as densely packed lines inside resource setup. Give the two shader stages a dedicated source module and format both GLSL and WGSL. Keep each surface’s math together and identify the forms beside their branches.
4. **GPU input contract:** WGSL reads `p.frame.z`, `p.view.w` and `p.options.x` without telling the reader what they mean. Use named uniform fields in Rust and WGSL with the same byte layout and values. Verify the layout and rebuild WASM.
5. **Media interaction:** gallery state uses two reductions and a nested string expression for position labels. Rewrite this as one readable pass with named distances and indices. Keep each video’s listeners, autoplay policy and cleanup together.
6. **Verification:** keep the existing lifecycle regressions, add coverage where a changed boundary lacks behavior checks, verify the public graphics archive includes the new shader source, build all locales, and exercise both GPU backends, navigation, language switching, media and gallery in the browser before publishing.
7. **Content naming:** 149 translation keys were truncated sentences. Replace them with names describing the content's role, such as `xr.summary`, `xr.poseConversion` and `contentPlatform.viewerArchitecture`. Update all three catalogs and their callers together; retain every message value and its order.
8. **Component contracts:** remove unused `children` props from five leaf components and the unused `locale` prop from `Icon`. Keep locale-aware links and media components separate because they encapsulate actual shared behavior.

These changes are implemented. The controller still keeps a complete frame update in one function. State ownership and cleanup have explicit names and locations; there is no new service layer, event bus or generic renderer framework. The two WebGL shader stages moved into one module so GPU resource setup can be read independently of the surface equations. Conventional short mathematical names remain inside formulas.

## Boundaries

Generated WASM bindings are regenerated, not manually edited. Page-specific JSX and project diagrams remain explicit. Shared links, media components and the small pointer-history module have real responsibilities; they do not need to be merged merely because they are short. This review does not use line count, number of helpers or absence of duplication as success metrics.

## Verification

Baseline: the existing 30 tests passed. The updated suite has 33 passing tests, including three new gallery regressions for visible ranges, edge buttons, resizing, keyboard behavior, reduced motion and cleanup.

- TypeScript checks and the production static export pass. The exported pages are checked for all three locales, links, anchors, metadata, private-file exclusions and downloadable source completeness.
- Prettier, Rust target checks and `cargo fmt --check` pass. WASM and its bindings were regenerated with the pinned toolchain dependencies.
- One-off comparisons confirm that all catalog message values are unchanged; WGSL executable tokens are unchanged after mapping the uniform names; GLSL canonical output matches the original after mapping local names. Formatting tools were used from a temporary directory and added no project dependencies.
- In-app Chromium ran WebGPU and WebGL2 through all ten form selections. A GLSL local-name collision found during the first browser check was corrected, rebuilt and rechecked on WebGL2.
- Navigation from the Lab to About and between Korean, English and German retained the same WebGL canvas instance. On a 390 × 844 viewport, gallery arrows and keyboard navigation updated the visible range without page overflow. The Haegwan video played on entry while the offscreen Desk video stayed paused.

Browser checks cover the available desktop Chromium runtime and a mobile viewport, not physical phones or every GPU driver. Automated lifecycle tests cover reduced motion, hidden tabs, context loss, late initialization and manual-versus-automatic video pauses; they do not replace testing the actual shaders in a browser.
