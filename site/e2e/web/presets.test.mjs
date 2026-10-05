// YUI-246 e2e: every preset live on the web, on the demo relay (no sign in, no network).
//   npx next start -p 3246 &   then   node e2e/web/presets.test.mjs
// BASE overrides the origin, PLAYWRIGHT the Playwright module, SHOTS the folder for 390 px and desktop shots.
// Part 1 checks the live behaviors this story built (shelf, reminders, timers, the workout runner, music takes, MIDI);
// part 2 walks every sample in /library.json: it renders, a tap goes up, and the line sent is the app's wire format
// (mcp-app/src/events.mjs `eventLine`, the same function the phone's YLEvent.line is checked against).
import { createRequire } from "node:module";
import { mkdirSync } from "node:fs";
import { eventLine } from "../../../mcp-app/src/events.mjs";
const { chromium } = createRequire(import.meta.url)(process.env.PLAYWRIGHT || "playwright");
const BASE = process.env.BASE || "http://localhost:3246";
const SHOTS = process.env.SHOTS || "";
const ONLY = process.env.LIBRARY_ONLY || ""; // "1" skips part 1, "0" skips part 2
if (SHOTS) mkdirSync(SHOTS, { recursive: true });
const b = await chromium.launch({ args: ["--autoplay-policy=no-user-gesture-required", "--use-fake-ui-for-media-stream", "--use-fake-device-for-media-stream"] });
let pass = 0, fail = 0;
const ok = (c, msg) => { if (c) { pass++; console.log("  ok  ", msg); } else { fail++; console.log("  FAIL", msg); } };
const AGENT = "demo-penny";

// What a tab on a phone or a laptop has that headless Chromium does not: a granted Notification, a Wake Lock, a MIDI keyboard.
const STUBS = () => {
  window.__notes = [];
  class N { constructor(t, o) { window.__notes.push({ title: t, body: o?.body }); this.close = () => {}; } }
  N.permission = "granted"; N.requestPermission = async () => "granted";
  window.Notification = N;
  window.__locks = 0;
  Object.defineProperty(navigator, "wakeLock", { configurable: true, value: { request: async () => { window.__locks++; return { released: false, release: async () => {} }; } } });
  const input = { name: "Test Keystation 49", state: "connected", onmidimessage: null };
  window.__midi = (bytes) => input.onmidimessage?.({ data: Uint8Array.from(bytes) });
  navigator.requestMIDIAccess = async () => ({ inputs: new Map([["in1", input]]), onstatechange: null });
};

async function open(vp, theme, touch = {}, view = "chat") {
  const ctx = await b.newContext({ viewport: vp, deviceScaleFactor: 2, permissions: ["camera", "microphone"], ...touch });
  await ctx.addInitScript(STUBS);
  const pg = await ctx.newPage();
  pg.errs = [];
  pg.on("pageerror", (e) => pg.errs.push(e.message));
  await pg.goto(`${BASE}/web/agent/${AGENT}?demo=penny&theme=${theme}&view=${view}`);
  await pg.waitForSelector(".wb-thread[data-loaded='1']");
  await pg.waitForTimeout(500);
  return pg;
}
const items = (pg) => pg.locator(".wb-item").count();
// The agent writes a reply; resolves when the thread has drawn one more row.
async function say(pg, yl, meta) {
  // The thread draws its newest 60 rows (YUI-260), so past that the count stops growing: watch the newest row instead.
  const tail = () => pg.evaluate(() => { const e = document.querySelectorAll(".wb-item"); return `${e.length}:${e[e.length - 1]?.innerHTML.length || 0}:${e[e.length - 1]?.innerText.slice(-40) || ""}`; });
  const n = await tail();
  await pg.evaluate(([y, m]) => window.yuiWebDemo.say("demo-penny", y, m || {}), [yl, meta]);
  await pg.waitForFunction((k) => { const e = document.querySelectorAll(".wb-item"); return `${e.length}:${e[e.length - 1]?.innerHTML.length || 0}:${e[e.length - 1]?.innerText.slice(-40) || ""}` !== k; }, n, { timeout: 15000 });
  await pg.waitForTimeout(300);
}
const wire = (pg) => pg.evaluate(() => window.yuiWebDemo.wire("demo-penny"));
// A tap inside the thread's stage window: the stage bar sticks over a button the page scrolled to the top, so put it mid-screen first.
async function tapIn(loc) { await loc.evaluate((el) => el.scrollIntoView({ block: "center" })); await loc.click(); }

// The plan plays on the stage (or in the thread's window); step to the first move.
async function openRunner(pg) {
  const there = () => pg.locator("[data-testid=runner-e1]").first().isVisible().catch(() => false);
  if (!(await pg.locator(".yl-plan").first().isVisible().catch(() => false))) {
    await pg.locator("[data-testid=play-on-stage]").last().click().catch(() => {});
    await pg.waitForTimeout(900);
  }
  for (let i = 0; i < 8 && !(await there()); i++) {
    const nx = pg.locator(".yl-plan .bigbtn.p").first();
    if (await nx.isVisible().catch(() => false)) await nx.click().catch(() => {});
    else await pg.keyboard.press("ArrowRight");
    await pg.waitForTimeout(500);
  }
}
const stagePlaying = (pg) => pg.locator(".wb-stage").first().isVisible().catch(() => false);

const VIEWS = [["390", { width: 390, height: 844 }, { hasTouch: true, isMobile: true }], ["desktop", { width: 1280, height: 800 }, {}]];

if (ONLY !== "1") {
  // SKIP_BEHAVIORS=1 skips the shelf, reminders, timer and runner checks (the slow ones) when a re-run only wants the rest
  for (const theme of process.env.SKIP_BEHAVIORS ? [] : ["light", "dark"]) {
    for (const [name, vp, touch] of VIEWS) {
      const t = `${theme} ${name}`;
      const pg = await open(vp, theme, touch);

      // ---------- the shelf: save, tap to reopen, hold to remove, stays removed ----------
      const base0 = (await wire(pg)).length; // the recorded thread already holds rows the person sent
      await say(pg, `choose@colors "Which color?" Red|Blue\nsave colors`);
      ok(await pg.locator("[data-testid=shelf-colors]").count() === 1, `${t}: a save puts a chip on the shelf`);
      const chip = await pg.locator("[data-testid=shelf-colors]").boundingBox();
      ok(chip.height >= 44, `${t}: the chip is a 44 px target (${Math.round(chip.height)})`);
      await pg.locator("[data-testid=shelf-colors]").click();
      await pg.waitForTimeout(900);
      ok(await pg.getByText("Which color?").last().isVisible(), `${t}: a tap on the chip reopens the screen on the stage with no turn`);
      ok((await wire(pg)).length === base0, `${t}: and sends nothing`);
      await pg.locator("[data-testid=stage-record]").click();
      await pg.waitForTimeout(500);
      await pg.locator("[data-testid=shelf-colors]").click({ button: "right" });
      ok(await pg.locator("[data-testid=shelf-remove-colors]").count() === 1, `${t}: a right click (or a long press) offers Remove`);
      await pg.locator("[data-testid=shelf-remove-colors]").click();
      ok(await pg.locator("[data-testid=shelf-colors]").count() === 0, `${t}: Remove takes it off the shelf`);
      await pg.reload();
      await pg.waitForSelector(".wb-thread[data-loaded='1']");
      await pg.waitForTimeout(500);
      ok(await pg.locator("[data-testid=shelf-colors]").count() === 0, `${t}: and it stays off after a reload`);
      await say(pg, `choose@colors "Which color now?" Red|Blue\nsave colors`);
      ok(await pg.locator("[data-testid=shelf-colors]").count() === 1, `${t}: a save written after it was removed brings it back`);
      if (SHOTS) await pg.screenshot({ path: `${SHOTS}/web-shelf-${name}-${theme}.png` });

      // ---------- reminders: the Notifications API at the time, while the tab is open ----------
      const when = new Date(Date.now() + 6000);
      const p2 = (n) => String(n).padStart(2, "0");
      const at = `${when.getFullYear()}-${p2(when.getMonth() + 1)}-${p2(when.getDate())}T${p2(when.getHours())}:${p2(when.getMinutes())}`;
      await say(pg, `say "I will remind you."`, { native: { reminders: [{ key: "dentist", text: "Call the dentist, 9:00 am", at }] } });
      await pg.waitForFunction(() => window.__notes.length > 0, null, { timeout: 70000 }).catch(() => {});
      const notes = await pg.evaluate(() => window.__notes);
      ok(notes.length === 1 && notes[0].title === "Penny" && /dentist/.test(notes[0].body), `${t}: a reminder goes off at its time with the agent's name (${JSON.stringify(notes[0] || null)})`);

      // ---------- a timer keeps true time with the tab away, shows the time in the title, keeps the screen on ----------
      await say(pg, `timer 20s rounds=2 rest=5 "Plank" +sound`);
      await pg.waitForSelector(".yl-stage.open .yl-timer");
      const timer = pg.locator(".yl-stage.open .yl-timer").last();
      await pg.clock.install();
      await timer.getByRole("button", { name: "Start" }).click();
      await pg.clock.runFor(1000);
      ok(/^\d:\d\d · 1\/2 · /.test(await pg.title()), `${t}: the tab title carries the time left and the round (${await pg.title()})`);
      ok(await pg.evaluate(() => window.__locks) >= 1, `${t}: the screen is kept on while it runs`);
      await pg.clock.fastForward(26000); // a background tab that was away 26 s: 20 work + 5 rest, then 1 s into round 2
      await pg.waitForTimeout(300);
      ok(/Round 2 of 2/.test(await timer.innerText()), `${t}: back from 26 s away it is in round 2, where the clock says`);
      await pg.clock.fastForward(60000);
      await pg.waitForTimeout(500);
      ok(!(await pg.title()).match(/^\d:\d\d/), `${t}: the title goes back when it stops (${await pg.title()})`);
      ok((await wire(pg)).slice(base0).some((r) => /\[yui\] \S+ timer done rounds=2/.test(r.body)), `${t}: a long absence ends it and done goes up as the phone's event (${(await wire(pg)).slice(base0).map((r) => r.body).join(" ; ")})`);
      if (SHOTS) await pg.screenshot({ path: `${SHOTS}/web-timer-${name}-${theme}.png` });
      await pg.getByRole("button", { name: "Close full screen" }).first().click({ timeout: 2000 }).catch(() => {});
      await pg.waitForTimeout(400);

      // ---------- Arnold's runner: sets, rest on the clock, reps and weight, the plan as one line ----------
      const { FLOWS } = await import("../../lib/yl/samples.mjs");
      const runner = FLOWS.find((s) => s.slug === "arnold-runner").yl;
      await say(pg, runner);
      await openRunner(pg);
      ok(await pg.locator("[data-testid=runner-e1]").first().isVisible().catch(() => false), `${t}: a plan of sets runs as a workout, one move on a page`);
      if (await pg.locator("[data-testid=runner-e1]").first().isVisible().catch(() => false)) {
        ok(await pg.locator("[data-testid=runner-e1-reps-value]").innerText() === "10" && /20 lb/.test(await pg.locator("[data-testid=runner-e1-lb-value]").innerText()), `${t}: reps and weight show as drawn`);
        await pg.locator("[data-testid=runner-e1-lb-plus]").click();
        ok(/25 lb/.test(await pg.locator("[data-testid=runner-e1-lb-value]").innerText()), `${t}: + nudges the weight by its step`);
        await pg.locator("[data-testid=runner-e1-set-1]").click();
        ok(await pg.locator("[data-testid=runner-e1-log-title]").innerText() === "Set 1 of 3 done", `${t}: a set tapped asks what was done`);
        await pg.locator("[data-testid=runner-e1-log-done]").click();
        ok(await pg.locator("[data-testid=runner-e1-rest]").count() === 1, `${t}: logging a set starts the rest`);
        ok(/^\d:\d\d$/.test((await pg.locator("[data-testid=runner-e1-rest] b").innerText()).trim()), `${t}: the rest counts down`);
        await pg.locator("[data-testid=runner-e1-rest-more]").click();
        await pg.locator("[data-testid=runner-e1-set-2]").click();
        await pg.locator("[data-testid=runner-e1-log-done]").click();
        await pg.locator("[data-testid=runner-e1-rest-skip]").click();
        ok(await pg.locator("[data-testid=runner-e1-rest]").count() === 0, `${t}: Skip rest puts it away`);
        const tickedBtn = await pg.locator("[data-testid=runner-e1-set-1]").getAttribute("aria-pressed");
        ok(tickedBtn === "true", `${t}: the ticked set stays ticked`);
        if (SHOTS) await pg.screenshot({ path: `${SHOTS}/web-runner-${name}-${theme}.png` });
        // reload: the place is kept on the device
        await pg.reload();
        await pg.waitForSelector(".wb-thread[data-loaded='1']");
        await pg.waitForTimeout(600);
        // the demo's thread starts over on a reload, so the agent sends the same plan again; the place is the device's
        await say(pg, runner);
        await openRunner(pg);
        ok(await pg.locator("[data-testid=runner-e1-set-1]").getAttribute("aria-pressed").catch(() => null) === "true", `${t}: a reload comes back to the same set`);
        // walk the rest of the plan: Next past the moves, the last question, and the whole session goes as one line
        const wBefore = (await wire(pg)).length;
        for (let i = 0; i < 8; i++) {
          const nx = pg.locator(".yl-plan .bigbtn.p").filter({ hasText: /^Next$/ }).first();
          if (!(await nx.isVisible().catch(() => false))) break;
          await nx.click();
          await pg.waitForTimeout(300);
        }
        await pg.getByRole("button", { name: "Easy" }).last().click();
        await pg.waitForTimeout(900);
        await pg.getByRole("button", { name: "Finish workout" }).last().click(); // the review, then the one Send
        await pg.waitForTimeout(900);
        const plan = (await wire(pg)).slice(wBefore).find((r) => r.kind === "event" && r.meta?.preset === "plan");
        ok(!!plan && plan.body === eventLine({ id: plan.meta.id, preset: "plan", ...plan.meta.value }), `${t}: the session goes up as the plan's one line in the app's wire format`);
        ok(!!plan && /plan\.e1-sets="Set 1"\|"Set 2"/.test(plan.body) && /plan\.e1-lb=25/.test(plan.body) && /plan\.e1-reps=10/.test(plan.body) && /plan\.feel=Easy/.test(plan.body), `${t}: carrying the ticked sets, the nudged weight and how it felt (${plan ? plan.body.slice(0, 120) : "none"})`);
      }

      ok(pg.errs.length === 0, `${t}: no page errors ${pg.errs.join(" | ")}`);
      await pg.context().close();
    }
  }

  // ---------- music: Record sends the take, MIDI and the computer keyboard play the keys ----------
  for (const [name, vp, touch] of VIEWS) {
    const pg = await open(vp, "light", touch);
    await say(pg, `loop@beat "Beat" bpm=96 steps=8 rows=kick|snare|hat p=x...x...|....x...|x.x.x.x.\nkeys@keys "Keys" key=C scale=major\ndrums@pads 2x2 "Pads"`);
    // music opens on the stage window of the thread; everything below is inside it
    await pg.waitForSelector(".yl-stage.open [data-testid=take]");
    const win = pg.locator(".yl-stage.open").last();
    ok(await win.locator("[data-testid=take]").count() >= 3, `music ${name}: the looper, the keys and the pads each have a Record button`);
    await tapIn(win.locator(".mu-loop .mu-play").first());
    await tapIn(win.locator("[data-testid=take-record]").first());
    await pg.waitForTimeout(1800);
    ok(/^0:0\d$/.test((await win.locator("[data-testid=take-status]").first().innerText()).trim()), `music ${name}: Record counts the take`);
    await tapIn(win.locator("[data-testid=take-record]").first());
    await pg.waitForFunction(() => /Take sent/.test(document.querySelector(".yl-stage.open [data-testid=take-status]")?.textContent || ""), null, { timeout: 15000 }).catch(() => {});
    ok(/Take sent, 0:0\d/.test(await win.locator("[data-testid=take-status]").first().innerText()), `music ${name}: Stop and send says the take went`);
    const up = await pg.evaluate(() => window.yuiWebDemo.uploads());
    ok(up.some((u) => /\.(m4a|webm)$/.test(u.path) && u.size > 1000) && up.some((u) => u.path.endsWith(".mid") && u.size > 40), `music ${name}: the audio and the .mid went up to the thread's media (${up.map((u) => `${u.path.split(".").pop()}:${u.size}`).join(",")})`);
    const w = await wire(pg);
    const ev = w.find((r) => r.kind === "event" && r.meta?.preset === "loop");
    ok(!!ev && /^\[yui\] beat loop audio=\S+ midi=\S+ seconds=[\d.]+$/.test(ev.body.replace(/ bpm=\d+/, "")), `music ${name}: the take goes as the phone's event ${ev ? ev.body.slice(0, 90) : "(none)"}`);
    ok(ev?.meta?.echo && /^Sent a take, \d+ s$/.test(ev.meta.echo), `music ${name}: with the app's echo (${ev?.meta?.echo})`);
    // the MIDI file is a real SMF
    const mid = await pg.evaluate(async () => window.yuiWebDemo.head(window.yuiWebDemo.uploads().find((x) => x.path.endsWith(".mid")).path, 14));
    ok(String.fromCharCode(...mid.slice(0, 4)) === "MThd" && mid[9] === 1 && ((mid[12] << 8) | mid[13]) === 480, `music ${name}: the .mid is a type 1 file at 480 ticks a beat`);

    // keys: the computer keyboard and a MIDI keyboard play
    await win.locator(".mu-keys").first().scrollIntoViewIfNeeded();
    ok(await win.locator("[data-testid=keys-midi]").first().innerText({ timeout: 3000 }).then((x) => /Test Keystat/.test(x)).catch(() => false), `music ${name}: a connected MIDI keyboard shows by name on the keys`);
    await pg.keyboard.down("a");
    ok(await win.locator(".mu-keys .mu-white.down").count() === 1, `music ${name}: the A key plays the first white key`);
    await pg.keyboard.up("a");
    await pg.evaluate(() => window.__midi([0x90, 64, 100]));
    await pg.waitForTimeout(100);
    ok(await win.locator(".mu-keys [data-midi='64'].down").count() === 1, `music ${name}: a MIDI note on presses that key`);
    await pg.evaluate(() => window.__midi([0x80, 64, 0]));
    await pg.waitForTimeout(100);
    ok(await win.locator(".mu-keys [data-midi='64'].down").count() === 0, `music ${name}: and the note off lets go`);
    ok(pg.errs.length === 0, `music ${name}: no page errors ${pg.errs.join(" | ")}`);
    if (SHOTS) await pg.screenshot({ path: `${SHOTS}/web-music-${name}-light.png` });
    await pg.context().close();
  }
  for (const theme of ["light", "dark"]) {
    const t = `kept ${theme} 390`;
    const pg = await open({ width: 390, height: 844 }, theme, { hasTouch: true, isMobile: true });
    const LIST = `list@groceries "Groceries" Milk|Eggs|Bread +check`;
    const LOOP = `loop@beat "Beat" bpm=96 steps=8 rows=kick|snare|hat p=x...x...|....x...|x.x.x.x.`;
    const cell = () => pg.locator(".yl-stage.open [aria-label='hat, step 2']").last();
    await say(pg, LIST);
    await pg.locator(".yl-list li", { hasText: "Eggs" }).first().click();
    await say(pg, LOOP);
    await pg.waitForSelector(".yl-stage.open .mu-loop");
    await tapIn(cell());
    ok(await cell().getAttribute("aria-pressed") === "true", `${t}: a tap on the grid turns the step on`);
    await pg.reload();
    await pg.waitForSelector(".wb-thread[data-loaded='1']");
    await pg.waitForTimeout(500);
    await say(pg, LIST); // the demo thread starts over on a reload; the agent draws the same screens
    ok(/done/.test(await pg.locator(".yl-list li", { hasText: "Eggs" }).last().getAttribute("class")), `${t}: a list's tick comes back after a reload`);
    ok(!/done/.test(await pg.locator(".yl-list li", { hasText: "Milk" }).last().getAttribute("class")), `${t}: and only that one`);
    await say(pg, LOOP);
    await pg.waitForSelector(".yl-stage.open .mu-loop");
    ok(await cell().getAttribute("aria-pressed") === "true", `${t}: a beat on the looper comes back until it is sent`);
    // the agent draws a different loop under the same id: the draft goes and the agent's loop shows
    await say(pg, `loop@beat "Beat" bpm=96 steps=8 rows=kick|snare|hat p=x.......|....x...|........`);
    await pg.waitForTimeout(500);
    ok(await cell().getAttribute("aria-pressed") === "false", `${t}: a different loop from the agent drops the draft`);
    await pg.getByRole("button", { name: "Close full screen" }).first().click({ timeout: 2000 }).catch(() => {});
    await pg.waitForTimeout(400);

    // camera: one photo, uploaded, sent as {photo: path} with the echo "Photo"
    const w0 = (await wire(pg)).length;
    await say(pg, `camera@cam "Show me the receipt"`);
    await pg.getByRole("button", { name: "Open camera" }).last().click();
    await pg.getByRole("button", { name: "Capture" }).last().click({ timeout: 15000 }); // enabled once the preview has a picture
    await pg.waitForFunction(() => window.yuiWebDemo.uploads().some((u) => u.path.endsWith(".jpg")), null, { timeout: 15000 }).catch(() => {});
    await pg.waitForTimeout(800);
    if (process.env.DBG) console.log("DBG", pg.errs, await pg.locator(".yl-stage.open, .wb-stage").last().innerText().catch(() => "no stage"), JSON.stringify(await pg.evaluate(() => window.yuiWebDemo.uploads())));
    const up = await pg.evaluate(() => window.yuiWebDemo.uploads());
    const ev = (await wire(pg)).slice(w0).find((r) => r.kind === "event" && r.meta?.preset === "camera");
    ok(up.some((u) => u.path.endsWith(".jpg") && u.type === "image/jpeg"), `${t}: the shot goes up to the thread's media as a JPEG`);
    ok(!!ev && /^\[yui\] cam camera photo=\S+\.jpg$/.test(ev.body) && ev.meta.echo === "Photo", `${t}: and goes as the phone's line ${ev ? ev.body : "(none)"}`);
    ok(pg.errs.length === 0, `${t}: no page errors ${pg.errs.join(" | ")}`);
    if (SHOTS) await pg.screenshot({ path: `${SHOTS}/web-kept-390-${theme}.png` });
    await pg.context().close();
  }
}

// ---------- part 2: every library.json sample renders, taps, and sends the app's wire format ----------
if (ONLY !== "0") {
  const lib = await (await fetch(`${BASE}/library.json`)).json();
  const list = lib.items.filter((i) => ["preset", "screen"].includes(i.kind) && i.yl);
  const pg = await open({ width: 390, height: 844 }, "light", { hasTouch: true, isMobile: true });
  let sent = 0;
  for (const it of list) {
    const before = (await wire(pg)).length;
    const errs0 = pg.errs.length;
    let drew = true;
    try { await say(pg, it.yl); } catch { drew = false; }
    ok(drew && pg.errs.length === errs0, `library ${it.kind} ${it.name}: renders on the web${pg.errs.length > errs0 ? ` (${pg.errs.at(-1)})` : ""}`);
    if (!drew) continue;
    // Tap the first thing a person would: a primary button, a choice, a pad, a cell, a row. Many samples open their own
    // stage window over the thread; the tap goes in it.
    const scope = (await pg.locator(".yl-stage.open").count()) ? pg.locator(".yl-stage.open").last() : pg.locator(".wb-item").last();
    const target = scope.locator("button.bigbtn, button.chip, .yl-opt, .mu-pad, .mu-chord, .mu-cell, .yl-planrow, .yl-list.check li, .yl-choice, [role=radio]").filter({ visible: true }).first();
    if (await target.count()) {
      await target.evaluate((el) => el.scrollIntoView({ block: "center" })).catch(() => {});
      await target.click({ timeout: 3000 }).catch(() => {});
      await pg.waitForTimeout(450);
    }
    const w = (await wire(pg)).slice(before);
    for (const r of w) {
      if (r.kind !== "event") continue;
      sent++;
      const expected = eventLine({ id: r.meta.id, preset: r.meta.preset, ...r.meta.value });
      ok(r.body === expected && /^\[yui\] \S+ \S+/.test(r.body), `library ${it.name}: the line sent is the app's wire format (${r.body.slice(0, 70)})`);
    }
    await pg.getByRole("button", { name: "Close full screen" }).first().click({ timeout: 1000 }).catch(() => {});
  }
  ok(sent >= 6, `library: at least 6 samples sent an event through a tap (${sent})`);
  ok(pg.errs.length === 0, `library: no page errors ${pg.errs.slice(0, 3).join(" | ")}`);
  await pg.context().close();
}

await b.close();
console.log(`${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
