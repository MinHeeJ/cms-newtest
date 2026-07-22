import { useEffect, useMemo, useState } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import { client } from "../api";
import { useAuth } from "../auth/AuthContext";

function navClass({ isActive }: { isActive: boolean }) {
  return isActive ? "nav-link nav-link-active" : "nav-link";
}

function mobileNavClass({ isActive }: { isActive: boolean }) {
  return isActive ? "mobile-link mobile-link-active" : "mobile-link";
}

export function AppLayout() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    if (!user) {
      setUnread(0);
      return;
    }
    client
      .notifications()
      .then((page) => setUnread(page.unread_count || 0))
      .catch(() => setUnread(0));
  }, [user]);

  const links = useMemo(
    () => [
      { to: "/", label: "홈", public: true },
      { to: "/notices", label: "공지사항", public: true },
      { to: "/notifications", label: "알림", auth: true, badge: unread },
      { to: "/mypage", label: "내 정보", auth: true },
      { to: "/admin/notices", label: "공지 관리", admin: true },
      { to: "/admin/users", label: "사용자 관리", admin: true },
    ],
    [unread],
  );

  const visibleLinks = links.filter((link) => {
    if (link.admin) return user?.role === "ADMIN";
    if (link.auth) return !!user;
    return true;
  });

  return (
    <div className="min-h-screen bg-white font-sans text-[#222222] tracking-[-0.02em]">
      <header className="fixed left-0 top-0 z-[100] h-[67px] w-full border-b border-[#E6E2E0] bg-white lg:h-[100px]">
        <div className="mx-auto flex h-full max-w-[1000px] items-center justify-between px-[27px] lg:px-0">
          <Link
            to="/"
            className="text-xl font-bold transition-opacity duration-200 hover:opacity-80"
            onClick={() => setOpen(false)}
          >
            <span className="text-[#4BC8C4]">Notice</span>Board
          </Link>
          <nav className="hidden items-center gap-6 lg:flex">
            {visibleLinks.map((link) => (
              <NavLink
                className={navClass}
                end={link.to === "/"}
                key={link.to}
                to={link.to}
              >
                {link.label}
                {!!link.badge && link.badge > 0 && (
                  <span className="badge ml-2">{link.badge}</span>
                )}
              </NavLink>
            ))}
            {user ? (
              <button className="btn-secondary-sm" onClick={logout}>
                로그아웃
              </button>
            ) : (
              <>
                <NavLink to="/login" className="btn-secondary-sm">
                  Login
                </NavLink>
                <NavLink to="/signup" className="btn-primary-sm">
                  회원가입
                </NavLink>
              </>
            )}
          </nav>
          <button
            className="flex h-[67px] w-[67px] items-center justify-center text-2xl text-[#222222] transition-colors duration-200 hover:text-[#4BC8C4] lg:hidden"
            aria-label="menu"
            onClick={() => setOpen((value) => !value)}
          >
            {open ? "×" : "☰"}
          </button>
        </div>
        <div
          className={`fixed top-0 z-[102] h-screen w-[78.125%] bg-[#141414] pt-[88px] transition-all duration-200 ease-in lg:hidden ${open ? "left-[21.875%] opacity-100" : "left-full opacity-0"}`}
        >
          <div className="flex flex-col px-[21px] text-white">
            {visibleLinks.map((link) => (
              <NavLink
                className={mobileNavClass}
                end={link.to === "/"}
                key={link.to}
                onClick={() => setOpen(false)}
                to={link.to}
              >
                <span>{link.label}</span>
                {!!link.badge && link.badge > 0 && (
                  <span className="badge">{link.badge}</span>
                )}
              </NavLink>
            ))}
            {user ? (
              <button onClick={logout} className="mobile-link text-left">
                로그아웃
              </button>
            ) : (
              <>
                <NavLink
                  to="/login"
                  onClick={() => setOpen(false)}
                  className={mobileNavClass}
                >
                  Login
                </NavLink>
                <NavLink
                  to="/signup"
                  onClick={() => setOpen(false)}
                  className={mobileNavClass}
                >
                  회원가입
                </NavLink>
              </>
            )}
          </div>
        </div>
      </header>
      <main className="pt-[67px] lg:pt-[100px]">
        <Outlet />
      </main>
      <aside className="fixed bottom-[43px] right-[13px] z-[98] hidden w-[73px] rounded-[24px] bg-white p-2 text-center shadow-[0_24px_108px_0_rgba(0,0,0,0.12)] lg:block lg:right-10 lg:w-[116px]">
        <Link
          to="/notices"
          className="block rounded-[18px] bg-[#4BC8C4] px-3 py-4 text-sm font-bold text-white transition-colors duration-200 hover:bg-[#0AA49F]"
        >
          공지
          <br />
          바로가기
        </Link>
      </aside>
      <footer className="bg-[#141414] text-white">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-3 px-[27px] py-10 lg:py-16">
          <strong className="font-['Gowun_Batang'] text-xl font-bold">
            커뮤니티 <span className="text-[#4BC8C4]">공지사항</span>
          </strong>
          <p className="max-w-[720px] text-[#AAAAAA]">
            © 2026 NoticeBoard. 상용 수준 공지와 댓글 커뮤니케이션을 위한 공지
            관리 서비스입니다.
          </p>
        </div>
      </footer>
    </div>
  );
}
