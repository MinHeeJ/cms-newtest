# Community Creation MVP

This repository contains a minimal Spring Boot REST API and React frontend for a community creation and operator review workflow.

## Branch Preview

```bash
docker compose up --build
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:8080
- PostgreSQL: localhost:5432

The MVP uses local header-based user context. Member requests default to a test member; operator screens send `X-User-Role: OPERATOR`.
