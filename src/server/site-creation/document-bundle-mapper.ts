import { buildDocumentSet } from "@/lib/site-creation/document-templates";
import type { Artifact, CmsSiteDraft, DocumentBundle, DomainDefinition } from "@/lib/site-creation/types";

export function mapDomainToDocumentBundle(
  draft: CmsSiteDraft,
  domain: DomainDefinition,
  jobId: string
): DocumentBundle {
  const documents = buildDocumentSet(draft, domain, draft.generation_stages);
  const artifacts = Object.entries(documents).map(([filename, content]) => ({
    filename,
    url: `/api/v1/site-creation/jobs/${jobId}/artifacts?domain=${domain.domain_code}&filename=${filename}`,
    content
  })) as Artifact[];

  return {
    id: crypto.randomUUID(),
    domain_code: domain.domain_code,
    status: "generated",
    language: "English",
    generated_at: new Date().toISOString(),
    artifacts
  };
}
