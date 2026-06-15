"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { Sidebar } from "./sidebar";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex h-screen bg-stone-50 grain-texture">
      {open ? (
        <button
          aria-label="Close navigation overlay"
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setOpen(false)}
          type="button"
        />
      ) : null}

      <div
        className={[
          "fixed lg:static inset-y-0 left-0 z-50 lg:z-10 transform transition-transform duration-300 ease-in-out",
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        ].join(" ")}
      >
        <Sidebar onClose={() => setOpen(false)} />
      </div>

      <main className="flex-1 overflow-y-auto p-3 lg:p-6 relative z-10 flex flex-col">
        <div className="lg:hidden mb-4">
          <button
            aria-label="Open navigation"
            className="p-2 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-md"
            onClick={() => setOpen(true)}
            type="button"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>

        <div className="flex-1 border border-stone-200 bg-white relative z-20 rounded-lg overflow-hidden">
          {children}
        </div>

        <footer className="py-4 mt-8 border-t border-stone-200">
          <div className="px-6 flex flex-col lg:flex-row items-center justify-between space-y-4 lg:space-y-0">
            <p className="text-xs text-stone-500">CMS Site Creation</p>
            <p className="text-xs text-stone-500">Validation-gated planning documents</p>
          </div>
        </footer>
      </main>
    </div>
  );
}
