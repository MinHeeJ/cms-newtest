import type { ReactNode } from "react";
import { Inbox, Loader2 } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description: string;
  action?: ReactNode;
  tone?: "primary" | "warning" | "error";
}

const toneClass = {
  primary: "bg-lightprimary text-primary",
  warning: "bg-lightwarning text-warning",
  error: "bg-lighterror text-error"
};

export function EmptyState({ title, description, action, tone = "primary" }: EmptyStateProps) {
  return (
    <div className="flex min-h-52 flex-col items-center justify-center rounded-md border border-dashed border-ld bg-lightsecondary/40 p-8 text-center dark:border-[#333f55]">
      <span className={`mb-4 flex h-12 w-12 items-center justify-center rounded-full ${toneClass[tone]}`}>
        <Inbox className="h-5 w-5" aria-hidden="true" />
      </span>
      <h3 className="text-base font-semibold text-foreground dark:text-white">{title}</h3>
      <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground dark:text-white/70">{description}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

export function InlineNotice({ children, tone = "primary" }: { children: ReactNode; tone?: "primary" | "warning" | "error" }) {
  return <div className={`rounded-md p-4 text-sm leading-6 ${toneClass[tone]}`}>{children}</div>;
}

export function SkeletonRows({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div className="space-y-3" aria-label="로딩 중">
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="grid animate-pulse gap-4 rounded-md border border-ld p-4 dark:border-[#333f55]" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
          {Array.from({ length: columns }).map((__, columnIndex) => (
            <div key={columnIndex} className="h-4 rounded bg-slate-200 dark:bg-white/10" />
          ))}
        </div>
      ))}
    </div>
  );
}

export function LoadingPanel({ label = "불러오는 중" }: { label?: string }) {
  return (
    <div className="flex min-h-52 items-center justify-center rounded-md border border-ld bg-white p-8 text-sm text-muted-foreground dark:border-[#333f55] dark:bg-dark dark:text-white/70">
      <Loader2 className="mr-2 h-4 w-4 animate-spin text-primary" aria-hidden="true" />
      {label}
    </div>
  );
}
