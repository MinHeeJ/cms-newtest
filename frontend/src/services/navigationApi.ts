import { apiClient } from "./apiClient";
import type { NavigationMenu } from "./cmsTypes";

export const navigationApi = {
  list() {
    return apiClient<NavigationMenu[]>("/api/v1/navigation/menus");
  },
  save(payload: { key: string; label: string; isActive: boolean; items: unknown[] }) {
    return apiClient<NavigationMenu>("/api/v1/navigation/menus", { method: "POST", body: payload });
  },
  update(id: string, payload: { key: string; label: string; isActive: boolean; items: unknown[] }) {
    return apiClient<NavigationMenu>(`/api/v1/navigation/menus/${id}`, { method: "PATCH", body: payload });
  }
};
