import { Router } from "express";
import { asyncHandler } from "../middleware/error-handler";
import type { ActionItemService } from "../services/action-item-service";
import { actionItemCreateSchema, actionItemUpdateSchema } from "../validation/idea-validation";

export const createActionItemsRouter = (actionItemService: ActionItemService) => {
  const router = Router({ mergeParams: true });

  router.get(
    "/",
    asyncHandler((req, res) => {
      res.json({ items: actionItemService.listActionItems(req.params.ideaId) });
    })
  );

  router.post(
    "/",
    asyncHandler((req, res) => {
      const payload = actionItemCreateSchema.parse(req.body);
      const item = actionItemService.createActionItem(req.params.ideaId, payload);
      res.status(201).json(item);
    })
  );

  router.patch(
    "/:actionItemId",
    asyncHandler((req, res) => {
      const payload = actionItemUpdateSchema.parse(req.body);
      res.json(actionItemService.updateActionItem(req.params.ideaId, req.params.actionItemId, payload));
    })
  );

  router.delete(
    "/:actionItemId",
    asyncHandler((req, res) => {
      actionItemService.deleteActionItem(req.params.ideaId, req.params.actionItemId);
      res.status(204).send();
    })
  );

  return router;
};
