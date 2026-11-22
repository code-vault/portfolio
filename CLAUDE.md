# CLAUDE.md

Personal portfolio for Devarshi Ojha (Lead SDET: test architecture for web, mobile and API products, and AI systems).
The owner wants code they can read and maintain: **simple and well commented beats clever**.

## Stack (decided, do not change)
- Astro (latest stable) + TypeScript (strict)
- Tailwind CSS v4 (via `@tailwindcss/vite`, theme tokens in `src/styles/global.css`)
- `motion` (vanilla JS) for the scroll-in reveal only; plain CSS for everything else
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
- All editable content lives in `src/content/` (projects/, experience/, skills.json, capabilities.json, site.json).
  Changing content must never require touching components. Small UI words (button labels such as "View my work",
  card sub-labels such as PROBLEM / WHAT I DID) are the only text allowed in components.
- The agreed copy comes from the owner's content draft `docs/content-v2.md` (kept locally, deliberately NOT committed).
  Numbers appear only inside the project cards; elsewhere they are hinted at ("roughly halved", "sixteen teams").
  `tests/content.spec.ts` pins the exact headline, intro, metrics and years: update it together with any copy change.
- A missing required field must fail the build with a clear Zod error.
- No photo. No tracking or analytics scripts.
- **Resume:** the site offers a "Download resume" button for `public/resume/Devarshi_Ojha_Resume.pdf`.
  That file is public, so it must be a **website copy with no phone number**. It is committed.
  Root-level PDFs (`/*.pdf`) are gitignored and are the owner's local copies only.
  Never commit or publish a PDF containing a phone number.

## Design
Light, editorial, minimal (Linear/Vercel-style portfolio), NOT a dark SaaS landing page:
- Near-white page (`#fafafa`) with a very subtle violet tint at the top of the hero; white cards with 1px neutral
  borders and large radius; soft shadow on hover. Inter, generous spacing, typography doing most of the work.
- One accent, violet. Bright violet (`#7c3aed`, gradient to `#a855f7`) is for LARGE text and decoration only
  (the hero accent word, big metric numbers, dots). Small text (labels, active nav) uses the darker `#6d28d9`
  so contrast stays above 4.5:1.
- Buttons: primary = black pill, secondary = white pill with border. Chips: small monospace on neutral-100.
- No dark backgrounds, no green or teal anywhere, no boxed monospace stat tiles, no "product marketing" widgets.
  `tests/content.spec.ts` fails if a dark surface or any green colour appears.
- Three pages (Home, Projects, Experience), sticky top bar: "DO" monogram + name, Home / Projects / Experience,
  and a black "Get in touch" pill (to `/#contact`). The current page gets `aria-current="page"`.
- Mobile first and accessible: semantic HTML, one `h1` per page and no skipped heading levels, keyboard navigable,
  visible focus, good contrast, honour `prefers-reduced-motion` (all JS animation must check it).

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
- Custom component classes (`.btn`, `.label`, `.chip`, `.card`, `.gradient-text`) live in Tailwind's `components`
  layer in `global.css`, and the global heading colour in the `base` layer, so utility classes can override them.
  (Unlayered CSS beats Tailwind utilities: that once made a "hidden" button show and turned violet labels black.)
- Below 768px a menu button opens a full-screen overlay (`src/scripts/mobileMenu.ts`): disclosure pattern, focus trap,
  Esc closes and returns focus to the button, page behind is `inert` and scroll-locked. The overlay is rendered
  OUTSIDE the header on purpose (the header's backdrop-blur would trap a fixed child).
- Page titles and descriptions come from `site.json` (`pages.*`) via `BaseLayout`'s `page` prop. Canonical and
  `og:url` use the page's own path (with trailing slash).
- Case study cards and section headings take a heading level prop (`h2` on /projects, `h3` under a section heading on Home).
- Reveal animations run on a wrapper element; the hover lift runs on the inner card, so they never fight.
- In Playwright tests: open the mobile menu with a real mouse click at the button's position when checking scroll
  (locator.click() scrolls a sticky element "into view" and wrongly moves the page); the menu button is
  `display:none` on desktop, so `getByRole` cannot see it there (use a CSS locator).
- Playwright's webServer uses `astro preview ... --ignore-lock` so a stale preview lock never makes it exit early.
- Lighthouse CI audits all three pages (3 runs each, median >= 0.9 in every category).
- `public/og.png` is generated (gitignored) from `site.json` (name + badge). `public/robots.txt` and
  `public/sitemap.xml` (3 URLs) are static; no sitemap package.
- Role tags and locations stay in the experience files as optional data but are not displayed.
- Approved extra dev dependencies: `sharp` (OG image), `@axe-core/playwright`, `@lhci/cli`, `@playwright/test`.

## Workflow
Small steps, one commit per step, clear commit messages.
