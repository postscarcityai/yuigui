// YUI-280 e2e: a turn that ends with nothing back says so, with Try again, in the thread and on the stage.
//   npx next start -p 3280 &   then   node e2e/web/noanswer.test.mjs
// The demo relay ends a turn empty for a line with "go quiet" in it. BASE overrides the origin, PLAYWRIGHT the
// Playwright module, SHOTS the folder for the 390 px shots (light and dark).
import { createRequire } from "node:module";
import { mkdirSync } from "node:fs";
const { chromium } = createRequire(import.meta.url)(process.env.PLAYWRIGHT || "playwright");
const BASE = process.env.BASE || "http://localhost:3280";
const SHOTS = process.env.SHOTS || "";
const TAG = process.env.TAG || "after";
if (SHOTS) mkdirSync(SHOTS, { recursive: true });
const b = await chromium.launch();
let pass = 0, fail = 0;
const ok = (c, msg) => { if (c) { pass++; console.log("  ok  ", msg); } else { fail++; console.log("  FAIL", msg); } };
const wire = (pg) => pg.evaluate(() => window.yuiWebDemo.wire("demo-penny").filter((r) => r.kind === "text").map((r) => r.body));
const WORDS = "Find me a quiet cafe, go quiet";

async function open(theme) {
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
  const pg = await ctx.newPage();
  pg.errs = [];
  pg.on("pageerror", (e) => pg.errs.push(e.message));
  await pg.goto(`${BASE}/web/agent/demo-penny?demo=penny&theme=${theme}`);
  await pg.waitForSelector("[data-testid=stage-home]");
  await pg.waitForTimeout(500);
  return pg;
}

for (const theme of ["light", "dark"]) {
  // ---------- the thread ----------
  let pg = await open(theme);
  await pg.locator("[data-testid=stage-record]").click();
  await pg.waitForSelector(".wb-item");
  await pg.getByLabel("Message Penny").fill(WORDS);
  await pg.keyboard.press("Enter");
  await pg.waitForSelector(".wb-working");
  ok(await pg.locator("[data-testid=no-answer]").count() === 0, `${theme} thread: no notice while it works`);
  const row = await pg.waitForSelector("[data-testid=no-answer]", { timeout: 8000 }).catch(() => null);
  if (!row && SHOTS) await pg.screenshot({ path: `${SHOTS}/web-noanswer-thread-${TAG}-${theme}.png` });
  ok(!!row, `${theme} thread: the row shows when the turn ends with no reply`);
  if (row) {
    ok(/No answer came back/.test(await row.innerText()), `${theme} thread: it says No answer came back`);
    ok(await pg.locator(".wb-working").count() === 0, `${theme} thread: the working row is gone`);
    if (SHOTS) await pg.screenshot({ path: `${SHOTS}/web-noanswer-thread-${TAG}-${theme}.png` });
    await pg.getByTestId("try-again").click();
    await pg.waitForSelector(".wb-working");
    await pg.waitForTimeout(400);
    const sent = (await wire(pg)).filter((x) => x === WORDS).length;
    ok(sent === 2, `${theme} thread: Try again sent the last message again (${sent} sends)`);
    ok(await pg.locator("[data-testid=no-answer]").count() === 0, `${theme} thread: the row clears while the new turn works`);
    await pg.waitForSelector("[data-testid=no-answer]", { timeout: 8000 });
    // a real reply replaces the row
    await pg.evaluate(() => window.yuiWebDemo.say("demo-penny", "~h1 Here you go"));
    await pg.waitForTimeout(2500);
    ok(await pg.locator("[data-testid=no-answer]").count() === 0, `${theme} thread: a real reply clears the row`);
  }

  // a newer message ends the offer
  await pg.getByLabel("Message Penny").fill("Never mind, go quiet again");
  await pg.keyboard.press("Enter");
  await pg.waitForSelector("[data-testid=no-answer]", { timeout: 8000 }).catch(() => {});
  await pg.getByLabel("Message Penny").fill("Another thing");
  await pg.keyboard.press("Enter");
  await pg.waitForTimeout(400);
  ok(await pg.locator("[data-testid=try-again]").count() === 0, `${theme} thread: no Try again once something newer was sent`);
  ok(pg.errs.length === 0, `${theme} thread: no page errors ${pg.errs.join(";")}`);
  await pg.context().close();

  // ---------- the stage ----------
  pg = await open(theme);
  await pg.getByTestId("stage-type").click();
  await pg.getByTestId("stage-field").locator("textarea, input:not([type=file])").first().fill(WORDS);
  await pg.getByTestId("stage-send").click();
  const lost = await pg.waitForSelector("[data-testid=stage-noanswer]", { timeout: 8000 }).catch(() => null);
  if (!lost && SHOTS) await pg.screenshot({ path: `${SHOTS}/web-noanswer-stage-${TAG}-${theme}.png` });
  ok(!!lost, `${theme} stage: the stage says so when the turn ends with no reply`);
  if (lost) {
    ok(/No answer came back/.test(await lost.innerText()), `${theme} stage: No answer came back`);
    if (SHOTS) await pg.screenshot({ path: `${SHOTS}/web-noanswer-stage-${TAG}-${theme}.png` });
    await pg.getByTestId("stage-noanswer").getByTestId("try-again").click();
    await pg.waitForSelector("[data-testid=stage-working]");
    await pg.waitForTimeout(400);
    ok((await wire(pg)).filter((x) => x === WORDS).length === 2, `${theme} stage: Try again sent the words again`);
  }
  ok(pg.errs.length === 0, `${theme} stage: no page errors ${pg.errs.join(";")}`);
  await pg.context().close();
}
await b.close();
console.log(`${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
