# Backup and Restore

## PostgreSQL Backup

```bash
docker compose exec postgres pg_dump -U cms -d cms > backup/cms.sql
```

## Upload Backup

```bash
docker run --rm -v cms_uploads-data:/data -v "$PWD/backup:/backup" alpine tar czf /backup/uploads.tgz -C /data .
```

## Restore

1. Stop application traffic.
2. Restore PostgreSQL with `psql -U cms -d cms < backup/cms.sql`.
3. Restore uploads into the uploads volume.
4. Start services and run `scripts/smoke-test.sh`.

Keep database and uploads backups from the same maintenance window to preserve attachment consistency.
