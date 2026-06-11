# Deployment Guide

## Build and Run

```bash
docker compose up -d --build
```

## Rebuild One Service

```bash
docker compose build cms-backend
docker compose up -d cms-backend
```

## Restart

```bash
docker compose restart cms-backend cms-frontend
```

## Environment

Runtime configuration belongs in `.env` or the target platform secret manager. `JWT_SECRET` must contain only English letters and numbers and be at least 32 characters long.
