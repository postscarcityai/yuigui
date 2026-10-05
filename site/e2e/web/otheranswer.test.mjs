// YUI-290 e2e: the "Type your own" box on a `choose +other` and a `pick +other` carries the field mic, in the chat and on the
// stage. Saying it appends words to the field, and Send carries them in the line the app sends. The recognizer is a stand-in
// that says whatever window.__words holds. A form's text field gets the mic too.
//   npx next build && npx next start -p 3290 &   then   node e2e/web/otheranswer.test.mjs
// BASE overrides the origin, PLAYWRIGHT the Playwright module, SHOTS the folder for the shots.
import { createRequire } from "node:module";
import { mkdirSync } from "node:fs";
const { chromium } = createRequire(import.meta.url)(process.env.PLAYWRIGHT || "playwright");
const BASE = process.env.BASE || "http://localhost:3290";
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
const AGENT = "demo-penny";

async function open(vp, theme, view, fake = true) {
  const context = await b.newContext({ deviceScaleFactor: 2, permissions: ["microphone"], viewport: vp });
  const pg = await context.newPage();
  pg.errs = [];
  pg.on("pageerror", (e) => pg.errs.push(e.message));
  await pg.addInitScript(fake ? FAKE : "delete window.SpeechRecognition; delete window.webkitSpeechRecognition;");
  for (let tries = 0; ; tries++) {
    try { await pg.goto(`${BASE}/web/agent/${AGENT}?demo=penny&theme=${theme}&view=${view}`); await pg.waitForSelector(".wb-thread[data-loaded='1'], [data-testid=stage-record]", { timeout: 60000 }); break; } catch (e) { if (tries) throw e; }
  }
  await pg.waitForTimeout(600);
  return pg;
}
async function draw(pg, yl) {
  await pg.evaluate(([a, y]) => window.yuiWebDemo.say(a, y, {}), [AGENT, yl]);
  await pg.waitForTimeout(900);
}
// Tap the mic, let the stand-in "hear" it, stop if it is still listening: the words land in the field.
async function hear(pg, mic, field, words) {
  const was = await field.inputValue();
  await pg.evaluate((w) => { window.__words = w; }, words);
  await mic.click();
  await pg.waitForTimeout(700);
  if ((await mic.getAttribute("aria-pressed")) === "true") await mic.click();
  await pg.waitForFunction(([sel, v]) => [...document.querySelectorAll(sel)].at(-1)?.value !== v, ["textarea[aria-label='Type your own']", was], { timeout: 4000 }).catch(() => {});
  await pg.waitForTimeout(300);
}

for (const [vp, tag] of [[PHONE, "390"], [DESK, "1280"]]) for (const theme of ["dark", "light"]) for (const view of ["chat", "stage"]) {
  const T = `${theme} ${tag} ${view}`;
  const shot = async (pg, n) => { if (SHOTS) await pg.screenshot({ path: `${SHOTS}/yui290-${n}-${view}-${tag}-${theme}.png` }); };
  const pg = await open(vp, theme, view);
  const scope = view === "chat" ? pg.locator(".wb-thread") : pg.getByTestId("stage");
  const base = (await pg.evaluate((a) => window.yuiWebDemo.wire(a), AGENT)).length;

  // ---- choose +other ----
  await draw(pg, `choose@meal "What for dinner?" Pasta|Tacos +other`);
  await scope.getByRole("button", { name: "Type your own" }).last().click();
  const field = scope.getByLabel("Type your own").last();
  await field.waitFor({ timeout: 4000 });
  const mic = scope.getByTestId("other-mic").last();
  await mic.waitFor({ timeout: 4000 }).catch(() => {});
  ok(await mic.isVisible(), `${T}: the "Your answer" field has a mic`);
  await field.fill("Ramen");
  await hear(pg, mic, field, "with extra egg");
  ok((await field.inputValue()) === "Ramen with extra egg", `${T}: words append to what was typed (${await field.inputValue()})`);
  await shot(pg, "choose");
  await scope.locator("form.yl-otherin button.chip.on").last().click();
  await pg.waitForTimeout(800);
  const sent = await pg.evaluate((a) => window.yuiWebDemo.wire(a), AGENT);
  ok(sent.length === base + 1 && /Ramen with extra egg/.test(JSON.stringify(sent.at(-1))), `${T}: Send carries the spoken words (${JSON.stringify(sent.at(-1)).slice(0, 90)})`);

  // ---- pick +other, empty field, words only ----
  await pg.waitForTimeout(1500); // the echo of the send settles first, a redraw would reset a half typed field
  await draw(pg, `pick@sides "Which sides?" Salad|Fries +other`);
  await scope.getByRole("button", { name: "Type your own" }).last().click();
  const f2 = scope.getByLabel("Type your own").last();
  await f2.waitFor({ timeout: 4000 });
  // the mic mounts a beat after its field: wait for one per field, or last() is still the answered form's
  await pg.waitForFunction(() => document.querySelectorAll("[data-testid=other-mic]").length === document.querySelectorAll("textarea[aria-label='Type your own']").length, null, { timeout: 4000 });
  await hear(pg, scope.getByTestId("other-mic").last(), f2, "Kimchi");
  if ((await f2.inputValue()) !== "Kimchi") console.log("   dbg", T, JSON.stringify(await pg.evaluate(() => [...document.querySelectorAll("textarea[aria-label='Type your own']")].map((t) => t.value))), await scope.getByTestId("other-mic").count(), await scope.getByTestId("other-mic").evaluateAll((a) => a.map((x) => x.getAttribute("aria-pressed"))));
  ok((await f2.inputValue()) === "Kimchi", `${T}: pick +other fills by voice too (${await f2.inputValue()})`);
  ok(pg.errs.length === 0, `${T}: no page errors (${pg.errs.join("|").slice(0, 120)})`);
  await pg.context().close();
}

// ---- no speech recognition: no mic, the field stays ----
{
  const pg = await open(PHONE, "dark", "chat", false);
  await draw(pg, `choose@meal "What for dinner?" Pasta|Tacos +other`);
  await pg.locator(".wb-thread").getByRole("button", { name: "Type your own" }).last().click();
  await pg.getByLabel("Type your own").last().waitFor();
  ok(await pg.getByTestId("other-mic").count() === 0, "no speech recognition: no mic, the field stays");
  await pg.context().close();
}
await b.close();
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
