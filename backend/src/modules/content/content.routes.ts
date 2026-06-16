import type { FastifyInstance } from "fastify";
import { badRequest } from "../../api/middleware/error-handler.js";
import type { ContentQuery } from "./content.repository.js";
import {
  contentCreateSchema,
  contentUpdateSchema,
  previewSchema,
  reviewSchema,
  scheduleSchema
} from "./content.types.js";
import { contentQueryService } from "./content-query.service.js";
import { contentService } from "./content.service.js";
import { previewService } from "./preview.service.js";
import { reviewService } from "./review.service.js";
import { revisionService } from "./revision.service.js";
import { scheduleService } from "./schedule.service.js";
import { workflowService } from "./workflow.service.js";

export async function registerContentRoutes(app: FastifyInstance): Promise<void> {
  app.get("/api/v1/content", async (request) => contentQueryService.list(request.query as ContentQuery));

  app.post("/api/v1/content", async (request, reply) => {
    const input = contentCreateSchema.parse(request.body);
    const content = contentService.create(input, request.currentUser);
    await reply.status(201).send(content);
  });

  app.get("/api/v1/content/:contentId", async (request) => {
    const { contentId } = request.params as { contentId: string };
    return contentService.get(contentId);
  });

  app.patch("/api/v1/content/:contentId", async (request) => {
    const { contentId } = request.params as { contentId: string };
    const input = contentUpdateSchema.parse(request.body);
    return contentService.update(contentId, input, request.currentUser);
  });

  app.delete("/api/v1/content/:contentId", async (request, reply) => {
    const { contentId } = request.params as { contentId: string };
    const query = request.query as { confirm?: string | boolean };
    if (query.confirm !== true && query.confirm !== "true") {
      throw badRequest("삭제 확인 값이 필요합니다.");
    }
    workflowService.archive(contentId, request.currentUser);
    await reply.status(204).send();
  });

  app.post("/api/v1/content/:contentId/preview", async (request) => {
    const { contentId } = request.params as { contentId: string };
    const content = contentService.get(contentId);
    const input = previewSchema.parse(request.body ?? {});
    return previewService.render(input.markdownBody ?? content.markdownBody, input.title ?? content.title, input.summary ?? content.summary);
  });

  app.post("/api/v1/content/:contentId/submit", async (request) => {
    const { contentId } = request.params as { contentId: string };
    return workflowService.submit(contentId, request.currentUser);
  });

  app.post("/api/v1/content/:contentId/review", async (request) => {
    const { contentId } = request.params as { contentId: string };
    return reviewService.decide(contentId, reviewSchema.parse(request.body), request.currentUser);
  });

  app.post("/api/v1/content/:contentId/publish", async (request) => {
    const { contentId } = request.params as { contentId: string };
    return workflowService.publish(contentId, request.currentUser);
  });

  app.post("/api/v1/content/:contentId/schedule", async (request, reply) => {
    const { contentId } = request.params as { contentId: string };
    const schedule = scheduleService.create(contentId, scheduleSchema.parse(request.body), request.currentUser);
    await reply.status(201).send(schedule);
  });

  app.post("/api/v1/content/:contentId/unpublish", async (request) => {
    const { contentId } = request.params as { contentId: string };
    return workflowService.unpublish(contentId, request.currentUser);
  });

  app.post("/api/v1/content/:contentId/archive", async (request) => {
    const { contentId } = request.params as { contentId: string };
    return workflowService.archive(contentId, request.currentUser);
  });

  app.get("/api/v1/content/:contentId/revisions", async (request) => {
    const { contentId } = request.params as { contentId: string };
    return revisionService.list(contentId);
  });

  app.get("/api/v1/content/:contentId/revisions/compare", async (request) => {
    const { contentId } = request.params as { contentId: string };
    const query = request.query as { baseRevisionId?: string; targetRevisionId?: string };
    if (!query.baseRevisionId || !query.targetRevisionId) {
      throw badRequest("baseRevisionId와 targetRevisionId가 필요합니다.");
    }
    return revisionService.compare(contentId, query.baseRevisionId, query.targetRevisionId);
  });

  app.post("/api/v1/content/:contentId/revisions/:revisionId/restore", async (request, reply) => {
    const { contentId, revisionId } = request.params as { contentId: string; revisionId: string };
    const restored = revisionService.restore(contentId, revisionId, request.currentUser);
    await reply.status(201).send(restored);
  });
}
