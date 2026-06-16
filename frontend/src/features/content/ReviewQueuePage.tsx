import { Check, X } from "lucide-react";
import { useMemo, useState } from "react";
import { EmptyState } from "../../components/feedback/UIState";
import { StatusBadge } from "../../components/feedback/StatusBadge";
import { demoContent } from "../../services/demoData";

export function ReviewQueuePage() {
  const queue = useMemo(() => demoContent.filter((content) => content.status === "IN_REVIEW"), []);
  const [selectedId, setSelectedId] = useState(queue[0]?.id);
  const [comment, setComment] = useState("");
  const selected = queue.find((content) => content.id === selectedId) ?? queue[0];

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-foreground dark:text-white">검토 대기</h1>
          <p className="text-sm text-muted-foreground">검토 대기 콘텐츠를 승인하거나 반려합니다.</p>
        </div>
        <select className="form-control max-w-44">
          <option>전체 작성자</option>
          <option>작성자</option>
        </select>
      </div>

      <div className="grid grid-cols-12 gap-6">
        <section className="col-span-12 lg:col-span-3">
          <div className="card-box h-full">
            <h2 className="card-title">대기 목록</h2>
            <div className="mt-6 space-y-3">
              {queue.length === 0 ? <EmptyState title="검토 대기 항목 없음" description="새로 승인된 콘텐츠를 감사 로그에서 확인하거나 작성자에게 검토 요청을 안내하세요." /> : null}
              {queue.map((content) => (
                <button
                  key={content.id}
                  className={`w-full rounded-md border border-ld p-4 text-left transition-colors hover:bg-primary/10 dark:border-[#333f55] ${content.id === selectedId ? "bg-lightprimary" : ""}`}
                  type="button"
                  onClick={() => setSelectedId(content.id)}
                >
                  <p className="mb-2 text-sm font-semibold text-foreground dark:text-white">{content.title}</p>
                  <StatusBadge status={content.status} />
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="col-span-12 lg:col-span-6">
          <div className="card-box h-full">
            <h2 className="card-title">변경 미리보기</h2>
            {selected ? (
              <div className="mt-6 space-y-4">
                <div className="rounded-md bg-lightsecondary p-4">
                  <p className="text-sm font-semibold text-foreground dark:text-white">제목 변경</p>
                  <p className="mt-2 text-sm text-muted-foreground">이전: 서비스 이용 가이드 초안</p>
                  <p className="text-sm text-foreground dark:text-white">현재: {selected.title}</p>
                </div>
                <pre className="min-h-[320px] overflow-x-auto rounded-md bg-slate-900 p-4 text-sm leading-7 text-white">{selected.markdownBody}</pre>
              </div>
            ) : (
              <p className="mt-6 text-sm text-muted-foreground">검토할 콘텐츠가 없습니다.</p>
            )}
          </div>
        </section>

        <section className="col-span-12 lg:col-span-3">
          <div className="card-box h-full">
            <h2 className="card-title">결정 패널</h2>
            <label className="mb-2 mt-6 block text-sm font-medium text-foreground dark:text-white" htmlFor="review-comment">
              검토 의견
            </label>
            <textarea id="review-comment" className="form-control h-40" value={comment} onChange={(event) => setComment(event.target.value)} />
            <p className="mt-2 text-xs text-muted-foreground">반려 시 의견은 필수입니다.</p>
            <div className="mt-6 grid grid-cols-1 gap-3">
              <button className="button-base bg-error text-white hover:bg-red-600" type="button" disabled={!selected || !comment.trim()}>
                <X className="h-4 w-4" aria-hidden="true" />
                반려
              </button>
              <button className="button-base bg-success text-white hover:bg-emerald-500" type="button" disabled={!selected}>
                <Check className="h-4 w-4" aria-hidden="true" />
                승인
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
