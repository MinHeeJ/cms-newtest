#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${BASE_URL:-http://localhost:8080}"

echo "health"
curl -fsS "$BASE_URL/api/health" | grep -q "UP"

echo "login admin"
ADMIN_TOKEN="$(
  curl -fsS -H 'Content-Type: application/json' \
    -d '{"username":"admin","password":"admin123"}' \
    "$BASE_URL/api/v1/auth/login" \
  | sed -n 's/.*"token":"\([^"]*\)".*/\1/p'
)"
test -n "$ADMIN_TOKEN"

echo "portal folders"
curl -fsS -H "Authorization: Bearer $ADMIN_TOKEN" "$BASE_URL/api/v1/portal/folders" | grep -q '"success":true'

echo "regular user admin forbidden"
USER_TOKEN="$(
  curl -fsS -H 'Content-Type: application/json' \
    -d '{"username":"user","password":"user123"}' \
    "$BASE_URL/api/v1/auth/login" \
  | sed -n 's/.*"token":"\([^"]*\)".*/\1/p'
)"
STATUS="$(curl -s -o /tmp/cms-admin-check.json -w '%{http_code}' -H "Authorization: Bearer $USER_TOKEN" "$BASE_URL/api/v1/admin/folders")"
test "$STATUS" = "403"

echo "ok"
