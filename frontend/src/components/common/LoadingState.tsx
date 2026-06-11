import { Loader2 } from "lucide-react";

export function LoadingState() {
  return (
    <div className="flex items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-white p-6 text-sm text-slate-600">
      <Loader2 className="animate-spin" size={18} /> 불러오는 중
    </div>
  );
}
