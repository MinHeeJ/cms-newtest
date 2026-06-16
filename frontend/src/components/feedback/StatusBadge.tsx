import type { ContentStatus } from "../../services/cmsTypes";

const statusCopy: Record<ContentStatus, string> = {
  DRAFT: "초안",
  IN_REVIEW: "검토 대기",
  APPROVED: "승인",
  SCHEDULED: "예약",
  PUBLISHED: "게시",
  ARCHIVED: "보관"
};

const statusClass: Record<ContentStatus, string> = {
  DRAFT: "bg-lightinfo text-info border-0",
  IN_REVIEW: "bg-lightwarning text-warning border-0",
  APPROVED: "bg-lightsuccess text-success border-0",
  SCHEDULED: "bg-lightsecondary text-secondary border-0",
  PUBLISHED: "bg-success text-white border-transparent",
  ARCHIVED: "bg-lighterror text-error border-0"
};

export function StatusBadge({ status }: { status: ContentStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${statusClass[status]}`}
      title={status}
    >
      {statusCopy[status]}
    </span>
  );
}
