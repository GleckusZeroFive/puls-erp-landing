// Functional test: «Другое» + уточнение → в вебхук уходит pain="Другое — <текст>", pain_other не шлётся.
// Запрос перехватываем и отменяем (route.abort) — строку в таблицу НЕ пишем.
import { chromium } from "playwright";

const url = process.argv[2] || "http://localhost:4322/puls-erp-landing/";
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();

let captured = null;
await page.route("**/macros/s/**", (route) => {
  const params = new URLSearchParams(route.request().postData() || "");
  captured = { pain: params.get("pain"), pain_other: params.get("pain_other") };
  route.abort();
});

await page.goto(url, { waitUntil: "networkidle" });
await page.fill('[name="name"]', "Тест Комбайн");
await page.fill('[name="company"]', "ООО Тест");
await page.fill('[name="contact"]', "@test_combine");
await page.selectOption('[name="objects"]', "5–10 объектов");
await page.selectOption('[name="role"]', "Директор");
await page.selectOption('[name="pain"]', "Другое");
await page.waitForTimeout(200);
await page.fill('[name="pain_other"]', "нет единого экрана по объектам");
await page.check('[name="consent"]');
await page.click(".cf-submit");
await page.waitForTimeout(900);

console.log("captured POST:", JSON.stringify(captured));
const ok = captured && captured.pain === "Другое — нет единого экрана по объектам" && !captured.pain_other;
console.log(`Pain combine working: ${ok ? "✓" : "✗"}`);
console.log(`  pain = "${captured?.pain}"`);
console.log(`  pain_other sent: ${captured?.pain_other ? "YES (bad)" : "no (good)"}`);

await ctx.close();
await browser.close();
