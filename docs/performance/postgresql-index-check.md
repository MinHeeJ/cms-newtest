# PostgreSQL Index Review

Confirm these indexes exist after first database initialization:

- `idx_folders_parent_active` for portal folder traversal.
- `idx_folders_active_sort` for active folder ordering.
- `idx_articles_folder_status` for folder article lists.
- `idx_articles_published` for recent published content.
- `idx_articles_search_title` and `idx_articles_search_body` for text search readiness.
- `idx_attachments_ref` for attachment list lookup.
- `idx_article_attachments_attachment` for attachment relation cleanup.
- `idx_audit_target` for operation audit review.

Run `\d+ folders`, `\d+ articles`, and `\d+ attachments` in `psql` or inspect `pg_indexes` before production acceptance.
