# CMS Site Creation

Full-stack Next.js implementation for creating CMS site drafts, resolving CMS domain dependencies, validating `generation_order`, generating English `spec.md` / `plan.md` / `tasks.md` bundles, and monitoring draft history from a Material Dashboard Shadcn-inspired admin UI.

## Local Commands

Dependencies are declared in `package.json`.

```bash
npm install
npm run dev
npm test
npm run test:e2e
```

## Branch Preview

The repository includes `Dockerfile` and `docker-compose.yml`.

```bash
docker compose up --build
```

The web app is published on port `3000`. PostgreSQL 16 is included for the preview environment, while the current runtime uses `SITE_CREATION_DATA_FILE` as durable file-backed storage until Prisma migrations are wired into deployment.

## API Surface

- `GET /api/v1/site-creation/options`
- `GET /api/v1/site-creation/drafts`
- `POST /api/v1/site-creation/drafts`
- `GET /api/v1/site-creation/drafts/{draftId}`
- `PATCH /api/v1/site-creation/drafts/{draftId}`
- `POST /api/v1/site-creation/drafts/{draftId}/validate`
- `POST /api/v1/site-creation/drafts/{draftId}/generate`
- `GET /api/v1/site-creation/jobs/{jobId}`
- `GET /api/v1/site-creation/jobs/{jobId}/artifacts`
