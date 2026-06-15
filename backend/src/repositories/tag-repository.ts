import { randomUUID } from "node:crypto";
import type { DatabaseSync } from "node:sqlite";
import type { Tag, TagRecord } from "../models/tag";

interface TagRow {
  tag_id: string;
  name: string;
  normalized_name: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

const mapTag = (row: TagRow): Tag => ({
  tagId: row.tag_id,
  name: row.name,
  sortOrder: row.sort_order,
  createdAt: row.created_at,
  updatedAt: row.updated_at
});

const mapTagRecord = (row: TagRow): TagRecord => ({
  ...mapTag(row),
  normalizedName: row.normalized_name
});

export class TagRepository {
  constructor(private readonly db: DatabaseSync) {}

  list(): Tag[] {
    const rows = this.db
      .prepare(
        `SELECT tag_id, name, normalized_name, sort_order, created_at, updated_at
         FROM tags
         ORDER BY sort_order ASC, name ASC`
      )
      .all() as TagRow[];

    return rows.map(mapTag);
  }

  findById(tagId: string): TagRecord | null {
    const row = this.db
      .prepare(
        `SELECT tag_id, name, normalized_name, sort_order, created_at, updated_at
         FROM tags
         WHERE tag_id = ?`
      )
      .get(tagId) as TagRow | undefined;
    return row ? mapTagRecord(row) : null;
  }

  findByNormalizedName(normalizedName: string): TagRecord | null {
    const row = this.db
      .prepare(
        `SELECT tag_id, name, normalized_name, sort_order, created_at, updated_at
         FROM tags
         WHERE normalized_name = ?`
      )
      .get(normalizedName) as TagRow | undefined;
    return row ? mapTagRecord(row) : null;
  }

  findManyByIds(tagIds: string[]): Tag[] {
    if (tagIds.length === 0) {
      return [];
    }

    const placeholders = tagIds.map(() => "?").join(", ");
    const rows = this.db
      .prepare(
        `SELECT tag_id, name, normalized_name, sort_order, created_at, updated_at
         FROM tags
         WHERE tag_id IN (${placeholders})
         ORDER BY sort_order ASC, name ASC`
      )
      .all(...tagIds) as TagRow[];

    return rows.map(mapTag);
  }

  create(input: { name: string; normalizedName: string; sortOrder?: number }): Tag {
    const now = new Date().toISOString();
    const tagId = randomUUID();
    const sortOrder = input.sortOrder ?? this.nextSortOrder();

    this.db
      .prepare(
        `INSERT INTO tags (tag_id, name, normalized_name, sort_order, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?)`
      )
      .run(tagId, input.name, input.normalizedName, sortOrder, now, now);

    return {
      tagId,
      name: input.name,
      sortOrder,
      createdAt: now,
      updatedAt: now
    };
  }

  update(tagId: string, input: { name?: string; normalizedName?: string; sortOrder?: number }): Tag | null {
    const current = this.findById(tagId);
    if (!current) {
      return null;
    }

    const now = new Date().toISOString();
    this.db
      .prepare(
        `UPDATE tags
         SET name = ?, normalized_name = ?, sort_order = ?, updated_at = ?
         WHERE tag_id = ?`
      )
      .run(
        input.name ?? current.name,
        input.normalizedName ?? current.normalizedName,
        input.sortOrder ?? current.sortOrder,
        now,
        tagId
      );

    const updated = this.findById(tagId);
    return updated ? mapTagRecordToTag(updated) : null;
  }

  delete(tagId: string): boolean {
    const result = this.db.prepare("DELETE FROM tags WHERE tag_id = ?").run(tagId);
    return result.changes > 0;
  }

  private nextSortOrder() {
    const row = this.db.prepare("SELECT COALESCE(MAX(sort_order), 0) + 1 AS next_sort_order FROM tags").get() as {
      next_sort_order: number;
    };
    return row.next_sort_order;
  }
}

const mapTagRecordToTag = (tag: TagRecord): Tag => ({
  tagId: tag.tagId,
  name: tag.name,
  sortOrder: tag.sortOrder,
  createdAt: tag.createdAt,
  updatedAt: tag.updatedAt
});
