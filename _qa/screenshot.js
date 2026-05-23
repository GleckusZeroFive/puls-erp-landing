// Headless full-page screenshot tool for QA pass
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

const url = process.argv[2] || "http://localhost:4322/";
const outDir = join(import.meta.dirname, "out");
mkdirSync(outDir, { recursive: true });

const viewports = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "mobile", width: 375, height: 812 },
];

/** Прокручивает страницу сверху вниз, давая IntersectionObserver
 *  активировать все .reveal элементы, потом возвращает scroll к началу. */
async function unfoldRevealed(page) {
  await page.evaluate(async () => {
    const docHeight = document.documentElement.scrollHeight;
    const step = Math.min(window.innerHeight * 0.7, 600);
    for (let y = 0; y < docHeight; y += step) {
      window.scrollTo({ top: y, behavior: "instant" });
      await new Promise((r) => setTimeout(r, 120));
    }
    window.scrollTo({ top: docHeight, behavior: "instant" });
    await new Promise((r) => setTimeout(r, 300));
    // Belt and suspenders: force reveal on anything still hidden
    document.querySelectorAll(".reveal").forEach((el) => el.classList.add("is-visible"));
    window.scrollTo({ top: 0, behavior: "instant" });
    await new Promise((r) => setTimeout(r, 200));
  });
}

const browser = await chromium.launch();
for (const vp of viewports) {
  const ctx = await browser.newContext({ viewport: vp });
  const page = await ctx.newPage();
  await page.goto(url, { waitUntil: "networkidle" });
  await unfoldRevealed(page);
  const file = join(outDir, `full-${vp.name}.png`);
  await page.screenshot({ path: file, fullPage: true });
  console.log(`saved ${file} (${vp.width}x${vp.height})`);

  if (vp.name === "desktop") {
    const dash = await page.locator(".pulse-dashboard").first();
    await dash.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    for (const moduleId of ["objects", "payments", "materials", "docs", "ai"]) {
      await page.locator(`.pulse-dashboard [data-tab="${moduleId}"]`).click();
      await page.waitForTimeout(350);
      await dash.screenshot({ path: join(outDir, `dashboard-${moduleId}.png`) });
      console.log(`saved dashboard-${moduleId}.png`);
    }
  }

  await ctx.close();
}
await browser.close();
