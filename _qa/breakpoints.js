// Final breakpoint sanity check — 360 / 768 / 1280 / 1920
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

const url = process.argv[2] || "http://localhost:4323/";
const outDir = join(import.meta.dirname, "out");
mkdirSync(outDir, { recursive: true });

const widths = [360, 768, 1280, 1920];
const browser = await chromium.launch();

for (const width of widths) {
  const ctx = await browser.newContext({ viewport: { width, height: 900 } });
  const page = await ctx.newPage();
  const consoleErrors = [];
  page.on("pageerror", (e) => consoleErrors.push(`pageerror: ${e.message}`));
  page.on("console", (m) => { if (m.type() === "error") consoleErrors.push(`console: ${m.text()}`); });

  await page.goto(url, { waitUntil: "networkidle" });

  // Unfold reveal
  await page.evaluate(async () => {
    const h = document.documentElement.scrollHeight;
    for (let y = 0; y < h; y += 600) {
      window.scrollTo({ top: y, behavior: "instant" });
      await new Promise((r) => setTimeout(r, 100));
    }
    document.querySelectorAll(".reveal").forEach((el) => el.classList.add("is-visible"));
    window.scrollTo({ top: 0, behavior: "instant" });
    await new Promise((r) => setTimeout(r, 200));
  });

  // Check for horizontal scroll (overflow)
  const hOverflow = await page.evaluate(() => {
    return {
      docW: document.documentElement.scrollWidth,
      viewportW: window.innerWidth,
    };
  });
  const hasHorizontalScroll = hOverflow.docW > hOverflow.viewportW + 1;

  await page.screenshot({ path: join(outDir, `bp-${width}.png`), fullPage: true });
  console.log(`[${width}px] horizontal-scroll=${hasHorizontalScroll} errors=${consoleErrors.length} ${consoleErrors.length ? consoleErrors.join(" | ") : ""}`);

  await ctx.close();
}

await browser.close();
