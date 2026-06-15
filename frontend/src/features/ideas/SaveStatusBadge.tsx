import { AlertCircle, CheckCircle2, Loader2, RotateCcw } from "lucide-react";
import type { SaveStatus } from "../../services/api-client";

interface SaveStatusBadgeProps {
  status: SaveStatus;
  lastSavedAt?: string | null;
  error?: string | null;
  onRetry?: () => void;
}

const formatSavedAt = (value?: string | null) => {
  if (!value) {
    return "저장 대기";
  }
  return new Intl.DateTimeFormat("ko-KR", {
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
};

export function SaveStatusBadge({ status, lastSavedAt, error, onRetry }: SaveStatusBadgeProps) {
  if (status === "saving") {
    return (
      <div className="save-badge save-badge-saving" role="status">
        <Loader2 size={16} className="spin" />
        저장 중
      </div>
    );
  }

  if (status === "failed") {
    return (
      <div className="save-badge save-badge-failed" role="alert" title={error ?? undefined}>
        <AlertCircle size={16} />
        저장 실패
        {onRetry ? (
          <button type="button" className="badge-action" onClick={onRetry}>
            <RotateCcw size={14} />
            저장 재시도
          </button>
        ) : null}
      </div>
    );
  }

  return (
    <div className="save-badge save-badge-saved" role="status">
      <CheckCircle2 size={16} />
      저장됨 {formatSavedAt(lastSavedAt)}
    </div>
  );
}
