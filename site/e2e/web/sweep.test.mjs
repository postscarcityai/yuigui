// YUI-250 e2e: the parity sweep's last rows, on the demo relay (no sign in, no network): a page that keeps
// talking sends `[yui] screen=2`, and a reply with words and a card draws both in the thread.
//   npx next start -p 3250 &   then   BASE=http://localhost:3250 node e2e/web/sweep.test.mjs
import { createRequire } from "node:module";
import { mkdirSync } from "node:fs";
const { chromium } = createRequire(import.meta.url)(process.env.PLAYWRIGHT || "playwright");
const BASE = process.env.BASE || "http://localhost:3250";
const SHOTS = process.env.SHOTS || "";
if (SHOTS) mkdirSync(SHOTS, { recursive: true });
const b = await chromium.launch();
let pass = 0, fail = 0;
const ok = (c, msg) => { if (c) { pass++; console.log("  ok  ", msg); } else { fail++; console.log("  FAIL", msg); } };
const wire = (pg) => pg.evaluate(() => window.yuiWebDemo.wire("demo-penny").map((r) => r.body));
const VIEWS = [["390", { width: 390, height: 844 }, { hasTouch: true, isMobile: true }], ["desktop", { width: 1280, height: 800 }, {}]];

async function open(vp, theme, touch, view) {
  const ctx = await b.newContext({ viewport: vp, deviceScaleFactor: 2, ...touch });
  const pg = await ctx.newPage();
  pg.errs = [];
  pg.on("pageerror", (e) => pg.errs.push(e.message));
  await pg.goto(`${BASE}/web/agent/demo-penny?demo=penny&theme=${theme}${view ? `&view=${view}` : ""}`);
  await pg.waitForSelector(view === "chat" ? ".wb-thread[data-loaded='1']" : "[data-testid=stage-home]");
  await pg.waitForTimeout(500);
  return pg;
}

for (const theme of ["light", "dark"]) for (const [name, vp, touch] of VIEWS) {
  const t = `${theme} ${name}`;
  // ---------- a page that keeps talking (>2 talk, [yui] screen=2) ----------
  let pg = await open(vp, theme, touch);
  await pg.evaluate(() => window.yuiWebDemo.say("demo-penny", ">2\nsay \"Notes for the week\"\n>2 talk"));
  await pg.waitForSelector(".wb-pill >> text=Notes", { timeout: 8000 }).catch(() => {});
  await pg.waitForFunction(() => document.querySelectorAll(".wb-pill").length >= 2, null, { timeout: 8000 });
  await pg.keyboard.press("ArrowRight");
  await pg.waitForTimeout(600);
  ok(await pg.locator("[data-testid=stage-hint]").innerText().then((x) => !/Swipe back/.test(x)), `${t}: the page that talks keeps the bar`);
  if (SHOTS) await pg.screenshot({ path: `${SHOTS}/web-screen-talk-${name}-${theme}.png` });
  await pg.getByTestId("stage-type").click();
  await pg.getByTestId("stage-field").getByLabel("Message Penny").fill("move Thursday to Friday");
  await pg.keyboard.press("Enter");
  await pg.waitForFunction(() => window.yuiWebDemo.wire("demo-penny").some((r) => /\[yui\] screen=2/.test(r.body)), null, { timeout: 8000 }).catch(() => {});
  const sent = (await wire(pg)).filter((x) => x.includes("screen=2"));
  ok(sent.length === 1 && /^\[yui\] screen=2\nmove Thursday to Friday$/.test(sent[0]), `${t}: what is typed there goes up tagged with the page (${JSON.stringify(sent[0])})`);
  ok(pg.errs.length === 0, `${t}: no page errors ${pg.errs.join("|")}`);
  await pg.context().close();

  // ---------- words and a card in one reply ----------
  pg = await open(vp, theme, touch, "chat");
  const n = await pg.locator(".wb-item").count();
  await pg.evaluate(() => window.yuiWebDemo.say("demo-penny", "say \"Here is Thursday.\"\ncard \"Leg day\" \"Squat, RDL, walking lunges.\" cta=\"Start workout\""));
  await pg.waitForFunction((k) => document.querySelectorAll(".wb-item").length > k, n, { timeout: 15000 });
  await pg.waitForTimeout(500);
  const last = pg.locator(".wb-item").last();
  const txt = await last.innerText();
  ok(/Here is Thursday/.test(txt) && /Leg day/.test(txt) && /Start workout/.test(txt), `${t}: one reply holds the words and the card (${JSON.stringify(txt.slice(0, 60))})`);
  ok(await pg.getByTestId("to-stage").evaluate((e) => getComputedStyle(e).borderTopLeftRadius !== "0px"), `${t}: the Stage button is styled on a chat link`);
  ok(await pg.getByTestId("play-on-stage").first().evaluate((e) => getComputedStyle(e).backgroundColor === "rgba(0, 0, 0, 0)" && getComputedStyle(e).borderTopWidth === "0px").catch(() => true), `${t}: Play on the stage is a link, not a grey bar`);
  if (SHOTS) await pg.screenshot({ path: `${SHOTS}/web-mixed-reply-${name}-${theme}.png` });
  await pg.context().close();
}
console.log(`\n${pass} passed, ${fail} failed`);
await b.close();
process.exit(fail ? 1 : 0);
