import { Inbox } from "lucide-react";

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex min-h-24 items-center justify-center gap-2 rounded-md border border-dashed border-[var(--border)] p-4 text-sm text-[var(--muted)]">
      <Inbox size={18} />
      <span>{message}</span>
    </div>
  );
}
