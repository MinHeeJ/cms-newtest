import { apiClient } from "./apiClient";
import type { DashboardMetrics } from "./cmsTypes";

export const dashboardApi = {
  metrics() {
    return apiClient<DashboardMetrics>("/api/v1/dashboard/metrics");
  }
};
