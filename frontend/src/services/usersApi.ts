import { apiClient } from "./apiClient";
import type { Paged, User } from "./cmsTypes";

export const usersApi = {
  list(page = 1, pageSize = 25) {
    return apiClient<Paged<User>>("/api/v1/users", { query: { page, pageSize } });
  },
  updateRoles(id: string, roles: string[], reason: string) {
    return apiClient<User>(`/api/v1/users/${id}/roles`, { method: "PATCH", body: { roles, reason } });
  }
};
