# Devarshi Ojha: portfolio

Personal portfolio site for **Devarshi Ojha**, Lead SDET focused on AI quality and GenAI evaluation.
Live at https://devarshiojha.dev (GitHub Pages, repo `code-vault/portfolio`).

It is a single page: hero with an animated pipeline, count-up stats, four case studies, what I do,
experience timeline, skills, about and contact. It is built to be small, fast, accessible, and
**tested like a product**, because the quality layer is part of the story.

## Stack and why

| Choice | Why |
|---|---|
| **Astro** (static output) + **TypeScript** (strict) | Ships almost no JavaScript, so the site is fast. Strict types catch mistakes at build time. |
| **Tailwind CSS v4** | Small utility classes next to the markup. Theme colours live in one place, `src/styles/global.css`. |
| **Motion** (`motion` npm package) | Scroll-in reveals and the stat count-up. Everything else is plain CSS (hover lift, hero pipeline). |
| **Astro content collections + Zod** | Content lives in files, separate from layout code. A missing required field fails the build with a clear error. |
| **Inter**, self-hosted (`@fontsource-variable/inter`) | No calls to Google Fonts, so it is faster and more private. |
| **Playwright** + **axe-core** | Browser tests, including accessibility checks. |
| **Lighthouse CI** | Performance, Accessibility, Best Practices and SEO budgets. |
| **GitHub Actions** → **GitHub Pages** | Free hosting, with deploys gated on the tests. |

No tracking or analytics scripts. No photo.

## Run it locally

You need the Node version in `.nvmrc` (26). With nvm: `nvm use`.

```bash
npm install          # install dependencies (first time)
npm run dev          # dev server at http://localhost:4321, reloads on save
npm run check        # type-check (astro check)
npm run build        # production build into dist/ (also generates public/og.png)
npm run preview      # serve the built site
```

Tests (first time only: `npx playwright install chromium`):

```bash
npm test                 # build + Playwright, blocking set
npm run test:external    # build + check external links (not blocking in CI)
npm run lighthouse       # build + Lighthouse CI (3 runs, median >= 90)
```

## Changing content (no component edits needed)

Everything you can edit is in `src/content/`. Components only read it.

```
src/content/
├─ site.json           name, headline, one-liner, meta title/description, hero pipeline steps,
│                      about text, contact intro, email, links, resume path
├─ stats.json          the six count-up numbers
├─ skills.json         skill groups
├─ capabilities.json   the six "What I do" tiles
├─ projects/           one .md per case study (and side project)
└─ experience/         one .md per role
```

### Add a case study
Create `src/content/projects/6-my-project.md` (the number prefix is only for tidy sorting; `order` decides placement):

```md
---
title: "Short title"
order: 6
company: "Company"
problem: "What was wrong."
solution: "What you did."
impact:
  - "First result"
  - "Second result"
diagram: ["Step 1", "Step 2", "Step 3"]   # shown as a step-flow, at least 2 steps
tags: ["Playwright", "TypeScript"]
link: "https://example.com"                 # optional
---
```

### Add a side project (smaller card)
Same folder, with `side: true`. It needs only `title`, `order`, `company`, `description` and `link`:

```md
---
title: "My side project"
order: 7
company: "Side project"
side: true
description: "One or two sentences."
tags: ["Next.js"]
link: "https://example.com"
---
```

### Add a role
Create `src/content/experience/my-company.md`. Dates are `MM/YYYY` (or `Present`); the timeline sorts itself, newest first:

```md
---
company: "Company"
role: "Job title"
start: "06/2026"
end: "Present"
location: "City"            # optional
highlights:
  - "What you did"
tags: ["Playwright"]
---
```

If a required field is missing, `npm run build` stops and names the file and the field.

### Change the resume
Replace `public/resume/Devarshi_Ojha_Resume.pdf` (keep the file name). **Use a copy with no phone number**: this file is public.

## Quality gates

Every push and pull request runs `.github/workflows/ci.yml`:

| Step | Fails the run when |
|---|---|
| Type-check (`astro check`) | any TypeScript or Astro type error |
| Build | content fails its schema, or the build errors |
| Playwright (blocking set) | any of: console or network errors on load; nav links not scrolling to the right section; broken internal anchors; resume not downloading as a real PDF; layout overflow at mobile, tablet or desktop width; axe-core accessibility violations; reduced-motion not switching animations off; missing SEO files |
| Lighthouse CI | the **median of 3 runs** is below 90 in Performance, Accessibility, Best Practices or SEO |

**Deploy** runs only on a push to `main`, and only if all of the above passed.

**External links** (LinkedIn, GitHub and so on) are checked in a separate, non-blocking job. Other sites can be down or
block bots (LinkedIn answers 999), and that should never stop a deploy. The job counts 401/403/405/429/999 as "site is there".

Reports for Playwright and Lighthouse are attached to each run as downloadable artifacts.

## Deployment (one-time setup)

1. In the GitHub repo: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
2. After the first successful deploy: **Settings → Pages → Custom domain** = `devarshiojha.dev`, then tick **Enforce HTTPS**.
3. DNS at the registrar: four `A` records and four `AAAA` records on the apex pointing to GitHub Pages
   (see GitHub's "Managing a custom domain for your GitHub Pages site"), and optionally a `www` CNAME to `code-vault.github.io`.

## Project layout

```
src/
├─ content/            all editable content (see above)
├─ content.config.ts   Zod schemas for the content
├─ components/         one component per section, plus small shared pieces
├─ layouts/            BaseLayout.astro: <head>, SEO, nav, footer
├─ pages/              index.astro (assembles sections) and 404.astro
├─ scripts/            small TypeScript modules: reveal, count-up, active-nav
└─ styles/global.css   Tailwind import and theme tokens (accent colour lives here)
scripts/generate-og.mjs  builds public/og.png from site.json at build time
tests/                 Playwright specs
public/                static files: CNAME, robots.txt, sitemap.xml, favicon, resume
```

Animations respect `prefers-reduced-motion`: the hero pulse, scroll-in reveals, count-up, card lift and smooth scrolling all switch off.
