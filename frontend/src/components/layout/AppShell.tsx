import {
  Bell,
  BookOpenText,
  Boxes,
  ChevronDown,
  FileClock,
  Files,
  Gauge,
  Image,
  LayoutList,
  Menu,
  Moon,
  Network,
  Search,
  Settings,
  ShieldCheck,
  LogIn,
  Sun,
  Tags,
  UserCog,
  X
} from "lucide-react";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { NavLink } from "react-router-dom";
import { navigationGroups } from "../../app/routes";
import { useAuth } from "../../features/auth/AuthContext";
import cmsLogo from "../../assets/cms-logo.svg";

const iconMap = {
  dashboard: Gauge,
  content: Files,
  editor: BookOpenText,
  review: ShieldCheck,
  revision: FileClock,
  media: Image,
  taxonomy: Tags,
  navigation: Network,
  users: UserCog,
  audit: LayoutList,
  settings: Settings,
  boxes: Boxes
};

export function AppShell({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { logout, user } = useAuth();

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const sidebar = useMemo(() => <Sidebar onNavigate={() => setMobileOpen(false)} />, []);

  return (
    <div className="flex min-h-screen w-full bg-white dark:bg-dark">
      <div className="hidden xl:block">{sidebar}</div>
      {mobileOpen ? (
        <div className="fixed inset-0 z-40 xl:hidden">
          <button className="absolute inset-0 bg-slate-900/40" type="button" aria-label="메뉴 닫기" onClick={() => setMobileOpen(false)} />
          <div className="relative h-full w-[270px] bg-sidebar p-0 dark:bg-dark">
            <button className="absolute right-3 top-3 h-9 w-9 rounded-full hover:bg-lightprimary hover:text-primary" type="button" aria-label="닫기" onClick={() => setMobileOpen(false)}>
              <X className="mx-auto h-5 w-5" aria-hidden="true" />
            </button>
            {sidebar}
          </div>
        </div>
      ) : null}
      <div className="page-wrapper flex w-full">
        <div className="body-wrapper w-full bg-white dark:bg-dark">
          <header className={`sticky top-0 z-[2] ${scrolled ? "bg-white shadow-md dark:bg-dark" : "bg-transparent"}`}>
            <nav className="flex !max-w-full items-center justify-between rounded-none bg-transparent px-6 py-4 dark:bg-transparent">
              <button className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-lightprimary hover:text-primary xl:hidden" type="button" aria-label="메뉴 열기" onClick={() => setMobileOpen(true)}>
                <Menu className="h-5 w-5" aria-hidden="true" />
              </button>
              <div className="hidden items-center gap-2 xl:flex">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                  <input className="form-control form-control-with-leading-icon w-96" placeholder="콘텐츠 검색..." type="search" />
                </div>
              </div>
              <NavLink className="block xl:hidden" to="/" aria-label="CMS 홈">
                <img className="h-9 w-auto" src={cmsLogo} alt="CMS" />
              </NavLink>
              <div className="flex items-center gap-2">
                <button className="group relative flex h-10 w-10 cursor-pointer items-center justify-center rounded-full text-foreground hover:text-primary dark:text-white/70" type="button" onClick={() => setDarkMode((value) => !value)} aria-label="테마 전환">
                  {darkMode ? <Sun className="h-5 w-5" aria-hidden="true" /> : <Moon className="h-5 w-5" aria-hidden="true" />}
                </button>
                <button className="relative flex h-10 w-10 items-center justify-center rounded-full hover:bg-lightprimary hover:text-primary" type="button" aria-label="알림">
                  <Bell className="h-5 w-5" aria-hidden="true" />
                  <span className="absolute -end-[6px] -top-[5px] flex h-2 w-2 rounded-full bg-primary" />
                </button>
                {user ? (
                  <button className="button-base h-9 rounded-full bg-lightprimary px-4 text-primary hover:bg-primary hover:text-white" type="button" onClick={() => void logout()}>
                    로그아웃
                  </button>
                ) : (
                  <NavLink className="button-base h-9 rounded-full bg-lightprimary px-4 text-primary hover:bg-primary hover:text-white" to="/login">
                    <LogIn className="h-4 w-4" aria-hidden="true" />
                    로그인
                  </NavLink>
                )}
                <button className="flex items-center gap-2 rounded-full px-2 py-1 hover:bg-lightprimary" type="button">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-semibold text-white">{user?.displayName?.slice(0, 1) ?? "방"}</span>
                  <span className="hidden text-sm font-medium text-foreground dark:text-white md:inline">{user?.displayName ?? "방문자"}</span>
                  <ChevronDown className="hidden h-4 w-4 text-muted-foreground md:block" aria-hidden="true" />
                </button>
              </div>
            </nav>
          </header>
          <div className="container mx-auto px-6 py-30">
            <main className="grow">{children}</main>
          </div>
        </div>
      </div>
    </div>
  );
}

function Sidebar({ onNavigate }: { onNavigate: () => void }) {
  return (
    <aside className="fixed left-0 top-0 z-10 h-screen w-[270px] border border-border bg-sidebar dark:border-[#333f55] dark:bg-dark">
      <div className="flex h-[74px] items-center overflow-hidden px-6">
        <NavLink className="block" to="/" onClick={onNavigate} aria-label="CMS 홈">
          <img className="h-10 w-auto" src={cmsLogo} alt="CMS" />
        </NavLink>
      </div>
      <div className="h-[calc(100vh-100px)] overflow-y-auto px-6 pb-6">
        {navigationGroups.map((group) => (
          <div key={group.label} className="mb-5">
            <p className="leading-21 text-xs font-bold uppercase text-sidebar-foreground dark:text-white/60">{group.label}</p>
            <div className="mt-2 space-y-0.5">
              {group.items.map((item) => {
                const Icon = iconMap[item.icon];
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={onNavigate}
                    className={({ isActive }) =>
                      `mt-0.5 flex w-full items-center justify-between rounded-md px-3 py-2 text-sm text-sidebar-foreground transition-colors hover:bg-lightprimary hover:text-primary dark:text-white/70 ${
                        isActive ? "bg-lightprimary text-primary" : ""
                      }`
                    }
                  >
                    <span className="flex min-w-0 items-center gap-3">
                      <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                      <span className="truncate">{item.label}</span>
                    </span>
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
        <div className="mt-9 flex w-full rounded-lg bg-lightprimary p-6">
          <div>
            <p className="text-base font-semibold text-sidebar-foreground dark:text-white">검토 대기 4건</p>
            <NavLink className="button-base mt-2 h-9 bg-primary px-3 text-[13px] text-white hover:bg-primaryemphasis" to="/review">
              열기
            </NavLink>
          </div>
        </div>
      </div>
    </aside>
  );
}
