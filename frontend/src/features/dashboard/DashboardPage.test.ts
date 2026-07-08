import { describe, expect, it } from "vitest";
import { buildPublishingCalendar, buildRoleDashboardModel, calendarCellTone, dashboardStatusBadge } from "./DashboardPage";

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

describe("adaptive dashboard model", () => {
  it("prioritizes admin governance widgets and shortcuts", () => {
    const model = buildRoleDashboardModel(["ADMIN"]);

    expect(model.roleLabel).toBe("관리자 운영 모드");
    expect(model.shortcuts.map((shortcut) => shortcut.label)).toEqual(["사용자 권한", "감사 로그", "내비게이션"]);
    expect(model.widgets.map((widget) => widget.id)).toEqual(["review", "schedule", "governance", "activity"]);
  });

  it("prioritizes author writing flow widgets without admin-only destinations", () => {
    const model = buildRoleDashboardModel(["AUTHOR"]);

    expect(model.roleLabel).toBe("작성자 집중 모드");
    expect(model.shortcuts.map((shortcut) => shortcut.to)).toEqual(["/content/new", "/content", "/revisions"]);
    expect(model.widgets.map((widget) => widget.id)).toEqual(["draft", "review", "schedule", "activity"]);
  });

  it("maps dashboard health to accessible status badges that do not rely on color only", () => {
    expect(dashboardStatusBadge({ reviewQueueCount: 1, scheduledCount: 4 })).toMatchObject({ label: "On Track", iconLabel: "정상" });
    expect(dashboardStatusBadge({ reviewQueueCount: 7, scheduledCount: 2 })).toMatchObject({ label: "At Risk", iconLabel: "주의" });
    expect(dashboardStatusBadge({ reviewQueueCount: 13, scheduledCount: 1 })).toMatchObject({ label: "Blocked", iconLabel: "차단" });
  });
});
