# CMS Performance Check

## Targets

- Folder tree: 500 folders within 500 ms target.
- Article list/detail: 200 ms target for normal reads.
- Search: 1 second target with 50 result cap.
- Upload: 10 MB file within 5 seconds target.

## Manual Check Procedure

1. Seed or import representative folders, articles, and attachments.
2. Use browser network timing for portal folder expansion and article detail.
3. Use `curl -w` or an API client to measure `/api/v1/portal/search?q=...`.
4. Upload a 10 MB allowed file through admin attachment UI.
5. Record p50/p95 timings and database query plans when targets are missed.

## Improvement Levers

- Verify indexes listed in `docs/performance/postgresql-index-check.md`.
- Limit portal payloads to visible metadata.
- Keep search result limit at or below 50.
- Move binary storage to object storage if local disk throughput is insufficient.
