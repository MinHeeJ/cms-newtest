import { listDraftsQuerySchema, createDraftSchema } from "@/lib/site-creation/schemas";
import { apiJson, createdJson, handleApiError } from "@/server/api/response";
import { createSiteDraft } from "@/server/site-creation/create-site-draft";
import { toSummary } from "@/server/site-creation/dashboard-summary";
import { listSiteDrafts } from "@/server/site-creation/site-draft-repository";
import { requireSiteCreationAccess } from "@/server/site-creation/site-creation-policy";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  const access = requireSiteCreationAccess(request);
  if (!access.ok) {
    return access.response;
  }

  try {
    const url = new URL(request.url);
    const query = listDraftsQuerySchema.parse({
      status: url.searchParams.get("status") ?? undefined,
      limit: url.searchParams.get("limit") ?? undefined
    });
    const drafts = await listSiteDrafts(query);
    return apiJson({ items: drafts.map(toSummary) });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  const access = requireSiteCreationAccess(request);
  if (!access.ok) {
    return access.response;
  }

  try {
    const body = createDraftSchema.parse(await request.json());
    const draft = await createSiteDraft(body, access.actor.actorId);
    return createdJson(draft);
  } catch (error) {
    return handleApiError(error);
  }
}
