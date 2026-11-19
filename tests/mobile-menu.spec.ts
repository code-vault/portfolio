// Mobile menu (the ☰ button that opens a full-screen overlay below 768px).
import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const LINKS = ['Work', 'What I do', 'Experience', 'Skills', 'Contact'];

const menuButton = (page: Page) => page.getByRole('button', { name: 'Menu' });
const menu = (page: Page) => page.locator('#mobile-menu');

// Which element has focus right now, described so failures are readable.
const focused = (page: Page) =>
  page.evaluate(() => {
    const el = document.activeElement as HTMLElement | null;
    return el ? (el.getAttribute('data-menu-button') !== null ? 'menu button' : el.textContent?.trim() ?? el.tagName) : 'nothing';
  });

test.describe('mobile (375px)', () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('shows the menu button and hides the desktop links', async ({ page }) => {
    await expect(menuButton(page)).toBeVisible();
    await expect(menuButton(page)).toHaveAttribute('aria-expanded', 'false');
    await expect(menuButton(page)).toHaveAttribute('aria-controls', 'mobile-menu');
    await expect(menu(page)).toBeHidden();
    // The desktop link list must not be visible at this width
    await expect(page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name: 'Work' })).toBeHidden();
  });

  test('opens: aria-expanded true, menu visible with all links, focus moves into the menu', async ({ page }) => {
    await menuButton(page).click();
    await expect(menuButton(page)).toHaveAttribute('aria-expanded', 'true');
    await expect(menu(page)).toBeVisible();
    const labels = await menu(page).getByRole('link').allTextContents();
    expect(labels).toEqual(LINKS);
    expect(await focused(page)).toBe('Work'); // first link
  });

  test('opens from the keyboard (Enter on the button)', async ({ page }) => {
    await menuButton(page).focus();
    await page.keyboard.press('Enter');
    await expect(menu(page)).toBeVisible();
    expect(await focused(page)).toBe('Work');
  });

  test('closes on Esc and returns focus to the menu button', async ({ page }) => {
    await menuButton(page).click();
    await page.keyboard.press('Escape');
    await expect(menu(page)).toBeHidden();
    await expect(menuButton(page)).toHaveAttribute('aria-expanded', 'false');
    await expect(menuButton(page)).toBeFocused();
  });

  test('the ✕ button closes it and returns focus to the button', async ({ page }) => {
    await menuButton(page).click();
    await menuButton(page).click(); // same button, now showing ✕
    await expect(menu(page)).toBeHidden();
    await expect(menuButton(page)).toBeFocused();
  });

  for (const label of LINKS) {
    test(`tapping "${label}" closes the menu and scrolls to that section`, async ({ page }) => {
      await menuButton(page).click();
      await menu(page).getByRole('link', { name: label, exact: true }).click();

      await expect(menu(page)).toBeHidden();
      await expect(menuButton(page)).toHaveAttribute('aria-expanded', 'false');

      const id = { Work: 'work', 'What I do': 'what-i-do', Experience: 'experience', Skills: 'skills', Contact: 'contact' }[label]!;
      await expect(page).toHaveURL(new RegExp(`#${id}$`));
      await expect(page.locator(`#${id}`)).toBeInViewport({ timeout: 8000 });
      // scrolling is unlocked again
      expect(await page.evaluate(() => getComputedStyle(document.documentElement).overflow)).not.toBe('hidden');
    });
  }

  test('focus is trapped: Tab and Shift+Tab wrap around inside the menu', async ({ page }) => {
    await menuButton(page).click(); // focus on "Work"
    const seen: string[] = [await focused(page)];
    for (let i = 0; i < 6; i++) {
      await page.keyboard.press('Tab');
      seen.push(await focused(page));
    }
    // Work -> What I do -> Experience -> Skills -> Contact -> (wraps) menu button -> Work
    expect(seen).toEqual(['Work', 'What I do', 'Experience', 'Skills', 'Contact', 'menu button', 'Work']);

    // Backwards from the first link goes to the button, and from the button wraps to the last link
    await page.keyboard.press('Shift+Tab');
    expect(await focused(page)).toBe('menu button');
    await page.keyboard.press('Shift+Tab');
    expect(await focused(page)).toBe('Contact');
  });

  test('the page behind is inert and does not scroll while the menu is open', async ({ page }) => {
    await page.evaluate(() => window.scrollTo({ top: 1200, behavior: 'instant' }));
    const before = await page.evaluate(() => window.scrollY);
    // Press the button with a real mouse click at its position, like a user. (Playwright's locator.click()
    // first "scrolls the element into view", which wrongly moves the page for a sticky header.)
    const box = (await menuButton(page).boundingBox())!;
    await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
    await expect(menu(page)).toBeVisible();
    expect(await page.evaluate(() => window.scrollY), 'opening the menu must not move the page').toBe(before);

    expect(await page.evaluate(() => (document.querySelector('main') as HTMLElement).inert)).toBe(true);
    expect(await page.evaluate(() => (document.querySelector('footer') as HTMLElement).inert)).toBe(true);
    expect(await page.evaluate(() => getComputedStyle(document.documentElement).overflow)).toBe('hidden');

    await page.mouse.move(180, 400);
    await page.mouse.wheel(0, 900);
    await page.waitForTimeout(300);
    expect(await page.evaluate(() => window.scrollY)).toBe(before);

    // ...and everything is released again on close
    await page.keyboard.press('Escape');
    expect(await page.evaluate(() => (document.querySelector('main') as HTMLElement).inert)).toBe(false);
  });

  test('tap targets are at least 44px tall', async ({ page }) => {
    const button = await menuButton(page).boundingBox();
    expect(button!.height).toBeGreaterThanOrEqual(44);
    expect(button!.width).toBeGreaterThanOrEqual(44);

    await menuButton(page).click();
    const links = menu(page).getByRole('link');
    for (let i = 0; i < (await links.count()); i++) {
      const box = await links.nth(i).boundingBox();
      expect(box!.height, `link ${i} height`).toBeGreaterThanOrEqual(44);
    }
  });

  test('no horizontal page scroll at 375px, closed or open', async ({ page }) => {
    const overflow = () => page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(await overflow()).toBeLessThanOrEqual(0);
    await menuButton(page).click();
    expect(await overflow()).toBeLessThanOrEqual(0);
  });

  test('closes by itself if the screen becomes wide while open', async ({ page }) => {
    await menuButton(page).click();
    await page.setViewportSize({ width: 1280, height: 800 });
    await expect(menu(page)).toBeHidden();
    expect(await page.evaluate(() => getComputedStyle(document.documentElement).overflow)).not.toBe('hidden');
  });

  test('axe: no accessibility violations with the menu open', async ({ page }) => {
    await menuButton(page).click();
    await page.waitForTimeout(400); // let the open animation finish
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
    expect(results.violations.map((v) => `${v.id}: ${v.help} (${v.nodes.length} nodes)`)).toEqual([]);
  });
});

test.describe('mobile with reduced motion', () => {
  test.use({ viewport: { width: 375, height: 812 }, reducedMotion: 'reduce' });

  test('the menu opens with no animation', async ({ page }) => {
    await page.goto('/');
    await menuButton(page).click();
    await expect(menu(page)).toBeVisible();
    expect(await menu(page).evaluate((el) => getComputedStyle(el).animationName)).toBe('none');
  });
});

test.describe('mobile with normal motion', () => {
  test.use({ viewport: { width: 375, height: 812 }, reducedMotion: 'no-preference' });

  test('the menu opens with the short fade/slide-in', async ({ page }) => {
    await page.goto('/');
    await menuButton(page).click();
    expect(await menu(page).evaluate((el) => getComputedStyle(el).animationName)).toBe('menu-in');
  });
});

test.describe('desktop (1280px)', () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test('no menu button, and the overlay never shows', async ({ page }) => {
    await page.goto('/');
    await expect(menuButton(page)).toBeHidden();
    await expect(menu(page)).toBeHidden();
  });
});
