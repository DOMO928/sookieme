/** Enhance ordinary anchor links without taking over page scrolling or history. */
export function setupCaseNavigation() {
  const nav = document.querySelector<HTMLElement>('.case-navigation');
  const strip = nav?.querySelector<HTMLElement>('.case-navigation-links');
  if (!nav || !strip) return () => {};

  const entries = [...strip.querySelectorAll<HTMLAnchorElement>('a[href*="#"]')]
    .map((link) => ({
      link,
      section: document.getElementById(decodeURIComponent(link.hash.slice(1))),
    }))
    .filter((entry): entry is { link: HTMLAnchorElement; section: HTMLElement } => !!entry.section);
  const events = new AbortController();
  const { signal } = events;
  let frame = 0;
  let focusFrame = 0;
  let keyboardScroll: number | undefined;
  let current: HTMLAnchorElement | undefined;

  const markOverflow = () => {
    const start = strip.scrollLeft > 2;
    const end = strip.scrollWidth - strip.clientWidth - strip.scrollLeft > 2;
    strip.dataset.overflow = start && end ? 'both' : start ? 'start' : end ? 'end' : 'none';
  };

  const reveal = (link: HTMLAnchorElement) => {
    const bounds = strip.getBoundingClientRect();
    const item = link.getBoundingClientRect();
    // Move only the menu strip. scrollIntoView would also move the document.
    if (item.left < bounds.left + 8) strip.scrollLeft += item.left - bounds.left - 8;
    else if (item.right > bounds.right - 8) strip.scrollLeft += item.right - bounds.right + 8;
  };

  const update = () => {
    frame = 0;
    if (signal.aborted) return;
    const readingLine = Math.max(nav.getBoundingClientRect().bottom + 32, innerHeight * 0.24);
    const atBottom = scrollY + innerHeight >= document.documentElement.scrollHeight - 2;
    const active = entries
      .filter(({ section }) => section.getBoundingClientRect().top <= readingLine)
      .at(-1);
    const next = (atBottom ? entries.at(-1) : active)?.link;
    if (next !== current) {
      current?.removeAttribute('aria-current');
      current = next;
      current?.setAttribute('aria-current', 'location');
      // Never pull a keyboard user away from a different focused menu item.
      if (current && !strip.querySelector('a:focus-visible')) reveal(current);
    }
    markOverflow();
  };
  const schedule = () => {
    if (!signal.aborted && !frame) frame = requestAnimationFrame(update);
  };
  const resized = () => {
    if (signal.aborted) return;
    if (current && !strip.querySelector('a:focus-visible')) reveal(current);
    schedule();
  };
  const observer = new ResizeObserver(resized);
  observer.observe(nav);
  observer.observe(strip);
  window.addEventListener('scroll', schedule, { passive: true, signal });
  window.addEventListener('hashchange', schedule, { signal });
  strip.addEventListener('scroll', markOverflow, { passive: true, signal });
  strip.addEventListener(
    'focusin',
    (event) => {
      if (event.target instanceof HTMLAnchorElement) reveal(event.target);
    },
    { signal },
  );
  document.addEventListener(
    'keydown',
    (event) => {
      const bounds = nav.getBoundingClientRect();
      keyboardScroll =
        event.key === 'Tab' && bounds.top <= 1 && bounds.bottom > 0 ? scrollY : undefined;
    },
    { capture: true, signal },
  );
  document.addEventListener(
    'focusin',
    (event) => {
      const top = keyboardScroll;
      keyboardScroll = undefined;
      if (top === undefined || !(event.target instanceof Node) || !nav.contains(event.target))
        return;
      // Browsers can scroll the document when tabbing to a clipped item inside
      // a sticky scroll container. Reveal that item horizontally, then keep
      // the reading position. Enter/Space and focus outside the menu stay native.
      cancelAnimationFrame(focusFrame);
      focusFrame = requestAnimationFrame(() => {
        if (!signal.aborted) window.scrollTo({ top, behavior: 'instant' });
      });
    },
    { signal },
  );
  void document.fonts.ready.then(resized);
  update();

  return () => {
    events.abort();
    observer.disconnect();
    cancelAnimationFrame(frame);
    cancelAnimationFrame(focusFrame);
    current?.removeAttribute('aria-current');
    delete strip.dataset.overflow;
  };
}
