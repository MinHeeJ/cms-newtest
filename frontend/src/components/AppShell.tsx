import { Archive, Home, Lightbulb, Plus, Tags } from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";

export function AppShell() {
  return (
    <div className="app-shell">
      <header className="global-header">
        <div className="header-inner">
          <div className="header-left">
            <NavLink to="/" className="brand-link" aria-label="Idea Notebook 홈">
              <span className="logo-tile">I</span>
              <span className="brand-text">IDEA NOTEBOOK</span>
            </NavLink>
            <nav className="desktop-nav" aria-label="주요 메뉴">
              <NavLink to="/ideas">목록</NavLink>
              <NavLink to="/archive">보관함</NavLink>
              <NavLink to="/tags">태그</NavLink>
            </nav>
          </div>
          <div className="header-actions">
            <NavLink to="/ideas" className="header-icon-button" aria-label="아이디어 목록">
              <Home size={18} />
            </NavLink>
            <NavLink to="/archive" className="header-icon-button" aria-label="보관함">
              <Archive size={18} />
            </NavLink>
            <NavLink to="/tags" className="header-icon-button" aria-label="태그 관리">
              <Tags size={18} />
            </NavLink>
            <NavLink to="/ideas/new" className="btn btn-primary header-cta">
              <Plus size={18} />
              <span>새 아이디어</span>
            </NavLink>
          </div>
        </div>
      </header>
      <main className="main-shell">
        <Outlet />
      </main>
      <Lightbulb className="print-only" aria-hidden="true" />
    </div>
  );
}
