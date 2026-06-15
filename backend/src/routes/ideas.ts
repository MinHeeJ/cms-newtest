import { Router } from "express";
import { asyncHandler } from "../middleware/error-handler";
import type { IdeaService } from "../services/idea-service";
import { ideaCreateSchema, ideaListQuerySchema, ideaUpdateSchema } from "../validation/idea-validation";

export const createIdeasRouter = (ideaService: IdeaService) => {
  const router = Router();

  router.get(
    "/",
    asyncHandler((req, res) => {
      const query = ideaListQuerySchema.parse(req.query);
      res.json(ideaService.listIdeas(query));
    })
  );

  router.post(
    "/",
    asyncHandler((req, res) => {
      const payload = ideaCreateSchema.parse(req.body);
      const idea = ideaService.createIdea(payload);
      res.status(201).json(idea);
    })
  );

  router.get(
    "/:ideaId",
    asyncHandler((req, res) => {
      res.json(ideaService.getIdea(req.params.ideaId));
    })
  );

  router.patch(
    "/:ideaId",
    asyncHandler((req, res) => {
      const payload = ideaUpdateSchema.parse(req.body);
      res.json(ideaService.updateIdea(req.params.ideaId, payload));
    })
  );

  router.delete(
    "/:ideaId",
    asyncHandler((req, res) => {
      ideaService.deleteIdea(req.params.ideaId);
      res.status(204).send();
    })
  );

  return router;
};
