# Miyan Web Platform

Full-stack web platform for Miyan Group, with a Django REST API backend and a Nuxt 3 SSR frontend.

<p align="center">
  <img src="frontend/public/images/miyan_logo_black.png" width="220" alt="Miyan logo">
</p>

## Architecture

```
[Browser] -> frontend:3000
[Browser/API clients] -> backend:8000/api

backend:8000 -> SQLite
```

## Repository layout

- `backend/`: Django project + Dockerfile + startup entrypoint (migrations, seed, collectstatic)
- `frontend/`: Nuxt app + Dockerfile
- `docker-compose.yml`: single project orchestrator for local build/run

## Quick start (Docker, local)

1. Build and run everything:
   - `docker compose up --build`
2. Open in browser:
   - Frontend: `http://localhost:3030`
   - Backend health: `http://localhost:8080/api/core/health/`

On backend startup, the entrypoint applies migrations, seeds curated data, and collects static files using the configured SQLite database.

## Optional environment overrides

`docker-compose.yml` already contains local-safe defaults. If you want to override values, create a root `.env` file (Docker Compose auto-loads it) and set values such as:

- `DJANGO_DEBUG`
- `DJANGO_ALLOWED_HOSTS`
- `DJANGO_CORS_ALLOWED_ORIGINS`
- `DJANGO_CSRF_TRUSTED_ORIGINS`
- `NUXT_PUBLIC_API_BASE_URL`

For local non-Docker development, copy `.env.example` into `backend/.env` and `frontend/.env`.

## Local development (without Docker)

Backend:
1. `cd backend`
2. `python -m venv .venv && source .venv/bin/activate`
3. `cp ../.env.example .env`
4. `pip install -r requirements.txt`
5. Ensure the SQLite database path in `.env` is writable (default: `db.sqlite3` inside the backend folder) and matches your environment.
6. `python manage.py migrate`
7. `python manage.py runserver`

Frontend:
1. `cd frontend`
2. `cp ../.env.example .env`
3. `npm ci`
4. `npm run dev`

## M1/macOS and cross-platform server compatibility

The stack now defaults to multi-arch-capable images (`python:3.12-slim`, `node:20-alpine`, and official Debian/Alpine repos), so it can run on different server architectures.

- Leave `DOCKER_PLATFORM` empty for host-native builds/runs (recommended).
- To force a specific target architecture, set `DOCKER_PLATFORM` in your `.env` (for example `linux/amd64` or `linux/arm64`).

For true multi-architecture publishing, use BuildKit:

```bash
# one-time setup per machine
docker buildx create --use --name miyan-builder

# example: build & push backend (from repo root)
docker buildx build --platform linux/amd64,linux/arm64 \
  -f backend/Dockerfile -t <your-registry>/miyan-backend:latest --push .

# example: build & push frontend
docker buildx build --platform linux/amd64,linux/arm64 \
  -f frontend/Dockerfile -t <your-registry>/miyan-frontend:latest --push ./frontend
```

## Deployment notes

- Local defaults are intentionally development-safe (no forced HTTPS redirect).
- For production, override security-related settings (`DJANGO_SECURE_SSL_REDIRECT`, secure cookie flags, trusted origins/hosts).

## License

No license is included. If you plan to open source this project, add a license before publishing.
