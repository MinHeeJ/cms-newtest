import { CheckCircle2, MessageSquareWarning, XCircle } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { ReviewDecision } from '../../community-create/api/communityCreationClient';

interface ReviewDecisionFormProps {
  updatedAt: string;
  saving: boolean;
  onDecide: (decision: ReviewDecision, reasonCode: string, reasonText: string) => Promise<void>;
}

const decisions: Array<{ value: ReviewDecision; label: string; icon: typeof CheckCircle2 }> = [
  { value: 'APPROVED', label: '승인', icon: CheckCircle2 },
  { value: 'CHANGE_REQUESTED', label: '수정 요청', icon: MessageSquareWarning },
  { value: 'REJECTED', label: '반려', icon: XCircle }
];

export function ReviewDecisionForm({ saving, onDecide }: ReviewDecisionFormProps) {
  const [decision, setDecision] = useState<ReviewDecision>('APPROVED');
  const [reasonCode, setReasonCode] = useState('POLICY_REVIEW');
  const [reasonText, setReasonText] = useState('운영 정책 기준에 따라 검수했습니다.');

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    await onDecide(decision, reasonCode, reasonText);
  }

  return (
    <form className="decision-form" onSubmit={handleSubmit}>
      <div className="decision-options" role="radiogroup" aria-label="검수 결정">
        {decisions.map(({ value, label, icon: Icon }) => (
          <button
            key={value}
            className={decision === value ? 'selected' : ''}
            type="button"
            onClick={() => setDecision(value)}
            role="radio"
            aria-checked={decision === value}
          >
            <Icon size={17} aria-hidden="true" />
            {label}
          </button>
        ))}
      </div>
      <label>
        <span>사유 코드</span>
        <input value={reasonCode} onChange={(event) => setReasonCode(event.target.value)} required minLength={2} />
      </label>
      <label>
        <span>상세 사유</span>
        <textarea value={reasonText} onChange={(event) => setReasonText(event.target.value)} required minLength={5} />
      </label>
      <button className="primary-button" type="submit" disabled={saving}>
        결정 저장
      </button>
    </form>
  );
}
