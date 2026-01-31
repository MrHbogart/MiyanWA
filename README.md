# Miyan Web App

Full-stack web platform for Miyan Group, composed of a Django REST API, a Nuxt 3 SSR frontend, and a Telegram bot used for inventory workflows.

## Stack

- Backend: Django 4 + Django REST Framework + Gunicorn
- Frontend: Nuxt 3 (SSR)
- Bot: Python (Telegram bot)
- Database: Postgres 15
- Deployment: Docker Compose + Nginx reverse proxy

## Services

```
[Browser] -> [Nginx] -> /api  -> backend:8000 -> Postgres
                   \-> /     -> frontend:3000

[Telegram] -> telegrambot -> backend:8000
```

## Repository layout

- `Miyan_Backend/`: Django project, Dockerfile, backend compose, and CI workflow
- `Miyan_Frontend/`: Nuxt app, Dockerfile, and CI workflow
- `Miyan_TelegramBot/`: Telegram bot service
- `miyan-compose.yml`: Production docker-compose for all services
- `default.conf`: Example Nginx reverse proxy configuration

## Quick start (Docker)

1. Create environment files from templates:
   - `cp Miyan_Backend/.env.example Miyan_Backend/.env`
   - `cp Miyan_Frontend/.env.example Miyan_Frontend/.env`
   - `cp Miyan_TelegramBot/.env.example Miyan_TelegramBot/.env`
2. Start the stack:
   - `docker compose -f miyan-compose.yml up -d --build`
3. Verify:
   - Backend health: `http://localhost:8000/api/core/health/`
   - Frontend: `http://localhost:3000/`

The backend container waits for Postgres, runs migrations, and collects static files on startup.

## Local development (without Docker)

Backend:
1. `cd Miyan_Backend`
2. `python -m venv .venv && source .venv/bin/activate`
3. `cp .env.example .env`
4. Ensure Postgres is available and matches the `.env` values
5. `pip install -r requirements.txt`
6. `python manage.py migrate`
7. `python manage.py runserver`

Frontend:
1. `cd Miyan_Frontend`
2. `cp .env.example .env`
3. `npm ci`
4. `npm run dev`

Telegram bot:
1. `cd Miyan_TelegramBot`
2. `cp .env.example .env`
3. `python -m venv .venv && source .venv/bin/activate`
4. `pip install -r requirements.txt`
5. `python bot.py`

## Environment configuration

Each service loads its own environment file:

- `Miyan_Backend/.env` for Django and Postgres credentials
- `Miyan_Frontend/.env` for Nuxt public runtime configuration
- `Miyan_TelegramBot/.env` for Telegram credentials and API URL

Do not commit real secrets. Use the `.env.example` templates instead.

## Deployment

- Use `miyan-compose.yml` to build and run all services.
- The recommended setup is Nginx on the host proxying:
  - `/` -> `127.0.0.1:3000`
  - `/api` -> `127.0.0.1:8000`
- See `default.conf` for the example Nginx configuration.

## CI

GitHub Actions workflows are included in:

- `Miyan_Backend/.github/workflows/ci.yml`
- `Miyan_Frontend/.github/workflows/ci.yml`

They run lint/test/build steps and can be extended for deployment.

## License

No license is included. If you plan to open source this project, add a license before publishing.
