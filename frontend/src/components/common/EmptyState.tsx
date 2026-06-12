import { Inbox } from "lucide-react";

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex min-h-24 flex-col items-center justify-center gap-2 rounded-lg border border-dashed bg-muted/20 p-6 text-center text-sm text-muted-foreground">
      <Inbox className="size-6" />
      <span>{message}</span>
    </div>
  );
}
