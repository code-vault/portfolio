import { test, expect } from '@playwright/test';
import { scrollThroughPage } from './helpers';

test.describe('normal motion', () => {
  test('hero pipeline animates', async ({ page }) => {
    await page.goto('/');
    const pulse = page.locator('.pipeline-pulse');
    await expect(pulse).toBeVisible();
    expect(await pulse.evaluate((el) => getComputedStyle(el).animationName)).not.toBe('none');
  });

  test('stats count up and end on the exact values', async ({ page }) => {
    await page.goto('/');
    await page.locator('#stats').scrollIntoViewIfNeeded();
    await scrollThroughPage(page);
    const values = await page.locator('[data-count]').allTextContents();
    expect(values).toEqual(['9+', '8h → 3h', '~500', '5–6h → ~3h', '16', '20+']);
  });

  test('cards reveal on scroll and are not collapsed', async ({ page }) => {
    await page.goto('/');
    await scrollThroughPage(page);
    const broken = await page.evaluate(() =>
      [...document.querySelectorAll('[data-reveal]')].filter((el) => {
        const box = el.getBoundingClientRect();
        return getComputedStyle(el).opacity !== '1' || box.width === 0 || box.height === 0;
      }).length,
    );
    expect(broken).toBe(0);
  });
});

test.describe('prefers-reduced-motion: reduce', () => {
  test.use({ reducedMotion: 'reduce' });

  test('pipeline animation is off', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.pipeline-pulse')).toBeHidden();
    expect(await page.locator('.pipeline-dot').first().evaluate((el) => getComputedStyle(el).animationName)).toBe('none');
  });

  test('content is visible immediately with final stat values, and scrolling is not smooth', async ({ page }) => {
    await page.goto('/');
    const hidden = await page.evaluate(
      () => [...document.querySelectorAll('[data-reveal]')].filter((el) => getComputedStyle(el).opacity === '0').length,
    );
    expect(hidden).toBe(0);
    await expect(page.locator('[data-count]').first()).toHaveText('9+');
    expect(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior)).toBe('auto');
  });

  test('cards do not lift on hover', async ({ page }) => {
    await page.goto('/');
    const card = page.locator('#what-i-do .card-lift').first();
    await card.scrollIntoViewIfNeeded();
    await card.hover();
    await page.waitForTimeout(400);
    expect(await card.evaluate((el) => getComputedStyle(el).transform)).toBe('none');
  });
});
