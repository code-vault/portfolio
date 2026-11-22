// NON-BLOCKING check (own CI job): do the external links on the site respond?
// Sites like LinkedIn block bots and answer 999 / 403 / 429. Those mean "the site is there", so we allow them.
// Only real failures (network errors, 404, 5xx) fail this test.
import { test, expect } from '@playwright/test';
import { PAGES } from './helpers';

const BOT_BLOCKED = [401, 403, 405, 429, 999];

test('external links respond', async ({ page, request }) => {
  const urls = new Set<string>();
  for (const { path } of PAGES) {
    await page.goto(path);
    const hrefs = await page.$$eval('a[href^="http"]', (links) => links.map((a) => (a as HTMLAnchorElement).href));
    hrefs.forEach((h) => urls.add(h));
  }
  expect(urls.size).toBeGreaterThan(0);

  const failures: string[] = [];
  for (const url of urls) {
    if (url.startsWith('http://127.0.0.1')) continue; // our own site
    try {
      const res = await request.get(url, { timeout: 20_000, maxRedirects: 5 });
      const ok = res.status() < 400 || BOT_BLOCKED.includes(res.status());
      if (!ok) failures.push(`${url} -> HTTP ${res.status()}`);
    } catch (err) {
      failures.push(`${url} -> ${(err as Error).message}`);
    }
  }
  expect(failures, 'External links that failed').toEqual([]);
});
