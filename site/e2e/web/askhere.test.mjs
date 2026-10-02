// YUI-277 e2e: a plan never shows its context on one screen and the question on the next. On the demo relay.
//   npx next start -p 3277 &   then   node e2e/web/askhere.test.mjs
// BASE overrides the origin, PLAYWRIGHT the Playwright module, SHOTS the folder for 390 px and desktop shots.
import { createRequire } from "node:module";
import { mkdirSync } from "node:fs";
const { chromium } = createRequire(import.meta.url)(process.env.PLAYWRIGHT || "playwright");
const BASE = process.env.BASE || "http://localhost:3277";
const SHOTS = process.env.SHOTS || "";
if (SHOTS) mkdirSync(SHOTS, { recursive: true });
const b = await chromium.launch();
let pass = 0, fail = 0;
const ok = (c, msg) => { if (c) { pass++; console.log("  ok  ", msg); } else { fail++; console.log("  FAIL", msg); } };

const LOOKS = `plan "Drawings that look designed" submit="Send"
page "Look A: Hand drawn" body="Loose lines, warm."
sketch frame=bubble
row "Hand drawn" +hi
page "Look B: Clean lines" body="Tight, exact."
sketch frame=bubble
row "Clean lines" +hi
page "Look C: Chalk" body="Soft and dusty."
sketch frame=bubble
row "Chalk" +hi
choose "Which drawing look should Yui use?" A|B|C|"None, try again"|"You decide"
end`;
const ALONE = `plan "Plain questions" submit="Send"
choose "First?" Red|Blue
choose "Second?" Green|Gold
end`;

async function open(vp, theme, touch = {}) {
  const ctx = await b.newContext({ viewport: vp, deviceScaleFactor: 2, ...touch });
  const pg = await ctx.newPage();
  pg.errs = [];
  pg.on("pageerror", (e) => pg.errs.push(e.message));
  await pg.goto(`${BASE}/web/agent/demo-penny?demo=penny&theme=${theme}&view=chat`);
  await pg.waitForSelector(".wb-thread[data-loaded='1']");
  await pg.waitForTimeout(500);
  return pg;
}
async function say(pg, yl) {
  const n = await pg.locator(".wb-item").count();
  await pg.evaluate((y) => window.yuiWebDemo.say("demo-penny", y, {}), yl);
  await pg.waitForFunction((k) => document.querySelectorAll(".wb-item").length > k, n, { timeout: 15000 });
  await pg.waitForTimeout(400);
}
const wire = (pg) => pg.evaluate(() => window.yuiWebDemo.wire("demo-penny").map((r) => r.body));
async function stage(pg) {
  if (!(await pg.locator(".yl-plan").first().isVisible().catch(() => false))) {
    await pg.locator("[data-testid=play-on-stage]").last().click().catch(() => {});
    await pg.waitForTimeout(900);
  }
}
// What the visible step holds.
const step = (pg) => pg.locator(".yl-planstep:visible").first();

for (const theme of ["dark", "light"]) {
  for (const [name, vp, touch] of [["390", { width: 390, height: 844 }, { hasTouch: true, isMobile: true }], ["desktop", { width: 1280, height: 800 }, {}]]) {
    const t = `${theme} ${name}`;
    const pg = await open(vp, theme, touch);
    await say(pg, LOOKS);
    await stage(pg);

    // ---------- the pages read first, the question lands on the last one ----------
    ok(await step(pg).locator(".yl-page").count() === 1 && await step(pg).locator(".yl-q").count() === 0, `${t}: look A is a page with no question`);
    for (let i = 0; i < 2; i++) { await pg.locator(".yl-plan .bigbtn.p").filter({ hasText: /^Next$/ }).first().click(); await pg.waitForTimeout(300); }
    const s = step(pg);
    ok(await s.locator(".yl-page").count() === 1 && /Chalk/.test(await s.innerText()), `${t}: look C is on screen`);
    ok(await s.locator(".yl-q", { hasText: "Which drawing look" }).isVisible(), `${t}: the question is on the same screen as the look`);
    ok(await s.locator(".yl-cmpitem").count() === 3, `${t}: the three looks sit small above the options`);
    ok(await s.locator(".chip", { hasText: "None, try again" }).isVisible(), `${t}: the options are under the pictures`);
    ok(await pg.locator(".yl-plan .bigbtn.p").first().isDisabled(), `${t}: Send waits for an answer`);
    const noScroll = await pg.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth);
    ok(noScroll, `${t}: nothing scrolls sideways`);
    if (SHOTS) await pg.screenshot({ path: `${SHOTS}/web-askhere-after-${name}-${theme}.png` });

    // ---------- a tap on a picture is the answer ----------
    await s.locator(".yl-cmpitem", { hasText: "B" }).first().click();
    await pg.waitForTimeout(900);
    ok(await s.locator(".yl-cmpitem.on", { hasText: "B" }).count() === 1 || await pg.locator(".yl-planrow b", { hasText: /^B$/ }).count() === 1, `${t}: tapping look B answers B`);
    // The plan ends on a Review (or sends at once): one Send for the whole plan.
    const send = pg.locator(".yl-plan .bigbtn.p", { hasText: "Send" }).first();
    if (await send.isVisible().catch(() => false)) { await send.click(); await pg.waitForTimeout(700); }
    const w = (await wire(pg)).join("\n");
    ok(/\[yui\] \S+ plan plan\.\S+=B\s*$/.test(w), `${t}: the plan goes up once, with B`);
    ok(pg.errs.length === 0, `${t}: no page errors ${pg.errs.join(" | ")}`);
    await pg.context().close();
  }
}

// ---------- questions with no page before them keep one screen each ----------
{
  const pg = await open({ width: 390, height: 844 }, "dark", { hasTouch: true, isMobile: true });
  await say(pg, ALONE);
  await stage(pg);
  ok(await step(pg).locator(".yl-q", { hasText: "First?" }).isVisible() && await step(pg).locator(".yl-q", { hasText: "Second?" }).count() === 0, "bare questions: one per screen, as before");
  ok(await pg.locator(".yl-cmpitem").count() === 0, "bare questions: no picture strip");
  await pg.context().close();
}

await b.close();
console.log(`${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
