import { apiClient } from "./apiClient";
import type { MediaAsset, Paged } from "./cmsTypes";

export const mediaApi = {
  list(page = 1, pageSize = 25) {
    return apiClient<Paged<MediaAsset>>("/api/v1/media", { query: { page, pageSize } });
  },
  upload(payload: { fileName?: string; mimeType?: string; sizeBytes?: number; altText?: string; caption?: string }) {
    return apiClient<MediaAsset>("/api/v1/media", { method: "POST", body: payload });
  },
  update(id: string, payload: { fileName?: string; altText?: string; caption?: string }) {
    return apiClient<MediaAsset>(`/api/v1/media/${id}`, { method: "PATCH", body: payload });
  },
  delete(id: string) {
    return apiClient<void>(`/api/v1/media/${id}?confirm=true`, { method: "DELETE" });
  }
};
