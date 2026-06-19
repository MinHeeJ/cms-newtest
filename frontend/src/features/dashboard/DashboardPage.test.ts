import { describe, expect, it } from "vitest";
import { buildPublishingCalendar, calendarCellTone, dashboardDecorativeAssets } from "./DashboardPage";

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

describe("dashboard decorative assets", () => {
  it("keeps the hero visually larger and image-backed", () => {
    expect(dashboardDecorativeAssets.hero.className).toContain("min-h-[128px]");
    expect(dashboardDecorativeAssets.hero.style.backgroundImage).toContain("url(");
    expect(dashboardDecorativeAssets.hero.style.backgroundImage).toContain("linear-gradient");
  });

  it("adds a low-opacity review background without reducing list readability", () => {
    expect(dashboardDecorativeAssets.review.backdropClassName).toContain("opacity-20");
    expect(dashboardDecorativeAssets.review.listClassName).toContain("relative");
    expect(dashboardDecorativeAssets.review.itemClassName).toContain("bg-white/85");
  });
});
