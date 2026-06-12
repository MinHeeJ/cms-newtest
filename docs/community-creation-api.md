# Community Creation API

The implementation contract is copied to `backend/src/main/resources/contracts/community-creation-openapi.yaml`.

Local preview endpoints:

- Member creation: `POST /api/v1/community-creation/requests`
- Slug availability: `POST /api/v1/community-creation/slug-check`
- Draft update: `PATCH /api/v1/community-creation/requests/{requestId}`
- Boards: `PUT /api/v1/community-creation/requests/{requestId}/boards`
- Rules: `PUT /api/v1/community-creation/requests/{requestId}/rules`
- Moderator invitations: `PUT /api/v1/community-creation/requests/{requestId}/moderator-invitations`
- Media metadata: `PUT /api/v1/community-creation/requests/{requestId}/media`
- Submission: `POST /api/v1/community-creation/requests/{requestId}/submit` with `Idempotency-Key`
- Operator queue: `GET /api/v1/admin/community-creation/reviews`
- Operator decision: `POST /api/v1/admin/community-creation/reviews/{requestId}/decision`

For local MVP auth simulation, pass `X-User-Id` and `X-User-Role`. Operator endpoints require `X-User-Role: OPERATOR`, `ADMIN`, or `SUPER_ADMIN`.
