import { test, expect } from '@playwright/test';

test('og.png is a PNG image', async ({ request }) => {
  const res = await request.get('/og.png');
  expect(res.status()).toBe(200);
  expect(res.headers()['content-type']).toContain('image/png');
});

test('og:image and canonical use the production domain', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', 'https://devarshiojha.dev/og.png');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://devarshiojha.dev/');
});

test('robots.txt allows crawling and points at the sitemap', async ({ request }) => {
  const res = await request.get('/robots.txt');
  expect(res.status()).toBe(200);
  const body = await res.text();
  expect(body).toContain('Allow: /');
  expect(body).toContain('Sitemap: https://devarshiojha.dev/sitemap.xml');
});

test('sitemap.xml lists the home page', async ({ request }) => {
  const res = await request.get('/sitemap.xml');
  expect(res.status()).toBe(200);
  expect(await res.text()).toContain('<loc>https://devarshiojha.dev/</loc>');
});

test('custom 404 page is served, is not indexed and links home', async ({ page }) => {
  const res = await page.goto('/no-such-page');
  expect(res?.status()).toBe(404);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Page not found');
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex');
  await expect(page.getByRole('link', { name: 'Back to the home page' })).toHaveAttribute('href', '/');
});

test('CNAME file ships with the site (GitHub Pages custom domain)', async ({ request }) => {
  const res = await request.get('/CNAME');
  expect(res.status()).toBe(200);
  expect((await res.text()).trim()).toBe('devarshiojha.dev');
});
