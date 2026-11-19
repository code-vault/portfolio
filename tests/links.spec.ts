// BLOCKING link checks: internal anchors, the resume download and the email link.
// External websites are checked separately in external-links.spec.ts (non-blocking).
import { test, expect } from '@playwright/test';

test('every internal #anchor link points at an element that exists', async ({ page }) => {
  await page.goto('/');
  const hashes = await page.$$eval('a[href^="#"]', (links) =>
    [...new Set(links.map((a) => a.getAttribute('href') as string))].filter((h) => h.length > 1),
  );
  expect(hashes.length).toBeGreaterThan(5);
  for (const hash of hashes) {
    await expect(page.locator(hash), `${hash} target should exist`).toHaveCount(1);
  }
});

test('resume downloads as a real PDF', async ({ page }) => {
  await page.goto('/');
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('link', { name: 'Download resume' }).first().click(),
  ]);
  expect(download.suggestedFilename()).toBe('Devarshi_Ojha_Resume.pdf');

  // Check the file itself: it must start with the PDF magic bytes, not an HTML error page.
  const stream = await download.createReadStream();
  const firstChunk = await new Promise<Uint8Array>((resolve, reject) => {
    stream.once('data', resolve);
    stream.once('error', reject);
  });
  expect(new TextDecoder().decode(firstChunk.subarray(0, 5))).toBe('%PDF-');
});

test('resume URL responds 200 with a PDF content type', async ({ request }) => {
  const res = await request.get('/resume/Devarshi_Ojha_Resume.pdf');
  expect(res.status()).toBe(200);
  expect(res.headers()['content-type']).toContain('pdf');
});

test('email appears as text and as a mailto link', async ({ page }) => {
  await page.goto('/');
  const contact = page.locator('#contact');
  await expect(contact.getByText('career.devarshi@gmail.com')).toBeVisible();
  await expect(contact.locator('a[href="mailto:career.devarshi@gmail.com"]').first()).toBeVisible();
});

test('the 404 page exists for unknown URLs', async ({ request }) => {
  const res = await request.get('/this-page-does-not-exist');
  expect(res.status()).toBe(404);
});
