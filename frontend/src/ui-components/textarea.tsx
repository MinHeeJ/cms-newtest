import { type TextareaHTMLAttributes, forwardRef } from "react";
import { cn } from "../lib/utils";

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        "min-h-40 w-full rounded-md border border-[var(--border)] bg-white px-3 py-2 text-sm outline-none focus:border-[var(--primary)]",
        className
      )}
      {...props}
    />
  )
);

Textarea.displayName = "Textarea";
