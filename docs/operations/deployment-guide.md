# Deployment Guide

## Build and Start

```bash
docker compose up -d --build
```

## Rebuild One Service

```bash
docker compose build cms-backend
docker compose up -d cms-backend
```

```bash
docker compose build cms-frontend
docker compose up -d cms-frontend
```

## Restart

```bash
docker compose restart cms-backend cms-frontend
```

## Verification

```bash
curl -fsS http://localhost:8080/api/health
scripts/smoke-test.sh
```
