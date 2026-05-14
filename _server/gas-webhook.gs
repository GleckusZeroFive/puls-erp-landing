/**
 * PULS ERP — Google Apps Script webhook для формы заявок.
 *
 * Принимает application/x-www-form-urlencoded POST с полями
 *   name, company, contact, consent, source, ts, trap (honeypot)
 *
 * Действия:
 *   1) Honeypot — если поле trap заполнено, возвращает ok без записи (бот)
 *   2) Записывает строку в Google Sheet (привязан к скрипту, активный лист)
 *   3) Отправляет уведомление в Telegram через бот (если TG_BOT_TOKEN и
 *      TG_CHAT_ID заданы в Script Properties)
 *
 * Развёртывание:
 *   - Откройте https://script.google.com/, создайте новый проект, прикрепите
 *     к нужной Google-таблице через Resources → Libraries или просто откройте
 *     Apps Script из меню Extensions в таблице
 *   - Скопируйте этот файл целиком, замените содержимое Code.gs
 *   - В Project Settings → Script Properties добавьте:
 *       TG_BOT_TOKEN = <токен бота от @BotFather>
 *       TG_CHAT_ID   = <chat_id куда слать уведомления>
 *   - Deploy → New deployment → Type: Web app
 *       Execute as: Me
 *       Who has access: Anyone
 *   - Скопируйте Web App URL, положите в .env как PUBLIC_FORM_WEBHOOK_URL
 *
 * Получить TG_CHAT_ID: написать боту /start, открыть
 *   https://api.telegram.org/bot<TOKEN>/getUpdates — взять chat.id из ответа.
 */

const SHEET_HEADERS = [
  "Время",
  "Имя",
  "Компания",
  "Контакт",
  "Согласие",
  "Источник",
];

function doPost(e) {
  try {
    const p = (e && e.parameter) || {};

    // Honeypot — бот заполнил скрытое поле, тихо отвечаем ok
    if (p.trap) return jsonResponse({ ok: true, dropped: "trap" });

    const name = sanitize(p.name);
    const contact = sanitize(p.contact);
    if (!name || !contact) {
      return jsonResponse({ ok: false, error: "missing fields" });
    }
    const company = sanitize(p.company);
    const consent = p.consent ? "да" : "нет";
    const source = sanitize(p.source) || "lp";

    appendToSheet([new Date(), name, company, contact, consent, source]);

    const tgError = notifyTelegram({ name, company, contact, source });

    return jsonResponse({ ok: true, telegram: tgError ? "skipped" : "sent" });
  } catch (err) {
    console.error(err);
    return jsonResponse({ ok: false, error: String(err && err.message || err) });
  }
}

function doGet() {
  return jsonResponse({ ok: true, service: "puls-erp-landing-webhook" });
}

function appendToSheet(row) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) throw new Error("script must be bound to a spreadsheet");
  const sheet = ss.getActiveSheet();
  if (sheet.getLastRow() === 0) sheet.appendRow(SHEET_HEADERS);
  sheet.appendRow(row);
}

function notifyTelegram(payload) {
  const props = PropertiesService.getScriptProperties();
  const token = props.getProperty("TG_BOT_TOKEN");
  const chatId = props.getProperty("TG_CHAT_ID");
  if (!token || !chatId) return "missing-credentials";

  const text =
    "🔥 *Новая заявка PULS ERP*\n\n" +
    "*Имя:* " + escapeMd(payload.name) + "\n" +
    "*Компания:* " + (escapeMd(payload.company) || "—") + "\n" +
    "*Контакт:* " + escapeMd(payload.contact) + "\n" +
    "*Источник:* " + escapeMd(payload.source);

  const res = UrlFetchApp.fetch(
    "https://api.telegram.org/bot" + token + "/sendMessage",
    {
      method: "post",
      contentType: "application/json",
      payload: JSON.stringify({
        chat_id: chatId,
        text: text,
        parse_mode: "Markdown",
        disable_web_page_preview: true,
      }),
      muteHttpExceptions: true,
    }
  );
  const code = res.getResponseCode();
  if (code >= 300) {
    console.warn("telegram " + code + ": " + res.getContentText());
    return "http-" + code;
  }
  return null;
}

function sanitize(v) {
  if (v == null) return "";
  return String(v).trim().slice(0, 500);
}

function escapeMd(s) {
  return String(s || "").replace(/([_*\[\]()`])/g, "\\$1");
}

function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
