import type { FastifyInstance } from "fastify";
import { navigationMenuSchema } from "../content/content.types.js";
import { navigationService } from "./navigation.service.js";

export async function registerNavigationRoutes(app: FastifyInstance): Promise<void> {
  app.get("/api/v1/navigation/menus", async () => navigationService.list());

  app.post("/api/v1/navigation/menus", async (request, reply) => {
    const menu = navigationService.save(navigationMenuSchema.parse(request.body), request.currentUser);
    await reply.status(201).send(menu);
  });

  app.patch("/api/v1/navigation/menus/:menuId", async (request) => {
    const { menuId } = request.params as { menuId: string };
    return navigationService.save(navigationMenuSchema.parse(request.body), request.currentUser, menuId);
  });
}
