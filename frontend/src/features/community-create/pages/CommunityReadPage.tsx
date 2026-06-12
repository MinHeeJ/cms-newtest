import { ArrowLeft, Crown } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ApiError, CommunityResponse, getCommunity } from '../api/communityCreationClient';
import { ErrorState, LoadingState } from '../components/CreateWizardStates';

export function CommunityReadPage() {
  const { communityId } = useParams();
  const [community, setCommunity] = useState<CommunityResponse | null>(null);
  const [error, setError] = useState<ApiError | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!communityId) return;
    setLoading(true);
    getCommunity(communityId)
      .then((response) => {
        setCommunity(response);
        setError(null);
      })
      .catch((caught) => setError(caught as ApiError))
      .finally(() => setLoading(false));
  }, [communityId]);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState error={error} />;
  if (!community) return null;

  return (
    <div className="operator-page">
      <Link className="back-link" to="/create-community">
        <ArrowLeft size={16} aria-hidden="true" />
        개설 화면
      </Link>
      <section className="summary-panel">
        <div className="summary-header">
          <div>
            <span className={`status-badge status-${community.status.toLowerCase()}`}>{community.status}</span>
            <h1>{community.displayName}</h1>
            <p>/c/{community.slug}</p>
          </div>
          <span className="status-badge">
            <Crown size={14} aria-hidden="true" />
            OWNER
          </span>
        </div>
        <p>{community.description}</p>
        <dl className="summary-list">
          <div>
            <dt>소유자</dt>
            <dd>{community.ownerUserId}</dd>
          </div>
          <div>
            <dt>공개/가입</dt>
            <dd>
              {community.visibility} · {community.joinPolicy}
            </dd>
          </div>
          <div>
            <dt>공개일</dt>
            <dd>{new Date(community.launchedAt).toLocaleString('ko-KR')}</dd>
          </div>
        </dl>
      </section>
    </div>
  );
}
