// Verifies the loading curtain genuinely fades into the 3D hero:
// 1. curtain appears on load (film mode)
// 2. curtain is gone (unmounted) once the scene has rendered
// 3. the canvas is visibly painted (not a black hole)
import { chromium } from "playwright";

const URL = process.env.URL ?? "http://localhost:3105";

const browser = await chromium.launch({
  args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-webgl"],
});
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });

const logs = [];
page.on("console", (m) => logs.push(`[${m.type()}] ${m.text()}`));
page.on("pageerror", (e) => logs.push(`[pageerror] ${e.message}`));

await page.goto(URL, { waitUntil: "domcontentloaded" });

// film gate should have fired pre-paint
const film = await page.evaluate(() => document.documentElement.classList.contains("film"));
console.log("html.film set:", film);

// the curtain should mount shortly after hydration
const curtainSel = 'div[style*="z-index: 50"], div[aria-hidden="true"][style*="fixed"]';
let curtainSeen = false;
for (let i = 0; i < 20; i++) {
  curtainSeen = await page.evaluate(() => {
    const els = [...document.querySelectorAll("div[aria-hidden=true]")];
    return els.some((el) => getComputedStyle(el).position === "fixed" && getComputedStyle(el).zIndex === "50");
  });
  if (curtainSeen) break;
  await page.waitForTimeout(250);
}
console.log("curtain mounted:", curtainSeen);
await page.screenshot({ path: "/tmp/curtain-1-loading.png" });

// wait for genuine readiness: film-ready class + curtain unmounted
let readyAt = null;
const t0 = Date.now();
for (let i = 0; i < 80; i++) {
  const state = await page.evaluate(() => ({
    filmReady: document.documentElement.classList.contains("film-ready"),
    curtain: [...document.querySelectorAll("div[aria-hidden=true]")].some(
      (el) => getComputedStyle(el).position === "fixed" && getComputedStyle(el).zIndex === "50",
    ),
  }));
  if (state.filmReady && !state.curtain) {
    readyAt = Date.now() - t0;
    break;
  }
  await page.waitForTimeout(500);
}
console.log("film ready + curtain unmounted after ms:", readyAt);
await page.screenshot({ path: "/tmp/curtain-2-revealed.png" });

// canvas actually painted? sample pixels
const painted = await page.evaluate(() => {
  const c = document.querySelector("canvas");
  if (!c) return "no canvas";
  const gl = c.getContext("webgl2") || c.getContext("webgl");
  if (!gl) return "no ctx";
  const px = new Uint8Array(4 * 100);
  gl.readPixels(c.width / 2 - 5, c.height / 2 - 5, 10, 10, gl.RGBA, gl.UNSIGNED_BYTE, px);
  let nonzero = 0;
  for (let i = 0; i < px.length; i += 4) if (px[i] + px[i + 1] + px[i + 2] > 12) nonzero++;
  return `${nonzero}/100 centre pixels lit`;
});
console.log("canvas painted:", painted);

console.log("\n--- console/page errors ---");
console.log(logs.filter((l) => l.includes("error") || l.includes("Error")).slice(0, 10).join("\n") || "(none)");

await browser.close();
process.exit(readyAt !== null ? 0 : 1);
