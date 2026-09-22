import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { parse } from 'parse5';
import { locales, routePaths, localizePath, localeFromPath } from '../src/i18n/routes.ts';

test('locale routing preserves anchors, leaves assets alone and handles unknown prefixes', () => {
  assert.equal(localizePath('/en/work/xr/?view=1#gangwon', 'de'), '/de/work/xr/?view=1#gangwon');
  assert.equal(localizePath('/de/about/', 'ko'), '/about/');
  for (const value of [
    '/media/desk-ar.mp4',
    '/documents/Jaesook-Jeong-Resume.pdf',
    'https://example.com/',
    '//example.com/',
    '#story',
  ])
    assert.equal(localizePath(value, 'de'), value);
  assert.equal(localeFromPath('/designer/'), 'ko');
  assert.equal(localizePath('/404/', 'ko'), '/404.html');
});

test('every localized page is complete, has matching alternates and keeps navigation in its locale', async () => {
  const originals = new Set(routePaths);
  for (const locale of locales)
    for (const path of routePaths) {
      const route = localizePath(path, locale);
      const html = await readFile(`out${route}index.html`, 'utf8');
      const root = parse(html);
      let main = false;
      function walk(node, inMain = false, skip = false) {
        inMain = inMain || node.tagName === 'main';
        skip = skip || ['script', 'style', 'code', 'pre'].includes(node.tagName);
        if (skip) return;
        if (inMain && locale !== 'ko') {
          if (node.nodeName === '#text')
            assert.doesNotMatch(node.value, /[가-힣]/, `${route}: untranslated text`);
          for (const a of node.attrs || [])
            if (['alt', 'aria-label', 'title'].includes(a.name))
              assert.doesNotMatch(a.value, /[가-힣]/, `${route}: untranslated ${a.name}`);
        }
        if (node.tagName === 'main') main = true;
        for (const a of node.attrs || [])
          if (a.name === 'href' && inMain && a.value.startsWith('/')) {
            const url = new URL(a.value, 'https://sookie.me');
            if (originals.has(url.pathname))
              assert.equal(locale, 'ko', `${route}: link escapes locale: ${a.value}`);
          }
        for (const child of node.childNodes || []) walk(child, inMain, skip);
      }
      walk(root);
      assert.ok(main);
      assert.ok(html.includes(`rel="canonical" href="https://sookie.me${route}"`));
      for (const alternative of locales)
        assert.ok(
          html.includes(
            `hrefLang="${alternative}" href="https://sookie.me${localizePath(path, alternative)}"`,
          ),
        );
      if (path === '/about/') assert.match(html, /data-shape="9"/);
    }
  const ko = await readFile('out/about/index.html', 'utf8');
  assert.match(ko, /프론트엔드·그래픽스 개발자 정재숙입니다/);
  const en = await readFile('out/en/about/index.html', 'utf8');
  assert.match(en, /I(?:&#x27;|')m Jaesook Jeong/);
  const de = await readFile('out/de/about/index.html', 'utf8');
  assert.match(de, /Ich bin Jaesook Jeong/);
});

test('sitemap contains all thirty translated content URLs, excluding error pages', async () => {
  const xml = await readFile('out/sitemap.xml', 'utf8');
  assert.equal([...xml.matchAll(/<loc>/g)].length, 30);
  for (const locale of locales)
    for (const path of routePaths)
      assert.ok(xml.includes(`https://sookie.me${localizePath(path, locale)}</loc>`));
  assert.doesNotMatch(xml, /404/);
});
