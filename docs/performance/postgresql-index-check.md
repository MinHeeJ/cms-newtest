# PostgreSQL Index Checklist

- `folders(parent_id, active)` with `deleted = false` supports folder navigation.
- `folders(active, sort_order)` supports active root/child sorting.
- `articles(folder_id, status, sort_order)` supports portal lists.
- `articles(status, published_at)` supports published ordering.
- GIN text indexes exist for title/body search expansion.
- `attachments(storage_key)` supports download lookup and storage reconciliation.
- `article_attachments(article_id)` and `article_attachments(attachment_id)` support relationship cleanup.

Use `EXPLAIN (ANALYZE, BUFFERS)` for slow queries before adding indexes.
