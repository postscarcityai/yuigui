// YUI-306 e2e: a side page is named for what is on it, never "Screen N". A page sent with `>3 timer 5m` (the demo already owns page 2)
// shows "Timer" in the pill and in the drawer, and "Screen 2" is nowhere. Demo relay, no sign in, no network.
//   npx next build && npx next start -p 3306 &   then   node e2e/web/pagename.test.mjs
// BASE overrides the origin, PLAYWRIGHT the Playwright module, SHOTS the folder for 390 px shots.
import { createRequire } from "node:module";
import { mkdirSync } from "node:fs";
const { chromium } = createRequire(import.meta.url)(process.env.PLAYWRIGHT || "playwright");
const BASE = process.env.BASE || "http://localhost:3306";
const SHOTS = process.env.SHOTS || "";
if (SHOTS) mkdirSync(SHOTS, { recursive: true });
const b = await chromium.launch();
let pass = 0, fail = 0;
const ok = (c, msg) => { if (c) { pass++; console.log("  ok  ", msg); } else { fail++; console.log("  FAIL", msg); } };

for (const theme of ["dark", "light"]) {
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
  const pg = await ctx.newPage();
  const errs = [];
  pg.on("pageerror", (e) => errs.push(e.message));
  await pg.goto(`${BASE}/web/agent/demo-penny?demo=penny&theme=${theme}`);
  await pg.waitForSelector("[data-testid=stage-home]");
  await pg.waitForTimeout(500);
  await pg.evaluate(() => window.yuiWebDemo.say("demo-penny", ">3 timer 5m", {}));
  await pg.waitForFunction(() => /Timer/.test(document.querySelector(".wb-pills")?.innerText || ""), null, { timeout: 15000 });
  await pg.waitForTimeout(300);
  const t = `${theme} 390`;

  const pills = await pg.locator(".wb-pill").allInnerTexts();
  ok(pills.includes("Timer"), `${t}: the pill says Timer (${pills.join("|")})`);
  if (SHOTS) await pg.screenshot({ path: `${SHOTS}/web-page-name-pill-${theme}.png` });

  await pg.locator("[data-testid=stage-menu]").click();
  await pg.waitForSelector("[data-testid=drawer]", { timeout: 5000 });
  ok(await pg.locator("[data-testid=screen-3]").count() === 0, `${t}: the drawer holds no screen rows, the pills name them`);
  if (SHOTS) await pg.screenshot({ path: `${SHOTS}/web-page-name-drawer-${theme}.png` });
  ok(!/Screen \d/.test(await pg.locator("body").innerText()), `${t}: "Screen N" is nowhere on the page`);
  ok(errs.length === 0, `${t}: no page errors ${errs.join("|")}`);
  await ctx.close();
}
await b.close();
console.log(`${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
