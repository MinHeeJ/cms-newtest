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
}

export const contentApi = {
  list(query: Record<string, string | number | undefined>) {
    return apiClient<Paged<ContentListItem>>("/api/v1/content", { query });
  },
  create(payload: ContentPayload) {
    return apiClient<ContentItem>("/api/v1/content", { method: "POST", body: payload });
  },
  update(contentId: string, payload: ContentPayload & { expectedRevision?: number; changeSummary?: string }) {
    return apiClient<ContentItem>(`/api/v1/content/${contentId}`, { method: "PATCH", body: payload });
  },
  preview(contentId: string, payload: { title?: string; summary?: string; markdownBody?: string }) {
    return apiClient<{ html: string; warnings: string[] }>(`/api/v1/content/${contentId}/preview`, { method: "POST", body: payload });
  },
  submit(contentId: string) {
    return apiClient<ContentItem>(`/api/v1/content/${contentId}/submit`, { method: "POST" });
  },
  review(contentId: string, payload: { decision: "APPROVE" | "REJECT"; comment?: string }) {
    return apiClient<ContentItem>(`/api/v1/content/${contentId}/review`, { method: "POST", body: payload });
  },
  publish(contentId: string) {
    return apiClient<ContentItem>(`/api/v1/content/${contentId}/publish`, { method: "POST", body: { confirm: true } });
  },
  schedule(contentId: string, payload: { scheduledAt: string; timezone?: string }) {
    return apiClient<PublicationSchedule>(`/api/v1/content/${contentId}/schedule`, { method: "POST", body: payload });
  },
  revisions(contentId: string) {
    return apiClient<ContentRevision[]>(`/api/v1/content/${contentId}/revisions`);
  },
  restore(contentId: string, revisionId: string) {
    return apiClient<ContentItem>(`/api/v1/content/${contentId}/revisions/${revisionId}/restore`, { method: "POST" });
  }
};
