import { test, expect } from '@playwright/test';
import { scrollThroughPage } from './helpers';

const VIEWPORTS = [
  { name: 'mobile', width: 390, height: 844 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1280, height: 800 },
];

for (const vp of VIEWPORTS) {
  test.describe(`${vp.name} (${vp.width}px)`, () => {
    test.use({ viewport: { width: vp.width, height: vp.height } });

    test('no horizontal page scroll, key content visible', async ({ page }) => {
      await page.goto('/');
      await scrollThroughPage(page);

      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      expect(overflow, 'page should not scroll sideways').toBeLessThanOrEqual(0);

      await expect(page.getByRole('heading', { level: 1 })).toBeInViewport();
      await expect(page.getByRole('navigation', { name: 'Main' })).toBeVisible();
      await expect(page.getByRole('link', { name: 'View my work' })).toBeVisible();
    });

    test('nothing is wider than the screen', async ({ page }) => {
      await page.goto('/');
      await scrollThroughPage(page);
      const tooWide = await page.evaluate(() =>
        [...document.querySelectorAll('main *')]
          .filter((el) => el.getBoundingClientRect().right > window.innerWidth + 1)
          // elements inside a deliberately scrollable region (the mobile nav link list) are allowed
          .filter((el) => !el.closest('[data-nav-links]'))
          .map((el) => `${el.tagName.toLowerCase()}.${el.className}`.slice(0, 80)),
      );
      expect(tooWide).toEqual([]);
    });

    test('pipeline lays out by screen size', async ({ page }) => {
      await page.goto('/');
      const steps = page.locator('.pipeline-step');
      const first = await steps.nth(0).boundingBox();
      const second = await steps.nth(1).boundingBox();
      if (vp.width >= 768) expect(second!.x).toBeGreaterThan(first!.x); // side by side
      else expect(second!.y).toBeGreaterThan(first!.y); // stacked
    });
  });
}
