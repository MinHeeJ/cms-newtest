import { Inbox } from "lucide-react";

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex items-center justify-center gap-2 rounded-md border border-dashed border-[var(--border)] bg-white p-6 text-sm text-slate-500">
      <Inbox size={18} /> {message}
    </div>
  );
}
