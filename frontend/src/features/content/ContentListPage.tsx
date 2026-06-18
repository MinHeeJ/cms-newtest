import { Archive, FilePlus2, RotateCcw, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { ConfirmDialog } from "../../components/feedback/ConfirmDialog";
import { StatusBadge } from "../../components/feedback/StatusBadge";
import { PageHeader } from "../../components/layout/PageHeader";
import { DataTable } from "../../components/tables/DataTable";
import { contentApi } from "./content.api";
import type { ContentListItem, ContentStatus } from "../../services/cmsTypes";

const statuses: Array<ContentStatus | "ALL"> = ["ALL", "DRAFT", "IN_REVIEW", "APPROVED", "SCHEDULED", "PUBLISHED", "ARCHIVED"];

export function ContentListPage() {
    const [query, setQuery] = useState("");
    const [status, setStatus] = useState<ContentStatus | "ALL">("ALL");
    const [rows, setRows] = useState<ContentListItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState<string[]>([]);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);

    useEffect(() => {
        setLoading(true);
        contentApi.list({ status: status === "ALL" ? undefined : status, page, pageSize: 25 })
            .then((res) => { setRows(res.items); setTotal(res.pageInfo.totalItems); })
            .finally(() => setLoading(false));
    }, [status, query, page]);

    async function handleArchiveSelected() {
        await Promise.all(selected.map((id) => contentApi.archive(id)));
        setSelected([]);
        setConfirmOpen(false);
        contentApi.list({ page: 1, pageSize: 25 }).then((res) => setRows(res.items));
    }

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
                                <input className="form-control min-w-full pl-10 lg:min-w-96" placeholder="제목 검색" type="search" value={query} onChange={(e) => { setQuery(e.target.value); setPage(1); }} />
                            </div>
                            <select className="form-control w-44" value={status} onChange={(e) => { setStatus(e.target.value as ContentStatus | "ALL"); setPage(1); }}>
                                {statuses.map((s) => <option key={s} value={s}>{s === "ALL" ? "전체 상태" : s}</option>)}
                            </select>
                            <button className="button-base border border-primary bg-transparent text-primary hover:bg-primary hover:text-white" type="button" onClick={() => { setQuery(""); setStatus("ALL"); }}>
                                <RotateCcw className="h-4 w-4" aria-hidden="true" />Reset
                            </button>
                        </div>
                    </div>
                    <DataTable<ContentListItem>
                        rows={rows}
                        loading={loading}
                        getRowKey={(row) => row.id}
                        emptyMessage="조건에 맞는 콘텐츠가 없습니다"
                        emptyDescription="검색어와 상태 필터를 초기화하거나 새 콘텐츠를 작성하세요."
                        columns={[
                            { key: "select", header: "", render: (row) => <input type="checkbox" checked={selected.includes(row.id)} onChange={(e) => setSelected((c) => e.target.checked ? [...c, row.id] : c.filter((id) => id !== row.id))} /> },
                            { key: "title", header: "제목", sortable: true, render: (row) => <NavLink to={`/content/${row.id}/edit`} className="hover:text-primary"><p className="mb-1 text-sm font-semibold">{row.title}</p><p className="text-xs text-muted-foreground">/{row.slug}</p></NavLink> },
                            { key: "status", header: "상태", render: (row) => <StatusBadge status={row.status} /> },
                            { key: "author", header: "작성자", render: (row) => row.author.displayName },
                            { key: "updatedAt", header: "수정일", sortable: true, render: (row) => new Date(row.updatedAt).toLocaleString("ko-KR") },
                            { key: "publishedAt", header: "게시일", render: (row) => row.publishedAt ? new Date(row.publishedAt).toLocaleDateString("ko-KR") : "-" }
                        ]}
                    />
                    <div className="flex flex-col items-center justify-between gap-4 border-t border-ld p-4 sm:flex-row dark:border-[#333f55]">
                        <button className="button-base bg-error text-white hover:bg-red-600" type="button" disabled={selected.length === 0} onClick={() => setConfirmOpen(true)}>
                            <Archive className="h-4 w-4" aria-hidden="true" />선택 보관
                        </button>
                        <div className="text-sm text-muted-foreground">{page} / {Math.ceil(total / 25)} page · {total} items</div>
                    </div>
                </section>
            </div>
            <ConfirmDialog open={confirmOpen} title="콘텐츠를 보관할까요?" description="보관된 콘텐츠는 공개 목록에서 제외됩니다." impact={`선택된 콘텐츠 ${selected.length}건이 영향을 받습니다.`} confirmLabel="보관" onCancel={() => setConfirmOpen(false)} onConfirm={handleArchiveSelected} />
        </div>
    );
}