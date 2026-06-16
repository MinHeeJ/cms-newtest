import { NavLink } from "react-router-dom";
import { StatusBadge } from "../../components/feedback/StatusBadge";
import { DataTable } from "../../components/tables/DataTable";
import { demoContent } from "../../services/demoData";
import type { ContentItem } from "../../services/cmsTypes";

export function ScheduledContentPage() {
  const rows = demoContent.filter((content) => content.status === "SCHEDULED");
  return (
    <section className="card-box">
      <div className="mb-6">
        <h1 className="card-title">예약 게시</h1>
        <p className="text-sm text-muted-foreground">예약 게시 예정 콘텐츠입니다.</p>
      </div>
      <DataTable<ContentItem>
        rows={rows}
        getRowKey={(row) => row.id}
        emptyMessage="예약된 콘텐츠가 없습니다"
        emptyDescription="콘텐츠 편집 화면에서 예약 게시 시간을 지정하면 여기에 표시됩니다."
        emptyAction={<NavLink className="button-base border border-primary bg-transparent text-primary hover:bg-primary hover:text-white" to="/content/new">새 콘텐츠 작성</NavLink>}
        columns={[
          { key: "title", header: "제목", render: (row) => <span className="font-semibold">{row.title}</span> },
          { key: "status", header: "상태", render: (row) => <StatusBadge status={row.status} /> },
          { key: "scheduledAt", header: "예약일", render: (row) => row.scheduledAt ? new Date(row.scheduledAt).toLocaleString("ko-KR") : "-" },
          { key: "author", header: "작성자", render: (row) => row.author.displayName }
        ]}
      />
    </section>
  );
}
