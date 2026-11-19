// Fade + slide-in on scroll for any element marked with `data-reveal`.
// Optional: data-reveal-delay="0.2" (seconds) to stagger items in a grid.
//
// How it avoids a "flash" without breaking no-JS visitors:
//   - CSS hides [data-reveal] ONLY when <html> has the class "js" (see global.css).
//   - This script then reveals each element as it scrolls into view.
//   - Reduced motion: CSS never hides anything and this script does nothing.
import { animate, inView } from 'motion';

export function initReveal(): void {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  document.querySelectorAll<HTMLElement>('[data-reveal]').forEach((el) => {
    const delay = Number(el.dataset.revealDelay ?? 0);

    // inView returns a function that stops watching; we call it after the first reveal.
    const stopWatching = inView(
      el,
      () => {
        animate(el, { opacity: 1, transform: 'none' }, { duration: 0.6, delay, ease: 'easeOut' });
        stopWatching();
      },
      { amount: 0.15 },
    );
  });
}
