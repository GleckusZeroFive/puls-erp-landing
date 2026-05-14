# Бэкенд формы заявок

Лендинг — статика на GitHub Pages, поэтому форма работает через внешний
serverless-приёмник. Самый простой и бесплатный вариант — Google Apps
Script, прикреплённый к Google-таблице. Заявки попадают в таблицу
(архив) и дублируются в Telegram-бота (быстрое уведомление).

## Архитектура

```
Лендинг (Astro static)
   │
   │  fetch POST application/x-www-form-urlencoded
   ▼
Google Apps Script (gas-webhook.gs)
   │
   ├─→ appendRow в Google Sheet  (архив заявок)
   └─→ sendMessage в Telegram     (push-уведомление)
```

CORS preflight'а нет — отправка `x-www-form-urlencoded` без кастомных
заголовков, GAS принимает напрямую.

## Развёртывание — пошагово

### 1. Google-таблица для архива

1. Создать пустую таблицу на Google Drive (например `PULS ERP — заявки`).
2. Открыть **Расширения → Apps Script** — это создаст пустой
   привязанный к таблице GAS-проект.

### 2. Telegram-бот

1. В Telegram написать `@BotFather` → `/newbot` → имя `PULS ERP leads`,
   username `@PulsERPLeadsBot` (любое свободное).
2. Сохранить выданный токен (`123456:ABCDEF...`).
3. Написать боту `/start` от своего аккаунта.
4. Открыть `https://api.telegram.org/bot<ТОКЕН>/getUpdates` — взять
   `chat.id` из первого `message.from`.

### 3. Залить код

1. В GAS-проекте удалить заготовку `Code.gs`, вставить целиком
   содержимое [`gas-webhook.gs`](./gas-webhook.gs).
2. **Settings → Script Properties → Add property**:
   - `TG_BOT_TOKEN` = токен из шага 2.2
   - `TG_CHAT_ID` = chat.id из шага 2.4
3. **Deploy → New deployment**:
   - Type: **Web app**
   - Execute as: **Me**
   - Who has access: **Anyone**
   - Deploy → скопировать выданный **Web app URL**.

### 4. Прописать в лендинге

В `.env` production-site:

```bash
PUBLIC_FORM_WEBHOOK_URL=https://script.google.com/macros/s/AKfycb.../exec
```

Пересобрать билд (`npm run build`) и задеплоить.

## Проверка

- GET на webhook URL должен вернуть
  `{"ok":true,"service":"puls-erp-landing-webhook"}`.
- Отправка формы с лендинга → новая строка в таблице + сообщение в TG.
- В колонке «Источник» будет `puls-erp.ru/landing`.

## Замена бота / получателя

Изменить значения Script Properties в GAS — код пересобирать не нужно.

## Лимиты

GAS Web App: 20 000 запросов / день на бесплатном аккаунте. Для лендинга
с ранними клиентами этого хватит на много лет.
