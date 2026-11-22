import { test, expect } from '@playwright/test';
import { scrollThroughPage } from './helpers';

test.describe('normal motion', () => {
  test('cards reveal on scroll and are not collapsed (Home and Projects)', async ({ page }) => {
    for (const path of ['/', '/projects/', '/experience/']) {
      await page.goto(path);
      await scrollThroughPage(page);
      const broken = await page.evaluate(() =>
        [...document.querySelectorAll('[data-reveal]')].filter((el) => {
          const box = el.getBoundingClientRect();
          return getComputedStyle(el).opacity !== '1' || box.width === 0 || box.height === 0;
        }).length,
      );
      expect(broken, `${path}: unrevealed or collapsed elements`).toBe(0);
    }
  });

  test('the hero fades in once, and nothing on Home loops forever', async ({ page }) => {
    await page.goto('/');
    expect(await page.locator('.hero-in').first().evaluate((el) => getComputedStyle(el).animationName)).toBe('hero-in');
    await page.waitForTimeout(1500);
    const looping = await page.evaluate(
      () => document.getAnimations().filter((a) => (a.effect as KeyframeEffect).getComputedTiming().iterations === Infinity).length,
    );
    expect(looping, 'infinite animations').toBe(0);
  });

  test('cards lift on hover', async ({ page }) => {
    await page.goto('/');
    const card = page.locator('#what-i-bring .card-lift').first();
    await card.scrollIntoViewIfNeeded();
    await page.waitForTimeout(1200); // let the scroll-in finish
    await card.hover();
    await page.waitForTimeout(400);
    expect(await card.evaluate((el) => getComputedStyle(el).transform)).not.toBe('none');
  });
});

test.describe('prefers-reduced-motion: reduce', () => {
  test.use({ reducedMotion: 'reduce' });

  test('content is visible immediately and the hero does not animate', async ({ page }) => {
    await page.goto('/');
    const hidden = await page.evaluate(
      () => [...document.querySelectorAll('[data-reveal]')].filter((el) => getComputedStyle(el).opacity === '0').length,
    );
    expect(hidden).toBe(0);
    expect(await page.locator('.hero-in').first().evaluate((el) => getComputedStyle(el).animationName)).toBe('none');
  });

  test('smooth scrolling is off', async ({ page }) => {
    await page.goto('/');
    expect(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior)).toBe('auto');
  });

  test('cards do not lift on hover', async ({ page }) => {
    await page.goto('/');
    const card = page.locator('#what-i-bring .card-lift').first();
    await card.scrollIntoViewIfNeeded();
    await card.hover();
    await page.waitForTimeout(400);
    expect(await card.evaluate((el) => getComputedStyle(el).transform)).toBe('none');
  });
});
