/**
 * PULS ERP — Google Apps Script webhook для формы заявок.
 *
 * Принимает application/x-www-form-urlencoded POST с полями
 *   name, company, contact, consent, source, ts, trap (honeypot)
 *
 * Действия:
 *   1) Honeypot — если поле trap заполнено, тихо отвечает ok (бот)
 *   2) Записывает строку в Google Sheet (открывается по SHEET_ID)
 *   3) Уведомление по email (всегда, если задан NOTIFY_EMAIL)
 *   4) Уведомление в Telegram (опционально, если заданы TG_BOT_TOKEN+TG_CHAT_ID)
 *
 * Standalone-режим: проект создаётся под отдельным служебным Google-аккаунтом
 * (например, pulserp.team@gmail.com), таблица Артёма расшарена с этим
 * аккаунтом как Editor. Письма уходят с адреса служебного аккаунта, не от
 * deployer'а.
 *
 * Развёртывание:
 *   - script.google.com → New project (под служебным аккаунтом)
 *   - Содержимое Code.gs замените целиком этим файлом
 *   - Project Settings → Script Properties → Add property:
 *       NOTIFY_EMAIL   = pulserp72@yandex.com           (адрес для писем)
 *       TG_BOT_TOKEN   = (опционально, токен от @BotFather)
 *       TG_CHAT_ID     = (опционально, chat.id получателя)
 *   - Deploy → New deployment → Type: Web app
 *       Execute as: Me
 *       Who has access: Anyone
 *   - Скопируйте Web App URL → в .env лендинга как PUBLIC_FORM_WEBHOOK_URL
 *
 * Лимиты MailApp.sendEmail: 100 писем/день для бесплатного Gmail-аккаунта.
 * Для пилотного запуска с 5–10 компаниями этого хватит с многократным запасом.
 */

const SHEET_ID = "1HraH4jGI30bR-gqrFyMeiJIio2u4PID7HO-XdkHvWM0";

const SHEET_HEADERS = [
  "Время",
  "Имя",
  "Компания",
  "Контакт",
  "Объектов",
  "Роль",
  "Боль",
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
    const objects = sanitize(p.objects);
    const role = sanitize(p.role);
    const pain = sanitize(p.pain);
    const consent = p.consent ? "да" : "нет";
    const source = sanitize(p.source) || "lp";
    const lead = { name, company, contact, objects, role, pain, consent, source, when: new Date() };

    appendToSheet([lead.when, lead.name, lead.company, lead.contact, lead.objects, lead.role, lead.pain, lead.consent, lead.source]);

    const channels = {
      email: sendEmailNotification(lead),
      telegram: sendTelegramNotification(lead),
    };

    return jsonResponse({ ok: true, channels });
  } catch (err) {
    console.error(err);
    return jsonResponse({ ok: false, error: String(err && err.message || err) });
  }
}

function doGet() {
  return jsonResponse({ ok: true, service: "puls-erp-landing-webhook" });
}

function appendToSheet(row) {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const sheet = ss.getActiveSheet();
  if (sheet.getLastRow() === 0) sheet.appendRow(SHEET_HEADERS);
  sheet.appendRow(row);
}

function sendEmailNotification(lead) {
  const props = PropertiesService.getScriptProperties();
  const to = props.getProperty("NOTIFY_EMAIL");
  if (!to) return "skipped:no-recipient";

  const subject = `Новая заявка PULS ERP — ${lead.name}`;
  const textBody =
    "Новая заявка с лендинга PULS ERP\n\n" +
    `Имя:       ${lead.name}\n` +
    `Компания:  ${lead.company || "—"}\n` +
    `Контакт:   ${lead.contact}\n` +
    `Объектов:  ${lead.objects || "—"}\n` +
    `Роль:      ${lead.role || "—"}\n` +
    `Боль:      ${lead.pain || "—"}\n` +
    `Согласие:  ${lead.consent}\n` +
    `Источник:  ${lead.source}\n` +
    `Время:     ${formatDate(lead.when)}\n\n` +
    "Все заявки также сохраняются в Google-таблице, привязанной к скрипту.";

  const htmlBody =
    '<div style="font-family:Onest,Arial,sans-serif;color:#202F4D;background:#fff;padding:24px;max-width:560px;border:1px solid #D0D0D0;border-radius:14px;">' +
    '<h2 style="margin:0 0 16px;color:#202F4D;font-size:20px;">Новая заявка PULS ERP</h2>' +
    '<table style="width:100%;border-collapse:collapse;font-size:14px;">' +
    row("Имя", escapeHtml(lead.name)) +
    row("Компания", escapeHtml(lead.company) || "—") +
    row("Контакт", `<a href="${contactLink(lead.contact)}" style="color:#FF3A4A;text-decoration:none;">${escapeHtml(lead.contact)}</a>`) +
    row("Объектов", escapeHtml(lead.objects) || "—") +
    row("Роль", escapeHtml(lead.role) || "—") +
    row("Боль", escapeHtml(lead.pain) || "—") +
    row("Согласие", escapeHtml(lead.consent)) +
    row("Источник", escapeHtml(lead.source)) +
    row("Время", escapeHtml(formatDate(lead.when))) +
    "</table>" +
    '<p style="margin:20px 0 0;color:#747476;font-size:12px;">Все заявки сохраняются в Google-таблице, привязанной к этому скрипту.</p>' +
    "</div>";

  try {
    MailApp.sendEmail({
      to,
      subject,
      body: textBody,
      htmlBody,
      name: "PULS ERP — лендинг",
    });
    return "sent";
  } catch (err) {
    console.warn("email send failed:", err);
    return "error:" + String(err.message || err);
  }
}

function sendTelegramNotification(lead) {
  const props = PropertiesService.getScriptProperties();
  const token = props.getProperty("TG_BOT_TOKEN");
  const chatId = props.getProperty("TG_CHAT_ID");
  if (!token || !chatId) return "skipped:no-credentials";

  const text =
    "🔥 *Новая заявка PULS ERP*\n\n" +
    "*Имя:* " + escapeMd(lead.name) + "\n" +
    "*Компания:* " + (escapeMd(lead.company) || "—") + "\n" +
    "*Контакт:* " + escapeMd(lead.contact) + "\n" +
    "*Объектов:* " + (escapeMd(lead.objects) || "—") + "\n" +
    "*Роль:* " + (escapeMd(lead.role) || "—") + "\n" +
    "*Боль:* " + (escapeMd(lead.pain) || "—") + "\n" +
    "*Источник:* " + escapeMd(lead.source);

  const res = UrlFetchApp.fetch(
    "https://api.telegram.org/bot" + token + "/sendMessage",
    {
      method: "post",
      contentType: "application/json",
      payload: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "Markdown",
        disable_web_page_preview: true,
      }),
      muteHttpExceptions: true,
    }
  );
  const code = res.getResponseCode();
  if (code >= 300) {
    console.warn("telegram " + code + ": " + res.getContentText());
    return "error:http-" + code;
  }
  return "sent";
}

function row(label, value) {
  return (
    '<tr>' +
    `<td style="padding:6px 12px 6px 0;color:#747476;white-space:nowrap;vertical-align:top;">${label}</td>` +
    `<td style="padding:6px 0;color:#202F4D;font-weight:500;">${value}</td>` +
    '</tr>'
  );
}

function contactLink(contact) {
  const t = String(contact).trim();
  if (t.startsWith("@")) return "https://t.me/" + t.slice(1);
  if (/^\+?\d[\d\s\-()]{7,}/.test(t)) return "tel:" + t.replace(/[^\d+]/g, "");
  if (/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(t)) return "mailto:" + t;
  return "#";
}

function formatDate(d) {
  const tz = Session.getScriptTimeZone() || "Europe/Moscow";
  return Utilities.formatDate(d, tz, "dd.MM.yyyy HH:mm");
}

function sanitize(v) {
  if (v == null) return "";
  return String(v).trim().slice(0, 500);
}

function escapeHtml(s) {
  return String(s || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function escapeMd(s) {
  return String(s || "").replace(/([_*\[\]()`])/g, "\\$1");
}

function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
