import { ReactNode, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ApiError, PageData } from "../api";

export const button =
  "inline-flex items-center justify-center whitespace-nowrap rounded-base text-sm font-base bg-main text-main-foreground border-2 border-border shadow-shadow transition-all hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none h-10 px-4 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";
export const compact =
  "inline-flex items-center justify-center whitespace-nowrap rounded-base text-sm font-base bg-main text-main-foreground border-2 border-border transition-all h-9 px-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";
export const input =
  "flex h-10 w-full rounded-base border-2 border-border bg-secondary-background selection:bg-main selection:text-main-foreground px-3 py-2 text-sm font-base text-foreground placeholder:text-foreground/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";
export const panel =
  "bg-secondary-background border-2 border-border rounded-base shadow-shadow";
export const gridCanvas =
  "not-prose relative z-15 mb-5 min-h-[200px] w-full border-2 border-border bg-secondary-background bg-[linear-gradient(to_right,#8080804D_1px,transparent_1px),linear-gradient(to_bottom,#80808090_1px,transparent_1px)] [background-size:40px_40px] p-5 shadow-shadow sm:p-10";

export type AsyncState<T> =
  | { status: "loading" }
  | { status: "success"; data: T }
  | { status: "empty" }
  | { status: "error"; error: ApiError }
  | { status: "permission"; error: ApiError };

export function useAsync<T>(
  load: () => Promise<T>,
  deps: unknown[],
): AsyncState<T> {
  const [state, setState] = useState<AsyncState<T>>({ status: "loading" });
  useEffect(() => {
    let alive = true;
    setState({ status: "loading" });
    load()
      .then((data) => {
        if (!alive) return;
        const page = data as unknown as PageData<unknown>;
        const empty = Array.isArray(data)
          ? data.length === 0
          : data &&
            typeof data === "object" &&
            "items" in data &&
            Array.isArray(page.items) &&
            page.items.length === 0;
        setState(empty ? { status: "empty" } : { status: "success", data });
      })
      .catch(
        (error: ApiError) =>
          alive &&
          setState(
            error.code === "FORBIDDEN"
              ? { status: "permission", error }
              : { status: "error", error },
          ),
      );
    return () => {
      alive = false;
    };
  }, deps);
  return state;
}

export function PageHeader({
  title,
  route,
  action,
  description = "API 기반 CMS 운영 화면입니다.",
}: {
  title: string;
  route: string;
  action?: ReactNode;
  description?: string;
}) {
  return (
    <div className="mb-8">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-xl">
          <p className="mb-3 inline-flex rounded-base border-2 border-border bg-main px-2 py-0.5 text-xs font-heading text-main-foreground shadow-shadow">
            {route}
          </p>
          <h1 className="mb-3 font-heading text-2xl leading-tight sm:text-3xl">
            {title}
          </h1>
          <p className="text-sm font-base leading-7 text-foreground/90 sm:text-base">
            {description}
          </p>
        </div>
        {action}
      </div>
    </div>
  );
}

export function StateView<T>({
  state,
  children,
  emptyText,
}: {
  state: AsyncState<T>;
  children: (data: T) => ReactNode;
  emptyText: string;
}) {
  if (state.status === "loading") return <LoadingPanel />;
  if (state.status === "empty") return <EmptyPanel message={emptyText} />;
  if (state.status === "permission")
    return <ErrorPanel title="접근 거부" error={state.error} />;
  if (state.status === "error")
    return <ErrorPanel title="오류" error={state.error} />;
  return <>{children(state.data)}</>;
}

export function LoadingPanel() {
  return (
    <div className={`${gridCanvas} flex items-center justify-center`}>
      <div
        className={`${panel} w-full max-w-xl space-y-4 p-5`}
        aria-label="로딩 중"
      >
        <div className="h-7 animate-pulse rounded-base border-2 border-border bg-main/50" />
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="h-20 animate-pulse rounded-base border-2 border-border bg-foreground/10" />
          <div className="h-20 animate-pulse rounded-base border-2 border-border bg-foreground/10" />
          <div className="h-20 animate-pulse rounded-base border-2 border-border bg-foreground/10" />
        </div>
        <div className="h-10 animate-pulse rounded-base border-2 border-border bg-main/30" />
      </div>
    </div>
  );
}

export function EmptyPanel({ message }: { message: string }) {
  return (
    <div className={`${gridCanvas} flex items-center justify-center`}>
      <div className={`${panel} max-w-xl p-6 text-center`}>
        <p className="font-heading text-xl">표시할 데이터가 없습니다</p>
        <p className="mt-3 text-sm leading-7 text-foreground/90">{message}</p>
        <Link className={`${button} mt-5`} to="/admin/documents">
          다음 작업으로 이동
        </Link>
      </div>
    </div>
  );
}

export function ErrorPanel({
  title,
  error,
}: {
  title: string;
  error: ApiError;
}) {
  return (
    <div className={`${gridCanvas} flex items-center justify-center`}>
      <div className={`${panel} max-w-xl p-6`} role="alert">
        <p className="font-heading text-xl">{title}</p>
        <p className="mt-3 text-sm leading-7">{error.message}</p>
        <div className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
          <code className="rounded-base border-2 border-border bg-main px-2 py-1 font-bold">
            code: {error.code}
          </code>
          <code className="rounded-base border-2 border-border bg-secondary-background px-2 py-1 font-bold">
            traceId: {error.traceId}
          </code>
        </div>
      </div>
    </div>
  );
}

export function Card({ title, value }: { title: string; value: string }) {
  return (
    <div
      className={`${panel} p-5 transition-all hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none`}
    >
      <p className="font-heading">{title}</p>
      <p className="mt-3 break-words text-2xl font-base">{value}</p>
    </div>
  );
}

export function DataTable({
  headers,
  rows,
}: {
  headers: string[];
  rows: ReactNode[][];
}) {
  return (
    <div className={`${gridCanvas}`}>
      <div className={`${panel} w-full p-4`}>
        <div className="flex items-center gap-3 py-4">
          <input className={`${input} max-w-sm`} placeholder="필터" />
          <button className={`${compact} ml-auto`}>컬럼</button>
        </div>
        <div className="relative w-full overflow-auto">
          <table className="w-full border-2 border-border text-sm">
            <thead className="font-heading">
              <tr className="border-b-2 border-border bg-secondary-background">
                {headers.map((h) => (
                  <th className="h-12 px-4 text-left align-middle" key={h}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr
                  className="border-b-2 border-border bg-secondary-background text-foreground transition-colors hover:bg-main/30"
                  key={index}
                >
                  {row.map((cell, c) => (
                    <td className="px-4 py-2 align-middle" key={c}>
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-end space-x-2 py-4">
          <span className="flex-1 text-sm text-foreground">
            {rows.length}개 항목
          </span>
          <button className={compact} disabled>
            이전
          </button>
          <button className={compact}>다음</button>
        </div>
      </div>
    </div>
  );
}
