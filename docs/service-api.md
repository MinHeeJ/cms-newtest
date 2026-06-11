# Service API

The implemented API follows the task contract paths:

- `POST /api/v1/auth/login`
- `GET /api/v1/me/screen-context`
- `GET /api/v1/portal/folders`
- `GET /api/v1/portal/articles?folderId=...`
- `GET /api/v1/portal/articles/{articleId}`
- `GET /api/v1/portal/search?q=...`
- `GET|POST|PUT|PATCH|DELETE /api/v1/admin/folders`
- `GET|POST|PUT|PATCH|DELETE /api/v1/admin/articles`
- `GET|POST|DELETE /api/v1/attachments`
- `GET /api/v1/attachments/{id}/download`
- `GET /api/health`

Responses use `{ success, data, message, timestamp }` except binary downloads and health.
