import type { GenerationJob } from "@/lib/site-creation/types";
import { SiteCreationError } from "@/server/api/response";
import { recordAuditEvent } from "@/server/audit/audit-log";
import { recordSiteCreationMetric } from "./metrics";
import { getDomainCatalog } from "./domain-catalog";
import { mapDomainToDocumentBundle } from "./document-bundle-mapper";
import {
  requireSiteDraft,
  saveGenerationJob,
  updateSiteDraftRecord
} from "./site-draft-repository";
import { validateSiteDraft } from "./validate-site-draft";

export async function generateDocuments(draftId: string, actorId = "preview-operator") {
  const validation = await validateSiteDraft(draftId, actorId);
  if (validation.outcome === "blocked") {
    throw new SiteCreationError(
      409,
      "HANDOFF_BLOCKED",
      "Document generation is blocked until dependency validation issues are resolved."
    );
  }

  const draft = await requireSiteDraft(draftId);
  const now = new Date().toISOString();
  const job: GenerationJob = {
    id: crypto.randomUUID(),
    draft_id: draft.id,
    status: "running",
    progress: 25,
    requested_at: now,
    requested_by: actorId
  };
  await saveGenerationJob(job);
  await recordAuditEvent({
    draft_id: draft.id,
    actor_id: actorId,
    event_type: "generation_started",
    event_payload: {
      job_id: job.id,
      effective_domains: draft.effective_domains
    }
  });

  const catalogByCode = new Map(getDomainCatalog().map((domain) => [domain.domain_code, domain]));
  const bundles = draft.effective_domains.map((domainCode) => {
    const domain = catalogByCode.get(domainCode);
    if (!domain) {
      throw new SiteCreationError(400, "MISSING_DOMAIN", `Domain ${domainCode} is not defined.`);
    }
    return mapDomainToDocumentBundle(draft, domain, job.id);
  });

  await updateSiteDraftRecord(draft.id, (current) => ({
    ...current,
    status: "generated",
    document_bundles: bundles,
    updated_at: new Date().toISOString()
  }));

  const completedJob: GenerationJob = {
    ...job,
    status: "succeeded",
    progress: 100,
    finished_at: new Date().toISOString()
  };
  await saveGenerationJob(completedJob);
  recordSiteCreationMetric("site_creation.generated_bundles", bundles.length, {
    draft_id: draft.id
  });
  await recordAuditEvent({
    draft_id: draft.id,
    actor_id: actorId,
    event_type: "generation_completed",
    event_payload: {
      job_id: job.id,
      bundle_count: bundles.length
    }
  });

  return completedJob;
}
