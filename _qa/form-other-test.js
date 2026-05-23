// Functional test: поле уточнения боли плавно раскрывается при выборе «Другое»
import { chromium } from "playwright";

const url = process.argv[2] || "http://localhost:4322/puls-erp-landing/";
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
await page.goto(url, { waitUntil: "networkidle" });

await page.locator("#form").scrollIntoViewIfNeeded();
await page.waitForTimeout(200);

const measure = () =>
  page.evaluate(() => {
    const extra = document.querySelector("[data-pain-extra]");
    const inp = document.querySelector('[name="pain_other"]');
    return {
      dataOpen: extra.hasAttribute("data-open"),
      height: Math.round(extra.getBoundingClientRect().height),
      required: inp.hasAttribute("required"),
    };
  });

const closed = await measure();
console.log("CLOSED:", JSON.stringify(closed));

await page.selectOption('[name="pain"]', "Другое");
await page.waitForTimeout(120);
const mid = await measure();
console.log("MID (120ms):", JSON.stringify(mid));

await page.waitForTimeout(400);
const open = await measure();
console.log("OPEN:", JSON.stringify(open));

// Назад — поле должно схлопнуться
await page.selectOption('[name="pain"]', "Финансы и маржа объектов");
await page.waitForTimeout(500);
const reclosed = await measure();
console.log("BACK:", JSON.stringify(reclosed));

const animates = mid.height > closed.height + 3 && mid.height < open.height - 3;
const opensOk = open.dataOpen && open.height > 40 && open.required;
const closesOk = !reclosed.dataOpen && reclosed.height < 5 && !reclosed.required;
console.log("");
console.log(`Pain-other field working: ${animates && opensOk && closesOk ? "✓" : "✗"}`);
console.log(`  animating (${closed.height} < ${mid.height} < ${open.height}): ${animates ? "yes" : "NO"}`);
console.log(`  opens (data-open + height + required): ${opensOk ? "yes" : "NO"}`);
console.log(`  collapses back: ${closesOk ? "yes" : "NO"}`);

await ctx.close();
await browser.close();
