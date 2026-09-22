import { mkdir, copyFile, readFile, writeFile, rm } from 'node:fs/promises';
import { zipSync } from 'fflate';
await mkdir('public/source', { recursive: true });
for (const [source, name] of [
  ['graphics-rust/src/field.wgsl', 'field.wgsl'],
  ['graphics-rust/src/lib.rs', 'lib.rs'],
  ['src/graphics/controller.ts', 'controller.ts'],
  ['src/graphics/webgl.ts', 'webgl.ts'],
])
  await copyFile(source, `public/source/${name}.txt`);
await rm('public/wasm', { recursive: true, force: true });
const sources = [
  'graphics-rust/Cargo.toml',
  'graphics-rust/Cargo.lock',
  'graphics-rust/src/lib.rs',
  'graphics-rust/src/field.wgsl',
  'src/graphics/controller.ts',
  'src/graphics/webgl.ts',
  'src/graphics/forms.ts',
  'src/graphics/pointer.ts',
  'src/i18n/runtime.ts',
  'scripts/build-wasm.mjs',
  'README.md',
  'LICENSE',
];
const files = {};
for (const name of sources) files[name] = new Uint8Array(await readFile(name));
files['README.md'] = new Uint8Array(await readFile('scripts/SOURCE_README.md'));
await writeFile('public/source/field-form-source.zip', zipSync(files, { level: 9 }));
console.log('Public source archive prepared.');
