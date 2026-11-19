# CLAUDE.md

Personal portfolio for Devarshi Ojha (Lead SDET, AI Quality & GenAI Evaluation).
The owner wants code they can read and maintain: **simple and well commented beats clever**.

## Stack (decided, do not change)
- Astro (latest stable) + TypeScript (strict)
- Tailwind CSS v4 (via `@tailwindcss/vite`, theme tokens in `src/styles/global.css`)
- `motion` (vanilla JS) for animation; plain CSS where possible
- Inter, self-hosted via `@fontsource-variable/inter` (no Google Fonts calls)
- Content in Astro content collections with Zod schemas (`src/content.config.ts`)
- Testing: Playwright (TypeScript) + axe-core, Lighthouse CI
- Hosting: GitHub Pages, repo `code-vault/portfolio`, custom domain https://devarshiojha.dev
  (`site` set in `astro.config.mjs`, no `base`, `public/CNAME` = `devarshiojha.dev`), deployed by GitHub Actions
- Node version is pinned in `.nvmrc` (26); CI uses `actions/setup-node` with `node-version-file`

**Ask before adding any dependency** not already listed above (e.g. a sitemap package: use a static file instead unless approved).

## Content rules (important)
- Use ONLY content the owner has provided. **Never invent** numbers, companies, claims, testimonials or diagram steps.
- If something is missing, leave a clearly marked `TODO` instead of guessing.
- Copy is exact: use the owner's wording as given.
- All editable content lives in `src/content/` (projects/, experience/, stats.json, skills.json,
  capabilities.json, site.json). Changing content must never require touching components.
- A missing required field must fail the build with a clear Zod error.
- No photo. No tracking or analytics scripts.
- **Resume:** the site offers a "Download resume" button for `public/resume/Devarshi_Ojha_Resume.pdf`.
  That file is public, so it must be a **website copy with no phone number**. It is committed.
  Root-level PDFs (`/*.pdf`) are gitignored and are the owner's local copies only.
  Never commit or publish a PDF containing a phone number.

## Design
Dark theme, one accent colour (teal `#2dd4bf`) on near-black slate, Inter, generous spacing,
single page, smooth scroll, sticky nav with active-section highlight. Mobile first.
Accessible: semantic HTML, keyboard navigable, visible focus, good contrast, honour `prefers-reduced-motion`
(all JS animations must check it).

## Commands
```
npm install              # install (use the Node version in .nvmrc)
npm run dev              # local dev server, http://localhost:4321
npm run check            # astro check (TypeScript + Astro type-check)
npm run build            # static build into dist/ (prebuild generates public/og.png from site.json)
npm run preview          # serve the built site
npm test                 # build + Playwright, blocking project "site"
npm run test:external    # build + external-link check (non-blocking in CI)
npm run lighthouse       # build + Lighthouse CI (3 runs, median >= 0.9 in all four categories)
```
First time only: `npx playwright install chromium`.

## Testing and CI
- Tests live in `tests/` and run against the **built** site (`astro preview`).
- Playwright has two projects: `site` (blocking) and `external` (external links; own CI job, never blocks deploy;
  401/403/405/429/999 count as "site is there").
- `.github/workflows/ci.yml`: type-check -> build -> Playwright -> Lighthouse on every push/PR;
  deploy to GitHub Pages only from `main` and only if `quality` passed.
- Do not weaken a test to make it pass: fix the site, or explain why the test expectation is wrong.
- `@types/node` is deliberately not installed (not approved). `playwright.config.ts` declares the one Node global it needs.

## Other decisions
- Nav: 5 links (Work, What I do, Experience, Skills, Contact). About stays on the page and is linked from the footer.
  Below 768px a menu button opens a full-screen overlay (`src/scripts/mobileMenu.ts`): disclosure pattern, focus trap,
  Esc closes and returns focus to the button, page behind is `inert` and scroll-locked. The overlay is rendered
  OUTSIDE the header on purpose (the header's backdrop-blur would trap a fixed child).
- Active nav highlight is computed from scroll position (`src/scripts/activeNav.ts`), not from observer events.
- In Playwright tests, open the mobile menu with a real mouse click at the button's position when checking scroll
  (locator.click() scrolls a sticky element "into view" and wrongly moves the page).
- Playwright's webServer uses `astro preview ... --ignore-lock` so a stale preview lock never makes it exit early.
- Hero pipeline is pure CSS. Scroll-in and count-up use `motion` and skip when reduced motion is requested.
- Reveal animations run on a wrapper element; the hover lift runs on the inner card, so they never fight.
- `public/og.png` is generated (gitignored) from `site.json`. `public/robots.txt` and `public/sitemap.xml` are static; no sitemap package.
- Approved extra dev dependencies: `sharp` (OG image), `@axe-core/playwright`, `@lhci/cli`, `@playwright/test`.

## Workflow
Small steps, one commit per step, clear commit messages.
