import { apiClient } from "./apiClient";
import type { TaxonomyTerm } from "./cmsTypes";

export const taxonomyApi = {
  list(type?: "CATEGORY" | "TAG") {
    return apiClient<TaxonomyTerm[]>("/api/v1/taxonomy", { query: type ? { type } : {} });
  },
  create(payload: { type: string; name: string; slug: string; description?: string; parentId?: string; sortOrder?: number }) {
    return apiClient<TaxonomyTerm>("/api/v1/taxonomy", { method: "POST", body: payload });
  },
  update(id: string, payload: { type: string; name: string; slug: string; description?: string }) {
    return apiClient<TaxonomyTerm>(`/api/v1/taxonomy/${id}`, { method: "PATCH", body: payload });
  },
  delete(id: string) {
    return apiClient<void>(`/api/v1/taxonomy/${id}?confirm=true`, { method: "DELETE" });
  }
};
