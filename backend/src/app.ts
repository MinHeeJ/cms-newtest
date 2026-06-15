import cors from "cors";
import express from "express";
import { env } from "./config/env";
import { getDatabase } from "./db/connection";
import { runMigrations } from "./db/migrations";
import { errorHandler, notFound } from "./middleware/error-handler";
import { ActionItemRepository } from "./repositories/action-item-repository";
import { IdeaRepository } from "./repositories/idea-repository";
import { TagRepository } from "./repositories/tag-repository";
import { createActionItemsRouter } from "./routes/action-items";
import { createIdeasRouter } from "./routes/ideas";
import { createTagsRouter } from "./routes/tags";
import { ActionItemService } from "./services/action-item-service";
import { IdeaService } from "./services/idea-service";
import { TagService } from "./services/tag-service";

export const createApp = () => {
  const db = getDatabase();
  runMigrations(db);

  const tagRepository = new TagRepository(db);
  const ideaRepository = new IdeaRepository(db);
  const actionItemRepository = new ActionItemRepository(db);

  const tagService = new TagService(tagRepository);
  const ideaService = new IdeaService(ideaRepository, tagRepository);
  const actionItemService = new ActionItemService(actionItemRepository, ideaRepository);

  const app = express();

  app.use(
    cors({
      origin: env.CORS_ORIGIN,
      credentials: false
    })
  );
  app.use(express.json({ limit: "1mb" }));

  app.get("/api/health", (_req, res) => {
    res.json({ ok: true });
  });

  app.use("/api/ideas", createIdeasRouter(ideaService));
  app.use("/api/tags", createTagsRouter(tagService));
  app.use("/api/ideas/:ideaId/action-items", createActionItemsRouter(actionItemService));

  app.use((_req, _res, next) => {
    next(notFound("요청한 API 경로를 찾을 수 없습니다."));
  });

  app.use(errorHandler);

  return app;
};
