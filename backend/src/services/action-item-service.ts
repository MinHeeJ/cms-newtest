import { notFound } from "../middleware/error-handler";
import type { ActionItemCreateInput, ActionItemUpdateInput, IdeaActionItem } from "../models/idea-action-item";
import type { ActionItemRepository } from "../repositories/action-item-repository";
import type { IdeaRepository } from "../repositories/idea-repository";

export class ActionItemService {
  constructor(
    private readonly actionItems: ActionItemRepository,
    private readonly ideas: IdeaRepository
  ) {}

  listActionItems(ideaId: string): IdeaActionItem[] {
    this.assertIdeaExists(ideaId);
    return this.actionItems.list(ideaId);
  }

  createActionItem(ideaId: string, input: ActionItemCreateInput): IdeaActionItem {
    this.assertIdeaExists(ideaId);
    return this.actionItems.create(ideaId, input);
  }

  updateActionItem(ideaId: string, actionItemId: string, input: ActionItemUpdateInput): IdeaActionItem {
    this.assertIdeaExists(ideaId);
    const item = this.actionItems.update(ideaId, actionItemId, input);
    if (!item) {
      throw notFound("실행 항목을 찾을 수 없습니다.");
    }
    return item;
  }

  deleteActionItem(ideaId: string, actionItemId: string): void {
    this.assertIdeaExists(ideaId);
    if (!this.actionItems.delete(ideaId, actionItemId)) {
      throw notFound("실행 항목을 찾을 수 없습니다.");
    }
  }

  private assertIdeaExists(ideaId: string) {
    if (!this.ideas.findRecordById(ideaId)) {
      throw notFound("아이디어를 찾을 수 없습니다.");
    }
  }
}
