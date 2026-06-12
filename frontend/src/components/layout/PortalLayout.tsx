import { BookOpen, LogOut, Shield } from "lucide-react";
import { Link, Outlet } from "react-router-dom";
import { Button } from "../../ui-components/button";
import { useAuthStore } from "../../stores/auth-store";

export function PortalLayout() {
  const profile = useAuthStore((state) => state.profile);
  const logout = useAuthStore((state) => state.logout);

  return (
    <div className="cms-shell">
      <header className="cms-topbar">
        <Link className="flex items-center gap-2 font-semibold" to="/portal">
          <BookOpen size={22} />
          <span>CMS 지식 포털</span>
        </Link>
        <nav className="flex flex-wrap items-center gap-2">
          {profile?.adminAccess ? (
            <Button asChild size="sm" variant="secondary">
              <Link to="/admin">
                <Shield size={16} />
                관리자
              </Link>
            </Button>
          ) : null}
          <span className="text-sm text-[var(--muted)]">{profile?.displayName ?? "사용자"}</span>
          <Button aria-label="로그아웃" size="icon" type="button" variant="ghost" onClick={logout}>
            <LogOut size={18} />
          </Button>
        </nav>
      </header>
      <main className="cms-main">
        <Outlet />
      </main>
    </div>
  );
}
