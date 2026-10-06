// YUI-304 e2e (the web twin of YUI-303): Start on Today's workout opens the runner full screen, a set asks reps and
// weight and then rests, and a Review row for a workout never draws the runner in the drawer. Demo relay, no sign in.
//   npx next start -p 3304 &   then   PLAYWRIGHT=<path to playwright> node e2e/web/workout.test.mjs
// YUI-309: Edit swaps a move mid-workout (and changes sets, adds a move), the music strip shows only while something plays,
// and the answer's `edits` names the swap.
// SHOTS=<folder> writes dark and light shots of Start -> runner -> log -> rest timer -> the edit sheet.
import { createRequire } from "node:module";
import { mkdirSync } from "node:fs";
import { FLOWS } from "../../lib/yl/samples.mjs";
const { chromium } = createRequire(import.meta.url)(process.env.PLAYWRIGHT || "playwright");
const BASE = process.env.BASE || "http://localhost:3304";
const SHOTS = process.env.SHOTS || "";
if (SHOTS) mkdirSync(SHOTS, { recursive: true });
const b = await chromium.launch();
let pass = 0, fail = 0;
const ok = (c, msg) => { if (c) { pass++; console.log("  ok  ", msg); } else { fail++; console.log("  FAIL", msg); } };
const AGENT = "demo-penny";
const WORKOUT = FLOWS.find((s) => s.slug === "arnold-runner").yl;
const HOME = `card@today "Today's workout" "Full body A to start. About 40 minutes." sub="Starter week" cta="Start"\nsave today`;

async function say(pg, yl) {
  const n = await pg.locator(".wb-item").count();
  await pg.evaluate(([y]) => window.yuiWebDemo.say("demo-penny", y, {}), [yl]);
  await pg.waitForFunction((k) => document.querySelectorAll(".wb-item").length > k, n, { timeout: 15000 });
  await pg.waitForTimeout(400);
}
const wire = (pg) => pg.evaluate(() => window.yuiWebDemo.wire("demo-penny"));
const runner = (pg) => pg.locator(".wb-stage [data-testid=runner-e1]").first();
// The plan opens on its first page: step to the first move, as a person swipes or taps Next.
async function toFirstMove(pg) {
  for (let i = 0; i < 6 && !(await runner(pg).isVisible().catch(() => false)); i++) {
    const nx = pg.locator(".yl-plan .bigbtn.p").first();
    if (await nx.isVisible().catch(() => false)) await nx.click().catch(() => {}); else await pg.keyboard.press("ArrowRight");
    await pg.waitForTimeout(400);
  }
}

for (const theme of ["dark", "light"]) {
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
  const pg = await ctx.newPage();
  const errs = [];
  pg.on("pageerror", (e) => errs.push(e.message));
  await pg.goto(`${BASE}/web/agent/${AGENT}?demo=penny&theme=${theme}`);
  await pg.waitForSelector("[data-testid=stage-home]");
  await pg.waitForTimeout(600);
  const t = `${theme} 390`;

  // ---- the agent files Today's workout as a page of its own; Start is its card's button ----
  await pg.evaluate(([y]) => window.yuiWebDemo.say("demo-penny", y, {}), [`>2\n${HOME}`]);
  await pg.waitForTimeout(900);
  await pg.keyboard.press("ArrowRight");
  await pg.waitForTimeout(600);
  ok(await pg.locator(".ys-pager").evaluate((el) => el.style.getPropertyValue("--at").trim() !== "0"), `${t}: the page is open beside the home`);
  const start = pg.getByRole("button", { name: "Start", exact: true }).first();
  ok(await start.isVisible().catch(() => false), `${t}: Today's workout is a page with a Start button`);
  if (SHOTS) await pg.screenshot({ path: `${SHOTS}/web-workout-start-${theme}.png` });
  const before = (await wire(pg)).length;
  await start.click();
  await pg.waitForTimeout(500);
  ok((await wire(pg)).length > before, `${t}: Start goes up to the agent`);
  ok(await pg.locator(".ys-pager").evaluate((el) => el.style.getPropertyValue("--at").trim() === "0"), `${t}: the stage is back on the home, where the answer lands`);
  // ---- the agent answers with the workout: it opens as the runner, no extra page between ----
  await pg.evaluate(([y]) => window.yuiWebDemo.say("demo-penny", y, {}), [WORKOUT]);
  await pg.waitForSelector(".wb-stage .yl-plan", { timeout: 8000 }).catch(() => {});
  await pg.waitForTimeout(600);
  ok(await pg.locator(".wb-stage").first().isVisible().catch(() => false), `${t}: the workout comes up on the stage by itself`);
  ok(await pg.locator(".yl-plan").first().isVisible().catch(() => false), `${t}: it is the plan, full screen`);
  await toFirstMove(pg);
  ok(await runner(pg).isVisible().catch(() => false), `${t}: one move on a page`);
  ok(await pg.locator("[data-testid=drawer] [data-testid^=runner-]").count() === 0, `${t}: no runner inside the drawer`);

  // ---- a set asks reps and weight, then the rest ----
  await pg.locator(".wb-stage [data-testid=runner-e1-set-1]").click();
  ok(await pg.locator(".wb-stage [data-testid=runner-e1-log-title]").innerText() === "Set 1 of 3 done", `${t}: after a set it asks what was done`);
  ok(await pg.locator(".wb-stage [data-testid=runner-e1-rest]").count() === 0, `${t}: the rest waits for the log`);
  await pg.locator(".wb-stage [data-testid=runner-e1-log-reps-minus]").click();
  await pg.locator(".wb-stage [data-testid=runner-e1-log-lb-chip-25]").click();
  ok(await pg.locator(".wb-stage [data-testid=runner-e1-log-reps-value]").innerText() === "9", `${t}: the stepper moves the reps`);
  ok(/25 lb/.test(await pg.locator(".wb-stage [data-testid=runner-e1-log-lb-value]").innerText()), `${t}: a chip sets the weight`);
  if (SHOTS) await pg.screenshot({ path: `${SHOTS}/web-workout-log-${theme}.png` });
  await pg.locator(".wb-stage [data-testid=runner-e1-log-done]").click();
  ok(await pg.locator(".wb-stage [data-testid=runner-e1-rest]").count() === 1, `${t}: Log set starts the rest`);
  ok(/^\d:\d\d$/.test((await pg.locator(".wb-stage [data-testid=runner-e1-rest] b").innerText()).trim()), `${t}: the rest counts down (90 s default)`);
  ok(await pg.locator(".wb-stage [data-testid=runner-e1-set-1]").getAttribute("aria-pressed") === "true", `${t}: the set is ticked`);
  await pg.locator(".wb-stage [data-testid=runner-e1-rest-more]").click();
  if (SHOTS) await pg.screenshot({ path: `${SHOTS}/web-workout-rest-${theme}.png` });
  await pg.locator(".wb-stage [data-testid=runner-e1-rest-skip]").click();
  ok(await pg.locator(".wb-stage [data-testid=runner-e1-rest]").count() === 0, `${t}: Skip rest goes to the next set`);
  await pg.locator(".wb-stage [data-testid=runner-e1-set-2]").click();
  ok(await pg.locator(".wb-stage [data-testid=runner-e1-log-reps-value]").innerText() === "9", `${t}: the next set starts where the last ended`);

  // ---- edits on the fly (YUI-309): swap the move, a set more, a move added, then finish ----
  // The sheet is drawn over the whole screen, so it sits outside the stage.
  const st = (id) => pg.locator(id.startsWith("runner-edit") ? `[data-testid=${id}]` : `.wb-stage [data-testid=${id}]`);
  ok(await st("runner-music").count() === 0, `${t}: no strip while nothing plays`);
  await st("runner-e1-edit").click();
  ok(/Edit Goblet squat/.test(await st("runner-edit-title").innerText()), `${t}: Edit opens the sheet for this move`);
  await st("runner-edit-swap-leg-press").click();
  ok(/Edit Leg press/.test(await st("runner-edit-title").innerText()), `${t}: swapping renames it`);
  await st("runner-edit-sets-plus").click();
  ok(await st("runner-edit-sets-value").innerText() === "4", `${t}: a set more`);
  await st("runner-edit-add-lunge").click();
  const lines = await st("runner-edit-changes").innerText();
  ok(/Swapped Goblet squat for Leg press/.test(lines) && /Leg press: 4 sets \(was 3\)/.test(lines) && /Added Lunge 3x10/.test(lines), `${t}: the sheet lists what changed`);
  if (SHOTS) await pg.screenshot({ path: `${SHOTS}/web-workout-edit-${theme}.png` });
  await st("runner-edit-close").click();
  ok(await st("runner-e1-set-4").count() === 1, `${t}: the move has its fourth set`);
  ok(/Leg press/.test(await pg.locator(".wb-stage [data-testid=runner-e1] .rn-title").innerText()), `${t}: the page says Leg press`);
  ok(await st("runner-e1-set-1").getAttribute("aria-pressed") === "true", `${t}: the ticked set stays ticked`);

  // ---- music: the strip is there only while the page has something playing; every button does something ----
  await pg.evaluate(() => {
    window.__music = { next: 0, pause: 0 };
    navigator.mediaSession.metadata = new MediaMetadata({ title: "Midnight City", artist: "M83" });
    navigator.mediaSession.setActionHandler("nexttrack", () => { window.__music.next++; });
    navigator.mediaSession.setActionHandler("pause", () => { window.__music.pause++; });
    navigator.mediaSession.playbackState = "playing";
  });
  await pg.waitForSelector(".wb-stage [data-testid=runner-music]", { timeout: 4000 });
  ok(await st("runner-music-title").innerText() === "Midnight City", `${t}: the strip names the song`);
  await st("runner-music-next").click();
  await st("runner-music-play").click();
  ok(await pg.evaluate(() => window.__music.next === 1 && window.__music.pause === 1), `${t}: next and pause reach the page's player`);
  if (SHOTS) await pg.screenshot({ path: `${SHOTS}/web-workout-music-${theme}.png` });
  await pg.evaluate(() => { navigator.mediaSession.playbackState = "none"; navigator.mediaSession.metadata = null; });
  await pg.waitForFunction(() => !document.querySelector("[data-testid=runner-music]"), null, { timeout: 4000 });
  ok(true, `${t}: nothing playing, the strip is gone`);

  // ---- finish: the answer's edits names the swap ----
  const sent0 = (await wire(pg)).length;
  for (let i = 0; i < 14; i++) {
    const fin = pg.locator(".wb-stage .yl-plan .bigbtn.p").first();
    if (!(await fin.isVisible().catch(() => false))) break;
    const label = (await fin.innerText()).trim();
    if (label === "Finish workout") { await fin.click(); break; }
    // The last page asks how it felt: one tap answers it and goes on to the review.
    if (await fin.isDisabled()) { await pg.locator(".wb-stage").getByRole("button", { name: "Easy", exact: true }).first().click(); await pg.waitForTimeout(900); continue; }
    await fin.click(); await pg.waitForTimeout(350);
  }
  await pg.waitForTimeout(500);
  const sent = JSON.stringify((await wire(pg)).slice(sent0));
  ok(/Swapped Goblet squat for Leg press/.test(sent), `${t}: the answer's edits names the swap`);
  ok(/Added Lunge 3x10/.test(sent) && /add1-reps/.test(sent), `${t}: and the added move, answered by its own ids`);

  // ---- a Review row for a workout closes the drawer and opens the runner on the stage ----
  await pg.reload();
  await pg.waitForSelector("[data-testid=stage-home]");
  await pg.waitForTimeout(600);
  await pg.evaluate(([y]) => window.yuiWebDemo.say("demo-penny", y, {}), [WORKOUT]);
  await pg.waitForTimeout(900);
  await pg.evaluate(([y]) => window.yuiWebDemo.say("demo-penny", y, {}), [`menu review@need-wk "Today's workout" sub="Full body A"`]);
  await pg.waitForTimeout(900);
  // back to the home with nothing playing, then the drawer
  await pg.getByRole("button", { name: /Close full screen|Back home/ }).first().click({ timeout: 1500 }).catch(() => {});
  await pg.waitForTimeout(500);
  await pg.locator("[data-testid=stage-menu]").click();
  await pg.waitForSelector("[data-testid=drawer]");
  await pg.locator("[data-testid=tab-review]").click();
  const row = pg.locator("[data-testid=review-need-wk]");
  ok(await row.isVisible().catch(() => false), `${t}: the workout waits in Review`);
  ok(await pg.locator("[data-testid=drawer] [data-testid^=runner-], [data-testid=drawer] .yl-plan").count() === 0, `${t}: Review lists it, it does not draw it`);
  await row.click();
  await pg.waitForTimeout(900);
  const dbox = await pg.locator("[data-testid=drawer]").boundingBox().catch(() => null);
  ok(!dbox || dbox.x + dbox.width <= 2 || dbox.x >= 388, `${t}: a Review tap closes the drawer`);
  ok(await pg.locator(".wb-stage .yl-plan").first().isVisible().catch(() => false), `${t}: the workout opens on the stage`);
  ok(await pg.locator("[data-testid=drawer] [data-testid^=runner-]").count() === 0, `${t}: never in the drawer`);
  ok(errs.length === 0, `${t}: no page errors${errs.length ? ` (${errs[0]})` : ""}`);
  await ctx.close();
}
await b.close();
console.log(`\n${pass} ok, ${fail} failed`);
process.exit(fail ? 1 : 0);
