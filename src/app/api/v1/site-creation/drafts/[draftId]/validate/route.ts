import { apiJson, handleApiError } from "@/server/api/response";
import { validateSiteDraft } from "@/server/site-creation/validate-site-draft";
import { requireSiteCreationAccess } from "@/server/site-creation/site-creation-policy";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

interface RouteContext {
  params: Promise<{
    draftId: string;
  }>;
}

export async function POST(request: Request, context: RouteContext) {
  const access = requireSiteCreationAccess(request);
  if (!access.ok) {
    return access.response;
  }

  try {
    const { draftId } = await context.params;
    const report = await validateSiteDraft(draftId, access.actor.actorId);
    return apiJson(report);
  } catch (error) {
    return handleApiError(error);
  }
}
