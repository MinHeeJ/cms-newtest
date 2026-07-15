#!/usr/bin/env bash
set -euo pipefail
: "${POSTGRES_CONTAINER:=cms-postgres}"
: "${BACKUP_DIR:=./backups}"
mkdir -p "$BACKUP_DIR"
docker exec "$POSTGRES_CONTAINER" pg_dump -U "${POSTGRES_USER:-cms}" "${POSTGRES_DB:-cms}" > "$BACKUP_DIR/cms.sql"
sha256sum "$BACKUP_DIR/cms.sql" > "$BACKUP_DIR/cms.sql.sha256"
printf '백업 완료: %s\n' "$BACKUP_DIR/cms.sql"
