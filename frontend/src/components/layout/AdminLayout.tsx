import { FileText, FolderTree, Home, LogOut } from "lucide-react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { Button } from "../../ui-components/button";
import { useAuthStore } from "../../stores/auth-store";
import { cn } from "../../lib/utils";

const linkClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold",
    isActive ? "bg-[var(--primary)] text-white" : "text-slate-700 hover:bg-[var(--panel-muted)]"
  );

export function AdminLayout() {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);

  return (
    <div className="grid min-h-screen md:grid-cols-[240px_1fr]">
      <aside className="border-r border-[var(--border)] bg-white p-4">
        <div className="mb-5 text-lg font-black text-[var(--primary-strong)]">CMS 관리자</div>
        <nav className="grid gap-1">
          <NavLink className={linkClass} end to="/admin">
            <Home size={17} /> 대시보드
          </NavLink>
          <NavLink className={linkClass} to="/admin/folders">
            <FolderTree size={17} /> 폴더 관리
          </NavLink>
          <NavLink className={linkClass} to="/admin/articles">
            <FileText size={17} /> 문서 관리
          </NavLink>
        </nav>
        <div className="mt-5 flex gap-2">
          <Button variant="secondary" size="sm" onClick={() => navigate("/portal")}>
            포털
          </Button>
          <Button
            aria-label="로그아웃"
            variant="ghost"
            size="icon"
            onClick={() => {
              logout();
              navigate("/login");
            }}
          >
            <LogOut size={18} />
          </Button>
        </div>
      </aside>
      <main className="min-w-0 p-4 md:p-6">
        <Outlet />
      </main>
    </div>
  );
}
