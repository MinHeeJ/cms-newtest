import { Loader2 } from "lucide-react";

export function LoadingState({ label = "불러오는 중" }: { label?: string }) {
  return (
    <div className="flex min-h-24 items-center justify-center gap-2 rounded-lg border border-dashed bg-muted/30 p-6 text-sm text-muted-foreground" role="status">
      <Loader2 className="size-4 animate-spin" />
      <span>{label}</span>
    </div>
  );
}
