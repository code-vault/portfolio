import { test, expect, type Page } from '@playwright/test';
import { NAV_LINKS, PAGES } from './helpers';

const nav = (page: Page) => page.getByRole('navigation', { name: 'Main' });

test('desktop nav has Home, Projects and Experience in order, plus a "Get in touch" button', async ({ page }) => {
  await page.goto('/');
  const labels = await nav(page).locator('[data-nav-links]').getByRole('link').allTextContents();
  expect(labels).toEqual(['Home', 'Projects', 'Experience']);
  await expect(nav(page).getByRole('link', { name: 'Get in touch' })).toBeVisible();
});

for (const { label, path } of NAV_LINKS) {
  test(`nav link "${label}" goes to ${path} and is marked as the current page`, async ({ page }) => {
    await page.goto(label === 'Home' ? '/projects/' : '/');
    await nav(page).getByRole('link', { name: label, exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`${path === '/' ? '/$' : path.replace(/\//g, '\\/') + '$'}`));
    await expect(nav(page).locator('[aria-current="page"]')).toHaveText(label);
    await expect(nav(page).locator('[aria-current="page"]')).toHaveCount(1);
  });
}

for (const { name, path } of PAGES) {
  test(`on the ${name} page, only its own nav link is marked current`, async ({ page }) => {
    await page.goto(path);
    const expected = NAV_LINKS.find((l) => l.path === path)!.label;
    await expect(nav(page).locator('[aria-current="page"]')).toHaveText(expected);
  });
}

test('"Get in touch" scrolls to the contact section on Home', async ({ page }) => {
  await page.goto('/');
  await nav(page).getByRole('link', { name: 'Get in touch' }).click();
  await expect(page).toHaveURL(/\/#contact$/);
  await expect(page.locator('#contact')).toBeInViewport({ timeout: 8000 });
});

test('"Get in touch" from another page lands on the contact section', async ({ page }) => {
  await page.goto('/experience/');
  await nav(page).getByRole('link', { name: 'Get in touch' }).click();
  await expect(page).toHaveURL(/\/#contact$/);
  await expect(page.locator('#contact')).toBeInViewport({ timeout: 8000 });
});

test('"View my work" goes to the Projects page', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'View my work' }).click();
  await expect(page).toHaveURL(/\/projects\/$/);
});

test('"See all projects →" goes to the Projects page', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'See all projects →' }).click();
  await expect(page).toHaveURL(/\/projects\/$/);
});

test('brand link returns Home', async ({ page }) => {
  await page.goto('/projects/');
  await nav(page).getByRole('link', { name: 'Devarshi Ojha' }).click();
  await expect(page).toHaveURL(/\/$/);
});

test('skip link is the first thing keyboard users reach and it jumps to main content', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  const skip = page.getByRole('link', { name: 'Skip to content' });
  await expect(skip).toBeFocused();
  await expect(skip).toBeInViewport();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/#main$/);
});
