# Operation Manual

## Start

```bash
cp .env.example .env
docker compose up -d --build
```

The frontend is published on `http://localhost:5173`; the backend health endpoint is `http://localhost:8080/api/health`.

## Stop

```bash
docker compose down
```

## Logs

```bash
docker compose logs -f cms-backend
docker compose logs -f cms-frontend
docker compose logs -f postgres
```

## Ports and Volumes

- `5173`: frontend branch preview.
- `8080`: backend API.
- `5432`: PostgreSQL.
- `postgres-data`: PostgreSQL data volume.
- `uploads-data`: uploaded files.

PostgreSQL init scripts run only when the database volume is first created. Existing volumes are not reinitialized automatically.
