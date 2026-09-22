import { ui, measurement, invalidated } from '../i18n/runtime';
import { createFallback } from './webgl';
import { validForm } from './forms';
import { PointerHistory } from './pointer';
export type FieldController = {
  syncRoute: () => void;
  attach: (stage: HTMLElement) => void;
  destroy: () => void;
};
function createField(stage: HTMLElement): FieldController {
  const events = new AbortController();
  const { signal } = events;
  let disposed = false,
    epoch = 0;
  const pointerHistory = new PointerHistory();

  type Engine = {
    frame: (
      time: number,
      dt: number,
      shape: number,
      x: number,
      y: number,
      active: number,
      width: number,
      height: number,
      mode: number,
      still: boolean,
      scroll: number,
      trail: Float32Array,
    ) => boolean;
    particle_count: () => number;
    state_bytes: () => number;
    destroy: () => void;
    free?: () => void;
  };
  let engine: Engine | undefined;
  let canvas = document.createElement('canvas');
  canvas.id = 'field';
  stage.prepend(canvas);
  let loading = false,
    failed = false,
    reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let shape = 0,
    mode = 0,
    raf = 0,
    last = 0,
    elapsed = 0,
    frameCount = 0,
    dirty = true,
    snap = true;
  let px = 0,
    py = 0,
    active = 0,
    tx = 0,
    ty = 0,
    pointerStrength = 0,
    scroll = 0,
    scrollTarget = 0,
    backend = 'Preparing',
    backendDetail = '';
  let preferredBackend = 'auto';
  let captureRequested = false;
  let samples: number[] = [];
  let sampleStarted = 0,
    recording = false,
    hasMeasurement = false,
    recordSamples: number[] = [];
  const reducedQuery = matchMedia('(prefers-reduced-motion: reduce)');
  function routeShape() {
    return validForm(Number(document.body.dataset.shape));
  }
  function size() {
    const dpr = Math.min(devicePixelRatio, innerWidth < 650 ? 1.25 : 1.5);
    const width = Math.max(1, Math.round(innerWidth * dpr));
    const height = Math.max(1, Math.round(innerHeight * dpr));
    if (canvas.width !== width) canvas.width = width;
    if (canvas.height !== height) canvas.height = height;
    return { width, height };
  }
  function updateText() {
    document
      .querySelectorAll('[data-backend]:not(canvas)')
      .forEach((el) => (el.textContent = backend));
    const supportsDebug = backend === 'Rust / wgpu';
    if (!supportsDebug) mode = 0;
    const debugSelect = document.querySelector<HTMLSelectElement>('#view-select');
    if (debugSelect) {
      debugSelect.value = String(mode);
      debugSelect.disabled = !supportsDebug;
      debugSelect.title = supportsDebug ? '' : ui('debug');
    }
    const runtimeSelect = document.querySelector<HTMLSelectElement>('#backend-select');
    if (runtimeSelect) {
      runtimeSelect.value = preferredBackend;
      runtimeSelect.disabled = false;
    }
    const shapeSelect = document.querySelector<HTMLSelectElement>('#shape-select');
    if (shapeSelect) shapeSelect.disabled = false;
    const ids: Record<string, string> = {
      'lab-backend': backendDetail,
      'lab-particles': engine?.particle_count().toLocaleString() ?? '—',
      'lab-memory': engine ? `${(engine.state_bytes() / 1024).toFixed(0)} KiB` : '—',
      'lab-frame': !engine
        ? '—'
        : reduced
          ? ui('still')
          : samples.length > 10
            ? `${percentile(samples, 0.5).toFixed(1)} ms / ${percentile(samples, 0.95).toFixed(1)} ms`
            : ui('collecting'),
      'lab-viewport': canvas ? `${canvas.width} × ${canvas.height}` : '—',
    };
    for (const [id, value] of Object.entries(ids)) {
      const el = document.getElementById(id);
      if (el) el.textContent = value;
    }
    const measure = document.querySelector<HTMLButtonElement>('#measure');
    if (measure && !recording) measure.disabled = !engine || reduced;
    const save = document.querySelector<HTMLButtonElement>('#save-frame');
    if (save) save.disabled = !engine;
    if (canvas) {
      canvas.dataset.backend = backend;
      canvas.dataset.shape = String(shape);
      canvas.dataset.frames = String(frameCount);
      canvas.dataset.paused = String(reduced);
      canvas.dataset.time = elapsed.toFixed(2);
      canvas.dataset.scroll = scroll.toFixed(3);
      canvas.dataset.pointer = pointerStrength.toFixed(2);
    }
  }
  function percentile(values: number[], q: number) {
    const sorted = [...values].sort((a, b) => a - b);
    return sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * q))] ?? 0;
  }
  function schedule() {
    if (!raf && !document.hidden && engine && !failed) raf = requestAnimationFrame(tick);
  }
  function tick(now: number) {
    raf = 0;
    if (!engine || document.hidden || failed) return;
    const dt = last ? Math.min((now - last) / 1000, 0.033) : 1 / 60;
    if (last && !reduced) {
      const interval = now - last;
      if (interval > 0 && Number.isFinite(interval)) {
        samples.push(interval);
        if (samples.length > 180) samples.shift();
        if (recording) recordSamples.push(interval);
      }
    }
    last = now;
    if (!reduced) {
      elapsed += dt;
      const ease = 1 - Math.exp(-dt * 18);
      px += (tx - px) * ease;
      py += (ty - py) * ease;
      pointerStrength += (active - pointerStrength) * ease;
      scroll += (scrollTarget - scroll) * (1 - Math.exp(-dt * 4));
    }
    if (!reduced || dirty) {
      try {
        const { width, height } = size();
        const shown = engine.frame(
          elapsed,
          reduced ? 0 : dt,
          shape,
          px,
          py,
          reduced ? 0 : pointerStrength,
          width,
          height,
          mode,
          snap || reduced,
          scroll,
          pointerHistory.frame(now),
        );
        if (shown) {
          frameCount++;
          canvas.dataset.frames = String(frameCount);
          dirty = false;
          snap = false;
          document.getElementById('field-stage')?.setAttribute('data-ready', 'true');
          if (captureRequested) {
            captureRequested = false;
            saveFrame();
          }
        }
      } catch (error) {
        fail(error);
        return;
      }
    }
    if (frameCount % 25 === 0 || dirty) updateText();
    if (recording && now - sampleStarted >= 10000) finishRecording();
    if (!reduced || dirty) schedule();
  }
  function fail(error: unknown) {
    console.error('[Field / Form]', error);
    invalidateMeasurement(ui('interrupted'));
    failed = true;
    captureRequested = false;
    loading = false;
    backend = 'Static view';
    backendDetail = ui('failed');
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
    try {
      engine?.destroy();
      engine?.free?.();
    } catch {}
    engine = undefined;
    document.getElementById('graphics-retry')?.removeAttribute('hidden');
    document.getElementById('field-stage')?.setAttribute('data-fallback', 'true');
    updateText();
  }
  async function boot() {
    if (engine || loading || disposed) return;
    const ticket = ++epoch;

    if (preferredBackend === 'static') {
      backend = 'Static view';
      backendDetail = ui('static');
      document.getElementById('field-stage')?.setAttribute('data-fallback', 'true');
      updateText();
      return;
    }
    loading = true;
    failed = false;
    shape = Number(
      document.querySelector<HTMLSelectElement>('#shape-select')?.value ?? routeShape(),
    );
    size();
    const count = innerWidth < 650 ? 12288 : 32768;
    try {
      if (preferredBackend === 'webgl' || !navigator.gpu)
        throw new Error('WebGL2 compatibility path selected or WebGPU unavailable');
      const wasm = await import('./wasm/field_form.js');
      await wasm.default();
      if (disposed || ticket !== epoch) return;
      const created = await wasm.FieldRenderer.create(canvas, count);
      if (disposed || ticket !== epoch) {
        created.destroy();
        created.free?.();
        return;
      }
      engine = created;
      backend = 'Rust / wgpu';
      backendDetail = 'Rust → WASM → wgpu 29 → WebGPU';
    } catch (error) {
      if (disposed || ticket !== epoch) return;
      console.info('[Field / Form] WebGPU unavailable; trying WebGL2.', String(error));
      const replacement = canvas.cloneNode(false) as HTMLCanvasElement;
      canvas.replaceWith(replacement);
      canvas = replacement;
      size();
      try {
        engine = createFallback(canvas, count, fail);
        backend = 'WebGL2';
        backendDetail = 'WebGL2 · vertex morph fallback';
      } catch (fallbackError) {
        fail(fallbackError);
        return;
      }
    }
    loading = false;
    canvas.dataset.instance = crypto.randomUUID();
    document.getElementById('graphics-retry')?.setAttribute('hidden', '');
    document.getElementById('field-stage')?.removeAttribute('data-fallback');
    dirty = true;
    snap = true;
    last = 0;
    updateText();
    schedule();
  }
  function updateScroll() {
    document.body.dataset.reading = String(window.scrollY > innerHeight * 0.65);
    scrollTarget = Math.min(
      1,
      Math.max(
        0,
        window.scrollY / Math.max(1, document.documentElement.scrollHeight - innerHeight),
      ),
    );
  }
  let revealObserver: IntersectionObserver | undefined;
  function revealContent() {
    revealObserver?.disconnect();
    const elements = document.querySelectorAll<HTMLElement>(
      '.home-kicker,.home-intro>*,.work-index>*,.project-intro>.eyebrow,.project-intro>h1,.project-summary,.project-meta,.decision-row,.about-head>*,.lab-head>h1,.lab-description,.study-head>*,.story section,.story-lead,.study-entry,.collection-head>.eyebrow,.collection-head>h1,.collection-summary,.category-nav,.case-preview,.group-heading',
    );
    if (reduced) {
      elements.forEach((el) => el.classList.remove('will-reveal'));
      return;
    }
    revealObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
            revealObserver?.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.04, rootMargin: '0px 0px -24px 0px' },
    );
    elements.forEach((el, index) => {
      el.style.setProperty('--reveal-delay', `${Math.min(index % 5, 3) * 55}ms`);
      el.classList.add('will-reveal');
      revealObserver!.observe(el);
    });
  }
  function syncRoute() {
    captureRequested = false;
    updateScroll();
    revealContent();
    shape = routeShape();
    mode = 0;
    active = 0;
    pointerHistory.reset();
    samples = [];
    recording = false;
    hasMeasurement = false;
    recordSamples = [];
    dirty = true;
    snap = reduced;
    last = 0;
    updateText();
    if (engine) schedule();
    else void boot();
  }
  function finishRecording() {
    recording = false;
    hasMeasurement = true;
    const el = document.getElementById('measurement-result');
    const button = document.getElementById('measure') as HTMLButtonElement | null;
    if (button) {
      button.textContent = ui('measure');
      button.disabled = !engine || reduced;
    }
    if (el)
      el.textContent = measurement(
        recordSamples.length,
        percentile(recordSamples, 0.5).toFixed(1),
        percentile(recordSamples, 0.95).toFixed(1),
      );
  }
  function invalidateMeasurement(reason: string) {
    const wasRecording = recording;
    const hadResult = hasMeasurement;
    recording = false;
    hasMeasurement = false;
    recordSamples = [];
    const el = document.getElementById('measurement-result');
    if (el && (wasRecording || hadResult)) el.textContent = invalidated(reason, wasRecording);
    const button = document.getElementById('measure') as HTMLButtonElement | null;
    if (button) {
      button.textContent = ui('measure');
      button.disabled = !engine || reduced;
    }
  }
  // Read pixels in the same frame that drew them. WebGL may discard the drawing
  // buffer after compositing, especially when reduced motion stops the RAF loop.
  function saveFrame() {
    const savedShape = shape;
    canvas.toBlob((blob) => {
      if (!blob || disposed) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sookie-field-form-${savedShape}.png`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    }, 'image/png');
  }
  // One listener set per runtime, released when the final React host unmounts.
  document.addEventListener(
    'click',
    (event) => {
      const target = event.target as HTMLElement;
      if (target.closest('#graphics-retry')) {
        void boot();
      }
      if (target.closest('#save-frame')) {
        if (!engine || failed) return;
        captureRequested = true;
        dirty = true;
        schedule();
      }
      if (target.closest('#measure')) {
        if (!engine || reduced) return;
        recording = true;
        hasMeasurement = false;
        recordSamples = [];
        sampleStarted = performance.now();
        const b = document.getElementById('measure')!;
        b.textContent = ui('measuring');
        b.setAttribute('disabled', '');
        const el = document.getElementById('measurement-result');
        if (el) el.textContent = ui('recording');
      }
    },
    { signal },
  );
  document.addEventListener(
    'change',
    (event) => {
      const target = event.target as HTMLSelectElement;
      if (target.id === 'shape-select') {
        shape = validForm(Number(target.value));
        pointerHistory.reset();
        document.body.dataset.shape = String(shape);
        dirty = true;
        snap = reduced;
        samples = [];
        invalidateMeasurement(ui('shape'));
        schedule();
      }
      if (target.id === 'view-select') {
        mode = Number(target.value);
        dirty = true;
        samples = [];
        invalidateMeasurement(ui('mode'));
        schedule();
      }
      if (target.id === 'backend-select') {
        captureRequested = false;
        preferredBackend = target.value;
        epoch++;
        loading = false;
        samples = [];
        invalidateMeasurement(ui('backend'));
        cancelAnimationFrame(raf);
        raf = 0;
        try {
          engine?.destroy();
          engine?.free?.();
        } catch {}
        engine = undefined;
        const replacement = canvas.cloneNode(false) as HTMLCanvasElement;
        canvas.replaceWith(replacement);
        canvas = replacement;
        document.getElementById('field-stage')?.removeAttribute('data-ready');
        void boot();
      }
    },
    { signal },
  );
  window.addEventListener(
    'pointermove',
    (event) => {
      tx = (event.clientX / innerWidth) * 2 - 1;
      ty = 1 - (event.clientY / innerHeight) * 2;
      const el = event.target as HTMLElement;
      active =
        event.pointerType === 'mouse' &&
        !el.closest(
          'a,button,select,input,textarea,video,.story,.work-collection,.study-list,.project-summary,.project-meta,.decisions',
        )
          ? 1
          : 0;
      if (active && !reduced) {
        pointerHistory.move(tx, ty, performance.now(), innerWidth / innerHeight);
        dirty = true;
        schedule();
      } else pointerHistory.reset();
    },
    { passive: true, signal },
  );
  window.addEventListener(
    'pointerout',
    (event) => {
      if (!event.relatedTarget) {
        active = 0;
        pointerHistory.reset();
      }
    },
    { passive: true, signal },
  );
  document.addEventListener('toggle', updateScroll, { capture: true, signal });
  window.addEventListener('scroll', updateScroll, { passive: true, signal });
  window.addEventListener(
    'resize',
    () => {
      pointerHistory.reset();
      updateScroll();
      dirty = true;
      last = 0;
      samples = [];
      invalidateMeasurement(ui('resize'));
      schedule();
    },
    { passive: true, signal },
  );
  document.addEventListener(
    'visibilitychange',
    () => {
      pointerHistory.reset();
      last = 0;
      samples = [];
      invalidateMeasurement(ui('visibility'));
      if (document.hidden) {
        cancelAnimationFrame(raf);
        raf = 0;
      } else {
        dirty = true;
        schedule();
      }
    },
    { signal },
  );
  reducedQuery.addEventListener(
    'change',
    (event) => {
      reduced = event.matches;
      pointerHistory.reset();
      invalidateMeasurement(ui('motion'));
      samples = [];
      revealContent();
      dirty = true;
      snap = reduced;
      last = 0;
      updateText();
      schedule();
    },
    { signal },
  );
  window.addEventListener(
    'pagehide',
    () => {
      cancelAnimationFrame(raf);
      raf = 0;
    },
    { signal },
  );
  window.addEventListener(
    'pageshow',
    () => {
      last = 0;
      dirty = true;
      schedule();
    },
    { signal },
  );
  return {
    syncRoute,
    attach(next) {
      stage = next;
      stage.prepend(canvas);
      if (engine) stage.setAttribute('data-ready', 'true');
      if (failed || preferredBackend === 'static') stage.setAttribute('data-fallback', 'true');
    },
    destroy() {
      if (disposed) return;
      disposed = true;
      epoch++;
      events.abort();
      revealObserver?.disconnect();
      cancelAnimationFrame(raf);
      raf = 0;
      try {
        engine?.destroy();
        engine?.free?.();
      } catch {}
      engine = undefined;
      canvas.remove();
    },
  };
}

// A route or locale layout may remount, but the WebGPU canvas must not.
// A short release lease bridges React's cleanup/setup commit (including Strict Mode).
let retained: FieldController | undefined;
let releaseTimer: ReturnType<typeof setTimeout> | undefined;
let activeLease: symbol | undefined;
export function acquireField(stage: HTMLElement) {
  if (releaseTimer) {
    clearTimeout(releaseTimer);
    releaseTimer = undefined;
  }
  if (retained) retained.attach(stage);
  else retained = createField(stage);
  const lease = Symbol('field-host');
  activeLease = lease;
  return {
    controller: retained,
    release() {
      if (activeLease !== lease) return;
      releaseTimer = setTimeout(() => {
        if (activeLease === lease) {
          retained?.destroy();
          retained = undefined;
          activeLease = undefined;
        }
      }, 0);
    },
  };
}
