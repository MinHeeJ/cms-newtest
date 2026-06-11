# CMS Operation Manual

## Start and Stop

- Copy `.env.example` to `.env` and replace database credentials and `JWT_SECRET`.
- Start: `docker compose up -d --build`
- Stop: `docker compose down`
- Logs: `docker compose logs -f cms-backend cms-frontend postgres`

## Ports

- Frontend branch preview: `http://localhost:5173`
- Backend API: `http://localhost:8080`
- PostgreSQL: `localhost:5432`

## Volumes

- `postgres-data`: database files.
- `uploads-data`: local uploaded files mounted at `/app/uploads`.

## Health

- Backend: `GET /api/health`
- Compose healthchecks gate frontend startup on backend and backend startup on PostgreSQL.

## Initialization Constraint

PostgreSQL runs files in `database/init/` only when the database volume is first created. Existing volumes require a migration workflow or volume recreation after backup.
