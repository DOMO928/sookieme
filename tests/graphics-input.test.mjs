import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PointerHistory } from '../src/graphics/pointer.ts';
import { forms, validForm } from '../src/graphics/forms.ts';

test('pointer entry and resets do not inject a force', () => {
  const pointer = new PointerHistory();
  pointer.move(0.8, -0.7, 100, 2);
  assert.ok(pointer.frame(100).every((x) => x === 0));
  pointer.move(0.7, -0.6, 116, 2);
  assert.ok(pointer.frame(116).some((x) => x !== 0));
  pointer.reset();
  assert.ok(pointer.frame(120).every((x) => x === 0));
});
test('fast and sparse input remains finite, bounded and decays after movement', () => {
  const pointer = new PointerHistory();
  pointer.move(-1, 1, 0, 2);
  for (let i = 1; i <= 20; i++) pointer.move(i % 2 ? 1 : -1, i % 2 ? -1 : 1, i * 8, 2);
  const trail = pointer.frame(160);
  assert.ok(trail.every(Number.isFinite));
  for (let i = 0; i < trail.length; i += 4)
    assert.ok(Math.hypot(trail[i + 2] * 2, trail[i + 3]) <= 3.201);
  const old = Array.from(pointer.frame(3000));
  assert.ok(
    old.every((x) => x === 0),
    'expired samples must leave no GPU input',
  );
  pointer.reset();
  pointer.move(-1, 0, 0, 1);
  pointer.move(1, 0, 1000, 1);
  assert.ok(pointer.frame(1000).every((x) => x === 0));
});
test('ten route forms have stable distinct IDs and invalid values fall back safely', () => {
  assert.equal(forms.length, 10);
  assert.equal(new Set(forms.map((f) => f.id)).size, 10);
  assert.equal(new Set(forms.map((f) => f.key)).size, 10);
  for (const value of [-1, 10, Infinity, NaN, 3.5]) assert.equal(validForm(value), 0);
  forms.forEach((form) => assert.equal(validForm(form.id), form.id));
});
