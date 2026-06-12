# CMS 통합 지식 문서 관리 시스템

React 18/Vite 5 frontend, Spring Boot 3.3 backend, and PostgreSQL 16 based CMS for portal browsing and admin content management.

## Architecture

- `frontend/`: React Router separated `/portal/**`, `/admin/**`, `/login` UI with Zustand auth state, Axios JWT interceptor, Tailwind v4, shadcn/Radix-style local components, lucide-react icons, and React Markdown rendering.
- `backend/`: Spring Boot stateless JWT API, Spring Security access control, MyBatis Plus mapper interfaces with per-interface `@Mapper`, upload validation, local storage abstraction, search, and health endpoint.
- `database/init/001_schema.sql`: PostgreSQL schema, indexes, and local seed accounts.
- `docker-compose.yml`: `cms-frontend`, `cms-backend`, and `postgres` services with published ports and healthchecks.

## Local Preview

```bash
cp .env.example .env
docker compose up -d --build
```

- Frontend: `http://localhost:5173`
- Backend health: `http://localhost:8080/api/health`
- Local admin seed: `admin` / `admin123`
- Local user seed: `user` / `user123`

## Validation Commands

These commands are defined for maintainers. They were not executed during this implementation pass because dependency installation/package-manager runs and long-running commands were prohibited.

```bash
cd backend && ./mvnw test
cd frontend && npm run test -- --run
cd frontend && npm run build
docker compose up -d --build
scripts/smoke-test.sh
```

Recorded placeholders are in `docs/test-results/`.

## Operations

- Operation manual: `docs/operations/operation-manual.md`
- Deployment guide: `docs/operations/deployment-guide.md`
- Backup/restore: `docs/operations/backup-restore.md`
- Incident response: `docs/operations/incident-response.md`
- Handover checklist: `docs/operations/handover-checklist.md`
- API notes: `docs/service-api.md`
- Performance checks: `docs/performance/cms-performance-check.md`
