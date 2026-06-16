import type { FastifyInstance } from "fastify";
import { taxonomyRequestSchema } from "../content/content.types.js";
import { taxonomyService } from "./taxonomy.service.js";

export async function registerTaxonomyRoutes(app: FastifyInstance): Promise<void> {
  app.get("/api/v1/taxonomy", async (request) => {
    const query = request.query as { type?: "CATEGORY" | "TAG" };
    return taxonomyService.list(query.type);
  });

  app.post("/api/v1/taxonomy", async (request, reply) => {
    const term = taxonomyService.save(taxonomyRequestSchema.parse(request.body), request.currentUser);
    await reply.status(201).send(term);
  });

  app.patch("/api/v1/taxonomy/:termId", async (request) => {
    const { termId } = request.params as { termId: string };
    return taxonomyService.save(taxonomyRequestSchema.parse(request.body), request.currentUser, termId);
  });

  app.delete("/api/v1/taxonomy/:termId", async (request, reply) => {
    const { termId } = request.params as { termId: string };
    const query = request.query as { confirm?: string | boolean };
    taxonomyService.delete(termId, query.confirm === true || query.confirm === "true", request.currentUser);
    await reply.status(204).send();
  });
}
