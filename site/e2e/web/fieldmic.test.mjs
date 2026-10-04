// YUI-285 e2e: the small field mic on the other /web fields that name or find things (the web twin of the phone's naming and
// search mics): the agent name (Add agent, Edit agent), the chat rename and past-chats search in the drawer, and the quick
// actions palette. Saying it fills the field and nothing saves or searches on its own. SettingsKeys fields have no mic. With
// no speech recognition there is no mic anywhere. The recognizer is a stand-in that says whatever window.__words holds.
//   npx next build && npx next start -p 3285 &   then   node e2e/web/fieldmic.test.mjs
// BASE overrides the origin, PLAYWRIGHT the Playwright module, SHOTS the folder for the 390 px shots.
import { createRequire } from "node:module";
import { mkdirSync } from "node:fs";
const { chromium } = createRequire(import.meta.url)(process.env.PLAYWRIGHT || "playwright");
const BASE = process.env.BASE || "http://localhost:3285";
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
  for (let tries = 0; ; tries++) { // a busy box can stall the first paint: one more go
    try { await pg.goto(`${BASE}/web/agent/demo-penny?demo=penny&theme=${theme}`); await pg.waitForSelector("[data-testid=stage-record]", { timeout: 20000 }); break; } catch (e) { if (tries) throw e; }
  }
  await pg.waitForTimeout(600);
  return pg;
}
async function drawer(pg, vp) {
  if (vp.width < 760 && !(await pg.locator(".wb-side.open").count())) {
    const stage = pg.locator(".wb-stage-menu:visible");
    await ((await stage.count()) ? stage : pg.locator(".wb-menu:visible")).first().click();
    await pg.waitForTimeout(450);
  }
  await pg.getByTestId("drawer").waitFor();
}
async function switcher(pg, vp) {
  await drawer(pg, vp);
  await pg.getByTestId("agent-bar").click();
  await pg.getByTestId("agents-panel").waitFor();
}
async function palette(pg, vp) {
  if (vp.width < 760) { await drawer(pg, vp); await pg.getByTestId("quick-actions-btn").click(); } else await pg.keyboard.press("Control+k");
  await pg.getByTestId("palette").waitFor();
}
// Tap the mic, let the stand-in "hear" it, tap again: the words land.
async function say(pg, mic, words) {
  await pg.evaluate((w) => { window.__words = w; }, words);
  await mic.click();
  await pg.waitForTimeout(700);
  await mic.click();
  await pg.waitForTimeout(700);
}
const inView = async (pg, loc) => { const bx = await loc.boundingBox(); const v = pg.viewportSize(); return !!bx && bx.x >= 0 && bx.y >= 0 && bx.x + bx.width <= v.width && bx.y + bx.height <= v.height; };

for (const [vp, tag] of [[PHONE, "390"], [DESK, "desktop"]]) for (const theme of ["dark", "light"]) {
  const T = `${theme} ${tag}`;
  const shot = async (pg, n) => { if (SHOTS) await pg.screenshot({ path: `${SHOTS}/yui285-${n}-${tag}-${theme}.png` }); };

  // ---- Add agent: the name fills, nothing is made until Get a pairing code ----
  let pg = await open(vp, theme);
  await switcher(pg, vp);
  await pg.getByTestId("add-agent-btn").click();
  await pg.getByTestId("get-code").waitFor();
  const addMic = pg.getByTestId("agent-name-mic");
  ok(await addMic.isVisible() && await inView(pg, addMic), `${T}: Add agent has a small mic beside the name`);
  await say(pg, addMic, "name is Nova");
  ok(await pg.locator("#ag-name").inputValue() === "Nova", `${T}: the agent name filled by voice ("Nova")`);
  ok(await pg.getByTestId("get-code").isEnabled() && await pg.getByTestId("pairing").count() === 0, `${T}: nothing is made until the person taps Get a pairing code`);
  await shot(pg, "add-agent");
  ok(pg.errs.length === 0, `${T}: no page errors (${pg.errs.join("|").slice(0, 120)})`);
  await pg.context().close();

  // ---- Edit agent: the rename fills, not saved until Save ----
  pg = await open(vp, theme);
  await switcher(pg, vp);
  await pg.getByTestId("edit-demo-penny").click();
  await pg.getByTestId("edit-agent").waitFor();
  const editMic = pg.getByTestId("agent-rename-mic");
  ok(await editMic.isVisible(), `${T}: Edit agent has a small mic beside the name`);
  await say(pg, editMic, "Penelope");
  ok(await pg.getByTestId("rename").inputValue() === "Penelope", `${T}: the rename filled by voice ("Penelope")`);
  ok(await pg.evaluate(() => window.yuiWebDemo.host.roster().find((a) => a.id === "demo-penny").name) === "Penny", `${T}: and the agent is not renamed until Save`);
  await shot(pg, "edit-agent");
  await pg.context().close();

  // ---- the drawer: rename a chat and search past chats by voice ----
  pg = await open(vp, theme);
  await drawer(pg, vp);
  await pg.getByRole("button", { name: /^More for / }).first().click();
  await pg.getByRole("menuitem", { name: "Rename" }).click();
  const chatMic = pg.getByTestId("chat-rename-mic");
  await chatMic.waitFor({ timeout: 4000 }).catch(() => {});
  await pg.waitForTimeout(500);
  ok(await chatMic.isVisible(), `${T}: the chat rename has a small mic`);
  await say(pg, chatMic, "Quiet Sunday");
  ok(await pg.locator(".dc-rename input").inputValue() === "Quiet Sunday", `${T}: the chat rename filled by voice`);
  ok(await pg.locator(".dc-rename").count() === 1, `${T}: the rename is still open, tapping the mic did not close it`);
  await shot(pg, "chat-rename");
  await pg.keyboard.press("Enter");
  await pg.waitForTimeout(300);
  ok((await pg.locator(".dc-row .dc-top b").allInnerTexts()).includes("Quiet Sunday"), `${T}: Save keeps it, as today`);
  await pg.context().close();

  pg = await open(vp, theme);
  await pg.evaluate(async () => {
    const host = window.yuiWebDemo;
    for (let i = 0; i < 9; i++) { const id = `fm-c${i}`; await host.chats.insert({ id, agentId: "demo-penny" }); await host.chats.rename(id, i === 4 ? "Mortgage rates" : `Chat number ${i}`); }
  });
  // the chat list reads again when the open agent changes: go to Basil and back
  await switcher(pg, vp);
  await pg.getByTestId("agent-demo-basil").click();
  await pg.waitForTimeout(700);
  await switcher(pg, vp);
  await pg.getByTestId("agent-demo-penny").click();
  await pg.waitForTimeout(700);
  await drawer(pg, vp);
  const searchMic = pg.getByTestId("chat-search-mic");
  await searchMic.waitFor({ timeout: 4000 }).catch(() => {});
  ok(await searchMic.isVisible(), `${T}: the past-chats search has a small mic`);
  const before = await pg.locator(".dc-list .dc-row").count();
  await say(pg, searchMic, "mortgage");
  ok((await pg.getByLabel("Search chats").inputValue()).toLowerCase() === "mortgage", `${T}: the search filled by voice`);
  ok(await pg.locator(".dc-list .dc-row").count() === 1 && before > 1, `${T}: and it searched past chats (${before} down to 1)`);
  await shot(pg, "chat-search");
  await pg.context().close();

  // ---- the palette ----
  pg = await open(vp, theme);
  await palette(pg, vp);
  const palMic = pg.getByTestId("palette-mic");
  await palMic.waitFor({ timeout: 4000 }).catch(() => {});
  await pg.waitForTimeout(500);
  ok(await palMic.isVisible() && await inView(pg, palMic), `${T}: the palette has a small mic`);
  await say(pg, palMic, "grocer");
  ok((await pg.getByTestId("palette-input").inputValue()).toLowerCase() === "grocer", `${T}: the palette search filled by voice`);
  ok(await pg.locator("[data-testid^=pal-]").count() >= 1, `${T}: and it found results`);
  await shot(pg, "palette");
  ok(pg.errs.length === 0, `${T}: no page errors (${pg.errs.join("|").slice(0, 120)})`);
  await pg.context().close();
}

// ---- the key and secret fields have no mic on purpose (speech is on, the Keys card is open with the add form up) ----
{
  const pg = await open(PHONE, "light");
  await drawer(pg, PHONE);
  await pg.getByTestId("open-settings").click();
  await pg.getByTestId("settings").waitFor();
  await pg.locator('[data-section="keys"]').scrollIntoViewIfNeeded();
  await pg.getByTestId("key-add").click();
  await pg.getByTestId("vault-secret").waitFor();
  await pg.waitForTimeout(400);
  ok(await pg.getByTestId("vault-secret").isVisible() && await pg.getByTestId("vault-name").isVisible(), "keys: the add-a-key form is up");
  ok(await pg.locator('[data-section="keys"] [data-testid$="-mic"], [data-section="keys"] .gr-fieldmic').count() === 0, "keys: no mic on the key and secret fields");
  await pg.context().close();
}

// ---- no speech recognition (Firefox): no mic on any of them ----
{
  let pg = await open(PHONE, "light", false);
  await switcher(pg, PHONE);
  await pg.getByTestId("add-agent-btn").click();
  await pg.getByTestId("get-code").waitFor();
  await pg.waitForTimeout(400);
  ok(await pg.getByTestId("agent-name-mic").count() === 0 && await pg.locator("#ag-name").isVisible(), "no recognizer: no mic on the agent name, the field stays");
  await pg.context().close();
  pg = await open(PHONE, "light", false);
  await palette(pg, PHONE);
  await pg.waitForTimeout(400);
  ok(await pg.getByTestId("palette-mic").count() === 0 && await pg.getByTestId("palette-input").isVisible(), "no recognizer: no mic on the palette, the field stays");
  await pg.context().close();
}
console.log(`\n${pass} passed, ${fail} failed`);
await b.close();
process.exit(fail ? 1 : 0);
