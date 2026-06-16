import { z } from "zod";

export const contentStatuses = ["DRAFT", "IN_REVIEW", "APPROVED", "SCHEDULED", "PUBLISHED", "ARCHIVED"] as const;
export const contentTypes = ["ARTICLE", "PAGE"] as const;
export const visibilities = ["PUBLIC", "UNLISTED", "PRIVATE"] as const;
export const roleNames = ["ADMIN", "EDITOR", "AUTHOR", "VIEWER"] as const;
export const userStatuses = ["ACTIVE", "INVITED", "SUSPENDED"] as const;
export const workflowEventTypes = [
  "CREATE",
  "UPDATE",
  "SUBMIT",
  "APPROVE",
  "REJECT",
  "PUBLISH",
  "SCHEDULE",
  "UNPUBLISH",
  "ARCHIVE",
  "DELETE",
  "LOGIN",
  "PERMISSION_CHANGE"
] as const;

export type ContentStatus = (typeof contentStatuses)[number];
export type ContentType = (typeof contentTypes)[number];
export type Visibility = (typeof visibilities)[number];
export type RoleName = (typeof roleNames)[number];
export type UserStatus = (typeof userStatuses)[number];
export type WorkflowEventType = (typeof workflowEventTypes)[number];
export type ReviewDecision = "APPROVE" | "REJECT";
export type ScheduleStatus = "PENDING" | "RUNNING" | "SUCCEEDED" | "FAILED" | "CANCELLED";
export type TaxonomyType = "CATEGORY" | "TAG";
export type NavigationTargetType = "CONTENT" | "URL" | "CATEGORY";

export interface UserSummary {
  id: string;
  email: string;
  displayName: string;
}

export interface User extends UserSummary {
  status: UserStatus;
  roles: RoleName[];
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PageInfo {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export interface TaxonomyTerm {
  id: string;
  type: TaxonomyType;
  name: string;
  slug: string;
  description: string | null;
  parentId: string | null;
  sortOrder: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface MediaAsset {
  id: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  storageKey: string;
  url: string;
  altText: string | null;
  caption: string | null;
  usageCount: number;
  uploadedBy: UserSummary;
  createdAt: string;
  updatedAt: string;
}

export interface ContentListItem {
  id: string;
  contentType: ContentType;
  title: string;
  slug: string;
  status: ContentStatus;
  author: UserSummary;
  publishedAt: string | null;
  scheduledAt: string | null;
  updatedAt: string;
}

export interface ContentItem extends ContentListItem {
  summary: string;
  markdownBody: string;
  visibility: Visibility;
  featuredMedia: MediaAsset | null;
  categories: TaxonomyTerm[];
  tags: TaxonomyTerm[];
  revisionsCount: number;
  createdAt: string;
  archivedAt: string | null;
}

export interface ContentRevision {
  id: string;
  contentItemId: string;
  revisionNumber: number;
  titleSnapshot: string;
  metadataSnapshot: Record<string, unknown>;
  markdownBodySnapshot: string;
  changeSummary?: string;
  createdBy: UserSummary;
  createdAt: string;
}

export interface PublicationSchedule {
  id: string;
  contentItemId: string;
  scheduledAt: string;
  status: ScheduleStatus;
  requestedBy: UserSummary;
  executedAt: string | null;
  failureReason: string | null;
  createdAt: string;
}

export interface NavigationItem {
  id: string;
  label: string;
  targetType: NavigationTargetType;
  targetId: string | null;
  url: string | null;
  parentId: string | null;
  sortOrder: number;
  isVisible: boolean;
}

export interface NavigationMenu {
  id: string;
  key: string;
  label: string;
  isActive: boolean;
  items: NavigationItem[];
  createdAt: string;
  updatedAt: string;
}

export interface WorkflowEvent {
  id: string;
  eventType: WorkflowEventType;
  actor: UserSummary;
  targetType: string;
  targetId: string;
  beforeState: Record<string, unknown> | null;
  afterState: Record<string, unknown> | null;
  comment: string | null;
  createdAt: string;
}

export interface DashboardMetrics {
  contentCounts: {
    draft: number;
    inReview: number;
    approved: number;
    scheduled: number;
    published: number;
    archived: number;
  };
  reviewQueueCount: number;
  scheduledCount: number;
  recentActivity: WorkflowEvent[];
  publishingTrend: Array<{ date: string; publishedCount: number }>;
}

const slugSchema = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "slug는 소문자 영문, 숫자, hyphen만 사용할 수 있습니다.");

export const contentCreateSchema = z.object({
  contentType: z.enum(contentTypes),
  title: z.string().min(1).max(160),
  slug: slugSchema,
  summary: z.string().max(300).optional().default(""),
  markdownBody: z.string().min(1),
  visibility: z.enum(visibilities).optional().default("PUBLIC"),
  featuredMediaId: z.string().uuid().nullable().optional(),
  categoryIds: z.array(z.string().uuid()).optional().default([]),
  tagIds: z.array(z.string().uuid()).optional().default([])
});

export const contentUpdateSchema = contentCreateSchema.extend({
  changeSummary: z.string().optional(),
  expectedRevision: z.number().int().positive().optional()
});

export const previewSchema = z.object({
  title: z.string().optional(),
  markdownBody: z.string().optional(),
  summary: z.string().optional()
});

export const reviewSchema = z.object({
  decision: z.enum(["APPROVE", "REJECT"]),
  comment: z.string().optional()
});

export const scheduleSchema = z.object({
  scheduledAt: z.string().datetime(),
  timezone: z.string().optional()
});

export const taxonomyRequestSchema = z.object({
  type: z.enum(["CATEGORY", "TAG"]),
  name: z.string().min(1),
  slug: slugSchema,
  description: z.string().optional(),
  parentId: z.string().uuid().nullable().optional(),
  sortOrder: z.number().int().optional()
});

export const navigationMenuSchema = z.object({
  key: z.string().min(1),
  label: z.string().min(1),
  isActive: z.boolean(),
  items: z.array(
    z.object({
      id: z.string().uuid().optional(),
      label: z.string().min(1),
      targetType: z.enum(["CONTENT", "URL", "CATEGORY"]),
      targetId: z.string().uuid().nullable().optional(),
      url: z.string().url().nullable().optional(),
      parentId: z.string().uuid().nullable().optional(),
      sortOrder: z.number().int(),
      isVisible: z.boolean()
    })
  )
});

export const roleUpdateSchema = z.object({
  roles: z.array(z.enum(roleNames)).min(1),
  reason: z.string().min(1)
});

export type ContentCreateInput = z.infer<typeof contentCreateSchema>;
export type ContentUpdateInput = z.infer<typeof contentUpdateSchema>;
export type ReviewInput = z.infer<typeof reviewSchema>;
export type ScheduleInput = z.infer<typeof scheduleSchema>;
export type TaxonomyInput = z.infer<typeof taxonomyRequestSchema>;
export type NavigationMenuInput = z.infer<typeof navigationMenuSchema>;
export type RoleUpdateInput = z.infer<typeof roleUpdateSchema>;
