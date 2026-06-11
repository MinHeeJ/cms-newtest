import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BarChart3, FileText, Flag, MessageSquare, Users } from 'lucide-react';
import { errorMessage } from '../../services/apiClient';
import { AdminMetrics, fetchAdminMetrics } from './adminApi';

export function AdminDashboardPage() {
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchAdminMetrics()
      .then((response) => {
        setMetrics(response);
        setMessage('');
      })
      .catch((error) => setMessage(errorMessage(error)));
  }, []);

  return (
    <main className="single-panel admin-home">
      <div className="admin-nav">
        <Link to="/admin/boards">게시판</Link>
        <Link to="/admin/notices">공지</Link>
        <Link to="/moderation/reports">신고</Link>
        <Link to="/admin/roles">권한</Link>
      </div>
      <div className="section-heading">
        <h1>
          <BarChart3 size={20} /> 운영 현황
        </h1>
      </div>
      {message && <p className="validation-message">{message}</p>}
      <section className="metrics-grid">
        <Metric icon={<Users size={18} />} label="오늘 가입" value={metrics?.todayMembers ?? 0} />
        <Metric icon={<FileText size={18} />} label="오늘 글" value={metrics?.todayPosts ?? 0} />
        <Metric icon={<MessageSquare size={18} />} label="오늘 댓글" value={metrics?.todayComments ?? 0} />
        <Metric icon={<Flag size={18} />} label="대기 신고" value={metrics?.pendingReports ?? 0} tone="danger" />
        <Metric icon={<BarChart3 size={18} />} label="게시판" value={metrics?.activeBoards ?? 0} />
        <Metric icon={<FileText size={18} />} label="공개 글" value={metrics?.publishedPosts ?? 0} />
      </section>
      <section className="timeline-panel">
        <h2>운영 이벤트</h2>
        <ol>
          <li>신고, 제재, 게시판 설정 변경은 감사 로그로 기록됩니다.</li>
          <li>운영자 조치 결과는 회원 알림으로 전달됩니다.</li>
          <li>공지와 고정글은 게시판 목록 상단에 표시됩니다.</li>
        </ol>
      </section>
    </main>
  );
}

function Metric({ icon, label, value, tone }: { icon: ReactNode; label: string; value: number; tone?: 'danger' }) {
  return (
    <article className={tone === 'danger' ? 'metric-card danger' : 'metric-card'}>
      {icon}
      <span>{label}</span>
      <strong>{value.toLocaleString()}</strong>
    </article>
  );
}
