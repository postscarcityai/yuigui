// YUI-314 e2e: chat is home on /web (pick A, Oct 6). Plain answers stay in the chat, a visual opens the stage, and older
// stage replies fold into one chip in the thread. Dark and light, on the demo relay.
//   npx next build && npx next start -p 3314 &   then   node e2e/web/stagehome.test.mjs   (SHOTS=<dir> keeps stills)
import { createRequire } from "node:module";
import { mkdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
const { chromium } = createRequire(import.meta.url)(process.env.PLAYWRIGHT || "playwright");
const BASE = process.env.BASE || "http://localhost:3314";
const SHOTS = process.env.SHOTS || "";
if (SHOTS) mkdirSync(SHOTS, { recursive: true });
const film = JSON.parse(readFileSync(fileURLToPath(new URL("../../public/demo/motion/gallery/engine-r1.json", import.meta.url)), "utf8"));
const b = await chromium.launch();
let pass = 0, fail = 0;
const ok = (c, msg) => { if (c) { pass++; console.log("  ok  ", msg); } else { fail++; console.log("  FAIL", msg); } };
const wait = (pg, ms) => pg.waitForTimeout(ms);

const VISUALS = {
  deck: `deck "Orbits"\npage "The sun and us"\nshapes\nshape@sun circle Sun at=3,3 size=3 tone=butter +fill\npage "Why it matters"\nshapes\nshape@earth circle Earth at=5,3 size=3 tone=mint`,
  plan: `plan "Trip" submit="Send"\nchoose "Size?" S|M|L\nform "About you" name:text! notes:long\nend`,
  sketch: `sketch "Build ready" frame=phone\nrow "Build 97 is ready" +x note="no way to open it"\nafter\nrow "Build 97 is ready" +hi note="one tap to open"`,
  timer: `say Three\ntimer 5m Focus`,
  motion: `motion "How a car engine works" film=e1 part=1\n=== scene ${film.scenes[0].name} ${film.scenes[0].dur} ===\n${film.scenes[0].code}\nend`,
};
const timer = (n) => `timer ${n}m Tea`;

async function start(theme) {
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
  const pg = await ctx.newPage();
  pg.errs = [];
  pg.setDefaultTimeout(8000);
  pg.on("pageerror", (e) => pg.errs.push(e.message));
  await pg.goto(`${BASE}/web/agent/demo-penny?demo=penny&theme=${theme}`);
  await pg.waitForSelector("[data-testid=stage-home]");
  await wait(pg, 400);
  // The person says something on the stage; the reply is dropped in as the agent would write it.
  await pg.locator("[data-testid=stage-type]").click();
  await pg.locator("[data-testid=stage-field] textarea").fill("show me");
  await pg.keyboard.press("Enter");
  await pg.waitForSelector("[data-testid=stage-working], .ys-play");
  return pg;
}
const say = (pg, yl) => pg.evaluate((y) => window.yuiWebDemo.say("demo-penny", y), yl);
const fence = (s) => s;
const onStage = (pg) => pg.locator("[data-testid=stage]").count().then((n) => n > 0);
const shot = async (pg, name) => { if (SHOTS) { await wait(pg, 600); await pg.screenshot({ path: `${SHOTS}/${name}.png` }); } };

for (const theme of ["dark", "light"]) {
  // (1) plain words and a plain choose stay in the chat.
  for (const [name, yl, text] of [["a plain text reply", "say Board is green.", /Board is green/], ["a plain choose", `say "Ping you?"\nchoose "Ping you?" Yes|No`, /Ping you/]]) {
    const pg = await start(theme);
    await say(pg, yl);
    await pg.waitForSelector("[data-testid=stage]", { state: "detached", timeout: 8000 }).catch(() => {});
    ok(!(await onStage(pg)), `${theme}: ${name} leaves no full-screen stage`);
    ok(text.test(await pg.locator(".wb-thread").innerText()), `${theme}: ${name} is in the chat`);
    if (name === "a plain text reply") await shot(pg, `plain-answer-${theme}`);
    ok(pg.errs.length === 0, `${theme}: ${name}: no page errors ${pg.errs.join("|")}`);
    await pg.context().close();
  }

  // (2) a deck, a plan, a sketch, a timer and a motion film open the stage and keep it.
  for (const [name, yl] of Object.entries(VISUALS)) {
    const pg = await start(theme);
    await say(pg, yl);
    if (name === "motion") await pg.waitForSelector("[data-testid=film]", { timeout: 10000 }).catch(() => {});
    else await pg.waitForSelector(".ys-play, [data-testid=sketch-phone], [data-testid=deck-stage]", { timeout: 10000 }).catch(() => {});
    await wait(pg, 1500);
    ok(await onStage(pg), `${theme}: a ${name} reply opens and keeps the stage`);
    if (name === "timer") await shot(pg, `visual-on-stage-${theme}`);
    ok(pg.errs.length === 0, `${theme}: ${name}: no page errors ${pg.errs.join("|")}`);
    await pg.context().close();
  }

  // (3) three stage replies in a row: the newest on stage, the two older folded into ONE chip in the thread.
  {
    const pg = await start(theme);
    for (const n of [1, 2, 3]) { await say(pg, timer(n)); await wait(pg, 700); }
    await wait(pg, 1200);
    ok(await onStage(pg), `${theme}: three stage replies leave the stage up`);
    await pg.locator("[data-testid=stage-record]").click();
    await pg.waitForSelector("[data-testid=stage-fold-chip]");
    const chips = pg.locator("[data-testid=stage-fold-chip]");
    ok((await chips.count()) === 1, `${theme}: ONE fold chip in the thread`);
    const folded = Number(/(\d+) earlier screens/.exec(await chips.first().innerText())?.[1] || 0);
    ok(folded >= 2, `${theme}: it counts the older replies (${folded}), the newest stays out of it`);
    ok((await pg.locator("[data-testid=stage-fold-chip]").evaluate((el) => el.closest(".wb-item").nextElementSibling !== null)), `${theme}: the folded rows are gone from the thread`);
    const before = await pg.locator(".wb-item").count();
    await chips.first().scrollIntoViewIfNeeded();
    await shot(pg, `fold-chip-before-${theme}`);
    await chips.first().click();
    await wait(pg, 400);
    ok((await chips.first().getAttribute("aria-expanded")) === "true", `${theme}: a tap opens the folded replies in place`);
    ok((await pg.locator(".wb-item").count()) === before + folded - 1, `${theme}: the folded replies are back in place`);
    ok(/Fold earlier/.test(await chips.first().innerText()), `${theme}: the chip now offers to fold them again`);
    ok(!(await onStage(pg)) && (await pg.locator(".yl-stage.open").count()) === 0, `${theme}: opening them in place does not throw a stage over the chat`);
    await shot(pg, `fold-chip-after-${theme}`);
    await chips.first().click();
    await wait(pg, 300);
    ok((await pg.locator(".wb-item").count()) === before, `${theme}: a second tap folds them again`);
    ok(pg.errs.length === 0, `${theme}: fold: no page errors ${pg.errs.join("|")}`);
    await pg.context().close();
  }
}
await b.close();
console.log(`${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
