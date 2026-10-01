// YUI-243 e2e: the full-window layer on the web (>full, a timer), its ways home, on the demo relay.
//   npx next start -p 3243 &   then   node e2e/web/full.test.mjs
import { createRequire } from "node:module";
import { mkdirSync } from "node:fs";
const { chromium } = createRequire(import.meta.url)(process.env.PLAYWRIGHT || "playwright");
const BASE = process.env.BASE || "http://localhost:3243";
const SHOTS = process.env.SHOTS || "";
if (SHOTS) mkdirSync(SHOTS, { recursive: true });
const b = await chromium.launch();
let pass = 0, fail = 0;
const ok = (c, msg) => { if (c) { pass++; console.log("  ok  ", msg); } else { fail++; console.log("  FAIL", msg); } };
const OPEN = ".wb-stagehost .yl-stage.open";

async function start(vp, theme, extra = {}) {
  const ctx = await b.newContext({ viewport: vp, deviceScaleFactor: 2, ...extra });
  const pg = await ctx.newPage();
  pg.errs = [];
  pg.on("pageerror", (e) => pg.errs.push(e.message));
  await pg.goto(`${BASE}/web/agent/demo-penny?demo=penny&theme=${theme}`);
  await pg.waitForSelector("[data-testid=stage-home]");
  await pg.waitForTimeout(400);
  return pg;
}
async function ask(pg) {
  await pg.locator("[data-testid=stage-type]").click();
  await pg.locator("[data-testid=stage-field] textarea").fill("Start a timer");
  await pg.keyboard.press("Enter");
  await pg.waitForSelector(OPEN, { timeout: 8000 });
  await pg.waitForTimeout(500);
}
// A pull down by finger: CDP touch events, the way a phone sends them.
async function pull(pg, from, to) {
  const c = await pg.context().newCDPSession(pg);
  const t = (type, y) => c.send("Input.dispatchTouchEvent", { type, touchPoints: type === "touchEnd" ? [] : [{ x: 195, y }] });
  await t("touchStart", from);
  for (let y = from; y <= to; y += 20) await t("touchMove", y);
  await t("touchEnd", to);
}

for (const theme of ["light", "dark"]) {
  for (const [name, vp, touch] of [["390", { width: 390, height: 844 }, { hasTouch: true, isMobile: true }], ["desktop", { width: 1280, height: 800 }, {}]]) {
    const t = `${theme} ${name}`;
    let pg = await start(vp, theme, touch);
    await ask(pg);
    ok(await pg.locator(OPEN).count() === 1, `${t}: a timer takes the whole window by itself`);
    const box = await pg.locator(OPEN).boundingBox();
    // On a phone that is the window; on a computer it is the chat column, the agent list stays beside it.
    const main = await pg.locator(".wb-main").boundingBox();
    ok(box.width >= main.width - 2 && box.height >= main.height - 2 && (name !== "390" || box.width >= vp.width - 2), `${t}: it covers the chat window`);
    ok(await pg.locator(`${OPEN} [data-testid=stage-fullscreen]`).count() === 1 || name === "390", `${t}: the browser full screen has a button`);
    if (SHOTS) await pg.screenshot({ path: `${SHOTS}/web-full-timer-${name}-${theme}.png` });
    // The X closes it and the stage is back.
    await pg.locator(`${OPEN} .yl-stagex:not(.yl-stagefs)`).click();
    await pg.waitForTimeout(500);
    ok(await pg.locator(OPEN).count() === 0, `${t}: X closes the layer`);
    ok(await pg.locator("[data-testid=stage]").isVisible(), `${t}: the stage is under it`);
    // The record keeps a pill that brings it back.
    await pg.locator("[data-testid=stage-record]").click();
    await pg.waitForSelector(".yl-stagepill");
    await pg.locator(".yl-stagepill").last().click();
    await pg.waitForSelector(OPEN);
    ok(true, `${t}: the pill in the record reopens it`);
    await pg.keyboard.press("Escape");
    await pg.waitForTimeout(500);
    ok(await pg.locator(OPEN).count() === 0, `${t}: Esc closes it`);
    ok(pg.errs.length === 0, `${t}: no page errors ${pg.errs.join("|")}`);
    await pg.context().close();

    if (name === "390") {
      pg = await start(vp, theme, touch);
      await ask(pg);
      await pull(pg, 300, 360);
      await pg.waitForTimeout(500);
      ok(await pg.locator(OPEN).count() === 1, `${t}: a short pull springs back`);
      await pull(pg, 200, 520);
      await pg.waitForTimeout(600);
      ok(await pg.locator(OPEN).count() === 0, `${t}: a long pull down puts it away`);
      await pg.context().close();
    }
  }
}
{
  const pg = await start({ width: 390, height: 844 }, "light", { reducedMotion: "reduce" });
  await ask(pg);
  ok(await pg.locator(OPEN).count() === 1, "reduced motion: the layer still opens");
  await pg.context().close();
}
await b.close();
console.log(`${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
