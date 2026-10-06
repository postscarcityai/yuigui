// YUI-308 e2e: each question on the stage shows what it asks about, right above its buttons (Chris's TestFlight
// note ADoBKyIK: "context and action on the same screen"). On the demo relay.
//   npx next start -p 3308 &   then   node e2e/web/qcontext.test.mjs
// BASE overrides the origin, PLAYWRIGHT the Playwright module, SHOTS the folder for the 390 px shots (light and dark).
import { createRequire } from "node:module";
import { mkdirSync } from "node:fs";
const { chromium } = createRequire(import.meta.url)(process.env.PLAYWRIGHT || "playwright");
const BASE = process.env.BASE || "http://localhost:3308";
const SHOTS = process.env.SHOTS || "";
if (SHOTS) mkdirSync(SHOTS, { recursive: true });
const b = await chromium.launch();
let pass = 0, fail = 0;
const ok = (c, msg) => { if (c) { pass++; console.log("  ok  ", msg); } else { fail++; console.log("  FAIL", msg); } };
const R1 = 'say "Explainers draw every page."\nchoose@a "Ship it?" "Ship it"|"Not yet"';
const R2 = 'say "Left drawer shows Done cards."\nchoose@b "Ship it?" "Ship it"|"Not yet"';

for (const theme of ["light", "dark"]) {
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
  const pg = await ctx.newPage();
  pg.errs = [];
  pg.on("pageerror", (e) => pg.errs.push(e.message));
  await pg.goto(`${BASE}/web/agent/demo-penny?demo=penny&theme=${theme}`);
  await pg.waitForSelector("[data-testid=stage-home]");
  await pg.waitForTimeout(500);
  await pg.evaluate((y) => window.yuiWebDemo.say("demo-penny", y, {}), R1);
  await pg.waitForSelector(".ys-play", { timeout: 15000 });
  await pg.waitForTimeout(1500);
  await pg.evaluate((y) => window.yuiWebDemo.say("demo-penny", y, {}), R2);
  await pg.waitForTimeout(1500);
  await pg.keyboard.press("ArrowRight");
  await pg.waitForSelector(".ys-qs");
  await pg.waitForTimeout(1200);

  const ctxs = pg.locator("[data-testid=stage-question-context]");
  ok(await ctxs.count() === 2, `${theme}: both questions carry a context`);
  ok(/Explainers draw every page/.test(await ctxs.nth(0).innerText()), `${theme}: the first says what it asks about`);
  ok(/Left drawer shows Done cards/.test(await ctxs.nth(1).innerText()), `${theme}: the second says its own line`);
  const above = await pg.evaluate(() => [...document.querySelectorAll(".ys-qs .mo-q")].map((q) => {
    const c = q.querySelector("[data-testid=stage-question-context]"), btn = q.querySelector("button");
    return !!c && !!btn && c.getBoundingClientRect().bottom <= btn.getBoundingClientRect().top;
  }));
  ok(above.length === 2 && above.every(Boolean), `${theme}: each line sits above its buttons`);
  const once = await pg.evaluate(() => document.querySelector(".ys-play").innerText.split("Left drawer shows Done cards.").length - 1);
  ok(once === 1, `${theme}: the last line is drawn once, not again above`);
  if (SHOTS) await pg.screenshot({ path: `${SHOTS}/web-question-context-${theme}.png` });
  ok(pg.errs.length === 0, `${theme}: no page errors ${pg.errs.join(";")}`);
  await ctx.close();
}
await b.close();
console.log(`${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
