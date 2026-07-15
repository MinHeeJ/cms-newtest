#!/usr/bin/env bash
set -euo pipefail
backup_file="${1:?backup sql path is required}"
checksum_file="${backup_file}.sha256"
sha256sum -c "$checksum_file"
printf '복구 파일 checksum 검증 완료: %s\n' "$backup_file"
