import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { PAGES, scrollThroughPage } from './helpers';

// axe-core checks WCAG 2.0 / 2.1 level A and AA rules (contrast, labels, landmarks, list structure ...).
for (const { name, path } of PAGES) {
  for (const vp of [
    { label: 'desktop', width: 1280, height: 800 },
    { label: 'mobile', width: 375, height: 812 },
  ]) {
    test(`axe: ${name} page has no accessibility violations (${vp.label})`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto(path);
      await scrollThroughPage(page); // reveal everything first, otherwise hidden content skews contrast results

      const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
      expect(results.violations.map((v) => `${v.id}: ${v.help} (${v.nodes.length} nodes)`)).toEqual([]);
    });
  }

  test(`${name}: landmarks and a clean heading outline (one h1, no skipped levels)`, async ({ page }) => {
    await page.goto(path);
    await expect(page.getByRole('banner')).toHaveCount(1);
    await expect(page.getByRole('main')).toHaveCount(1);
    await expect(page.getByRole('contentinfo')).toHaveCount(1);

    const levels = await page.evaluate(() =>
      [...document.querySelectorAll('main h1, main h2, main h3, main h4, main h5, main h6')].map((h) => Number(h.tagName[1])),
    );
    expect(levels.filter((l) => l === 1)).toHaveLength(1);
    // each heading may go at most one level deeper than the one before it
    for (let i = 1; i < levels.length; i++) {
      expect(levels[i], `heading #${i} (h${levels[i]}) after h${levels[i - 1]}`).toBeLessThanOrEqual(levels[i - 1] + 1);
    }
  });
}

test('keyboard focus is visible on links', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Tab'); // skip link
  await page.keyboard.press('Tab'); // brand link
  const outline = await page.evaluate(() => {
    const s = getComputedStyle(document.activeElement as Element);
    return { style: s.outlineStyle, width: parseFloat(s.outlineWidth) };
  });
  expect(outline.style).not.toBe('none');
  expect(outline.width).toBeGreaterThan(0);
});
