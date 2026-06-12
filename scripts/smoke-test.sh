#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${BASE_URL:-http://localhost:8080}"

echo "Checking backend health"
curl -fsS "${BASE_URL}/api/health" >/dev/null

echo "Logging in as regular user"
TOKEN="$(curl -fsS -H 'Content-Type: application/json' \
  -d '{"username":"user","password":"user123"}' \
  "${BASE_URL}/api/v1/auth/login" | sed -n 's/.*"accessToken":"\([^"]*\)".*/\1/p')"

if [[ -z "${TOKEN}" ]]; then
  echo "Could not extract JWT token" >&2
  exit 1
fi

echo "Checking portal folders"
curl -fsS -H "Authorization: Bearer ${TOKEN}" "${BASE_URL}/api/v1/portal/folders" >/dev/null

echo "Checking regular user is forbidden from admin API"
STATUS="$(curl -s -o /tmp/cms-admin-forbidden.json -w '%{http_code}' -H "Authorization: Bearer ${TOKEN}" "${BASE_URL}/api/v1/admin/folders")"
if [[ "${STATUS}" != "403" ]]; then
  echo "Expected 403 for admin API, got ${STATUS}" >&2
  cat /tmp/cms-admin-forbidden.json >&2
  exit 1
fi

echo "Smoke test passed"
