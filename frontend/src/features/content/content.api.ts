import { apiClient } from "../../services/apiClient";
import type { ContentItem, ContentListItem, ContentRevision, Paged, PublicationSchedule } from "../../services/cmsTypes";

export interface ContentPayload {
  contentType: "ARTICLE" | "PAGE";
  title: string;
  slug: string;
  summary?: string;
  markdownBody: string;
  visibility?: "PUBLIC" | "UNLISTED" | "PRIVATE";
  featuredMediaId?: string | null;
  categoryIds?: string[];
  tagIds?: string[];
  changeSummary?: string;
}

export const contentApi = {
  list(query: Record<string, string | number | undefined>) {
    return apiClient<Paged<ContentListItem>>("/api/v1/content", { query });
  },
  get(id: string) {
    return apiClient<ContentItem>(`/api/v1/content/${id}`);
  },
  create(payload: ContentPayload) {
    return apiClient<ContentItem>("/api/v1/content", { method: "POST", body: payload });
  },
  update(id: string, payload: ContentPayload) {
    return apiClient<ContentItem>(`/api/v1/content/${id}`, { method: "PATCH", body: payload });
  },
  preview(id: string, payload: { title?: string; summary?: string; markdownBody?: string }) {
    return apiClient<{ html: string; warnings?: string[] }>(`/api/v1/content/${id}/preview`, { method: "POST", body: payload });
  },
  submit(id: string) {
    return apiClient<ContentItem>(`/api/v1/content/${id}/submit`, { method: "POST" });
  },
  review(id: string, payload: { decision: "APPROVE" | "REJECT"; comment?: string }) {
    return apiClient<ContentItem>(`/api/v1/content/${id}/review`, { method: "POST", body: payload });
  },
  publish(id: string) {
    return apiClient<ContentItem>(`/api/v1/content/${id}/publish`, { method: "POST" });
  },
  schedule(id: string, payload: { scheduledAt: string }) {
    return apiClient<PublicationSchedule>(`/api/v1/content/${id}/schedule`, { method: "POST", body: payload });
  },
  unpublish(id: string) {
    return apiClient<ContentItem>(`/api/v1/content/${id}/unpublish`, { method: "POST" });
  },
  archive(id: string) {
    return apiClient<ContentItem>(`/api/v1/content/${id}/archive`, { method: "POST" });
  },
  revisions(id: string) {
    return apiClient<ContentRevision[]>(`/api/v1/content/${id}/revisions`);
  },
  restore(id: string, revisionId: string) {
    return apiClient<ContentItem>(`/api/v1/content/${id}/revisions/${revisionId}/restore`, { method: "POST" });
  }
};
