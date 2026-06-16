import { getDataStore } from "../../persistence/database.js";
import type { ContentStatus, DashboardMetrics } from "../content/content.types.js";

const countKeyByStatus: Record<ContentStatus, keyof DashboardMetrics["contentCounts"]> = {
  DRAFT: "draft",
  IN_REVIEW: "inReview",
  APPROVED: "approved",
  SCHEDULED: "scheduled",
  PUBLISHED: "published",
  ARCHIVED: "archived"
};

export class DashboardService {
  metrics(): DashboardMetrics {
    const store = getDataStore();
    const contentCounts: DashboardMetrics["contentCounts"] = {
      draft: 0,
      inReview: 0,
      approved: 0,
      scheduled: 0,
      published: 0,
      archived: 0
    };

    for (const content of store.contentItems) {
      contentCounts[countKeyByStatus[content.status]] += 1;
    }

    const trendMap = new Map<string, number>();
    for (const content of store.contentItems.filter((item) => item.publishedAt)) {
      const date = content.publishedAt?.slice(0, 10) ?? "";
      trendMap.set(date, (trendMap.get(date) ?? 0) + 1);
    }

    return {
      contentCounts,
      reviewQueueCount: contentCounts.inReview,
      scheduledCount: contentCounts.scheduled,
      recentActivity: store.workflowEvents.slice(0, 8),
      publishingTrend: [...trendMap.entries()]
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([date, publishedCount]) => ({ date, publishedCount }))
    };
  }
}

export const dashboardService = new DashboardService();
