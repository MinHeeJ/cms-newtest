import type { ContentItem, ContentRevision, DashboardMetrics, MediaAsset, NavigationMenu, TaxonomyTerm, User, WorkflowEvent } from "./cmsTypes";

const now = "2026-06-16T06:00:00.000Z";

export const demoUsers: User[] = [
  {
    id: "11111111-1111-4111-8111-111111111111",
    username: "basic",
    email: "basic@example.com",
    displayName: "기본 관리자",
    status: "ACTIVE",
    roles: ["ADMIN"],
    lastLoginAt: now,
    createdAt: now,
    updatedAt: now
  },
  {
    id: "22222222-2222-4222-8222-222222222222",
    username: "editor",
    email: "editor@example.com",
    displayName: "편집자",
    status: "ACTIVE",
    roles: ["EDITOR"],
    lastLoginAt: now,
    createdAt: now,
    updatedAt: now
  },
  {
    id: "33333333-3333-4333-8333-333333333333",
    username: "author",
    email: "author@example.com",
    displayName: "작성자",
    status: "ACTIVE",
    roles: ["AUTHOR"],
    lastLoginAt: now,
    createdAt: now,
    updatedAt: now
  }
];

export const demoTerms: TaxonomyTerm[] = [
  { id: "cat-notice", type: "CATEGORY", name: "공지", slug: "notice", description: "서비스 공지", parentId: null, sortOrder: 1, createdAt: now, updatedAt: now },
  { id: "cat-guide", type: "CATEGORY", name: "가이드", slug: "guide", description: "운영 가이드", parentId: null, sortOrder: 2, createdAt: now, updatedAt: now },
  { id: "tag-cms", type: "TAG", name: "CMS", slug: "cms", description: null, parentId: null, sortOrder: 1, createdAt: now, updatedAt: now },
  { id: "tag-release", type: "TAG", name: "Release", slug: "release", description: null, parentId: null, sortOrder: 2, createdAt: now, updatedAt: now }
];

export const demoMedia: MediaAsset[] = [
  {
    id: "media-1",
    fileName: "dashboard-preview.png",
    mimeType: "image/png",
    sizeBytes: 184320,
    url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=640&q=80",
    altText: "CMS Dashboard 지표 화면",
    caption: "운영 지표 예시",
    usageCount: 3,
    createdAt: now,
    updatedAt: now
  },
  {
    id: "media-2",
    fileName: "release-note.pdf",
    mimeType: "application/pdf",
    sizeBytes: 532480,
    url: "/sample/release-note.pdf",
    altText: null,
    caption: "배포 노트",
    usageCount: 1,
    createdAt: now,
    updatedAt: now
  }
];

export const demoContent: ContentItem[] = [
  {
    id: "content-1",
    contentType: "ARTICLE",
    title: "첫 번째 CMS 소식",
    slug: "first-cms-news",
    status: "PUBLISHED",
    author: demoUsers[2],
    publishedAt: now,
    scheduledAt: null,
    updatedAt: now,
    summary: "마크다운 기반 CMS의 첫 게시글",
    markdownBody: "# 첫 번째 CMS 소식\n\n본문을 **Markdown**으로 작성합니다.\n\n| 항목 | 상태 |\n| --- | --- |\n| 작성 | 완료 |\n| 검토 | 완료 |",
    visibility: "PUBLIC",
    featuredMedia: demoMedia[0],
    categories: [demoTerms[0]],
    tags: [demoTerms[2]],
    revisionsCount: 3,
    createdAt: now,
    archivedAt: null
  },
  {
    id: "content-2",
    contentType: "PAGE",
    title: "서비스 이용 가이드",
    slug: "service-guide",
    status: "IN_REVIEW",
    author: demoUsers[2],
    publishedAt: null,
    scheduledAt: null,
    updatedAt: "2026-06-16T04:30:00.000Z",
    summary: "포털 사용자에게 제공할 이용 안내",
    markdownBody: "## 이용 가이드\n\n- 검색어를 입력합니다.\n- 결과에서 문서를 선택합니다.",
    visibility: "PUBLIC",
    featuredMedia: null,
    categories: [demoTerms[1]],
    tags: [demoTerms[2]],
    revisionsCount: 2,
    createdAt: now,
    archivedAt: null
  },
  {
    id: "content-3",
    contentType: "ARTICLE",
    title: "7월 예약 공지",
    slug: "july-scheduled-notice",
    status: "SCHEDULED",
    author: demoUsers[1],
    publishedAt: null,
    scheduledAt: "2026-07-01T09:00:00.000Z",
    updatedAt: "2026-06-15T10:00:00.000Z",
    summary: "예약 게시 검증용 공지",
    markdownBody: "# 7월 예약 공지\n\n예약된 시각에 자동으로 게시됩니다.",
    visibility: "PUBLIC",
    featuredMedia: null,
    categories: [demoTerms[0]],
    tags: [demoTerms[3]],
    revisionsCount: 1,
    createdAt: now,
    archivedAt: null
  }
];

export const demoRevisions: ContentRevision[] = [
  {
    id: "revision-1",
    contentItemId: "content-1",
    revisionNumber: 3,
    titleSnapshot: "첫 번째 CMS 소식",
    metadataSnapshot: { status: "PUBLISHED", summary: "마크다운 기반 CMS의 첫 게시글" },
    markdownBodySnapshot: demoContent[0].markdownBody,
    changeSummary: "표와 게시 메타데이터 보강",
    createdBy: demoUsers[1],
    createdAt: now
  },
  {
    id: "revision-0",
    contentItemId: "content-1",
    revisionNumber: 2,
    titleSnapshot: "CMS 소식 초안",
    metadataSnapshot: { status: "APPROVED", summary: "초기 요약" },
    markdownBodySnapshot: "# CMS 소식 초안\n\n본문을 작성합니다.",
    changeSummary: "검토 반영",
    createdBy: demoUsers[2],
    createdAt: "2026-06-15T08:00:00.000Z"
  }
];

export const demoEvents: WorkflowEvent[] = [
  {
    id: "event-1",
    eventType: "PUBLISH",
    actor: demoUsers[1],
    targetType: "ContentItem",
    targetId: "content-1",
    beforeState: { status: "APPROVED" },
    afterState: { status: "PUBLISHED" },
    comment: "즉시 게시",
    createdAt: now
  },
  {
    id: "event-2",
    eventType: "SUBMIT",
    actor: demoUsers[2],
    targetType: "ContentItem",
    targetId: "content-2",
    beforeState: { status: "DRAFT" },
    afterState: { status: "IN_REVIEW" },
    comment: null,
    createdAt: "2026-06-16T04:30:00.000Z"
  },
  {
    id: "event-3",
    eventType: "PERMISSION_CHANGE",
    actor: demoUsers[0],
    targetType: "User",
    targetId: demoUsers[2].id,
    beforeState: { roles: ["AUTHOR"] },
    afterState: { roles: ["AUTHOR", "EDITOR"] },
    comment: "검토 권한 부여",
    createdAt: "2026-06-15T12:00:00.000Z"
  }
];

export const demoMetrics: DashboardMetrics = {
  contentCounts: {
    draft: 8,
    inReview: 4,
    approved: 3,
    scheduled: 2,
    published: 24,
    archived: 5
  },
  reviewQueueCount: 4,
  scheduledCount: 2,
  recentActivity: demoEvents,
  publishingTrend: [
    { date: "2026-06-10", publishedCount: 2 },
    { date: "2026-06-11", publishedCount: 4 },
    { date: "2026-06-12", publishedCount: 3 },
    { date: "2026-06-13", publishedCount: 5 },
    { date: "2026-06-14", publishedCount: 2 },
    { date: "2026-06-15", publishedCount: 6 },
    { date: "2026-06-16", publishedCount: 2 }
  ]
};

export const demoMenus: NavigationMenu[] = [
  {
    id: "menu-1",
    key: "primary",
    label: "Primary Menu",
    isActive: true,
    items: [
      { id: "nav-1", label: "공지", targetType: "CATEGORY", targetId: "cat-notice", url: null, parentId: null, sortOrder: 1, isVisible: true },
      { id: "nav-2", label: "가이드", targetType: "CATEGORY", targetId: "cat-guide", url: null, parentId: null, sortOrder: 2, isVisible: true }
    ],
    createdAt: now,
    updatedAt: now
  }
];
