export type ContentStatus = "DRAFT" | "IN_REVIEW" | "APPROVED" | "SCHEDULED" | "PUBLISHED" | "ARCHIVED";
export type ContentType = "ARTICLE" | "PAGE";
export type Visibility = "PUBLIC" | "UNLISTED" | "PRIVATE";
export type RoleName = "ADMIN" | "EDITOR" | "AUTHOR" | "VIEWER";
export type WorkflowEventType =
  | "CREATE"
  | "UPDATE"
  | "SUBMIT"
  | "APPROVE"
  | "REJECT"
  | "PUBLISH"
  | "SCHEDULE"
  | "UNPUBLISH"
  | "ARCHIVE"
  | "DELETE"
  | "LOGIN"
  | "PERMISSION_CHANGE";

export interface UserSummary {
  id: string;
  username: string;
  email: string;
  displayName: string;
}

export interface User extends UserSummary {
  status: "ACTIVE" | "INVITED" | "SUSPENDED";
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
  type: "CATEGORY" | "TAG";
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
  url: string;
  altText: string | null;
  caption: string | null;
  usageCount: number;
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
  status: "PENDING" | "RUNNING" | "SUCCEEDED" | "FAILED" | "CANCELLED";
  requestedBy: UserSummary;
  executedAt: string | null;
  failureReason: string | null;
  createdAt: string;
}

export interface NavigationItem {
  id: string;
  label: string;
  targetType: "CONTENT" | "URL" | "CATEGORY";
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

export interface Paged<T> {
  items: T[];
  pageInfo: PageInfo;
}
