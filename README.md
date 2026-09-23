# sookie.me

My portfolio for web, graphics and XR work.

[Visit the site](https://sookie.me/) · [English](https://sookie.me/en/) · [Deutsch](https://sookie.me/de/)

The background is a particle renderer called **Field / Form**. Each page has its own shape, and the particles move between them as you navigate. The canvas stays in place while the page content changes around it.

## Running locally

Use Node.js 24 and npm. The Node version is also in `.nvmrc`.

```sh
npm ci
npm run dev
```

The dev server runs at [localhost:4321](http://localhost:4321).

To preview a production build:

```sh
npm run build
npm run preview
```

This generates the static site in `out/` and serves it at [localhost:4416](http://localhost:4416).

## How it works

The site uses Next.js App Router, React and TypeScript. Pages are statically generated, with Korean, English and German copy handled by `next-intl`. Text, navigation and project media are regular HTML; the graphics run separately behind them.

Field / Form is written in Rust with wgpu and WGSL, compiled to WebAssembly. A compute shader updates particle positions and velocities, combining spring forces toward the target shape with curl-driven motion. Mouse movement and scrolling also feed into the renderer. Keeping the particle state across navigation lets a transition change direction before the previous one finishes.

WebGPU handles the simulation and rendering. The WebGL2 fallback uses vertex-based animation, and a static image is used when neither backend is available. Rendering pauses in hidden tabs and respects reduced-motion preferences.

You can try the forms, switch rendering paths and inspect the implementation in the [Field / Form lab](https://sookie.me/en/lab/field-form/).

## Working on the site

- [`src/content/pages/`](src/content/pages/) — page layouts and project content.
- [`src/i18n/locales/`](src/i18n/locales/) — Korean, English and German copy.
- [`src/graphics/`](src/graphics/) — browser controller, WebGL2 fallback and compiled WASM.
- [`graphics-rust/`](graphics-rust/) — Rust renderer and WGSL shaders.
- [`public/media/`](public/media/) — project recordings and images.

For routing, resource lifetime and content maintenance, see [Architecture and maintenance](docs/architecture.md).

The checks used in CI are available locally:

```sh
npm run format:check
npm run check
npm run build
npm test
```

Tests read the generated site, so run the build first. CI also checks the Rust target and Rust formatting.

### Rebuilding the renderer

The compiled WASM is committed, so Rust is only needed when changing the renderer. With a stable Rust toolchain installed through rustup:

```sh
rustup target add wasm32-unknown-unknown
cargo install wasm-bindgen-cli --version 0.2.123 --locked
npm run build:wasm
```

The `wasm-bindgen-cli` version needs to match the crate version in [`graphics-rust/Cargo.toml`](graphics-rust/Cargo.toml). Commit the regenerated files in `src/graphics/wasm/` with the Rust changes, then rebuild the site.

## Deployment

The site is hosted on Vercel. Production deployments currently use `vercel deploy --prod` from this directory; GitHub pushes run CI but do not trigger a deployment.

Vercel uses the Next.js preset and `.next` output directory. The separate `out/` directory is the portable static export used for local preview.

## Credits and license

The visual direction draws on the Pmndrs curl-noise example and Moon Kyungwon & Jeon Joonho’s _Phantom Garden_. More background is included in the [Field / Form notes](https://sookie.me/en/lab/field-form/#implementation).

Fonts are [Inter](public/documents/inter-LICENSE.txt) and [Pretendard](public/documents/pretendard-LICENSE.txt), with the local Pretendard subset renamed Sookie Sans. Icons are from [Phosphor](public/documents/phosphor-LICENSE.txt).

The independent Field / Form implementation is available under the [MIT license](LICENSE). Project recordings, screenshots, photographs, the résumé and third-party assets are not covered by that license.
