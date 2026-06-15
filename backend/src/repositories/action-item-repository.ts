import { randomUUID } from "node:crypto";
import type { DatabaseSync } from "node:sqlite";
import type { ActionItemCreateInput, ActionItemUpdateInput, IdeaActionItem } from "../models/idea-action-item";

interface ActionItemRow {
  action_item_id: string;
  idea_id: string;
  text: string;
  is_completed: number;
  sort_order: number;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

const mapActionItem = (row: ActionItemRow): IdeaActionItem => ({
  actionItemId: row.action_item_id,
  ideaId: row.idea_id,
  text: row.text,
  isCompleted: Boolean(row.is_completed),
  sortOrder: row.sort_order,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
  completedAt: row.completed_at
});

export class ActionItemRepository {
  constructor(private readonly db: DatabaseSync) {}

  list(ideaId: string): IdeaActionItem[] {
    const rows = this.db
      .prepare(
        `SELECT action_item_id, idea_id, text, is_completed, sort_order, created_at, updated_at, completed_at
         FROM idea_action_items
         WHERE idea_id = ?
         ORDER BY sort_order ASC, created_at ASC`
      )
      .all(ideaId) as ActionItemRow[];
    return rows.map(mapActionItem);
  }

  findById(ideaId: string, actionItemId: string): IdeaActionItem | null {
    const row = this.db
      .prepare(
        `SELECT action_item_id, idea_id, text, is_completed, sort_order, created_at, updated_at, completed_at
         FROM idea_action_items
         WHERE idea_id = ? AND action_item_id = ?`
      )
      .get(ideaId, actionItemId) as ActionItemRow | undefined;
    return row ? mapActionItem(row) : null;
  }

  create(ideaId: string, input: ActionItemCreateInput): IdeaActionItem {
    const now = new Date().toISOString();
    const actionItemId = randomUUID();
    const sortOrder = input.sortOrder ?? this.nextSortOrder(ideaId);
    this.db
      .prepare(
        `INSERT INTO idea_action_items (
          action_item_id, idea_id, text, is_completed, sort_order, created_at, updated_at, completed_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .run(actionItemId, ideaId, input.text.trim(), 0, sortOrder, now, now, null);

    return this.findById(ideaId, actionItemId) as IdeaActionItem;
  }

  update(ideaId: string, actionItemId: string, input: ActionItemUpdateInput): IdeaActionItem | null {
    const current = this.findById(ideaId, actionItemId);
    if (!current) {
      return null;
    }

    const now = new Date().toISOString();
    const nextCompleted = input.isCompleted ?? current.isCompleted;
    const completedAt = nextCompleted ? current.completedAt ?? now : null;

    this.db
      .prepare(
        `UPDATE idea_action_items
         SET text = ?, is_completed = ?, sort_order = ?, updated_at = ?, completed_at = ?
         WHERE idea_id = ? AND action_item_id = ?`
      )
      .run(
        input.text !== undefined ? input.text.trim() : current.text,
        nextCompleted ? 1 : 0,
        input.sortOrder ?? current.sortOrder,
        now,
        completedAt,
        ideaId,
        actionItemId
      );

    return this.findById(ideaId, actionItemId);
  }

  delete(ideaId: string, actionItemId: string): boolean {
    const result = this.db
      .prepare("DELETE FROM idea_action_items WHERE idea_id = ? AND action_item_id = ?")
      .run(ideaId, actionItemId);
    return result.changes > 0;
  }

  private nextSortOrder(ideaId: string) {
    const row = this.db
      .prepare("SELECT COALESCE(MAX(sort_order), 0) + 1 AS next_sort_order FROM idea_action_items WHERE idea_id = ?")
      .get(ideaId) as { next_sort_order: number };
    return row.next_sort_order;
  }
}
