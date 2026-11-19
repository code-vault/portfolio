import { test, expect } from '@playwright/test';
import { SECTIONS } from './helpers';

const nav = (page: import('@playwright/test').Page) => page.getByRole('navigation', { name: 'Main' });

for (const { label, id } of SECTIONS) {
  test(`nav link "${label}" scrolls to #${id} and becomes the active link`, async ({ page }) => {
    await page.goto('/');
    await nav(page).getByRole('link', { name: label, exact: true }).click();

    await expect(page).toHaveURL(new RegExp(`#${id}$`));
    // Smooth scrolling takes a moment. Done = the section's top sits just under the sticky nav,
    // OR the page can't scroll any further (the last section, Contact, is shorter than the screen).
    await expect
      .poll(
        () =>
          page.evaluate((sectionId) => {
            const top = document.getElementById(sectionId)!.getBoundingClientRect().top;
            const atBottom = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2;
            return top < 140 || atBottom;
          }, id),
        { timeout: 8000 },
      )
      .toBe(true);
    await expect(page.locator(`#${id}`)).toBeInViewport();

    await expect(nav(page).locator('[aria-current="location"]')).toHaveText(label);
  });
}

test('"View my work" scrolls to the case studies', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'View my work' }).click();
  await expect(page.locator('#work')).toBeInViewport();
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
