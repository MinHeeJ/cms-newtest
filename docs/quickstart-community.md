# Community MVP Quickstart

This repository contains a Spring Boot REST API, React frontend, PostgreSQL migrations, seed data, OpenAPI contract copy, and branch-preview Docker Compose wiring.

## Services

- Backend API: `http://localhost:8080`
- Frontend: `http://localhost:5173`
- PostgreSQL: `localhost:5432`, database/user/password `cms`

## Preview Startup

```bash
docker compose up --build
```

The backend applies Flyway migrations and loads representative seed data when `SPRING_SQL_INIT_MODE=always` is set by Compose.

Seed accounts all use password `password1234`:

- `admin@example.com` / `ADMIN`
- `moderator@example.com` / `MODERATOR`
- `member@example.com` / `MEMBER`
- `writer@example.com` / `MEMBER`

## Validation Paths

- Public browse: open `/`, select a board, then open a post.
- Member flow: sign in, open `/write`, create a post, comment, react, bookmark, and subscribe.
- Search flow: use the header search or `/search?q=작성`.
- Notification flow: open `/notifications` after another member comments on your post.
- Moderation flow: report a post, then sign in as moderator/admin and open `/moderation/reports`.
- Admin flow: sign in as admin and open `/admin`, `/admin/boards`, `/admin/notices`, and `/admin/roles`.

## Contract

The implementation contract is copied to `docs/contracts/openapi.yaml`. Backend contract smoke tests check that the core endpoint and error envelope names remain present.
