import type { Page } from '@playwright/test';

// Scroll through the whole page so every scroll-in animation fires, then wait for them to finish.
// (Content is hidden until it scrolls into view, so checks that read the whole page call this first.)
export async function scrollThroughPage(page: Page): Promise<void> {
  const height = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < height; y += 400) {
    await page.evaluate((top) => window.scrollTo({ top, behavior: 'instant' }), y);
    await page.waitForTimeout(100);
  }
  await page.waitForTimeout(1500);
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
}

// The sections in the nav, in order: nav label -> section id.
export const SECTIONS = [
  { label: 'Work', id: 'work' },
  { label: 'What I do', id: 'what-i-do' },
  { label: 'Experience', id: 'experience' },
  { label: 'Skills', id: 'skills' },
  { label: 'About', id: 'about' },
  { label: 'Contact', id: 'contact' },
] as const;
