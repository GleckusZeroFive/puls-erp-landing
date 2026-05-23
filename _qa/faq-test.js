// Functional test: плавная анимация раскрытия FAQ (<details> + .details-body height + стаггер)
import { chromium } from "playwright";

const url = process.argv[2] || "http://localhost:4322/puls-erp-landing/";
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
await page.goto(url, { waitUntil: "networkidle" });

const sel = "#faq details:first-of-type";
await page.locator(`${sel} > summary`).scrollIntoViewIfNeeded();
await page.waitForTimeout(200);

const closed = await page.evaluate((s) => {
  const d = document.querySelector(s);
  const b = d.querySelector(":scope > .details-body");
  return { open: d.open, height: b.getBoundingClientRect().height };
}, sel);
console.log("CLOSED:", JSON.stringify(closed));

await page.locator(`${sel} > summary`).click();
await page.waitForTimeout(150); // середина height-анимации (380ms)
const mid = await page.evaluate((s) => {
  const b = document.querySelector(s).querySelector(":scope > .details-body");
  return { height: Math.round(b.getBoundingClientRect().height) };
}, sel);
console.log("MID (150ms):", JSON.stringify(mid));

await page.waitForTimeout(700); // после стаггера контента
const open = await page.evaluate((s) => {
  const d = document.querySelector(s);
  const b = d.querySelector(":scope > .details-body");
  const p = b.querySelector("p");
  return {
    open: d.open,
    height: Math.round(b.getBoundingClientRect().height),
    pOpacity: parseFloat(getComputedStyle(p).opacity),
  };
}, sel);
console.log("OPEN:", JSON.stringify(open));

const heightAnimating = mid.height > closed.height + 5 && mid.height < open.height - 5;
const settled = open.open && open.height > 50 && open.pOpacity > 0.9;
console.log("");
console.log(`FAQ animation working: ${heightAnimating && settled ? "✓" : "✗"}`);
console.log(`  height animating mid (${closed.height} < ${mid.height} < ${open.height}): ${heightAnimating ? "yes" : "NO"}`);
console.log(`  settled open + content visible: ${settled ? "yes" : "NO"} (h=${open.height}, opacity=${open.pOpacity})`);

await ctx.close();
await browser.close();
