import { updateDraftSchema } from "@/lib/site-creation/schemas";
import { apiJson, handleApiError } from "@/server/api/response";
import { updateSiteDraft } from "@/server/site-creation/create-site-draft";
import { requireSiteDraft } from "@/server/site-creation/site-draft-repository";
import { requireSiteCreationAccess } from "@/server/site-creation/site-creation-policy";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

interface RouteContext {
  params: Promise<{
    draftId: string;
  }>;
}

export async function GET(request: Request, context: RouteContext) {
  const access = requireSiteCreationAccess(request);
  if (!access.ok) {
    return access.response;
  }

  try {
    const { draftId } = await context.params;
    const draft = await requireSiteDraft(draftId);
    return apiJson(draft);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  const access = requireSiteCreationAccess(request);
  if (!access.ok) {
    return access.response;
  }

  try {
    const { draftId } = await context.params;
    const body = updateDraftSchema.parse(await request.json());
    const draft = await updateSiteDraft(draftId, body, access.actor.actorId);
    return apiJson(draft);
  } catch (error) {
    return handleApiError(error);
  }
}
