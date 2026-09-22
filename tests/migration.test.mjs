import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir, stat } from 'node:fs/promises';
import { parse } from 'parse5';
import { createTranslator } from 'next-intl';
import { locales, routePaths, localizePath } from '../src/i18n/routes.ts';

function flatten(value, prefix = '') {
  return Object.entries(value).flatMap(([key, value]) =>
    typeof value === 'string' ? [[prefix + key, value]] : flatten(value, prefix + key + '.'),
  );
}
async function files(dir) {
  return (
    await Promise.all(
      (await readdir(dir, { withFileTypes: true })).map((e) =>
        e.isDirectory() ? files(dir + '/' + e.name) : dir + '/' + e.name,
      ),
    )
  ).flat();
}
function nodes(root) {
  return [root, ...(root.childNodes || []).flatMap(nodes)];
}
function attrs(node) {
  return Object.fromEntries((node.attrs || []).map((a) => [a.name, a.value]));
}

test('all locale catalogs have the same stable keys and valid ICU messages', async () => {
  let reference;
  for (const locale of locales) {
    const messages = JSON.parse(await readFile(`src/i18n/locales/${locale}.json`, 'utf8'));
    const entries = flatten(messages),
      keys = entries.map(([key]) => key).sort();
    if (reference) assert.deepEqual(keys, reference, locale);
    else reference = keys;
    const t = createTranslator({
      locale,
      messages,
      onError(error) {
        throw error;
      },
    });
    for (const [key, value] of entries) {
      assert.ok(value.trim(), key);
      assert.doesNotMatch(key, /[가-힣\s]/);
      assert.ok(t(key, { project: 'Example', label: 'Example' }), `${locale}.${key}`);
    }
  }
});

test('each static route includes an RSC payload and one accessible page structure', async () => {
  const shapes = {
    '/': 0,
    '/about/': 9,
    '/study/': 3,
    '/lab/field-form/': 8,
    '/work/content-platform/': 4,
    '/work/interactive-3d/': 2,
    '/work/realtime-game/': 5,
    '/work/rust-renderer/': 1,
    '/work/web-platforms/': 6,
    '/work/xr/': 7,
  };
  for (const locale of locales)
    for (const path of routePaths) {
      const route = localizePath(path, locale),
        base = 'out' + route;
      assert.ok((await stat(base + 'index.txt')).size > 0, `${route}: static navigation payload`);
      const all = nodes(parse(await readFile(base + 'index.html', 'utf8')));
      assert.equal(all.filter((n) => n.tagName === 'main').length, 1, route);
      assert.equal(all.filter((n) => n.tagName === 'h1').length, 1, route);
      assert.equal(
        attrs(all.find((n) => n.tagName === 'body'))['data-shape'],
        String(shapes[path]),
        route,
      );
      const ids = all.map((n) => attrs(n).id).filter(Boolean);
      assert.equal(ids.length, new Set(ids).size, `${route}: duplicate element IDs`);
      const footer = all.find((n) => n.tagName === 'footer');
      assert.ok(footer, `${route}: shared footer`);
      const sourceLink = nodes(footer).find(
        (n) => n.tagName === 'a' && attrs(n).href === 'https://github.com/DOMO928/sookieme',
      );
      assert.ok(attrs(sourceLink)['aria-label'], `${route}: labeled source link`);
      assert.match(attrs(sourceLink).rel, /noopener/);
      if (path === '/lab/field-form/') {
        for (const control of all.filter((n) => n.tagName === 'select'))
          assert.ok('disabled' in attrs(control), `${route}: controls await runtime setup`);
      }
      for (const image of all.filter((n) => n.tagName === 'img')) {
        assert.ok('alt' in attrs(image), `${route}: image needs alt text`);
        assert.ok(attrs(image).width && attrs(image).height, `${route}: image needs dimensions`);
      }
    }
});

test('content translations and the syntax highlighter stay out of browser JS', async () => {
  const chunks = (await files('out/_next')).filter((p) => p.endsWith('.js'));
  const browserCode = (await Promise.all(chunks.map((p) => readFile(p, 'utf8')))).join('\n');
  for (const locale of locales) {
    const catalog = JSON.parse(await readFile(`src/i18n/locales/${locale}.json`, 'utf8'));
    assert.ok(
      !browserCode.includes(catalog.about.intro),
      `${locale}: full content catalog leaked into JS`,
    );
  }
  assert.doesNotMatch(browserCode, /vscode-oniguruma|createHighlighterCore/);
  assert.doesNotMatch(browserCode, /astro:page-load|astro:before-swap/);
});

test('unknown URLs have a branded static 404 with a working home link', async () => {
  const all = nodes(parse(await readFile('out/404.html', 'utf8')));
  assert.equal(attrs(all.find((n) => n.tagName === 'html')).lang, 'ko');
  assert.ok(
    all.some(
      (n) =>
        n.tagName === 'meta' && attrs(n).name === 'robots' && attrs(n).content.includes('noindex'),
    ),
  );
  assert.ok(all.some((n) => n.tagName === 'a' && attrs(n).href === '/'));
  assert.ok(all.some((n) => attrs(n).id === 'field-stage'));
});
