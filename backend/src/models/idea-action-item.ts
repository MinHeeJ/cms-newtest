export interface IdeaActionItem {
  actionItemId: string;
  ideaId: string;
  text: string;
  isCompleted: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
}

export interface ActionItemCreateInput {
  text: string;
  sortOrder?: number;
}

export interface ActionItemUpdateInput {
  text?: string;
  isCompleted?: boolean;
  sortOrder?: number;
}
