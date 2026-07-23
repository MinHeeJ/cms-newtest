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
  LogIn,
  Menu,
  Network,
  Search,
  Settings,
  ShieldCheck,
  Tags,
  UserCog,
  X,
} from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";
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
  boxes: Boxes,
};

export function AppShell({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { logout, user } = useAuth();

  const sidebar = useMemo(
    () => <Sidebar onNavigate={() => setMobileOpen(false)} />,
    [],
  );

  return (
    <div className="min-h-screen w-full bg-white text-[#333638]">
      <div className="hidden xl:block">{sidebar}</div>
      {mobileOpen ? (
        <div className="fixed inset-0 z-[1200] xl:hidden">
          <button
            className="absolute inset-0 bg-zinc-900/40"
            type="button"
            aria-label="메뉴 닫기"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative h-full w-[17em] border-r border-zinc-200 bg-white transition-[width,max-width] duration-[250ms] ease-in-out">
            <button
              className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded hover:bg-[#f1ecff] hover:text-violet-600"
              type="button"
              aria-label="닫기"
              onClick={() => setMobileOpen(false)}
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
            {sidebar}
          </div>
        </div>
      ) : null}
      <div className="page-wrapper min-h-screen">
        <header className="sticky top-0 z-[1000] w-full bg-white shadow-sm">
          <nav className="mx-auto flex h-[3.66em] w-full max-w-[1110px] items-center px-[0.67em] sm:h-16">
            <button
              className="mr-2 flex h-[2.2857em] w-[2.2857em] items-center justify-center rounded p-[0.2143em] transition-colors duration-150 hover:bg-[#f1ecff] hover:text-violet-600 xl:hidden"
              type="button"
              aria-label="메뉴 열기"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="h-5 w-5" aria-hidden="true" />
            </button>
            <NavLink
              className="flex h-full min-w-[2.4em] items-center overflow-hidden xl:hidden"
              to="/"
              aria-label="교수수업평가시스템 홈"
            >
              <img
                className="h-[2.4em] w-auto object-contain"
                src={cmsLogo}
                alt="CMS"
              />
            </NavLink>
            <div className="ml-auto hidden items-center gap-2 xl:flex">
              <div className="relative">
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500"
                  aria-hidden="true"
                />
                <input
                  className="form-control form-control-with-leading-icon w-80"
                  placeholder="업무 운영 검색..."
                  type="search"
                />
              </div>
            </div>
            <div className="ml-auto flex items-center gap-1 xl:ml-2">
              <button
                className="relative flex h-[2.2857em] w-[2.2857em] items-center justify-center rounded p-[0.2143em] text-zinc-600 transition-colors duration-150 hover:bg-[#f1ecff] hover:text-violet-600"
                type="button"
                aria-label="알림"
              >
                <Bell className="h-5 w-5" aria-hidden="true" />
                <span className="absolute right-1 top-1 flex h-2 w-2 rounded-full bg-violet-600" />
              </button>
              {user ? (
                <button
                  className="inline-flex h-9 items-center justify-center gap-1 rounded bg-zinc-200 px-3 py-2 text-base leading-5 text-zinc-800 transition-colors duration-150 hover:bg-zinc-500 hover:text-white"
                  type="button"
                  onClick={() => void logout()}
                >
                  로그아웃
                </button>
              ) : (
                <NavLink
                  className="inline-flex h-9 items-center justify-center gap-1 rounded bg-violet-600 px-3 py-2 text-base leading-5 text-white transition-colors duration-150 hover:bg-violet-700"
                  to="/login"
                >
                  <LogIn className="h-4 w-4" aria-hidden="true" />
                  로그인
                </NavLink>
              )}
              <button
                className="hidden items-center gap-2 rounded px-2 py-1 transition-colors duration-150 hover:bg-[#f1ecff] md:flex"
                type="button"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-600 text-sm font-semibold text-white">
                  {user?.displayName?.slice(0, 1) ?? "방"}
                </span>
                <span className="text-sm font-medium text-zinc-700">
                  {user?.displayName ?? "방문자"}
                </span>
                <ChevronDown
                  className="h-4 w-4 text-zinc-500"
                  aria-hidden="true"
                />
              </button>
            </div>
          </nav>
        </header>
        <div className="mx-auto w-full max-w-[1110px] px-[0.67em] pb-0 pt-6">
          <main className="grow">{children}</main>
        </div>
      </div>
    </div>
  );
}

function Sidebar({ onNavigate }: { onNavigate: () => void }) {
  return (
    <aside className="fixed left-0 top-0 z-10 h-screen w-[17em] border-r border-zinc-200 bg-white transition-[width,max-width] duration-[250ms] ease-in-out">
      <div className="flex h-16 items-center overflow-hidden border-b border-zinc-200 px-5">
        <NavLink
          className="block"
          to="/"
          onClick={onNavigate}
          aria-label="교수수업평가시스템 홈"
        >
          <img className="h-10 w-auto" src={cmsLogo} alt="CMS" />
        </NavLink>
      </div>
      <div className="h-[calc(100vh-4rem)] overflow-y-auto px-3 py-4">
        {navigationGroups.map((group) => (
          <div key={group.label} className="mb-5">
            <p className="px-2 text-xs font-bold uppercase tracking-wide text-zinc-500">
              {group.label}
            </p>
            <div className="mt-2 space-y-0.5">
              {group.items.map((item) => {
                const Icon = iconMap[item.icon];
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={onNavigate}
                    className={({ isActive }) =>
                      `flex h-[2.35em] w-full items-center justify-between rounded px-3 text-sm text-zinc-700 transition-colors duration-150 hover:bg-[#f1ecff] hover:text-violet-600 focus:outline focus:outline-2 focus:outline-violet-600 focus:outline-offset-2 ${
                        isActive
                          ? "bg-[#d1f0ff] font-semibold text-zinc-800"
                          : ""
                      }`
                    }
                  >
                    <span className="flex min-w-0 items-center gap-2">
                      <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                      <span className="truncate">{item.label}</span>
                    </span>
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
        <div className="mt-8 border-l-[5px] border-violet-300 bg-zinc-50 p-3 text-sm text-zinc-700">
          <p className="font-semibold">운영 대기</p>
          <p className="mt-1 text-zinc-500">
            배치 실행 후 결과와 오류 상세를 확인하세요.
          </p>
          <NavLink
            className="mt-3 inline-flex rounded bg-violet-600 px-3 py-2 text-sm text-white transition-colors duration-150 hover:bg-violet-700"
            to="/operations/batch-results"
            onClick={onNavigate}
          >
            결과 조회
          </NavLink>
        </div>
      </div>
    </aside>
  );
}
