# CMS Performance Check

Targets:

- Folder tree with 500 folders: 500ms target.
- Article list/detail: 200ms target.
- Search: 1s target.
- 10MB upload: 5s target.

Suggested checks:

```bash
time curl -fsS -H "Authorization: Bearer $TOKEN" "$BASE_URL/api/v1/portal/folders"
time curl -fsS -H "Authorization: Bearer $TOKEN" "$BASE_URL/api/v1/portal/articles?folderId=1"
time curl -fsS -H "Authorization: Bearer $TOKEN" "$BASE_URL/api/v1/portal/search?q=CMS"
```

If targets are missed, inspect query plans, result sizes, JVM logs, database CPU, and upload volume latency.
