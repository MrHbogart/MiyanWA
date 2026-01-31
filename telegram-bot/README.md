# Miyan Telegram Bot

Telegram bot used by staff for inventory workflows. The bot talks to the Django API and records stock updates with optional notes.

## Environment variables

Set in `.env` or via docker-compose:

- `TELEGRAM_TOKEN` (required) Bot token from BotFather
- `API_URL` (optional) API base URL, defaults to `http://backend:8000` in Docker

## Usage

Once running, the bot supports:

- `/link <bot_token>`: Link your Telegram account using the `bot_token` stored on the staff profile in Django admin.
- `/record <branch_id> <item_id> <quantity> [note]`: Submit an inventory record.

## Run locally

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python bot.py
```
