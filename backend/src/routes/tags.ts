import { Router } from "express";
import { asyncHandler } from "../middleware/error-handler";
import type { TagService } from "../services/tag-service";
import { tagCreateSchema, tagUpdateSchema } from "../validation/idea-validation";

export const createTagsRouter = (tagService: TagService) => {
  const router = Router();

  router.get(
    "/",
    asyncHandler((_req, res) => {
      res.json({ items: tagService.listTags() });
    })
  );

  router.post(
    "/",
    asyncHandler((req, res) => {
      const payload = tagCreateSchema.parse(req.body);
      const tag = tagService.createTag(payload);
      res.status(201).json(tag);
    })
  );

  router.patch(
    "/:tagId",
    asyncHandler((req, res) => {
      const payload = tagUpdateSchema.parse(req.body);
      res.json(tagService.updateTag(req.params.tagId, payload));
    })
  );

  router.delete(
    "/:tagId",
    asyncHandler((req, res) => {
      tagService.deleteTag(req.params.tagId);
      res.status(204).send();
    })
  );

  return router;
};
