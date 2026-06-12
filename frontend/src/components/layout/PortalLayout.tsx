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
        <Link className="flex items-center gap-3 font-semibold tracking-tight" to="/portal">
          <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
            <BookOpen className="size-5" />
          </span>
          <span className="grid leading-tight">
            <span>CMS 지식 포털</span>
            <span className="hidden text-xs font-normal text-muted-foreground sm:inline">게시 문서 검색 및 열람</span>
          </span>
        </Link>
        <nav className="flex items-center gap-2 sm:gap-3">
          {profile?.adminAccess ? (
            <Button asChild size="sm" variant="outline">
              <Link to="/admin">
                <Shield className="size-4" />
                관리자
              </Link>
            </Button>
          ) : null}
          <span className="hidden text-sm text-muted-foreground sm:inline">{profile?.displayName ?? "사용자"}</span>
          <Button aria-label="로그아웃" size="icon" type="button" variant="ghost" onClick={logout}>
            <LogOut className="size-4" />
          </Button>
        </nav>
      </header>
      <main className="cms-main">
        <Outlet />
      </main>
    </div>
  );
}
