import { test, expect } from '@playwright/test';
import { PAGES, scrollThroughPage } from './helpers';

const VIEWPORTS = [
  { name: 'mobile', width: 375, height: 812 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1280, height: 800 },
];

for (const vp of VIEWPORTS) {
  test.describe(`${vp.name} (${vp.width}px)`, () => {
    test.use({ viewport: { width: vp.width, height: vp.height } });

    for (const { name, path } of PAGES) {
      test(`${name}: no horizontal page scroll and nothing wider than the screen`, async ({ page }) => {
        await page.goto(path);
        await scrollThroughPage(page);

        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
        expect(overflow, 'page should not scroll sideways').toBeLessThanOrEqual(0);

        const tooWide = await page.evaluate(() =>
          [...document.querySelectorAll('main *')]
            .filter((el) => el.getBoundingClientRect().right > window.innerWidth + 1)
            .map((el) => `${el.tagName.toLowerCase()}.${el.className}`.slice(0, 80)),
        );
        expect(tooWide).toEqual([]);

        await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
      });
    }

    test('home hero: two columns on desktop, stacked below', async ({ page }) => {
      await page.goto('/');
      const h1 = (await page.getByRole('heading', { level: 1 }).boundingBox())!;
      const card = (await page.locator('.how-row').first().boundingBox())!;
      if (vp.width >= 1024) expect(card.x, 'card beside the headline').toBeGreaterThan(h1.x + h1.width * 0.5);
      else expect(card.y, 'card below the headline').toBeGreaterThan(h1.y + h1.height);
    });

    test('projects: case study cards are two columns on desktop, one column below', async ({ page }) => {
      await page.goto('/projects/');
      const first = page.locator('article').first();
      await first.scrollIntoViewIfNeeded();
      const left = (await first.getByText('Problem', { exact: true }).boundingBox())!;
      const right = (await first.getByText('Impact', { exact: true }).boundingBox())!;
      if (vp.width >= 1024) expect(right.x, 'impact panel to the right').toBeGreaterThan(left.x + 200);
      else expect(right.y, 'impact panel below').toBeGreaterThan(left.y);
    });
  });
}
