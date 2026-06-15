"use client";

import { AlertTriangle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DashboardError({ reset }: { reset: () => void }) {
  return (
    <div className="h-full overflow-y-auto p-6 custom-scrollbar">
      <div className="rounded-lg border border-red-200 bg-red-50 p-6">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-red-600 ring-1 ring-red-200">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-lg font-semibold text-red-950">Dashboard content could not load</h1>
            <p className="mt-1 text-sm leading-relaxed text-red-800">
              Refresh the view. If the issue continues, check the API or database connection for the CMS site creation workspace.
            </p>
            <Button className="mt-4" onClick={reset} size="sm" type="button" variant="secondary">
              <RotateCcw className="mr-2 h-4 w-4" />
              Try again
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
