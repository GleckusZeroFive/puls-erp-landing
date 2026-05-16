// Functional test: cross-fade на табах PulseDashboard
import { chromium } from "playwright";

const url = process.argv[2] || "https://gleckuszerofive.github.io/puls-erp-landing/";
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
await page.goto(url, { waitUntil: "networkidle" });

// Прокрутка до dashboard для активации reveal
await page.evaluate(async () => {
  const dash = document.querySelector(".pulse-dashboard");
  dash.scrollIntoView({ behavior: "instant" });
  await new Promise((r) => setTimeout(r, 300));
});

// Сначала зафиксируем initial state
const before = await page.evaluate(() => {
  const cs = (sel) => {
    const el = document.querySelector(sel);
    if (!el) return null;
    return {
      opacity: parseFloat(getComputedStyle(el).opacity),
      transition: getComputedStyle(el).transition,
    };
  };
  return {
    director: cs('.pulse-scenario[data-pulse-scenario="director"]'),
    rp: cs('.pulse-scenario[data-pulse-scenario="rp"]'),
    supplier: cs('.pulse-scenario[data-pulse-scenario="supplier"]'),
    active: document.querySelector(".pulse-dashboard").getAttribute("data-active"),
  };
});
console.log("BEFORE click:", JSON.stringify(before, null, 2));

// Кликаем на rp таб
await page.locator('[data-pulse-tab="rp"]').click();

// Замеряем сразу после клика — должны быть В transition (значения между 0 и 1)
await page.waitForTimeout(150); // середина 320ms transition
const mid = await page.evaluate(() => {
  const cs = (sel) => parseFloat(getComputedStyle(document.querySelector(sel)).opacity);
  return {
    director: cs('.pulse-scenario[data-pulse-scenario="director"]'),
    rp: cs('.pulse-scenario[data-pulse-scenario="rp"]'),
  };
});
console.log("MID transition (150ms after click):", JSON.stringify(mid));

// Финальное состояние после transition
await page.waitForTimeout(400);
const after = await page.evaluate(() => {
  const cs = (sel) => parseFloat(getComputedStyle(document.querySelector(sel)).opacity);
  return {
    director: cs('.pulse-scenario[data-pulse-scenario="director"]'),
    rp: cs('.pulse-scenario[data-pulse-scenario="rp"]'),
    active: document.querySelector(".pulse-dashboard").getAttribute("data-active"),
  };
});
console.log("AFTER transition:", JSON.stringify(after));

const directorFading = mid.director > 0.01 && mid.director < 0.99;
const rpAppearing = mid.rp > 0.01 && mid.rp < 0.99;
console.log("");
console.log(`Cross-fade working: ${directorFading && rpAppearing ? "✓" : "✗"}`);
console.log(`  director fading out (mid > 0, < 1): ${directorFading ? "yes" : "NO"} (${mid.director})`);
console.log(`  rp appearing (mid > 0, < 1): ${rpAppearing ? "yes" : "NO"} (${mid.rp})`);

await ctx.close();
await browser.close();
