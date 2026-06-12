# Incident Response

## Triage

- Health: `curl http://localhost:8080/api/health`
- Logs: `docker compose logs --tail=200 cms-backend`
- Database: `docker compose ps postgres`
- Disk: inspect the `uploads-data` volume host usage.

## Categories

- Authentication: check JWT secret format and token expiry.
- Data: check PostgreSQL health and schema initialization state.
- Upload: check allowed extensions, 10 MB file limit, 20 MB request limit, and volume permissions.
- Search: verify article status, folder active flag, and indexes.
- Deployment: confirm compose service health and network names.

Record cause, mitigation, data impact, and recurrence prevention for each production incident.
