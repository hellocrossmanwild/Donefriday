// Drives the tap-to-advance journey: tap the Continue button through every
// act and screenshot each hold-point.
import { chromium } from "playwright";

const URL = process.env.URL ?? "http://localhost:3105";

const browser = await chromium.launch({
  args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-webgl"],
});
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
page.on("pageerror", (e) => console.log("[pageerror]", e.message));

await page.goto(URL, { waitUntil: "domcontentloaded" });
await page.waitForFunction(
  () => document.documentElement.classList.contains("film-ready"),
  { timeout: 30000 },
);
await page.waitForTimeout(800);

const btn = page.locator('button[aria-label="Continue to the next scene"]');
console.log("button visible at start:", await btn.isVisible());
await page.screenshot({ path: "/tmp/tap-0-act1.png" });

for (let i = 1; i <= 3; i++) {
  await btn.click();
  await page.waitForTimeout(4200); // 2.8s glide + settle
  await page.screenshot({ path: `/tmp/tap-${i}.png` });
  console.log(`tap ${i}: button visible:`, await btn.isVisible());
}

await browser.close();
console.log("done");
