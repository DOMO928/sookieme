const manuallyPaused = new WeakSet<HTMLVideoElement>();
function setupVideos() {
  const cleanups = [
    ...document.querySelectorAll<HTMLVideoElement>('video[data-project-video]'),
  ].map((video) => {
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    const connection = (
      navigator as Navigator & {
        connection?: EventTarget & { saveData?: boolean };
      }
    ).connection;
    const events = new AbortController();
    const { signal } = events;
    let inView = false;
    let automaticPauses = 0;
    const pauseAutomatically = () => {
      if (video.paused) return;
      // The pause event is queued. Preserve its cause even if visibility changes
      // again before the event is delivered.
      automaticPauses++;
      video.pause();
    };
    const canAutoplay = () => !motion.matches && !connection?.saveData;

    const sync = () => {
      if (!inView || document.hidden) {
        pauseAutomatically();
        return;
      }
      if (canAutoplay() && !manuallyPaused.has(video) && video.paused) {
        video
          .play()
          .then(() => {
            if (signal.aborted || !video.isConnected) video.pause();
            else if (!inView || document.hidden || !canAutoplay()) pauseAutomatically();
          })
          .catch(() => {
            /* Native controls remain usable when autoplay is blocked. */
          });
      }
    };
    video.addEventListener(
      'pause',
      () => {
        if (automaticPauses) automaticPauses--;
        else manuallyPaused.add(video);
      },
      { signal },
    );
    video.addEventListener(
      'play',
      () => {
        manuallyPaused.delete(video);
      },
      { signal },
    );
    document.addEventListener('visibilitychange', sync, { signal });
    const preferencesChanged = () => {
      if (!canAutoplay()) pauseAutomatically();
      else sync();
    };
    motion.addEventListener('change', preferencesChanged, { signal });
    connection?.addEventListener('change', preferencesChanged, { signal });
    const observer = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting && entry.intersectionRatio >= 0.2;
        sync();
      },
      { threshold: [0, 0.2] },
    );
    observer.observe(video);
    return () => {
      events.abort();
      observer.disconnect();
      video.pause();
    };
  });
  return () => {
    cleanups.forEach((dispose) => dispose());
  };
}

function setupGallery() {
  const abort = new AbortController();
  const { signal } = abort;
  document.querySelectorAll<HTMLElement>('[data-gallery]').forEach((gallery) => {
    const track = gallery.querySelector<HTMLElement>('.gallery-track')!;
    const slides = [...track.querySelectorAll<HTMLElement>('.gallery-slide')];
    const previous = gallery.querySelector<HTMLButtonElement>('[data-gallery-prev]')!;
    const next = gallery.querySelector<HTMLButtonElement>('[data-gallery-next]')!;
    const position = gallery.querySelector<HTMLElement>('[data-gallery-position]')!;
    gallery.querySelector<HTMLElement>('[data-gallery-controls]')!.hidden = false;
    let active = 0;
    const left = (slide: HTMLElement) =>
      slide.getBoundingClientRect().left - track.getBoundingClientRect().left + track.scrollLeft;
    const sync = () => {
      active = slides.reduce(
        (best, slide, i) =>
          Math.abs(left(slide) - track.scrollLeft) < Math.abs(left(slides[best]) - track.scrollLeft)
            ? i
            : best,
        0,
      );
      previous.disabled = track.scrollLeft < 2;
      next.disabled = track.scrollLeft >= track.scrollWidth - track.clientWidth - 2;
      const lastVisible = slides.reduce(
        (last, slide, i) => (left(slide) < track.scrollLeft + track.clientWidth - 2 ? i : last),
        active,
      );
      position.textContent = `${String(active + 1).padStart(2, '0')}${lastVisible > active ? '–' + String(lastVisible + 1).padStart(2, '0') : ''} / ${String(slides.length).padStart(2, '0')}`;
    };
    const step = (direction: number) => {
      const index = Math.max(0, Math.min(slides.length - 1, active + direction));
      track.scrollTo({
        left: left(slides[index]),
        behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
      });
    };
    previous.addEventListener('click', () => step(-1), { signal });
    next.addEventListener('click', () => step(1), { signal });
    track.addEventListener(
      'keydown',
      (event) => {
        if (event.target !== track) return;
        if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
          event.preventDefault();
          step(event.key === 'ArrowRight' ? 1 : -1);
        }
      },
      { signal },
    );
    track.addEventListener('scroll', sync, { passive: true, signal });
    window.addEventListener('resize', sync, { passive: true, signal });
    sync();
  });
  return () => abort.abort();
}

export function setupPageMedia() {
  const stopVideos = setupVideos(),
    stopGallery = setupGallery();
  return () => {
    stopVideos();
    stopGallery();
  };
}
