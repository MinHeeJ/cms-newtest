import { ArrowUpRight, CalendarClock, CalendarDays, CheckCircle2, FileText, Layers3 } from "lucide-react";
import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import dashboardHeroOrbits from "../../assets/dashboard-hero-orbits.svg";
import reviewQueueSoftCards from "../../assets/review-queue-soft-cards.svg";
import { LoadingPanel } from "../../components/feedback/UIState";
import { dashboardApi } from "../../services/dashboardApi";
import type { DashboardMetrics, WorkflowEvent } from "../../services/cmsTypes";

type PublishingTrendPoint = DashboardMetrics["publishingTrend"][number];

export const dashboardDecorativeAssets = {
  hero: {
    className: "relative flex min-h-[128px] items-center justify-between overflow-hidden rounded-lg bg-lightsecondary p-8",
    style: {
      backgroundImage: `linear-gradient(105deg, rgba(255,255,255,0.92) 0%, rgba(238,244,255,0.82) 44%, rgba(73,190,255,0.2) 100%), url(${dashboardHeroOrbits})`,
      backgroundPosition: "center, right -22px center",
      backgroundRepeat: "no-repeat, no-repeat",
      backgroundSize: "cover, min(54%, 560px) auto"
    }
  },
  review: {
    cardClassName: "card-box relative h-full overflow-hidden",
    backdropClassName: "pointer-events-none absolute -right-12 top-8 h-56 w-72 bg-contain bg-right bg-no-repeat opacity-20 dark:opacity-15",
    listClassName: "relative z-[1] mt-6 space-y-4",
    itemClassName: "block rounded-md border border-ld bg-white/85 p-4 backdrop-blur-sm transition-colors hover:bg-primary/10 dark:border-[#333f55] dark:bg-dark/80"
  }
};

interface PublishingCalendarCell {
  date: string;
  day: number;
  publishedCount: number;
  inMonth: boolean;
}

export function buildPublishingCalendar(points: PublishingTrendPoint[]) {
  const sortedPoints = [...points].sort((a, b) => a.date.localeCompare(b.date));
  const anchorDate = sortedPoints[sortedPoints.length - 1]?.date ?? new Date().toISOString().slice(0, 10);
  const [year, month] = anchorDate.split("-").map(Number);
  const monthIndex = month - 1;
  const firstOfMonth = new Date(Date.UTC(year, monthIndex, 1));
  const firstGridDate = new Date(firstOfMonth);
  firstGridDate.setUTCDate(firstOfMonth.getUTCDate() - firstOfMonth.getUTCDay());
  const lastOfMonth = new Date(Date.UTC(year, month, 0));
  const totalCells = Math.ceil((firstOfMonth.getUTCDay() + lastOfMonth.getUTCDate()) / 7) * 7;
  const countsByDate = new Map(sortedPoints.map((point) => [point.date, point.publishedCount]));
  const cells: PublishingCalendarCell[] = Array.from({ length: totalCells }, (_, index) => {
    const date = new Date(firstGridDate);
    date.setUTCDate(firstGridDate.getUTCDate() + index);
    const isoDate = date.toISOString().slice(0, 10);

    return {
      date: isoDate,
      day: date.getUTCDate(),
      publishedCount: countsByDate.get(isoDate) ?? 0,
      inMonth: date.getUTCMonth() === monthIndex
    };
  });

  return {
    monthLabel: `${year}년 ${month}월`,
    weekdays: ["일", "월", "화", "수", "목", "금", "토"],
    maxPublishedCount: Math.max(0, ...points.map((point) => point.publishedCount)),
    cells
  };
}

export function calendarCellTone(publishedCount: number, maxPublishedCount: number) {
  if (publishedCount <= 0 || maxPublishedCount <= 0) return "bg-slate-50 text-muted-foreground dark:bg-slate-900/40";
  const intensity = publishedCount / maxPublishedCount;
  if (intensity >= 0.85) return "bg-primary/70 text-white ring-1 ring-primary/70";
  if (intensity >= 0.5) return "bg-primary/30 text-primary dark:text-white";
  return "bg-primary/10 text-primary dark:text-white";
}

export function DashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardApi.metrics().then(setMetrics).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingPanel label="대시보드 로딩 중" />;
  if (!metrics) return <p className="text-sm text-muted-foreground">데이터를 불러오지 못했습니다.</p>;

  const metricCards = [
    { label: "게시", value: metrics.contentCounts.published, tone: "bg-success/10 text-success", icon: CheckCircle2 },
    { label: "초안", value: metrics.contentCounts.draft, tone: "bg-info/10 text-info", icon: FileText },
    { label: "검토", value: metrics.contentCounts.inReview, tone: "bg-warning/10 text-warning", icon: Layers3 },
    { label: "예약", value: metrics.contentCounts.scheduled, tone: "bg-secondary/10 text-secondary", icon: CalendarClock }
  ];
  const publishingCalendar = buildPublishingCalendar(metrics.publishingTrend);
  const reviewQueueEvents = metrics.recentActivity.filter((e) => e.eventType === "SUBMIT").slice(0, 5);

  return (
    <div className="grid grid-cols-12 gap-6">
      <section className="col-span-12">
        <div className={dashboardDecorativeAssets.hero.className} style={dashboardDecorativeAssets.hero.style}>
          <div className="relative z-[1] flex items-center gap-4">
            <div className="flex h-[58px] w-[58px] items-center justify-center rounded-2xl bg-primary text-xl font-semibold text-white shadow-md shadow-primary/20">H</div>
            <div className="flex flex-col gap-1">
              <h1 className="card-title">Dashboard</h1>
              <p className="max-w-xl text-sm leading-6 text-muted-foreground">콘텐츠 운영 현황과 검토 작업을 한 화면에서 확인합니다.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="col-span-12">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
          {metricCards.map((card) => {
            const Icon = card.icon;
            return (
              <NavLink key={card.label} className={`w-full rounded-lg border-none p-6 shadow-none transition-all ease-in-out hover:scale-105 ${card.tone}`} to="/content">
                <div className="text-center">
                  <div className="mb-3 flex justify-center">
                    <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/80">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                  </div>
                  <p className="mb-1 font-semibold">{card.label}</p>
                  <h2 className="mb-0 text-lg font-semibold">{card.value}</h2>
                </div>
              </NavLink>
            );
          })}
        </div>
      </section>

      <section className="col-span-12 flex lg:col-span-8">
        <div className="card-box h-full w-full">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <CalendarDays className="h-5 w-5 text-primary" aria-hidden="true" />
                <h2 className="card-title">게시 추세</h2>
              </div>
              <p className="text-sm text-muted-foreground">날짜별 콘텐츠 등록 건수와 게시 밀도</p>
            </div>
            <NavLink className="button-base border border-primary bg-transparent text-primary hover:bg-primary hover:text-white" to="/audit">
              감사 로그 <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </NavLink>
          </div>
          <div className="rounded-lg border border-ld bg-white/60 p-4 dark:border-[#333f55] dark:bg-transparent" aria-label="날짜별 콘텐츠 등록 현황 캘린더">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm font-semibold text-foreground dark:text-white">{publishingCalendar.monthLabel}</p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground" aria-hidden="true">
                <span>적음</span>
                {[0, 1, 3, 6].map((count) => (
                  <span key={count} className={`h-3 w-3 rounded-sm ${calendarCellTone(count, 6)}`} />
                ))}
                <span>많음</span>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold text-muted-foreground">
              {publishingCalendar.weekdays.map((weekday) => (
                <span key={weekday}>{weekday}</span>
              ))}
            </div>
            <div className="mt-2 grid grid-cols-7 gap-2">
              {publishingCalendar.cells.map((cell) => (
                <div
                  key={cell.date}
                  className={`min-h-[54px] rounded-md border border-transparent p-2 transition-colors ${calendarCellTone(cell.publishedCount, publishingCalendar.maxPublishedCount)} ${cell.inMonth ? "" : "opacity-35"}`}
                  aria-label={`${cell.date} 게시 ${cell.publishedCount}건`}
                >
                  <div className="flex h-full flex-col justify-between gap-1">
                    <span className="text-[11px] font-medium">{cell.day}</span>
                    <span className="text-right text-sm font-bold tabular-nums">{cell.publishedCount}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="col-span-12 lg:col-span-4">
        <div className={dashboardDecorativeAssets.review.cardClassName}>
          <div className={dashboardDecorativeAssets.review.backdropClassName} style={{ backgroundImage: `url(${reviewQueueSoftCards})` }} aria-hidden="true" />
          <h2 className="relative z-[1] card-title">검토 대기</h2>
          <div className={dashboardDecorativeAssets.review.listClassName}>
            {reviewQueueEvents.map((event) => (
              <NavLink key={event.id} className={dashboardDecorativeAssets.review.itemClassName} to="/review">
                <p className="text-sm font-semibold text-foreground dark:text-white">{event.targetId}</p>
                <p className="text-xs text-muted-foreground">{event.actor.displayName} · {new Date(event.createdAt).toLocaleString("ko-KR")}</p>
              </NavLink>
            ))}
          </div>
        </div>
      </section>

      <section className="col-span-12 lg:col-span-4">
        <div className="card-box h-full">
          <h2 className="card-title">최근 활동</h2>
          <div className="mt-6">
            {metrics.recentActivity.map((event) => (
              <TimelineEvent key={event.id} event={event} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function TimelineEvent({ event }: { event: WorkflowEvent }) {
  return (
    <div className="flex gap-x-3">
      <div className="w-1/4 text-end text-xs text-muted-foreground">{new Date(event.createdAt).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })}</div>
      <div className="relative z-[1] flex h-7 w-7 items-center justify-center">
        <span className="h-3 w-3 rounded-full border-2 border-primary bg-transparent" />
      </div>
      <div className="w-1/4 grow pb-6 pt-0.5">
        <p className="text-sm font-medium text-foreground dark:text-white">{event.eventType}</p>
        <p className="text-xs text-muted-foreground">{event.actor.displayName}</p>
      </div>
    </div>
  );
}
