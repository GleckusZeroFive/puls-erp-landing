// Lighthouse audit: desktop + mobile against running preview server
import lighthouse from "lighthouse";
import { launch } from "chrome-launcher";
import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const url = process.argv[2] || "http://localhost:4323/";
const outDir = join(import.meta.dirname, "out");
mkdirSync(outDir, { recursive: true });

const summary = {};

for (const formFactor of ["desktop", "mobile"]) {
  const chrome = await launch({ chromeFlags: ["--headless=new", "--no-sandbox"] });
  try {
    const result = await lighthouse(
      url,
      {
        port: chrome.port,
        output: ["html", "json"],
        logLevel: "error",
        formFactor,
        screenEmulation:
          formFactor === "desktop"
            ? { mobile: false, width: 1440, height: 900, deviceScaleFactor: 1, disabled: false }
            : { mobile: true, width: 360, height: 740, deviceScaleFactor: 2, disabled: false },
        throttling:
          formFactor === "desktop"
            ? { rttMs: 40, throughputKbps: 10240, cpuSlowdownMultiplier: 1 }
            : { rttMs: 150, throughputKbps: 1638.4, cpuSlowdownMultiplier: 4 },
      }
    );
    writeFileSync(join(outDir, `lh-${formFactor}.html`), result.report[0]);
    writeFileSync(join(outDir, `lh-${formFactor}.json`), result.report[1]);
    const scores = Object.fromEntries(
      Object.entries(result.lhr.categories).map(([k, v]) => [k, Math.round(v.score * 100)])
    );
    summary[formFactor] = scores;
    console.log(`[${formFactor}]`, scores);
  } finally {
    try { await chrome.kill(); } catch (e) { /* Windows EPERM on temp cleanup */ }
  }
}

console.log("\nSummary:", JSON.stringify(summary, null, 2));
