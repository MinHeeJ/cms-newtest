import { Archive, FilePlus2, RotateCcw, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { NavLink } from "react-router-dom";
import { ConfirmDialog } from "../../components/feedback/ConfirmDialog";
import { StatusBadge } from "../../components/feedback/StatusBadge";
import { PageHeader } from "../../components/layout/PageHeader";
import { DataTable } from "../../components/tables/DataTable";
import type { ContentItem, ContentStatus } from "../../services/cmsTypes";
import { demoContent } from "../../services/demoData";

const statuses: Array<ContentStatus | "ALL"> = ["ALL", "DRAFT", "IN_REVIEW", "APPROVED", "SCHEDULED", "PUBLISHED", "ARCHIVED"];

export function ContentListPage() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<ContentStatus | "ALL">("ALL");
  const [selected, setSelected] = useState<string[]>([]);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const rows = useMemo(
    () =>
      demoContent.filter((content) => {
        const text = `${content.title} ${content.slug} ${content.summary}`.toLowerCase();
        return text.includes(query.toLowerCase()) && (status === "ALL" || content.status === status);
      }),
    [query, status]
  );

  return (
    <div>
      <PageHeader
        title="Content"
        description="검색, 필터, 정렬, bulk action을 한 흐름에서 처리합니다."
        crumbs={[{ label: "Dashboard", to: "/" }, { label: "전체 콘텐츠" }]}
        action={(
          <NavLink className="button-base bg-primary text-white hover:bg-primaryemphasis" to="/content/new">
            <FilePlus2 className="h-4 w-4" aria-hidden="true" />
            새 콘텐츠
          </NavLink>
        )}
      />

      <div className="flex flex-col gap-6">
        <section className="card-box">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4">
            <h2 className="text-xl font-semibold text-foreground dark:text-white">콘텐츠 목록</h2>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                <input className="form-control form-control-with-leading-icon min-w-full lg:min-w-96" placeholder="제목, slug, 요약 검색" type="search" value={query} onChange={(event) => setQuery(event.target.value)} />
              </div>
              <select className="form-control w-44" value={status} onChange={(event) => setStatus(event.target.value as ContentStatus | "ALL")}>
                {statuses.map((option) => (
                  <option key={option} value={option}>
                    {option === "ALL" ? "전체 상태" : option}
                  </option>
                ))}
              </select>
              <button className="button-base border border-primary bg-transparent text-primary hover:bg-primary hover:text-white" type="button" onClick={() => setQuery("")}>
                <RotateCcw className="h-4 w-4" aria-hidden="true" />
                Reset
              </button>
            </div>
          </div>

          <DataTable<ContentItem>
            rows={rows}
            getRowKey={(row) => row.id}
            emptyMessage="조건에 맞는 콘텐츠가 없습니다"
            emptyDescription="검색어와 상태 필터를 초기화하거나 새 콘텐츠를 작성하세요."
            emptyAction={(
              <button className="button-base border border-primary bg-transparent text-primary hover:bg-primary hover:text-white" type="button" onClick={() => { setQuery(""); setStatus("ALL"); }}>
                필터 초기화
              </button>
            )}
            columns={[
              {
                key: "select",
                header: "",
                render: (row) => (
                  <input
                    type="checkbox"
                    checked={selected.includes(row.id)}
                    onChange={(event) => setSelected((current) => (event.target.checked ? [...current, row.id] : current.filter((id) => id !== row.id)))}
                    aria-label={`${row.title} 선택`}
                  />
                )
              },
              { key: "title", header: "제목", sortable: true, render: (row) => <div><p className="mb-1 text-sm font-semibold">{row.title}</p><p className="text-xs text-muted-foreground">/{row.slug}</p></div> },
              { key: "status", header: "상태", render: (row) => <StatusBadge status={row.status} /> },
              { key: "author", header: "작성자", render: (row) => row.author.displayName },
              { key: "updatedAt", header: "수정일", sortable: true, render: (row) => new Date(row.updatedAt).toLocaleString("ko-KR") },
              { key: "publishedAt", header: "게시일", render: (row) => row.publishedAt ? new Date(row.publishedAt).toLocaleDateString("ko-KR") : "-" }
            ]}
          />

          <div className="flex flex-col items-center justify-between gap-4 border-t border-ld p-4 sm:flex-row dark:border-[#333f55]">
            <button className="button-base bg-error text-white hover:bg-red-600" type="button" disabled={selected.length === 0} onClick={() => setConfirmOpen(true)}>
              <Archive className="h-4 w-4" aria-hidden="true" />
              선택 보관
            </button>
            <div className="text-sm text-muted-foreground">1 / 1 page · {rows.length} items</div>
          </div>
        </section>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title="콘텐츠를 보관할까요?"
        description="보관된 콘텐츠는 공개 목록에서 제외되며 이력은 감사 로그에 남습니다."
        impact={`선택된 콘텐츠 ${selected.length}건이 영향을 받습니다.`}
        confirmLabel="보관"
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => setConfirmOpen(false)}
      />
    </div>
  );
}
