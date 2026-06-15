import type { DashboardSummary, SiteDraftSummary } from "@/lib/site-creation/types";
import { listSiteDrafts } from "./site-draft-repository";

export async function getDashboardSummary(limit = 25): Promise<DashboardSummary> {
  const drafts = await listSiteDrafts({ limit: 100 });
  const recent = drafts.slice(0, limit).map(toSummary);
  const totalDomains = drafts.reduce((sum, draft) => sum + draft.effective_domains.length, 0);

  return {
    total_drafts: drafts.length,
    generated_drafts: drafts.filter((draft) => draft.status === "generated").length,
    blocked_drafts: drafts.filter(
      (draft) => draft.status === "blocked" || draft.latest_validation?.outcome === "blocked"
    ).length,
    average_domains_per_draft: drafts.length === 0 ? 0 : Number((totalDomains / drafts.length).toFixed(1)),
    recent_drafts: recent,
    blockers: drafts.flatMap((draft) =>
      (draft.latest_validation?.issues ?? [])
        .filter((issue) => issue.severity === "blocker")
        .map((issue) => ({
          draft_id: draft.id,
          site_name: draft.site_name,
          issue
        }))
    )
  };
}

export function toSummary(draft: {
  id: string;
  site_name: string;
  site_slug: string;
  status: SiteDraftSummary["status"];
  effective_domains: string[];
  latest_validation?: { outcome: SiteDraftSummary["validation_outcome"]; issues: { severity: string }[] };
  updated_at: string;
}): SiteDraftSummary {
  return {
    id: draft.id,
    site_name: draft.site_name,
    site_slug: draft.site_slug,
    status: draft.status,
    effective_domain_count: draft.effective_domains.length,
    validation_outcome: draft.latest_validation?.outcome,
    blocker_count:
      draft.latest_validation?.issues.filter((issue) => issue.severity === "blocker").length ?? 0,
    updated_at: draft.updated_at
  };
}
