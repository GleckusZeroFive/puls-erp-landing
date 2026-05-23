// Functional test: плавная анимация раскрытия FAQ (grid-template-rows 0fr→1fr + fade .details-inner)
import { chromium } from "playwright";

const url = process.argv[2] || "http://localhost:4322/puls-erp-landing/";
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
await page.goto(url, { waitUntil: "networkidle" });

const sel = "#faq details:first-of-type";
await page.locator(`${sel} > summary`).scrollIntoViewIfNeeded();
await page.waitForTimeout(200);

const measure = (s) =>
  page.evaluate((sel) => {
    const d = document.querySelector(sel);
    const body = d.querySelector(":scope > .details-body");
    const inner = body.querySelector(".details-inner");
    return {
      dataOpen: d.hasAttribute("data-open"),
      height: Math.round(body.getBoundingClientRect().height),
      innerOpacity: parseFloat(getComputedStyle(inner).opacity),
    };
  }, s);

const closed = await measure(sel);
console.log("CLOSED:", JSON.stringify(closed));

await page.locator(`${sel} > summary`).click();
await page.waitForTimeout(70); // ранняя фаза front-loaded easing (cubic-bezier 0.16,1,0.3,1)
const mid = await measure(sel);
console.log("MID (70ms):", JSON.stringify(mid));

await page.waitForTimeout(500);
const open = await measure(sel);
console.log("OPEN:", JSON.stringify(open));

const heightAnimating = mid.height > closed.height + 5 && mid.height < open.height - 5;
const settled = open.dataOpen && open.height > 50 && open.innerOpacity > 0.9;
console.log("");
console.log(`FAQ animation working: ${heightAnimating && settled ? "✓" : "✗"}`);
console.log(`  height animating mid (${closed.height} < ${mid.height} < ${open.height}): ${heightAnimating ? "yes" : "NO"}`);
console.log(`  settled (data-open + content visible): ${settled ? "yes" : "NO"} (h=${open.height}, opacity=${open.innerOpacity})`);

// Проверим закрытие — высота должна плавно уйти к ~0
await page.locator(`${sel} > summary`).click();
await page.waitForTimeout(550);
const reclosed = await measure(sel);
console.log(`CLOSE back: data-open=${reclosed.dataOpen}, height=${reclosed.height} → ${reclosed.height < 5 ? "✓" : "✗"}`);

await ctx.close();
await browser.close();
