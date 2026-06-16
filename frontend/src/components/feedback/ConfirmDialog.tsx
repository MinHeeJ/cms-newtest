import { AlertTriangle, X } from "lucide-react";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  impact?: string;
  confirmLabel?: string;
  onCancel: () => void;
  onConfirm: () => void;
}

export function ConfirmDialog({ open, title, description, impact, confirmLabel = "확인", onCancel, onConfirm }: ConfirmDialogProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4" role="dialog" aria-modal="true">
      <div className="w-full max-w-md rounded-lg border border-ld bg-white p-6 shadow-md dark:border-[#333f55] dark:bg-dark">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-lighterror text-error">
              <AlertTriangle className="h-5 w-5" aria-hidden="true" />
            </span>
            <h2 className="text-lg font-semibold text-foreground dark:text-white">{title}</h2>
          </div>
          <button className="h-9 w-9 rounded-full hover:bg-lightprimary hover:text-primary" type="button" onClick={onCancel} aria-label="닫기">
            <X className="mx-auto h-4 w-4" aria-hidden="true" />
          </button>
        </div>
        <p className="text-sm leading-6 text-muted-foreground dark:text-white/70">{description}</p>
        {impact ? <p className="mt-3 rounded-md bg-lightwarning p-3 text-sm text-slate-700 dark:text-white/80">{impact}</p> : null}
        <div className="mt-6 flex justify-end gap-3">
          <button className="button-base border border-ld bg-transparent text-foreground hover:bg-lightprimary hover:text-primary dark:text-white" type="button" onClick={onCancel}>
            취소
          </button>
          <button className="button-base bg-error text-white hover:bg-red-600" type="button" onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
