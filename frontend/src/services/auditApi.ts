import { apiClient } from "./apiClient";
import type { Paged, WorkflowEvent } from "./cmsTypes";

export const auditApi = {
  list(params: { actorId?: string; targetType?: string; page?: number; pageSize?: number } = {}) {
    return apiClient<Paged<WorkflowEvent>>("/api/v1/audit/events", { query: params });
  }
};
