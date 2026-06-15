import { apiJson, handleApiError } from "@/server/api/response";
import {
  requireGenerationJob,
  requireSiteDraft
} from "@/server/site-creation/site-draft-repository";
import { requireSiteCreationAccess } from "@/server/site-creation/site-creation-policy";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

interface RouteContext {
  params: Promise<{
    jobId: string;
  }>;
}

export async function GET(request: Request, context: RouteContext) {
  const access = requireSiteCreationAccess(request);
  if (!access.ok) {
    return access.response;
  }

  try {
    const { jobId } = await context.params;
    const job = await requireGenerationJob(jobId);
    const draft = await requireSiteDraft(job.draft_id);
    const artifacts = draft.document_bundles.flatMap((bundle) =>
      bundle.artifacts.map((artifact) => ({
        ...artifact,
        domain_code: bundle.domain_code
      }))
    );
    return apiJson({ job_id: job.id, artifacts });
  } catch (error) {
    return handleApiError(error);
  }
}
