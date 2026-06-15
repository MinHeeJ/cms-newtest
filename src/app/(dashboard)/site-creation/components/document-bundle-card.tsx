"use client";

import { useState } from "react";
import { AlertTriangle, CheckCircle2, Download, FileText, RotateCcw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { DocumentBundle } from "@/lib/site-creation/types";

function bundleVariant(status: DocumentBundle["status"]) {
  if (status === "generated" || status === "approved") return "success";
  if (status === "failed") return "danger";
  if (status === "stale") return "warning";
  return "neutral";
}

export function DocumentBundleCard({ bundle, onRetry }: { bundle: DocumentBundle; onRetry?: () => void }) {
  const [activeFilename, setActiveFilename] = useState(bundle.artifacts[0]?.filename ?? "spec.md");
  const activeArtifact = bundle.artifacts.find((artifact) => artifact.filename === activeFilename) ?? bundle.artifacts[0];

  return (
    <div className="rounded-lg border border-stone-200 bg-white">
      <div className="p-6 border-b border-stone-200 flex items-start justify-between gap-4">
        <div className="flex items-center min-w-0">
          <div className="w-8 h-8 rounded-lg mr-3 bg-stone-900 text-white flex items-center justify-center shrink-0">
            <FileText className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <h3 className="text-lg font-semibold text-stone-900 truncate">{bundle.domain_code}</h3>
            <p className="text-sm text-stone-600 mt-1">English draft bundle</p>
          </div>
        </div>
        <Badge variant={bundleVariant(bundle.status)}>{bundle.status}</Badge>
      </div>

      <div className="p-6">
        <div className="flex flex-wrap gap-2 mb-4" role="tablist" aria-label={`${bundle.domain_code} documents`}>
          {bundle.artifacts.map((artifact) => (
            <button
              aria-selected={activeFilename === artifact.filename}
              className={[
                "h-9 rounded-md px-3 text-sm border transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                activeFilename === artifact.filename
                  ? "bg-stone-900 text-white border-stone-900"
                  : "bg-white text-stone-700 border-stone-300 hover:bg-stone-50"
              ].join(" ")}
              key={artifact.filename}
              onClick={() => setActiveFilename(artifact.filename)}
              role="tab"
              type="button"
            >
              {artifact.filename}
            </button>
          ))}
        </div>

        {bundle.status === "failed" ? (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 flex items-start">
            <AlertTriangle className="mr-2 mt-0.5 h-4 w-4 shrink-0" />
            {bundle.failure_reason ?? "This bundle failed. Retry document generation after resolving the issue."}
          </div>
        ) : null}

        <pre className="max-h-80 overflow-auto custom-scrollbar rounded-lg border border-stone-200 bg-stone-50 p-4 text-xs leading-relaxed text-stone-700 whitespace-pre-wrap">
          {activeArtifact?.content ?? "No artifact content available."}
        </pre>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 rounded-lg border border-stone-200 bg-stone-50 p-4">
          <div className="flex items-center text-sm text-stone-700">
            <CheckCircle2 className="mr-2 h-4 w-4 text-green-600" />
            English prose {bundle.language === "English" || bundle.status === "generated" || bundle.status === "approved" ? "ready" : "pending"}
          </div>
          <div className="flex items-center text-sm text-stone-700">
            <CheckCircle2 className="mr-2 h-4 w-4 text-green-600" />
            Identifiers preserved across spec, plan, tasks
          </div>
        </div>

        <div className="mt-4 flex flex-col sm:flex-row sm:justify-end gap-3">
          {bundle.status === "failed" ? (
            <Button disabled={!onRetry} onClick={onRetry} size="sm" variant="secondary" type="button">
              <RotateCcw className="mr-2 h-4 w-4" />
              Retry bundle
            </Button>
          ) : null}
          <Button asChild size="sm" variant="secondary">
            <a href={activeArtifact?.url ?? "#"}>
              <Download className="mr-2 h-4 w-4" />
              Download
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}
