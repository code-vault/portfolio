import { test, expect } from '@playwright/test';
import { PAGES, scrollThroughPage } from './helpers';

for (const { name, path } of PAGES) {
  test.describe(`${name} page`, () => {
    test('loads with no console errors, page errors or failed requests', async ({ page }) => {
      const problems: string[] = [];
      page.on('console', (msg) => { if (msg.type() === 'error') problems.push(`console: ${msg.text()}`); });
      page.on('pageerror', (err) => problems.push(`pageerror: ${err.message}`));
      page.on('requestfailed', (req) => problems.push(`request failed: ${req.url()}`));
      page.on('response', (res) => { if (res.status() >= 400) problems.push(`HTTP ${res.status()}: ${res.url()}`); });

      await page.goto(path);
      await scrollThroughPage(page); // trigger every animation script too

      expect(problems).toEqual([]);
    });

    test('has exactly one h1 and Open Graph / Twitter tags', async ({ page }) => {
      await page.goto(path);
      await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
      for (const sel of ['meta[property="og:title"]', 'meta[property="og:description"]', 'meta[property="og:image"]', 'meta[name="twitter:card"]']) {
        await expect(page.locator(sel)).toHaveAttribute('content', /.+/);
      }
    });
  });
}
