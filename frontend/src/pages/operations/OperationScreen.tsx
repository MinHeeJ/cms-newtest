import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  FileText,
  Inbox,
  Loader2,
  RefreshCw,
  Search,
  ShieldAlert,
  SlidersHorizontal,
} from "lucide-react";
import type { PageResponse } from "../../api/operationsApi";

type Row = Record<string, unknown>;
type State =
  | "loading"
  | "empty"
  | "error"
  | "permission"
  | "success"
  | "pending";

export interface Column {
  key: string;
  label: string;
}

export interface Action {
  label: string;
  tone?: "primary" | "danger" | "flat";
  run: (row: Row) => Promise<unknown>;
}

export interface OperationScreenProps {
  title: string;
  subtitle: string;
  group: string;
  accent: string;
  filters: string[];
  columns: Column[];
  loader: () => Promise<PageResponse<Row>>;
  actions?: Action[];
  form?: {
    title: string;
    fields: Array<{
      name: string;
      label: string;
      placeholder: string;
      type?: "checkbox";
    }>;
    submitLabel: string;
    submit: (values: Record<string, unknown>) => Promise<unknown>;
  };
  notice?: string;
  resultHint?: string;
}

const stateLabel: Record<State, string> = {
  loading: "조회 중",
  empty: "결과 없음",
  error: "오류",
  permission: "권한 제한",
  success: "조회 완료",
  pending: "처리 중",
};

const stateTone: Record<State, string> = {
  loading: "border-violet-200 bg-violet-50 text-violet-700",
  empty: "border-zinc-200 bg-zinc-50 text-zinc-600",
  error: "border-red-200 bg-red-50 text-red-700",
  permission: "border-red-200 bg-red-50 text-red-700",
  success: "border-green-200 bg-green-50 text-green-700",
  pending: "border-violet-200 bg-violet-50 text-violet-700",
};

function stringifyCell(value: unknown) {
  if (value === null || value === undefined || value === "") return "-";
  if (typeof value === "boolean") return value ? "예" : "아니오";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

function looksLikeStatus(key: string) {
  return (
    key.toLowerCase().includes("status") || key.toLowerCase().includes("result")
  );
}

function statusClass(value: unknown) {
  const text = String(value ?? "").toUpperCase();
  if (
    text.includes("ERROR") ||
    text.includes("FAIL") ||
    text.includes("REJECT") ||
    text.includes("CANCEL")
  ) {
    return "border-red-200 bg-red-50 text-red-700";
  }
  if (
    text.includes("SUCCESS") ||
    text.includes("APPROVE") ||
    text.includes("CONFIRM") ||
    text.includes("CERT")
  ) {
    return "border-green-200 bg-green-50 text-green-700";
  }
  if (
    text.includes("RUN") ||
    text.includes("PEND") ||
    text.includes("WAIT") ||
    text.includes("UNVER")
  ) {
    return "border-violet-200 bg-violet-50 text-violet-700";
  }
  return "border-zinc-200 bg-zinc-50 text-zinc-600";
}

export const idOf = (row: Row, key: string) => String(row[key] ?? "");

export function OperationScreen({
  title,
  subtitle,
  group,
  accent,
  filters,
  columns,
  loader,
  actions = [],
  form,
  notice,
  resultHint,
}: OperationScreenProps) {
  const [rows, setRows] = useState<Row[]>([]);
  const [state, setState] = useState<State>("loading");
  const [message, setMessage] = useState("");
  const [selected, setSelected] = useState<Row | null>(null);
  const [formValues, setFormValues] = useState<Record<string, unknown>>({});
  const [pageInfo, setPageInfo] = useState("0건");

  const load = async () => {
    setState("loading");
    try {
      const data = await loader();
      setRows(data.items);
      setPageInfo(
        `${data.page.totalElements}건 / ${data.page.totalPages}페이지`,
      );
      setState(data.items.length ? "success" : "empty");
      setMessage(
        data.items.length
          ? "조회가 완료되었습니다. 최신 처리상태를 확인하세요."
          : "검색 조건에 맞는 데이터가 없습니다.",
      );
    } catch (error) {
      const text = error instanceof Error ? error.message : "조회 실패";
      setMessage(text);
      setState(text.includes("권한") ? "permission" : "error");
    }
  };

  useEffect(() => {
    void load();
  }, [title]);

  const metrics = useMemo(
    () => [
      {
        label: "총 대상",
        value: rows.length,
        icon: FileText,
        color: "border-[#00AEEF]",
      },
      {
        label: "처리 가능",
        value: rows.filter(
          (row) =>
            !String(
              row.status ?? row.verificationStatus ?? row.approvalStatus ?? "",
            ).includes("CANCELED"),
        ).length,
        icon: CheckCircle2,
        color: "border-[#12A89D]",
      },
      {
        label: "대기/실행",
        value: state === "loading" || state === "pending" ? 1 : 0,
        icon: Clock,
        color: "border-[#ED207B]",
      },
      {
        label: "오류",
        value: state === "error" ? 1 : 0,
        icon: AlertTriangle,
        color: "border-red-700",
      },
    ],
    [rows, state],
  );

  const runAction = async (action: Action, row: Row) => {
    setSelected(row);
    setState("pending");
    try {
      const result = await action.run(row);
      setMessage(
        `${action.label} 처리가 완료되었습니다. ${JSON.stringify(result)}`,
      );
      await load();
    } catch (error) {
      const text = error instanceof Error ? error.message : "처리 실패";
      setMessage(text);
      setState(text.includes("권한") ? "permission" : "error");
    }
  };

  const submitForm = async () => {
    if (!form) return;
    setState("pending");
    try {
      const result = await form.submit(formValues);
      setMessage(`${form.submitLabel} 완료: ${JSON.stringify(result)}`);
      setFormValues({});
      await load();
    } catch (error) {
      const text = error instanceof Error ? error.message : "저장 실패";
      setMessage(text);
      setState(text.includes("권한") ? "permission" : "error");
    }
  };

  const busy = state === "loading" || state === "pending";

  return (
    <section className="mx-auto w-full max-w-[1110px] animate-fadein bg-white px-[0.67em] text-[#333638] motion-reduce:animate-none">
      <div className="mb-3 flex flex-wrap items-center gap-3 border-b border-[#eaebec] pb-3">
        <span className="inline-flex items-center gap-2 text-sm text-zinc-500">
          <span className={`h-3 w-3 rounded-sm ${accent}`} />
          업무 운영 관리 / {group}
        </span>
        <span
          className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold ${stateTone[state]}`}
        >
          {busy ? (
            <Loader2 className="mr-1 h-3 w-3 animate-spin" aria-hidden="true" />
          ) : null}
          {stateLabel[state]}
        </span>
        <button
          className="ml-auto inline-flex h-9 items-center gap-1 rounded border border-zinc-300 px-[0.65em] text-base text-zinc-800 transition-colors duration-150 hover:bg-[#f1ecff] hover:text-violet-600 focus:border-violet-600 focus:outline focus:outline-2 focus:outline-violet-600 focus:outline-offset-[-2px] disabled:cursor-not-allowed disabled:opacity-60"
          type="button"
          onClick={() => void load()}
          disabled={busy}
        >
          <RefreshCw
            className={`h-4 w-4 ${busy ? "animate-spin" : ""}`}
            aria-hidden="true"
          />
          조회
        </button>
      </div>

      <div className="mb-3 flex flex-wrap items-end gap-3">
        <div className="mr-auto min-w-[260px]">
          <h1 className="text-2xl font-normal leading-tight text-zinc-800 sm:text-3xl">
            {title}
          </h1>
          <p className="mt-1 max-w-3xl text-sm leading-5 text-zinc-600">
            {subtitle}
          </p>
        </div>
      </div>

      <div className="mb-3 border-b border-zinc-200 pb-3">
        <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-zinc-700">
          <SlidersHorizontal
            className="h-4 w-4 text-violet-600"
            aria-hidden="true"
          />
          검색/필터
        </div>
        <div className="flex flex-wrap items-end gap-2">
          {filters.map((filter) => (
            <label key={filter} className="text-sm text-zinc-600">
              <span className="mb-1 block">{filter}</span>
              <input
                className="h-9 min-w-[140px] rounded border border-zinc-300 bg-white px-[0.65em] py-2 text-base text-zinc-800 transition-colors duration-150 placeholder:text-zinc-400 focus:border-violet-600 focus:outline focus:outline-2 focus:outline-violet-600 focus:outline-offset-[-2px]"
                placeholder={filter}
                readOnly
              />
            </label>
          ))}
          <button
            className="inline-flex h-9 items-center gap-1 rounded bg-violet-600 px-3 py-2 text-base text-white transition-colors duration-150 hover:bg-violet-700 focus:outline focus:outline-2 focus:outline-violet-600 focus:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            type="button"
            onClick={() => void load()}
            disabled={busy}
          >
            <Search className="h-4 w-4" aria-hidden="true" />
            조건 조회
          </button>
        </div>
      </div>

      {notice ? (
        <div className="mb-3 border-l-[5px] border-violet-300 bg-zinc-50 px-4 py-3 text-sm leading-6 text-zinc-700">
          {notice}
        </div>
      ) : null}

      {state === "permission" || state === "error" ? (
        <div
          className={`mb-3 flex items-start gap-2 rounded border p-3 text-sm leading-6 ${stateTone[state]}`}
        >
          {state === "permission" ? (
            <ShieldAlert className="mt-0.5 h-4 w-4" />
          ) : (
            <AlertTriangle className="mt-0.5 h-4 w-4" />
          )}
          <div>
            <p className="font-semibold">
              {state === "permission"
                ? "권한 또는 데이터 범위 제한"
                : "요청 처리 오류"}
            </p>
            <p>
              {state === "permission"
                ? "권한 없는 action은 비활성화되며 데이터 범위 밖 요청은 처리할 수 없습니다."
                : message}
            </p>
          </div>
        </div>
      ) : null}

      <div className="mb-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => (
          <div
            key={metric.label}
            className={`border-l-[6px] ${metric.color} bg-white px-3 py-3 transition-colors duration-150 hover:bg-zinc-50`}
          >
            <metric.icon
              className="h-5 w-5 text-violet-600"
              aria-hidden="true"
            />
            <strong className="mt-1 block text-lg text-zinc-700">
              {metric.value}
            </strong>
            <span className="text-sm text-zinc-500">{metric.label}</span>
          </div>
        ))}
      </div>

      <div className="mb-2 flex flex-wrap items-center gap-2 text-sm text-zinc-500">
        <span>{pageInfo}</span>
        <span aria-hidden="true">·</span>
        <span>{message}</span>
      </div>

      <div className="mb-8 overflow-x-auto">
        <table className="w-full border-collapse">
          <thead className="sticky top-16 z-[3] bg-white text-sm text-zinc-500">
            <tr className="border-y border-zinc-200">
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="px-3 py-3 text-left font-normal"
                >
                  {column.label}
                </th>
              ))}
              {actions.length ? (
                <th className="px-3 py-3 text-right font-normal">Action</th>
              ) : null}
            </tr>
          </thead>
          <tbody>
            {state === "loading"
              ? Array.from({ length: 5 }).map((_, index) => (
                  <tr key={index} className="border-b border-zinc-200">
                    {columns.map((column) => (
                      <td key={column.key} className="px-3 py-3">
                        <div className="h-5 animate-pulse rounded bg-zinc-100" />
                      </td>
                    ))}
                    {actions.length ? (
                      <td className="px-3 py-3">
                        <div className="ml-auto h-8 w-24 animate-pulse rounded bg-zinc-100" />
                      </td>
                    ) : null}
                  </tr>
                ))
              : null}
            {state !== "loading" &&
              rows.map((row, index) => (
                <tr
                  key={String(
                    row.id ??
                      row.recordId ??
                      row.applicationId ??
                      row.reasonId ??
                      row.appealId ??
                      row.batchId ??
                      row.evaluationId ??
                      index,
                  )}
                  className={`border-b border-zinc-200 bg-white transition-colors duration-150 hover:bg-zinc-50 ${selected === row ? "bg-[#d1f0ff]" : ""}`}
                >
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className="px-3 py-3 text-sm leading-5 text-zinc-600"
                    >
                      {looksLikeStatus(column.key) ? (
                        <span
                          className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-semibold ${statusClass(row[column.key])}`}
                        >
                          {stringifyCell(row[column.key])}
                        </span>
                      ) : (
                        stringifyCell(row[column.key])
                      )}
                    </td>
                  ))}
                  {actions.length ? (
                    <td className="whitespace-nowrap px-3 py-3 text-right">
                      {actions.map((action) => (
                        <button
                          key={action.label}
                          className={`ml-1 inline-flex rounded px-3 py-2 text-sm transition-colors duration-150 focus:outline focus:outline-2 focus:outline-violet-600 focus:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${action.tone === "danger" ? "bg-red-700 text-white hover:bg-red-800" : action.tone === "flat" ? "bg-transparent text-violet-600 hover:bg-[#f1ecff] hover:text-zinc-800" : "bg-violet-600 text-white hover:bg-violet-700"}`}
                          type="button"
                          onClick={() => void runAction(action, row)}
                          disabled={busy || state === "permission"}
                        >
                          {action.label}
                        </button>
                      ))}
                    </td>
                  ) : null}
                </tr>
              ))}
          </tbody>
        </table>
        {state === "empty" ? (
          <div className="border-b border-zinc-200 px-3 py-12 text-center text-zinc-500">
            <Inbox
              className="mx-auto mb-3 h-9 w-9 text-zinc-400"
              aria-hidden="true"
            />
            <p className="text-base font-semibold text-zinc-700">
              조회 결과가 없습니다.
            </p>
            <p className="mt-1 text-sm">조건을 조정한 뒤 다시 조회하세요.</p>
          </div>
        ) : null}
      </div>

      {form ? (
        <div className="mb-8 rounded border border-zinc-200 bg-zinc-50 p-4">
          <h2 className="mb-1 text-lg font-semibold text-zinc-800">
            {form.title}
          </h2>
          <p className="mb-3 text-sm text-zinc-500">
            필수값을 입력한 뒤 저장하면 목록을 다시 조회합니다.
          </p>
          <div className="grid gap-3 md:grid-cols-2">
            {form.fields.map((field) => (
              <label key={field.name} className="text-sm text-zinc-600">
                {field.label}
                {field.type === "checkbox" ? (
                  <span className="mt-2 flex h-9 items-center gap-2">
                    <input
                      type="checkbox"
                      checked={Boolean(formValues[field.name])}
                      onChange={(event) =>
                        setFormValues((value) => ({
                          ...value,
                          [field.name]: event.target.checked,
                        }))
                      }
                    />
                    <span className="text-zinc-500">
                      반려 처리 시 별도 의견 입력 허용
                    </span>
                  </span>
                ) : (
                  <input
                    className="mt-1 h-9 w-full rounded border border-zinc-300 bg-white px-[0.65em] py-2 text-base text-zinc-800 transition-colors duration-150 placeholder:text-zinc-400 focus:border-violet-600 focus:outline focus:outline-2 focus:outline-violet-600 focus:outline-offset-[-2px]"
                    placeholder={field.placeholder}
                    value={String(formValues[field.name] ?? "")}
                    onChange={(event) =>
                      setFormValues((value) => ({
                        ...value,
                        [field.name]: event.target.value,
                      }))
                    }
                  />
                )}
              </label>
            ))}
          </div>
          <button
            className="mt-3 rounded bg-violet-600 px-3 py-2 text-white transition-colors duration-150 hover:bg-violet-700 focus:outline focus:outline-2 focus:outline-violet-600 focus:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            type="button"
            onClick={() => void submitForm()}
            disabled={busy}
          >
            {busy ? (
              <Loader2
                className="mr-1 inline h-4 w-4 animate-spin"
                aria-hidden="true"
              />
            ) : null}
            {form.submitLabel}
          </button>
        </div>
      ) : null}

      {resultHint ? (
        <div className="mb-10 border-l-[5px] border-zinc-300 bg-zinc-50 px-4 py-3 text-sm leading-6 text-zinc-600">
          {resultHint}
        </div>
      ) : null}
    </section>
  );
}
