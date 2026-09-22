import { test } from 'node:test';
import assert from 'node:assert/strict';
import { graphicsRuntime, settle } from './helpers/graphics-runtime.mjs';

test('saving a still WebGL frame redraws before reading the drawing buffer', () => {
  const h = graphicsRuntime({ reduced: true });
  const lease = h.acquireField(h.stage);
  lease.controller.syncRoute();
  h.tick();
  assert.equal(h.frames.size, 0, 'reduced motion must not keep a continuous RAF');
  h.order.length = 0;
  h.click('save-frame');
  assert.ok(!h.order.includes('capture'), 'capture must wait for a newly drawn frame');
  h.tick();
  assert.deepEqual(h.order.slice(0, 2), ['render', 'capture']);
  lease.release();
  h.flushTimers();
});

test('route remount transfers one renderer, while final release disposes it', () => {
  const h = graphicsRuntime();
  const first = h.acquireField(h.stage);
  first.controller.syncRoute();
  h.tick();
  first.release();
  const second = h.acquireField(h.stage);
  second.controller.syncRoute();
  h.flushTimers();
  assert.equal(first.controller, second.controller);
  assert.equal(h.engines.length, 1);
  assert.ok(!h.engines[0].destroyed);
  second.release();
  h.flushTimers();
  assert.equal(h.engines[0].destroyed, true);
  assert.equal(h.frames.size, 0);
  assert.equal(h.stage.canvas, undefined);
});

test('a stale asynchronous WebGPU startup is destroyed after selecting static mode', async () => {
  let finish;
  const startup = new Promise((resolve) => {
    finish = resolve;
  });
  const h = graphicsRuntime({
    wasm: { default: async () => {}, FieldRenderer: { create: () => startup } },
  });
  const lease = h.acquireField(h.stage);
  lease.controller.syncRoute();
  await settle();
  h.change('backend-select', 'static');
  const stale = h.engine();
  finish(stale);
  await settle();
  assert.equal(stale.destroyed, true);
  assert.equal(h.frames.size, 0);
  assert.equal(h.stage.attributes.get('data-fallback'), 'true');
  lease.release();
  h.flushTimers();
});

test('static backend explanation follows the current language on navigation', () => {
  const h = graphicsRuntime();
  const lease = h.acquireField(h.stage);
  lease.controller.syncRoute();
  h.change('backend-select', 'static');
  assert.match(h.nodes.get('lab-backend').textContent, /정적/);
  h.document.documentElement.lang = 'en';
  lease.controller.syncRoute();
  assert.match(h.nodes.get('lab-backend').textContent, /Static render/);
  lease.release();
  h.flushTimers();
});

test('hidden documents suspend frames and invalidate an ongoing measurement', () => {
  const h = graphicsRuntime();
  const lease = h.acquireField(h.stage);
  lease.controller.syncRoute();
  h.tick();
  h.click('measure');
  h.document.hidden = true;
  h.document.emit('visibilitychange');
  assert.equal(h.frames.size, 0);
  assert.match(h.nodes.get('measurement-result').textContent, /측정 취소/);
  h.document.hidden = false;
  h.document.emit('visibilitychange');
  assert.equal(h.frames.size, 1);
  lease.release();
  h.flushTimers();
});
