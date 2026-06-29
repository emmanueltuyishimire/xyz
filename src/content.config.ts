import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Define the generic schema for all educational articles
const articleSchema = z.object({
  title: z.string().max(60, { message: 'Title must be 60 characters or less for SEO' }),
  description: z.string().max(160, { message: 'Description must be 160 characters or less for SEO' }),
  author: z.string().default('T. Emmanuel'), // Links to author ID/slug
  publishDate: z.coerce.date(),
  updatedDate: z.coerce.date().optional(),
  featuredImage: z.string().optional(),
  featuredImageAlt: z.string().optional(),
  category: z.enum([
    'irs',
    'social-security',
    'medicare',
    'medicaid',
    'retirement',
    'taxes',
    'benefits',
    'guides',
  ]),
  tags: z.array(z.string()).default([]),
  draft: z.boolean().default(false),
  noindex: z.boolean().default(false),
  relatedSlugs: z.array(z.string()).default([]),
});

// Define collection schemas using glob loader for Astro 5 content layer
const blog = defineCollection({
  loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: './src/content/blog' }),
  schema: articleSchema,
});

const irs = defineCollection({
  loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: './src/content/irs' }),
  schema: articleSchema,
});

const socialSecurity = defineCollection({
  loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: './src/content/social-security' }),
  schema: articleSchema,
});

const medicare = defineCollection({
  loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: './src/content/medicare' }),
  schema: articleSchema,
});

const medicaid = defineCollection({
  loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: './src/content/medicaid' }),
  schema: articleSchema,
});

const retirement = defineCollection({
  loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: './src/content/retirement' }),
  schema: articleSchema,
});

const taxes = defineCollection({
  loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: './src/content/taxes' }),
  schema: articleSchema,
});

// Author profile schema for Google E-E-A-T structured schema representation
const authors = defineCollection({
  loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: './src/content/authors' }),
  schema: z.object({
    name: z.string(),
    title: z.string(),
    avatar: z.string().optional(),
    bio: z.string(),
    socials: z.object({
      twitter: z.string().optional(),
      linkedin: z.string().optional(),
    }).optional(),
  }),
});

export const collections = {
  blog,
  irs,
  'social-security': socialSecurity,
  medicare,
  medicaid,
  retirement,
  taxes,
  authors,
};
