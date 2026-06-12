import { AlertTriangle, Info } from 'lucide-react';
import { RiskSignalResponse } from '../../community-create/api/communityCreationClient';

export function RiskSignalList({ signals }: { signals: RiskSignalResponse[] }) {
  if (!signals.length) {
    return (
      <div className="risk-list empty">
        <Info size={18} aria-hidden="true" />
        정책 위험 신호가 없습니다.
      </div>
    );
  }

  return (
    <div className="risk-list">
      {signals.map((signal) => (
        <div className={`risk-item risk-${signal.severity.toLowerCase()}`} key={signal.code}>
          <AlertTriangle size={18} aria-hidden="true" />
          <div>
            <strong>{signal.code}</strong>
            <p>{signal.message}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
