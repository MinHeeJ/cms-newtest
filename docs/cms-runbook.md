# CMS Runbook

## Services

- `frontend`: Vite React 운영 콘솔, preview port `5173`.
- `backend`: Fastify REST API, preview port `3000`.
- `postgres`: Prisma schema 대상 PostgreSQL.

## Local Preview

Docker Compose defines app services for branch preview:

```bash
docker compose up --build frontend backend postgres
```

The frontend proxies API calls to `backend:3000` in Compose. For direct local execution, set `VITE_API_BASE_URL=http://localhost:3000`.

## Smoke Walkthrough

1. `GET /api/v1/auth/session` returns current user, roles, and permissions.
2. Create a draft with `POST /api/v1/content`.
3. Render markdown with `POST /api/v1/content/{contentId}/preview`.
4. Submit and review through `/submit` and `/review`.
5. Publish with `/publish` or schedule with `/schedule`.
6. Confirm content list filtering through `GET /api/v1/content?q=CMS&status=PUBLISHED`.
7. Validate media `altText`, taxonomy usage impact, navigation target validation, role update reason, and audit event visibility.

## Operational Notes

- Prisma schema lives at `backend/src/persistence/prisma/schema.prisma` and includes indexes for status, author, publication, schedule, title, and slug lookup.
- Preview implementation uses an in-memory store seeded with representative CMS data. Replace repository internals with Prisma queries when production persistence is enabled.
- Runtime CORS should be restricted with `CORS_ORIGIN` in non-preview environments.
- Destructive actions require explicit confirmation and retain audit metadata.
- Role changes, publish, schedule, archive, delete, login, and permission changes are written as `WorkflowEvent`.

## Backup And Restore

- PostgreSQL should be backed up on a fixed retention schedule with point-in-time recovery enabled where available.
- Object storage keys are metadata-backed by `MediaAsset`; restore DB and object storage from the same backup window.
- Archived content metadata is retained for audit unless a privileged retention policy removes it.

## Rollback

- Deployments should be tied to source commit, build output, and environment revision.
- On failure, roll back both frontend and backend images to the previous stable version and keep the database schema migration direction documented.
- If a scheduler run fails, inspect `PublicationSchedule.failureReason` and related `WorkflowEvent.id`.
