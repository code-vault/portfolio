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
  The file there is currently a **local-preview copy of the full resume (contains a phone number)**. It is
  excluded from git via `.git/info/exclude`. Before the GitHub repo is created or anything is pushed, the owner must
  replace it with a website copy with **no phone number**, then remove that exclude line and commit it.
  Root-level PDFs (`/*.pdf`) are gitignored.

## Design
Dark theme, one accent colour (teal `#2dd4bf`) on near-black slate, Inter, generous spacing,
single page, smooth scroll, sticky nav with active-section highlight. Mobile first.
Accessible: semantic HTML, keyboard navigable, visible focus, good contrast, honour `prefers-reduced-motion`
(all JS animations must check it).

## Commands
```
npm install        # install (use the Node version in .nvmrc)
npm run dev        # local dev server
npm run check      # astro check (TypeScript + Astro type-check)
npm run build      # static build into dist/
npm run preview    # serve the built site
```
Tests (added in a later step): `npx playwright test`, `npx lhci autorun`.

## Workflow
Small steps, one commit per step, clear commit messages.
