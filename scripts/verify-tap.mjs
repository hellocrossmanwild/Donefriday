// Verifies the stamped NEXT button: hidden while the film moves, pressed
// in ~2s after each frame settles, and drives the journey on tap.
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

const btn = page.locator('button[aria-label="Continue to the next scene"]');

// settle delay: hidden right after ready, pressed in ~2s later
console.log("visible immediately after ready:", await btn.isVisible());
await btn.waitFor({ state: "visible", timeout: 6000 });
console.log("visible after settle delay: true");
await page.screenshot({ path: "/tmp/tap-0-act1.png" });

for (let i = 1; i <= 4; i++) {
  await btn.click();
  await page.waitForTimeout(1200); // mid-glide — must be hidden
  const midGlide = await btn.isVisible();
  await btn.waitFor({ state: i < 4 ? "visible" : "hidden", timeout: 10000 }).catch(() => {});
  await page.waitForTimeout(400);
  await page.screenshot({ path: `/tmp/tap-${i}.png` });
  console.log(`tap ${i}: hidden mid-glide: ${!midGlide}, visible after settle: ${await btn.isVisible()}`);
}

await browser.close();
console.log("done");
