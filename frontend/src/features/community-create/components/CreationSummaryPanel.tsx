import { Send } from 'lucide-react';
import { CategoryResponse, CommunityCreationRequest } from '../api/communityCreationClient';

interface CreationSummaryPanelProps {
  request: CommunityCreationRequest;
  category?: CategoryResponse;
  saving: boolean;
  onSubmit: () => Promise<void>;
}

export function CreationSummaryPanel({ request, category, saving, onSubmit }: CreationSummaryPanelProps) {
  return (
    <section className="summary-panel">
      <div className="summary-header">
        <div>
          <span className={`status-badge risk-${request.riskLevel.toLowerCase()}`}>{request.riskLevel}</span>
          <h2>{request.displayName || '이름 미입력'}</h2>
          <p>/c/{request.slug || 'address'}</p>
        </div>
        <button className="primary-button" type="button" disabled={saving} onClick={() => void onSubmit()}>
          <Send size={17} aria-hidden="true" />
          제출
        </button>
      </div>

      <dl className="summary-list">
        <div>
          <dt>카테고리</dt>
          <dd>
            {category?.name ?? '미선택'}
            {category?.requiresReview ? <span className="status-badge warning">검수 필요</span> : null}
          </dd>
        </div>
        <div>
          <dt>공개/가입</dt>
          <dd>
            {request.visibility} · {request.joinPolicy}
          </dd>
        </div>
        <div>
          <dt>게시판</dt>
          <dd>{request.boards.length}개</dd>
        </div>
        <div>
          <dt>규칙</dt>
          <dd>{request.rules.length}개</dd>
        </div>
        <div>
          <dt>운영진 초대</dt>
          <dd>{request.moderatorInvitations.length}명</dd>
        </div>
      </dl>

      {request.riskSignals.length ? (
        <div className="notice-list">
          {request.riskSignals.map((signal) => (
            <p key={signal.code}>
              <strong>{signal.severity}</strong> {signal.message}
            </p>
          ))}
        </div>
      ) : null}

      {request.validationErrors.length ? (
        <div className="notice-list danger">
          {request.validationErrors.map((fieldError) => (
            <p key={`${fieldError.field}-${fieldError.code}`}>{fieldError.message}</p>
          ))}
        </div>
      ) : null}
    </section>
  );
}
