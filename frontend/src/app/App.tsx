import { FormEvent, useEffect, useState } from 'react';
import { Link, NavLink, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { Bell, Home, LayoutDashboard, LogOut, PenLine, Search, Shield, UserRound } from 'lucide-react';
import { BoardFeedPage } from '../features/boards/BoardFeedPage';
import { PostDetailPage } from '../features/posts/PostDetailPage';
import { PostComposerPage } from '../features/posts/PostComposerPage';
import { SearchResultsPage } from '../features/search/SearchResultsPage';
import { NotificationCenter } from '../features/notifications/NotificationCenter';
import { ReportQueuePage } from '../features/moderation/ReportQueuePage';
import { AdminDashboardPage } from '../features/admin/AdminDashboardPage';
import { BoardManagementPage } from '../features/admin/BoardManagementPage';
import { NoticeManagementPage } from '../features/admin/NoticeManagementPage';
import { RoleManagementPage } from '../features/admin/RoleManagementPage';
import { RequireAuth, RequireRole } from '../routes/RouteGuards';
import {
  apiRequest,
  AuthSession,
  clearSession,
  errorMessage,
  getStoredMember,
  MemberProfile,
  storeSession
} from '../services/apiClient';

export default function App() {
  const [member, setMember] = useState<MemberProfile | null>(() => getStoredMember());

  useEffect(() => {
    const refresh = () => setMember(getStoredMember());
    window.addEventListener('cms-session-change', refresh);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener('cms-session-change', refresh);
      window.removeEventListener('storage', refresh);
    };
  }, []);

  return (
    <div className="app-shell">
      <AppHeader member={member} />
      <div className="app-body">
        <aside className="left-rail" aria-label="주요 메뉴">
          <NavLink to="/">
            <Home size={18} /> 홈
          </NavLink>
          <NavLink to="/write">
            <PenLine size={18} /> 글쓰기
          </NavLink>
          <NavLink to="/notifications">
            <Bell size={18} /> 알림
          </NavLink>
          {(member?.role === 'MODERATOR' || member?.role === 'ADMIN') && (
            <NavLink to="/moderation/reports">
              <Shield size={18} /> 신고
            </NavLink>
          )}
          {member?.role === 'ADMIN' && (
            <NavLink to="/admin">
              <LayoutDashboard size={18} /> 관리자
            </NavLink>
          )}
        </aside>

        <Routes>
          <Route path="/" element={<BoardFeedPage />} />
          <Route path="/boards/:boardId" element={<BoardFeedPage />} />
          <Route path="/posts/:postId" element={<PostDetailPage />} />
          <Route
            path="/write"
            element={
              <RequireAuth>
                <PostComposerPage />
              </RequireAuth>
            }
          />
          <Route path="/search" element={<SearchResultsPage />} />
          <Route
            path="/notifications"
            element={
              <RequireAuth>
                <NotificationCenter />
              </RequireAuth>
            }
          />
          <Route
            path="/moderation/reports"
            element={
              <RequireRole roles={['MODERATOR', 'ADMIN']}>
                <ReportQueuePage />
              </RequireRole>
            }
          />
          <Route
            path="/admin"
            element={
              <RequireRole roles={['ADMIN']}>
                <AdminDashboardPage />
              </RequireRole>
            }
          />
          <Route
            path="/admin/boards"
            element={
              <RequireRole roles={['ADMIN']}>
                <BoardManagementPage />
              </RequireRole>
            }
          />
          <Route
            path="/admin/notices"
            element={
              <RequireRole roles={['ADMIN']}>
                <NoticeManagementPage />
              </RequireRole>
            }
          />
          <Route
            path="/admin/roles"
            element={
              <RequireRole roles={['ADMIN']}>
                <RoleManagementPage />
              </RequireRole>
            }
          />
        </Routes>
      </div>
      <MobileNav member={member} />
    </div>
  );
}

function AppHeader({ member }: { member: MemberProfile | null }) {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  function search(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = query.trim();
    if (trimmed.length >= 2) {
      navigate(`/search?q=${encodeURIComponent(trimmed)}`);
    }
  }

  return (
    <header className="topbar">
      <Link className="brand" to="/">
        CMS Community
      </Link>
      <form className="topbar-search" onSubmit={search}>
        <Search size={18} aria-hidden="true" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="게시글, 게시판 검색"
          aria-label="통합 검색"
        />
      </form>
      <AuthPanel member={member} />
    </header>
  );
}

function AuthPanel({ member }: { member: MemberProfile | null }) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('member@example.com');
  const [password, setPassword] = useState('password1234');
  const [nickname, setNickname] = useState('');
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState('');
  const location = useLocation();
  const routeState = location.state as { reason?: string } | null;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setMessage('');
    try {
      const session = await apiRequest<AuthSession>(mode === 'login' ? '/api/v1/auth/login' : '/api/v1/auth/register', {
        method: 'POST',
        body: JSON.stringify(mode === 'login' ? { email, password } : { email, password, nickname })
      });
      storeSession(session);
    } catch (error) {
      setMessage(errorMessage(error));
    } finally {
      setPending(false);
    }
  }

  if (member) {
    return (
      <div className="session-box">
        <Link className="notification-link" to="/notifications" aria-label="알림함">
          <Bell size={18} />
          {member.unreadNotificationCount > 0 && <span>{member.unreadNotificationCount}</span>}
        </Link>
        <div className="profile-chip">
          <UserRound size={18} />
          <strong>{member.nickname}</strong>
          <small>{member.role}</small>
        </div>
        <button className="icon-button" type="button" onClick={clearSession} aria-label="로그아웃" title="로그아웃">
          <LogOut size={18} />
        </button>
      </div>
    );
  }

  return (
    <form className="auth-panel" onSubmit={submit} aria-label="로그인">
      {routeState?.reason === 'login-required' && <span className="auth-note">로그인이 필요합니다.</span>}
      <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} aria-label="이메일" />
      <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} aria-label="비밀번호" />
      {mode === 'register' && (
        <input value={nickname} onChange={(event) => setNickname(event.target.value)} placeholder="닉네임" aria-label="닉네임" />
      )}
      <button type="submit" disabled={pending}>
        {mode === 'login' ? '로그인' : '가입'}
      </button>
      <button className="text-button" type="button" onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>
        {mode === 'login' ? '회원가입' : '로그인'}
      </button>
      {message && <span className="auth-error">{message}</span>}
    </form>
  );
}

function MobileNav({ member }: { member: MemberProfile | null }) {
  return (
    <nav className="mobile-nav" aria-label="모바일 메뉴">
      <NavLink to="/" aria-label="홈">
        <Home size={20} />
      </NavLink>
      <NavLink to="/search" aria-label="검색">
        <Search size={20} />
      </NavLink>
      <NavLink to="/write" aria-label="글쓰기">
        <PenLine size={20} />
      </NavLink>
      <NavLink to="/notifications" aria-label="알림">
        <Bell size={20} />
      </NavLink>
      {member?.role === 'ADMIN' ? (
        <NavLink to="/admin" aria-label="관리자">
          <LayoutDashboard size={20} />
        </NavLink>
      ) : (
        <NavLink to="/" aria-label="내 정보">
          <UserRound size={20} />
        </NavLink>
      )}
    </nav>
  );
}
