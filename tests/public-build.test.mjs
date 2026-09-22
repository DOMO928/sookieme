import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir, stat } from 'node:fs/promises';
import { resolve } from 'node:path';
import { unzipSync, strFromU8 } from 'fflate';

const root = resolve('out');
async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  return (
    await Promise.all(
      entries.map((e) => (e.isDirectory() ? walk(resolve(dir, e.name)) : resolve(dir, e.name))),
    )
  ).flat();
}

test('all public links, script files and local anchors resolve', async () => {
  const pages = (await walk(root)).filter((p) => p.endsWith('.html'));
  assert.equal(pages.length, 35);
  for (const page of pages) {
    const html = await readFile(page, 'utf8');
    const lang = page.startsWith(root + '/en/')
      ? 'en'
      : page.startsWith(root + '/de/')
        ? 'de'
        : 'ko';
    assert.match(html, new RegExp('<html[^>]*lang="' + lang + '"'));
    if (/\/(?:404|_not-found)(?:\.html|\/index\.html)$/.test(page))
      assert.match(html, /<meta name="robots" content="noindex"/);
    else assert.match(html, /<link[^>]*rel="canonical"[^>]*sookie\.me/);
    const base = 'https://sookie.me/' + page.slice(root.length + 1).replace(/index\.html$/, '');
    for (const [, attr] of html.matchAll(/(?:href|src|poster)="([^"]+)"/g)) {
      const url = new URL(attr.replaceAll('&amp;', '&'), base);
      if (url.origin !== 'https://sookie.me') continue;
      let target = resolve(root, '.' + decodeURIComponent(url.pathname));
      assert.ok(target.startsWith(root + '/') || target === root);
      const info = await stat(target).catch(() => null);
      assert.ok(info, `${page}: missing ${attr}`);
      if (info.isDirectory()) target = resolve(target, 'index.html');
      if (url.hash && target.endsWith('.html')) {
        const targetHtml = await readFile(target, 'utf8');
        assert.ok(
          targetHtml.includes(`id="${decodeURIComponent(url.hash.slice(1))}"`),
          `${page}: missing anchor ${attr}`,
        );
      }
    }
  }
});

test('project recordings stay lightweight and support progressive playback', async () => {
  let total = 0;
  for (const name of ['bluebeaker-viewer', 'amos-gameplay', 'desk-ar', 'haegwan-ar']) {
    const data = await readFile(resolve(root, `media/${name}.mp4`));
    total += data.length;
    // Inspect top-level MP4 atoms: metadata must arrive before the encoded frames.
    const atoms = [];
    for (let offset = 0; offset + 8 <= data.length;) {
      const size = data.readUInt32BE(offset);
      assert.ok(size >= 8 && offset + size <= data.length, 'valid MP4 atom size');
      atoms.push(data.toString('ascii', offset + 4, offset + 8));
      offset += size;
    }
    assert.equal(atoms[0], 'ftyp');
    assert.ok(atoms.includes('moov') && atoms.includes('mdat'));
    assert.ok(atoms.indexOf('moov') < atoms.indexOf('mdat'), 'fast-start metadata');
    const poster = await readFile(resolve(root, `media/${name}.webp`));
    assert.equal(poster.toString('ascii', 8, 12), 'WEBP');
  }
  assert.ok(total < 14_000_000, 'four recordings stay below 14 MB');
  assert.ok(
    !(await walk(root)).some((path) => path.toLowerCase().endsWith('.mov')),
    'original recordings are not deployed',
  );
});

test('downloaded graphics source contains a reproducible crate and the running shader', async () => {
  const files = unzipSync(await readFile(resolve(root, 'source/field-form-source.zip')));
  assert.equal(
    strFromU8(files['graphics-rust/src/field.wgsl']),
    await readFile('graphics-rust/src/field.wgsl', 'utf8'),
  );
  for (const file of [
    'graphics-rust/Cargo.toml',
    'graphics-rust/Cargo.lock',
    'graphics-rust/src/lib.rs',
    'scripts/build-wasm.mjs',
    'LICENSE',
  ])
    assert.ok(files[file], file);
  assert.ok(!Object.keys(files).some((p) => /\.env|node_modules|target\/|restore\//.test(p)));
});

test('GPU-independent public content and ten fallback images are present', async () => {
  for (let i = 0; i < 10; i++)
    assert.ok((await stat(resolve(root, `images/form-${i}.webp`))).size > 1000);
  const wasm = (await walk(resolve(root, '_next'))).find((p) => p.endsWith('.wasm'));
  assert.ok(wasm, 'compiled WASM must be emitted as a local asset');
  assert.deepEqual(Array.from((await readFile(wasm)).subarray(0, 4)), [0, 97, 115, 109]);
  const pdf = await readFile(resolve(root, 'documents/Jaesook-Jeong-Resume.pdf'));
  assert.equal(pdf.subarray(0, 4).toString(), '%PDF');
});

// Company development archives must never be republished with the portfolio.
test('company renderer documents and archive links are absent from public output', async () => {
  const files = await walk(root);
  assert.ok(!files.some((p) => /[/]renderer-[^/]+[.](?:txt|docx)$/i.test(p)));
  for (const page of files.filter((p) => p.endsWith('.html'))) {
    const html = await readFile(page, 'utf8');
    assert.doesNotMatch(html, /\/documents\/renderer-/);
  }
  const renderer = await readFile(resolve(root, 'work/rust-renderer/index.html'), 'utf8');
  assert.doesNotMatch(renderer, /Development notes|StrokePlanSet|MaskRaster|ApplyMask/);
});

// Captures are media only; the source apps and their local mocks must stay private.
test('web case captures are lightweight and isolated from company source', async () => {
  let total = 0;
  for (const name of ['kica-site', 'kica-cms', 'enc-site', 'enc-cms']) {
    const bytes = await readFile(resolve(root, `media/${name}.webp`));
    assert.equal(bytes.toString('ascii', 8, 12), 'WEBP');
    total += bytes.length;
  }
  assert.ok(total < 250_000, 'web capture budget is 250 KB');
  for (const file of await walk(root)) {
    assert.doesNotMatch(file, /portfolio-capture|credentials[.]json|[/][.]env|[/]__qa/);
    if (file.endsWith('.html'))
      assert.doesNotMatch(
        await readFile(file, 'utf8'),
        /127[.]0[.]0[.]1:441[1-5]|tmp\/portfolio-web-review/,
      );
  }
  const platforms = await readFile(resolve(root, 'work/web-platforms/index.html'), 'utf8');
  assert.match(platforms, /원본 UI · 샘플 데이터/);
});

test('XR has both supplied recordings and five attributed photographs', async () => {
  const html = await readFile(resolve(root, 'work/xr/index.html'), 'utf8');
  assert.match(html, /desk-ar.mp4/);
  assert.match(html, /blog.naver.com\/kisgirl2422\/223970722081/);
  assert.match(html, /haegwan-ar.mp4/);
  assert.match(html, /haegwan-ar.webp/);
  assert.doesNotMatch(html, /exhibit-placeholder/);
  assert.match(html, /data-gallery-next/);
  let total = 0;
  for (let i = 1; i <= 5; i++) {
    const data = await readFile(resolve(root, `media/gangwon-ar-${i}.webp`));
    assert.equal(data.toString('ascii', 8, 12), 'WEBP');
    total += data.length;
    assert.ok(html.includes(`gangwon-ar-${i}.webp`));
  }
  assert.ok(total < 500_000, 'five gallery photos stay below 500 KB');
});

test('XR gallery preserves instructions, interaction, then the before-and-after pair in every locale', async () => {
  for (const prefix of ['', 'en/', 'de/']) {
    const html = await readFile(resolve(root, `${prefix}work/xr/index.html`), 'utf8');
    const photos = Array.from(
      html.matchAll(/<img\b[^>]*src="\/media\/gangwon-ar-(\d)\.webp"/g),
      (match) => Number(match[1]),
    );
    assert.deepEqual(photos, [1, 2, 3, 4, 5], `${prefix || 'ko/'}: AR experience order`);
  }
});
