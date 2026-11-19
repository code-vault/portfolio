import { test, expect } from '@playwright/test';
import { scrollThroughPage } from './helpers';

test('page loads with no console errors, page errors or failed requests', async ({ page }) => {
  const problems: string[] = [];
  page.on('console', (msg) => { if (msg.type() === 'error') problems.push(`console: ${msg.text()}`); });
  page.on('pageerror', (err) => problems.push(`pageerror: ${err.message}`));
  page.on('requestfailed', (req) => problems.push(`request failed: ${req.url()}`));
  page.on('response', (res) => { if (res.status() >= 400) problems.push(`HTTP ${res.status()}: ${res.url()}`); });

  await page.goto('/');
  await scrollThroughPage(page); // trigger every animation script too

  expect(problems).toEqual([]);
});

test('has the exact meta title and description, and one h1', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle('Devarshi Ojha · Lead SDET, AI Quality & GenAI Evaluation');
  await expect(page.locator('meta[name="description"]')).toHaveAttribute(
    'content',
    'Lead SDET with 9+ years in test automation, AI evaluation and agentic QA: Playwright, API and NFR testing, CI quality gates.',
  );
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Devarshi Ojha');
});

test('has Open Graph and Twitter tags', async ({ page }) => {
  await page.goto('/');
  for (const sel of ['meta[property="og:title"]', 'meta[property="og:image"]', 'meta[name="twitter:card"]']) {
    await expect(page.locator(sel)).toHaveAttribute('content', /.+/);
  }
});
