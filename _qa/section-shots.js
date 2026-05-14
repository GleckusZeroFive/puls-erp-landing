// Individual section screenshots for detailed QA review
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

const url = process.argv[2] || "http://localhost:4322/";
const outDir = join(import.meta.dirname, "out");
mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
await page.goto(url, { waitUntil: "networkidle" });

// Unfold reveal anims
await page.evaluate(async () => {
  const h = document.documentElement.scrollHeight;
  for (let y = 0; y < h; y += 500) {
    window.scrollTo({ top: y, behavior: "instant" });
    await new Promise((r) => setTimeout(r, 100));
  }
  document.querySelectorAll(".reveal").forEach((el) => el.classList.add("is-visible"));
  window.scrollTo({ top: 0, behavior: "instant" });
  await new Promise((r) => setTimeout(r, 200));
});

const sections = [
  "hero", "problem", "how", "features", "dashboard",
  "roles", "cases", "pricing", "team", "integrations", "cta", "form",
];

for (const id of sections) {
  const loc = page.locator(`#${id}`);
  if (!(await loc.count())) continue;
  await loc.scrollIntoViewIfNeeded();
  await page.waitForTimeout(200);
  await loc.screenshot({ path: join(outDir, `s-${id}.png`) });
  console.log(`saved s-${id}.png`);
}

await ctx.close();
await browser.close();
