# Devarshi Ojha: portfolio

Personal portfolio site for **Devarshi Ojha**, Lead SDET (test architecture for web, mobile and API products, and AI systems).
Live at https://devarshiojha.dev (GitHub Pages, repo `code-vault/portfolio`).

It is a small, light, editorial three-page site, built to be fast and accessible and **tested like a product**,
because the quality layer is part of the story:

| Page | What is on it |
|---|---|
| `/` Home | hero with a "How I test" card, two featured case studies, What I bring, About, Contact |
| `/projects/` | all four case studies (problem, what I did, three headline metrics, architecture) and the side project |
| `/experience/` | the four-step career path, the role timeline and skills grouped by layer |

## Stack and why

| Choice | Why |
|---|---|
| **Astro** (static output) + **TypeScript** (strict) | Ships almost no JavaScript, so the site is fast. Strict types catch mistakes at build time. |
| **Tailwind CSS v4** | Small utility classes next to the markup. Theme colours live in one place, `src/styles/global.css`. |
| **Motion** (`motion` npm package) | The scroll-in reveal. Everything else is plain CSS (hover lift, hero entrance). |
| **Astro content collections + Zod** | Content lives in files, separate from layout code. A missing required field fails the build with a clear error. |
| **Inter**, self-hosted (`@fontsource-variable/inter`) | No calls to Google Fonts, so it is faster and more private. Monospace chips use the system monospace font. |
| **Playwright** + **axe-core** | Browser tests, including accessibility checks. |
| **Lighthouse CI** | Performance, Accessibility, Best Practices and SEO budgets on all three pages. |
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
npm run lighthouse       # build + Lighthouse CI (3 pages x 3 runs, median >= 90)
```

## Changing content (no component edits needed)

Everything you can edit is in `src/content/`. Components only read it.

```
src/content/
├─ site.json           name, hero (badge, headline, intro, "Previously at"), the "How I test" card, per-page
│                      title + description, every section label/heading/text, the career path, footer note,
│                      email, links, resume path
├─ capabilities.json   the six "What I bring" items (title + one line)
├─ skills.json         skill groups, by layer
├─ projects/           one .md per case study (and side project)
└─ experience/         one .md per role
```

The accent word in the hero headline is the middle part of `heroHeadline` in `site.json`
(`before` + `accent` + `after`).

### Add a case study
Create `src/content/projects/6-my-project.md` (the number prefix is only for tidy sorting; `order` decides placement
and is also the "01", "02" number on the card):

```md
---
title: "Short title"
order: 6
company: "Company"
period: "2026"                       # shown as "Company · 2026"
problem: "What was wrong."
solution: "What you did."            # shown under the label "What I did"
metrics:                             # 1 to 3 big numbers, each with a small caption
  - value: "8h → 3h"
    label: "full regression"
also: "one extra line under the metrics"   # optional
diagram: ["Step 1", "Step 2", "Step 3"]    # architecture chips joined by ›, at least 2 steps
tags: ["Playwright", "TypeScript"]
link: "https://example.com"                # optional
featured: true                             # optional: also show it on the Home page
---
```

### Add a side project (smaller card)
Same folder, with `side: true`. It needs only `title`, `order`, `description` and `link`:

```md
---
title: "My side project"
order: 7
side: true
description: "One or two sentences."
tags: ["Next.js"]
link: "https://example.com"
---
```

### Add a role
Create `src/content/experience/my-company.md`. Dates are `MM/YYYY` (or `Present`); the timeline sorts itself, newest
first, and shows years only (`06/2026` + `09/2026` becomes "2026"; `02/2025` + `06/2026` becomes "2025–2026"):

```md
---
company: "Company"
role: "Job title"           # optional (the career break has none)
start: "06/2026"
end: "Present"
highlights:
  - "What you did"
location: "City"            # optional, not shown on the page
tags: ["Playwright"]        # optional, not shown on the page
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
| Playwright (blocking set) | any of: console or network errors on any page; wrong page titles, descriptions, canonicals or sitemap; nav or "Get in touch" links not going where they should; the mobile menu failing to open, close (Esc, ✕, link tap), trap focus, return focus or lock page scroll; broken internal links; resume not downloading as a real PDF; layout overflow at mobile, tablet or desktop width; axe-core accessibility violations or a broken heading outline on any page; reduced motion not switching animations off; the agreed copy and metrics changing; a dark surface or any green appearing on the light theme |
| Lighthouse CI | the **median of 3 runs** is below 90 in Performance, Accessibility, Best Practices or SEO on any of the three pages |

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
├─ components/         one component per section, plus small shared pieces (cards, chips, headings)
├─ layouts/            BaseLayout.astro: <head>, per-page SEO, nav, footer
├─ pages/              index.astro, projects/index.astro, experience/index.astro, 404.astro (each only assembles components)
├─ scripts/            small TypeScript modules: scroll-in reveal and the mobile menu
└─ styles/global.css   Tailwind import and theme tokens (colours, accent, buttons, chips)
scripts/generate-og.mjs  builds public/og.png from site.json at build time
tests/                 Playwright specs (one file per concern)
public/                static files: CNAME, robots.txt, sitemap.xml, favicon, resume
```

Animations respect `prefers-reduced-motion`: the hero entrance, scroll-in reveals, card lift, mobile-menu slide and
smooth scrolling all switch off.
