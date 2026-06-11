import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Filter, Flag } from 'lucide-react';
import { errorMessage } from '../../services/apiClient';
import { listReports, Report, ReportStatus } from './moderationApi';
import { ModerationActionPanel } from './ModerationActionPanel';

const statuses: Array<ReportStatus | ''> = ['', 'OPEN', 'IN_REVIEW', 'ACTIONED', 'REJECTED', 'DUPLICATE'];

export function ReportQueuePage() {
  const [status, setStatus] = useState<ReportStatus | ''>('OPEN');
  const [reports, setReports] = useState<Report[]>([]);
  const [selected, setSelected] = useState<Report | null>(null);
  const [message, setMessage] = useState('');

  async function load() {
    try {
      const page = await listReports(status || undefined);
      setReports(page.content);
      setSelected((current) => current && page.content.find((report) => report.id === current.id) ? current : page.content[0] ?? null);
      setMessage('');
    } catch (error) {
      setMessage(errorMessage(error));
    }
  }

  useEffect(() => {
    load();
  }, [status]);

  return (
    <main className="admin-layout">
      <section className="report-queue">
        <div className="section-heading">
          <h1>
            <Flag size={20} /> 신고 큐
          </h1>
        </div>
        <div className="status-tabs">
          <Filter size={16} />
          {statuses.map((item) => (
            <button className={status === item ? 'active' : ''} type="button" onClick={() => setStatus(item)} key={item || 'all'}>
              {item || '전체'}
            </button>
          ))}
        </div>
        {message && <p className="validation-message">{message}</p>}
        <div className="report-list">
          {reports.length === 0 && <div className="empty-state">대기 중인 신고가 없습니다.</div>}
          {reports.map((report) => (
            <button
              className={selected?.id === report.id ? 'report-row active' : 'report-row'}
              type="button"
              onClick={() => setSelected(report)}
              key={report.id}
            >
              <b>{report.reasonCode}</b>
              <strong>{report.targetType}</strong>
              <span>{report.reporterNickname}</span>
              <small>{report.status}</small>
            </button>
          ))}
        </div>
      </section>

      <aside className="target-preview-column">
        <div className="section-heading">
          <h2>대상 미리보기</h2>
        </div>
        {selected ? (
          <div className="target-preview">
            <b>{selected.targetType}</b>
            <span>{selected.targetId}</span>
            <p>{selected.description || '신고자가 상세 설명을 남기지 않았습니다.'}</p>
            {selected.targetType === 'POST' && <Link to={`/posts/${selected.targetId}`}>게시글 열기</Link>}
          </div>
        ) : (
          <div className="empty-state">선택된 신고가 없습니다.</div>
        )}
      </aside>

      <ModerationActionPanel report={selected} onDone={load} />
    </main>
  );
}
