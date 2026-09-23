import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import vm from 'node:vm';
import ts from 'typescript';

export class Target {
  listeners = new Map();
  addEventListener(type, listener, options = {}) {
    if (options.signal?.aborted) return;
    const set = this.listeners.get(type) ?? new Set();
    set.add(listener);
    this.listeners.set(type, set);
    options.signal?.addEventListener('abort', () => set.delete(listener), { once: true });
  }
  removeEventListener(type, listener) {
    this.listeners.get(type)?.delete(listener);
  }
  emit(type, event = {}) {
    for (const fn of this.listeners.get(type) ?? []) fn({ target: this, ...event });
  }
}

export function loadModule(file, globals = {}, overrides = {}) {
  const cache = new Map();
  function load(path) {
    path = resolve(path);
    if (cache.has(path)) return cache.get(path);
    const exports = {};
    cache.set(path, exports);
    const code = ts.transpileModule(readFileSync(path, 'utf8'), {
      compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS },
    }).outputText;
    vm.runInNewContext(
      code,
      {
        exports,
        console,
        AbortController,
        Float32Array,
        setTimeout,
        clearTimeout,
        ...globals,
        require(specifier) {
          if (Object.hasOwn(overrides, specifier)) return overrides[specifier];
          return load(resolve(dirname(path), specifier + '.ts'));
        },
      },
      { filename: path },
    );
    return exports;
  }
  return load(file);
}

export function graphicsRuntime({ reduced = false, wasm } = {}) {
  const order = [],
    frames = new Map(),
    timers = new Map(),
    nodes = new Map();
  let now = 0,
    serial = 0;
  class Element extends Target {
    dataset = {};
    style = { setProperty() {} };
    classList = { add() {}, remove() {} };
    attributes = new Map();
    value = '';
    textContent = '';
    disabled = false;
    constructor(id) {
      super();
      this.id = id;
    }
    closest(selector) {
      return selector === '#' + this.id ? this : null;
    }
    setAttribute(key, value) {
      this.attributes.set(key, value);
    }
    removeAttribute(key) {
      this.attributes.delete(key);
    }
    prepend(canvas) {
      this.canvas = canvas;
      canvas.parent = this;
    }
    replaceWith(canvas) {
      this.parent?.prepend(canvas);
    }
    cloneNode() {
      return new Canvas();
    }
    remove() {
      if (this.parent?.canvas === this) this.parent.canvas = undefined;
    }
    click() {
      order.push('download');
    }
  }
  class Canvas extends Element {
    width = 300;
    height = 150;
    constructor() {
      super('field');
    }
    toBlob(callback) {
      order.push('capture');
      callback({});
    }
  }
  const stage = new Element('field-stage');
  nodes.set(stage.id, stage);
  for (const id of [
    'backend-select',
    'shape-select',
    'view-select',
    'measure',
    'save-frame',
    'graphics-retry',
    'measurement-result',
    'lab-backend',
  ])
    nodes.set(id, new Element(id));
  nodes.get('shape-select').value = '8';
  const document = Object.assign(new Target(), {
    hidden: false,
    body: { dataset: { shape: '8' } },
    documentElement: { lang: 'ko', scrollHeight: 1800 },
    createElement: (tag) => (tag === 'canvas' ? new Canvas() : new Element(tag)),
    getElementById: (id) => nodes.get(id),
    querySelector: (selector) => nodes.get(selector.slice(1)),
    querySelectorAll: () => [],
  });
  const window = Object.assign(new Target(), { scrollY: 0 });
  const motion = Object.assign(new Target(), { matches: reduced });
  const engines = [];
  function engine() {
    const value = {
      frame: () => {
        order.push('render');
        return true;
      },
      particle_count: () => 100,
      state_bytes: () => 3200,
      destroy: () => {
        order.push('destroy');
        value.destroyed = true;
      },
    };
    engines.push(value);
    return value;
  }
  const module = loadModule(
    'src/graphics/controller.ts',
    {
      document,
      window,
      navigator: wasm ? { gpu: {} } : {},
      HTMLElement: Element,
      innerWidth: 1200,
      innerHeight: 800,
      devicePixelRatio: 1,
      matchMedia: () => motion,
      performance: { now: () => now },
      crypto: { randomUUID: () => String(++serial) },
      IntersectionObserver: class {
        observe() {}
        disconnect() {}
      },
      requestAnimationFrame: (fn) => {
        const id = ++serial;
        frames.set(id, fn);
        return id;
      },
      cancelAnimationFrame: (id) => frames.delete(id),
      setTimeout: (fn) => {
        const id = ++serial;
        timers.set(id, fn);
        return id;
      },
      clearTimeout: (id) => timers.delete(id),
      URL: { createObjectURL: () => 'blob:test', revokeObjectURL() {} },
      console: { info() {}, error() {} },
    },
    {
      './webgl': { createWebGLRenderer: engine },
      './wasm/field_form.js': wasm ?? {},
    },
  );
  return {
    ...module,
    stage,
    nodes,
    document,
    window,
    motion,
    engines,
    order,
    frames,
    engine,
    tick(ms = 16) {
      now += ms;
      const pending = [...frames.values()];
      frames.clear();
      pending.forEach((fn) => fn(now));
    },
    flushTimers() {
      const pending = [...timers.values()];
      timers.clear();
      pending.forEach((fn) => fn());
    },
    change(id, value) {
      const target = nodes.get(id);
      target.value = value;
      document.emit('change', { target });
    },
    click(id) {
      document.emit('click', { target: nodes.get(id) });
    },
  };
}
export const settle = () => new Promise((resolve) => setImmediate(resolve));
