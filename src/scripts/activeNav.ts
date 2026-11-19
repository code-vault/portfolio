// Highlights the nav link for the section currently in view.
//
// On every scroll (throttled to one check per frame) we work out which section is "current":
// the last section whose top edge has passed a line near the top of the screen (below the sticky nav).
// If that section has a nav link, the link gets aria-current="location" (CSS styles it, screen readers
// announce it). Sections with no nav link (Hero, Stats, About) clear the highlight.
//
// This is computed from the scroll position each time, so it is always correct,
// even after a fast smooth-scroll across several sections.
// Works for any number of nav lists (desktop bar and mobile menu both carry data-nav-links).

export function initActiveNav(): void {
  const links = Array.from(document.querySelectorAll<HTMLAnchorElement>('[data-nav-links] a'));
  const sections = Array.from(document.querySelectorAll<HTMLElement>('main section[id]'));
  if (links.length === 0) return;

  // Light up every link that points at `hash` (e.g. "#work"); pass null to clear them all.
  function setActive(hash: string | null): void {
    for (const link of links) {
      if (hash !== null && link.hash === hash) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    }
  }

  const lastHash = links[links.length - 1].hash;

  function update(): void {
    // The last section (Contact) is short and can never reach the line, so at the very bottom
    // of the page we highlight the last link instead.
    const atBottom = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2;
    if (atBottom) return setActive(lastHash);

    const line = window.innerHeight * 0.25;
    let current: HTMLElement | null = null;
    for (const section of sections) {
      if (section.getBoundingClientRect().top <= line) current = section;
    }
    const hash = current ? `#${current.id}` : null;
    setActive(hash !== null && links.some((l) => l.hash === hash) ? hash : null);
  }

  let waiting = false;
  function onScroll(): void {
    if (waiting) return;
    waiting = true;
    requestAnimationFrame(() => {
      waiting = false;
      update();
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  update();
}
