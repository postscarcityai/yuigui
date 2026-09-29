// SITE-100 e2e (spec/YL.md section 5: sound keeps playing across screens, a saved screen opens with no turn).
//   npx next dev -p 3140 &   then   node scripts/layer-e2e.mjs
// BASE overrides the site origin, PLAYWRIGHT the Playwright module, SHOTS the folder the 390px shots go to
// (light and dark, skipped when unset). Checks, in the playground demo and in the site chat:
//   a loop keeps playing when you swipe away and back (the engine lists it), a second voice layers on top,
//   closing the chat or leaving the page stops all of it, and a tap on a show= card sends zero /api/chat requests.
import { createRequire } from "node:module";
import { mkdirSync } from "node:fs";
const { chromium } = createRequire(import.meta.url)(process.env.PLAYWRIGHT || "playwright");
const BASE = process.env.BASE || "http://localhost:3140";
const SHOTS = process.env.SHOTS || "";
if (SHOTS) mkdirSync(SHOTS, { recursive: true });

const b = await chromium.launch({ args: ["--autoplay-policy=no-user-gesture-required"] });
let pass = 0, fail = 0;
const ok = (c, msg) => { if (c) { pass++; console.log("  ok  ", msg); } else { fail++; console.log("  FAIL", msg); } };
const active = (pg) => pg.evaluate(() => (window.yuiMusic?.active?.() || []).map((v) => `${v.kind}${v.parked ? "*" : ""}`).sort().join(","));
const kinds = (pg) => pg.evaluate(() => (window.yuiMusic?.active?.() || []).map((v) => v.kind).sort().join(","));
const wait = (pg, ms = 250) => pg.waitForTimeout(ms);

// ---------- the playground demo ----------
async function playground(theme) {
  const light = theme === "light";
  const pg = await b.newPage({ viewport: { width: light ? 1280 : 1280, height: 900 } });
  const errs = [];
  pg.on("pageerror", (e) => errs.push(e.message));
  await pg.goto(`${BASE}/playground?demo=layered-loops${light ? "&theme=light" : ""}`);
  await pg.waitForSelector(".pg-tab");
  await pg.getByRole("button", { name: /^Screen 2/ }).click();
  await pg.waitForSelector(".mu-loop");
  await wait(pg, 400);
  ok((await kinds(pg)) === "loop", `${theme}: the loop on screen 2 is sounding`);
  ok(await pg.locator(".mu-play.on").count() === 1, `${theme}: screen 2 shows it playing`);

  await pg.getByRole("button", { name: /^Screen 3/ }).click();
  await pg.waitForSelector(".mu-keys");
  await wait(pg, 300);
  ok((await active(pg)) === "loop*", `${theme}: swiped to screen 3, the loop still sounds (parked, no screen)`);
  ok(await pg.locator(".mu-loop").count() === 0, `${theme}: the loop screen really left the page`);

  // The second voice: hold two keys, so they ring after the fingers lift.
  await pg.getByRole("button", { name: "Hold", exact: true }).click();
  for (const i of [0, 2]) {
    const r = await pg.locator(".mu-white:not(.off)").nth(i).boundingBox();
    await pg.mouse.move(r.x + r.width / 2, r.y + r.height * 0.8);
    await pg.mouse.down();
    await wait(pg, 120);
    await pg.mouse.up();
  }
  await wait(pg, 200);
  ok((await active(pg)) === "keys,loop*", `${theme}: keys held on screen 3 layer over the loop`);
  if (SHOTS) await pg.locator(".pg-phone").screenshot({ path: `${SHOTS}/layered-keys-${theme}.png` });

  await pg.getByRole("button", { name: /^Screen 2/ }).click();
  await pg.waitForSelector(".mu-loop");
  await wait(pg, 300);
  ok((await active(pg)) === "keys*,loop", `${theme}: back on screen 2, the loop is live again and the keys still ring`);
  ok(await pg.locator(".mu-play.on").count() === 1, `${theme}: the loop screen shows it playing again`);
  ok((await pg.locator(".mu-cell.head").count()) >= 1, `${theme}: the playhead is moving`);
  if (SHOTS) await pg.locator(".pg-phone").screenshot({ path: `${SHOTS}/layered-loop-${theme}.png` });

  await pg.getByRole("button", { name: /^Screen 3/ }).click();
  await pg.waitForSelector(".mu-keys");
  await wait(pg, 250);
  ok(await pg.locator(".mu-hold.on").count() === 1 && (await pg.locator(".mu-white.down, .mu-black.down").count()) === 2, `${theme}: back on screen 3, Hold is on and both keys still show held`);
  await pg.getByRole("button", { name: "Hold", exact: true }).click();
  await wait(pg, 150);
  ok((await active(pg)) === "loop*", `${theme}: Hold off lets the keys go, the loop stays`);

  // Another demo, then nothing sounds.
  await pg.locator("select[aria-label=Scenario], .pg-row select").first().selectOption({ index: 1 }).catch(() => {});
  await wait(pg, 300);
  ok((await active(pg)) === "", `${theme}: another demo stops all sound`);
  ok(errs.length === 0, `${theme}: no page errors ${errs.join(" | ")}`);
  await pg.close();
}

// ---------- the site chat ----------
const REPLY = [
  "Two screens.",
  "```yui",
  'say "Loop on 2, metronome on 3."',
  ">2 loop@beat 92 steps=8 rows=kick|snare|hat p=x...x...|....x...|x.x.x.x.",
  ">3 metronome@m 100",
  "```",
].join("\n");

async function chat(theme) {
  const light = theme === "light";
  const ctx = await b.newContext({ viewport: { width: 390, height: 780 }, isMobile: true, hasTouch: true });
  const pg = await ctx.newPage();
  const errs = [];
  pg.on("pageerror", (e) => errs.push(e.message));
  let calls = 0;
  await pg.route("**/api/chat", async (route) => {
    const body = JSON.parse(route.request().postData() || "{}");
    if (body.action === "say") calls++;
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ reply: REPLY, actions: [] }) });
  });
  await pg.addInitScript(() => { try { localStorage.setItem("yui-theme", "light"); } catch {} });
  if (light) await pg.addInitScript(() => { try { localStorage.setItem("yui-theme", "light"); } catch {} });
  await pg.goto(`${BASE}/`);
  await pg.getByRole("button", { name: "Chat with Yui" }).click({ force: true });
  await pg.waitForSelector(".yc-starters button");
  await pg.locator(".yc-starters button").first().click();
  await pg.waitForSelector(".ys-play, .ys-slide[data-page]", { timeout: 15000 });
  ok(calls === 1, `${theme}: one request to send the message`);

  const slider = pg.getByRole("slider", { name: "Screens" });
  const goto = async (n) => { // the dots are a slider; the keyboard moves it
    await slider.focus();
    const at = Number(await slider.getAttribute("aria-valuenow"));
    for (let i = 0; i < Math.abs(n - at); i++) await pg.keyboard.press(n > at ? "ArrowRight" : "ArrowLeft");
    await wait(pg, 500);
  };
  await goto(2);
  await pg.locator('.ys-page[data-page="2"] .mu-play').click();
  await wait(pg, 300);
  ok((await kinds(pg)) === "loop", `${theme}: chat: the loop on screen 2 is sounding`);
  await goto(3);
  ok((await kinds(pg)) === "loop", `${theme}: chat: swiped to screen 3, it still sounds`);
  await pg.locator('.ys-page[data-page="3"] .mu-play').click();
  await wait(pg, 300);
  ok((await kinds(pg)) === "loop,metronome", `${theme}: chat: a metronome layers over the loop`);
  if (SHOTS) await pg.screenshot({ path: `${SHOTS}/chat-layered-${theme}.png` });
  await goto(1);
  await goto(2);
  ok((await kinds(pg)) === "loop,metronome" && (await pg.locator('.ys-page[data-page="2"] .mu-play.on').count()) === 1, `${theme}: chat: swiped home and back, both still sounding`);


  await pg.getByRole("button", { name: "Close chat" }).first().click({ force: true });
  await wait(pg, 300);
  ok((await active(pg)) === "", `${theme}: closing the chat stops all sound`);
  ok(errs.length === 0, `${theme}: no page errors ${errs.join(" | ")}`);
  await ctx.close();
}

// ---------- a saved screen opens with no turn ----------
// Gouda's "Tune up" shortcut carries show=tuner, so the tap swipes to the tuner page on the phone mock, and a shelf
// chip in the playground reopens its saved screen. Neither may reach the model.
async function saved(theme) {
  const ctx = await b.newContext({ viewport: { width: 900, height: 900 } });
  const pg = await ctx.newPage();
  const asked = [];
  pg.on("request", (r) => { if (r.url().includes("/api/chat")) asked.push(r.method()); });
  await pg.route("**/api/chat", (r) => r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ reply: "No.", actions: [] }) }));
  await pg.goto(`${BASE}/mockups/home?agent=gouda&theme=${theme}`);
  await pg.waitForSelector('.hm-slide[data-page="5"]'); // the pages draw once the page has hydrated
  const inView = () => pg.evaluate(() => {
    const box = document.querySelector(".hm-pager").getBoundingClientRect();
    return [...document.querySelectorAll(".hm-slide")].filter((el) => { const r = el.getBoundingClientRect(); return r.left >= box.left - 4 && r.right <= box.right + 4; }).map((el) => el.dataset.page);
  });
  ok((await inView()).join() === "1", `${theme}: the phone home starts on page 1`);
  const thread = await pg.locator(".hm-thread .hm-msg, .hm-msgs > *").count();
  await pg.getByRole("button", { name: "Tune up" }).click();
  await wait(pg, 900);
  ok((await inView()).join() === "5", `${theme}: the Tune up shortcut swiped straight to the tuner page (${(await inView()).join()})`);
  ok(asked.length === 0, `${theme}: no /api/chat request for a show= shortcut (${asked.length})`);
  ok((await pg.locator(".hm-thread .hm-msg, .hm-msgs > *").count()) === thread, `${theme}: no message was added to the thread`);
  if (SHOTS) await pg.locator(".hm-phone").screenshot({ path: `${SHOTS}/tune-up-shortcut-${theme}.png` });

  // The playground shelf: two saved screens, the chip of the first brings it back over the second, still no request.
  const yl = 'list@a Tune "Low E" "A"\nsave a\nclear\nlist@b Other "Capo 3"\nsave b';
  await pg.goto(`${BASE}/playground?yl=${encodeURIComponent(yl)}${theme === "light" ? "&theme=light" : ""}`);
  await pg.waitForSelector(".yl-shelf-chip");
  const screen = pg.locator(".pg-screen").first();
  ok((await screen.getByText("Low E").count()) === 0 && (await screen.getByText("Capo 3").count()) > 0, `${theme}: the shelf demo shows the second saved screen`);
  await pg.locator(".yl-shelf-chip button", { hasText: /^a$/ }).click();
  await wait(pg, 400);
  ok((await pg.getByText("Low E").count()) > 0 || (await pg.locator(".yl-stagepill").count()) > 0, `${theme}: the shelf chip reopened its saved screen`);
  ok(asked.length === 0, `${theme}: and sent no /api/chat request (${asked.length})`);
  await ctx.close();
}

for (const t of ["dark", "light"]) { await playground(t); await chat(t); await saved(t); }
await b.close();
console.log(`\nlayer-e2e: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
