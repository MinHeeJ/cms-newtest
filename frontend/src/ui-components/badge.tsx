import { type HTMLAttributes } from "react";
import { cn } from "../lib/utils";

export function Badge({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded px-2 py-1 text-xs font-semibold text-[var(--primary-strong)] ring-1 ring-inset ring-[var(--border)]",
        className
      )}
      {...props}
    />
  );
}
