import { apiJson, handleApiError } from "@/server/api/response";
import { getDomainCatalog } from "@/server/site-creation/domain-catalog";
import { requireSiteCreationAccess } from "@/server/site-creation/site-creation-policy";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  const access = requireSiteCreationAccess(request);
  if (!access.ok) {
    return access.response;
  }

  try {
    return apiJson({ domains: getDomainCatalog() });
  } catch (error) {
    return handleApiError(error);
  }
}
