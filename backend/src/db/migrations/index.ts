import type { DatabaseSync } from "node:sqlite";

export const runMigrations = (db: DatabaseSync) => {
  db.exec(`
    CREATE TABLE IF NOT EXISTS ideas (
      idea_id TEXT PRIMARY KEY,
      title TEXT NOT NULL DEFAULT '',
      body TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL CHECK (status IN ('captured', 'developing', 'archived')),
      accent_color TEXT NOT NULL DEFAULT 'yellow',
      is_pinned INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      archived_at TEXT,
      last_saved_at TEXT
    );

    CREATE TABLE IF NOT EXISTS tags (
      tag_id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      normalized_name TEXT NOT NULL UNIQUE,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS idea_tags (
      idea_id TEXT NOT NULL,
      tag_id TEXT NOT NULL,
      created_at TEXT NOT NULL,
      PRIMARY KEY (idea_id, tag_id),
      FOREIGN KEY (idea_id) REFERENCES ideas(idea_id) ON DELETE CASCADE,
      FOREIGN KEY (tag_id) REFERENCES tags(tag_id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS idea_action_items (
      action_item_id TEXT PRIMARY KEY,
      idea_id TEXT NOT NULL,
      text TEXT NOT NULL,
      is_completed INTEGER NOT NULL DEFAULT 0,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      completed_at TEXT,
      FOREIGN KEY (idea_id) REFERENCES ideas(idea_id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_ideas_status ON ideas(status);
    CREATE INDEX IF NOT EXISTS idx_ideas_updated ON ideas(updated_at);
    CREATE INDEX IF NOT EXISTS idx_ideas_pinned ON ideas(is_pinned);
    CREATE INDEX IF NOT EXISTS idx_tags_normalized ON tags(normalized_name);
    CREATE INDEX IF NOT EXISTS idx_idea_tags_tag ON idea_tags(tag_id);
    CREATE INDEX IF NOT EXISTS idx_action_items_idea ON idea_action_items(idea_id);
  `);
};
