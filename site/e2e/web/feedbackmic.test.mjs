// YUI-286 e2e: the feedback box in Settings gets the small field mic. Saying it appends to the box, nothing is sent until the
// person taps the mail button, and the mail then carries the spoken words. Keys stay without a mic. With no speech
// recognition there is no mic. The recognizer is a stand-in that says whatever window.__words holds.
//   npx next build && npx next start -p 3286 &   then   node e2e/web/feedbackmic.test.mjs
// BASE overrides the origin, PLAYWRIGHT the Playwright module, SHOTS the folder for the 390 px shots.
import { createRequire } from "node:module";
import { mkdirSync } from "node:fs";
const { chromium } = createRequire(import.meta.url)(process.env.PLAYWRIGHT || "playwright");
const BASE = process.env.BASE || "http://localhost:3286";
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
const PHONE = { width: 390, height: 844 }, DESK = { width: 1280, height: 800 };

async function open(vp, theme, fake = true) {
  const context = await b.newContext({ deviceScaleFactor: 2, permissions: ["microphone"], viewport: vp });
  const pg = await context.newPage();
  pg.errs = [];
  pg.on("pageerror", (e) => pg.errs.push(e.message));
  await pg.addInitScript(fake ? FAKE : "delete window.SpeechRecognition; delete window.webkitSpeechRecognition;");
  for (let tries = 0; ; tries++) {
    try { await pg.goto(`${BASE}/web/agent/demo-penny?demo=penny&theme=${theme}`); await pg.waitForSelector("[data-testid=stage-record]", { timeout: 20000 }); break; } catch (e) { if (tries) throw e; }
  }
  await pg.waitForTimeout(600);
  if (vp.width < 760 && !(await pg.locator(".wb-side.open").count())) {
    const stage = pg.locator(".wb-stage-menu:visible");
    await ((await stage.count()) ? stage : pg.locator(".wb-menu:visible")).first().click();
    await pg.waitForTimeout(450);
  }
  await pg.getByTestId("open-settings").click();
  await pg.getByTestId("settings").waitFor();
  await pg.locator('[data-section="help"]').scrollIntoViewIfNeeded();
  await pg.waitForTimeout(350);
  return pg;
}
async function say(pg, mic, words) {
  await pg.evaluate((w) => { window.__words = w; }, words);
  await mic.click();
  await pg.waitForTimeout(700);
  await mic.click();
  await pg.waitForTimeout(700);
}

for (const [vp, tag] of [[PHONE, "390"], [DESK, "desktop"]]) for (const theme of ["dark", "light"]) {
  const T = `${theme} ${tag}`;
  let pg = await open(vp, theme);
  const box = pg.getByTestId("feedback-text"), mic = pg.getByTestId("feedback-mic");
  ok(await mic.isVisible(), `${T}: the feedback box has a small mic`);
  const bm = await mic.boundingBox(), bb = await box.boundingBox();
  ok(bm.x >= 0 && bm.x + bm.width <= vp.width && bm.width >= 44 && bm.height >= 44 && Math.abs((bm.y + bm.height) - (bb.y + bb.height)) < 2, `${T}: the mic is 44 px, in view, beside the box`);
  ok((await box.inputValue()) === "", `${T}: the box starts empty`);
  await say(pg, mic, "The stage menu covers my timer");
  ok((await box.inputValue()) === "The stage menu covers my timer", `${T}: saying it fills the box`);
  const href0 = await pg.getByTestId("feedback-send").getAttribute("href");
  await say(pg, mic, "on my phone");
  ok((await box.inputValue()) === "The stage menu covers my timer on my phone", `${T}: a second go appends, nothing is lost (${await box.inputValue()})`);
  await pg.keyboard.type("");
  ok(await pg.getByTestId("feedback-send").isVisible(), `${T}: the Email us button is still there`);
  const href = await pg.getByTestId("feedback-send").getAttribute("href");
  ok(href !== href0 && href.startsWith("mailto:") && decodeURIComponent(href).includes("The stage menu covers my timer on my phone") && decodeURIComponent(href).includes("Yui on the web"), `${T}: Send still sends: the mail carries the spoken words and the build`);
  if (SHOTS) { await pg.getByTestId("feedback-text").scrollIntoViewIfNeeded(); await pg.screenshot({ path: `${SHOTS}/yui286-feedback-mic-${tag}-${theme}.png` }); }
  ok(!pg.errs.length, `${T}: no page errors (${pg.errs})`);
  // keys keep no mic
  ok((await pg.locator("[data-testid=settings] .gr-fieldmic").count()) === 1, `${T}: the feedback mic is the only mic in Settings (keys have none)`);
  await pg.context().close();

  pg = await open(vp, theme, false);
  ok((await pg.getByTestId("feedback-mic").count()) === 0 && await pg.getByTestId("feedback-text").isVisible(), `${T}: no speech recognition, no mic, the box stays`);
  await pg.context().close();
}
await b.close();
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
