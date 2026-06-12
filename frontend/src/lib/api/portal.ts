import { apiClient, unwrap } from "../axios";

export type Folder = {
  id: number;
  parentId: number | null;
  title: string;
  description?: string;
  active: boolean;
  sortOrder: number;
};

export type ArticleSummary = {
  id: number;
  folderId: number;
  title: string;
  status: string;
  sortOrder: number;
  publishedAt?: string;
  updatedAt?: string;
};

export type ArticleDetail = ArticleSummary & {
  body: string;
  createdAt?: string;
};

export type SearchResult = {
  articleId: number;
  folderId: number;
  title: string;
  folderTitle: string;
  snippet: string;
};

export const portalApi = {
  async folders(parentId?: number | null) {
    return unwrap<Folder[]>(await apiClient.get("/v1/portal/folders", { params: { parentId } }));
  },
  async articles(folderId: number) {
    return unwrap<ArticleSummary[]>(await apiClient.get("/v1/portal/articles", { params: { folderId } }));
  },
  async article(articleId: number) {
    return unwrap<ArticleDetail>(await apiClient.get(`/v1/portal/articles/${articleId}`));
  },
  async search(q: string, limit = 20) {
    return unwrap<SearchResult[]>(await apiClient.get("/v1/portal/search", { params: { q, limit } }));
  }
};
