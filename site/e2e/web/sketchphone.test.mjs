// YUI-267 web e2e: a drawn phone is one device that plays the before into the after, on the /web stage.
//   npx next start -p 3311 &   then   node e2e/web/sketchphone.test.mjs   (SHOTS=<dir> keeps stills)
import { createRequire } from "node:module";
import { mkdirSync } from "node:fs";
const { chromium } = createRequire(import.meta.url)(process.env.PLAYWRIGHT || "playwright");
const BASE = process.env.BASE || "http://localhost:3311";
const SHOTS = process.env.SHOTS || "";
if (SHOTS) mkdirSync(SHOTS, { recursive: true });
const b = await chromium.launch();
let pass = 0, fail = 0;
const ok = (c, msg) => { if (c) { pass++; console.log("  ok  ", msg); } else { fail++; console.log("  FAIL", msg); } };
const YL = `sketch "Build ready" frame=phone
row "Build 97 is ready" +x note="no way to open it"
row "Tap to install" +x
after
row "Build 97 is ready" +hi note="one tap to open"
row "Open build 97" +button +hi note="the app opens here"`;
const side = (pg) => pg.locator(".yl-skphone").first().getAttribute("data-side");
const label = (pg) => pg.locator("[data-testid=sketch-label]").first().innerText();

for (const theme of ["dark", "light"]) {
  for (const reduce of [false, true]) {
    const t = `${theme}${reduce ? " reduced motion" : ""}`;
    const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true, reducedMotion: reduce ? "reduce" : "no-preference" });
    const pg = await ctx.newPage();
    const errs = [];
    pg.on("pageerror", (e) => errs.push(e.message));
    await pg.goto(`${BASE}/web/agent/demo-penny?demo=penny&theme=${theme}`);
    await pg.waitForSelector("[data-testid=stage-home]");
    await pg.waitForTimeout(400);
    await pg.locator("[data-testid=stage-type]").click();
    await pg.locator("[data-testid=stage-field] textarea").fill("redraw it");
    await pg.keyboard.press("Enter");
    await pg.waitForSelector("[data-testid=stage-working], .ys-play", { timeout: 8000 });
    await pg.evaluate((y) => window.yuiWebDemo.say("demo-penny", y), YL);
    await pg.locator("[data-testid=stage-record]").click();
    await pg.waitForSelector("[data-testid=sketch-phone]", { timeout: 8000 });
    ok(await pg.locator("[data-testid=sketch-phone]").count() === 1, `${t}: one device, not two outlines`);
    await pg.locator(".yl-skphone").first().scrollIntoViewIfNeeded();
    if (reduce) {
      await pg.waitForTimeout(800);
      ok((await side(pg)) === "1" && /after/i.test(await label(pg)), `${t}: the after is held`);
      await pg.waitForTimeout(3500);
      ok((await side(pg)) === "1", `${t}: and stays held`);
    } else {
      await pg.waitForFunction(() => document.querySelector(".yl-skphone")?.dataset.side === "0");
      ok(/before/i.test(await label(pg)), `${t}: starts on the before, red badge`);
      if (SHOTS) { await pg.waitForTimeout(500); await pg.screenshot({ path: `${SHOTS}/web-${theme}-before.png` }); }
      await pg.waitForFunction(() => document.querySelector(".yl-skphone")?.dataset.side === "1", null, { timeout: 6000 });
      ok(/after/i.test(await label(pg)), `${t}: plays into the after, green badge`);
      const keys = await pg.locator(".yl-skkey li").allInnerTexts();
      ok(keys.length === 2 && /one tap to open/.test(keys[0]), `${t}: the notes under the phone are the after's, numbered`);
      if (SHOTS) { await pg.waitForTimeout(500); await pg.screenshot({ path: `${SHOTS}/web-${theme}-after.png` }); }
      await pg.waitForFunction(() => document.querySelector(".yl-skphone")?.dataset.side === "0", null, { timeout: 6000 });
      ok(true, `${t}: and loops back to the before`);
    }
    ok(errs.length === 0, `${t}: no page errors ${errs.join("|")}`);
    await ctx.close();
  }
}
await b.close();
console.log(`${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
