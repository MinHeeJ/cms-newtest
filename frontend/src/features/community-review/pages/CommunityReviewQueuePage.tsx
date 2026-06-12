import { createElement, useEffect, useState } from 'react';
import type { RouteObject } from 'react-router-dom';
import { ApiError } from '../../community-create/api/communityCreationClient';
import { ErrorState, LoadingState } from '../../community-create/components/CreateWizardStates';
import { ReviewQueueTable } from '../components/ReviewQueueTable';
import { ReviewQueuePage, listReviews } from '../api/communityReviewClient';
import { CommunityReviewDetailPage } from './CommunityReviewDetailPage';

export const communityReviewRoutes: RouteObject[] = [
  {
    path: '/operator/community-reviews',
    element: createElement(CommunityReviewQueuePage)
  },
  {
    path: '/operator/community-reviews/:requestId',
    element: createElement(CommunityReviewDetailPage)
  }
];

export function CommunityReviewQueuePage() {
  const [queue, setQueue] = useState<ReviewQueuePage | null>(null);
  const [error, setError] = useState<ApiError | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    listReviews()
      .then((response) => {
        setQueue(response);
        setError(null);
      })
      .catch((caught) => setError(caught as ApiError))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState error={error} />;

  return (
    <div className="operator-page">
      <div className="page-title-row">
        <div>
          <span className="section-kicker">Operator queue</span>
          <h1>커뮤니티 개설 검수</h1>
          <p>위험 신호가 있거나 정책상 확인이 필요한 신규 커뮤니티 요청을 검토합니다.</p>
        </div>
        <span className="status-badge">{queue?.totalElements ?? 0}건</span>
      </div>
      <ReviewQueueTable items={queue?.items ?? []} />
    </div>
  );
}
