import { FormEvent, useState } from 'react';
import { Flag, X } from 'lucide-react';
import { errorMessage, getStoredMember } from '../../services/apiClient';
import { ReportReasonCode, ReportTargetType, reportTarget } from './moderationApi';

interface ReportDialogProps {
  open: boolean;
  targetType: ReportTargetType;
  targetId: string;
  onClose: () => void;
}

const reasonLabels: Record<ReportReasonCode, string> = {
  SPAM: '스팸/홍보',
  ABUSE: '욕설/혐오',
  ILLEGAL: '불법 정보',
  PRIVACY: '개인정보 노출',
  OTHER: '기타'
};

export function ReportDialog({ open, targetType, targetId, onClose }: ReportDialogProps) {
  const [reasonCode, setReasonCode] = useState<ReportReasonCode>('SPAM');
  const [description, setDescription] = useState('');
  const [message, setMessage] = useState('');
  const [pending, setPending] = useState(false);

  if (!open) {
    return null;
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!getStoredMember()) {
      setMessage('로그인 후 신고할 수 있습니다.');
      return;
    }
    setPending(true);
    setMessage('');
    try {
      await reportTarget(targetType, targetId, reasonCode, description);
      setMessage('신고가 접수되었습니다.');
      setTimeout(onClose, 600);
    } catch (error) {
      setMessage(errorMessage(error));
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="modal-backdrop" role="presentation">
      <form className="modal-panel" role="dialog" aria-modal="true" aria-labelledby="report-title" onSubmit={submit}>
        <div className="section-heading">
          <h2 id="report-title">
            <Flag size={18} /> 신고
          </h2>
          <button className="icon-button" type="button" onClick={onClose} aria-label="닫기">
            <X size={18} />
          </button>
        </div>
        <label>
          사유
          <select value={reasonCode} onChange={(event) => setReasonCode(event.target.value as ReportReasonCode)}>
            {Object.entries(reasonLabels).map(([value, label]) => (
              <option value={value} key={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label>
          상세 설명
          <textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={5} maxLength={1000} />
        </label>
        {message && <p className="validation-message">{message}</p>}
        <button className="danger-button" type="submit" disabled={pending}>
          접수
        </button>
      </form>
    </div>
  );
}
