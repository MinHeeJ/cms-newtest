import { AlertTriangle } from "lucide-react";

export function ErrorState({ message }: { message: string }) {
  return (
    <div className="flex min-h-24 items-center gap-2 rounded-md border border-[var(--danger)] bg-red-50 p-3 text-sm text-[var(--danger)]" role="alert">
      <AlertTriangle size={18} />
      <span>{message}</span>
    </div>
  );
}
