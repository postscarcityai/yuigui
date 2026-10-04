// YUI-283 e2e: a form and a plan page fill by voice on the web, like the phone (t_0ab09ee7, t_7d424132). The recognizer is a
// stand-in that says whatever the page set in window.__words once the mic is open (Chrome's real one needs Google's speech
// service, so CI cannot use it). Demo account only: the Client website intake plan comes from the demo relay.
//   npx next build && npx next start -p 3283 &   then   node e2e/web/voicefill.test.mjs
// BASE overrides the origin, PLAYWRIGHT the Playwright module, SHOTS the folder for 390 px and desktop shots.
import { createRequire } from "node:module";
import { mkdirSync } from "node:fs";
const { chromium } = createRequire(import.meta.url)(process.env.PLAYWRIGHT || "playwright");
const BASE = process.env.BASE || "http://localhost:3283";
const SHOTS = process.env.SHOTS || "";
if (SHOTS) mkdirSync(SHOTS, { recursive: true });
let pass = 0, fail = 0;
const ok = (c, msg) => { if (c) { pass++; console.log("  ok  ", msg); } else { fail++; console.log("  FAIL", msg); } };

const FAKE = `
  window.__words = "";
  class FakeSR {
    start() {
      setTimeout(() => this.onstart && this.onstart(), 0);
      setTimeout(() => this.onaudiostart && this.onaudiostart(), 30);
      setTimeout(() => { const r = [{ transcript: window.__words }]; r.isFinal = true; this.onresult && this.onresult({ results: [r] }); }, 500);
    }
    stop() { setTimeout(() => this.onend && this.onend(), 20); }
    abort() { setTimeout(() => this.onend && this.onend(), 0); }
  }
  window.SpeechRecognition = FakeSR; window.webkitSpeechRecognition = FakeSR;
`;
const b = await chromium.launch({ args: ["--use-fake-device-for-media-stream", "--use-fake-ui-for-media-stream"] });
const PHONE = { viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true };
const DESK = { viewport: { width: 1280, height: 800 } };
const wire = (pg) => pg.evaluate(() => window.yuiWebDemo.wire("demo-penny").map((r) => r.body));

async function open(vp, theme, fake = true) {
  const context = await b.newContext({ deviceScaleFactor: 2, permissions: ["microphone"], ...vp });
  const pg = await context.newPage();
  pg.errs = [];
  pg.on("pageerror", (e) => pg.errs.push(e.message));
  await pg.addInitScript(fake ? FAKE : "delete window.SpeechRecognition; delete window.webkitSpeechRecognition;");
  await pg.goto(`${BASE}/web/agent/demo-penny?demo=penny&theme=${theme}`);
  await pg.waitForSelector("[data-testid=stage]");
  await pg.waitForTimeout(600);
  return pg;
}
// Hold the mic, say the words, let go. Nothing is typed.
async function say(pg, words) {
  await pg.evaluate((w) => { window.__words = w; }, words);
  const m = pg.getByTestId("stage-mic"), bx = await m.boundingBox();
  await pg.mouse.move(bx.x + bx.width / 2, bx.y + bx.height / 2);
  await pg.mouse.down();
  await pg.waitForSelector("[data-testid=stage-listening]");
  await pg.waitForFunction((w) => document.querySelector(".ys-heard")?.textContent.includes(w.split(" ")[0]), words, { timeout: 4000 });
  await pg.mouse.up();
  await pg.waitForSelector("[data-testid=stage-listening]", { state: "detached", timeout: 4000 });
  await pg.waitForTimeout(400);
}
const inView = (pg, loc) => loc.boundingBox().then((bx) => !!bx && bx.y >= 0 && bx.y + bx.height <= pg.viewportSize().height && bx.x >= 0 && bx.x + bx.width <= pg.viewportSize().width);

for (const theme of ["dark", "light"]) {
  for (const [name, vp] of [["390", PHONE], ["desktop", DESK]]) {
    const t = `${theme} ${name}`;
    const shot = async (pg, n) => { if (SHOTS) await pg.screenshot({ path: `${SHOTS}/web-voicefill-${n}-${name}-${theme}.png` }); };
    const pg = await open(vp, theme);

    // ---- ask for the intake: a plan opens on the stage ----
    await pg.getByTestId("stage-type").click();
    await pg.locator("[data-testid=stage-field] textarea").fill("client website intake");
    await pg.keyboard.press("Enter");
    await pg.waitForSelector("[data-testid=stage] .yl-plan", { timeout: 20000 });
    await pg.waitForTimeout(900);
    const sentBefore = (await wire(pg)).length;
    // ---- the bar beside Back and Next on a plan page ----
    const mic = pg.getByTestId("stage-mic"), typeBtn = pg.getByTestId("stage-type"), plus = pg.getByTestId("stage-attach");
    const back = pg.locator("[data-testid=stage] .yl-plan .bigbtns .bigbtn.s");
    ok(await mic.isVisible() && await typeBtn.isVisible() && await plus.isVisible(), `${t}: the mic, T and + are on a plan page`);
    ok(await back.isVisible() && await inView(pg, back) && await inView(pg, mic) && await inView(pg, typeBtn) && await inView(pg, plus), `${t}: Back and the bar are on the one screen`);
    await shot(pg, "page");

    // The page step first: Next goes on to the form.
    await pg.locator("[data-testid=stage] .yl-plan .bigbtns .bigbtn.p").click();
    await pg.waitForSelector("[data-testid=stage] .yl-plan .yl-form", { state: "visible" });
    await pg.waitForTimeout(300);
    ok(await pg.locator("[data-testid=stage] .yl-plan .yl-form [data-testid^=form-talk-]:visible").count() === 1, `${t}: the form keeps its own slim mic for a tap`);

    // ---- speak: each answer lands in its field, marked, nothing sent ----
    await say(pg, "business name is Acme Bakery what you do is we bake sourdough and pastries who it's for is people in the neighborhood");
    const val = (label) => pg.locator("[data-testid=stage] .yl-form .yl-field", { hasText: label }).locator("input, textarea").inputValue();
    ok(await val("Business name") === "Acme Bakery", `${t}: the business name was heard (${await val("Business name")})`);
    ok(await val("What you do") === "We bake sourdough and pastries", `${t}: what you do was heard (${await val("What you do")})`);
    ok(await val("Who it is for") === "People in the neighborhood", `${t}: who it is for was heard (${await val("Who it is for")})`);
    ok(await pg.locator("[data-testid=stage] .yl-heard").count() === 3, `${t}: each filled field carries a small mic`);
    ok(/Filled 3/.test(await pg.locator("[data-testid^=form-note-]").innerText()), `${t}: a line says three were filled, to check`);
    ok((await wire(pg)).length === sentBefore, `${t}: nothing was sent to the agent`);
    await shot(pg, "filled");

    // ---- fix by tapping: the mark goes ----
    await pg.locator("[data-testid=stage] .yl-form .yl-field", { hasText: "Who it is for" }).locator("input").fill("Neighbours");
    ok(await pg.locator("[data-testid=stage] .yl-heard").count() === 2, `${t}: editing a field takes its mark off`);

    // ---- words with no field name go to the first empty field ----
    await say(pg, "what you do is we bake bread");
    ok(await val("What you do") === "We bake bread", `${t}: a second round updates the named field`);
    ok(await pg.locator("[data-testid=stage] .yl-heard").count() === 2, `${t}: it stays marked, and the field fixed by hand stays clear`);

    // ---- Next: now it goes ----
    await pg.locator("[data-testid=stage] .yl-form button.bigbtn.full:visible").click();
    await pg.waitForSelector("[data-testid=stage] .yl-plan .chips.big .chip:visible");
    ok(true, `${t}: Next takes the filled page on to the choice`);
    ok(pg.errs.length === 0, `${t}: no page errors (${pg.errs.join("|").slice(0, 120)})`);
    await pg.context().close();
  }
}

// ---- words that fill nothing go to the agent, as before ----
{
  const pg = await open(PHONE, "light");
  const n = (await wire(pg)).length;
  await say(pg, "what is on my calendar");
  await pg.waitForFunction((k) => window.yuiWebDemo.wire("demo-penny").length > k, n, { timeout: 8000 });
  ok((await wire(pg)).at(-1) === "what is on my calendar", "no page up: the words go to the agent");
  await pg.context().close();
}

// ---- no speech recognition (Firefox): no mic on the bar, none on the form, no broken button ----
{
  const pg = await open(PHONE, "light", false);
  await pg.locator("[data-testid=stage-field] textarea").fill("client website intake");
  await pg.keyboard.press("Enter");
  await pg.waitForSelector("[data-testid=stage] .yl-plan", { timeout: 20000 });
  await pg.waitForTimeout(600);
  await pg.locator("[data-testid=stage] .yl-plan .bigbtns .bigbtn.p").click();
  await pg.waitForSelector("[data-testid=stage] .yl-plan .yl-form", { state: "visible" });
  ok(await pg.getByTestId("stage-mic").count() === 0, "no recognizer: no mic on the bar");
  ok(await pg.locator("[data-testid=stage] .yl-form [data-testid^=form-talk-]").count() === 0, "no recognizer: no mic on the form");
  ok(await pg.locator("[data-testid=stage] .yl-form input").first().isVisible(), "no recognizer: the fields are the way in");
  await pg.context().close();
}
console.log(`\n${pass} passed, ${fail} failed`);
await b.close();
process.exit(fail ? 1 : 0);
