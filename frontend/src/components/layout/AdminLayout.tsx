import { FileText, FolderTree, Home, LogOut } from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";
import { Button } from "../../ui-components/button";
import { useAuthStore } from "../../stores/auth-store";

const nav = [
  { to: "/admin", label: "대시보드", icon: Home },
  { to: "/admin/folders", label: "폴더", icon: FolderTree },
  { to: "/admin/articles", label: "문서", icon: FileText }
];

export function AdminLayout() {
  const logout = useAuthStore((state) => state.logout);

  return (
    <div className="cms-shell">
      <header className="cms-topbar">
        <div className="flex flex-wrap items-center gap-2">
          {nav.map((item) => {
            const Icon = item.icon;
            return (
              <Button asChild key={item.to} size="sm" variant="secondary">
                <NavLink to={item.to}>
                  <Icon size={16} />
                  {item.label}
                </NavLink>
              </Button>
            );
          })}
        </div>
        <Button aria-label="로그아웃" size="icon" type="button" variant="ghost" onClick={logout}>
          <LogOut size={18} />
        </Button>
      </header>
      <main className="cms-main">
        <Outlet />
      </main>
    </div>
  );
}
