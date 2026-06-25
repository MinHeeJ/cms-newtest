import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import type { DashboardMetrics } from "../../services/cmsTypes";
import { DashboardShowcaseHero, buildPublishingCalendar, calendarCellTone } from "./DashboardPage";

describe("dashboard publishing calendar", () => {
  it("builds a month calendar with daily published counts from the trend data", () => {
    const calendar = buildPublishingCalendar([
      { date: "2026-06-10", publishedCount: 2 },
      { date: "2026-06-11", publishedCount: 0 },
      { date: "2026-06-15", publishedCount: 6 }
    ]);

    expect(calendar.monthLabel).toBe("2026년 6월");
    expect(calendar.weekdays).toEqual(["일", "월", "화", "수", "목", "금", "토"]);
    expect(calendar.cells).toHaveLength(35);
    expect(calendar.cells.find((cell) => cell.date === "2026-06-10")).toMatchObject({ day: 10, publishedCount: 2, inMonth: true });
    expect(calendar.cells.find((cell) => cell.date === "2026-06-15")).toMatchObject({ day: 15, publishedCount: 6, inMonth: true });
  });

  it("uses stronger cell colors as daily publish counts increase", () => {
    expect(calendarCellTone(0, 6)).toContain("bg-slate-50");
    expect(calendarCellTone(1, 6)).toContain("bg-primary/10");
    expect(calendarCellTone(3, 6)).toContain("bg-primary/30");
    expect(calendarCellTone(6, 6)).toContain("bg-primary/70");
  });
});

describe("dashboard commercial hero", () => {
  const metrics: DashboardMetrics = {
    contentCounts: {
      draft: 4,
      inReview: 3,
      approved: 2,
      scheduled: 5,
      published: 18,
      archived: 1
    },
    reviewQueueCount: 3,
    scheduledCount: 5,
    publishingTrend: [
      { date: "2026-06-10", publishedCount: 2 },
      { date: "2026-06-11", publishedCount: 4 }
    ],
    recentActivity: [
      {
        id: "evt-1",
        eventType: "SUBMIT",
        actor: { id: "user-1", email: "editor@example.com", displayName: "김에디터" },
        targetType: "CONTENT",
        targetId: "CNT-104",
        beforeState: null,
        afterState: null,
        comment: null,
        createdAt: "2026-06-11T10:30:00Z"
      }
    ]
  };

  it("renders a branded animated command-center hero from live dashboard metrics", () => {
    const markup = renderToStaticMarkup(
      createElement(MemoryRouter, null, createElement(DashboardShowcaseHero, { metrics }))
    );

    expect(markup).toContain("콘텐츠 관제실");
    expect(markup).toContain("게시된 콘텐츠");
    expect(markup).toContain("18");
    expect(markup).toContain("animate-dashboard-float");
    expect(markup).toContain("bg-[radial-gradient");
    expect(markup).toContain("새 콘텐츠 작성");
  });
});
