// Fade + slide-in on scroll for any element marked with `data-reveal`.
// Optional: data-reveal-delay="0.2" (seconds) to stagger items in a grid.
//
// How it avoids a "flash" without breaking no-JS visitors:
//   - CSS hides [data-reveal]:not([data-revealed]) ONLY when <html> has the class "js" (see global.css).
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
        // Animate explicit start/end values. (Animating to the CSS keyword "none" makes Motion
        // collapse the element to zero size, so we avoid it.)
        animate(el, { opacity: [0, 1], y: [24, 0] }, { duration: 0.6, delay, ease: 'easeOut' }).then(() => {
          // Hand control back to CSS: mark as revealed and drop Motion's inline styles,
          // so CSS effects like the card hover lift can use `transform` freely.
          el.dataset.revealed = '';
          // Motion writes its final inline style just after finishing, so clear it on the next frame.
          requestAnimationFrame(() => el.removeAttribute('style'));
        });
        stopWatching();
      },
      { amount: 0.15 },
    );
  });
}
