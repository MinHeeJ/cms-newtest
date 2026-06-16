import { Search } from "lucide-react";
import { DataTable } from "../../components/tables/DataTable";
import { demoEvents } from "../../services/demoData";
import type { WorkflowEvent } from "../../services/cmsTypes";

export function AuditLogPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground dark:text-white">감사 로그</h1>
        <p className="text-sm text-muted-foreground">행위자, 대상, 이벤트 유형, 상태 변경을 추적합니다.</p>
      </div>
      <section className="card-box">
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <input className="form-control min-w-full pl-10 lg:min-w-96" placeholder="행위자 또는 대상 검색" />
          </div>
          <select className="form-control max-w-56"><option>전체 이벤트</option><option>PUBLISH</option><option>PERMISSION_CHANGE</option></select>
          <input className="form-control max-w-56" type="date" />
        </div>
        <DataTable<WorkflowEvent>
          rows={demoEvents}
          getRowKey={(row) => row.id}
          emptyMessage="감사 이벤트가 없습니다"
          emptyDescription="기간 필터를 넓히거나 이벤트 유형을 전체로 변경하세요."
          columns={[
            { key: "eventType", header: "Event", render: (row) => <span className="rounded-full bg-lightprimary px-2.5 py-1 text-xs font-medium text-primary">{row.eventType}</span> },
            { key: "actor", header: "행위자", render: (row) => row.actor.displayName },
            { key: "target", header: "대상", render: (row) => `${row.targetType} / ${row.targetId}` },
            { key: "comment", header: "의견", render: (row) => row.comment ?? "-" },
            { key: "createdAt", header: "발생일", render: (row) => new Date(row.createdAt).toLocaleString("ko-KR") }
          ]}
        />
      </section>
    </div>
  );
}
