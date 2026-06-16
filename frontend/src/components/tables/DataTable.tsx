import { ChevronDown, ChevronUp } from "lucide-react";
import type { ReactNode } from "react";
import { EmptyState } from "../feedback/UIState";

export interface DataTableColumn<T> {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  className?: string;
  sortable?: boolean;
}

interface DataTableProps<T> {
  columns: Array<DataTableColumn<T>>;
  rows: T[];
  getRowKey: (row: T) => string;
  sortKey?: string;
  sortDirection?: "asc" | "desc";
  onSort?: (key: string) => void;
  emptyMessage?: string;
  emptyDescription?: string;
  emptyAction?: ReactNode;
  loading?: boolean;
}

export function DataTable<T>({ columns, rows, getRowKey, sortKey, sortDirection = "desc", onSort, emptyMessage = "조건에 맞는 항목이 없습니다", emptyDescription = "검색 조건을 조정하거나 필터를 초기화해 보세요.", emptyAction, loading = false }: DataTableProps<T>) {
  return (
    <div className="relative w-full overflow-x-auto rounded-md border border-ld dark:border-[#333f55]">
      <table className="w-full caption-bottom text-sm">
        <thead className="[&_tr]:border-b">
          <tr className="border-b border-ld transition-colors dark:border-[#333f55]">
            {columns.map((column) => (
              <th key={column.key} className={`h-10 whitespace-nowrap px-4 text-left align-middle font-medium text-foreground dark:text-white ${column.className ?? ""}`}>
                {column.sortable ? (
                  <button className="flex items-center gap-1 bg-transparent font-semibold hover:text-primary" type="button" onClick={() => onSort?.(column.key)}>
                    {column.header}
                    {sortKey === column.key && sortDirection === "asc" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </button>
                ) : (
                  column.header
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            Array.from({ length: 5 }).map((_, rowIndex) => (
              <tr key={`skeleton-${rowIndex}`} className="border-b border-ld dark:border-[#333f55]">
                {columns.map((column) => (
                  <td key={column.key} className="p-4 align-middle">
                    <div className="h-4 animate-pulse rounded bg-slate-200 dark:bg-white/10" />
                  </td>
                ))}
              </tr>
            ))
          ) : rows.length === 0 ? (
            <tr>
              <td className="p-6" colSpan={columns.length}>
                <EmptyState title={emptyMessage} description={emptyDescription} action={emptyAction} />
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr key={getRowKey(row)} className="border-b border-ld transition-colors hover:bg-primary/10 dark:border-[#333f55]">
                {columns.map((column) => (
                  <td key={column.key} className={`whitespace-nowrap p-4 align-middle ${column.className ?? ""}`}>
                    {column.render(row)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
