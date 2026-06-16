import { randomUUID } from "node:crypto";
import type {
  ContentItem,
  ContentRevision,
  MediaAsset,
  NavigationMenu,
  PublicationSchedule,
  TaxonomyTerm,
  User,
  WorkflowEvent
} from "../modules/content/content.types.js";

type PrismaLifecycle = {
  $connect(): Promise<void>;
  $disconnect(): Promise<void>;
};

let prismaClient: PrismaLifecycle | null = null;

export async function getPrismaClient(): Promise<PrismaLifecycle> {
  if (!prismaClient) {
    const prismaModule = await import("@prisma/client");
    const PrismaClient = prismaModule.PrismaClient as new () => PrismaLifecycle;
    prismaClient = new PrismaClient();
  }

  return prismaClient;
}

export async function connectDatabase(): Promise<void> {
  if (process.env.DATABASE_URL) {
    await (await getPrismaClient()).$connect();
  }
}

export async function disconnectDatabase(): Promise<void> {
  if (prismaClient) {
    await prismaClient.$disconnect();
    prismaClient = null;
  }
}

export interface CmsDataStore {
  users: User[];
  contentItems: ContentItem[];
  revisions: ContentRevision[];
  schedules: PublicationSchedule[];
  mediaAssets: MediaAsset[];
  taxonomyTerms: TaxonomyTerm[];
  navigationMenus: NavigationMenu[];
  workflowEvents: WorkflowEvent[];
}

const now = new Date().toISOString();

const adminUser: User = {
  id: "11111111-1111-4111-8111-111111111111",
  email: "admin@example.com",
  displayName: "관리자",
  status: "ACTIVE",
  roles: ["ADMIN"],
  lastLoginAt: now,
  createdAt: now,
  updatedAt: now
};

const editorUser: User = {
  id: "22222222-2222-4222-8222-222222222222",
  email: "editor@example.com",
  displayName: "편집자",
  status: "ACTIVE",
  roles: ["EDITOR"],
  lastLoginAt: now,
  createdAt: now,
  updatedAt: now
};

const authorUser: User = {
  id: "33333333-3333-4333-8333-333333333333",
  email: "author@example.com",
  displayName: "작성자",
  status: "ACTIVE",
  roles: ["AUTHOR"],
  lastLoginAt: now,
  createdAt: now,
  updatedAt: now
};

const categoryNotice: TaxonomyTerm = {
  id: "44444444-4444-4444-8444-444444444444",
  type: "CATEGORY",
  name: "공지",
  slug: "notice",
  description: "공개 공지 콘텐츠",
  parentId: null,
  sortOrder: 1,
  createdAt: now,
  updatedAt: now
};

const tagCms: TaxonomyTerm = {
  id: "55555555-5555-4555-8555-555555555555",
  type: "TAG",
  name: "CMS",
  slug: "cms",
  description: "CMS 운영 태그",
  parentId: null,
  sortOrder: 1,
  createdAt: now,
  updatedAt: now
};

const seedContent: ContentItem = {
  id: "66666666-6666-4666-8666-666666666666",
  contentType: "ARTICLE",
  title: "첫 번째 CMS 소식",
  slug: "first-cms-news",
  status: "PUBLISHED",
  author: authorUser,
  publishedAt: now,
  scheduledAt: null,
  updatedAt: now,
  summary: "마크다운 기반 CMS의 첫 게시글",
  markdownBody: "# 첫 번째 CMS 소식\n\n본문을 **Markdown**으로 작성합니다.",
  visibility: "PUBLIC",
  featuredMedia: null,
  categories: [categoryNotice],
  tags: [tagCms],
  revisionsCount: 1,
  createdAt: now,
  archivedAt: null
};

const dataStore: CmsDataStore = {
  users: [adminUser, editorUser, authorUser],
  contentItems: [seedContent],
  revisions: [
    {
      id: "77777777-7777-4777-8777-777777777777",
      contentItemId: seedContent.id,
      revisionNumber: 1,
      titleSnapshot: seedContent.title,
      metadataSnapshot: {
        summary: seedContent.summary,
        visibility: seedContent.visibility,
        categoryIds: [categoryNotice.id],
        tagIds: [tagCms.id]
      },
      markdownBodySnapshot: seedContent.markdownBody,
      changeSummary: "초기 게시",
      createdBy: authorUser,
      createdAt: now
    }
  ],
  schedules: [],
  mediaAssets: [],
  taxonomyTerms: [categoryNotice, tagCms],
  navigationMenus: [
    {
      id: "88888888-8888-4888-8888-888888888888",
      key: "primary",
      label: "Primary Menu",
      isActive: true,
      items: [
        {
          id: "99999999-9999-4999-8999-999999999999",
          label: "공지",
          targetType: "CATEGORY",
          targetId: categoryNotice.id,
          url: null,
          parentId: null,
          sortOrder: 1,
          isVisible: true
        }
      ],
      createdAt: now,
      updatedAt: now
    }
  ],
  workflowEvents: []
};

export function getDataStore(): CmsDataStore {
  return dataStore;
}

export function createId(): string {
  return randomUUID();
}

export function timestamp(): string {
  return new Date().toISOString();
}

export function paginate<T>(items: T[], page = 1, pageSize = 25): { items: T[]; pageInfo: { page: number; pageSize: number; totalItems: number; totalPages: number } } {
  const safePage = Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
  const safePageSize = Number.isFinite(pageSize) && pageSize > 0 ? Math.min(Math.floor(pageSize), 100) : 25;
  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / safePageSize));
  const start = (safePage - 1) * safePageSize;

  return {
    items: items.slice(start, start + safePageSize),
    pageInfo: {
      page: safePage,
      pageSize: safePageSize,
      totalItems,
      totalPages
    }
  };
}
