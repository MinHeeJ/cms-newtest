# Backup and Restore

## PostgreSQL Backup

```bash
docker compose exec postgres pg_dump -U cms -d cms -Fc -f /tmp/cms.dump
docker compose cp postgres:/tmp/cms.dump ./cms.dump
```

## Upload Backup

```bash
docker run --rm -v cms-26-scope-analysis-20260612t000935_uploads-data:/data -v "$PWD":/backup alpine tar czf /backup/uploads.tgz -C /data .
```

Adjust the volume name if Docker Compose prefixes it differently.

## Restore

1. Stop application writes.
2. Restore PostgreSQL with `pg_restore -U cms -d cms --clean`.
3. Restore `uploads-data` from the archive.
4. Start services and verify `/api/health`, portal folder list, and sample downloads.
