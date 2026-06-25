import { ArrowUpRight, CalendarClock, CalendarDays, CheckCircle2, FileText, Layers3, PenLine, Radio, Sparkles, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { LoadingPanel } from "../../components/feedback/UIState";
import { dashboardApi } from "../../services/dashboardApi";
import type { DashboardMetrics, WorkflowEvent } from "../../services/cmsTypes";

type PublishingTrendPoint = DashboardMetrics["publishingTrend"][number];

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

export function DashboardShowcaseHero({ metrics }: { metrics: DashboardMetrics }) {
  const totalActiveContent =
    metrics.contentCounts.published +
    metrics.contentCounts.draft +
    metrics.contentCounts.inReview +
    metrics.contentCounts.approved +
    metrics.contentCounts.scheduled;
  const latestActivity = metrics.recentActivity[0];
  const weeklyPublishes = metrics.publishingTrend.reduce((sum, point) => sum + point.publishedCount, 0);
  const heroStats = [
    { label: "게시된 콘텐츠", value: metrics.contentCounts.published, helper: "라이브 운영" },
    { label: "검토 대기", value: metrics.reviewQueueCount, helper: "에디터 승인 필요" },
    { label: "예약 발행", value: metrics.scheduledCount, helper: "캘린더 대기" }
  ];

  return (
    <section className="col-span-12">
      <div className="relative isolate overflow-hidden rounded-[28px] bg-[radial-gradient(circle_at_20%_20%,rgba(93,135,255,0.38),transparent_32%),radial-gradient(circle_at_82%_18%,rgba(19,222,185,0.28),transparent_26%),linear-gradient(135deg,#111827_0%,#1c2536_52%,#2349a9_100%)] p-6 text-white shadow-[0_28px_70px_rgba(28,37,54,0.26)] sm:p-8 lg:p-10">
        <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full border border-white/20" aria-hidden="true" />
        <div className="pointer-events-none absolute bottom-8 right-10 hidden h-28 w-28 rounded-full bg-white/10 blur-2xl md:block" aria-hidden="true" />
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.8fr)] lg:items-center">
          <div className="relative z-10 max-w-3xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.26em] text-sky-100 shadow-inner shadow-white/10 backdrop-blur">
              <Radio className="h-3.5 w-3.5 animate-pulse" aria-hidden="true" />
              Live editorial command
            </div>
            <h1 className="max-w-2xl text-4xl font-black leading-[1.05] tracking-[-0.045em] sm:text-5xl lg:text-6xl">
              콘텐츠 관제실
              <span className="block text-white/70">오늘의 발행 흐름을 즉시 조율합니다.</span>
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-slate-200 sm:text-lg">
              데이터에서 바로 이어지는 액션 카드와 은은한 모션을 더해 CMS 메인페이지를 상용 운영 대시보드처럼 읽히도록 정리했습니다.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <NavLink className="button-base h-12 rounded-full bg-white px-6 text-foreground shadow-lg shadow-black/20 hover:bg-sky-50" to="/content/new">
                <PenLine className="h-4 w-4" aria-hidden="true" />
                새 콘텐츠 작성
              </NavLink>
              <NavLink className="button-base h-12 rounded-full border border-white/25 bg-white/10 px-6 text-white backdrop-blur hover:bg-white/20" to="/review">
                검토 큐 확인 <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </NavLink>
            </div>
          </div>

          <div className="relative z-10 rounded-[24px] border border-white/[0.15] bg-white/[0.12] p-5 shadow-2xl shadow-black/20 backdrop-blur-xl animate-dashboard-float">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-100">Operation pulse</p>
                <p className="mt-1 text-3xl font-black tabular-nums">{totalActiveContent}</p>
              </div>
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-primary shadow-lg shadow-black/10">
                <Sparkles className="h-5 w-5" aria-hidden="true" />
              </span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {heroStats.map((stat) => (
                <div key={stat.label} className="rounded-2xl border border-white/10 bg-white/10 p-3">
                  <p className="text-[11px] text-slate-200">{stat.label}</p>
                  <p className="mt-2 text-2xl font-black tabular-nums">{stat.value}</p>
                  <p className="mt-1 text-[10px] text-slate-300">{stat.helper}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 rounded-2xl bg-[#07111f]/[0.55] p-4 ring-1 ring-white/10">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs text-slate-300">이번 추세 게시량</p>
                  <p className="mt-1 text-xl font-bold tabular-nums">{weeklyPublishes}건</p>
                </div>
                <Zap className="h-5 w-5 text-success" aria-hidden="true" />
              </div>
              <div className="mt-4 flex h-14 items-end gap-1.5" aria-label="최근 게시 추세 미니 차트">
                {metrics.publishingTrend.slice(-8).map((point) => (
                  <span
                    key={point.date}
                    className="flex-1 rounded-t-full bg-gradient-to-t from-success to-secondary opacity-90"
                    style={{ height: `${Math.min(56, Math.max(18, point.publishedCount * 12))}px` }}
                    title={`${point.date} ${point.publishedCount}건`}
                  />
                ))}
              </div>
              {latestActivity ? (
                <p className="mt-4 truncate text-xs text-slate-300">최근 활동: {latestActivity.actor.displayName} · {latestActivity.eventType} · {latestActivity.targetId}</p>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
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

  return (
    <div className="grid grid-cols-12 gap-6">
      <DashboardShowcaseHero metrics={metrics} />

      <section className="col-span-12">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
          {metricCards.map((card) => {
            const Icon = card.icon;
            return (
              <NavLink key={card.label} className={`group w-full overflow-hidden rounded-2xl border border-transparent p-6 shadow-[0_16px_40px_rgba(28,37,54,0.08)] transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_22px_50px_rgba(28,37,54,0.14)] ${card.tone}`} to="/content">
                <div className="relative text-center">
                  <div className="pointer-events-none absolute -right-9 -top-9 h-20 w-20 rounded-full bg-white/[0.35] transition-transform duration-500 group-hover:scale-125" aria-hidden="true" />
                  <div className="mb-3 flex justify-center">
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/[0.85] shadow-sm transition-transform duration-300 group-hover:rotate-3 group-hover:scale-110">
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
                  className={`min-h-[54px] rounded-md border border-transparent p-2 transition-colors ${calendarCellTone(cell.publishedCount, publishingCalendar.maxPublishedCount)} ${cell.inMonth ? "" : "opacity-[0.35]"}`}
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
        <div className="card-box h-full">
          <h2 className="card-title">검토 대기</h2>
          <div className="mt-6 space-y-4">
            {metrics.recentActivity.filter((e) => e.eventType === "SUBMIT").slice(0, 5).map((event) => (
              <NavLink key={event.id} className="block rounded-md border border-ld p-4 transition-colors hover:bg-primary/10 dark:border-[#333f55]" to="/review">
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
