import { randomUUID } from "node:crypto";
import type { DatabaseSync } from "node:sqlite";
import type { Idea, IdeaCreateInput, IdeaListQuery, IdeaListResponse, IdeaRecord, IdeaStatus, IdeaUpdateInput } from "../models/idea";
import type { Tag } from "../models/tag";

interface IdeaRow {
  idea_id: string;
  title: string;
  body: string;
  status: IdeaStatus;
  accent_color: string;
  is_pinned: number;
  created_at: string;
  updated_at: string;
  archived_at: string | null;
  last_saved_at: string | null;
}

const mapIdeaRecord = (row: IdeaRow): IdeaRecord => ({
  ideaId: row.idea_id,
  title: row.title,
  body: row.body,
  status: row.status,
  accentColor: row.accent_color,
  isPinned: Boolean(row.is_pinned),
  createdAt: row.created_at,
  updatedAt: row.updated_at,
  archivedAt: row.archived_at,
  lastSavedAt: row.last_saved_at
});

export class IdeaRepository {
  constructor(private readonly db: DatabaseSync) {}

  create(input: IdeaCreateInput): IdeaRecord {
    const now = new Date().toISOString();
    const ideaId = randomUUID();
    this.db
      .prepare(
        `INSERT INTO ideas (
          idea_id, title, body, status, accent_color, is_pinned, created_at, updated_at, archived_at, last_saved_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        ideaId,
        input.title?.trim() ?? "",
        input.body?.trim() ?? "",
        "captured",
        input.accentColor ?? "yellow",
        input.isPinned ? 1 : 0,
        now,
        now,
        null,
        now
      );

    return this.findRecordById(ideaId) as IdeaRecord;
  }

  findRecordById(ideaId: string): IdeaRecord | null {
    const row = this.db
      .prepare(
        `SELECT idea_id, title, body, status, accent_color, is_pinned, created_at, updated_at, archived_at, last_saved_at
         FROM ideas
         WHERE idea_id = ?`
      )
      .get(ideaId) as IdeaRow | undefined;
    return row ? mapIdeaRecord(row) : null;
  }

  getIdea(ideaId: string): Idea | null {
    const record = this.findRecordById(ideaId);
    return record ? this.hydrate(record) : null;
  }

  update(ideaId: string, input: IdeaUpdateInput): IdeaRecord | null {
    const current = this.findRecordById(ideaId);
    if (!current) {
      return null;
    }

    const now = new Date().toISOString();
    const nextStatus = input.status ?? current.status;
    const archivedAt = nextStatus === "archived" ? current.archivedAt ?? now : null;

    this.db
      .prepare(
        `UPDATE ideas
         SET title = ?,
             body = ?,
             status = ?,
             accent_color = ?,
             is_pinned = ?,
             updated_at = ?,
             archived_at = ?,
             last_saved_at = ?
         WHERE idea_id = ?`
      )
      .run(
        input.title !== undefined ? input.title.trim() : current.title,
        input.body !== undefined ? input.body.trim() : current.body,
        nextStatus,
        input.accentColor ?? current.accentColor,
        input.isPinned !== undefined ? (input.isPinned ? 1 : 0) : current.isPinned ? 1 : 0,
        now,
        archivedAt,
        now,
        ideaId
      );

    return this.findRecordById(ideaId);
  }

  delete(ideaId: string): boolean {
    const result = this.db.prepare("DELETE FROM ideas WHERE idea_id = ?").run(ideaId);
    return result.changes > 0;
  }

  replaceTags(ideaId: string, tagIds: string[]): void {
    const uniqueTagIds = [...new Set(tagIds)];
    const now = new Date().toISOString();
    this.db.prepare("DELETE FROM idea_tags WHERE idea_id = ?").run(ideaId);
    const statement = this.db.prepare("INSERT INTO idea_tags (idea_id, tag_id, created_at) VALUES (?, ?, ?)");
    for (const tagId of uniqueTagIds) {
      statement.run(ideaId, tagId, now);
    }
  }

  list(query: IdeaListQuery): IdeaListResponse {
    const where: string[] = [];
    const params: unknown[] = [];

    if (query.status) {
      where.push("ideas.status = ?");
      params.push(query.status);
    } else {
      where.push("ideas.status != 'archived'");
    }

    if (query.pinned !== undefined) {
      where.push("ideas.is_pinned = ?");
      params.push(query.pinned ? 1 : 0);
    }

    if (query.q) {
      const like = `%${query.q.toLocaleLowerCase()}%`;
      where.push(`(
        LOWER(ideas.title) LIKE ?
        OR LOWER(ideas.body) LIKE ?
        OR EXISTS (
          SELECT 1
          FROM idea_tags search_it
          JOIN tags search_tags ON search_tags.tag_id = search_it.tag_id
          WHERE search_it.idea_id = ideas.idea_id AND LOWER(search_tags.name) LIKE ?
        )
      )`);
      params.push(like, like, like);
    }

    if (query.tag) {
      where.push(`EXISTS (
        SELECT 1
        FROM idea_tags filter_it
        JOIN tags filter_tags ON filter_tags.tag_id = filter_it.tag_id
        WHERE filter_it.idea_id = ideas.idea_id
          AND (filter_tags.tag_id = ? OR filter_tags.normalized_name = LOWER(?))
      )`);
      params.push(query.tag, query.tag.trim());
    }

    const whereSql = where.length > 0 ? `WHERE ${where.join(" AND ")}` : "";
    const totalRow = this.db.prepare(`SELECT COUNT(*) AS total FROM ideas ${whereSql}`).get(...params) as { total: number };

    const orderSql =
      query.sort === "title_asc"
        ? "ideas.is_pinned DESC, LOWER(NULLIF(ideas.title, '')) ASC, ideas.updated_at DESC"
        : query.sort === "created_desc"
          ? "ideas.is_pinned DESC, ideas.created_at DESC"
          : "ideas.is_pinned DESC, ideas.updated_at DESC";

    const offset = (query.page - 1) * query.pageSize;
    const rows = this.db
      .prepare(
        `SELECT idea_id, title, body, status, accent_color, is_pinned, created_at, updated_at, archived_at, last_saved_at
         FROM ideas
         ${whereSql}
         ORDER BY ${orderSql}
         LIMIT ? OFFSET ?`
      )
      .all(...params, query.pageSize, offset) as IdeaRow[];

    return {
      items: rows.map((row) => this.hydrate(mapIdeaRecord(row))),
      page: query.page,
      pageSize: query.pageSize,
      total: totalRow.total
    };
  }

  getTagsForIdea(ideaId: string): Tag[] {
    const rows = this.db
      .prepare(
        `SELECT tags.tag_id, tags.name, tags.sort_order, tags.created_at, tags.updated_at
         FROM tags
         JOIN idea_tags ON idea_tags.tag_id = tags.tag_id
         WHERE idea_tags.idea_id = ?
         ORDER BY tags.sort_order ASC, tags.name ASC`
      )
      .all(ideaId) as Array<{
      tag_id: string;
      name: string;
      sort_order: number;
      created_at: string;
      updated_at: string;
    }>;

    return rows.map((row) => ({
      tagId: row.tag_id,
      name: row.name,
      sortOrder: row.sort_order,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));
  }

  getActionItemSummary(ideaId: string) {
    const row = this.db
      .prepare(
        `SELECT
          COUNT(*) AS total,
          COALESCE(SUM(CASE WHEN is_completed = 1 THEN 1 ELSE 0 END), 0) AS completed
         FROM idea_action_items
         WHERE idea_id = ?`
      )
      .get(ideaId) as { total: number; completed: number };

    return {
      total: row.total,
      completed: row.completed
    };
  }

  private hydrate(record: IdeaRecord): Idea {
    return {
      ...record,
      tags: this.getTagsForIdea(record.ideaId),
      actionItemSummary: this.getActionItemSummary(record.ideaId)
    };
  }
}
