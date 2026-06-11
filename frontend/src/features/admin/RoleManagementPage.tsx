import { FormEvent, useState } from 'react';
import { Shield } from 'lucide-react';
import { errorMessage, MemberProfile, MemberStatus, Role } from '../../services/apiClient';
import { updateMemberRole, updateMemberStatus } from './adminApi';

export function RoleManagementPage() {
  const [memberId, setMemberId] = useState('');
  const [role, setRole] = useState<Role>('MEMBER');
  const [status, setStatus] = useState<MemberStatus>('ACTIVE');
  const [updated, setUpdated] = useState<MemberProfile | null>(null);
  const [message, setMessage] = useState('');

  async function updateRole(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      const member = await updateMemberRole(memberId, role);
      setUpdated(member);
      setMessage('권한이 변경되었습니다.');
    } catch (error) {
      setMessage(errorMessage(error));
    }
  }

  async function updateStatus(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      const member = await updateMemberStatus(memberId, status);
      setUpdated(member);
      setMessage('회원 상태가 변경되었습니다.');
    } catch (error) {
      setMessage(errorMessage(error));
    }
  }

  return (
    <main className="admin-layout two-column">
      <section className="admin-list">
        <div className="section-heading">
          <h1>
            <Shield size={20} /> 권한 관리
          </h1>
        </div>
        <label>
          회원 ID
          <input value={memberId} onChange={(event) => setMemberId(event.target.value)} />
        </label>
        {updated && (
          <article className="admin-row">
            <strong>{updated.nickname}</strong>
            <span>{updated.email}</span>
            <b className="badge">{updated.role}</b>
            <b className="badge">{updated.status}</b>
          </article>
        )}
        {message && <p className="validation-message">{message}</p>}
      </section>
      <div className="admin-form-stack">
        <form className="admin-form" onSubmit={updateRole}>
          <h2>권한 변경</h2>
          <select value={role} onChange={(event) => setRole(event.target.value as Role)}>
            <option value="MEMBER">회원</option>
            <option value="MODERATOR">게시판 관리자</option>
            <option value="ADMIN">최고 관리자</option>
          </select>
          <button className="primary-button" type="submit">
            저장
          </button>
        </form>
        <form className="admin-form" onSubmit={updateStatus}>
          <h2>상태 변경</h2>
          <select value={status} onChange={(event) => setStatus(event.target.value as MemberStatus)}>
            <option value="ACTIVE">활성</option>
            <option value="SUSPENDED">정지</option>
            <option value="WITHDRAWN">탈퇴</option>
          </select>
          <button className="danger-button" type="submit">
            적용
          </button>
        </form>
      </div>
    </main>
  );
}
