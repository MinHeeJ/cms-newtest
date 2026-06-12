import { FileText, FolderTree, Home, LogOut, ShieldCheck } from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";
import { Button } from "../../ui-components/button";
import { useAuthStore } from "../../stores/auth-store";
import { cn } from "../../lib/utils";

const nav = [
  { to: "/admin", label: "대시보드", icon: Home },
  { to: "/admin/folders", label: "폴더", icon: FolderTree },
  { to: "/admin/articles", label: "문서", icon: FileText }
];

export function AdminLayout() {
  const logout = useAuthStore((state) => state.logout);
  const profile = useAuthStore((state) => state.profile);

  return (
    <div className="cms-shell cms-sidebar-shell">
      <aside className="cms-sidebar">
        <div className="border-b border-sidebar-border p-4">
          <div className="flex items-center gap-3 rounded-lg bg-sidebar-primary px-3 py-2 text-sidebar-primary-foreground shadow-sm">
            <div className="flex size-8 items-center justify-center rounded-md bg-white/15">
              <ShieldCheck className="size-4" />
            </div>
            <div className="grid leading-tight">
              <span className="truncate text-sm font-semibold">CMS Admin</span>
              <span className="truncate text-xs opacity-80">콘텐츠 운영</span>
            </div>
          </div>
        </div>
        <nav className="flex-1 space-y-1 p-3">
          <div className="px-2 py-2 text-xs font-medium text-muted-foreground">General</div>
          {nav.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                className={({ isActive }) =>
                  cn(
                    "flex h-9 items-center gap-2 rounded-md px-3 text-sm font-medium transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                    isActive && "bg-sidebar-accent text-sidebar-accent-foreground"
                  )
                }
                end={item.to === "/admin"}
                key={item.to}
                to={item.to}
              >
                <Icon className="size-4" />
                {item.label}
              </NavLink>
            );
          })}
        </nav>
      </aside>
      <div className="min-w-0">
        <header className="cms-topbar">
          <div>
            <p className="text-sm font-medium leading-none">관리자 콘솔</p>
            <p className="mt-1 text-xs text-muted-foreground">문서와 폴더를 관리합니다.</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-muted-foreground sm:inline">{profile?.displayName ?? "관리자"}</span>
            <Button aria-label="로그아웃" size="icon" type="button" variant="ghost" onClick={logout}>
              <LogOut className="size-4" />
            </Button>
          </div>
        </header>
        <main className="cms-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
