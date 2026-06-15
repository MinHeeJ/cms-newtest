import { z } from "zod";

const textFieldsRequired = (value: { title?: string; body?: string }) => {
  const title = value.title?.trim() ?? "";
  const body = value.body?.trim() ?? "";
  return title.length > 0 || body.length > 0;
};

export const ideaStatusSchema = z.enum(["captured", "developing", "archived"]);

export const accentColorSchema = z
  .string()
  .trim()
  .regex(/^(yellow|mint|coral|sky|violet|#[0-9a-fA-F]{3,8})$/, "허용된 강조 색상을 선택해 주세요.")
  .default("yellow");

export const ideaCreateSchema = z
  .object({
    title: z.string().max(120).optional().default(""),
    body: z.string().max(20000).optional().default(""),
    tagIds: z.array(z.string().min(1)).optional().default([]),
    accentColor: accentColorSchema.optional(),
    isPinned: z.boolean().optional().default(false)
  })
  .refine(textFieldsRequired, {
    message: "제목 또는 본문 중 하나는 입력해야 합니다.",
    path: ["title"]
  });

export const ideaUpdateSchema = z
  .object({
    title: z.string().max(120).optional(),
    body: z.string().max(20000).optional(),
    status: ideaStatusSchema.optional(),
    tagIds: z.array(z.string().min(1)).optional(),
    accentColor: accentColorSchema.optional(),
    isPinned: z.boolean().optional()
  })
  .refine((value) => {
    if (value.title === undefined && value.body === undefined) {
      return true;
    }
    return textFieldsRequired(value);
  }, {
    message: "제목 또는 본문 중 하나는 입력해야 합니다.",
    path: ["title"]
  });

export const ideaListQuerySchema = z.object({
  q: z.string().trim().optional(),
  status: ideaStatusSchema.optional(),
  tag: z.string().trim().optional(),
  pinned: z
    .enum(["true", "false"])
    .transform((value) => value === "true")
    .optional(),
  sort: z.enum(["updated_desc", "created_desc", "title_asc"]).optional().default("updated_desc"),
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).optional().default(30)
});

export const tagCreateSchema = z.object({
  name: z.string().trim().min(1).max(32),
  sortOrder: z.number().int().optional()
});

export const tagUpdateSchema = z.object({
  name: z.string().trim().min(1).max(32).optional(),
  sortOrder: z.number().int().optional()
});

export const actionItemCreateSchema = z.object({
  text: z.string().trim().min(1).max(300),
  sortOrder: z.number().int().optional()
});

export const actionItemUpdateSchema = z.object({
  text: z.string().trim().min(1).max(300).optional(),
  isCompleted: z.boolean().optional(),
  sortOrder: z.number().int().optional()
});
