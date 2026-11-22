import { test, expect } from '@playwright/test';

// Exact per-page titles and descriptions (from content/site.json, which follows docs/content-v2.md).
const META = [
  {
    path: '/', url: 'https://devarshiojha.dev/',
    title: 'Devarshi Ojha · Lead SDET',
    description: 'Lead SDET designing test architecture for web, mobile and API products and the AI systems shipping alongside them.',
  },
  {
    path: '/projects/', url: 'https://devarshiojha.dev/projects/',
    title: 'Projects · Devarshi Ojha',
    description: 'Test architecture for AI evaluation, agent-assisted testing, a mainframe-to-cloud migration and a shared QA platform.',
  },
  {
    path: '/experience/', url: 'https://devarshiojha.dev/experience/',
    title: 'Experience · Devarshi Ojha',
    description: 'Nine years of test architecture and QA leadership across web, mobile, APIs and AI systems.',
  },
];

for (const m of META) {
  test(`${m.path}: exact title, description, canonical and Open Graph tags`, async ({ page }) => {
    await page.goto(m.path);
    await expect(page).toHaveTitle(m.title);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', m.description);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', m.url);
    await expect(page.locator('meta[property="og:url"]')).toHaveAttribute('content', m.url);
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', m.title);
    await expect(page.locator('meta[property="og:description"]')).toHaveAttribute('content', m.description);
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', 'https://devarshiojha.dev/og.png');
    await expect(page.locator('meta[name="twitter:image"]')).toHaveAttribute('content', 'https://devarshiojha.dev/og.png');
  });
}

test('og.png is a PNG image', async ({ request }) => {
  const res = await request.get('/og.png');
  expect(res.status()).toBe(200);
  expect(res.headers()['content-type']).toContain('image/png');
});

test('robots.txt allows crawling and points at the sitemap', async ({ request }) => {
  const res = await request.get('/robots.txt');
  expect(res.status()).toBe(200);
  const body = await res.text();
  expect(body).toContain('Allow: /');
  expect(body).toContain('Sitemap: https://devarshiojha.dev/sitemap.xml');
});

test('sitemap.xml lists exactly the three pages', async ({ request }) => {
  const res = await request.get('/sitemap.xml');
  expect(res.status()).toBe(200);
  const locs = [...(await res.text()).matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  expect(locs).toEqual(META.map((m) => m.url));
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
