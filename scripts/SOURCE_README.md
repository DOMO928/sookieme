# Field / Form — independent graphics source

The live study is at https://sookie.me/lab/field-form/.
This archive contains its graphics core, not the entire Next.js portfolio.

## Rebuild the browser module

Install Node 24 LTS and stable Rust through rustup. From this archive's root:

```sh
rustup target add wasm32-unknown-unknown
cargo install wasm-bindgen-cli --version 0.2.123 --locked
node scripts/build-wasm.mjs
```

The generated JavaScript and WASM are written to `src/graphics/wasm/`.
The Rust crate is pinned with Cargo.lock. A browser with WebGPU, a secure
context (HTTPS or localhost), and a canvas are required.

```js
import init, { FieldRenderer } from './src/graphics/wasm/field_form.js';
await init();
const renderer = await FieldRenderer.create(canvas, 32768);
// time and dt are seconds. shape is 0..9; mode is 0..2.
// scrollProgress is a smoothed normalized page progress, 0..1.
renderer.frame(
  time,
  dt,
  shape,
  pointerX,
  pointerY,
  pointerActive,
  canvas.width,
  canvas.height,
  mode,
  snapToTarget,
  scrollProgress,
  new Float32Array(24),
);
// On permanent teardown, not ordinary portfolio route navigation:
renderer.destroy();
renderer.free();
```

`controller.ts` shows the production lifecycle integration: persistent React-hosted
canvas, visibility, reduced motion, route targets, pointer smoothing, and explicit
WebGL2/static compatibility paths. A host calls `acquireField(stage)` and `controller.syncRoute()`; it releases its lease on unmount. The stage element owns the canvas independently of React children. Initialization epochs discard stale asynchronous startup results. `webgl.ts` is the independent compatibility
renderer. It uses analytic vertex morphing and does not allocate compute state.

The WGSL uses a stable integer-hash parameterization, one position/velocity
storage buffer, a damped spring, a two-frequency analytic curl field, a sparse drifting subset, and instanced sprites. Repeated cells retain fixed cell IDs and local circulation in the lattice core, while a separate 9% subset drifts around it. Surface deformation and ambient motion use independent gains across all ten forms. A bounded six-sample pointer history supplies local directional forces in the compute stage, with tangential projection and spring return. The lattice core retains fixed centers and responds through sprite size and exposure; its ambient subset also responds to directional forces. The WebGL fallback approximates the same input history analytically. Slow rotation and scroll-driven
layer separation keep the scene alive. Depth-dependent sprite radius/opacity
and a long-tailed size distribution provide selective focus.
The live lab reports rAF intervals, not GPU execution time.

Original graphics source is MIT licensed. Third-party dependencies retain
their own licenses. This study was made with AI development assistance and
is separate from the historical ProtoPie renderer case study.
