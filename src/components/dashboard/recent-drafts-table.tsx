import Link from "next/link";
import { FilePlus2, Layers3, MoreHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { SiteDraftSummary } from "@/lib/site-creation/types";
import { formatDateTime } from "@/lib/utils";

const statusLabels: Record<string, string> = {
  draft: "Draft",
  validating: "Validating",
  ready_to_generate: "Ready",
  generating: "Generating",
  generated: "Generated",
  blocked: "Blocked",
  archived: "Archived"
};

function statusVariant(status: string) {
  if (status === "generated") return "success";
  if (status === "blocked") return "danger";
  if (status === "generating" || status === "ready_to_generate") return "info";
  return "neutral";
}

function validationVariant(outcome?: string) {
  if (outcome === "passed") return "success";
  if (outcome === "passed_with_warnings") return "warning";
  if (outcome === "blocked") return "danger";
  return "neutral";
}

export function RecentDraftsTable({ drafts }: { drafts: SiteDraftSummary[] }) {
  if (drafts.length === 0) {
    return (
      <div className="p-6">
        <div className="rounded-lg border border-dashed border-stone-300 bg-stone-50 px-6 py-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-white text-stone-700 ring-1 ring-stone-200">
            <Layers3 className="h-5 w-5" />
          </div>
          <h3 className="text-sm font-semibold text-stone-900">No drafts yet</h3>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-stone-600">
            Create a CMS site draft to select domains, resolve dependencies, and generate planning documents.
          </p>
          <Button asChild className="mt-5" size="sm">
            <Link href="/site-creation">
              <FilePlus2 className="mr-2 h-4 w-4" />
              Create CMS Site
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-stone-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-normal text-stone-500 uppercase tracking-wider">Site</th>
            <th className="px-6 py-3 text-left text-xs font-normal text-stone-500 uppercase tracking-wider">Status</th>
            <th className="px-6 py-3 text-left text-xs font-normal text-stone-500 uppercase tracking-wider">Domains</th>
            <th className="px-6 py-3 text-left text-xs font-normal text-stone-500 uppercase tracking-wider">Validation</th>
            <th className="px-6 py-3 text-left text-xs font-normal text-stone-500 uppercase tracking-wider">Updated</th>
            <th className="px-6 py-3 text-right text-xs font-normal text-stone-500 uppercase tracking-wider">Action</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-stone-200">
          {drafts.map((draft) => (
            <tr className="transition-colors duration-200 hover:bg-stone-50" key={draft.id}>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-lg mr-3 bg-stone-900 text-white flex items-center justify-center text-sm font-bold">
                    {draft.site_name.slice(0, 1).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <Link className="text-sm font-normal text-stone-900 hover:underline" href={`/site-creation/${draft.id}`}>
                      {draft.site_name}
                    </Link>
                    <div className="text-sm text-stone-500 truncate">{draft.site_slug}</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <Badge variant={statusVariant(draft.status)}>{statusLabels[draft.status] ?? draft.status}</Badge>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <span className="text-sm text-stone-600 mr-2">{draft.effective_domain_count}</span>
                  <Progress value={Math.min(100, draft.effective_domain_count * 12)} className="w-32 h-2" />
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <Badge variant={validationVariant(draft.validation_outcome)}>
                  {draft.validation_outcome?.replaceAll("_", " ") ?? "not run"}
                </Badge>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-stone-500">
                {formatDateTime(draft.updated_at)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right">
                <Button asChild size="sm" variant="secondary">
                  <Link href={`/site-creation/${draft.id}`}>
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">Open draft</span>
                  </Link>
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
