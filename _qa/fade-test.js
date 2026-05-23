// Functional test: generic cross-fade на табах PulseDashboard (data-switch/data-tab/data-pane)
import { chromium } from "playwright";

const url = process.argv[2] || "http://localhost:4322/";
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
await page.goto(url, { waitUntil: "networkidle" });

await page.evaluate(async () => {
  const dash = document.querySelector(".pulse-dashboard");
  dash.scrollIntoView({ behavior: "instant" });
  await new Promise((r) => setTimeout(r, 300));
});

// Определяем id первой и второй вкладки динамически
const { first, second } = await page.evaluate(() => {
  const tabs = document.querySelectorAll('.pulse-dashboard [data-tab]');
  return { first: tabs[0].getAttribute("data-tab"), second: tabs[1].getAttribute("data-tab") };
});
console.log(`tabs: first=${first} second=${second}`);

const paneSel = (id) => `.pulse-dashboard .switch-stack > [data-pane="${id}"].space-y-4`;

const before = await page.evaluate((sel) => parseFloat(getComputedStyle(document.querySelector(sel)).opacity), paneSel(first));
console.log("BEFORE click — first pane opacity:", before);

await page.locator(`.pulse-dashboard [data-tab="${second}"]`).click();
await page.waitForTimeout(150); // середина 320ms transition
const mid = await page.evaluate((sels) => ({
  first: parseFloat(getComputedStyle(document.querySelector(sels[0])).opacity),
  second: parseFloat(getComputedStyle(document.querySelector(sels[1])).opacity),
}), [paneSel(first), paneSel(second)]);
console.log("MID transition (150ms):", JSON.stringify(mid));

await page.waitForTimeout(400);
const after = await page.evaluate((sels) => ({
  first: parseFloat(getComputedStyle(document.querySelector(sels[0])).opacity),
  second: parseFloat(getComputedStyle(document.querySelector(sels[1])).opacity),
}), [paneSel(first), paneSel(second)]);
console.log("AFTER transition:", JSON.stringify(after));

const firstFading = mid.first > 0.01 && mid.first < 0.99;
const secondAppearing = mid.second > 0.01 && mid.second < 0.99;
const settled = after.first < 0.05 && after.second > 0.95;
console.log("");
console.log(`Cross-fade working: ${firstFading && secondAppearing && settled ? "✓" : "✗"}`);
console.log(`  first fading out: ${firstFading ? "yes" : "NO"} (${mid.first})`);
console.log(`  second appearing: ${secondAppearing ? "yes" : "NO"} (${mid.second})`);
console.log(`  settled (first→0, second→1): ${settled ? "yes" : "NO"}`);

await ctx.close();
await browser.close();
