import { AlertTriangle, Loader2, PlayCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { CmsSiteDraft, GenerationJob } from "@/lib/site-creation/types";

export function GenerationProgressPanel({
  job,
  draft
}: {
  job?: GenerationJob;
  draft: CmsSiteDraft;
}) {
  const progress = job?.progress ?? (draft.status === "generated" ? 100 : 0);
  const status = job?.status ?? draft.status;

  return (
    <div className="rounded-lg border border-stone-200 bg-white">
      <div className="p-6 border-b border-stone-200">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-lg mr-3 bg-green-100 text-green-600 flex items-center justify-center">
              {status === "running" ? <Loader2 className="h-4 w-4 animate-spin" /> : <PlayCircle className="h-4 w-4" />}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-stone-900">Document Generation</h2>
              <p className="text-sm text-stone-600 mt-1">Domain bundle progress and artifact readiness.</p>
            </div>
          </div>
          <Badge variant={status === "failed" || status === "blocked" ? "danger" : status === "generated" || status === "succeeded" ? "success" : status === "running" || status === "generating" ? "info" : "neutral"}>{status}</Badge>
        </div>
      </div>
      <div className="p-6 space-y-4">
        {status === "failed" ? (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 flex items-start">
            <AlertTriangle className="mr-2 mt-0.5 h-4 w-4 shrink-0" />
            Generation failed for at least one bundle. Successful bundles remain visible below; retry generation after reviewing failed domains.
          </div>
        ) : null}
        <Progress value={progress} className="h-2" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {draft.effective_domains.length === 0 ? (
            <div className="md:col-span-2 rounded-lg border border-dashed border-stone-300 bg-stone-50 px-6 py-8 text-center text-sm text-stone-600">
              No effective domains have been resolved yet.
            </div>
          ) : null}
          {draft.effective_domains.map((domainCode) => {
            const bundle = draft.document_bundles.find((item) => item.domain_code === domainCode);
            return (
              <div className="flex items-center justify-between rounded-lg border border-stone-200 px-3 py-2" key={domainCode}>
                <span className="text-sm text-stone-900 truncate">{domainCode}</span>
                <Badge variant={bundle?.status === "generated" ? "success" : "neutral"}>{bundle?.status ?? "pending"}</Badge>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
