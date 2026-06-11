import { FormEvent, useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { errorMessage } from '../../services/apiClient';
import { createModerationAction, ModerationActionType, Report } from './moderationApi';

interface ModerationActionPanelProps {
  report: Report | null;
  onDone: () => void;
}

const actionLabels: Record<ModerationActionType, string> = {
  HIDE: '숨김',
  RESTORE: '복구',
  DELETE: '삭제',
  WARN: '경고',
  SUSPEND: '정지',
  REJECT_REPORT: '반려',
  MARK_DUPLICATE: '중복'
};

export function ModerationActionPanel({ report, onDone }: ModerationActionPanelProps) {
  const [actionType, setActionType] = useState<ModerationActionType>('HIDE');
  const [reason, setReason] = useState('');
  const [visibleToMember, setVisibleToMember] = useState(true);
  const [message, setMessage] = useState('');
  const [pending, setPending] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!report) {
      setMessage('신고 항목을 선택해주세요.');
      return;
    }
    setPending(true);
    setMessage('');
    try {
      await createModerationAction(report.id, actionType, reason, visibleToMember);
      setReason('');
      onDone();
    } catch (error) {
      setMessage(errorMessage(error));
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="moderation-action-panel" onSubmit={submit}>
      <h2>
        <ShieldCheck size={18} /> 조치
      </h2>
      {report ? (
        <div className="target-preview">
          <b>{report.targetType}</b>
          <span>{report.targetId}</span>
          <p>{report.description || '상세 설명 없음'}</p>
        </div>
      ) : (
        <div className="empty-state">검토할 신고를 선택하세요.</div>
      )}
      <label>
        조치 유형
        <select value={actionType} onChange={(event) => setActionType(event.target.value as ModerationActionType)}>
          {Object.entries(actionLabels).map(([value, label]) => (
            <option value={value} key={value}>
              {label}
            </option>
          ))}
        </select>
      </label>
      <label>
        사유
        <textarea value={reason} onChange={(event) => setReason(event.target.value)} rows={5} />
      </label>
      <label className="switch-label">
        <input type="checkbox" checked={visibleToMember} onChange={(event) => setVisibleToMember(event.target.checked)} />
        회원에게 사유 알림
      </label>
      {message && <p className="validation-message">{message}</p>}
      <button className="danger-button" type="submit" disabled={pending || !report}>
        저장
      </button>
    </form>
  );
}
