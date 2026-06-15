import { acceptedJson, handleApiError } from "@/server/api/response";
import { generateDocuments } from "@/server/site-creation/generate-documents";
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
    const job = await generateDocuments(draftId, access.actor.actorId);
    return acceptedJson(job);
  } catch (error) {
    return handleApiError(error);
  }
}
