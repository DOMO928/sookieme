import { execFileSync } from 'node:child_process';
import { join } from 'node:path';
import { homedir } from 'node:os';
const rustc = execFileSync('rustup', ['which', 'rustc'], { encoding: 'utf8' }).trim();
const cargo = execFileSync('rustup', ['which', 'cargo'], { encoding: 'utf8' }).trim();
const checkOnly = process.argv.includes('--check');
execFileSync(
  cargo,
  [
    checkOnly ? 'check' : 'build',
    '--locked',
    '--manifest-path',
    'graphics-rust/Cargo.toml',
    '--target',
    'wasm32-unknown-unknown',
    '--release',
  ],
  { stdio: 'inherit', env: { ...process.env, RUSTC: rustc } },
);
if (!checkOnly)
  execFileSync(
    join(homedir(), '.cargo/bin/wasm-bindgen'),
    [
      'graphics-rust/target/wasm32-unknown-unknown/release/field_form.wasm',
      '--out-dir',
      'src/graphics/wasm',
      '--target',
      'web',
    ],
    { stdio: 'inherit' },
  );
