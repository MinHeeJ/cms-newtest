import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { ConfirmDialog } from "../../components/feedback/ConfirmDialog";
import { DataTable } from "../../components/tables/DataTable";
import { demoTerms } from "../../services/demoData";
import type { TaxonomyTerm } from "../../services/cmsTypes";

export function TaxonomyManagerPage() {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [type, setType] = useState<"CATEGORY" | "TAG">("CATEGORY");
  const rows = demoTerms.filter((term) => term.type === type);

  return (
    <div className="grid grid-cols-12 gap-6">
      <section className="col-span-12 lg:col-span-4">
        <div className="card-box">
          <h1 className="card-title">분류</h1>
          <p className="mt-1 text-sm text-muted-foreground">카테고리 계층과 태그를 관리합니다.</p>
          <div className="mt-6 grid grid-cols-2 gap-2">
            <button className={`button-base ${type === "CATEGORY" ? "bg-primary text-white" : "border border-ld bg-transparent text-foreground dark:text-white"}`} type="button" onClick={() => setType("CATEGORY")}>
              카테고리
            </button>
            <button className={`button-base ${type === "TAG" ? "bg-primary text-white" : "border border-ld bg-transparent text-foreground dark:text-white"}`} type="button" onClick={() => setType("TAG")}>
              태그
            </button>
          </div>
          <div className="mt-6 space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground dark:text-white" htmlFor="taxonomy-name">이름</label>
              <input id="taxonomy-name" className="form-control" placeholder="공지" />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground dark:text-white" htmlFor="taxonomy-slug">Slug</label>
              <input id="taxonomy-slug" className="form-control" placeholder="notice" />
            </div>
            <button className="button-base bg-primary text-white hover:bg-primaryemphasis" type="button">
              <Plus className="h-4 w-4" aria-hidden="true" />
              생성
            </button>
          </div>
        </div>
      </section>
      <section className="col-span-12 lg:col-span-8">
        <div className="card-box">
          <DataTable<TaxonomyTerm>
            rows={rows}
            getRowKey={(row) => row.id}
            columns={[
              { key: "name", header: "이름", render: (row) => <span className="font-semibold">{row.name}</span> },
              { key: "slug", header: "Slug", render: (row) => row.slug },
              { key: "parent", header: "상위", render: (row) => row.parentId ?? "-" },
              { key: "updated", header: "수정일", render: (row) => new Date(row.updatedAt).toLocaleDateString("ko-KR") },
              {
                key: "action",
                header: "",
                render: () => (
                  <button className="h-9 w-9 rounded-full hover:bg-lightprimary hover:text-primary" type="button" aria-label="삭제 영향 확인" onClick={() => setConfirmOpen(true)}>
                    <Trash2 className="mx-auto h-4 w-4" aria-hidden="true" />
                  </button>
                )
              }
            ]}
          />
        </div>
      </section>
      <ConfirmDialog
        open={confirmOpen}
        title="분류를 삭제할까요?"
        description="게시된 콘텐츠에 연결된 분류는 삭제 전 영향도를 확인해야 합니다."
        impact="연결 콘텐츠 3건이 영향을 받을 수 있습니다."
        confirmLabel="삭제"
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => setConfirmOpen(false)}
      />
    </div>
  );
}
