# Бэкенд формы заявок

Лендинг — статика на GitHub Pages, поэтому форма работает через внешний
serverless-приёмник. Самый простой и бесплатный вариант — Google Apps
Script, привязанный к Google-таблице.

Архив заявок попадает в Google-таблицу. Уведомления — на почту (всегда)
и опционально в Telegram (если когда-нибудь решим дублировать).

## Архитектура

```
Лендинг (Astro static)
   │
   │  fetch POST application/x-www-form-urlencoded
   ▼
Google Apps Script (gas-webhook.gs)
   │
   ├─→ appendRow в Google Sheet        (архив)
   ├─→ MailApp.sendEmail                (на pulserp72@yandex.com)
   └─→ Telegram sendMessage             (опционально)
```

CORS preflight'а нет — отправка `x-www-form-urlencoded` без кастомных
заголовков, GAS принимает напрямую.

## Развёртывание — пошагово

### 1. Google-таблица для архива

Сценарий «таблицу создаёт Артём, мы получаем Editor-доступ»:

1. Артём на `drive.google.com` создаёт пустую Google-таблицу `PULS ERP — заявки`.
2. «Поделиться» → email исполнителя → роль **Editor**.
3. Таблица остаётся в собственности Артёма, мы только редактируем
   скрипт. Если когда-нибудь передавать другому исполнителю —
   достаточно сменить email в правах доступа.

### 2. Скрипт (standalone-режим)

Чтобы письма с заявками уходили не от чьей-то личной почты, проект создаётся
под отдельным служебным Google-аккаунтом (например, `pulserp.team@gmail.com`).
Таблица Артёма расшаривается с этим аккаунтом как Editor; скрипт открывает её
по жёсткому `SHEET_ID` внутри кода.

1. Создать служебный Google-аккаунт (если ещё нет).
2. Войти в этот аккаунт → `https://script.google.com/u/0/home` →
   **«Создать проект»**.
3. Удалить дефолтный `function myFunction() {}`, вставить целиком
   [`gas-webhook.gs`](./gas-webhook.gs). Сохранить (Ctrl+S).
4. Расшарить таблицу-приёмник с этим служебным аккаунтом как Editor
   (из аккаунта-владельца Sheet — у нас это `artem.plechev@gmail.com`).
5. **Project Settings → Script Properties → Add property**:

   | Ключ | Значение | Обязателен |
   |---|---|---|
   | `NOTIFY_EMAIL` | `pulserp72@yandex.com` | ✅ |
   | `TG_BOT_TOKEN` | токен от `@BotFather` (для TG-канала) | ❌ |
   | `TG_CHAT_ID` | `chat.id` получателя | ❌ |

   Telegram оставляем пустым на старте — почты хватит. Если позже
   потребуется дубль в TG — добавим эти два значения, код пересобирать
   не нужно.

6. **Deploy → New deployment**:
   - Type: **Web app**
   - Execute as: **Me** (служебный аккаунт; от него же уходят письма)
   - Who has access: **Anyone**
   - Deploy → пройти OAuth consent (Sheets / external service / Send mail as
     you — все три) → скопировать **Web app URL**.

### 3. Прописать в лендинге

В `.env` production-site:

```bash
PUBLIC_FORM_WEBHOOK_URL=https://script.google.com/macros/s/AKfycb.../exec
```

Пересобрать (`npm run build`), задеплоить (`git push` — GitHub Action
сам выкатит).

## Проверка

- **GET** на webhook URL → `{"ok":true,"service":"puls-erp-landing-webhook"}`.
- Отправка формы с лендинга → новая строка в таблице + письмо на
  `pulserp72@yandex.com`. В колонке «Источник» будет `puls-erp.ru/landing`.
- Письмо приходит от вида `Имя <gmail-владельца@gmail.com>` с заголовком
  `PULS ERP — лендинг`. На свежий Yandex-ящик первое письмо может попасть
  в «Спам» — однократно пометить как «Не спам», дальше будет в основной
  папке.

## Замена бота / получателя / письма

Менять значения **Script Properties** в GAS — код не пересобирать,
переразвёртывать тоже не нужно.

## Лимиты

- GAS Web App: 20 000 запросов / день — overkill.
- `MailApp.sendEmail`: 100 писем / день на бесплатном Google-аккаунте.
  Для пилотного запуска с 5-10 компаниями это много-кратный запас.
- При исчерпании лимита заявки всё равно попадают в Google-таблицу
  (это не зависит от почты).

## Что когда-нибудь стоит улучшить

- **Свой домен** `puls-erp.ru` для отправителя через Yandex 360 +
  SPF/DKIM — для идеальной доставки (сейчас от Gmail-аккаунта).
- **TG- или Max-канал** дублирования — `@BotFather` для TG (5 мин) или
  `business.max.ru/self` для Max (требует ИП-регистрации, 1-3 дня
  модерации).
- **Лимит на стороне формы** — сейчас 30 секунд через localStorage,
  можно усилить через `reCAPTCHA v3` если пойдёт спам.
