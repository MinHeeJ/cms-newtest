# Handover Checklist

- Source tree: backend, frontend, database init, Docker Compose, scripts, docs.
- Runtime config: `.env`, JWT secret, PostgreSQL credentials, upload limits.
- Admin seed account: `admin` / `admin123` for local verification only.
- User seed account: `user` / `user123` for local verification only.
- Backup assets: PostgreSQL dump and uploads archive.
- Validation: backend tests, frontend tests, frontend build, smoke script, performance notes.
- Known constraints: PostgreSQL init scripts do not rerun on existing volumes; PDF import is an initial controlled converter stub.
