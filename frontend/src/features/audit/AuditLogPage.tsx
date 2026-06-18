import { Search } from "lucide-react";
import { useEffect, useState } from "react";
import { DataTable } from "../../components/tables/DataTable";
import { LoadingPanel } from "../../components/feedback/UIState";
import { auditApi } from "../../services/auditApi";
import type { WorkflowEvent } from "../../services/cmsTypes";

export function AuditLogPage() {
  const [events, setEvents] = useState<WorkflowEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [targetType, setTargetType] = useState("");

  useEffect(() => {
    auditApi.list({ targetType: targetType || undefined, pageSize: 50 })
      .then((res) => setEvents(res.items))
      .finally(() => setLoading(false));
  }, [targetType]);

  if (loading) return <LoadingPanel label="감사 로그 로딩 중" />;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground dark:text-white">감사 로그</h1>
        <p className="text-sm text-muted-foreground">행위자, 대상, 이벤트 유형, 상태 변경을 추적합니다.</p>
      </div>
      <section className="card-box">
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <select className="form-control max-w-56" value={targetType} onChange={(e) => setTargetType(e.target.value)}>
            <option value="">전체 대상</option>
            <option value="CONTENT">CONTENT</option>
            <option value="USER">USER</option>
          </select>
        </div>
        <DataTable<WorkflowEvent>
          rows={events}
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
