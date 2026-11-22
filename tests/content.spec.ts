// Guards the actual copy and the visual rules, so a content or style change that breaks them is caught.
// Strings below come from docs/content-v2.md (via src/content/). If you intentionally change copy, update them here.
import { test, expect } from '@playwright/test';

test.describe('Home', () => {
  test.beforeEach(async ({ page }) => { await page.goto('/'); });

  test('hero: headline with the accent word, badge, intro, buttons, previously at', async ({ page }) => {
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('I make releases boring, in the best way.');
    await expect(page.locator('h1 .gradient-text')).toHaveText('boring');
    await expect(page.getByText('Lead SDET · Test architecture')).toBeVisible();
    await expect(page.getByText("I'm Devarshi Ojha, a Lead SDET. I design the test architecture behind web, mobile and API products, and the AI systems shipping alongside them: frameworks for what's predictable, evaluation for what isn't.")).toBeVisible();
    await expect(page.getByRole('link', { name: 'View my work' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Download resume (PDF)' }).first()).toContainText('Resume');
    await expect(page.getByRole('list', { name: 'Previously at' }).getByRole('listitem')).toHaveText([
      'KlearNow.AI', 'Avis Budget Group (via StatusNeo)', 'Publicis Sapient',
    ]);
  });

  test('"How I test" card has four equal rows and the monospace footer, with no "Now" pill', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'How I test' })).toBeVisible();
    const rows = page.locator('.how-row');
    await expect(rows).toHaveCount(4);
    await expect(rows.locator('> span:first-child')).toHaveText(['UI', 'Mobile', 'API & services', 'AI & agents']);
    await expect(page.getByText('Now', { exact: true })).toHaveCount(0);
    await expect(page.getByText('✓ ui ✓ mobile ✓ api ✓ ai')).toBeVisible();
  });

  test('the removed product-style pieces are gone (pipeline card, tool chips, stats strip)', async ({ page }) => {
    for (const text of ['End-to-end pipeline', 'Working with', 'years in quality engineering', 'AI evaluation run time']) {
      await expect(page.getByText(text, { exact: false })).toHaveCount(0);
    }
    await expect(page.locator('.pipeline, [data-count]')).toHaveCount(0);
  });

  test('selected work shows only cards 01 and 03, then a link to all projects', async ({ page }) => {
    const cards = page.locator('#work article');
    await expect(cards).toHaveCount(2);
    await expect(cards.nth(0)).toContainText('01');
    await expect(cards.nth(0)).toContainText('Making a GenAI pipeline measurable');
    await expect(cards.nth(1)).toContainText('03');
    await expect(cards.nth(1)).toContainText('Agents on the first draft, people on the final say');
    await expect(page.getByRole('link', { name: 'See all projects →' })).toBeVisible();
  });

  test('what I bring, about and contact copy', async ({ page }) => {
    await expect(page.locator('#what-i-bring h3')).toHaveText([
      'Test architecture', 'Frameworks that scale', 'Services and data', 'Performance', 'AI evaluation', 'Quality leadership',
    ]);
    await expect(page.getByRole('heading', { name: 'A bit about me.' })).toBeVisible();
    await expect(page.locator('#about')).toContainText('I design testing for both.');
    await expect(page.locator('#about')).not.toContainText('newest layer');
    await expect(page.getByRole('heading', { name: "Let's talk." })).toBeVisible();
    await expect(page.locator('#contact')).toContainText("I'm exploring Lead SDET and AI quality roles.");
    await expect(page.getByRole('contentinfo')).toHaveText(/© \d{4} Devarshi Ojha · Built with Astro, tested with Playwright\./);
  });
});

test.describe('Projects', () => {
  test.beforeEach(async ({ page }) => { await page.goto('/projects/'); });

  test('heading, intro and four numbered cards plus the side project', async ({ page }) => {
    await expect(page.getByRole('heading', { level: 1 })).toHaveText("Systems I've shaped.");
    await expect(page.getByText('Four problems, each a different layer of the stack. The numbers are on each card.')).toBeVisible();
    await expect(page.locator('article h2')).toHaveText([
      'Making a GenAI pipeline measurable',
      'Testing a mainframe-to-cloud migration',
      'Agents on the first draft, people on the final say',
      'One foundation, sixteen teams',
      'Solar business website',
    ]);
    await expect(page.getByText('KlearNow.AI · 2026').first()).toBeVisible();
    await expect(page.getByText('Avis Budget Group, via StatusNeo · 2022–2025')).toBeVisible();
    await expect(page.getByText('StatusNeo Quality CoE · 2022–2025')).toBeVisible();
  });

  test('each card shows exactly the agreed metrics (number + caption)', async ({ page }) => {
    const expected = [
      ['5–6h → ~3h|evaluation run time', '~2,000|real documents in the golden set', '8|document classes gated in CI'],
      ['8h → 3h|full regression', '~60%|less flakiness', '6,000 → 1,200|legacy cases turned into layered tests'],
      ['~500|generated test cases', '1d + 1d|generate + human review per sprint (was 2–3 days)', '100%|human-reviewed'],
      ['16|teams adopted it', '20+|engineers trained', '7|teams I onboarded myself'],
    ];
    const cards = page.locator('article').filter({ has: page.locator('dl') });
    await expect(cards).toHaveCount(4);
    for (let i = 0; i < 4; i++) {
      const pairs = await cards.nth(i).locator('dl > div').evaluateAll((rows) =>
        rows.map((r) => `${r.querySelector('dd')!.textContent!.trim()}|${r.querySelector('dt')!.textContent!.trim()}`),
      );
      expect(pairs, `card ${i + 1}`).toEqual(expected[i]);
    }
  });

  test('architecture chips, the "Also" line, the TestCraft link and the side project link', async ({ page }) => {
    const first = page.locator('article').first();
    await expect(first.getByRole('list', { name: 'Architecture steps' }).getByRole('listitem')).toHaveText(['Documents', 'Classify', 'Extract', 'Eval gates', 'Arize']);
    await expect(first).toContainText('Also: caught a regional regression before customers did.');
    await expect(page.getByRole('link', { name: /github\.com\/TestCraftStatusneo/ })).toHaveAttribute('href', 'https://github.com/TestCraftStatusneo');
    await expect(page.getByRole('link', { name: /pes-web\.vercel\.app/ })).toHaveAttribute('href', 'https://pes-web.vercel.app');
  });
});

test.describe('Experience', () => {
  test.beforeEach(async ({ page }) => { await page.goto('/experience/'); });

  test('heading and the four-step path', async ({ page }) => {
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Nine years, one layer at a time.');
    const steps = await page.locator('#path-title ~ ol > li').evaluateAll((li) =>
      li.map((x) => [...x.querySelectorAll('p')].map((p) => p.textContent!.trim()).join(' ')),
    );
    expect(steps).toEqual(['2016 Web automation', '2019 Mobile apps and content platforms', '2022 Test architecture at enterprise scale', '2026 AI evaluation and agentic QA']);
  });

  test('roles newest first, with years derived from the dates and no tags or locations', async ({ page }) => {
    const roles = await page.locator('#roles-title ~ ol > li').evaluateAll((li) =>
      li.map((x) => `${x.querySelector('h3')!.textContent!.replace(/\s+/g, ' ').trim()} | ${x.querySelector('h3 + p')!.textContent!.trim()}`),
    );
    expect(roles).toEqual([
      'KlearNow.AI · Lead Quality Assurance Engineer, AI Ops | 2026',
      'Career break | 2025–2026',
      'StatusNeo Consulting · Senior Consultant | 2022–2025',
      'Publicis Sapient · Senior QE Associate | 2019–2022',
      'I3infosoft · QA Consultant | 2016–2019',
    ]);
    await expect(page.locator('#roles-title ~ ol')).not.toContainText('Gurugram');
    await expect(page.locator('#roles-title ~ ol .chip')).toHaveCount(0);
  });

  test('skills are grouped by layer, including Pytest, Claude Code and Cursor', async ({ page }) => {
    await expect(page.locator('#skills-title ~ ul h3')).toHaveText([
      'UI', 'Mobile', 'API & services', 'AI & agents', 'Performance & security', 'CI/CD & cloud', 'Ways of working', 'Languages',
    ]);
    const group = (name: string) => page.locator('#skills-title ~ ul section').filter({ has: page.getByRole('heading', { name, exact: true }) });
    await expect(group('UI')).toContainText('Pytest');
    await expect(group('AI & agents')).toContainText('Claude Code');
    await expect(group('AI & agents')).toContainText('Cursor');
  });
});

test.describe('Visual rules (light, editorial, violet accent)', () => {
  for (const path of ['/', '/projects/', '/experience/']) {
    test(`${path}: light background, near-black headings, no dark surfaces, no green`, async ({ page }) => {
      await page.goto(path);
      const result = await page.evaluate(() => {
        // Chromium reports colours in several formats (rgb, color(srgb ...), oklab ...).
        // Painting one pixel on a canvas converts any of them to plain [r, g, b, a] (0-255, a 0-1).
        const ctx = document.createElement('canvas').getContext('2d', { willReadFrequently: true })!;
        const rgb = (c: string) => {
          ctx.clearRect(0, 0, 1, 1);
          ctx.fillStyle = c;
          ctx.fillRect(0, 0, 1, 1);
          const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data;
          return [r, g, b, a / 255];
        };
        const lum = ([r, g, b]: number[]) => (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
        const problems: string[] = [];
        // Allowed dark surfaces: the black pill buttons, the black "DO" monogram and the small violet dots.
        const allowedDark = '.btn-primary, [data-brand] *, .bg-violet, .skip-link';
        for (const el of document.querySelectorAll('body *')) {
          const cs = getComputedStyle(el);
          const bg = rgb(cs.backgroundColor);
          if (bg.length >= 3 && (bg[3] ?? 1) > 0.5 && lum(bg) < 0.25 && !el.matches(allowedDark) && !el.closest(allowedDark)) {
            problems.push(`dark surface: ${el.tagName.toLowerCase()}.${String(el.className).slice(0, 40)}`);
          }
          for (const prop of ['color', 'backgroundColor', 'borderTopColor'] as const) {
            const c = rgb(cs[prop]);
            if (c.length >= 3 && (c[3] ?? 1) > 0.2 && c[1] > c[0] + 30 && c[1] > c[2] + 30) problems.push(`green ${prop}: ${el.tagName.toLowerCase()}`);
          }
        }
        return {
          body: getComputedStyle(document.body).backgroundColor,
          h1: getComputedStyle(document.querySelector('h1')!).color,
          problems: problems.slice(0, 5),
        };
      });
      expect(result.body).toBe('rgb(250, 250, 250)');
      expect(result.h1).toBe('rgb(10, 10, 10)');
      expect(result.problems).toEqual([]);
    });
  }
});
