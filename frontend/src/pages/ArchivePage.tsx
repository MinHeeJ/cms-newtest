import { ArrowLeft, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FilterRail } from "../features/ideas/FilterRail";
import { IdeaList } from "../features/ideas/IdeaList";
import { SearchBar } from "../features/ideas/SearchBar";
import { apiClient, type Idea, type Tag } from "../services/api-client";

export function ArchivePage() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [query, setQuery] = useState("");
  const [tag, setTag] = useState<string | undefined>();
  const [pinned, setPinned] = useState<boolean | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiClient
      .listTags()
      .then((response) => setTags(response.items))
      .catch((cause) => setError(cause instanceof Error ? cause.message : "태그를 불러오지 못했습니다."));
  }, []);

  useEffect(() => {
    let ignore = false;
    setIsLoading(true);
    apiClient
      .listIdeas({ status: "archived", q: query, tag, pinned, pageSize: 60 })
      .then((response) => {
        if (!ignore) {
          setIdeas(response.items);
          setError(null);
        }
      })
      .catch((cause) => {
        if (!ignore) {
          setError(cause instanceof Error ? cause.message : "보관함을 불러오지 못했습니다.");
        }
      })
      .finally(() => {
        if (!ignore) {
          setIsLoading(false);
        }
      });
    return () => {
      ignore = true;
    };
  }, [query, tag, pinned]);

  const reset = () => {
    setQuery("");
    setTag(undefined);
    setPinned(undefined);
  };

  const hasActiveFilters = Boolean(query || tag || pinned);

  return (
    <div className="workspace">
      <FilterRail
        status="archived"
        tag={tag}
        pinned={pinned}
        tags={tags}
        onStatusChange={() => undefined}
        onTagChange={setTag}
        onPinnedChange={setPinned}
        onReset={reset}
      />
      <section className="content-canvas">
        <div className="page-intro">
          <div>
            <p className="eyebrow">Archive</p>
            <h1>보관된 아이디어</h1>
            <p>기본 목록에서 숨긴 아이디어를 다시 확인하고 복원할 수 있습니다.</p>
          </div>
          <Link className="btn btn-secondary" to="/ideas">
            <ArrowLeft size={18} />
            목록으로
          </Link>
        </div>
        <div className="list-toolbar">
          <SearchBar value={query} onChange={setQuery} />
        </div>
        <div className="result-strip archive-strip">
          <span>{ideas.length}개 보관됨</span>
          {hasActiveFilters ? <span>검색/필터 적용 중</span> : <span>복원은 상세 화면에서 처리</span>}
        </div>
        {error ? (
          <div className="inline-error">
            <span>{error}</span>
            <button className="btn btn-secondary" type="button" onClick={reset}>
              <RefreshCw size={16} />
              다시 시도
            </button>
          </div>
        ) : null}
        <IdeaList
          ideas={ideas}
          isLoading={isLoading}
          emptyTitle={hasActiveFilters ? "조건에 맞는 보관 아이디어가 없습니다" : "보관함이 비어 있습니다"}
          emptyDescription={hasActiveFilters ? "검색어와 필터를 초기화하면 전체 보관함을 다시 볼 수 있습니다." : "목록으로 돌아가 계속 발전시킬 아이디어를 골라 보세요."}
          emptyCtaLabel="목록으로"
          emptyCtaHref="/ideas"
          onReset={hasActiveFilters ? reset : undefined}
        />
      </section>
    </div>
  );
}
