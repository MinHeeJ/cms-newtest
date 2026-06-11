import { apiClient, unwrap } from "../axios";
import type { ArticleDetail, ArticleStatus, ArticleSummary, Attachment, Folder } from "../../types/api";

export type FolderPayload = {
  parentId?: number | null;
  title: string;
  description?: string;
  active?: boolean;
  sortOrder?: number;
};

export type ArticlePayload = {
  folderId: number;
  title: string;
  bodyMarkdown: string;
  sortOrder?: number;
};

export async function fetchAdminFolders() {
  return unwrap<Folder[]>(await apiClient.get("/v1/admin/folders"));
}

export async function createFolder(payload: FolderPayload) {
  return unwrap<Folder>(await apiClient.post("/v1/admin/folders", payload));
}

export async function updateFolder(id: number, payload: FolderPayload) {
  return unwrap<Folder>(await apiClient.put(`/v1/admin/folders/${id}`, payload));
}

export async function deleteFolder(id: number) {
  return unwrap<null>(await apiClient.delete(`/v1/admin/folders/${id}`));
}

export async function fetchAdminArticles() {
  return unwrap<ArticleSummary[]>(await apiClient.get("/v1/admin/articles"));
}

export async function fetchAdminArticle(id: number) {
  return unwrap<ArticleDetail>(await apiClient.get(`/v1/admin/articles/${id}`));
}

export async function createArticle(payload: ArticlePayload) {
  return unwrap<ArticleDetail>(await apiClient.post("/v1/admin/articles", payload));
}

export async function updateArticle(id: number, payload: ArticlePayload) {
  return unwrap<ArticleDetail>(await apiClient.put(`/v1/admin/articles/${id}`, payload));
}

export async function changeArticleStatus(id: number, status: ArticleStatus) {
  return unwrap<ArticleDetail>(await apiClient.patch(`/v1/admin/articles/${id}/status`, { status }));
}

export async function uploadAttachment(file: File) {
  const formData = new FormData();
  formData.append("file", file);
  return unwrap<Attachment>(
    await apiClient.post("/v1/attachments", formData, {
      headers: { "Content-Type": "multipart/form-data" }
    })
  );
}

export async function fetchAttachments() {
  return unwrap<Attachment[]>(await apiClient.get("/v1/attachments"));
}

export async function deleteAttachment(id: number) {
  return unwrap<null>(await apiClient.delete(`/v1/attachments/${id}`));
}
