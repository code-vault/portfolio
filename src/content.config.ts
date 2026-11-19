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

// ---------- projects/*.md (case studies and the side project) ----------

// A full case study needs problem, solution, impact and diagram.
// A side project (side: true) only needs a title, a short description and a link,
// so we never have to invent a problem/solution/impact for it.
const projects = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/projects' }),
  schema: z
    .object({
      title: z.string().min(1),
      order: z.number().int(),
      company: z.string().min(1),
      side: z.boolean().default(false),
      problem: z.string().min(1).optional(),
      solution: z.string().min(1).optional(),
      impact: z.array(z.string().min(1)).min(1).optional(),
      tags: z.array(z.string().min(1)).default([]),
      diagram: z.array(z.string().min(1)).min(2).optional(), // step labels, in order
      description: z.string().min(1).optional(), // used by side projects only
      link: z.url().optional(),
    })
    .superRefine((p, ctx) => {
      const required = p.side ? ['description', 'link'] : ['problem', 'solution', 'impact', 'diagram'];
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

const experience = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/experience' }),
  schema: z.object({
    company: z.string().min(1),
    role: z.string().min(1),
    start: monthYear,
    end: monthYear,
    location: z.string().optional(), // the career break has no location
    highlights: z.array(z.string().min(1)).min(1),
    tags: z.array(z.string().min(1)).default([]),
  }),
});

// ---------- JSON content ----------

const stats = defineCollection({
  loader: file('src/content/stats.json', { parser: listParser }),
  schema: z.object({ value: z.string().min(1), label: z.string().min(1) }),
});

const skills = defineCollection({
  loader: file('src/content/skills.json', { parser: listParser }),
  schema: z.object({ group: z.string().min(1), items: z.array(z.string().min(1)).min(1) }),
});

const capabilities = defineCollection({
  loader: file('src/content/capabilities.json', { parser: listParser }),
  schema: z.object({ title: z.string().min(1), description: z.string().min(1) }),
});

const site = defineCollection({
  loader: file('src/content/site.json', { parser: objectParser }),
  schema: z.object({
    name: z.string().min(1),
    headline: z.string().min(1),
    oneLiner: z.string().min(1),
    metaTitle: z.string().min(1),
    metaDescription: z.string().min(1),
    pipeline: z.array(z.string().min(1)).min(2), // hero animation steps
    about: z.string().min(1),
    contactIntro: z.string().min(1),
    email: z.email(),
    resumePath: z.string().startsWith('/'),
    links: z.object({ github: z.url(), linkedin: z.url() }),
  }),
});

export const collections = { projects, experience, stats, skills, capabilities, site };
