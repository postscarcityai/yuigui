// YUI-256 e2e: voice on the web hears the mic and says so when it cannot. A real fake mic stream
// (Chrome's --use-fake-device-for-media-stream, looped noise bursts) drives the waveform; the recognizer is a stand-in
// (Chrome's real one needs Google's speech service, so CI cannot use it) that answers only once audio is open.
//   npx next build && npx next start -p 3256 &   then   node e2e/web/voice.test.mjs
// BASE overrides the origin, PLAYWRIGHT the Playwright module, SHOTS the folder for 390 px and desktop shots.
import { createRequire } from "node:module";
import { mkdirSync, writeFileSync } from "node:fs";
const { chromium } = createRequire(import.meta.url)(process.env.PLAYWRIGHT || "playwright");
const BASE = process.env.BASE || "http://localhost:3256";
const SHOTS = process.env.SHOTS || "";
if (SHOTS) mkdirSync(SHOTS, { recursive: true });
let pass = 0, fail = 0;
const ok = (c, msg) => { if (c) { pass++; console.log("  ok  ", msg); } else { fail++; console.log("  FAIL", msg); } };

// mode: "hears" says words once the mic is open, "mute" opens the mic and hears nothing, "closed" never opens it.
const recognizer = (mode) => `
  window.__sr = { made: 0, mode: ${JSON.stringify(mode)} };
  if (${mode === "closed"}) Object.defineProperty(navigator, "mediaDevices", { value: { getUserMedia: () => Promise.reject(new Error("no mic")) }, configurable: true });
  class FakeSR {
    constructor() { window.__sr.made++; }
    start() {
      setTimeout(() => this.onstart && this.onstart(), 0);
      if (window.__sr.mode === "closed") return;
      setTimeout(() => this.onaudiostart && this.onaudiostart(), 30);
      if (window.__sr.mode !== "hears") return;
      const say = (t, f) => { const r = [{ transcript: t }]; r.isFinal = f; this.onresult && this.onresult({ results: [r] }); };
      setTimeout(() => say("what is on", false), 700);
      setTimeout(() => say("what is on my calendar", true), 1300);
    }
    stop() { setTimeout(() => this.onend && this.onend(), 20); }
    abort() { setTimeout(() => this.onend && this.onend(), 0); }
  }
  window.SpeechRecognition = FakeSR; window.webkitSpeechRecognition = FakeSR;
`;

// Loud noise in a sentence-long burst then quiet for the fake mic to loop (a steady tone gets squashed by noise suppression,
// its default beeps are too short), 16-bit mono 16 kHz, 3 s.
const TONE = "/tmp/yui256-tone.wav";
{
  const rate = 16000, n = rate * 3, pcm = Buffer.alloc(n * 2), h = Buffer.alloc(44);
  for (let i = 0; i < n; i++) pcm.writeInt16LE(i < rate * 1.2 ? Math.round((Math.random() * 2 - 1) * 30000) : 0, i * 2);
  h.write("RIFF", 0); h.writeUInt32LE(36 + pcm.length, 4); h.write("WAVEfmt ", 8); h.writeUInt32LE(16, 16); h.writeUInt16LE(1, 20); h.writeUInt16LE(1, 22);
  h.writeUInt32LE(rate, 24); h.writeUInt32LE(rate * 2, 28); h.writeUInt16LE(2, 32); h.writeUInt16LE(16, 34); h.write("data", 36); h.writeUInt32LE(pcm.length, 40);
  writeFileSync(TONE, Buffer.concat([h, pcm]));
}
const b = await chromium.launch({ args: ["--use-fake-device-for-media-stream", "--use-fake-ui-for-media-stream", `--use-file-for-fake-audio-capture=${TONE}`] });
const PHONE = { viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true };
const DESK = { viewport: { width: 1280, height: 800 } };

async function open(vp, theme, mode, view) {
  const context = await b.newContext({ deviceScaleFactor: 2, permissions: ["microphone"], ...vp });
  const pg = await context.newPage();
  pg.errs = [];
  pg.on("pageerror", (e) => pg.errs.push(e.message));
  await pg.addInitScript(recognizer(mode));
  await pg.goto(`${BASE}/web/agent/demo-penny?demo=penny&theme=${theme}${view === "chat" ? "&view=chat" : ""}`);
  await pg.waitForSelector(view === "chat" ? ".wb-item" : "[data-testid=stage]");
  await pg.waitForTimeout(500);
  return pg;
}
const sent = (pg) => pg.evaluate(() => window.yuiWebDemo.wire("demo-penny").length);
const lastBody = (pg) => pg.evaluate(() => window.yuiWebDemo.wire("demo-penny").at(-1)?.body);
const wave = (pg) => pg.evaluate(() => [...document.querySelectorAll(".wc-wave i")].map((i) => parseFloat(i.style.height)));
const tapMic = async (pg, id) => { const m = pg.getByTestId(id); const bx = await m.boundingBox(); await pg.mouse.click(bx.x + bx.width / 2, bx.y + bx.height / 2); };

for (const [name, vp] of [["390", PHONE], ["desktop", DESK]]) for (const theme of ["light", "dark"]) {
  const tag = `${theme} ${name}`;
  const shot = async (pg, n) => { if (SHOTS) await pg.screenshot({ path: `${SHOTS}/web-voice-${n}-${name}-${theme}.png` }); };

  // ---- the stage: tap the mic, words show as they are said, the mic's own sound moves the wave, a pause sends ----
  let pg = await open(vp, theme, "hears", "stage");
  const n0 = await sent(pg);
  await tapMic(pg, "stage-mic");
  await pg.waitForSelector("[data-testid=stage-listening]");
  await pg.waitForFunction(() => document.querySelector(".ys-heard")?.textContent.includes("what is on"), null, { timeout: 4000 });
  ok(true, `${tag}: words show on the stage as they are said`);
  const bars = await wave(pg);
  ok(bars.length === 36 && Math.max(...bars) > 25, `${tag}: the wave moves from the mic's real sound (tallest bar ${Math.round(Math.max(...bars))}%)`);
  await shot(pg, "listening");
  await pg.waitForFunction((n) => window.yuiWebDemo.wire("demo-penny").length > n, n0, { timeout: 8000 });
  ok(await lastBody(pg) === "what is on my calendar", `${tag}: a pause sends what was said`);
  ok(pg.errs.length === 0, `${tag}: no page errors (${pg.errs.join("|").slice(0, 120)})`);
  await pg.context().close();

  // ---- the thread's field: hold to talk, let go to send ----
  pg = await open(vp, theme, "hears", "chat");
  const n1 = await sent(pg);
  const m = pg.getByTestId("mic"), mb = await m.boundingBox();
  await pg.mouse.move(mb.x + mb.width / 2, mb.y + mb.height / 2);
  await pg.mouse.down();
  await pg.waitForFunction(() => document.querySelector("[data-testid=voice-words]")?.textContent.includes("what is on my calendar"), null, { timeout: 4000 });
  ok(true, `${tag}: holding the mic shows the words`);
  await pg.mouse.up();
  await pg.waitForFunction((n) => window.yuiWebDemo.wire("demo-penny").length > n, n1, { timeout: 8000 });
  ok(await lastBody(pg) === "what is on my calendar", `${tag}: letting go sends them`);
  await pg.context().close();

  // ---- a recognizer that hears nothing from a live mic: say so, never a silent Listening ----
  pg = await open(vp, theme, "mute", "stage");
  await tapMic(pg, "stage-mic");
  await pg.waitForFunction(() => /no words came through/.test(document.querySelector("[data-testid=stage-hint]")?.textContent || ""), null, { timeout: 30000 });
  ok(true, `${tag}: a live mic with no words says so on the mic line`);
  await shot(pg, "deaf");
  ok(await pg.locator("[data-testid=stage-listening]").count() === 0, `${tag}: and the stage stops saying Listening`);
  await pg.context().close();

  // ---- a recognizer that never opens the mic: one fresh try, then say so ----
  pg = await open(vp, theme, "closed", "chat");
  await pg.getByTestId("mic").click();
  await pg.waitForSelector("[data-testid=voice-problem]", { timeout: 12000 });
  ok(/can't hear a mic/.test(await pg.getByTestId("voice-problem").innerText()), `${tag}: a recognizer that never opens the mic is named in the thread`);
  ok(await pg.evaluate(() => window.__sr.made) === 2, `${tag}: it was given one fresh recognizer first`);
  await pg.context().close();

  // ---- no recognizer at all (Firefox): plain words ----
  const ctx = await b.newContext({ ...vp });
  const nr = await ctx.newPage();
  await nr.addInitScript("delete window.SpeechRecognition; delete window.webkitSpeechRecognition;");
  await nr.goto(`${BASE}/web/agent/demo-penny?demo=penny&theme=${theme}`);
  await nr.waitForSelector("[data-testid=stage]");
  await nr.waitForTimeout(500);
  ok(await nr.getByTestId("stage-mic").count() === 0 && await nr.locator("[data-testid=stage-field] textarea").count() === 1, `${tag}: no recognizer: the field is the way in`);
  await ctx.close();
}
console.log(`\n${pass} passed, ${fail} failed`);
await b.close();
process.exit(fail ? 1 : 0);
