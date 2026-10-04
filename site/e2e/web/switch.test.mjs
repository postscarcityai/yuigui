// YUI-282: /web switches screens the moment you tap or swipe. 390 wide, 4x CPU.
// BASE overrides the origin, PLAYWRIGHT the Playwright module, SHOTS the folder for shots.
import { createRequire } from "node:module";
import { mkdirSync } from "node:fs";
const { chromium } = createRequire(import.meta.url)(process.env.PLAYWRIGHT || "playwright");
const BASE = process.env.BASE || "http://localhost:3282";
const SHOTS = process.env.SHOTS || "";
if (SHOTS) mkdirSync(SHOTS, { recursive: true });
const b = await chromium.launch();
let fail = 0;
const ok = (c, msg) => { if (!c) fail++; console.log(c ? "  ok  " : "  FAIL", msg); };
for (const theme of ["light", "dark"]) {
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
  const pg = await ctx.newPage();
  await pg.goto(`${BASE}/web/agent/demo-penny?demo=penny&theme=${theme}`);
  await pg.waitForSelector("[data-testid=stage-home]");
  await pg.waitForTimeout(1200);
  const cdp = await ctx.newCDPSession(pg);
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
  const on = () => pg.locator(".wb-pill.on").innerText();
  // By pill: the filled pill is the new screen within two frames of the tap.
  const ms = await pg.evaluate(() => new Promise((res) => {
    const t0 = performance.now();
    [...document.querySelectorAll(".wb-pill")].find((p) => !p.classList.contains("on")).click();
    requestAnimationFrame(() => requestAnimationFrame(() => res(performance.now() - t0)));
  }));
  ok(!/^Home$/.test(await on()) && ms < 150, `${theme}: a pill tap shows the new screen in two frames (${ms.toFixed(0)} ms)`);
  await pg.waitForTimeout(700);
  if (SHOTS) await pg.screenshot({ path: `${SHOTS}/web-switch-${theme}.png` });
  // By swipe: a drag moves the page without rendering the stage per finger move, and the lift switches.
  const touch = (type, x) => cdp.send("Input.dispatchTouchEvent", { type, touchPoints: type === "touchEnd" ? [] : [{ x, y: 400 }] });
  await touch("touchStart", 60);
  for (let x = 90; x <= 330; x += 40) await touch("touchMove", x);
  const dragVar = await pg.evaluate(() => document.querySelector(".ys-pager").style.getPropertyValue("--drag"));
  ok(/px$/.test(dragVar) && parseFloat(dragVar) > 100, `${theme}: the drag moves the page straight (--drag ${dragVar})`);
  await touch("touchEnd");
  await pg.waitForTimeout(700);
  ok(await on() === "Home", `${theme}: a swipe right switches back to Home`);
  ok((await pg.evaluate(() => document.querySelector(".ys-pager").style.getPropertyValue("--drag"))) === "", `${theme}: the drag is cleared after the lift`);
  await ctx.close();
}
await b.close();
console.log(fail ? `FAIL ${fail}` : "PASS");
process.exit(fail ? 1 : 0);
