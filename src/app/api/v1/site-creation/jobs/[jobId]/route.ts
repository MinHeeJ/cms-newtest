import { apiJson, handleApiError } from "@/server/api/response";
import { requireGenerationJob } from "@/server/site-creation/site-draft-repository";
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
    return apiJson(job);
  } catch (error) {
    return handleApiError(error);
  }
}
