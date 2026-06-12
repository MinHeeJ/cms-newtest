import { Loader2 } from "lucide-react";

export function LoadingState({ label = "불러오는 중" }: { label?: string }) {
  return (
    <div className="flex min-h-24 items-center justify-center gap-2 text-sm text-[var(--muted)]" role="status">
      <Loader2 className="animate-spin" size={18} />
      <span>{label}</span>
    </div>
  );
}
