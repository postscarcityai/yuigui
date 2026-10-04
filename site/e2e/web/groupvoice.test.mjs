// YUI-284 e2e: a group thread on /web has the agent thread's bar (+, T and the mic), hold to talk sends to the group with
// @ intact, the group name fields fill by voice, and with no speech recognition there is no mic, no broken button. The
// recognizer is a stand-in that says whatever the page set in window.__words (Chrome's real one needs Google's speech service).
//   npx next build && npx next start -p 3284 &   then   node e2e/web/groupvoice.test.mjs
// BASE overrides the origin, PLAYWRIGHT the Playwright module, SHOTS the folder for the 390 px shots.
import { createRequire } from "node:module";
import { mkdirSync } from "node:fs";
const { chromium } = createRequire(import.meta.url)(process.env.PLAYWRIGHT || "playwright");
const BASE = process.env.BASE || "http://localhost:3284";
const SHOTS = process.env.SHOTS || "";
if (SHOTS) mkdirSync(SHOTS, { recursive: true });
let pass = 0, fail = 0;
const ok = (c, msg) => { if (c) { pass++; console.log("  ok  ", msg); } else { fail++; console.log("  FAIL", msg); } };
const SAMPLE = "demo-group-week";
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
const rowsOf = (pg) => pg.evaluate((t) => window.yuiWebGroups.rows({ thread: t }), SAMPLE);

async function open(vp, theme, fake = true, path = `/web/group/${SAMPLE}`, wait = "[data-testid=group-thread]") {
  const context = await b.newContext({ deviceScaleFactor: 2, permissions: ["microphone"], ...vp });
  const pg = await context.newPage();
  pg.errs = [];
  pg.on("pageerror", (e) => pg.errs.push(e.message));
  await pg.addInitScript(fake ? FAKE : "delete window.SpeechRecognition; delete window.webkitSpeechRecognition;");
  await pg.goto(`${BASE}${path}?demo=penny&theme=${theme}`);
  await pg.waitForSelector(wait);
  await pg.waitForTimeout(700);
  return pg;
}
// Hold the mic, say the words, let go.
async function say(pg, words) {
  await pg.evaluate((w) => { window.__words = w; }, words);
  const bx = await pg.getByTestId("group-mic").boundingBox();
  await pg.mouse.move(bx.x + bx.width / 2, bx.y + bx.height / 2);
  await pg.mouse.down();
  await pg.waitForSelector("[data-testid=group-listening]");
  await pg.waitForFunction((w) => document.querySelector("[data-testid=voice-words]")?.textContent.includes(w.split(" ")[0]), words, { timeout: 4000 });
  await pg.mouse.up();
  await pg.waitForSelector("[data-testid=group-listening]", { state: "detached", timeout: 4000 });
  await pg.waitForTimeout(500);
}
const inView = (pg, loc) => loc.boundingBox().then((bx) => !!bx && bx.y >= 0 && bx.y + bx.height <= pg.viewportSize().height && bx.x >= 0 && bx.x + bx.width <= pg.viewportSize().width);

for (const theme of ["dark", "light"]) {
  for (const [name, vp] of [["390", PHONE], ["desktop", DESK]]) {
    const t = `${theme} ${name}`;
    const shot = async (pg, n) => { if (SHOTS) await pg.screenshot({ path: `${SHOTS}/yui284-${n}-${name}-${theme}.png` }); };
    let pg = await open(vp, theme);

    // ---- the bar: +, T and the mic ----
    const mic = pg.getByTestId("group-mic"), typeBtn = pg.getByTestId("group-type"), plus = pg.getByTestId("group-attach");
    ok(await mic.isVisible() && await typeBtn.isVisible() && await plus.isVisible(), `${t}: the group bar has +, T and the mic`);
    ok(await inView(pg, mic) && await inView(pg, typeBtn) && await inView(pg, plus), `${t}: all three are on the one screen`);
    await shot(pg, "group-bar");

    // ---- hold to talk: the words land in the group, to the lead ----
    await say(pg, "what is on the plan for Thursday");
    let sent = (await rowsOf(pg)).filter((r) => r.sender === "user" && r.meta.group?.words === "what is on the plan for Thursday");
    ok(sent.length === 1, `${t}: a spoken message lands in the group (${sent.length})`);
    ok(sent.length === 1 && sent[0].agent_id === "demo-penny" && !sent[0].meta.group.to.length, `${t}: with no @ it goes to the lead`);
    ok(await pg.locator("[data-testid=group-you]", { hasText: "what is on the plan for Thursday" }).count() === 1, `${t}: and shows as a bubble`);

    // ---- an @ said aloud goes to that member ----
    await say(pg, "@basil what is for dinner");
    sent = (await rowsOf(pg)).filter((r) => r.sender === "user" && r.meta.group?.words === "@basil what is for dinner");
    ok(sent.length === 1 && JSON.stringify(sent[0].meta.group.to) === JSON.stringify(["demo-basil"]), `${t}: an @ in the words goes to that member (meta.group.to)`);

    // ---- T opens the field, @ suggestions intact ----
    await typeBtn.click();
    const field = pg.getByTestId("group-field");
    await field.fill("hello @b");
    ok(await pg.getByTestId("group-at-basil").isVisible(), `${t}: T opens the field and @ still suggests the members`);
    await field.fill("");
    ok(await pg.getByTestId("group-attach").isVisible() && await pg.getByTestId("group-mic").isVisible(), `${t}: the empty field keeps + and the mic (words turn it to Send)`);
    // ---- + picks a photo, it shows in the tray ----
    await pg.getByTestId("group-attach-input").setInputFiles({ name: "p.png", mimeType: "image/png", buffer: Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==", "base64") });
    await pg.waitForSelector("[data-testid=photo-thumb]", { timeout: 4000 });
    ok(await pg.getByTestId("group-send").isVisible(), `${t}: + attaches a photo, Send is ready`);
    await pg.getByTestId("group-send").click();
    await pg.waitForTimeout(600);
    const withPhoto = (await rowsOf(pg)).filter((r) => r.sender === "user" && Array.isArray(r.meta.photos) && r.meta.photos.length === 1);
    ok(withPhoto.length === 1, `${t}: the photo went to the group (meta.photos)`);
    ok(pg.errs.length === 0, `${t}: no page errors (${pg.errs.join("|").slice(0, 120)})`);
    await pg.context().close();

    // ---- the group name fields fill by voice ----
    pg = await open(vp, theme);
    await pg.getByTestId("group-settings-open").click();
    await pg.getByTestId("group-settings").waitFor();
    const nameMic = pg.getByTestId("group-settings-name-mic");
    await nameMic.waitFor({ timeout: 3000 }).catch(() => {});
    ok(await nameMic.isVisible(), `${t}: the group name has a small mic`);
    await pg.evaluate(() => { window.__words = "name is Dinner club"; });
    await nameMic.click();
    await pg.waitForTimeout(700);
    await nameMic.click();
    await pg.waitForFunction(() => document.querySelector("[data-testid=group-settings-name]").value === "Dinner club", null, { timeout: 4000 });
    ok(true, `${t}: the group name filled by voice ("Dinner club")`);
    await shot(pg, "group-name");
    await pg.context().close();
  }
}

// ---- no speech recognition (Firefox): no mic anywhere, the field is the way in ----
{
  const pg = await open(PHONE, "light", false);
  ok(await pg.getByTestId("group-mic").count() === 0 && await pg.getByTestId("group-type").count() === 0, "no recognizer: no mic and no T on the group bar");
  ok(await pg.getByTestId("group-field").isVisible() && await pg.getByTestId("group-attach").isVisible(), "no recognizer: the field and + are there");
  await pg.getByTestId("group-settings-open").click();
  await pg.getByTestId("group-settings").waitFor();
  await pg.waitForTimeout(500);
  ok(await pg.getByTestId("group-settings-name-mic").count() === 0, "no recognizer: no mic on the group name");
  await pg.context().close();
}
console.log(`\n${pass} passed, ${fail} failed`);
await b.close();
process.exit(fail ? 1 : 0);
