import { Link, Navigate, useLocation, useRoutes } from 'react-router-dom';
import { communityCreateRoutes } from './features/community-create/routes/communityCreateRoutes';
import { communityReviewRoutes } from './features/community-review/pages/CommunityReviewQueuePage';

export function App() {
  const location = useLocation();
  const routes = useRoutes([
    { path: '/', element: <Navigate to="/create-community" replace /> },
    ...communityCreateRoutes,
    ...communityReviewRoutes
  ]);

  return (
    <div className="app-shell">
      <header className="topbar">
        <Link className="brand" to="/create-community" aria-label="커뮤니티 개설 홈">
          커뮤니티 개설
        </Link>
        <nav className="topnav" aria-label="주요 메뉴">
          <Link className={location.pathname.startsWith('/create') ? 'active' : ''} to="/create-community">
            사용자 개설
          </Link>
          <Link className={location.pathname.startsWith('/operator') ? 'active' : ''} to="/operator/community-reviews">
            운영자 검수
          </Link>
        </nav>
      </header>
      <main>{routes}</main>
    </div>
  );
}
