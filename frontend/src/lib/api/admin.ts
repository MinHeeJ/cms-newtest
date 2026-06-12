import { apiClient, unwrap } from "../axios";
import type { ArticleDetail, ArticleSummary, Folder } from "./portal";

export type FolderInput = {
  parentId?: number | null;
  title: string;
  description?: string;
  active?: boolean;
  sortOrder?: number;
};

export type ArticleInput = {
  folderId: number;
  title: string;
  body: string;
  sortOrder?: number;
};

export type Attachment = {
  id: number;
  refType: string;
  refId: number;
  originalName: string;
  sizeBytes: number;
  contentType?: string;
  extension: string;
};

export type PdfImportResult = {
  title: string;
  markdown: string;
};

export const adminApi = {
  async folders() {
    return unwrap<Folder[]>(await apiClient.get("/v1/admin/folders"));
  },
  async createFolder(input: FolderInput) {
    return unwrap<Folder>(await apiClient.post("/v1/admin/folders", input));
  },
  async updateFolder(id: number, input: FolderInput) {
    return unwrap<Folder>(await apiClient.put(`/v1/admin/folders/${id}`, input));
  },
  async deleteFolder(id: number) {
    return unwrap<void>(await apiClient.delete(`/v1/admin/folders/${id}`));
  },
  async moveFolder(id: number, parentId: number | null) {
    return unwrap<Folder>(await apiClient.patch(`/v1/admin/folders/${id}/move`, { parentId }));
  },
  async articles(folderId?: number) {
    return unwrap<ArticleSummary[]>(await apiClient.get("/v1/admin/articles", { params: { folderId } }));
  },
  async article(id: number) {
    return unwrap<ArticleDetail>(await apiClient.get(`/v1/admin/articles/${id}`));
  },
  async createArticle(input: ArticleInput) {
    return unwrap<ArticleDetail>(await apiClient.post("/v1/admin/articles", input));
  },
  async updateArticle(id: number, input: ArticleInput) {
    return unwrap<ArticleDetail>(await apiClient.put(`/v1/admin/articles/${id}`, input));
  },
  async deleteArticle(id: number) {
    return unwrap<void>(await apiClient.delete(`/v1/admin/articles/${id}`));
  },
  async publish(id: number) {
    return unwrap<ArticleDetail>(await apiClient.patch(`/v1/admin/articles/${id}/publish`));
  },
  async unpublish(id: number) {
    return unwrap<ArticleDetail>(await apiClient.patch(`/v1/admin/articles/${id}/unpublish`));
  },
  async attachments(refType: string, refId: number) {
    return unwrap<Attachment[]>(await apiClient.get("/v1/attachments", { params: { refType, refId } }));
  },
  async uploadAttachments(refType: string, refId: number, files: FileList | File[]) {
    const form = new FormData();
    Array.from(files).forEach((file) => form.append("files", file));
    return unwrap<Attachment[]>(
      await apiClient.post("/v1/attachments", form, {
        params: { refType, refId },
        headers: { "Content-Type": "multipart/form-data" }
      })
    );
  },
  async deleteAttachment(id: number) {
    return unwrap<void>(await apiClient.delete(`/v1/attachments/${id}`));
  },
  async importPdf(file: File) {
    const form = new FormData();
    form.append("file", file);
    return unwrap<PdfImportResult>(
      await apiClient.post("/v1/admin/articles/import-pdf", form, {
        headers: { "Content-Type": "multipart/form-data" }
      })
    );
  }
};
