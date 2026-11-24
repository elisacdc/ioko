import { defineCollection } from "astro:content";
import { z } from "astro/zod";
import { glob } from "astro/loaders";
const slug = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
const formations = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/formations" }),
  schema: z.object({
    title: z.string(),
    seoTitle: z.string().optional(),
    metaDescription: z.string().optional(),
    slug,
    category: z.string(),
    updatedDate: z.coerce.date().optional(),
    illustration: z.string(),
    illustrationAlt: z.string(),
    illustrationWidth: z.number().default(1200),
    illustrationHeight: z.number().default(1200),
    order: z.number().default(99),
    sourcePages: z.string().optional(),
    description: z.string(),
    demo: z.boolean().default(true),
    duration: z.string(),
    location: z.string(),
    audience: z.string(),
    learnerRequirements: z.string(),
    technicalRequirements: z.string(),
    format: z.string(),
    capacity: z.string(),
    objectives: z.array(z.string()),
    program: z.array(z.object({ title: z.string(), description: z.string() })),
    methods: z.array(z.string()),
    evaluation: z.string(),
    accessibility: z.string(),
    pricing: z.string(),
    access: z.string(),
    programUpdated: z.string(),
    programVersion: z.string(),
    programHash: z.string().optional(),
    relatedArticles: z.array(slug).default([]),
  }),
});
const articles = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/articles" }),
  schema: z.object({
    title: z.string(),
    seoTitle: z.string().optional(),
    slug,
    date: z.coerce.date().optional(),
    updatedDate: z.coerce.date().optional(),
    description: z.string(),
    metaDescription: z.string().optional(),
    category: z.string(),
    readingTime: z.string(),
    demo: z.boolean().default(true),
    sources: z.array(z.object({
      label: z.string(),
      url: z.url().optional(),
    })).default([]),
    relatedArticles: z.array(slug).default([]),
    relatedTrainings: z.array(slug).default([]),
  }),
});
export const collections = { formations, articles };
