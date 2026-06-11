# CMS Integrated Knowledge Document System

Greenfield CMS implementation for the generated CMS task scope.

## Architecture

- Frontend: React 18, Vite 5, React Router 6, Zustand, Axios, Tailwind CSS v4 via `@tailwindcss/vite`, local shadcn-style components, `lucide-react` icons only.
- Backend: Java 17, Spring Boot 3.3, Spring Security stateless JWT, jjwt 0.11.x, MyBatis Plus 3.5.9, PostgreSQL 16.
- Storage: PostgreSQL metadata plus local upload volume through `StorageService`.
- Deployment: Docker Compose services `cms-frontend`, `cms-backend`, and `postgres`.

## Run

```bash
cp .env.example .env
docker compose up -d --build
```

- Frontend: http://localhost:5173
- Backend health: http://localhost:8080/api/health
- Demo admin: `admin` / `admin123`
- Demo portal user: `user` / `user123`

## Tests

```bash
cd backend && ./mvnw test
cd frontend && npm run test -- --run
cd frontend && npm run build
scripts/smoke-test.sh
```

Dependencies were not installed and commands were not run in this implementation pass per task instruction.

## Operations

- [Operation manual](docs/operations/operation-manual.md)
- [Deployment guide](docs/operations/deployment-guide.md)
- [Backup and restore](docs/operations/backup-restore.md)
- [Incident response](docs/operations/incident-response.md)
- [Handover checklist](docs/operations/handover-checklist.md)
- [Service API](docs/service-api.md)
- [Performance checks](docs/performance/cms-performance-check.md)
