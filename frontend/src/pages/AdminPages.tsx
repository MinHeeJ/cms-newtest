import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  api,
  Attachment,
  DocumentSummary,
  Folder,
  PageData,
  ProjectRecord,
} from "../api";
import {
  button,
  Card,
  DataTable,
  gridCanvas,
  input,
  panel,
  PageHeader,
  StateView,
  useAsync,
} from "../components/ui";
import { DocumentTable } from "./SharedTables";

export function AdminDashboard() {
  const state = useAsync(
    () =>
      api<{ status: string; dependencies: Record<string, string> }>(
        "/api/health",
      ),
    [],
  );
  return (
    <>
      <PageHeader
        title="CMS 대시보드"
        route="/admin"
        description="서비스 헬스체크와 주요 의존성 상태를 확인합니다."
        action={
          <Link className={button} to="/admin/documents">
            문서 관리
          </Link>
        }
      />
      <StateView state={state} emptyText="상태 데이터가 없습니다.">
        {(data) => (
          <div className="grid gap-4 sm:grid-cols-2">
            <Card title="애플리케이션" value={data.status} />
            <Card title="데이터베이스" value={data.dependencies.database} />
            <Card title="스토리지" value={data.dependencies.storage} />
          </div>
        )}
      </StateView>
    </>
  );
}

export function FolderAdmin() {
  const state = useAsync(() => api<PageData<Folder>>("/api/admin/folders"), []);
  return (
    <>
      <PageHeader
        title="CMS 폴더 관리"
        route="/admin/folders"
        description="폴더 활성 상태와 정렬 순서를 관리합니다."
        action={<button className={button}>폴더 생성</button>}
      />
      <StateView state={state} emptyText="등록된 폴더가 없습니다.">
        {(data) => (
          <DataTable
            headers={["폴더명", "활성", "정렬"]}
            rows={data.items.map((f) => [
              f.name,
              f.active ? "활성" : "비활성",
              String((f as unknown as { sortOrder?: number }).sortOrder ?? 0),
            ])}
          />
        )}
      </StateView>
    </>
  );
}

export function DocumentsAdmin() {
  const state = useAsync(
    () => api<PageData<DocumentSummary>>("/api/admin/documents"),
    [],
  );
  return (
    <>
      <PageHeader
        title="CMS 문서 목록"
        route="/admin/documents"
        description="관리 문서 목록과 편집 진입점을 제공합니다."
        action={
          <Link className={button} to="/admin/documents/new/edit">
            문서 생성
          </Link>
        }
      />
      <StateView state={state} emptyText="등록된 문서가 없습니다.">
        {(data) => <DocumentTable documents={data.items} admin />}
      </StateView>
    </>
  );
}

export function DocumentEditor() {
  const { documentId = "new" } = useParams();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("# 제목\n\n본문을 작성하세요.");
  const preview = useMemo(
    () =>
      body
        .replace(/^# (.+)$/m, "<h1>$1</h1>")
        .split("\n")
        .join("<br>"),
    [body],
  );
  return (
    <>
      <PageHeader
        title="CMS 문서 편집"
        route="/admin/documents/:documentId/edit"
        description="마크다운 편집과 실시간 미리보기를 한 화면에서 제공합니다."
        action={<button className={button}>저장</button>}
      />
      <div className={`${gridCanvas}`}>
        <div className={`${panel} space-y-8 p-5`}>
          <label className="grid gap-2">
            <span className="text-sm font-heading">제목</span>
            <input
              className={input}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="문서 제목"
            />
          </label>
          <label className="grid gap-2">
            <span className="text-sm font-heading">마크다운</span>
            <textarea
              className={`${input} h-48`}
              value={body}
              onChange={(e) => setBody(e.target.value)}
            />
          </label>
          <div>
            <p className="mb-2 font-heading">미리보기 / {documentId}</p>
            <div
              className="prose-content rounded-base border-2 border-border bg-secondary-background p-4"
              dangerouslySetInnerHTML={{ __html: preview }}
            />
          </div>
        </div>
      </div>
    </>
  );
}

export function AttachmentsAdmin() {
  const { documentId = "" } = useParams();
  const state = useAsync(
    () =>
      api<PageData<Attachment> | { items: Attachment[] }>(
        `/api/documents/${documentId}/attachments`,
      ),
    [documentId],
  );
  return (
    <>
      <PageHeader
        title="CMS 첨부 관리"
        route="/admin/documents/:documentId/attachments"
        description="문서별 첨부 파일 상태를 조회합니다."
        action={<button className={button}>파일 업로드</button>}
      />
      <StateView state={state} emptyText="첨부파일이 없습니다.">
        {(data) => (
          <DataTable
            headers={["파일명", "유형", "상태"]}
            rows={data.items.map((a) => [a.fileName, a.contentType, a.status])}
          />
        )}
      </StateView>
    </>
  );
}

export function OperationsPage({
  kind,
}: {
  kind: "audit" | "backup" | "migration";
}) {
  const config =
    kind === "audit"
      ? {
          title: "CMS 감사",
          route: "/admin/operations",
          path: "/api/admin/audit-logs",
        }
      : kind === "backup"
        ? {
            title: "CMS 백업",
            route: "/admin/backups",
            path: "/api/admin/backups",
          }
        : {
            title: "CMS 이관",
            route: "/admin/migrations",
            path: "/api/admin/migrations/00000000-0000-0000-0000-000000000000",
          };
  const load = (): Promise<PageData<Record<string, string>>> =>
    kind === "migration"
      ? Promise.resolve({ items: [], page: 0, size: 20 })
      : api<PageData<Record<string, string>>>(config.path);
  const state = useAsync(load, [kind]);
  return (
    <>
      <PageHeader
        title={config.title}
        route={config.route}
        description="운영 작업과 감사성 데이터를 같은 테이블 패턴으로 확인합니다."
        action={
          <button className={button}>
            {kind === "audit" ? "필터 적용" : "작업 요청"}
          </button>
        }
      />
      <StateView state={state} emptyText="조회된 운영 데이터가 없습니다.">
        {(data) => (
          <DataTable
            headers={["대상", "상태/행위", "일시"]}
            rows={data.items.map((item) => [
              item.title ?? item.targetType ?? item.jobType ?? "-",
              item.status ?? item.action ?? "-",
              item.createdAt ?? "-",
            ])}
          />
        )}
      </StateView>
    </>
  );
}

const projectMap = {
  "/admin/project": ["CMS 사업관리", "/api/admin/schedules", "일정"] as const,
  "/admin/project/scope": [
    "CMS 범위",
    "/api/admin/scope-items",
    "범위",
  ] as const,
  "/admin/project/staff": ["CMS 인력", "/api/admin/staff", "인력"] as const,
  "/admin/project/risks": ["CMS 위험", "/api/admin/risks", "위험"] as const,
  "/admin/project/deliverables": [
    "CMS 산출물",
    "/api/admin/deliverables",
    "산출물",
  ] as const,
  "/admin/project/changes": [
    "CMS 변경",
    "/api/admin/change-requests",
    "변경",
  ] as const,
};

export function ProjectPage({ route }: { route: keyof typeof projectMap }) {
  const [title, path, label] = projectMap[route];
  const state = useAsync(() => api<PageData<ProjectRecord>>(path), [path]);
  return (
    <>
      <PageHeader
        title={title}
        route={route}
        description={`${label} 데이터를 조회하고 상태를 확인합니다.`}
        action={<button className={button}>{label} 등록</button>}
      />
      <StateView state={state} emptyText={`${label} 데이터가 없습니다.`}>
        {(data) => (
          <DataTable
            headers={["제목", "담당", "상태"]}
            rows={data.items.map((r) => [r.title, r.owner, r.status])}
          />
        )}
      </StateView>
    </>
  );
}
