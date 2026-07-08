import {
  AlertTriangle,
  ArrowUpRight,
  Bot,
  CalendarClock,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileText,
  GripVertical,
  Layers3,
  PencilLine,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  XCircle
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { NavLink } from "react-router-dom";
import { LoadingPanel } from "../../components/feedback/UIState";
import { useAuth } from "../auth/AuthContext";
import { dashboardApi } from "../../services/dashboardApi";
import type { DashboardMetrics, RoleName, WorkflowEvent } from "../../services/cmsTypes";

type PublishingTrendPoint = DashboardMetrics["publishingTrend"][number];
type DashboardWidgetId = "review" | "schedule" | "governance" | "activity" | "draft";

interface PublishingCalendarCell {
  date: string;
  day: number;
  publishedCount: number;
  inMonth: boolean;
}

interface DashboardShortcut {
  label: string;
  to: string;
  helper: string;
}

interface DashboardWidgetConfig {
  id: DashboardWidgetId;
  label: string;
  helper: string;
  size: "wide" | "compact";
}

interface RoleDashboardModel {
  roleLabel: string;
  copilotPrompt: string;
  shortcuts: DashboardShortcut[];
  widgets: DashboardWidgetConfig[];
}

interface DashboardHealthInput {
  reviewQueueCount: number;
  scheduledCount: number;
}

const roleDashboardModels: Record<"ADMIN" | "EDITOR" | "AUTHOR" | "VIEWER", RoleDashboardModel> = {
  ADMIN: {
    roleLabel: "관리자 운영 모드",
    copilotPrompt: "권한 변경과 감사 로그의 이상 징후를 함께 검토해볼까요?",
    shortcuts: [
      { label: "사용자 권한", to: "/users", helper: "역할·접근 제어" },
      { label: "감사 로그", to: "/audit", helper: "최근 변경 추적" },
      { label: "내비게이션", to: "/navigation", helper: "메뉴 구조 점검" }
    ],
    widgets: [
      { id: "review", label: "검토 병목", helper: "승인 대기 흐름", size: "compact" },
      { id: "schedule", label: "예약 게시", helper: "다가오는 발행", size: "compact" },
      { id: "governance", label: "운영 상태", helper: "감사·권한 신호", size: "compact" },
      { id: "activity", label: "최근 활동", helper: "전체 변경 이력", size: "wide" }
    ]
  },
  EDITOR: {
    roleLabel: "편집자 큐레이션 모드",
    copilotPrompt: "검토 대기 글의 우선순위와 발행 리스크를 함께 정리해볼까요?",
    shortcuts: [
      { label: "검토 대기", to: "/review", helper: "승인·반려" },
      { label: "예약 게시", to: "/scheduled", helper: "발행 캘린더" },
      { label: "미디어", to: "/media", helper: "자산 확인" }
    ],
    widgets: [
      { id: "review", label: "검토 대기", helper: "오늘 처리할 콘텐츠", size: "compact" },
      { id: "schedule", label: "게시 일정", helper: "일정 충돌 확인", size: "compact" },
      { id: "draft", label: "초안 흐름", helper: "작성 중 콘텐츠", size: "compact" },
      { id: "activity", label: "편집 활동", helper: "최근 워크플로", size: "wide" }
    ]
  },
  AUTHOR: {
    roleLabel: "작성자 집중 모드",
    copilotPrompt: "초안 제목, 요약, SEO 메타 정보를 함께 다듬어볼까요?",
    shortcuts: [
      { label: "새 콘텐츠", to: "/content/new", helper: "작성 시작" },
      { label: "내 콘텐츠", to: "/content", helper: "초안 확인" },
      { label: "Revision", to: "/revisions", helper: "변경 이력" }
    ],
    widgets: [
      { id: "draft", label: "초안", helper: "이어 쓸 콘텐츠", size: "compact" },
      { id: "review", label: "검토 상태", helper: "제출한 글", size: "compact" },
      { id: "schedule", label: "예정 발행", helper: "발행 대기", size: "compact" },
      { id: "activity", label: "내 활동", helper: "최근 변경", size: "wide" }
    ]
  },
  VIEWER: {
    roleLabel: "뷰어 모니터링 모드",
    copilotPrompt: "최근 발행 흐름과 콘텐츠 상태를 함께 읽어볼까요?",
    shortcuts: [
      { label: "전체 콘텐츠", to: "/content", helper: "콘텐츠 검색" },
      { label: "미디어", to: "/media", helper: "자산 탐색" },
      { label: "Dashboard", to: "/", helper: "운영 현황" }
    ],
    widgets: [
      { id: "activity", label: "최근 활동", helper: "공개 변경", size: "wide" },
      { id: "schedule", label: "발행 일정", helper: "예정 콘텐츠", size: "compact" },
      { id: "review", label: "운영 현황", helper: "상태 요약", size: "compact" },
      { id: "draft", label: "콘텐츠 현황", helper: "상태별 수량", size: "compact" }
    ]
  }
};

export function buildRoleDashboardModel(roles: RoleName[] = []): RoleDashboardModel {
  if (roles.includes("ADMIN")) return roleDashboardModels.ADMIN;
  if (roles.includes("EDITOR")) return roleDashboardModels.EDITOR;
  if (roles.includes("AUTHOR")) return roleDashboardModels.AUTHOR;
  return roleDashboardModels.VIEWER;
}

export function dashboardStatusBadge({ reviewQueueCount, scheduledCount }: DashboardHealthInput) {
  if (reviewQueueCount >= 12) {
    return { label: "Blocked", iconLabel: "차단", tone: "bg-error/10 text-error ring-error/20", Icon: XCircle };
  }
  if (reviewQueueCount >= 6 || scheduledCount === 0) {
    return { label: "At Risk", iconLabel: "주의", tone: "bg-warning/15 text-warning ring-warning/25", Icon: AlertTriangle };
  }
  return { label: "On Track", iconLabel: "정상", tone: "bg-success/10 text-success ring-success/20", Icon: CheckCircle2 };
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
  const { user } = useAuth();

  useEffect(() => {
    dashboardApi.metrics().then(setMetrics).finally(() => setLoading(false));
  }, []);

  const roleModel = useMemo(() => buildRoleDashboardModel(user?.roles ?? []), [user?.roles]);

  if (loading) return <LoadingPanel label="대시보드 로딩 중" />;
  if (!metrics) return <p className="text-sm text-muted-foreground">데이터를 불러오지 못했습니다.</p>;

  const metricCards = [
    { label: "게시", value: metrics.contentCounts.published, tone: "bg-success/10 text-success", icon: CheckCircle2, helper: "라이브 콘텐츠" },
    { label: "초안", value: metrics.contentCounts.draft, tone: "bg-info/10 text-info", icon: FileText, helper: "작성 중" },
    { label: "검토", value: metrics.contentCounts.inReview, tone: "bg-warning/10 text-warning", icon: Layers3, helper: "승인 필요" },
    { label: "예약", value: metrics.contentCounts.scheduled, tone: "bg-secondary/10 text-secondary", icon: CalendarClock, helper: "발행 대기" }
  ];
  const publishingCalendar = buildPublishingCalendar(metrics.publishingTrend);
  const status = dashboardStatusBadge(metrics);
  const StatusIcon = status.Icon;
  const reviewEvents = metrics.recentActivity.filter((e) => e.eventType === "SUBMIT").slice(0, 5);

  return (
    <div className="grid grid-cols-12 gap-6">
      <section className="col-span-12">
        <div className="relative overflow-hidden rounded-[28px] border border-ld bg-[radial-gradient(circle_at_16%_10%,rgba(59,130,246,0.16),transparent_28%),linear-gradient(135deg,#f8fbff,#eef6ff_48%,#f8fafc)] p-6 shadow-sm dark:border-white/10 dark:bg-[radial-gradient(circle_at_16%_10%,rgba(125,211,252,0.14),transparent_30%),linear-gradient(135deg,#101827,#182235_52%,#0f172a)] md:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-white/70 px-3 py-1 text-xs font-semibold text-primary shadow-sm dark:bg-white/10 dark:text-sky-200">
                <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                {roleModel.roleLabel}
              </div>
              <h1 className="font-display text-3xl font-semibold tracking-[-0.04em] text-foreground dark:text-white md:text-5xl">Calm CMS Command</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground dark:text-white/70">
                콘텐츠 운영 현황, 검토 병목, 발행 일정을 한 화면에 정돈해 인지 부하를 줄이고 다음 행동을 명확하게 제안합니다.
              </p>
            </div>
            <div className="rounded-2xl border border-white/70 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/10">
              <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold ring-1 ${status.tone}`} aria-label={`대시보드 상태 ${status.iconLabel} ${status.label}`}>
                <StatusIcon className="h-4 w-4" aria-hidden="true" />
                {status.iconLabel} · {status.label}
              </div>
              <p className="mt-3 text-xs leading-5 text-muted-foreground dark:text-white/70">색상, 아이콘, 라벨을 함께 제공해 상태를 구분합니다.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="col-span-12">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {roleModel.shortcuts.map((shortcut) => (
            <NavLink key={shortcut.to} className="group rounded-2xl border border-ld bg-white p-4 transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md dark:border-white/10 dark:bg-white/5" to={shortcut.to}>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-foreground dark:text-white">{shortcut.label}</p>
                  <p className="mt-1 text-xs text-muted-foreground dark:text-white/60">{shortcut.helper}</p>
                </div>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground transition group-hover:text-primary" aria-hidden="true" />
              </div>
            </NavLink>
          ))}
        </div>
      </section>

      <section className="col-span-12">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {metricCards.map((card) => {
            const Icon = card.icon;
            return (
              <NavLink key={card.label} className="w-full rounded-2xl border border-ld bg-white p-5 shadow-sm transition-all ease-in-out hover:-translate-y-0.5 hover:shadow-md dark:border-white/10 dark:bg-white/5" to="/content">
                <div className="flex items-center justify-between gap-4">
                  <span className={`flex h-12 w-12 items-center justify-center rounded-2xl ${card.tone}`}>
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <div className="text-right">
                    <p className="text-xs font-medium text-muted-foreground dark:text-white/60">{card.helper}</p>
                    <p className="mt-1 text-2xl font-semibold tabular-nums text-foreground dark:text-white">{card.value}</p>
                    <p className="text-sm font-semibold text-muted-foreground dark:text-white/70">{card.label}</p>
                  </div>
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
          <div className="rounded-2xl border border-ld bg-white/60 p-4 dark:border-white/10 dark:bg-transparent" aria-label="날짜별 콘텐츠 등록 현황 캘린더">
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
                  className={`min-h-[54px] rounded-xl border border-transparent p-2 transition-colors ${calendarCellTone(cell.publishedCount, publishingCalendar.maxPublishedCount)} ${cell.inMonth ? "" : "opacity-35"}`}
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
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <h2 className="card-title">맞춤 위젯</h2>
              <p className="text-sm text-muted-foreground">역할에 맞게 우선순위를 제안합니다.</p>
            </div>
            <SlidersHorizontal className="h-5 w-5 text-primary" aria-hidden="true" />
          </div>
          <div className="space-y-3" aria-label="드래그 앤 드롭으로 배치할 수 있는 대시보드 위젯 목록">
            {roleModel.widgets.map((widget) => (
              <article key={widget.id} draggable className="flex items-center gap-3 rounded-2xl border border-ld bg-slate-50/80 p-3 dark:border-white/10 dark:bg-white/5">
                <GripVertical className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground dark:text-white">{widget.label}</p>
                  <p className="text-xs text-muted-foreground">{widget.helper} · {widget.size === "wide" ? "넓게" : "컴팩트"}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="col-span-12 lg:col-span-4">
        <div className="card-box h-full">
          <h2 className="card-title">검토 대기</h2>
          <div className="mt-6 space-y-4">
            {reviewEvents.length ? reviewEvents.map((event) => (
              <NavLink key={event.id} className="block rounded-2xl border border-ld p-4 transition-colors hover:bg-primary/10 dark:border-white/10" to="/review">
                <p className="text-sm font-semibold text-foreground dark:text-white">{event.targetId}</p>
                <p className="text-xs text-muted-foreground">{event.actor.displayName} · {new Date(event.createdAt).toLocaleString("ko-KR")}</p>
              </NavLink>
            )) : <p className="rounded-2xl border border-dashed border-ld p-4 text-sm text-muted-foreground dark:border-white/10">현재 검토 대기 콘텐츠가 없습니다.</p>}
          </div>
        </div>
      </section>

      <section className="col-span-12 lg:col-span-4">
        <div className="card-box h-full border-primary/20 bg-primary/5 dark:bg-primary/10">
          <div className="mb-4 flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" aria-hidden="true" />
            <h2 className="card-title">AI 코파일럿</h2>
          </div>
          <p className="text-sm leading-6 text-muted-foreground dark:text-white/70">{roleModel.copilotPrompt}</p>
          <div className="mt-4 space-y-3 text-sm">
            <NavLink className="flex items-center gap-2 rounded-2xl bg-white p-3 font-semibold text-foreground shadow-sm hover:text-primary dark:bg-white/10 dark:text-white" to="/content/new">
              <PencilLine className="h-4 w-4" aria-hidden="true" /> 제목·요약 초안 검토
            </NavLink>
            <NavLink className="flex items-center gap-2 rounded-2xl bg-white p-3 font-semibold text-foreground shadow-sm hover:text-primary dark:bg-white/10 dark:text-white" to="/audit">
              <ShieldCheck className="h-4 w-4" aria-hidden="true" /> 근거 로그 보기
            </NavLink>
          </div>
          <p className="mt-4 text-xs leading-5 text-muted-foreground dark:text-white/60">추천 결과는 원본 콘텐츠와 감사 로그를 확인한 뒤 적용합니다.</p>
        </div>
      </section>

      <section className="col-span-12 lg:col-span-8">
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
