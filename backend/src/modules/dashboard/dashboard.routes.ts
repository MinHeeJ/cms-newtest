import type { FastifyInstance } from "fastify";
import { requirePermission } from "../auth/session.middleware.js";
import { dashboardService } from "./dashboard.service.js";

export async function registerDashboardRoutes(app: FastifyInstance): Promise<void> {
  app.get("/api/v1/dashboard/metrics", { preHandler: requirePermission("dashboard:read") }, async () => dashboardService.metrics());
}
