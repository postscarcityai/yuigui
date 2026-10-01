// YUI-243 e2e: the stage on the web, on the demo relay (no sign in, no network).
//   npx next start -p 3243 &   then   node e2e/web/stage.test.mjs
// BASE overrides the origin, PLAYWRIGHT the Playwright module, SHOTS the folder for 390 px and desktop shots.
import { createRequire } from "node:module";
import { mkdirSync } from "node:fs";
const { chromium } = createRequire(import.meta.url)(process.env.PLAYWRIGHT || "playwright");
const BASE = process.env.BASE || "http://localhost:3243";
const SHOTS = process.env.SHOTS || "";
if (SHOTS) mkdirSync(SHOTS, { recursive: true });
const b = await chromium.launch();
let pass = 0, fail = 0;
const ok = (c, msg) => { if (c) { pass++; console.log("  ok  ", msg); } else { fail++; console.log("  FAIL", msg); } };
const wire = (pg) => pg.evaluate(() => window.yuiWebDemo.wire("demo-penny").map((r) => r.body));

async function open(vp, theme, extra = {}) {
  const ctx = await b.newContext({ viewport: vp, deviceScaleFactor: 2, ...extra });
  const pg = await ctx.newPage();
  pg.errs = [];
  pg.on("pageerror", (e) => pg.errs.push(e.message));
  await pg.goto(`${BASE}/web/agent/demo-penny?demo=penny&theme=${theme}`);
  await pg.waitForSelector("[data-testid=stage-home]");
  await pg.waitForTimeout(500);
  return pg;
}

for (const theme of ["light", "dark"]) {
  for (const [name, vp, touch] of [["390", { width: 390, height: 844 }, { hasTouch: true, isMobile: true }], ["desktop", { width: 1280, height: 800 }, {}]]) {
    const t = `${theme} ${name}`;
    const pg = await open(vp, theme, touch);

    // ---------- home: the agent, its asks, its chips, the bars ----------
    ok(await pg.locator("[data-testid=stage-agent]").innerText().then((x) => /Penny/.test(x)), `${t}: the top bar names the agent`);
    ok(await pg.locator("[data-testid=home-waiting]").count() === 1, `${t}: what waits on you is on the home`);
    ok(await pg.locator("[data-testid=home-chips] .wb-chip").count() === 2, `${t}: the shortcuts are chips over the bar`);
    ok(await pg.locator("[data-testid=stage-record]").innerText().then((x) => /\d/.test(x)), `${t}: the chat toggle carries the new count`);
    ok(await pg.locator(".wb-pill").count() === 2, `${t}: a page makes a second screen, pills for both`);
    const noScroll = await pg.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth);
    ok(noScroll, `${t}: nothing scrolls sideways`);
    if (name === "390") {
      const small = await pg.evaluate(() => [...document.querySelectorAll(".wb-stage button")].filter((e) => e.offsetParent && (e.getBoundingClientRect().width < 36 || e.getBoundingClientRect().height < 36)).map((e) => e.className));
      ok(small.length === 0, `${t}: every button is at least 36 px ${small.join(",")}`);
    }
    if (SHOTS) await pg.screenshot({ path: `${SHOTS}/web-stage-home-${name}-${theme}.png` });

    // ---------- screen 2: a click, the arrow keys, a swipe back ----------
    await pg.locator(".wb-pill", { hasText: "Runs this month" }).click();
    await pg.waitForTimeout(500);
    ok(await pg.locator(".wb-pill.on").innerText().then((x) => /Runs/.test(x)), `${t}: the pill moves to the page`);
    if (SHOTS) await pg.screenshot({ path: `${SHOTS}/web-stage-screen2-${name}-${theme}.png` });
    await pg.keyboard.press("ArrowLeft");
    await pg.waitForTimeout(400);
    ok(await pg.locator(".wb-pill.on").innerText().then((x) => x === "Home"), `${t}: the left arrow goes back home`);
    await pg.keyboard.press("ArrowRight");
    await pg.waitForTimeout(400);
    ok(await pg.locator(".wb-pill.on").innerText().then((x) => /Runs/.test(x)), `${t}: the right arrow goes to screen 2`);
    await pg.locator(".wb-pill", { hasText: "Home" }).click();
    await pg.waitForTimeout(400);

    // ---------- a chip sends the shortcut as the person's message ----------
    await pg.locator("[data-testid=home-chip-]").first().count(); // ids vary; click by label
    await pg.locator(".wb-chip", { hasText: "Plan my week" }).click();
    await pg.waitForSelector("[data-testid=stage-working]", { timeout: 6000 });
    await pg.waitForTimeout(250); // the outbox keeps it on disk first, then sends
    ok((await wire(pg)).at(-1) === "Plan my week", `${t}: the chip went out as the person's words`);
    ok(await pg.locator("[data-testid=stage]").getAttribute("data-mood").then((m) => m !== "idle"), `${t}: the stage is working`);
    if (SHOTS) await pg.screenshot({ path: `${SHOTS}/web-stage-working-${name}-${theme}.png` });

    // ---------- the answer plays on the stage ----------
    await pg.waitForFunction(() => /Friday is the rest day/.test(document.querySelector("[data-testid=stage]")?.innerText || ""), null, { timeout: 20000 });
    ok(true, `${t}: the reply plays on the stage`);
    await pg.waitForTimeout(900);
    if (SHOTS) await pg.screenshot({ path: `${SHOTS}/web-stage-answer-${name}-${theme}.png` });

    // ---------- the chat record is one tap away, and back ----------
    await pg.locator("[data-testid=stage-record]").click();
    await pg.waitForSelector(".wb-item");
    ok(await pg.locator(".wb-user .wb-bubble", { hasText: "Plan my week" }).count() === 1, `${t}: the record holds the turn`);
    ok(pg.errs.length === 0, `${t}: no page errors ${pg.errs.join("|")}`);
    await pg.context().close();
  }
}

// ---------- reduced motion: fades, and nothing breaks ----------
{
  const pg = await open({ width: 390, height: 844 }, "light", { reducedMotion: "reduce" });
  ok(await pg.locator(".wb-stage.mo-still").count() === 1, "reduced motion: the stage is still");
  await pg.context().close();
}
await b.close();
console.log(`${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
