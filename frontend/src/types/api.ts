export type ApiResponse<T> = {
  success: boolean;
  data: T;
  message?: string | null;
  timestamp: string;
};

export type UserRoleProfile = {
  username: string;
  displayName: string;
  role: "ADMIN" | "USER";
  adminAccess: boolean;
  portalAccess: boolean;
  defaultPath: string;
};

export type LoginResponse = {
  token: string;
  profile: UserRoleProfile;
};

export type Folder = {
  id: number;
  parentId: number | null;
  title: string;
  description?: string | null;
  active: boolean;
  sortOrder: number;
};

export type ArticleStatus = "DRAFT" | "PUBLISHED" | "UNPUBLISHED";

export type ArticleSummary = {
  id: number;
  folderId: number;
  title: string;
  status: ArticleStatus;
  sortOrder: number;
  authorName?: string | null;
  publishedAt?: string | null;
  updatedAt?: string | null;
};

export type ArticleDetail = ArticleSummary & {
  bodyMarkdown: string;
  createdAt?: string | null;
};

export type Attachment = {
  id: number;
  originalName: string;
  sizeBytes: number;
  contentType: string;
  extension: string;
  createdAt?: string;
};

export type SearchResult = {
  articleId: number;
  folderId: number;
  title: string;
  snippet: string;
  resultType: "ARTICLE";
};
