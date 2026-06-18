import { Grid2X2, List, Search, Upload } from "lucide-react";
import { useEffect, useState } from "react";
import { EmptyState, LoadingPanel } from "../../components/feedback/UIState";
import { mediaApi } from "../../services/mediaApi";
import type { MediaAsset } from "../../services/cmsTypes";

export function MediaLibraryPage() {
  const [mode, setMode] = useState<"grid" | "list">("grid");
  const [query, setQuery] = useState("");
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<MediaAsset | null>(null);

  useEffect(() => {
    mediaApi.list().then((res) => { setAssets(res.items); setSelected(res.items[0] ?? null); }).finally(() => setLoading(false));
  }, []);

  const filtered = assets.filter((a) => `${a.fileName} ${a.altText ?? ""}`.toLowerCase().includes(query.toLowerCase()));

  if (loading) return <LoadingPanel label="미디어 로딩 중" />;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-foreground dark:text-white">미디어 라이브러리</h1>
          <p className="text-sm text-muted-foreground">이미지와 첨부 파일을 등록하고 접근성 메타데이터를 관리합니다.</p>
        </div>
        <div className="flex gap-2">
          <button className="button-base bg-primary text-white hover:bg-primaryemphasis" type="button"><Upload className="h-4 w-4" aria-hidden="true" />업로드</button>
          <button className={`h-10 w-10 rounded-md transition-colors ${mode === "grid" ? "bg-lightprimary text-primary" : "hover:bg-lightprimary hover:text-primary"}`} type="button" onClick={() => setMode("grid")} aria-label="Grid view"><Grid2X2 className="mx-auto h-4 w-4" /></button>
          <button className={`h-10 w-10 rounded-md transition-colors ${mode === "list" ? "bg-lightprimary text-primary" : "hover:bg-lightprimary hover:text-primary"}`} type="button" onClick={() => setMode("list")} aria-label="List view"><List className="mx-auto h-4 w-4" /></button>
        </div>
      </div>
      <section className="card-box">
        <div className="mb-6">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <input className="form-control form-control-with-leading-icon" placeholder="파일명 또는 altText 검색" value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
        </div>
        {filtered.length === 0 ? (
          <EmptyState title="조건에 맞는 미디어가 없습니다" description="필터를 초기화하거나 파일을 업로드하세요." />
        ) : (
          <div className="grid grid-cols-12 gap-6">
            <div className={`col-span-12 ${mode === "grid" ? "grid grid-cols-1 gap-4 sm:grid-cols-2 xl:col-span-8 xl:grid-cols-3" : "flex flex-col gap-3 xl:col-span-8"}`}>
              {filtered.map((asset) => (
                <button key={asset.id} className={`card-hover rounded-lg border border-ld p-4 text-left transition-colors hover:bg-primary/10 dark:border-[#333f55] ${selected?.id === asset.id ? "ring-2 ring-primary" : ""}`} type="button" onClick={() => setSelected(asset)}>
                  <div className="mb-3 aspect-video overflow-hidden rounded-md bg-lightsecondary">
                    {asset.mimeType.startsWith("image/") ? <img className="h-full w-full object-cover" src={asset.url} alt={asset.altText ?? asset.fileName} /> : <div className="flex h-full items-center justify-center text-sm text-muted-foreground">FILE</div>}
                  </div>
                  <p className="truncate text-sm font-semibold text-foreground dark:text-white">{asset.fileName}</p>
                  <p className={`mt-1 text-xs ${asset.altText ? "text-muted-foreground" : "text-error"}`}>{asset.altText ?? "altText 누락"}</p>
                  <p className="mt-2 text-xs text-muted-foreground">used {asset.usageCount}x · {(asset.sizeBytes / 1024).toFixed(0)}KB</p>
                </button>
              ))}
            </div>
            {selected && (
              <aside className="col-span-12 rounded-lg border border-ld p-4 dark:border-[#333f55] xl:col-span-4">
                <h2 className="card-title">상세 정보</h2>
                <dl className="mt-5 space-y-4 text-sm">
                  <div><dt className="text-muted-foreground">파일명</dt><dd className="mt-1 font-medium text-foreground dark:text-white">{selected.fileName}</dd></div>
                  <div><dt className="text-muted-foreground">altText</dt><dd className={`mt-1 font-medium ${selected.altText ? "text-foreground dark:text-white" : "text-error"}`}>{selected.altText ?? "누락"}</dd></div>
                  <div><dt className="text-muted-foreground">Caption</dt><dd className="mt-1 text-foreground dark:text-white">{selected.caption ?? "-"}</dd></div>
                  <div><dt className="text-muted-foreground">사용 위치</dt><dd className="mt-1 text-foreground dark:text-white">{selected.usageCount}개 콘텐츠</dd></div>
                </dl>
                <button className="button-base mt-6 border border-error bg-transparent text-error hover:bg-error hover:text-white" type="button" onClick={() => { mediaApi.delete(selected.id).then(() => setAssets((a) => a.filter((x) => x.id !== selected.id))); }}>삭제</button>
              </aside>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
