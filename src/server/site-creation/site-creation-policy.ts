import { errorJson } from "@/server/api/response";

export interface SiteCreationActor {
  actorId: string;
  role: "admin";
}

export function requireSiteCreationAccess(request: Request):
  | { ok: true; actor: SiteCreationActor }
  | { ok: false; response: Response } {
  const requireAuth = process.env.SITE_CREATION_REQUIRE_AUTH === "true";
  const role = request.headers.get("x-operator-role");
  const actorId = request.headers.get("x-operator-id") ?? "preview-operator";

  if (requireAuth && role !== "admin") {
    return {
      ok: false,
      response: errorJson(401, "UNAUTHORIZED", "Administrative site creation access is required.")
    };
  }

  return {
    ok: true,
    actor: {
      actorId,
      role: "admin"
    }
  };
}
