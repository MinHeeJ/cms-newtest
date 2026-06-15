# Idea Notebook Implementation Notes

## Scope

아이디어 메모장은 React UI와 Express API를 분리한 TypeScript 앱이다. 저장소는 Node 22 내장 `node:sqlite` 기반 SQLite 파일을 사용하며, API path와 payload는 `.aiops-spec/contracts/openapi.yaml`의 `PATCH /api/ideas/{ideaId}` 계약을 따른다.

## Source Layout

- `backend/src/app.ts`: Express 앱 부트스트랩, migration 실행, route wiring
- `backend/src/db/migrations/index.ts`: `ideas`, `tags`, `idea_tags`, `idea_action_items` SQLite schema
- `backend/src/repositories/*`: SQLite persistence operations
- `backend/src/services/*`: validation 이후 도메인 규칙과 not found/conflict 처리
- `frontend/src/App.tsx`: `/`, `/ideas`, `/ideas/new`, `/ideas/:ideaId`, `/archive`, `/tags` routes
- `frontend/src/features/ideas/*`: 검색, 필터, 목록, editor, 저장 상태, 실행 항목 UI
- `frontend/src/styles/*`: mandatory neobrutalist token/layout/accessibility styling

## Runtime

Local development expects dependencies to be installed before running:

```bash
npm install
npm run dev --workspace backend
npm run dev --workspace frontend
```

Branch preview can use Docker Compose:

```bash
docker compose up --build
```

The API is published on `http://localhost:3000`; the web app is published on `http://localhost:5173`.

## Smoke Checks

1. Open `http://localhost:5173`.
2. Create an idea with title, body, tags, and accent color.
3. Confirm the save badge transitions through saving to saved.
4. Search the list and combine tag/status/pinned filters.
5. Open detail, add action items, complete one, then archive and restore the idea.
6. Delete an idea through the confirmation dialog.

## Design Notes

The UI follows the generated neobrutalist contract:

- Fixed `70px` global header.
- Graph-paper background at `70px` grid size.
- Major layout borders use `4px`; components use `2px`.
- Resting shadow is `4px 4px 0 0 black`.
- Hover interactions collapse the shadow by moving `4px` down/right.
- Primary CTA uses `accent-yellow`; saved state uses mint; failed/destructive state uses coral; developing/selected filter uses sky.
