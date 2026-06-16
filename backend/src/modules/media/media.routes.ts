import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { mediaService } from "./media.service.js";

const mediaUploadSchema = z.object({
  fileName: z.string().min(1).default("upload.png"),
  mimeType: z.string().min(1).default("image/png"),
  sizeBytes: z.number().int().positive().default(1024),
  altText: z.string().optional(),
  caption: z.string().optional()
});

const mediaUpdateSchema = z.object({
  fileName: z.string().optional(),
  altText: z.string().nullable().optional(),
  caption: z.string().nullable().optional()
});

export async function registerMediaRoutes(app: FastifyInstance): Promise<void> {
  app.get("/api/v1/media", async (request) => mediaService.list(request.query as Parameters<typeof mediaService.list>[0]));

  app.post("/api/v1/media", async (request, reply) => {
    const input = mediaUploadSchema.parse(request.body ?? {});
    const asset = await mediaService.upload(input, request.currentUser);
    await reply.status(201).send(asset);
  });

  app.patch("/api/v1/media/:mediaId", async (request) => {
    const { mediaId } = request.params as { mediaId: string };
    return mediaService.update(mediaId, mediaUpdateSchema.parse(request.body), request.currentUser);
  });

  app.delete("/api/v1/media/:mediaId", async (request, reply) => {
    const { mediaId } = request.params as { mediaId: string };
    const query = request.query as { confirm?: string | boolean };
    await mediaService.delete(mediaId, query.confirm === true || query.confirm === "true", request.currentUser);
    await reply.status(204).send();
  });
}
