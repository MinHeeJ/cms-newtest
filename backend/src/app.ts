import cors from "@fastify/cors";
import multipart from "@fastify/multipart";
import Fastify from "fastify";
import { errorHandler } from "./api/middleware/error-handler.js";
import { attachRequestLogger } from "./api/middleware/request-logger.js";
import { sessionMiddleware } from "./modules/auth/session.middleware.js";
import { getPermissions } from "./modules/auth/permissions.js";
import { registerAuditRoutes } from "./modules/audit/audit.routes.js";
import { registerContentRoutes } from "./modules/content/content.routes.js";
import { registerDashboardRoutes } from "./modules/dashboard/dashboard.routes.js";
import { registerMediaRoutes } from "./modules/media/media.routes.js";
import { registerNavigationRoutes } from "./modules/navigation/navigation.routes.js";
import { registerTaxonomyRoutes } from "./modules/taxonomy/taxonomy.routes.js";
import { registerUserRoutes } from "./modules/users/users.routes.js";

export async function buildApp() {
  const app = Fastify({
    logger: {
      level: process.env.LOG_LEVEL ?? "info"
    }
  });

  app.setErrorHandler(errorHandler);
  await attachRequestLogger(app);
  await app.register(cors, {
    origin: process.env.CORS_ORIGIN?.split(",") ?? true,
    credentials: true
  });
  await app.register(multipart);

  app.get("/health", async () => ({ status: "ok", service: "cms-backend" }));
  app.addHook("preHandler", sessionMiddleware);

  app.get("/api/v1/auth/session", async (request) => ({
    user: request.currentUser,
    permissions: getPermissions(request.currentUser)
  }));
  app.delete("/api/v1/auth/session", async (_request, reply) => {
    await reply.status(204).send();
  });

  await registerContentRoutes(app);
  await registerMediaRoutes(app);
  await registerTaxonomyRoutes(app);
  await registerNavigationRoutes(app);
  await registerUserRoutes(app);
  await registerAuditRoutes(app);
  await registerDashboardRoutes(app);

  return app;
}
