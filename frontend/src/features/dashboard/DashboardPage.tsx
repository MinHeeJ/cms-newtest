import { ArrowUpRight, CalendarClock, CheckCircle2, FileText, Layers3 } from "lucide-react";
import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { DataTable } from "../../components/tables/DataTable";
import { StatusBadge } from "../../components/feedback/StatusBadge";
import { LoadingPanel } from "../../components/feedback/UIState";
import { dashboardApi } from "../../services/dashboardApi";
import type { ContentListItem, DashboardMetrics, WorkflowEvent } from "../../services/cmsTypes";

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

  return (
    <div className="grid grid-cols-12 gap-6">
      <section className="col-span-12">
        <div className="relative flex items-center justify-between rounded-lg bg-lightsecondary p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-[50px] w-[50px] items-center justify-center rounded-full bg-primary text-lg font-semibold text-white">H</div>
            <div className="flex flex-col gap-0.5">
              <h1 className="card-title">Dashboard</h1>
              <p className="text-sm text-muted-foreground">콘텐츠 운영 현황과 검토 작업을 한 화면에서 확인합니다.</p>
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
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="card-title">게시 추세</h2>
              <p className="text-sm text-muted-foreground">일자별 게시 완료 건수</p>
            </div>
            <NavLink className="button-base border border-primary bg-transparent text-primary hover:bg-primary hover:text-white" to="/audit">
              감사 로그 <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </NavLink>
          </div>
          <div className="flex h-[316px] items-end gap-4 border-b border-ld pb-4 dark:border-[#333f55]">
            {metrics.publishingTrend.map((point) => (
              <div key={point.date} className="flex flex-1 flex-col items-center gap-2">
                <div className="w-full rounded-t-md bg-primary" style={{ height: `${Math.max(28, point.publishedCount * 34)}px` }} />
                <span className="text-xs text-muted-foreground">{point.date.slice(5)}</span>
              </div>
            ))}
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
