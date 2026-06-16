import type { ReactNode } from "react";
import { NavLink } from "react-router-dom";

interface PageHeaderProps {
  title: string;
  description?: string;
  eyebrow?: string;
  action?: ReactNode;
  crumbs?: Array<{ label: string; to?: string }>;
}

export function PageHeader({ title, description, eyebrow, action, crumbs }: PageHeaderProps) {
  return (
    <div className="mb-6 overflow-hidden rounded-md border-none bg-lightsecondary py-4 shadow-none">
      <div className="grid grid-cols-12 items-center gap-6 px-6">
        <div className="col-span-12 md:col-span-9">
          {eyebrow ? <p className="mb-2 text-xs font-bold uppercase tracking-wide text-secondary">{eyebrow}</p> : null}
          <h1 className="mb-2 text-xl font-semibold text-foreground dark:text-white">{title}</h1>
          {description ? <p className="text-sm leading-6 text-muted-foreground dark:text-white/70">{description}</p> : null}
          {crumbs?.length ? (
            <ol className="mt-3 flex flex-wrap items-center whitespace-nowrap text-sm text-muted-foreground">
              {crumbs.map((crumb, index) => (
                <li key={`${crumb.label}-${index}`} className="flex items-center">
                  {index > 0 ? <span className="mx-2.5 h-1 w-1 rounded-full bg-muted-foreground" /> : null}
                  {crumb.to ? (
                    <NavLink className="hover:underline" to={crumb.to}>
                      {crumb.label}
                    </NavLink>
                  ) : (
                    <span>{crumb.label}</span>
                  )}
                </li>
              ))}
            </ol>
          ) : null}
        </div>
        {action ? <div className="col-span-12 flex justify-start md:col-span-3 md:justify-end">{action}</div> : null}
      </div>
    </div>
  );
}
