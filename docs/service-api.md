# Service API

The API follows the generated contract intent from `input/specs/new-req/contracts/openapi.yaml`; this repository implements the matching endpoint surface directly because `.aiops-spec` is reference-only.

## Auth

- `POST /api/v1/auth/login`
- `GET /api/v1/me/screen-context`

## Portal

- `GET /api/v1/portal/folders?parentId=`
- `GET /api/v1/portal/articles?folderId=`
- `GET /api/v1/portal/articles/{articleId}`
- `GET /api/v1/portal/search?q=&limit=`

## Admin

- `GET/POST /api/v1/admin/folders`
- `PUT/DELETE /api/v1/admin/folders/{id}`
- `PATCH /api/v1/admin/folders/{id}/move`
- `PUT /api/v1/admin/folders/sort`
- `GET/POST /api/v1/admin/articles`
- `GET/PUT/DELETE /api/v1/admin/articles/{id}`
- `PATCH /api/v1/admin/articles/{id}/publish`
- `PATCH /api/v1/admin/articles/{id}/unpublish`
- `POST /api/v1/admin/articles/import-pdf`

## Attachments and Operations

- `GET/POST /api/v1/attachments`
- `GET /api/v1/attachments/{id}/download`
- `DELETE /api/v1/attachments/{id}`
- `GET /api/health`

All JSON business responses use `{ success, data, error, timestamp }` and avoid stack traces.
