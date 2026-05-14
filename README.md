# PULS ERP — Лендинг

Одностраничный сайт-витрина PULS ERP. Стек: Astro 6.3 + Tailwind 4 + Onest.

## Локальный запуск

Требуется Node 22+.

```bash
npm install
npm run dev
```

Дев-сервер откроется на `http://localhost:4321/`.

## Сборка production-билда

```bash
npm run build
```

Готовая статика в `dist/`. Эту папку можно загрузить на любой статический хостинг
(Selectel CDN, Timeweb, Beget, NGINX, GitHub Pages).

## Подключение домена

1. Купить домен `puls-erp.ru` (REG.RU, RU-CENTER, Beget — любой регистратор)
2. Развернуть собранный `dist/` на сервере или у статик-хостинга
3. Указать в DNS-зоне A-запись на IP сервера или CNAME на хостинг
4. Включить HTTPS (Let's Encrypt — бесплатно, у большинства хостингов автоматически)

## Структура

```
src/
├── layouts/Layout.astro              # base layout, мета, шрифт, JS-аним
├── components/
│   ├── Icon.astro                    # SVG-иконки (Lucide-style)
│   ├── WireSection.astro             # секция-обёртка с нумерацией
│   ├── RefCard.astro                 # карточка с изображением
│   ├── Hero.astro                    # первый экран
│   ├── PulseDashboard.astro          # интерактивный mockup с 3 сценариями
│   └── ContactForm.astro             # форма заявок
├── data/scenarios.ts                 # данные 3 сценариев дашборда
├── pages/index.astro                 # сборка всех секций
└── styles/global.css                 # CSS-токены, базовые стили
```

## Палитра и шрифт

- `#202F4D` — primary (navy)
- `#FF3A4A` — accent (красный, CTA)
- `#FFFFFF` — фон
- `#747476` / `#D0D0D0` / `#EFEFEF` — серые
- Onest 300/400/500/700/900 через Google Fonts

## Форма заявок

Заявки идут через Google Apps Script webhook → Google Sheet (архив) + Telegram-бот
(уведомление в чат Артёма). Webhook URL и токен бота — в `.env` (см. `.env.example`).
