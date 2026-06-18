import { Check, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { EmptyState, LoadingPanel } from "../../components/feedback/UIState";
import { StatusBadge } from "../../components/feedback/StatusBadge";
import { contentApi } from "./content.api";
import type { ContentListItem } from "../../services/cmsTypes";

export function ReviewQueuePage() {
  const [queue, setQueue] = useState<ContentListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    contentApi.list({ status: "IN_REVIEW", pageSize: 50 })
      .then((res) => { setQueue(res.items); if (res.items[0]) setSelectedId(res.items[0].id); })
      .finally(() => setLoading(false));
  }, []);

  const selected = queue.find((c) => c.id === selectedId);

  async function handleDecision(decision: "APPROVE" | "REJECT") {
    if (!selectedId) return;
    setSubmitting(true);
    try {
      await contentApi.review(selectedId, { decision, comment });
      setQueue((q) => q.filter((c) => c.id !== selectedId));
      setComment("");
      setSelectedId(null);
    } finally { setSubmitting(false); }
  }

  if (loading) return <LoadingPanel label="검토 대기 로딩 중" />;

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-foreground dark:text-white">검토 대기</h1>
          <p className="text-sm text-muted-foreground">검토 대기 콘텐츠를 승인하거나 반려합니다.</p>
        </div>
      </div>
      <div className="grid grid-cols-12 gap-6">
        <section className="col-span-12 lg:col-span-3">
          <div className="card-box h-full">
            <h2 className="card-title">대기 목록</h2>
            <div className="mt-6 space-y-3">
              {queue.length === 0 ? <EmptyState title="검토 대기 항목 없음" description="모든 콘텐츠가 처리됐습니다." /> : null}
              {queue.map((content) => (
                <button key={content.id} className={`w-full rounded-md border border-ld p-4 text-left transition-colors hover:bg-primary/10 dark:border-[#333f55] ${content.id === selectedId ? "bg-lightprimary" : ""}`} type="button" onClick={() => setSelectedId(content.id)}>
                  <p className="mb-2 text-sm font-semibold text-foreground dark:text-white">{content.title}</p>
                  <StatusBadge status={content.status} />
                </button>
              ))}
            </div>
          </div>
        </section>
        <section className="col-span-12 lg:col-span-6">
          <div className="card-box h-full">
            <h2 className="card-title">내용 미리보기</h2>
            {selected ? (
              <div className="mt-6 space-y-4">
                <div className="rounded-md bg-lightsecondary p-4">
                  <p className="text-sm font-semibold">{selected.title}</p>
                  <p className="text-xs text-muted-foreground">{selected.author.displayName} · {new Date(selected.updatedAt).toLocaleString("ko-KR")}</p>
                </div>
              </div>
            ) : <p className="mt-6 text-sm text-muted-foreground">검토할 콘텐츠를 선택하세요.</p>}
          </div>
        </section>
        <section className="col-span-12 lg:col-span-3">
          <div className="card-box h-full">
            <h2 className="card-title">결정 패널</h2>
            <label className="mb-2 mt-6 block text-sm font-medium text-foreground dark:text-white" htmlFor="review-comment">검토 의견</label>
            <textarea id="review-comment" className="form-control h-40" value={comment} onChange={(e) => setComment(e.target.value)} />
            <p className="mt-2 text-xs text-muted-foreground">반려 시 의견은 필수입니다.</p>
            <div className="mt-6 grid grid-cols-1 gap-3">
              <button className="button-base bg-error text-white hover:bg-red-600" type="button" disabled={!selected || !comment.trim() || submitting} onClick={() => handleDecision("REJECT")}>
                <X className="h-4 w-4" aria-hidden="true" />반려
              </button>
              <button className="button-base bg-success text-white hover:bg-emerald-500" type="button" disabled={!selected || submitting} onClick={() => handleDecision("APPROVE")}>
                <Check className="h-4 w-4" aria-hidden="true" />승인
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
