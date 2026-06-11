import { LogOut, Search, Shield } from "lucide-react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { Button } from "../../ui-components/button";
import { useAuthStore } from "../../stores/auth-store";

export function PortalLayout() {
  const navigate = useNavigate();
  const { profile, logout } = useAuthStore();

  return (
    <div className="min-h-screen">
      <header className="border-b border-[var(--border)] bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3">
          <NavLink to="/portal" className="text-lg font-black text-[var(--primary-strong)]">
            CMS 포털
          </NavLink>
          <div className="flex items-center gap-2">
            {profile?.adminAccess ? (
              <Button size="sm" variant="secondary" onClick={() => navigate("/admin")}>
                <Shield size={16} /> 관리자
              </Button>
            ) : null}
            <span className="hidden text-sm text-slate-600 sm:inline">{profile?.displayName}</span>
            <Button
              aria-label="로그아웃"
              size="icon"
              variant="ghost"
              onClick={() => {
                logout();
                navigate("/login");
              }}
            >
              <LogOut size={18} />
            </Button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-5">
        <div className="mb-4 flex items-center gap-2 text-sm text-slate-600">
          <Search size={16} /> 게시 문서를 폴더와 검색으로 탐색합니다.
        </div>
        <Outlet />
      </main>
    </div>
  );
}
