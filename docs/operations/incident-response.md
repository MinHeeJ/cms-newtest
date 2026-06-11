# Incident Response

## Triage

- Check `docker compose ps` for unhealthy services.
- Check `docker compose logs --tail=200 cms-backend`.
- Verify `/api/health`.
- Confirm database health with `pg_isready`.

## Common Categories

- Authentication: expired JWT or invalid role profile.
- Data: inactive folders, unpublished documents, deleted records.
- Upload: extension, size, path policy, or volume capacity.
- Search: missing indexes or unexpectedly broad keywords.
- Deployment: stale images, missing environment variables, existing initialized database volume.

## Record

For each incident, record time, impact, cause, corrective action, and prevention item.
