import { ArrowLeft } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ApiError, ReviewDecision } from '../../community-create/api/communityCreationClient';
import { ErrorState, LoadingState } from '../../community-create/components/CreateWizardStates';
import { RiskSignalList } from '../components/RiskSignalList';
import { ReviewDecisionForm } from '../components/ReviewDecisionForm';
import { ReviewDetail, decideReview, getReviewDetail } from '../api/communityReviewClient';

export function CommunityReviewDetailPage() {
  const { requestId } = useParams();
  const [detail, setDetail] = useState<ReviewDetail | null>(null);
  const [error, setError] = useState<ApiError | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!requestId) return;
    setLoading(true);
    getReviewDetail(requestId)
      .then((response) => {
        setDetail(response);
        setError(null);
      })
      .catch((caught) => setError(caught as ApiError))
      .finally(() => setLoading(false));
  }, [requestId]);

  async function handleDecision(decision: ReviewDecision, reasonCode: string, reasonText: string) {
    if (!detail || !requestId) return;
    setSaving(true);
    try {
      const response = await decideReview(requestId, {
        decision,
        reasonCode,
        reasonText,
        expectedRequestUpdatedAt: detail.request.updatedAt
      });
      setDetail({ ...detail, request: response.request });
      setError(null);
    } catch (caught) {
      setError(caught as ApiError);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <LoadingState />;
  if (error) return <ErrorState error={error} />;
  if (!detail) return null;

  const request = detail.request;

  return (
    <div className="operator-page">
      <Link className="back-link" to="/operator/community-reviews">
        <ArrowLeft size={16} aria-hidden="true" />
        검수 목록
      </Link>

      <div className="review-detail-grid">
        <section className="review-main">
          <div className="page-title-row">
            <div>
              <h1>{request.displayName || '이름 미입력'}</h1>
              <p>/c/{request.slug || '-'}</p>
            </div>
            <span className={`status-badge status-${request.status.toLowerCase()}`}>{request.status}</span>
          </div>

          <dl className="summary-list">
            <div>
              <dt>생성자</dt>
              <dd>{request.creatorUserId}</dd>
            </div>
            <div>
              <dt>설명</dt>
              <dd>{request.description || '-'}</dd>
            </div>
            <div>
              <dt>공개/가입</dt>
              <dd>
                {request.visibility} · {request.joinPolicy}
              </dd>
            </div>
          </dl>

          <h2>게시판</h2>
          <ul className="compact-list">
            {request.boards.map((board) => (
              <li key={board.id}>
                <strong>{board.name}</strong>
                <span>{board.type}</span>
              </li>
            ))}
          </ul>

          <h2>규칙</h2>
          <ul className="compact-list">
            {request.rules.map((rule) => (
              <li key={rule.id}>
                <strong>{rule.title}</strong>
                <span>{rule.required ? '필수' : '선택'}</span>
              </li>
            ))}
          </ul>

          <h2>감사 이벤트</h2>
          <ol className="timeline">
            {detail.auditEvents.map((event) => (
              <li key={event.id}>
                <time>{new Date(event.createdAt).toLocaleString('ko-KR')}</time>
                <strong>{event.eventType}</strong>
                <span>{event.summary}</span>
              </li>
            ))}
          </ol>
        </section>

        <aside className="review-side">
          <h2>위험 신호</h2>
          <RiskSignalList signals={request.riskSignals} />
          <h2>검수 결정</h2>
          <ReviewDecisionForm updatedAt={request.updatedAt} saving={saving} onDecide={handleDecision} />
        </aside>
      </div>
    </div>
  );
}
