import { apiClient, unwrap } from "../axios";
import type { ArticleDetail, ArticleSummary, Folder, SearchResult } from "../../types/api";

export async function fetchPortalFolders(parentId?: number | null) {
  const params = parentId ? { parentId } : {};
  return unwrap<Folder[]>(await apiClient.get("/v1/portal/folders", { params }));
}

export async function fetchPortalArticles(folderId: number) {
  return unwrap<ArticleSummary[]>(await apiClient.get("/v1/portal/articles", { params: { folderId } }));
}

export async function fetchPortalArticle(articleId: number) {
  return unwrap<ArticleDetail>(await apiClient.get(`/v1/portal/articles/${articleId}`));
}

export async function searchPortal(query: string) {
  return unwrap<SearchResult[]>(await apiClient.get("/v1/portal/search", { params: { q: query } }));
}
