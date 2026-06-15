import { AlertTriangle, X } from "lucide-react";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel?: string;
  error?: string | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel = "취소",
  error,
  onConfirm,
  onCancel
}: ConfirmDialogProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="dialog-overlay" role="presentation">
      <section className="dialog-panel" role="dialog" aria-modal="true" aria-labelledby="confirm-title">
        <button className="icon-only dialog-close" type="button" onClick={onCancel} aria-label="닫기">
          <X size={18} />
        </button>
        <div className="dialog-icon">
          <AlertTriangle size={24} />
        </div>
        <h2 id="confirm-title">{title}</h2>
        <p>{description}</p>
        {error ? <p className="form-error">{error}</p> : null}
        <div className="dialog-actions">
          <button className="btn btn-secondary" type="button" onClick={onCancel}>
            {cancelLabel}
          </button>
          <button className="btn btn-danger" type="button" onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </section>
    </div>
  );
}
