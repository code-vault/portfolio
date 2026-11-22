// BLOCKING link checks: internal links on every page, the resume download and the email link.
// External websites are checked separately in external-links.spec.ts (non-blocking).
import { test, expect } from '@playwright/test';
import { PAGES } from './helpers';

test('every internal link on every page responds 200', async ({ page, request }) => {
  const urls = new Set<string>();
  for (const { path } of PAGES) {
    await page.goto(path);
    const hrefs = await page.$$eval('a[href^="/"]', (links) => links.map((a) => a.getAttribute('href') as string));
    hrefs.forEach((h) => urls.add(h.split('#')[0] || '/'));
  }
  expect(urls.size).toBeGreaterThanOrEqual(4); // /, /projects/, /experience/, the resume PDF
  for (const url of urls) {
    const res = await request.get(url);
    expect(res.status(), `${url} should respond 200`).toBe(200);
  }
});

test('every in-page #anchor points at an element that exists', async ({ page }) => {
  for (const { path } of PAGES) {
    await page.goto(path);
    const hashes = await page.$$eval('a[href^="#"]', (links) =>
      [...new Set(links.map((a) => a.getAttribute('href') as string))].filter((h) => h.length > 1),
    );
    for (const hash of hashes) await expect(page.locator(hash), `${path} ${hash}`).toHaveCount(1);
  }
  // The "Get in touch" target lives on Home
  await page.goto('/');
  await expect(page.locator('#contact')).toHaveCount(1);
});

// The resume button appears twice on Home (hero and contact): both must download the real PDF.
for (const which of ['first', 'last'] as const) {
  test(`resume downloads as a real PDF (${which === 'first' ? 'hero' : 'contact'} button)`, async ({ page }) => {
    await page.goto('/');
    const link = page.getByRole('link', { name: 'Download resume (PDF)' });
    await expect(link).toHaveCount(2);
    const [download] = await Promise.all([page.waitForEvent('download'), link[which]().click()]);
    expect(download.suggestedFilename()).toBe('Devarshi_Ojha_Resume.pdf');

    // Check the file itself: it must start with the PDF magic bytes, not an HTML error page.
    const stream = await download.createReadStream();
    const firstChunk = await new Promise<Uint8Array>((resolve, reject) => {
      stream.once('data', resolve);
      stream.once('error', reject);
    });
    expect(new TextDecoder().decode(firstChunk.subarray(0, 5))).toBe('%PDF-');
  });
}

test('resume URL responds 200 with a PDF content type', async ({ request }) => {
  const res = await request.get('/resume/Devarshi_Ojha_Resume.pdf');
  expect(res.status()).toBe(200);
  expect(res.headers()['content-type']).toContain('pdf');
});

test('email appears as text and as a mailto link in the contact section', async ({ page }) => {
  await page.goto('/');
  const link = page.locator('#contact a[href="mailto:career.devarshi@gmail.com"]');
  await expect(link).toBeVisible();
  await expect(link).toHaveText('career.devarshi@gmail.com');
});

test('unknown URLs get the 404 status', async ({ request }) => {
  const res = await request.get('/this-page-does-not-exist');
  expect(res.status()).toBe(404);
});
