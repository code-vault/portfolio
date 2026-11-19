// Highlights the nav link whose section is currently in view.
// Works by watching each section with an IntersectionObserver and setting
// aria-current="location" on the matching link (CSS styles it, screen readers announce it).

export function initActiveNav(): void {
  const links = Array.from(document.querySelectorAll<HTMLAnchorElement>('[data-nav-links] a'));

  // Pair every link with the section it points to (skip links whose section is missing).
  const pairs = links
    .map((link) => ({ link, section: document.querySelector<HTMLElement>(link.hash) }))
    .filter((p): p is { link: HTMLAnchorElement; section: HTMLElement } => p.section !== null);

  function setActive(active: HTMLAnchorElement | null): void {
    for (const { link } of pairs) {
      if (link === active) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    }
  }

  // A section counts as "current" when it crosses a band near the top of the viewport
  // (below the sticky nav, above the middle of the screen).
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          setActive(pairs.find((p) => p.section === entry.target)?.link ?? null);
        }
      }
    },
    { rootMargin: '-20% 0px -70% 0px' },
  );

  pairs.forEach((p) => observer.observe(p.section));
}
