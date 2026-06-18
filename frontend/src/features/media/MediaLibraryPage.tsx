import { Grid2X2, List, Search, Upload } from "lucide-react";
import { useMemo, useState } from "react";
import { EmptyState } from "../../components/feedback/UIState";
import { demoMedia } from "../../services/demoData";

export function MediaLibraryPage() {
  const [mode, setMode] = useState<"grid" | "list">("grid");
  const [query, setQuery] = useState("");
  const [type, setType] = useState("ALL");

  const assets = useMemo(
    () => demoMedia.filter((asset) => (type === "ALL" || asset.mimeType === type) && `${asset.fileName} ${asset.altText ?? ""}`.toLowerCase().includes(query.toLowerCase())),
    [query, type]
  );
  const selected = assets[0] ?? demoMedia[0];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-foreground dark:text-white">미디어 라이브러리</h1>
          <p className="text-sm text-muted-foreground">이미지와 첨부 파일을 등록하고 접근성 메타데이터를 관리합니다.</p>
        </div>
        <div className="flex gap-2">
          <button className="button-base bg-primary text-white hover:bg-primaryemphasis" type="button">
            <Upload className="h-4 w-4" aria-hidden="true" />
            업로드
          </button>
          <button className={`h-10 w-10 rounded-md transition-colors ${mode === "grid" ? "bg-lightprimary text-primary" : "hover:bg-lightprimary hover:text-primary"}`} type="button" onClick={() => setMode("grid")} aria-label="Grid view">
            <Grid2X2 className="mx-auto h-4 w-4" aria-hidden="true" />
          </button>
          <button className={`h-10 w-10 rounded-md transition-colors ${mode === "list" ? "bg-lightprimary text-primary" : "hover:bg-lightprimary hover:text-primary"}`} type="button" onClick={() => setMode("list")} aria-label="List view">
            <List className="mx-auto h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      <section className="card-box">
        <div className="mb-6 grid grid-cols-1 gap-3 md:grid-cols-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <input className="form-control form-control-with-leading-icon" placeholder="파일명 또는 altText 검색" value={query} onChange={(event) => setQuery(event.target.value)} />
          </div>
          <select className="form-control" value={type} onChange={(event) => setType(event.target.value)}>
            <option value="ALL">전체 유형</option>
            <option value="image/png">image/png</option>
            <option value="application/pdf">application/pdf</option>
          </select>
          <select className="form-control">
            <option>전체 사용 상태</option>
            <option>사용 중</option>
            <option>미사용</option>
          </select>
        </div>

        {assets.length === 0 ? (
          <EmptyState
            title="조건에 맞는 미디어가 없습니다"
            description="필터를 초기화하거나 PNG, PDF 파일을 업로드하세요. 공개 사용 전 altText를 반드시 확인합니다."
            action={<button className="button-base bg-primary text-white hover:bg-primaryemphasis" type="button">업로드</button>}
          />
        ) : (
          <div className="grid grid-cols-12 gap-6">
            <div className={`col-span-12 ${mode === "grid" ? "grid grid-cols-1 gap-4 sm:grid-cols-2 xl:col-span-8 xl:grid-cols-3" : "flex flex-col gap-3 xl:col-span-8"}`}>
              {assets.map((asset) => (
                <button key={asset.id} className="card-hover rounded-lg border border-ld p-4 text-left transition-colors hover:bg-primary/10 dark:border-[#333f55]" type="button">
                  <div className="mb-3 aspect-video overflow-hidden rounded-md bg-lightsecondary">
                    {asset.mimeType.startsWith("image/") ? <img className="h-full w-full object-cover" src={asset.url} alt={asset.altText ?? asset.fileName} /> : <div className="flex h-full items-center justify-center text-sm text-muted-foreground">PDF</div>}
                  </div>
                  <p className="truncate text-sm font-semibold text-foreground dark:text-white">{asset.fileName}</p>
                  <p className={`mt-1 text-xs ${asset.altText ? "text-muted-foreground" : "text-error"}`}>{asset.altText ?? "altText 누락"}</p>
                  <p className="mt-2 text-xs text-muted-foreground">used {asset.usageCount}x · {(asset.sizeBytes / 1024).toFixed(0)}KB</p>
                </button>
              ))}
            </div>
            <aside className="col-span-12 rounded-lg border border-ld p-4 dark:border-[#333f55] xl:col-span-4">
              <h2 className="card-title">상세 정보</h2>
              <dl className="mt-5 space-y-4 text-sm">
                <div><dt className="text-muted-foreground">파일명</dt><dd className="mt-1 font-medium text-foreground dark:text-white">{selected.fileName}</dd></div>
                <div><dt className="text-muted-foreground">altText</dt><dd className={`mt-1 font-medium ${selected.altText ? "text-foreground dark:text-white" : "text-error"}`}>{selected.altText ?? "누락 — 공개 사용 전 입력 필요"}</dd></div>
                <div><dt className="text-muted-foreground">Caption</dt><dd className="mt-1 text-foreground dark:text-white">{selected.caption ?? "-"}</dd></div>
                <div><dt className="text-muted-foreground">사용 위치</dt><dd className="mt-1 text-foreground dark:text-white">{selected.usageCount}개 콘텐츠</dd></div>
              </dl>
              <button className="button-base mt-6 border border-error bg-transparent text-error hover:bg-error hover:text-white" type="button">삭제 영향 확인</button>
            </aside>
          </div>
        )}
      </section>
    </div>
  );
}
