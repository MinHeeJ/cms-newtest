import { Plus, RefreshCw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FilterRail } from "../features/ideas/FilterRail";
import { IdeaList } from "../features/ideas/IdeaList";
import { SearchBar } from "../features/ideas/SearchBar";
import { apiClient, type Idea, type IdeaStatus, type Tag } from "../services/api-client";

export function IdeaListPage() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [status, setStatus] = useState<IdeaStatus | undefined>();
  const [tag, setTag] = useState<string | undefined>();
  const [pinned, setPinned] = useState<boolean | undefined>();
  const [sort, setSort] = useState<"updated_desc" | "created_desc" | "title_asc">("updated_desc");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedQuery(query), 250);
    return () => window.clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    let ignore = false;
    apiClient
      .listTags()
      .then((response) => {
        if (!ignore) {
          setTags(response.items);
        }
      })
      .catch((cause) => setError(cause instanceof Error ? cause.message : "태그를 불러오지 못했습니다."));
    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    let ignore = false;
    setIsLoading(true);
    apiClient
      .listIdeas({
        q: debouncedQuery,
        status,
        tag,
        pinned,
        sort,
        pageSize: 60
      })
      .then((response) => {
        if (!ignore) {
          setIdeas(response.items);
          setError(null);
        }
      })
      .catch((cause) => {
        if (!ignore) {
          setError(cause instanceof Error ? cause.message : "아이디어를 불러오지 못했습니다.");
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
  }, [debouncedQuery, status, tag, pinned, sort]);

  const activeFilterCount = useMemo(
    () => [debouncedQuery, status, tag, pinned].filter((value) => value !== undefined && value !== "").length,
    [debouncedQuery, status, tag, pinned]
  );

  const resetFilters = () => {
    setQuery("");
    setDebouncedQuery("");
    setStatus(undefined);
    setTag(undefined);
    setPinned(undefined);
  };

  return (
    <div className="workspace">
      <FilterRail
        status={status}
        tag={tag}
        pinned={pinned}
        tags={tags}
        onStatusChange={setStatus}
        onTagChange={setTag}
        onPinnedChange={setPinned}
        onReset={resetFilters}
      />
      <section className="content-canvas">
        <div className="page-intro">
          <div>
            <p className="eyebrow">Idea List</p>
            <h1>아이디어를 빠르게 찾고 이어 쓰기</h1>
            <p>고정, 태그, 상태, 검색어로 지금 다시 볼 아이디어만 남겨 둡니다.</p>
          </div>
          <Link className="btn btn-primary" to="/ideas/new">
            <Plus size={18} />
            새 아이디어
          </Link>
        </div>

        <div className="list-toolbar">
          <SearchBar value={query} onChange={setQuery} />
          <select className="select" value={sort} onChange={(event) => setSort(event.target.value as typeof sort)} aria-label="정렬">
            <option value="updated_desc">최근 수정순</option>
            <option value="created_desc">최근 생성순</option>
            <option value="title_asc">제목순</option>
          </select>
        </div>

        <div className="result-strip">
          <span>{ideas.length}개 아이디어</span>
          {activeFilterCount > 0 ? <span>{activeFilterCount}개 필터 적용</span> : <span>기본 목록은 보관됨 제외</span>}
        </div>

        {error ? (
          <div className="inline-error">
            <span>{error}</span>
            <button className="btn btn-secondary" type="button" onClick={resetFilters}>
              <RefreshCw size={16} />
              다시 시도
            </button>
          </div>
        ) : null}

        <IdeaList
          ideas={ideas}
          isLoading={isLoading}
          emptyTitle={activeFilterCount > 0 ? "조건에 맞는 아이디어가 없습니다" : "첫 아이디어를 적어 보세요"}
          emptyDescription={activeFilterCount > 0 ? "검색어와 필터를 줄이면 더 많은 아이디어를 볼 수 있습니다." : "제목이나 본문 중 하나만 있어도 저장할 수 있습니다."}
          onReset={activeFilterCount > 0 ? resetFilters : undefined}
        />
      </section>
    </div>
  );
}
