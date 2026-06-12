import { Search, SlidersHorizontal } from 'lucide-react';
import { useMemo, useState } from 'react';
import { ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ReviewListItem } from '../api/communityReviewClient';

export function ReviewQueueTable({ items }: { items: ReviewListItem[] }) {
  const [search, setSearch] = useState('');
  const [risk, setRisk] = useState('ALL');
  const [status, setStatus] = useState('PENDING_REVIEW');

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const haystack = `${item.displayName ?? ''} ${item.slug ?? ''} ${item.creatorUserId}`.toLowerCase();
      const matchesSearch = haystack.includes(search.toLowerCase());
      const matchesRisk = risk === 'ALL' || item.riskLevel === risk;
      const matchesStatus = status === 'ALL' || item.status === status;
      return matchesSearch && matchesRisk && matchesStatus;
    });
  }, [items, risk, search, status]);

  return (
    <div className="review-shell">
      <aside className="review-filters" aria-label="검수 목록 필터">
        <div>
          <span className="section-kicker">Filters</span>
          <h2 className="mb-1 flex items-center gap-2">
            <SlidersHorizontal size={18} aria-hidden="true" /> 목록 좁히기
          </h2>
          <p className="text-sm leading-6 text-muted-foreground">위험도, 상태, 이름/주소로 검수 대기열을 훑어봅니다.</p>
        </div>
        <label>
          <span>상태</span>
          <select value={status} onChange={(event) => setStatus(event.target.value)}>
            <option value="PENDING_REVIEW">검수 대기</option>
            <option value="ALL">전체</option>
            <option value="CHANGE_REQUESTED">수정 요청</option>
            <option value="REJECTED">반려</option>
            <option value="APPROVED">승인</option>
          </select>
        </label>
        <label>
          <span>위험도</span>
          <select value={risk} onChange={(event) => setRisk(event.target.value)}>
            <option value="ALL">전체</option>
            <option value="HIGH">높음</option>
            <option value="MEDIUM">중간</option>
            <option value="LOW">낮음</option>
          </select>
        </label>
        <label>
          <span>검색</span>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-2.5 size-4 text-muted-foreground" aria-hidden="true" />
            <input className="pl-9" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="이름, 주소, 요청자" />
          </div>
        </label>
      </aside>

      <section className="grid min-w-0 gap-3" aria-label="검수 대기열">
        <div className="flex items-center justify-between gap-3">
          <strong>검수 대기열</strong>
          <span className="status-badge">{filteredItems.length}건 표시</span>
        </div>
        {filteredItems.length ? <ReviewRows items={filteredItems} /> : <div className="state-panel">조건에 맞는 커뮤니티 개설 요청이 없습니다.</div>}
      </section>
    </div>
  );
}

function ReviewRows({ items }: { items: ReviewListItem[] }) {
  return (
    <div className="review-table-scroll">
      <div className="review-table" role="table" aria-label="커뮤니티 개설 검수 목록">
        <div className="review-table-head" role="row">
          <span>이름</span>
          <span>주소</span>
          <span>위험도</span>
          <span>상태</span>
          <span>제출일</span>
          <span aria-label="상세" />
        </div>
        {items.map((item) => (
          <div className="review-table-row" role="row" key={item.requestId}>
            <strong>{item.displayName ?? '이름 미입력'}</strong>
            <span>/c/{item.slug ?? '-'}</span>
            <span className={`status-badge risk-${item.riskLevel.toLowerCase()}`}>{item.riskLevel}</span>
            <span className={`status-badge status-${item.status.toLowerCase()}`}>{item.status}</span>
            <span>{item.submittedAt ? new Date(item.submittedAt).toLocaleString('ko-KR') : '-'}</span>
            <Link className="icon-button" to={`/operator/community-reviews/${item.requestId}`} aria-label="상세 보기">
              <ExternalLink size={17} />
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
