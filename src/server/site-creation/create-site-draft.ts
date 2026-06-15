import { resolveDomainDependencies } from "@/lib/site-creation/dependency-resolver";
import type { CmsSiteDraft, CreateDraftRequest, UpdateDraftRequest } from "@/lib/site-creation/types";
import { slugifySiteName } from "@/lib/utils";
import { SiteCreationError } from "@/server/api/response";
import { recordAuditEvent } from "@/server/audit/audit-log";
import { getDomainCatalog } from "./domain-catalog";
import {
  ensureUniqueSlug,
  requireSiteDraft,
  saveSiteDraft,
  updateSiteDraftRecord
} from "./site-draft-repository";

export async function createSiteDraft(input: CreateDraftRequest, actorId = "preview-operator") {
  const baseSlug = input.site_slug ?? (slugifySiteName(input.site_name) || "cms-site");
  const siteSlug = await ensureUniqueSlug(baseSlug);
  const resolution = resolveDomainDependencies(input.selected_domains, getDomainCatalog());
  const blocker = resolution.issues.find((issue) => issue.severity === "blocker");

  if (blocker) {
    throw new SiteCreationError(400, blocker.code, blocker.message);
  }

  const now = new Date().toISOString();
  const draft: CmsSiteDraft = {
    id: crypto.randomUUID(),
    site_name: input.site_name.trim(),
    site_slug: siteSlug,
    description: emptyToUndefined(input.description),
    target_audience: emptyToUndefined(input.target_audience),
    status: "draft",
    selected_domains: resolution.selected_domains,
    auto_added_domains: resolution.auto_added_domains,
    effective_domains: resolution.effective_domains,
    generation_stages: resolution.generation_stages,
    document_bundles: [],
    created_by: actorId,
    created_at: now,
    updated_at: now
  };

  await saveSiteDraft(draft);
  await recordAuditEvent({
    draft_id: draft.id,
    actor_id: actorId,
    event_type: "draft_created",
    event_payload: {
      site_slug: draft.site_slug,
      selected_domains: draft.selected_domains,
      auto_added_domains: draft.auto_added_domains
    }
  });

  return draft;
}

export async function updateSiteDraft(
  draftId: string,
  input: UpdateDraftRequest,
  actorId = "preview-operator"
) {
  const current = await requireSiteDraft(draftId);
  const nextSlug = input.site_slug
    ? await ensureUniqueSlug(input.site_slug, draftId)
    : input.site_name
      ? await ensureUniqueSlug(slugifySiteName(input.site_name) || current.site_slug, draftId)
      : current.site_slug;
  const selectedDomains = input.selected_domains ?? current.selected_domains;
  const resolution = resolveDomainDependencies(selectedDomains, getDomainCatalog());
  const blocker = resolution.issues.find((issue) => issue.severity === "blocker");

  if (blocker) {
    throw new SiteCreationError(400, blocker.code, blocker.message);
  }

  const updated = await updateSiteDraftRecord(draftId, (draft) => ({
    ...draft,
    site_name: input.site_name?.trim() ?? draft.site_name,
    site_slug: nextSlug,
    description: input.description === undefined ? draft.description : emptyToUndefined(input.description),
    target_audience:
      input.target_audience === undefined ? draft.target_audience : emptyToUndefined(input.target_audience),
    selected_domains: resolution.selected_domains,
    auto_added_domains: resolution.auto_added_domains,
    effective_domains: resolution.effective_domains,
    generation_stages: resolution.generation_stages,
    document_bundles: draft.document_bundles.map((bundle) => ({
      ...bundle,
      status: bundle.status === "generated" ? "stale" : bundle.status
    })),
    status: draft.status === "generated" ? "draft" : draft.status,
    updated_at: new Date().toISOString()
  }));

  await recordAuditEvent({
    draft_id: updated.id,
    actor_id: actorId,
    event_type: "domains_changed",
    event_payload: {
      selected_domains: updated.selected_domains,
      auto_added_domains: updated.auto_added_domains
    }
  });

  return updated;
}

function emptyToUndefined(value?: string) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}
