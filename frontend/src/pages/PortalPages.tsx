import { useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { api, DocumentDetail, DocumentSummary, Folder, PageData } from "../api";
import {
  button,
  compact,
  input,
  panel,
  PageHeader,
  StateView,
  useAsync,
} from "../components/ui";
import { DocumentTable } from "./SharedTables";

export function PortalHome() {
  const state = useAsync(
    () => api<{ folders: Folder[] }>("/api/portal/tree"),
    [],
  );
  return (
    <>
      <PageHeader
        title="CMS 포털 홈"
        route="/"
        description="공개 폴더와 발행 문서를 계층형 카드로 탐색합니다."
        action={
          <Link className={button} to="/search">
            문서 검색
          </Link>
        }
      />
      <StateView state={state} emptyText="공개된 폴더가 없습니다.">
        {({ folders }) => (
          <div className="space-y-5">
            {folders.map((folder) => (
              <section
                className={`${panel} overflow-hidden`}
                key={folder.folderId}
              >
                <div className="border-b-2 border-border bg-main p-4">
                  <h2 className="font-heading text-xl text-main-foreground">
                    {folder.name}
                  </h2>
                </div>
                <div className="space-y-3 p-4">
                  {folder.documents?.length ? (
                    folder.documents.map((doc) => (
                      <Link
                        className="flex items-center justify-between gap-3 rounded-base border-2 border-border bg-secondary-background p-3 transition-all hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:bg-main/70"
                        key={doc.documentId}
                        to={`/documents/${doc.documentId}`}
                      >
                        <span className="font-heading">{doc.title}</span>
                        <span className="rounded-base border-2 border-border bg-main px-2 py-0.5 text-xs font-heading">
                          {doc.status}
                        </span>
                      </Link>
                    ))
                  ) : (
                    <p className="rounded-base border-2 border-border bg-secondary-background p-3 text-sm">
                      이 폴더에 발행 문서가 없습니다.
                    </p>
                  )}
                </div>
              </section>
            ))}
          </div>
        )}
      </StateView>
    </>
  );
}

export function SearchPage() {
  const [params, setParams] = useSearchParams();
  const q = params.get("q") ?? "";
  const state = useAsync(
    () =>
      q.trim().length >= 2
        ? api<PageData<DocumentSummary>>(
            `/api/search?q=${encodeURIComponent(q)}`,
          )
        : Promise.resolve({ items: [], page: 0, size: 20 }),
    [q],
  );
  return (
    <>
      <PageHeader
        title="CMS 검색"
        route="/search"
        description="검색어를 route query로 유지하고 API 결과를 테이블로 표시합니다."
        action={
          <SearchForm
            initial={q}
            onSearch={(value) => setParams(value ? { q: value } : {})}
          />
        }
      />
      <StateView
        state={state}
        emptyText="검색 결과가 없습니다. 검색어를 2자 이상 입력하세요."
      >
        {(data) => <DocumentTable documents={data.items} />}
      </StateView>
    </>
  );
}

function SearchForm({
  initial,
  onSearch,
}: {
  initial: string;
  onSearch: (value: string) => void;
}) {
  const [value, setValue] = useState(initial);
  return (
    <form
      className="flex w-full gap-2 sm:w-auto"
      onSubmit={(event) => {
        event.preventDefault();
        onSearch(value.trim());
      }}
    >
      <input
        className={input}
        placeholder="제목 또는 본문 검색"
        value={value}
        onChange={(event) => setValue(event.target.value)}
      />
      <button className={button} type="submit">
        검색
      </button>
    </form>
  );
}

export function PortalDocument() {
  const { documentId = "" } = useParams();
  const state = useAsync(
    () => api<DocumentDetail>(`/api/portal/documents/${documentId}`),
    [documentId],
  );
  return (
    <>
      <PageHeader
        title="CMS 문서 열람"
        route="/documents/:documentId"
        description="렌더링된 문서 본문과 첨부 목록을 표시합니다."
        action={
          <Link className={button} to="/search">
            다시 검색
          </Link>
        }
      />
      <StateView state={state} emptyText="문서를 찾을 수 없습니다.">
        {(doc) => (
          <article className={`${panel} overflow-hidden`}>
            <div className="border-b-2 border-border bg-main p-5">
              <h2 className="font-heading text-2xl text-main-foreground">
                {doc.title}
              </h2>
              <p className="mt-2 text-sm font-base">
                {doc.folderName} / {doc.status}
              </p>
            </div>
            <div className="p-5">
              <div
                className="prose-content rounded-base border-2 border-border bg-secondary-background p-4"
                dangerouslySetInnerHTML={{ __html: doc.renderedHtml }}
              />
              <h3 className="mt-8 font-heading">첨부파일</h3>
              {doc.attachments.length ? (
                <ul className="mt-3 space-y-2">
                  {doc.attachments.map((a) => (
                    <li
                      className="rounded-base border-2 border-border bg-secondary-background p-3"
                      key={a.attachmentId}
                    >
                      {a.fileName} ({a.contentType})
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 rounded-base border-2 border-border p-3">
                  첨부파일이 없습니다.
                </p>
              )}
            </div>
          </article>
        )}
      </StateView>
    </>
  );
}
