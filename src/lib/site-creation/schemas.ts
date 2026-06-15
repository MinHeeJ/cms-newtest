import { z } from "zod";

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const domainCodeSchema = z
  .string()
  .trim()
  .min(1)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Domain codes must be kebab-case identifiers.");

export const createDraftSchema = z.object({
  site_name: z.string().trim().min(1).max(120),
  site_slug: z.string().trim().regex(slugPattern).optional(),
  description: z.string().trim().max(1000).optional().or(z.literal("")),
  target_audience: z.string().trim().max(500).optional().or(z.literal("")),
  selected_domains: z.array(domainCodeSchema).min(1).refine(
    (items) => new Set(items).size === items.length,
    "selected_domains must contain unique values."
  )
});

export const updateDraftSchema = z.object({
  site_name: z.string().trim().min(1).max(120).optional(),
  site_slug: z.string().trim().regex(slugPattern).optional(),
  description: z.string().trim().max(1000).optional().or(z.literal("")),
  target_audience: z.string().trim().max(500).optional().or(z.literal("")),
  selected_domains: z
    .array(domainCodeSchema)
    .min(1)
    .refine(
      (items) => new Set(items).size === items.length,
      "selected_domains must contain unique values."
    )
    .optional()
});

export const listDraftsQuerySchema = z.object({
  status: z
    .enum(["draft", "validating", "ready_to_generate", "generating", "generated", "blocked", "archived"])
    .optional(),
  limit: z.coerce.number().int().min(1).max(100).default(25)
});
