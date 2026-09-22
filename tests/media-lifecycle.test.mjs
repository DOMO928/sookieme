import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Target, loadModule, settle } from './helpers/graphics-runtime.mjs';

function mediaRuntime({ reduced = false, saveData = false } = {}) {
  const pauses = [];
  const video = Object.assign(new Target(), {
    paused: true,
    isConnected: true,
    plays: 0,
    play() {
      this.paused = false;
      this.plays++;
      this.emit('play');
      return Promise.resolve();
    },
    pause() {
      if (!this.paused) {
        this.paused = true;
        pauses.push(() => this.emit('pause'));
      }
    },
  });
  const motion = Object.assign(new Target(), { matches: reduced });
  const connection = Object.assign(new Target(), { saveData });
  const document = Object.assign(new Target(), {
    hidden: false,
    querySelectorAll: (selector) => (selector.startsWith('video') ? [video] : []),
  });
  let observer;
  const { setupPageMedia } = loadModule('src/interactions/media.ts', {
    document,
    matchMedia: () => motion,
    navigator: { connection },
    IntersectionObserver: class {
      constructor(callback) {
        observer = callback;
      }
      observe() {}
      disconnect() {}
    },
  });
  return {
    video,
    motion,
    connection,
    document,
    dispose: setupPageMedia(),
    visible(value) {
      observer([{ isIntersecting: value, intersectionRatio: value ? 1 : 0 }]);
    },
    flushPauseEvents() {
      while (pauses.length) pauses.shift()();
    },
  };
}

test('a delayed programmatic pause is not remembered as a user pause', async () => {
  const h = mediaRuntime();
  h.visible(true);
  await settle();
  h.visible(false);
  h.visible(true);
  h.flushPauseEvents();
  await settle();
  h.visible(false);
  h.flushPauseEvents();
  h.visible(true);
  await settle();
  assert.equal(h.video.paused, false);
  h.dispose();
});

test('manual pause survives scrolling away and returning', async () => {
  const h = mediaRuntime();
  h.visible(true);
  await settle();
  h.video.pause();
  h.flushPauseEvents();
  h.visible(false);
  h.visible(true);
  await settle();
  assert.equal(h.video.paused, true);
  h.dispose();
});

test('enabling save-data stops autoplay and never blocks native manual playback', async () => {
  const h = mediaRuntime();
  h.visible(true);
  await settle();
  h.connection.saveData = true;
  h.connection.emit('change');
  h.flushPauseEvents();
  assert.equal(h.video.paused, true);
  await h.video.play();
  assert.equal(h.video.paused, false);
  h.dispose();
});

test('reduced motion and saved data disable initial autoplay', async () => {
  for (const options of [{ reduced: true }, { saveData: true }]) {
    const h = mediaRuntime(options);
    h.visible(true);
    await settle();
    assert.equal(h.video.plays, 0);
    h.dispose();
  }
});
