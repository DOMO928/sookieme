import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Target, loadModule } from './helpers/graphics-runtime.mjs';

function galleryRuntime({ width = 320, reduced = false } = {}) {
  const track = Object.assign(new Target(), {
    scrollLeft: 0,
    clientWidth: width,
    scrollWidth: 1600,
    getBoundingClientRect: () => ({ left: 48 }),
    scrollTo({ left, behavior }) {
      this.lastBehavior = behavior;
      this.scrollLeft = Math.max(0, Math.min(this.scrollWidth - this.clientWidth, left));
      this.emit('scroll');
    },
  });
  const slides = Array.from({ length: 5 }, (_, index) => ({
    getBoundingClientRect: () => ({ left: 48 + index * 320 - track.scrollLeft }),
  }));
  track.querySelectorAll = () => slides;
  const previous = new Target();
  const next = new Target();
  const position = { textContent: '' };
  const controls = { hidden: true };
  const elements = {
    '.gallery-track': track,
    '[data-gallery-prev]': previous,
    '[data-gallery-next]': next,
    '[data-gallery-position]': position,
    '[data-gallery-controls]': controls,
  };
  const gallery = { querySelector: (selector) => elements[selector] };
  const window = new Target();
  const { setupPageMedia } = loadModule('src/interactions/media.ts', {
    window,
    document: { querySelectorAll: (selector) => (selector === '[data-gallery]' ? [gallery] : []) },
    matchMedia: () => ({ matches: reduced }),
  });
  return { track, previous, next, position, controls, window, dispose: setupPageMedia() };
}

test('gallery arrows keep the position label and edge controls in sync', () => {
  const gallery = galleryRuntime();
  assert.equal(gallery.controls.hidden, false);
  assert.equal(gallery.position.textContent, '01 / 05');
  assert.equal(gallery.previous.disabled, true);
  gallery.next.emit('click');
  assert.equal(gallery.track.scrollLeft, 320);
  assert.equal(gallery.track.lastBehavior, 'smooth');
  assert.equal(gallery.position.textContent, '02 / 05');
  assert.equal(gallery.previous.disabled, false);
  gallery.track.scrollTo({ left: 1600 });
  assert.equal(gallery.position.textContent, '05 / 05');
  assert.equal(gallery.next.disabled, true);
  gallery.previous.emit('click');
  assert.equal(gallery.position.textContent, '04 / 05');
  gallery.dispose();
});

test('gallery reports visible ranges across resizing and partially scrolled slides', () => {
  const gallery = galleryRuntime({ width: 700 });
  assert.equal(gallery.position.textContent, '01–03 / 05');
  gallery.track.scrollTo({ left: 190 });
  assert.equal(gallery.position.textContent, '02–03 / 05');
  gallery.track.clientWidth = 320;
  gallery.window.emit('resize');
  assert.equal(gallery.position.textContent, '02 / 05');
  gallery.track.scrollTo({ left: 1280 });
  assert.equal(gallery.position.textContent, '05 / 05');
  assert.equal(gallery.next.disabled, true);
  gallery.dispose();
});

test('gallery keyboard navigation respects reduced motion and releases listeners on unmount', () => {
  const gallery = galleryRuntime({ reduced: true });
  let prevented = false;
  gallery.track.emit('keydown', { key: 'ArrowRight', preventDefault: () => (prevented = true) });
  assert.equal(prevented, true);
  assert.equal(gallery.track.scrollLeft, 320);
  assert.equal(gallery.track.lastBehavior, 'instant');
  gallery.track.emit('keydown', { key: 'ArrowRight', target: {}, preventDefault() {} });
  assert.equal(gallery.track.scrollLeft, 320, 'focused slide links keep their native keys');
  gallery.dispose();
  gallery.next.emit('click');
  gallery.track.emit('keydown', { key: 'ArrowRight', preventDefault() {} });
  assert.equal(gallery.track.scrollLeft, 320, 'disposed gallery no longer reacts');
});
