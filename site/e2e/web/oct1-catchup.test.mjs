// YUI-268 e2e: /web catches up to the app's Oct 1 fixes.
//   YUI-251 the trash sits flush left on the stage bar, mirroring the mic's side
//   YUI-252 Tune goes straight to the Tuner, Gouda's last screen
//   YUI-254 / YUI-260 a long chat draws its newest rows and brings older ones in batches as you scroll back
//   YUI-262 a push click (?m=<id>) lands on the reply it names, full screen
//   npx next build && npx next start -p 3257 &   then   node e2e/web/oct1-catchup.test.mjs
import { createRequire } from "node:module";
import { mkdirSync } from "node:fs";
const { chromium } = createRequire(import.meta.url)(process.env.PLAYWRIGHT || "playwright");
const BASE = process.env.BASE || "http://localhost:3257";
const SHOTS = process.env.SHOTS || "";
if (SHOTS) mkdirSync(SHOTS, { recursive: true });
let pass = 0, fail = 0;
const ok = (c, msg) => { if (c) { pass++; console.log("  ok  ", msg); } else { fail++; console.log("  FAIL", msg); } };

const recognizer = `
  class FakeSR {
    start() { setTimeout(() => this.onstart && this.onstart(), 0); setTimeout(() => this.onaudiostart && this.onaudiostart(), 30); }
    stop() { setTimeout(() => this.onend && this.onend(), 20); }
    abort() { setTimeout(() => this.onend && this.onend(), 0); }
  }
  window.SpeechRecognition = FakeSR; window.webkitSpeechRecognition = FakeSR;
`;
const b = await chromium.launch({ args: ["--use-fake-device-for-media-stream", "--use-fake-ui-for-media-stream"] });
const PHONE = { viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true };

async function open(theme, path, ready) {
  const context = await b.newContext({ deviceScaleFactor: 2, permissions: ["microphone"], ...PHONE });
  const pg = await context.newPage();
  pg.errs = [];
  pg.on("pageerror", (e) => pg.errs.push(e.message));
  await pg.addInitScript(recognizer);
  await pg.goto(`${BASE}${path}${path.includes("?") ? "&" : "?"}theme=${theme}`);
  await pg.waitForSelector(ready);
  await pg.waitForTimeout(500);
  return pg;
}

for (const theme of ["dark", "light"]) {
  const shot = async (pg, n) => { if (SHOTS) await pg.screenshot({ path: `${SHOTS}/web-oct1-${n}-390-${theme}.png`, timeout: 120000 }); };

  // ---- YUI-251: listening, the trash is the left-most control of the bar and the mic stays centred ----
  let pg = await open(theme, "/web/agent/demo-penny?demo=penny", "[data-testid=stage]");
  const mic = pg.getByTestId("stage-mic"), mb = await mic.boundingBox();
  await pg.mouse.click(mb.x + mb.width / 2, mb.y + mb.height / 2);
  await pg.waitForSelector("[data-testid=stage-trash]");
  const tb = await pg.getByTestId("stage-trash").boundingBox();
  const mb2 = await pg.getByTestId("stage-mic").boundingBox();
  ok(tb.x < 40 && tb.x + tb.width < mb2.x, `${theme}: the trash sits flush left (x=${Math.round(tb.x)}), the mic stays right of it`);
  ok(mb2.x + mb2.width > 330, `${theme}: the mic mirrors it on the right (right edge ${Math.round(mb2.x + mb2.width)} of 390)`);
  await shot(pg, "trash");
  await pg.getByTestId("stage-trash").click();
  await pg.waitForFunction(() => !document.querySelector("[data-testid=stage-trash]"));
  ok(true, `${theme}: the trash throws the words away and the bar returns`);
  ok(pg.errs.length === 0, `${theme}: no page errors on the stage (${pg.errs.join("|").slice(0, 120)})`);
  await pg.context().close();

  // ---- YUI-252: Tune up lands on the Tuner, with no message sent ----
  pg = await open(theme, "/web/agent/demo-gouda?demo=gouda", "[data-testid=stage]");
  const pill = () => pg.evaluate(() => document.querySelector(".wb-pill.on")?.textContent || "");
  await pg.waitForTimeout(2500);
  ok(await pill() === "Home", `${theme}: Gouda opens on the home, not on its newest screen (${await pill()})`);
  const sent0 = await pg.evaluate(() => window.yuiWebDemo.wire("demo-gouda").length);
  await pg.getByTestId("stage-menu").click();
  await pg.waitForTimeout(600);
  await pg.getByTestId("shortcut-tune").click();
  await pg.waitForFunction(() => document.querySelector(".wb-pill.on")?.textContent !== "Home", null, { timeout: 8000 });
  await pg.waitForTimeout(1500);
  const body = await pg.locator("[data-testid=stage]").innerText();
  ok(await pill() !== "Home" && /Tap Start, then play a string/.test(body), `${theme}: Tune up opens the Tuner, Gouda's last screen (${await pill()})`);
  ok(await pg.evaluate(() => window.yuiWebDemo.wire("demo-gouda").length) === sent0, `${theme}: Tune up sends no message`);
  await shot(pg, "tune");
  ok(pg.errs.length === 0, `${theme}: no page errors on Tune (${pg.errs.join("|").slice(0, 120)})`);
  await pg.context().close();

  // ---- YUI-254 / YUI-260: a long chat draws its newest rows, older ones come in as you scroll back ----
  pg = await open(theme, "/web/agent/demo-penny?demo=penny&view=chat&demohistory=400", ".wb-item");
  const drawn = () => pg.locator(".wb-item").count();
  const first = await drawn();
  ok(first <= 70, `${theme}: a long chat opens on its newest rows, not the whole thread (${first} drawn)`);
  await shot(pg, "long");
  const sc = pg.locator(".wb-scroll, .wb-thread-scroll, [data-testid=thread-scroll]").first();
  const scrollSel = await pg.evaluate(() => { const m = document.querySelector(".wb-messages"); let e = m; while (e && e.scrollHeight <= e.clientHeight + 1) e = e.parentElement; return e ? (e.className || e.tagName) : ""; });
  for (let i = 0; i < 12; i++) {
    await pg.evaluate(() => { const m = document.querySelector(".wb-messages"); let e = m; while (e && e.scrollHeight <= e.clientHeight + 1) e = e.parentElement; if (e) e.scrollTop = 0; });
    await pg.mouse.wheel(0, -400);
    await pg.waitForTimeout(250);
  }
  const later = await drawn();
  ok(later > first, `${theme}: scrolling back brings older rows in (${first} then ${later})`);
  ok(later < 420, `${theme}: and in batches, not everything at once (${later} of 400+)`);
  ok(scrollSel !== "", `${theme}: the thread scrolls (${String(scrollSel).slice(0, 40)})`);
  void sc;
  await pg.context().close();

  // ---- YUI-262: a push click lands on the reply it names, full screen ----
  pg = await open(theme, "/web/agent/demo-penny?demo=penny&demoarrive=Heads%20up%20from%20Penny&arriveafter=1&m=arrive-1", "[data-testid=stage]");
  await pg.waitForFunction(() => /Heads up from Penny/.test(document.querySelector("[data-testid=stage]")?.innerText || ""), null, { timeout: 30000 });
  ok(true, `${theme}: a push click comes up on the reply it names`);
  ok(!/[?&]m=/.test(pg.url()), `${theme}: the message id is taken off the address after landing`);
  await shot(pg, "push");
  ok(pg.errs.length === 0, `${theme}: no page errors on the push landing (${pg.errs.join("|").slice(0, 120)})`);
  await pg.context().close();
}
console.log(`\n${pass} passed, ${fail} failed`);
await b.close();
process.exit(fail ? 1 : 0);
