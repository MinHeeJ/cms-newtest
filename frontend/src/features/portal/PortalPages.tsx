import { useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import type { ReactNode } from "react";

type Envelope<T> = {
  success: boolean;
  data: T;
  meta?: { totalElements: number };
  error?: { message: string };
};
type DocumentRow = {
  id: string;
  title: string;
  summary: string;
  markdown_body?: string;
  updated_at: string;
};

async function request<T>(path: string): Promise<Envelope<T>> {
  const response = await fetch(path, {
    headers: { Accept: "application/json" },
  });
  const body = await response.json();
  if (!response.ok)
    throw new Error(body.error?.message ?? "요청을 처리할 수 없습니다.");
  return body;
}

function State({
  loading,
  error,
  empty,
  children,
}: {
  loading: boolean;
  error: string | null;
  empty: boolean;
  children: ReactNode;
}) {
  if (loading)
    return (
      <div className="card-box flex min-h-48 items-center justify-center text-sm text-muted-foreground">
        콘텐츠를 불러오는 중입니다...
      </div>
    );
  if (error)
    return (
      <div className="card-box border-error bg-lighterror p-6 text-sm text-error">
        {error}
        <button className="ml-3 underline" onClick={() => location.reload()}>
          다시 시도
        </button>
      </div>
    );
  if (empty)
    return (
      <div className="card-box p-10 text-center text-sm text-muted-foreground">
        표시할 콘텐츠가 없습니다.
      </div>
    );
  return <>{children}</>;
}

export function PortalHomePage() {
  const [rows, setRows] = useState<DocumentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    request<DocumentRow[]>("/api/portal/documents")
      .then((body) => setRows(Array.isArray(body.data) ? body.data : []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);
  return (
    <PortalLayout title="공개 문서 탐색">
      <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
        <aside className="card-box p-5">
          <p className="mb-4 text-xs font-bold uppercase text-muted-foreground">
            Folders
          </p>
          <p className="rounded-md bg-lightprimary px-3 py-2 text-sm font-semibold text-primary">
            전체 문서
          </p>
        </aside>
        <section>
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Home / 공개 문서</p>
              <h1 className="mt-1 text-2xl font-semibold">최근 발행 문서</h1>
            </div>
            <Link
              className="button-base bg-primary px-4 text-white"
              to="/portal/search"
            >
              Search
            </Link>
          </div>
          <State
            loading={loading}
            error={error}
            empty={!loading && !error && rows.length === 0}
          >
            <div className="space-y-3">
              {rows.map((row) => (
                <Link
                  className="card-box block p-5 transition hover:-translate-y-0.5 hover:border-primary"
                  key={row.id}
                  to={`/portal/documents/${row.id}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="font-semibold">{row.title}</h2>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {row.summary}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(row.updated_at).toLocaleDateString("ko-KR")}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </State>
        </section>
      </div>
    </PortalLayout>
  );
}

export function PortalSearchPage() {
  const [params, setParams] = useSearchParams();
  const q = params.get("q") ?? "";
  const [input, setInput] = useState(q);
  const [rows, setRows] = useState<DocumentRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const search = () => {
    if (input.trim().length < 2) {
      setRows([]);
      setError("두 글자 이상 입력하면 검색할 수 있습니다.");
      return;
    }
    setError(null);
    setLoading(true);
    setParams({ q: input.trim() });
    request<DocumentRow[]>(
      `/api/portal/documents?q=${encodeURIComponent(input.trim())}`,
    )
      .then((body) => setRows(Array.isArray(body.data) ? body.data : []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };
  return (
    <PortalLayout title="문서 검색">
      <div className="card-box p-6">
        <form
          className="flex flex-col gap-3 md:flex-row"
          onSubmit={(e) => {
            e.preventDefault();
            search();
          }}
        >
          <label className="sr-only" htmlFor="portal-search">
            문서 검색어
          </label>
          <input
            id="portal-search"
            className="form-control flex-1"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="markdown, 보안, 운영..."
          />
          <button
            className="button-base bg-primary px-5 text-white"
            type="submit"
          >
            Search
          </button>
        </form>
      </div>
      <div className="mt-6">
        <State
          loading={loading}
          error={error}
          empty={!loading && !error && rows.length === 0}
        >
          {rows.map((row) => (
            <Link
              className="card-box mb-3 block p-5"
              key={row.id}
              to={`/portal/documents/${row.id}`}
            >
              <h2 className="font-semibold">{row.title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {row.summary}
              </p>
            </Link>
          ))}
        </State>
      </div>
    </PortalLayout>
  );
}

export function PortalDocumentPage() {
  const { documentId } = useParams();
  const [row, setRow] = useState<DocumentRow | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (documentId)
      request<DocumentRow>(`/api/portal/documents/${documentId}`)
        .then((body) => setRow(body.data))
        .catch((e) => setError(e.message));
  }, [documentId]);
  return (
    <PortalLayout title={row?.title ?? "문서 상세"}>
      <State loading={!row && !error} error={error} empty={!row && !error}>
        {row ? (
          <article className="card-box p-6 md:p-10">
            <p className="text-sm text-muted-foreground">Home / 공개 문서</p>
            <h1 className="mt-3 text-3xl font-semibold">{row.title}</h1>
            <div className="markdown-body mt-8 whitespace-pre-wrap">
              {row.markdown_body ?? "본문이 비어 있습니다."}
            </div>
          </article>
        ) : null}
      </State>
    </PortalLayout>
  );
}

export function AccessDeniedPage() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center text-center">
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-lighterror text-error">
        !
      </div>
      <h1 className="text-2xl font-semibold">
        이 화면에 접근할 권한이 없습니다.
      </h1>
      <p className="mt-3 text-muted-foreground">
        계정 권한을 확인하거나 포털로 돌아가세요.
      </p>
      <Link
        className="button-base mt-6 bg-primary px-5 text-white"
        to="/portal"
      >
        포털로 이동
      </Link>
    </div>
  );
}

function PortalLayout({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div>
      <div className="mb-8 flex items-end justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
            CMS Portal
          </p>
          <h1 className="mt-2 text-3xl font-semibold">{title}</h1>
        </div>
        <Link
          className="text-sm font-semibold text-primary"
          to="/portal/search"
        >
          문서 검색
        </Link>
      </div>
      {children}
    </div>
  );
}
