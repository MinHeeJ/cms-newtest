import { RotateCcw } from "lucide-react";
import { useState } from "react";
import { ConfirmDialog } from "../../components/feedback/ConfirmDialog";
import { DataTable } from "../../components/tables/DataTable";
import { demoRevisions } from "../../services/demoData";
import type { ContentRevision } from "../../services/cmsTypes";

export function RevisionHistoryPage() {
  const [selected, setSelected] = useState<ContentRevision | null>(demoRevisions[0]);
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-md border-none bg-lightsecondary py-4 shadow-none">
        <div className="grid grid-cols-12 items-center gap-6 px-6">
          <div className="col-span-12 md:col-span-10">
            <h1 className="mb-3 text-xl font-semibold text-foreground dark:text-white">Revision 이력</h1>
            <p className="text-sm text-muted-foreground">이전 revision을 비교하고 새 초안으로 복원합니다.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        <section className="col-span-12 lg:col-span-7">
          <div className="card-box">
            <DataTable<ContentRevision>
              rows={demoRevisions}
              getRowKey={(row) => row.id}
              columns={[
                { key: "number", header: "Revision", render: (row) => <button className="font-semibold text-primary" type="button" onClick={() => setSelected(row)}>#{row.revisionNumber}</button> },
                { key: "title", header: "Title", render: (row) => row.titleSnapshot },
                { key: "createdBy", header: "Editor", render: (row) => row.createdBy.displayName },
                { key: "createdAt", header: "Created", render: (row) => new Date(row.createdAt).toLocaleString("ko-KR") }
              ]}
            />
          </div>
        </section>
        <section className="col-span-12 lg:col-span-5">
          <div className="card-box h-full">
            <h2 className="card-title">비교</h2>
            {selected ? (
              <div className="mt-6 space-y-4">
                <div className="rounded-md bg-lightprimary p-4">
                  <p className="text-sm font-semibold text-primary">선택 revision #{selected.revisionNumber}</p>
                  <p className="mt-2 text-sm text-muted-foreground">{selected.changeSummary}</p>
                </div>
                <pre className="max-h-[360px] overflow-y-auto rounded-md bg-slate-900 p-4 text-sm leading-7 text-white">{selected.markdownBodySnapshot}</pre>
                <button className="button-base bg-primary text-white hover:bg-primaryemphasis" type="button" onClick={() => setConfirmOpen(true)}>
                  <RotateCcw className="h-4 w-4" aria-hidden="true" />
                  초안으로 복원
                </button>
              </div>
            ) : null}
          </div>
        </section>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title="이 revision을 복원할까요?"
        description="기존 콘텐츠를 덮어쓰지 않고 새 DRAFT revision으로 저장합니다."
        confirmLabel="복원"
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => setConfirmOpen(false)}
      />
    </div>
  );
}
