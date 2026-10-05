// YUI-288 e2e: on the web stage a tap on the left third of a full-screen page goes back a page, the rest goes on,
// a control keeps its tap, and the arrow keys do the same on a computer.
//   npx next build && npx next start -p 3288 &   then   node e2e/web/pagetap.test.mjs
// BASE overrides the origin, PLAYWRIGHT the Playwright module, SHOTS the folder for 390 px shots.
import { createRequire } from "node:module";
import { mkdirSync } from "node:fs";
const { chromium } = createRequire(import.meta.url)(process.env.PLAYWRIGHT || "playwright");
const BASE = process.env.BASE || "http://localhost:3288";
const SHOTS = process.env.SHOTS || "";
if (SHOTS) mkdirSync(SHOTS, { recursive: true });
const b = await chromium.launch();
let pass = 0, fail = 0;
const ok = (c, msg) => { if (c) { pass++; console.log("  ok  ", msg); } else { fail++; console.log("  FAIL", msg); } };

// The three pages: 2 is the demo's own, the agent adds 3 (a choose) and 4.
const DECK = '>2 stat 12 "Runs this month"\n>3 choose "Which day?" Mon|Tue|Wed\n>4 stat 7 "Rest days"';

for (const theme of ["dark", "light"]) {
  for (const [name, vp, touch] of [["390", { width: 390, height: 844 }, { hasTouch: true, isMobile: true }], ["desktop", { width: 1280, height: 800 }, {}]]) {
    const t = `${theme} ${name}`;
    const ctx = await b.newContext({ viewport: vp, deviceScaleFactor: 2, ...touch });
    const pg = await ctx.newPage();
    const errs = [];
    pg.on("pageerror", (e) => errs.push(e.message));
    await pg.goto(`${BASE}/web/agent/demo-penny?demo=penny&theme=${theme}`);
    await pg.waitForSelector("[data-testid=stage-home]");
    await pg.waitForTimeout(500);
    await pg.evaluate((y) => window.yuiWebDemo.say("demo-penny", y, {}), DECK);
    await pg.waitForFunction(() => document.querySelectorAll(".wb-pill").length === 4, null, { timeout: 15000 });
    await pg.waitForTimeout(300);

    const at = () => pg.locator(".wb-pill").evaluateAll((els) => els.findIndex((e) => e.classList.contains("on")));
    const tap = async (f) => {
      const r = await pg.locator(".ys-pager").boundingBox();
      const x = r.x + r.width * f, y = r.y + 10;
      if (touch.hasTouch) await pg.touchscreen.tap(x, y); else await pg.mouse.click(x, y);
      await pg.waitForTimeout(500);
    };

    await pg.locator(".wb-pill").nth(1).click();
    await pg.waitForTimeout(500);
    ok(await at() === 1, `${t}: on the first page`);
    await tap(0.1);
    ok(await at() === 1, `${t}: the left third on page 1 stays`);
    await tap(0.8);
    ok(await at() === 2, `${t}: a tap on the right goes to page 2`);
    await tap(0.8);
    ok(await at() === 3, `${t}: a second one goes to page 3`);
    if (SHOTS && name === "390") await pg.screenshot({ path: `${SHOTS}/yui288-page3-${theme}.png` });
    await tap(0.1);
    ok(await at() === 2, `${t}: the left third goes back to page 2`);
    await tap(0.32);
    ok(await at() === 1, `${t}: just inside the left third goes back`);
    await tap(0.8);
    await tap(0.34);
    ok(await at() === 3, `${t}: just outside the left third goes on`);
    await tap(0.8);
    ok(await at() === 3, `${t}: the right on the last page stays`);

    // a choose option keeps its tap
    await pg.locator(".wb-pill").nth(2).click();
    await pg.waitForTimeout(500);
    const opt = pg.locator(".ys-page[data-page='3'] button", { hasText: "Mon" });
    ok(await opt.count() === 1, `${t}: the choose is on page 3`);
    const before = await at();
    await opt.click();
    await pg.waitForTimeout(500);
    const afterAt = await at();
    // The choice goes up and the stage plays the reply from the home, as it always did; a page tap would have gone on to page 3.
    const sent = await pg.evaluate(() => window.yuiWebDemo.wire("demo-penny").map((r) => r.body));
    ok(sent.some((x) => /Mon/.test(x)) && afterAt !== before + 1, `${t}: tapping an option sends it and does not page (${before} -> ${afterAt})`);
    if (SHOTS && name === "390") await pg.screenshot({ path: `${SHOTS}/yui288-choose-${theme}.png` });

    if (name === "desktop") {
      await pg.locator("body").click({ position: { x: 5, y: 5 } }).catch(() => {});
      await pg.keyboard.press("ArrowRight");
      await pg.waitForTimeout(400);
      const r1 = await at();
      await pg.keyboard.press("ArrowLeft");
      await pg.waitForTimeout(400);
      ok(r1 === afterAt + 1 && await at() === afterAt, `${t}: the arrow keys go on and back`);
    }
    ok(errs.length === 0, `${t}: no page errors ${errs.join(";")}`);
    await ctx.close();
  }
}
await b.close();
console.log(`${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
