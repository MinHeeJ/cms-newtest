import { findGenerationOrderIssues } from "@/lib/site-creation/dependency-resolver";
import { requiredDocumentFilenames } from "@/lib/site-creation/document-templates";
import type { ValidationIssue, ValidationReport } from "@/lib/site-creation/types";
import { sortValidationIssues, validationOutcomeForIssues } from "@/lib/site-creation/validation-issues";
import { recordAuditEvent } from "@/server/audit/audit-log";
import { getDomainCatalog } from "./domain-catalog";
import { requireSiteDraft, updateSiteDraftRecord } from "./site-draft-repository";

export async function validateSiteDraft(draftId: string, actorId = "preview-operator") {
  const draft = await requireSiteDraft(draftId);
  const issues: ValidationIssue[] = [];

  if (draft.effective_domains.length === 0) {
    issues.push({
      severity: "blocker",
      code: "MISSING_DOMAIN",
      message: "At least one effective domain is required before document generation.",
      suggested_action: "Select at least one CMS domain on the Create CMS Site screen."
    });
  }

  issues.push(...findGenerationOrderIssues(draft.generation_stages, getDomainCatalog()));

  for (const bundle of draft.document_bundles) {
    const filenames = new Set(bundle.artifacts.map((artifact) => artifact.filename));
    const missing = requiredDocumentFilenames().filter((filename) => !filenames.has(filename));
    if (missing.length > 0) {
      issues.push({
        severity: "blocker",
        code: "MISSING_DOMAIN",
        domain_code: bundle.domain_code,
        message: `Document bundle for ${bundle.domain_code} is missing ${missing.join(", ")}.`,
        suggested_action: "Regenerate documents for this domain bundle."
      });
    }

    if (bundle.status === "stale") {
      issues.push({
        severity: "warning",
        code: "STALE_DOCUMENT_BUNDLE",
        domain_code: bundle.domain_code,
        message: `Document bundle for ${bundle.domain_code} is stale after domain changes.`,
        suggested_action: "Regenerate the stale bundle before final handoff."
      });
    }

    const containsNonEnglishMarker = bundle.artifacts.some((artifact) =>
      /[가-힣]/.test(artifact.content ?? "")
    );
    if (containsNonEnglishMarker) {
      issues.push({
        severity: "warning",
        code: "NON_ENGLISH_PROSE",
        domain_code: bundle.domain_code,
        message: `Document bundle for ${bundle.domain_code} may contain non-English prose.`,
        suggested_action: "Review generated prose while preserving identifiers."
      });
    }
  }

  const sortedIssues = sortValidationIssues(issues);
  const report: ValidationReport = {
    id: crypto.randomUUID(),
    outcome: validationOutcomeForIssues(sortedIssues),
    checked_at: new Date().toISOString(),
    checked_by: actorId,
    issues: sortedIssues.map((issue) => ({
      ...issue,
      id: issue.id ?? crypto.randomUUID()
    }))
  };

  const updated = await updateSiteDraftRecord(draftId, (current) => ({
    ...current,
    latest_validation: report,
    status: report.outcome === "blocked" ? "blocked" : "ready_to_generate",
    updated_at: new Date().toISOString()
  }));

  await recordAuditEvent({
    draft_id: updated.id,
    actor_id: actorId,
    event_type: "validation_run",
    event_payload: {
      outcome: report.outcome,
      issue_count: report.issues.length
    }
  });

  return report;
}
