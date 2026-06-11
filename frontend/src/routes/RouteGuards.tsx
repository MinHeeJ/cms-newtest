import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { getStoredMember, Role } from '../services/apiClient';

interface GuardProps {
  children: ReactNode;
}

interface RoleGuardProps extends GuardProps {
  roles: Role[];
}

export function RequireAuth({ children }: GuardProps) {
  const location = useLocation();
  const member = getStoredMember();
  if (!member) {
    return <Navigate to="/" replace state={{ from: location.pathname, reason: 'login-required' }} />;
  }
  return <>{children}</>;
}

export function RequireRole({ children, roles }: RoleGuardProps) {
  const location = useLocation();
  const member = getStoredMember();
  if (!member) {
    return <Navigate to="/" replace state={{ from: location.pathname, reason: 'login-required' }} />;
  }
  if (!roles.includes(member.role)) {
    return <ForbiddenState />;
  }
  return <>{children}</>;
}

export function ForbiddenState() {
  return (
    <main className="state-page" aria-live="polite">
      <h1>권한이 없습니다</h1>
      <p>현재 계정으로 접근할 수 없는 화면입니다.</p>
    </main>
  );
}
