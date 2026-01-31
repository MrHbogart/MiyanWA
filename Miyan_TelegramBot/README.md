Telegram Bot for Miyan Inventory

Environment variables (set in `.env` or docker-compose):
- `TELEGRAM_TOKEN` - required, the bot token from BotFather
- `API_URL` - optional, default `http://backend:8000` when running in Docker

Usage (once running):
- `/link <bot_token>`: Link your Telegram account using the `bot_token` set on the staff profile in Django admin.
- `/record <branch_id> <item_id> <quantity> [note]`: Submit an inventory record.
