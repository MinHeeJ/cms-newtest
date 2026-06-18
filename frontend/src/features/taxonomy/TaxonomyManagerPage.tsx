import { Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { ConfirmDialog } from "../../components/feedback/ConfirmDialog";
import { DataTable } from "../../components/tables/DataTable";
import { LoadingPanel } from "../../components/feedback/UIState";
import { taxonomyApi } from "../../services/taxonomyApi";
import type { TaxonomyTerm } from "../../services/cmsTypes";

export function TaxonomyManagerPage() {
  const [terms, setTerms] = useState<TaxonomyTerm[]>([]);
  const [loading, setLoading] = useState(true);
  const [type, setType] = useState<"CATEGORY" | "TAG">("CATEGORY");
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    taxonomyApi.list().then(setTerms).finally(() => setLoading(false));
  }, []);

  const rows = terms.filter((t) => t.type === type);

  async function handleCreate() {
    if (!name || !slug) return;
    setSaving(true);
    try {
      const created = await taxonomyApi.create({ type, name, slug });
      setTerms((t) => [...t, created]);
      setName(""); setSlug("");
    } finally { setSaving(false); }
  }

  async function handleDelete() {
    if (!deleteId) return;
    await taxonomyApi.delete(deleteId);
    setTerms((t) => t.filter((x) => x.id !== deleteId));
    setDeleteId(null);
  }

  if (loading) return <LoadingPanel label="분류 로딩 중" />;

  return (
    <div className="grid grid-cols-12 gap-6">
      <section className="col-span-12 lg:col-span-4">
        <div className="card-box">
          <h1 className="card-title">분류</h1>
          <p className="mt-1 text-sm text-muted-foreground">카테고리와 태그를 관리합니다.</p>
          <div className="mt-6 grid grid-cols-2 gap-2">
            <button className={`button-base ${type === "CATEGORY" ? "bg-primary text-white" : "border border-ld bg-transparent text-foreground dark:text-white"}`} type="button" onClick={() => setType("CATEGORY")}>카테고리</button>
            <button className={`button-base ${type === "TAG" ? "bg-primary text-white" : "border border-ld bg-transparent text-foreground dark:text-white"}`} type="button" onClick={() => setType("TAG")}>태그</button>
          </div>
          <div className="mt-6 space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground dark:text-white" htmlFor="tax-name">이름</label>
              <input id="tax-name" className="form-control" placeholder="공지" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground dark:text-white" htmlFor="tax-slug">Slug</label>
              <input id="tax-slug" className="form-control" placeholder="notice" value={slug} onChange={(e) => setSlug(e.target.value)} />
            </div>
            <button className="button-base bg-primary text-white hover:bg-primaryemphasis" type="button" onClick={handleCreate} disabled={saving}>
              <Plus className="h-4 w-4" aria-hidden="true" />생성
            </button>
          </div>
        </div>
      </section>
      <section className="col-span-12 lg:col-span-8">
        <div className="card-box">
          <DataTable<TaxonomyTerm>
            rows={rows}
            getRowKey={(row) => row.id}
            emptyMessage="분류 항목이 없습니다"
            emptyDescription="왼쪽에서 새 항목을 추가하세요."
            columns={[
              { key: "name", header: "이름", render: (row) => <span className="font-semibold">{row.name}</span> },
              { key: "slug", header: "Slug", render: (row) => row.slug },
              { key: "updated", header: "수정일", render: (row) => new Date(row.updatedAt).toLocaleDateString("ko-KR") },
              { key: "action", header: "", render: (row) => <button className="h-9 w-9 rounded-full hover:bg-lightprimary hover:text-primary" type="button" onClick={() => setDeleteId(row.id)}><Trash2 className="mx-auto h-4 w-4" /></button> }
            ]}
          />
        </div>
      </section>
      <ConfirmDialog open={!!deleteId} title="분류를 삭제할까요?" description="연결된 콘텐츠에서 해당 분류가 제거됩니다." confirmLabel="삭제" onCancel={() => setDeleteId(null)} onConfirm={handleDelete} />
    </div>
  );
}
