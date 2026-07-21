import { ReactNode } from "react";
import { Link, NavLink } from "react-router-dom";

const navGroups = [
  {
    title: "Portal",
    items: [
      { label: "포털 홈", to: "/" },
      { label: "검색", to: "/search" },
    ],
  },
  {
    title: "Admin",
    items: [
      { label: "Dashboard", to: "/admin" },
      { label: "폴더", to: "/admin/folders" },
      { label: "문서", to: "/admin/documents" },
      { label: "감사", to: "/admin/operations" },
      { label: "백업", to: "/admin/backups" },
      { label: "이관", to: "/admin/migrations" },
    ],
  },
  {
    title: "Project",
    items: [
      { label: "일정", to: "/admin/project" },
      { label: "범위", to: "/admin/project/scope" },
      { label: "인력", to: "/admin/project/staff" },
      { label: "위험", to: "/admin/project/risks" },
      { label: "산출물", to: "/admin/project/deliverables" },
      { label: "변경", to: "/admin/project/changes" },
    ],
  },
];

export function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-[100dvh] w-full bg-background pt-[70px] text-foreground">
      <nav className="fixed left-0 top-0 z-20 mx-auto flex h-[70px] w-full items-center border-b-4 border-border bg-secondary-background px-5">
        <div className="mx-auto flex w-[1300px] max-w-full items-center justify-between text-foreground">
          <div className="flex items-center gap-10 xl:gap-10">
            <Link
              to="/"
              className="flex size-8 items-center justify-center rounded-base border-2 border-black bg-main font-heading text-[22px] text-main-foreground transition-all hover:translate-x-[4px] hover:translate-y-[4px]"
            >
              C
            </Link>
            <div className="hidden items-center gap-10 text-base font-base lg:flex xl:gap-10">
              <Link className="hover:underline" to="/">
                Portal
              </Link>
              <Link className="hover:underline" to="/admin">
                Admin
              </Link>
              <Link className="hover:underline" to="/search">
                Search
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link
              className="relative flex h-9 shrink-0 items-center rounded-base border-2 border-border bg-secondary-background px-3 pr-12 text-base shadow-nav transition-all hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-none xl:pr-16"
              to="/search"
            >
              검색
              <span className="absolute right-2 top-1 flex h-6 items-center justify-center rounded-base border border-black bg-main px-1 text-xs text-black">
                /
              </span>
            </Link>
            <span className="hidden rounded-base border-2 border-border bg-secondary-background px-3 py-1 font-heading shadow-nav sm:inline-flex">
              CMS 운영
            </span>
          </div>
        </div>
      </nav>
      <aside className="fixed top-[70px] hidden h-[calc(100svh-70px)] max-h-[calc(100svh-70px)] w-[250px] overflow-y-auto border-r-4 border-border bg-secondary-background lg:block">
        {navGroups.map((group) => (
          <div key={group.title}>
            <div className="block border-b-4 border-r-4 border-border p-4 font-heading text-xl">
              {group.title}
            </div>
            {group.items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end
                className={({ isActive }) =>
                  `block border-b-4 border-r-4 border-border p-4 pl-7 text-lg font-base transition-colors hover:bg-main/70 hover:text-main-foreground ${
                    isActive
                      ? "bg-main text-main-foreground hover:bg-main"
                      : "text-foreground/90"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>
        ))}
      </aside>
      <main className="ml-0 mr-0 py-12 leading-relaxed sm:py-16 lg:ml-[250px] lg:py-20 xl:mr-[250px]">
        <div className="mx-auto w-full max-w-[650px] px-5 2xl:max-w-[750px]">
          {children}
        </div>
      </main>
      <aside className="fixed right-0 top-[70px] hidden h-[calc(100svh-70px)] w-[250px] flex-col justify-between overflow-y-auto border-l-4 border-border bg-secondary-background xl:flex">
        <div className="p-4">
          <p className="font-heading">UI States</p>
          <ul className="mt-3 space-y-2 text-sm font-base">
            <li className="rounded-base border-2 border-border bg-main px-2 py-1">
              loading
            </li>
            <li className="rounded-base border-2 border-border bg-secondary-background px-2 py-1">
              empty
            </li>
            <li className="rounded-base border-2 border-border bg-secondary-background px-2 py-1">
              error
            </li>
            <li className="rounded-base border-2 border-border bg-secondary-background px-2 py-1">
              permission
            </li>
            <li className="rounded-base border-2 border-border bg-secondary-background px-2 py-1">
              success
            </li>
          </ul>
        </div>
      </aside>
    </div>
  );
}
