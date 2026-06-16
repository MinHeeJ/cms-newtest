import type { FastifyInstance } from "fastify";
import { auditQueryService, type AuditQuery } from "./audit-query.service.js";
import { requirePermission } from "../auth/session.middleware.js";

export async function registerAuditRoutes(app: FastifyInstance): Promise<void> {
  app.get(
    "/api/v1/audit/events",
    { preHandler: requirePermission("audit:read") },
    async (request) => auditQueryService.list(request.query as AuditQuery)
  );
}
