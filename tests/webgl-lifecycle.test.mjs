import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Target, loadModule } from './helpers/graphics-runtime.mjs';
const { createWebGLRenderer } = loadModule('src/graphics/webgl.ts');
function context({ fragmentFails = false, linkFails = false } = {}) {
  const deleted = [],
    lost = [];
  const gl = {
    VERTEX_SHADER: 1,
    FRAGMENT_SHADER: 2,
    COMPILE_STATUS: 3,
    LINK_STATUS: 4,
    createShader: (type) => ({ type }),
    shaderSource() {},
    compileShader() {},
    getShaderParameter: (shader) => !(fragmentFails && shader.type === 2),
    getShaderInfoLog: () => 'compile failed',
    deleteShader: (shader) => deleted.push(shader.type),
    createProgram: () => ({}),
    attachShader() {},
    linkProgram() {},
    getProgramParameter: () => !linkFails,
    getProgramInfoLog: () => 'link failed',
    deleteProgram: () => deleted.push('program'),
    getUniformLocation: () => ({}),
    getExtension: (name) =>
      name === 'WEBGL_lose_context' ? { loseContext: () => lost.push(true) } : null,
  };
  const canvas = Object.assign(new Target(), { getContext: () => gl });
  return { gl, canvas, deleted, lost };
}

test('WebGL releases shaders and context after fragment compilation fails', () => {
  const h = context({ fragmentFails: true });
  assert.throws(() => createWebGLRenderer(h.canvas, 100), /compile failed/);
  assert.deepEqual(h.deleted.sort(), [1, 2]);
  assert.equal(h.lost.length, 1);
});

test('WebGL cleans failed link resources and releases its context', () => {
  const h = context({ linkFails: true });
  assert.throws(() => createWebGLRenderer(h.canvas, 100), /link failed/);
  assert.deepEqual(h.deleted.map(String).sort(), ['1', '2', 'program']);
  assert.equal(h.lost.length, 1);
});

test('context loss is reported even without another animation frame; disposal is idempotent', () => {
  const h = context();
  const errors = [];
  const renderer = createWebGLRenderer(h.canvas, 100, (error) => errors.push(error));
  h.canvas.emit('webglcontextlost', { preventDefault() {} });
  assert.equal(errors.length, 1);
  renderer.destroy();
  renderer.destroy();
  assert.equal(h.deleted.filter((value) => value === 'program').length, 1);
  assert.equal(h.lost.length, 1);
  h.canvas.emit('webglcontextlost', { preventDefault() {} });
  assert.equal(errors.length, 1, 'disposed listener must not report a new failure');
});
