// Mobile menu behaviour (accessible disclosure pattern).
//
//  Open:   aria-expanded=true, focus moves to the first link, the rest of the page becomes `inert`
//          (not clickable, not focusable, hidden from screen readers) and page scrolling is locked.
//  Focus:  Tab / Shift+Tab cycle between the menu button and the menu links (a focus trap).
//  Close:  Esc or the ✕ button -> focus returns to the menu button.
//          Tapping a link -> menu closes and the browser scrolls to the section; focus follows the
//          page to that section (it does NOT jump back to the button).
//  Also closes by itself if the screen becomes wide (>= 768px) while it is open, e.g. rotating a tablet.

export function initMobileMenu(): void {
  const button = document.querySelector<HTMLButtonElement>('[data-menu-button]');
  const menu = document.querySelector<HTMLElement>('[data-mobile-menu]');
  const header = document.querySelector<HTMLElement>('[data-site-header]');
  if (!button || !menu || !header) return;

  const links = Array.from(menu.querySelectorAll<HTMLAnchorElement>('a'));
  // Parts of the page that must be unreachable while the menu is open.
  const background = Array.from(document.querySelectorAll<HTMLElement>('main, footer, [data-brand]'));
  const desktopQuery = window.matchMedia('(min-width: 768px)');

  const isOpen = () => button.getAttribute('aria-expanded') === 'true';

  function open(): void {
    button!.setAttribute('aria-expanded', 'true');
    menu!.hidden = false;
    header!.setAttribute('data-menu-open', '');
    document.documentElement.classList.add('menu-open'); // locks page scroll (see global.css)
    background.forEach((el) => (el.inert = true));
    links[0]?.focus();
  }

  // restoreFocus: true for Esc / ✕ (back to the button), false when a link was tapped.
  function close(restoreFocus: boolean): void {
    button!.setAttribute('aria-expanded', 'false');
    menu!.hidden = true;
    header!.removeAttribute('data-menu-open');
    document.documentElement.classList.remove('menu-open'); // unlock scroll BEFORE the link scrolls the page
    background.forEach((el) => (el.inert = false));
    if (restoreFocus) button!.focus();
  }

  button.addEventListener('click', () => (isOpen() ? close(true) : open()));

  // Tapping a link: close first, then let the browser do its normal jump to #section.
  links.forEach((link) => link.addEventListener('click', () => close(false)));

  document.addEventListener('keydown', (event) => {
    if (!isOpen()) return;

    if (event.key === 'Escape') {
      event.preventDefault();
      close(true);
      return;
    }

    // Focus trap: wrap around at both ends. Order is: button, then the links.
    if (event.key === 'Tab') {
      const order: HTMLElement[] = [button, ...links];
      const index = order.indexOf(document.activeElement as HTMLElement);
      const last = order.length - 1;
      if (event.shiftKey && index <= 0) {
        event.preventDefault();
        order[last].focus();
      } else if (!event.shiftKey && index === last) {
        event.preventDefault();
        order[0].focus();
      }
    }
  });

  desktopQuery.addEventListener('change', () => {
    if (desktopQuery.matches && isOpen()) close(false);
  });
}
