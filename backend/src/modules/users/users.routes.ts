import type { FastifyInstance } from "fastify";
import { roleUpdateSchema } from "../content/content.types.js";
import { userService } from "./user.service.js";

export async function registerUserRoutes(app: FastifyInstance): Promise<void> {
  app.get("/api/v1/users", async (request) => userService.list(request.query as Parameters<typeof userService.list>[0]));

  app.patch("/api/v1/users/:userId/roles", async (request) => {
    const { userId } = request.params as { userId: string };
    return userService.updateRoles(userId, roleUpdateSchema.parse(request.body), request.currentUser);
  });
}
