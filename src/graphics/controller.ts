import { ui, measurement, invalidated } from '../i18n/runtime';
import { createWebGLRenderer } from './webgl';
import { validForm } from './forms';
import { PointerHistory } from './pointer';
export type FieldController = {
  syncRoute: () => void;
  attach: (stage: HTMLElement) => void;
  destroy: () => void;
};
function createField(stage: HTMLElement): FieldController {
  type Renderer = {
    frame: (
      time: number,
      deltaSeconds: number,
      shapeId: number,
      x: number,
      y: number,
      pointerActive: number,
      width: number,
      height: number,
      viewMode: number,
      still: boolean,
      scrollProgress: number,
      trail: Float32Array,
    ) => boolean;
    particle_count: () => number;
    state_bytes: () => number;
    destroy: () => void;
    free?: () => void;
  };
  const events = new AbortController();
  const { signal } = events;
  const motionPreference = matchMedia('(prefers-reduced-motion: reduce)');
  const pointerHistory = new PointerHistory();

  let canvas = document.createElement('canvas');
  canvas.id = 'field';
  stage.prepend(canvas);

  // Renderer ownership. An old asynchronous startup must never replace a newer one.
  let renderer: Renderer | undefined;
  let disposed = false;
  let initializationId = 0;
  let startingRenderer = false;
  let rendererFailed = false;
  let backendPreference = 'auto';
  let backendLabel = 'Preparing';
  let backendDetail = '';

  // Animation state survives route changes; the target shape does not.
  let shapeId = 0;
  let viewMode = 0;
  let frameRequest = 0;
  let lastFrameTime = 0;
  let elapsedTime = 0;
  let frameCount = 0;
  let needsRender = true;
  let resetParticles = true;
  let reducedMotion = motionPreference.matches;
  let captureRequested = false;

  let pointerX = 0;
  let pointerY = 0;
  let pointerTargetX = 0;
  let pointerTargetY = 0;
  let pointerActive = 0;
  let pointerStrength = 0;
  let scrollProgress = 0;
  let targetScrollProgress = 0;
  let revealObserver: IntersectionObserver | undefined;

  let frameIntervals: number[] = [];
  let measurementStarted = 0;
  let measuring = false;
  let hasMeasurement = false;
  let measurementIntervals: number[] = [];

  function readRouteShape() {
    return validForm(Number(document.body.dataset.shape));
  }
  function resizeCanvas() {
    const dpr = Math.min(devicePixelRatio, innerWidth < 650 ? 1.25 : 1.5);
    const width = Math.max(1, Math.round(innerWidth * dpr));
    const height = Math.max(1, Math.round(innerHeight * dpr));
    if (canvas.width !== width) canvas.width = width;
    if (canvas.height !== height) canvas.height = height;
    return { width, height };
  }
  function requestFrame() {
    if (!frameRequest && !document.hidden && renderer && !rendererFailed)
      frameRequest = requestAnimationFrame(renderFrame);
  }
  function renderFrame(now: number) {
    frameRequest = 0;
    if (!renderer || document.hidden || rendererFailed) return;
    const deltaSeconds = lastFrameTime ? Math.min((now - lastFrameTime) / 1000, 0.033) : 1 / 60;
    if (lastFrameTime && !reducedMotion) {
      const interval = now - lastFrameTime;
      if (interval > 0 && Number.isFinite(interval)) {
        frameIntervals.push(interval);
        if (frameIntervals.length > 180) frameIntervals.shift();
        if (measuring) measurementIntervals.push(interval);
      }
    }
    lastFrameTime = now;
    if (!reducedMotion) {
      elapsedTime += deltaSeconds;
      const ease = 1 - Math.exp(-deltaSeconds * 18);
      pointerX += (pointerTargetX - pointerX) * ease;
      pointerY += (pointerTargetY - pointerY) * ease;
      pointerStrength += (pointerActive - pointerStrength) * ease;
      scrollProgress += (targetScrollProgress - scrollProgress) * (1 - Math.exp(-deltaSeconds * 4));
    }
    if (!reducedMotion || needsRender) {
      try {
        const { width, height } = resizeCanvas();
        const shown = renderer.frame(
          elapsedTime,
          reducedMotion ? 0 : deltaSeconds,
          shapeId,
          pointerX,
          pointerY,
          reducedMotion ? 0 : pointerStrength,
          width,
          height,
          viewMode,
          resetParticles || reducedMotion,
          scrollProgress,
          pointerHistory.frame(now),
        );
        if (shown) {
          frameCount++;
          canvas.dataset.frames = String(frameCount);
          needsRender = false;
          resetParticles = false;
          document.getElementById('field-stage')?.setAttribute('data-ready', 'true');
          if (captureRequested) {
            captureRequested = false;
            saveFrame();
          }
        }
      } catch (error) {
        showStaticFallback(error);
        return;
      }
    }
    if (frameCount % 25 === 0 || needsRender) syncDiagnostics();
    if (measuring && now - measurementStarted >= 10000) finishMeasurement();
    if (!reducedMotion || needsRender) requestFrame();
  }
  function releaseRenderer() {
    try {
      renderer?.destroy();
      renderer?.free?.();
    } catch {
      // A lost context may reject cleanup; the static view must still be usable.
    }
    renderer = undefined;
  }

  function replaceCanvas() {
    // A canvas cannot change context type after WebGPU or WebGL has claimed it.
    const replacement = canvas.cloneNode(false) as HTMLCanvasElement;
    canvas.replaceWith(replacement);
    canvas = replacement;
  }

  function showStaticFallback(error: unknown) {
    console.error('[Field / Form]', error);
    invalidateMeasurement(ui('interrupted'));
    rendererFailed = true;
    captureRequested = false;
    startingRenderer = false;
    backendLabel = 'Static view';
    backendDetail = ui('failed');
    if (frameRequest) cancelAnimationFrame(frameRequest);
    frameRequest = 0;
    releaseRenderer();
    document.getElementById('graphics-retry')?.removeAttribute('hidden');
    document.getElementById('field-stage')?.setAttribute('data-fallback', 'true');
    syncDiagnostics();
  }
  async function startRenderer() {
    if (renderer || startingRenderer || disposed) return;
    const startupId = ++initializationId;

    if (backendPreference === 'static') {
      backendLabel = 'Static view';
      backendDetail = ui('static');
      document.getElementById('field-stage')?.setAttribute('data-fallback', 'true');
      syncDiagnostics();
      return;
    }
    startingRenderer = true;
    rendererFailed = false;
    shapeId = Number(
      document.querySelector<HTMLSelectElement>('#shape-select')?.value ?? readRouteShape(),
    );
    resizeCanvas();
    const particleCount = innerWidth < 650 ? 12288 : 32768;
    try {
      if (backendPreference === 'webgl' || !navigator.gpu)
        throw new Error('WebGL2 compatibility path selected or WebGPU unavailable');
      const wasm = await import('./wasm/field_form.js');
      await wasm.default();
      if (disposed || startupId !== initializationId) return;
      const created = await wasm.FieldRenderer.create(canvas, particleCount);
      if (disposed || startupId !== initializationId) {
        created.destroy();
        created.free?.();
        return;
      }
      renderer = created;
      backendLabel = 'Rust / wgpu';
      backendDetail = 'Rust → WASM → wgpu 29 → WebGPU';
    } catch (error) {
      if (disposed || startupId !== initializationId) return;
      console.info('[Field / Form] WebGPU unavailable; trying WebGL2.', String(error));
      replaceCanvas();
      resizeCanvas();
      try {
        renderer = createWebGLRenderer(canvas, particleCount, showStaticFallback);
        backendLabel = 'WebGL2';
        backendDetail = 'WebGL2 · vertex morph fallback';
      } catch (fallbackError) {
        showStaticFallback(fallbackError);
        return;
      }
    }
    startingRenderer = false;
    canvas.dataset.instance = crypto.randomUUID();
    document.getElementById('graphics-retry')?.setAttribute('hidden', '');
    document.getElementById('field-stage')?.removeAttribute('data-fallback');
    needsRender = true;
    resetParticles = true;
    lastFrameTime = 0;
    syncDiagnostics();
    requestFrame();
  }
  function updateScroll() {
    document.body.dataset.reading = String(window.scrollY > innerHeight * 0.65);
    targetScrollProgress = Math.min(
      1,
      Math.max(
        0,
        window.scrollY / Math.max(1, document.documentElement.scrollHeight - innerHeight),
      ),
    );
  }
  function revealContent() {
    revealObserver?.disconnect();
    const elements = document.querySelectorAll<HTMLElement>(
      '.home-kicker,.home-intro>*,.work-index>*,.project-intro>.eyebrow,.project-intro>h1,.project-summary,.project-meta,.decision-row,.about-head>*,.lab-head>h1,.lab-description,.study-head>*,.story section,.story-lead,.study-entry,.collection-head>.eyebrow,.collection-head>h1,.collection-summary,.category-nav,.case-preview,.group-heading',
    );
    if (reducedMotion) {
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
    shapeId = readRouteShape();
    viewMode = 0;
    pointerActive = 0;
    pointerHistory.reset();
    frameIntervals = [];
    measuring = false;
    hasMeasurement = false;
    measurementIntervals = [];
    needsRender = true;
    resetParticles = reducedMotion;
    lastFrameTime = 0;
    syncDiagnostics();
    if (renderer) requestFrame();
    else void startRenderer();
  }
  function syncDiagnostics() {
    document
      .querySelectorAll('[data-backend]:not(canvas)')
      .forEach((el) => (el.textContent = backendLabel));
    const supportsDebug = backendLabel === 'Rust / wgpu';
    if (!supportsDebug) viewMode = 0;
    const debugSelect = document.querySelector<HTMLSelectElement>('#view-select');
    if (debugSelect) {
      debugSelect.value = String(viewMode);
      debugSelect.disabled = !supportsDebug;
      debugSelect.title = supportsDebug ? '' : ui('debug');
    }
    const runtimeSelect = document.querySelector<HTMLSelectElement>('#backend-select');
    if (runtimeSelect) {
      runtimeSelect.value = backendPreference;
      runtimeSelect.disabled = false;
    }
    const shapeSelect = document.querySelector<HTMLSelectElement>('#shape-select');
    if (shapeSelect) shapeSelect.disabled = false;

    let frameTiming = '—';
    if (renderer) {
      if (reducedMotion) frameTiming = ui('still');
      else if (frameIntervals.length > 10) {
        const median = percentile(frameIntervals, 0.5).toFixed(1);
        const p95 = percentile(frameIntervals, 0.95).toFixed(1);
        frameTiming = `${median} ms / ${p95} ms`;
      } else frameTiming = ui('collecting');
    }
    const diagnostics: Record<string, string> = {
      'lab-backend': backendDetail,
      'lab-particles': renderer?.particle_count().toLocaleString() ?? '—',
      'lab-memory': renderer ? `${(renderer.state_bytes() / 1024).toFixed(0)} KiB` : '—',
      'lab-frame': frameTiming,
      'lab-viewport': `${canvas.width} × ${canvas.height}`,
    };
    for (const [id, value] of Object.entries(diagnostics)) {
      const element = document.getElementById(id);
      if (element) element.textContent = value;
    }
    const measure = document.querySelector<HTMLButtonElement>('#measure');
    if (measure && !measuring) measure.disabled = !renderer || reducedMotion;
    const save = document.querySelector<HTMLButtonElement>('#save-frame');
    if (save) save.disabled = !renderer;
    canvas.dataset.backend = backendLabel;
    canvas.dataset.shape = String(shapeId);
    canvas.dataset.frames = String(frameCount);
    canvas.dataset.paused = String(reducedMotion);
    canvas.dataset.time = elapsedTime.toFixed(2);
    canvas.dataset.scroll = scrollProgress.toFixed(3);
    canvas.dataset.pointer = pointerStrength.toFixed(2);
  }
  function percentile(values: number[], q: number) {
    const sorted = [...values].sort((a, b) => a - b);
    return sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * q))] ?? 0;
  }

  function finishMeasurement() {
    measuring = false;
    hasMeasurement = true;
    const el = document.getElementById('measurement-result');
    const button = document.getElementById('measure') as HTMLButtonElement | null;
    if (button) {
      button.textContent = ui('measure');
      button.disabled = !renderer || reducedMotion;
    }
    if (el)
      el.textContent = measurement(
        measurementIntervals.length,
        percentile(measurementIntervals, 0.5).toFixed(1),
        percentile(measurementIntervals, 0.95).toFixed(1),
      );
  }
  function invalidateMeasurement(reason: string) {
    const wasRecording = measuring;
    const hadResult = hasMeasurement;
    measuring = false;
    hasMeasurement = false;
    measurementIntervals = [];
    const el = document.getElementById('measurement-result');
    if (el && (wasRecording || hadResult)) el.textContent = invalidated(reason, wasRecording);
    const button = document.getElementById('measure') as HTMLButtonElement | null;
    if (button) {
      button.textContent = ui('measure');
      button.disabled = !renderer || reducedMotion;
    }
  }
  // Read pixels in the same frame that drew them. WebGL may discard the drawing
  // buffer after compositing, especially when reduced motion stops the RAF loop.
  function saveFrame() {
    const savedShape = shapeId;
    canvas.toBlob((blob) => {
      if (!blob || disposed) return;
      const url = URL.createObjectURL(blob);
      const download = document.createElement('a');
      download.href = url;
      download.download = `sookie-field-form-${savedShape}.png`;
      download.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    }, 'image/png');
  }
  // One listener set per runtime, released when the final React host unmounts.
  document.addEventListener(
    'click',
    (event) => {
      const target = event.target as HTMLElement;
      if (target.closest('#graphics-retry')) {
        void startRenderer();
      }
      if (target.closest('#save-frame')) {
        if (!renderer || rendererFailed) return;
        captureRequested = true;
        needsRender = true;
        requestFrame();
      }
      if (target.closest('#measure')) {
        if (!renderer || reducedMotion) return;
        measuring = true;
        hasMeasurement = false;
        measurementIntervals = [];
        measurementStarted = performance.now();
        const button = document.getElementById('measure')!;
        button.textContent = ui('measuring');
        button.setAttribute('disabled', '');
        const result = document.getElementById('measurement-result');
        if (result) result.textContent = ui('recording');
      }
    },
    { signal },
  );
  document.addEventListener(
    'change',
    (event) => {
      const target = event.target as HTMLSelectElement;
      if (target.id === 'shape-select') {
        shapeId = validForm(Number(target.value));
        pointerHistory.reset();
        document.body.dataset.shape = String(shapeId);
        needsRender = true;
        resetParticles = reducedMotion;
        frameIntervals = [];
        invalidateMeasurement(ui('shape'));
        requestFrame();
      }
      if (target.id === 'view-select') {
        viewMode = Number(target.value);
        needsRender = true;
        frameIntervals = [];
        invalidateMeasurement(ui('mode'));
        requestFrame();
      }
      if (target.id === 'backend-select') {
        captureRequested = false;
        backendPreference = target.value;
        initializationId++;
        startingRenderer = false;
        frameIntervals = [];
        invalidateMeasurement(ui('backend'));
        cancelAnimationFrame(frameRequest);
        frameRequest = 0;
        releaseRenderer();
        replaceCanvas();
        document.getElementById('field-stage')?.removeAttribute('data-ready');
        void startRenderer();
      }
    },
    { signal },
  );
  window.addEventListener(
    'pointermove',
    (event) => {
      pointerTargetX = (event.clientX / innerWidth) * 2 - 1;
      pointerTargetY = 1 - (event.clientY / innerHeight) * 2;
      const el = event.target as HTMLElement;
      pointerActive =
        event.pointerType === 'mouse' &&
        !el.closest(
          'a,button,select,input,textarea,video,.story,.work-collection,.study-list,.project-summary,.project-meta,.decisions',
        )
          ? 1
          : 0;
      if (pointerActive && !reducedMotion) {
        pointerHistory.move(
          pointerTargetX,
          pointerTargetY,
          performance.now(),
          innerWidth / innerHeight,
        );
        needsRender = true;
        requestFrame();
      } else pointerHistory.reset();
    },
    { passive: true, signal },
  );
  window.addEventListener(
    'pointerout',
    (event) => {
      if (!event.relatedTarget) {
        pointerActive = 0;
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
      needsRender = true;
      lastFrameTime = 0;
      frameIntervals = [];
      invalidateMeasurement(ui('resize'));
      requestFrame();
    },
    { passive: true, signal },
  );
  document.addEventListener(
    'visibilitychange',
    () => {
      pointerHistory.reset();
      lastFrameTime = 0;
      frameIntervals = [];
      invalidateMeasurement(ui('visibility'));
      if (document.hidden) {
        cancelAnimationFrame(frameRequest);
        frameRequest = 0;
      } else {
        needsRender = true;
        requestFrame();
      }
    },
    { signal },
  );
  motionPreference.addEventListener(
    'change',
    (event) => {
      reducedMotion = event.matches;
      pointerHistory.reset();
      invalidateMeasurement(ui('motion'));
      frameIntervals = [];
      revealContent();
      needsRender = true;
      resetParticles = reducedMotion;
      lastFrameTime = 0;
      syncDiagnostics();
      requestFrame();
    },
    { signal },
  );
  window.addEventListener(
    'pagehide',
    () => {
      cancelAnimationFrame(frameRequest);
      frameRequest = 0;
    },
    { signal },
  );
  window.addEventListener(
    'pageshow',
    () => {
      lastFrameTime = 0;
      needsRender = true;
      requestFrame();
    },
    { signal },
  );
  return {
    syncRoute,
    attach(next) {
      stage = next;
      stage.prepend(canvas);
      if (renderer) stage.setAttribute('data-ready', 'true');
      if (rendererFailed || backendPreference === 'static')
        stage.setAttribute('data-fallback', 'true');
    },
    destroy() {
      if (disposed) return;
      disposed = true;
      initializationId++;
      events.abort();
      revealObserver?.disconnect();
      cancelAnimationFrame(frameRequest);
      frameRequest = 0;
      releaseRenderer();
      canvas.remove();
    },
  };
}

// A route or locale layout may remount, but the WebGPU canvas must not.
// A short release lease bridges React's cleanup/setup commit (including Strict Mode).
let retainedController: FieldController | undefined;
let pendingRelease: ReturnType<typeof setTimeout> | undefined;
let activeHost: symbol | undefined;
export function acquireField(stage: HTMLElement) {
  if (pendingRelease) {
    clearTimeout(pendingRelease);
    pendingRelease = undefined;
  }
  if (retainedController) retainedController.attach(stage);
  else retainedController = createField(stage);
  const lease = Symbol('field-host');
  activeHost = lease;
  return {
    controller: retainedController,
    release() {
      if (activeHost !== lease) return;
      pendingRelease = setTimeout(() => {
        if (activeHost === lease) {
          retainedController?.destroy();
          retainedController = undefined;
          activeHost = undefined;
        }
      }, 0);
    },
  };
}
