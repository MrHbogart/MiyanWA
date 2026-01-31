import os
import json
import requests
from pathlib import Path

from telegram import Update
from telegram.ext import Updater, CommandHandler, CallbackContext


API_URL = os.getenv('API_URL', 'http://backend:8000').rstrip('/')
TELEGRAM_TOKEN = os.getenv('TELEGRAM_TOKEN')
SHARED_SECRET = os.getenv('TELEGRAM_SHARED_SECRET') or os.getenv('BOT_SHARED_SECRET')
BOT_STATE_PATH = os.getenv('BOT_STATE_PATH', '/data/state.json')
STATE_FILE = Path(BOT_STATE_PATH)
DEFAULT_HEADERS = {'X-Forwarded-Proto': 'https'}
MAX_QUANTITY = 1_000_000


def load_state():
    if STATE_FILE.exists():
        try:
            return json.loads(STATE_FILE.read_text())
        except Exception:
            return {}
    return {}


def save_state(state):
    try:
        STATE_FILE.parent.mkdir(parents=True, exist_ok=True)
    except Exception:
        pass
    STATE_FILE.write_text(json.dumps(state))


state = load_state()


def _t(lang: str, fa: str, en: str) -> str:
    return fa if lang == 'fa' else en


def _get_language(telegram_id: str) -> str:
    staff = state.get(telegram_id, {}).get('staff', {})
    return staff.get('language_preference', 'fa')


def _reply(update: Update, telegram_id: str, fa: str, en: str):
    update.message.reply_text(_t(_get_language(telegram_id), fa, en))


def _api_request(method: str, path: str, *, headers=None, payload=None):
    url = f"{API_URL}{path}"
    try:
        resp = requests.request(
            method,
            url,
            headers=headers or DEFAULT_HEADERS,
            json=payload,
            timeout=10,
        )
    except Exception as exc:
        return None, f"ارتباط برقرار نشد: {exc}"

    if not resp.ok:
        try:
            detail = resp.json()
        except Exception:
            detail = resp.text
        return None, f"{resp.status_code}: {detail}"

    try:
        return resp.json(), None
    except Exception:
        return {}, None


def _auth_headers(telegram_id: str):
    token = state.get(telegram_id, {}).get('token')
    if not token:
        return None
    return {**DEFAULT_HEADERS, 'Authorization': f'Token {token}'}


def start(update: Update, context: CallbackContext):
    tid = str(update.effective_user.id)
    _reply(
        update,
        tid,
        "سلام! \n1) /link <توکن> نمونه: /link abcd123 \n2) /start_shift beresht یا /start_shift madi \n3) /items برای دیدن کد آیتم‌ها \n4) /record <کدآیتم> <مقدار> [توضیح] نمونه: /record 12 2.5 شیر کم",
        "Hey! \n1) /link <token> e.g. /link abcd123 \n2) /start_shift beresht or /start_shift madi \n3) /items to see item codes \n4) /record <item_id> <qty> [note] e.g. /record 12 2.5 no sugar",
    )


def link(update: Update, context: CallbackContext):
    args = context.args
    if not args:
        update.message.reply_text('Dastur: /link <bot_token>')
        return

    bot_token = args[0].strip()
    telegram_id = str(update.effective_user.id)
    payload = {'telegram_token': bot_token, 'telegram_id': telegram_id}
    data, err = _api_request('post', '/api/group/telegram/link/', headers=DEFAULT_HEADERS, payload=payload)
    if err:
        _reply(update, telegram_id, f'لینک نشد: {err}', f'Link failed: {err}')
        return

    token = data.get('token')
    staff = data.get('staff')
    if token:
        state[telegram_id] = {'token': token, 'staff': staff or {}, 'active_branch': None}
        save_state(state)
        _reply(
            update,
            telegram_id,
            '✅ لینک شد. قدم بعد: /start_shift beresht یا /start_shift madi',
            '✅ Linked. Next: /start_shift beresht or /start_shift madi',
        )
    else:
        _reply(update, telegram_id, 'توکن دریافت نشد. با ادمین هماهنگ کنید.', 'No token returned. Contact admin.')


def _ensure_shift(update: Update, telegram_id: str):
    headers = _auth_headers(telegram_id)
    if not headers:
        _reply(update, telegram_id, 'اول /link بزنید.', 'Please /link first.')
        return None
    data, err = _api_request('get', '/api/group/shifts/current/', headers=headers)
    if err:
        _reply(update, telegram_id, f'بررسی شیفت ناموفق: {err}', f'Cannot check shift: {err}')
        return None
    if data.get('active'):
        state.setdefault(telegram_id, {})
        state[telegram_id]['active_branch'] = data.get('branch')
        save_state(state)
        return data
    _reply(update, telegram_id, 'هیچ شیفت فعالی نیست. /start_shift beresht', 'No active shift. Run /start_shift beresht')
    return None


def start_shift(update: Update, context: CallbackContext):
    telegram_id = str(update.effective_user.id)
    if not context.args:
        _reply(
            update,
            telegram_id,
            'مثال: /start_shift beresht یا /start_shift madi',
            'Example: /start_shift beresht or /start_shift madi',
        )
        return
    branch_code = context.args[0].strip()
    headers = _auth_headers(telegram_id)
    if not headers:
        _reply(update, telegram_id, 'اول /link بزنید.', 'Please /link first.')
        return
    branches, err = _api_request('get', '/api/group/branches/', headers=DEFAULT_HEADERS)
    if err:
        _reply(update, telegram_id, f'گرفتن لیست شعب ناموفق: {err}', f'Cannot fetch branches: {err}')
        return

    branch_id = None
    for br in branches:
        if br.get('code') == branch_code:
            branch_id = br.get('id')
            break
    if not branch_id:
        _reply(update, telegram_id, 'شعبه پیدا نشد. beresht یا madi را بفرستید.', 'Branch not found. Use beresht or madi.')
        return
    data, err = _api_request(
        'post',
        '/api/group/shifts/start/',
        headers=headers,
        payload={'branch_id': branch_id},
    )
    if err:
        _reply(update, telegram_id, f'خطای شروع شیفت: {err}', f'Cannot start shift: {err}')
        return
    state.setdefault(telegram_id, {})
    state[telegram_id]['active_branch'] = data.get('branch')
    save_state(state)
    _reply(
        update,
        telegram_id,
        '✅ شیفت شروع شد. /items را بزن و بعد /record <کد> <مقدار>',
        '✅ Shift started. Run /items then /record <id> <qty>',
    )


def end_shift(update: Update, context: CallbackContext):
    telegram_id = str(update.effective_user.id)
    headers = _auth_headers(telegram_id)
    if not headers:
        _reply(update, telegram_id, 'اول /link بزنید.', 'Please /link first.')
        return
    _, err = _api_request('post', '/api/group/shifts/end/', headers=headers)
    if err:
        _reply(update, telegram_id, f'خطای پایان شیفت: {err}', f'Cannot end shift: {err}')
        return
    state.setdefault(telegram_id, {})
    state[telegram_id]['active_branch'] = None
    save_state(state)
    _reply(update, telegram_id, 'شیفت تمام شد.', 'Shift ended.')


def record(update: Update, context: CallbackContext):
    telegram_id = str(update.effective_user.id)
    if len(context.args) < 2:
        _reply(
            update,
            telegram_id,
            'نمونه: /record 12 2.5 توضیح',
            'Example: /record 12 2.5 note',
        )
        return

    headers = _auth_headers(telegram_id)
    if not headers:
        _reply(update, telegram_id, 'اول /link بزنید.', 'Please /link first.')
        return

    shift = _ensure_shift(update, telegram_id)
    if not shift:
        return
    branch = shift.get('branch') or state.get(telegram_id, {}).get('active_branch')
    if not branch:
        _reply(update, telegram_id, 'شعبه مشخص نیست. دوباره /start_shift بزن.', 'Branch missing. Run /start_shift again.')
        return
    item_id = context.args[0]
    quantity_raw = context.args[1]
    note = ' '.join(context.args[2:]) if len(context.args) > 2 else ''

    try:
        qty = float(quantity_raw)
    except ValueError:
        _reply(update, telegram_id, 'مقدار باید عدد باشد.', 'Quantity must be a number.')
        return
    if qty < 0 or qty > MAX_QUANTITY:
        _reply(update, telegram_id, 'مقدار قابل قبول نیست.', 'Quantity not acceptable.')
        return

    # validate item belongs to branch
    items, err = _api_request(
        'get',
        f"/api/group/inventory/items/?branch={branch.get('id')}",
        headers=headers,
    )
    if err:
        _reply(update, telegram_id, f'گرفتن لیست اقلام نشد: {err}', f'Cannot load items: {err}')
        return
    if not any(str(it.get('id')) == str(item_id) for it in items):
        _reply(update, telegram_id, 'این کد برای این شعبه نیست. /items را چک کن.', 'Item not for this branch. Check /items.')
        return

    payload = {'item': item_id, 'quantity': qty, 'note': note}
    _, err = _api_request(
        'post',
        '/api/group/inventory/inputs/',
        headers=headers,
        payload=payload,
    )
    if err:
        _reply(update, telegram_id, f'ثبت نشد: {err}', f'Not saved: {err}')
        return
    _reply(update, telegram_id, '✅ ثبت شد.', '✅ Saved.')


def branches_cmd(update: Update, context: CallbackContext):
    try:
        branches, err = _api_request('get', '/api/group/branches/', headers=DEFAULT_HEADERS)
        if err:
            raise RuntimeError(err)
        lines = [f"{br['code']}: {br['name']}" for br in branches]
        update.message.reply_text('\n'.join(lines))
    except Exception as e:
        update.message.reply_text(f'خطا: {e}')


def items_cmd(update: Update, context: CallbackContext):
    telegram_id = str(update.effective_user.id)
    headers = _auth_headers(telegram_id)
    if not headers:
        _reply(update, telegram_id, 'اول /link بزنید.', 'Please /link first.')
        return
    shift = _ensure_shift(update, telegram_id)
    if not shift:
        return
    branch = shift.get('branch') or state.get(telegram_id, {}).get('active_branch')
    if not branch:
        _reply(update, telegram_id, 'شعبه مشخص نیست. دوباره /start_shift بزن.', 'Branch missing. Run /start_shift again.')
        return
    try:
        items, err = _api_request(
            'get',
            f"/api/group/inventory/items/?branch={branch.get('id')}",
            headers=headers,
        )
        if err:
            raise RuntimeError(err)
        lines = [f"{it['id']}: {it['name']} ({it.get('unit','')})" for it in items]
        update.message.reply_text('Items:\n' + '\n'.join(lines[:100]))
    except Exception as e:
        update.message.reply_text(f'خطا: {e}')


def main():
    if not TELEGRAM_TOKEN:
        print('TELEGRAM_TOKEN env var is required')
        return

    updater = Updater(token=TELEGRAM_TOKEN, use_context=True)
    dp = updater.dispatcher

    dp.add_handler(CommandHandler('start', start))
    dp.add_handler(CommandHandler('link', link, pass_args=True))
    dp.add_handler(CommandHandler('start_shift', start_shift, pass_args=True))
    dp.add_handler(CommandHandler('end_shift', end_shift))
    dp.add_handler(CommandHandler('record', record, pass_args=True))
    dp.add_handler(CommandHandler('branches', branches_cmd))
    dp.add_handler(CommandHandler('items', items_cmd))

    print('Starting bot...')
    updater.start_polling()
    updater.idle()


if __name__ == '__main__':
    main()
