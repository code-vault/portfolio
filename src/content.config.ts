// All content schemas live here. If a content file is missing a required field,
// `astro build` / `astro dev` fails and Zod names the file and the field.
import { defineCollection } from 'astro:content';
import { glob, file } from 'astro/loaders';
import { z } from 'astro/zod';

// ---------- helpers ----------

// Dates are written "MM/YYYY" (e.g. "06/2026") or the word "Present".
const monthYear = z
  .string()
  .regex(/^(0[1-9]|1[0-2])\/\d{4}$|^Present$/, 'Use MM/YYYY (e.g. 06/2026) or "Present"');

// JSON files hold either a list or a single object. These two parsers give each
// entry the `id` that Astro's file() loader needs, so the JSON stays free of ids.
const listParser = (text: string) =>
  (JSON.parse(text) as object[]).map((entry, i) => ({ id: String(i), ...entry }));
const objectParser = (text: string) => ({ site: JSON.parse(text) });

const nonEmpty = z.string().min(1);

// ---------- projects/*.md (case studies and the side project) ----------

// A full case study needs company, period, problem, solution, metrics and diagram.
// A side project (side: true) only needs a title, a short description and a link,
// so we never have to invent a problem/solution/metrics for it.
const projects = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/projects' }),
  schema: z
    .object({
      title: nonEmpty,
      order: z.number().int(), // sort order; also the "01", "02" number on the card
      side: z.boolean().default(false),
      featured: z.boolean().default(false), // shown on the Home page under "Selected work"
      company: nonEmpty.optional(), // e.g. "KlearNow.AI"
      period: nonEmpty.optional(), // e.g. "2026" or "2022–2025"
      problem: nonEmpty.optional(),
      solution: nonEmpty.optional(), // shown under the label "What I did"
      also: nonEmpty.optional(), // optional extra one-liner under the metrics
      // Up to 3 big numbers: { value: "8h → 3h", label: "full regression" }
      metrics: z.array(z.object({ value: nonEmpty, label: nonEmpty })).min(1).max(3).optional(),
      diagram: z.array(nonEmpty).min(2).optional(), // architecture step labels, in order
      tags: z.array(nonEmpty).default([]),
      description: nonEmpty.optional(), // side projects only
      link: z.url().optional(),
    })
    .superRefine((p, ctx) => {
      const required = p.side
        ? ['description', 'link']
        : ['company', 'period', 'problem', 'solution', 'metrics', 'diagram'];
      for (const key of required) {
        if (p[key as keyof typeof p] === undefined) {
          ctx.addIssue({
            code: 'custom',
            path: [key],
            message: `"${key}" is required for ${p.side ? 'a side project (side: true)' : 'a case study'}`,
          });
        }
      }
    }),
});

// ---------- experience/*.md (one file per role) ----------

// Tags and location are kept as optional data but are not shown on the page.
const experience = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/experience' }),
  schema: z.object({
    company: nonEmpty,
    role: nonEmpty.optional(), // the career break has no role title
    start: monthYear,
    end: monthYear,
    location: z.string().optional(),
    highlights: z.array(nonEmpty).min(1),
    tags: z.array(nonEmpty).default([]),
  }),
});

// ---------- JSON content ----------

const skills = defineCollection({
  loader: file('src/content/skills.json', { parser: listParser }),
  schema: z.object({ group: nonEmpty, items: z.array(nonEmpty).min(1) }),
});

const capabilities = defineCollection({
  loader: file('src/content/capabilities.json', { parser: listParser }),
  schema: z.object({ title: nonEmpty, description: nonEmpty }),
});

// Title + description for one page's <title> and meta description.
const pageMeta = z.object({ title: nonEmpty, description: nonEmpty });
// Small uppercase label + big heading used at the top of a section.
const sectionHead = z.object({ label: nonEmpty, heading: nonEmpty });

const site = defineCollection({
  loader: file('src/content/site.json', { parser: objectParser }),
  schema: z.object({
    name: nonEmpty,
    badge: nonEmpty, // pill above the hero headline (also used on the OG image)
    // The headline is split so the middle part can be shown in the accent colour.
    heroHeadline: z.object({ before: z.string(), accent: nonEmpty, after: z.string() }),
    intro: nonEmpty,
    previouslyAt: z.array(nonEmpty).min(1), // plain grey company names under the hero buttons
    // The "How I test" card on the Home page
    howITest: z.object({
      title: nonEmpty,
      rows: z.array(z.object({ layer: nonEmpty, line: nonEmpty, tag: nonEmpty.optional() })).min(1),
      footer: nonEmpty, // monospace line at the bottom of the card
    }),
    pages: z.object({ home: pageMeta, projects: pageMeta, experience: pageMeta }),
    sections: z.object({
      selectedWork: sectionHead.extend({ seeAll: nonEmpty }),
      whatIBring: sectionHead,
      about: sectionHead.extend({ text: nonEmpty }),
      contact: sectionHead.extend({ text: nonEmpty }),
      projects: sectionHead.extend({ intro: nonEmpty, sideLabel: nonEmpty }),
      experience: sectionHead.extend({ pathLabel: nonEmpty, skillsHeading: nonEmpty }),
    }),
    // The 4-step "path" strip on the Experience page
    path: z.array(z.object({ year: nonEmpty, label: nonEmpty })).min(2),
    footerNote: nonEmpty,
    email: z.email(),
    resumePath: z.string().startsWith('/'),
    links: z.object({ github: z.url(), linkedin: z.url() }),
  }),
});

export const collections = { projects, experience, skills, capabilities, site };
