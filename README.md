# Miyan Web Platform

Full-stack web platform for Miyan Group, combining a Django REST API, a Nuxt 3 SSR frontend, and a Telegram bot used for inventory workflows.

<p align="center">
  <img src="frontend/public/images/miyan_logo_black.png" width="220" alt="Miyan logo">
</p>

## Highlights

- Django REST API with inventory workflows and staff tooling
- Nuxt 3 SSR frontend with production-ready deployment
- Telegram bot for staff inventory updates
- Docker Compose orchestration with Nginx reverse proxy

## Architecture

```
[Browser] -> [Nginx] -> /api  -> backend:8000 -> Postgres
                   \-> /     -> frontend:3000

[Telegram] -> telegram-bot -> backend:8000
```

## Media

<p>
  <img src="frontend/assets/images/miyan/miyan_group_1.jpeg" width="300" alt="Miyan team">
  <img src="frontend/assets/images/miyan/miyan_green_bean.jpg" width="300" alt="Miyan product">
  <img src="frontend/assets/images/beresht/beresht_3.jpeg" width="300" alt="Beresht product">
</p>

## Repository layout

- `backend/`: Django project + Dockerfile
- `frontend/`: Nuxt app + Dockerfile
- `telegram-bot/`: Telegram bot service
- `docker-compose.yml`: Production docker-compose for all services
- `default.conf`: Example Nginx reverse proxy configuration

## Quick start (Docker)

1. Create environment files from templates:
   - `cp .env.example backend/.env`
   - `cp .env.example frontend/.env`
   - `cp .env.example telegram-bot/.env`
2. Start the stack:
   - `docker compose up -d --build`
3. Verify:
   - Backend health: `http://localhost:8000/api/core/health/`
   - Frontend: `http://localhost:3000/`

The backend container waits for Postgres, runs migrations, and collects static files on startup.

## Local development (without Docker)

Backend:
1. `cd backend`
2. `python -m venv .venv && source .venv/bin/activate`
3. `cp ../.env.example .env`
4. Ensure Postgres is available and matches the `.env` values
5. `pip install -r requirements.txt`
6. `python manage.py migrate`
7. `python manage.py runserver`

Frontend:
1. `cd frontend`
2. `cp ../.env.example .env`
3. `npm ci`
4. `npm run dev`

Telegram bot:
1. `cd telegram-bot`
2. `cp ../.env.example .env`
3. `python -m venv .venv && source .venv/bin/activate`
4. `pip install -r requirements.txt`
5. `python bot.py`

## Environment configuration

Each service loads its own environment file:

- `backend/.env` for Django and Postgres credentials
- `frontend/.env` for Nuxt public runtime configuration
- `telegram-bot/.env` for Telegram credentials and API URL

Do not commit real secrets. Use the `.env.example` templates instead.

## Deployment

- Use `docker-compose.yml` to build and run all services.
- The recommended setup is Nginx on the host proxying:
  - `/` -> `127.0.0.1:3000`
  - `/api` -> `127.0.0.1:8000`
- See `default.conf` for the example Nginx configuration.

## License

No license is included. If you plan to open source this project, add a license before publishing.
