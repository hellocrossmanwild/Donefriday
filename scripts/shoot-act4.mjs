// Screenshots Act IV at the bottom of the scroll, mobile viewport.
import { chromium } from "playwright";

const URL = process.env.URL ?? "http://localhost:3105";

const browser = await chromium.launch({
  args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-webgl"],
});
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
await page.goto(URL, { waitUntil: "domcontentloaded" });

// wait for the film to be genuinely ready
await page.waitForFunction(
  () => document.documentElement.classList.contains("film-ready"),
  { timeout: 30000 },
);

// jump to the end of the scroll runtime and let Lenis/GSAP settle
await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
await page.waitForTimeout(3500);
await page.screenshot({ path: "/tmp/act4-mobile.png" });
await browser.close();
console.log("done: /tmp/act4-mobile.png");
