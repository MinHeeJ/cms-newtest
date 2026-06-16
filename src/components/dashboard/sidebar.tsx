"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ClipboardCheck,
  FileClock,
  FilePlus2,
  Gauge,
  History,
  ListTree,
  Settings,
  ShieldCheck,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Dashboard", icon: Gauge },
  { href: "/site-creation", label: "Create CMS Site", icon: FilePlus2 },
  { href: "/drafts", label: "Drafts", icon: FileClock },
  { href: "/domain-catalog", label: "Domain Catalog", icon: ListTree },
  { href: "/validation-reports", label: "Validation Reports", icon: ClipboardCheck },
  { href: "/audit-log", label: "Audit Log", icon: History },
  { href: "/settings", label: "Settings", icon: Settings }
];

export function Sidebar({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();

  return (
    <aside className="w-60 bg-white lg:bg-transparent flex flex-col relative z-10 h-full border-r border-stone-200 lg:border-0">
      <div className="p-6 pb-0 relative z-10 flex items-center justify-between">
        <Link href="/" className="text-lg font-semibold text-stone-900">
          CMS Studio
        </Link>
        <button
          aria-label="Close navigation"
          className="lg:hidden p-1 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-md"
          onClick={onClose}
          type="button"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <nav className="flex-1 p-4 space-y-2 relative z-10">
        {navItems.map((item) => {
          const active =
            item.href === "/" ? pathname === "/" : pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center text-sm font-normal rounded-lg cursor-pointer px-3 py-2 border",
                active
                  ? "shadow-sm hover:shadow-md bg-gradient-to-b from-stone-700 to-stone-800 border-stone-900 text-stone-50 duration-300 ease-in"
                  : "text-stone-700 hover:bg-stone-100 transition-colors duration-200 border-transparent"
              )}
              onClick={onClose}
            >
              <Icon className="mr-3 h-4 w-4" />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}

        <div className="mt-auto pt-4 border-t border-stone-200">
          <div className="px-4 text-xs font-semibold text-stone-500 uppercase tracking-wide mb-2">
            Handoff
          </div>
          <Link
            href="/site-creation"
            className="flex items-center text-sm font-normal rounded-lg cursor-pointer px-3 py-2 text-stone-700 hover:bg-stone-100 transition-colors duration-200 border border-transparent"
            onClick={onClose}
          >
            <ShieldCheck className="mr-3 h-4 w-4" />
            Ready checks
          </Link>
        </div>
      </nav>

      <div className="p-4 pt-0">
        <Button asChild className="w-full">
          <Link href="/site-creation" onClick={onClose}>
            <FilePlus2 className="mr-2 h-4 w-4" />
            Create CMS Site
          </Link>
        </Button>
      </div>
    </aside>
  );
}
