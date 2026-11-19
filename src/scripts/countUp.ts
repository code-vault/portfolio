// Count-up for stat values. Mark an element with data-count="<final text>", e.g. "9+" or "8h → 3h".
// Every number inside the text counts up from 0; everything else ("h", "+", "~", "→") stays as is.
// The element's text is set back to the exact final string when the animation ends.
import { animate, inView } from 'motion';

const NUMBER = /\d+(?:\.\d+)?/g;

export function initCountUp(): void {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  document.querySelectorAll<HTMLElement>('[data-count]').forEach((el) => {
    const finalText = el.dataset.count ?? '';
    const targets = (finalText.match(NUMBER) ?? []).map(Number);
    if (targets.length === 0) return; // nothing to count

    // Start at zero so there is no flash of the final value before counting begins.
    el.textContent = finalText.replace(NUMBER, '0');

    const stopWatching = inView(
      el,
      () => {
        animate(0, 1, {
          duration: 1.4,
          ease: 'easeOut',
          // progress goes 0 -> 1; each number in the text is scaled by it
          onUpdate: (progress) => {
            let i = 0;
            el.textContent = finalText.replace(NUMBER, () => String(Math.round(targets[i++] * progress)));
          },
          onComplete: () => { el.textContent = finalText; },
        });
        stopWatching();
      },
      { amount: 0.6 },
    );
  });
}
