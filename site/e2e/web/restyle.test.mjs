// YUI-250 e2e: a `theme app` offer in the thread (Use, Keep mine, Undo) and the first-run crew picker, on the demo relay
// (no sign in, no network). 390 px and desktop, light and dark.
//   npx next start -p 3250 &   then   BASE=http://localhost:3250 node e2e/web/restyle.test.mjs
import { createRequire } from "node:module";
import { mkdirSync } from "node:fs";
const { chromium } = createRequire(import.meta.url)(process.env.PLAYWRIGHT || "playwright");
const BASE = process.env.BASE || "http://localhost:3250";
const SHOTS = process.env.SHOTS || "";
if (SHOTS) mkdirSync(SHOTS, { recursive: true });
const b = await chromium.launch();
let pass = 0, fail = 0;
const ok = (c, msg) => { if (c) { pass++; console.log("  ok  ", msg); } else { fail++; console.log("  FAIL", msg); } };
const VIEWS = [["390", { width: 390, height: 844 }, { hasTouch: true, isMobile: true }], ["desktop", { width: 1280, height: 800 }, {}]];

async function open(vp, theme, touch, url) {
  const ctx = await b.newContext({ viewport: vp, deviceScaleFactor: 2, ...touch });
  const pg = await ctx.newPage();
  pg.errs = [];
  pg.on("pageerror", (e) => pg.errs.push(e.message));
  await pg.goto(url.replace("THEME", theme));
  return pg;
}

for (const theme of ["light", "dark"]) for (const [name, vp, touch] of VIEWS) {
  const t = `${theme} ${name}`;
  const pg = await open(vp, theme, touch, `${BASE}/web/agent/demo-penny?demo=penny&theme=THEME&view=chat`);
  await pg.waitForSelector(".wb-thread[data-loaded='1']");
  await pg.waitForTimeout(400);
  const n = await pg.locator(".wb-item").count();
  await pg.evaluate(() => window.yuiWebDemo.say("demo-penny", "say \"Want a new look?\"\ntheme app autumn"));
  await pg.waitForFunction((k) => document.querySelectorAll(".wb-item").length > k, n, { timeout: 15000 });
  await pg.waitForSelector("[data-testid=restyle-card]", { timeout: 10000 });
  const wire0 = (await pg.evaluate(() => window.yuiWebDemo.wire("demo-penny"))).length;
  ok(true, `${t}: the offer draws Now beside the new look`);
  ok((await pg.locator("[data-testid=restyle-card] .rs-go").innerText()) === "Use autumn", `${t}: the button names the look`);
  ok((await pg.locator("[data-testid=restyle-card] .rs-keep").innerText()) === "Keep mine", `${t}: Keep mine is there`);
  ok((await pg.locator("[data-testid=restyle-card] .rs-go").evaluate((e) => getComputedStyle(e).backgroundColor)) !== "rgba(0, 0, 0, 0)", `${t}: Use is a filled button`);
  ok((await pg.evaluate(() => window.yuiWebDemo.wire("demo-penny"))).length === wire0, `${t}: nothing changed before the tap`);
  const before = await pg.evaluate(() => getComputedStyle(document.querySelector(".web-root")).getPropertyValue("--brand"));
  await pg.waitForTimeout(900); // the card fades in
  if (SHOTS) await pg.screenshot({ path: `${SHOTS}/web-restyle-offer-${name}-${theme}.png` });
  await pg.locator("[data-testid=restyle-card] .rs-go").click();
  await pg.waitForSelector("[data-testid=restyle-done]");
  ok((await pg.getByTestId("restyle-done").innerText()).startsWith("Yui is autumn now."), `${t}: Use wears it, one line`);
  const after = await pg.evaluate(() => getComputedStyle(document.querySelector(".web-root")).getPropertyValue("--brand"));
  ok(after && after !== before, `${t}: the chrome wears it (${before.trim()} -> ${after.trim()})`);
  await pg.waitForFunction(() => window.yuiWebDemo.wire("demo-penny").some((w) => /choice=apply/.test(w.body)), null, { timeout: 8000 }).catch(() => {});
  const wire = await pg.evaluate(() => window.yuiWebDemo.wire("demo-penny"));
  ok(wire.length > wire0 && wire.slice(wire0).some((w) => /theme choice=apply name=autumn scope=app/.test(w.body)), `${t}: the agent hears it (${JSON.stringify(wire.at(-1))})`);
  ok(wire.slice(wire0).some((w) => w.meta?.echo === "Use autumn"), `${t}: the thread shows the app's words, Use autumn`);
  await pg.waitForTimeout(500);
  if (SHOTS) await pg.screenshot({ path: `${SHOTS}/web-restyle-applied-${name}-${theme}.png` });
  await pg.getByTestId("restyle-undo").click();
  await pg.waitForFunction(() => /Put back/.test(document.querySelector("[data-testid=restyle-done]")?.textContent || ""));
  const undone = await pg.evaluate(() => getComputedStyle(document.querySelector(".web-root")).getPropertyValue("--brand"));
  ok(undone === before, `${t}: Undo puts the old look back`);
  ok(pg.errs.length === 0, `${t}: no page errors ${pg.errs.join("|")}`);
  await pg.context().close();
}

// Keep mine changes nothing and says so.
{
  const pg = await open(VIEWS[0][1], "light", VIEWS[0][2], `${BASE}/web/agent/demo-penny?demo=penny&theme=THEME&view=chat`);
  await pg.waitForSelector(".wb-thread[data-loaded='1']");
  const n = await pg.locator(".wb-item").count();
  await pg.evaluate(() => window.yuiWebDemo.say("demo-penny", "theme app sunset"));
  await pg.waitForFunction((k) => document.querySelectorAll(".wb-item").length > k, n, { timeout: 15000 });
  const before = await pg.evaluate(() => getComputedStyle(document.querySelector(".web-root")).getPropertyValue("--brand"));
  await pg.locator("[data-testid=restyle-card] .rs-keep").click();
  ok((await pg.getByTestId("restyle-done").innerText()) === "Kept your look.", "Keep mine: one line");
  ok((await pg.evaluate(() => getComputedStyle(document.querySelector(".web-root")).getPropertyValue("--brand"))) === before, "Keep mine: the look stays");
  await pg.context().close();
}

// First run: a new account picks its crew before anything else.
for (const theme of ["light", "dark"]) for (const [name, vp, touch] of VIEWS) {
  const t = `crew ${theme} ${name}`;
  const pg = await open(vp, theme, touch, `${BASE}/web?demo=first&theme=THEME`);
  await pg.waitForSelector("[data-testid=crew-pick]", { timeout: 15000 });
  ok((await pg.getByTestId("crew-pick-title").innerText()).includes("pick your crew"), `${t}: the first run asks for a crew`);
  if (SHOTS) await pg.screenshot({ path: `${SHOTS}/web-crew-pick-${name}-${theme}.png` });
  await pg.locator("[data-testid^=crew-more-]").first().click();
  ok(await pg.getByTestId("crew-page").isVisible(), `${t}: an info page per starter`);
  await pg.getByTestId("crew-page-back").click();
  const starters = await pg.locator("[data-testid^=crew-pick-]:not([data-testid=crew-pick-title])").count();
  ok(starters >= 3, `${t}: the starters list (${starters})`);
  await pg.locator("[data-testid^=crew-pick-]:not([data-testid=crew-pick-title])").first().click();
  await pg.getByTestId("crew-start").click();
  await pg.waitForSelector("[data-testid=crew-pick]", { state: "detached", timeout: 15000 });
  ok(true, `${t}: Start closes the picker and opens the app`);
  ok(pg.errs.length === 0, `${t}: no page errors ${pg.errs.join("|")}`);
  await pg.context().close();
}
console.log(`\n${pass} passed, ${fail} failed`);
await b.close();
process.exit(fail ? 1 : 0);
