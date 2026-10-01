// YUI-244 e2e: the composer on the web, on the demo relay (no sign in, no network).
//   npx next build && npx next start -p 3244 &   then   node e2e/web/composer.test.mjs
// BASE overrides the origin, PLAYWRIGHT the Playwright module, SHOTS the folder for 390 px and desktop shots
// (light and dark; skipped when unset). Voice is driven with a fake recognizer (no mic in CI).
import { createRequire } from "node:module";
import { mkdirSync, writeFileSync } from "node:fs";
import { deflateSync } from "node:zlib";
const { chromium } = createRequire(import.meta.url)(process.env.PLAYWRIGHT || "playwright");
const BASE = process.env.BASE || "http://localhost:3244";
const SHOTS = process.env.SHOTS || "";
if (SHOTS) mkdirSync(SHOTS, { recursive: true });
const TMP = "/tmp/yui244";
mkdirSync(TMP, { recursive: true });
let pass = 0, fail = 0;
const ok = (c, msg) => { if (c) { pass++; console.log("  ok  ", msg); } else { fail++; console.log("  FAIL", msg); } };

// A flat-colour PNG of any size, no dependencies.
function png(w, h, [r, g, b]) {
  const crcTable = Array.from({ length: 256 }, (_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c >>> 0; });
  const crc = (buf) => { let c = 0xffffffff; for (const x of buf) c = crcTable[(c ^ x) & 0xff] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };
  const chunk = (type, data) => { const len = Buffer.alloc(4); len.writeUInt32BE(data.length); const td = Buffer.concat([Buffer.from(type), data]); const c = Buffer.alloc(4); c.writeUInt32BE(crc(td)); return Buffer.concat([len, td, c]); };
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4); ihdr[8] = 8; ihdr[9] = 2;
  const row = Buffer.alloc(1 + w * 3);
  for (let x = 0; x < w; x++) { row[1 + x * 3] = r; row[2 + x * 3] = (g + (x * 255) / w) & 255; row[3 + x * 3] = b; }
  const raw = Buffer.concat(Array.from({ length: h }, () => row));
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk("IHDR", ihdr), chunk("IDAT", deflateSync(raw)), chunk("IEND", Buffer.alloc(0))]);
}
const small = `${TMP}/small.png`, big = `${TMP}/big.png`, notes = `${TMP}/notes.txt`;
writeFileSync(small, png(120, 90, [255, 126, 138]));
writeFileSync(big, png(4096, 2048, [90, 160, 220]));
writeFileSync(notes, "not a photo");

// A recognizer that says what the test tells it to, and no mic.
const FAKES = `
  window.__sr = { last: null };
  class FakeSR {
    constructor() { window.__sr.last = this; this.started = false; }
    start() { this.started = true; setTimeout(() => this.onstart && this.onstart(), 0); }
    stop() { setTimeout(() => this.onend && this.onend(), 20); }
    abort() { setTimeout(() => this.onend && this.onend(), 0); }
    say(text, final) { const res = [{ transcript: text }]; res.isFinal = !!final; this.onresult && this.onresult({ results: [res] }); }
  }
  window.SpeechRecognition = FakeSR; window.webkitSpeechRecognition = FakeSR;
  Object.defineProperty(navigator, "mediaDevices", { value: { getUserMedia: () => Promise.reject(new Error("no mic in CI")) }, configurable: true });
`;

const b = await chromium.launch();
const wire = (pg, id = "demo-penny") => pg.evaluate((a) => window.yuiWebDemo.wire(a), id);
const lastWire = async (pg, id) => (await wire(pg, id)).at(-1);

async function open(ctxOpts, theme, { agent = "demo-penny", view = "chat", init = FAKES, ctx = null } = {}) {
  const context = ctx || await b.newContext({ deviceScaleFactor: 2, ...ctxOpts });
  const pg = await context.newPage();
  pg.errs = [];
  pg.on("pageerror", (e) => pg.errs.push(e.message));
  if (init) await pg.addInitScript(init);
  await pg.goto(`${BASE}/web/agent/${agent}?demo=penny&theme=${theme}${view === "chat" ? "&view=chat" : ""}`);
  await pg.waitForSelector(view === "chat" ? ".wb-item" : "[data-testid=stage]");
  await pg.waitForTimeout(500);
  return pg;
}
const wait = (pg, fn, arg, t = 8000) => pg.waitForFunction(fn, arg, { timeout: t });
const sent = (pg, id = "demo-penny") => pg.evaluate((a) => window.yuiWebDemo.wire(a).length, id);
const box = async (loc) => (await loc.boundingBox()) || { width: 0, height: 0 };
const PHONE = { viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true };
const DESK = { viewport: { width: 1280, height: 800 } };

// SKIP_MATRIX=1 runs only the phone block at the end (a quick check after a small change).
for (const [name, vp] of process.env.SKIP_MATRIX ? [] : [["390", PHONE], ["desktop", DESK]]) for (const theme of ["light", "dark"]) {
  const tag = `${theme} ${name}`;
  const shot = async (pg, n) => { if (SHOTS) await pg.screenshot({ path: `${SHOTS}/web-composer-${n}-${name}-${theme}.png` }); };
  const phone = name === "390";

  // =============== photos and files ===============
  let pg = await open(vp, theme);
  const input = pg.getByTestId("attach-input");
  await input.setInputFiles(small);
  await pg.waitForSelector("[data-testid=photo-thumb]");
  ok(await pg.getByTestId("photo-thumb").count() === 1, `${tag}: a picked photo shows in the tray`);
  ok(await pg.getByTestId("send").isEnabled(), `${tag}: a photo alone can be sent`);
  await shot(pg, "tray");
  await pg.getByLabel("Remove photo").click();
  ok(await pg.getByTestId("photo-thumb").count() === 0, `${tag}: a photo comes back out of the tray`);

  await input.setInputFiles(notes);
  await pg.waitForSelector("[data-testid=photo-problem]");
  ok((await pg.getByTestId("photo-problem").innerText()).includes("Yui takes photos"), `${tag}: a file that is not a photo says so`);
  await pg.getByLabel("Dismiss").click();

  await input.setInputFiles([big, small]);
  await wait(pg, () => document.querySelectorAll("[data-testid=photo-thumb]").length === 2);
  await pg.getByLabel("Message Penny").fill("two for you");
  let n0 = await sent(pg);
  await pg.getByTestId("send").click();
  await wait(pg, (n) => window.yuiWebDemo.wire("demo-penny").length > n, n0);
  let w = await lastWire(pg);
  ok(w.body === "two for you" && Array.isArray(w.meta.photos) && w.meta.photos.length === 2, `${tag}: one row carries the words and both bucket paths`);
  ok(w.meta.photos.every((p) => /^demo-user\/demo-penny\/user\/[0-9a-f-]{36}\.jpg$/.test(p)), `${tag}: the paths are <user>/<agent>/user/<uuid>.jpg`);
  const ups = await pg.evaluate(() => window.yuiWebDemo.uploads());
  ok(ups.length === 2 && ups.every((u) => u.type === "image/jpeg"), `${tag}: both went up as JPEG`);
  const bigUp = Math.max(...ups.map((u) => u.size));
  const dims = await pg.evaluate(async () => { const u = window.yuiWebDemo.uploads(); void u; return null; });
  void dims;
  ok(bigUp < 4 * 1024 * 1024, `${tag}: the 4096 px photo was shrunk before it went (${bigUp} bytes)`);
  ok(await pg.getByTestId("photo-tray").count() === 0, `${tag}: the tray empties on send`);
  await wait(pg, () => document.querySelectorAll("[data-testid=bubble-photo] img").length >= 2);
  ok(await pg.locator("[data-testid=bubble-photo] img").first().evaluate((i) => i.complete && i.naturalWidth > 0), `${tag}: the picture shows on the person's bubble`);
  await pg.waitForTimeout(400);
  ok(await pg.locator(".wb-scroll").evaluate((e) => e.scrollHeight - e.scrollTop - e.clientHeight < 40), `${tag}: the thread stays on the newest message after the pictures load`);
  await shot(pg, "photos-sent");
  await pg.locator("[data-testid=bubble-photo]").first().click();
  ok(await pg.getByRole("dialog", { name: "Photo" }).count() === 1, `${tag}: a tap opens the photo big`);
  await pg.keyboard.press("Escape");
  ok(await pg.getByRole("dialog", { name: "Photo" }).count() === 0, `${tag}: Escape closes it`);

  // a photo alone: the stand-in body
  await wait(pg, () => !document.querySelector(".wb-working"), null, 15000);
  await input.setInputFiles(small);
  await pg.waitForSelector("[data-testid=photo-thumb]");
  n0 = await sent(pg);
  await pg.getByTestId("send").click();
  await wait(pg, (n) => window.yuiWebDemo.wire("demo-penny").length > n, n0);
  w = await lastWire(pg);
  ok(w.body === "Photo" && w.meta.photos.length === 1, `${tag}: a photo alone sends the stand-in body "Photo"`);

  // drag and drop and paste
  await wait(pg, () => !document.querySelector(".wb-working"), null, 15000);
  await pg.evaluate(async () => {
    const c = document.createElement("canvas"); c.width = 40; c.height = 40; c.getContext("2d").fillRect(0, 0, 40, 40);
    const blob = await new Promise((r) => c.toBlob(r, "image/png"));
    const file = new File([blob], "dropped.png", { type: "image/png" });
    const dt = new DataTransfer(); dt.items.add(file);
    document.querySelector(".wb-thread").dispatchEvent(new DragEvent("drop", { dataTransfer: dt, bubbles: true, cancelable: true }));
  });
  await wait(pg, () => document.querySelectorAll("[data-testid=photo-thumb]").length === 1);
  ok(true, `${tag}: a photo dropped on the thread lands in the tray`);
  await pg.getByLabel("Remove photo").click();
  await pg.evaluate(async () => {
    const c = document.createElement("canvas"); c.width = 30; c.height = 30; c.getContext("2d").fillRect(0, 0, 30, 30);
    const blob = await new Promise((r) => c.toBlob(r, "image/png"));
    const dt = new DataTransfer(); dt.items.add(new File([blob], "pasted.png", { type: "image/png" }));
    document.querySelector("textarea").dispatchEvent(new ClipboardEvent("paste", { clipboardData: dt, bubbles: true, cancelable: true }));
  });
  await wait(pg, () => document.querySelectorAll("[data-testid=photo-thumb]").length === 1);
  ok(true, `${tag}: a picture pasted into the field lands in the tray`);
  ok(pg.errs.length === 0, `${tag}: no page errors (${pg.errs.join("|").slice(0, 120)})`);
  await pg.context().close();

  // =============== reactions ===============
  pg = await open(vp, theme);
  const bubble = pg.locator(".wb-agent .wb-hold", { hasText: "Three runs fit" }).first();
  await bubble.scrollIntoViewIfNeeded();
  if (phone) {
    // a hold on a touch screen
    await bubble.dispatchEvent("pointerdown", { pointerType: "touch", clientX: 100, clientY: 300, isPrimary: true });
    await pg.waitForTimeout(650);
  } else {
    await bubble.click({ button: "right" });
  }
  await pg.waitForSelector("[data-testid=msg-menu]");
  ok(await pg.locator(".wc-react").count() === 6, `${tag}: ${phone ? "a hold" : "a right-click"} opens the six reactions`);
  const reactBox = await box(pg.locator(".wc-react").first());
  ok(reactBox.width >= 44 && reactBox.height >= 44, `${tag}: a reaction is at least 44 px (${Math.round(reactBox.width)}x${Math.round(reactBox.height)})`);
  await shot(pg, "menu");
  n0 = await sent(pg);
  await pg.getByTestId("react-build-it").click();
  await wait(pg, (n) => window.yuiWebDemo.wire("demo-penny").length > n, n0);
  w = await lastWire(pg);
  ok(/^\[yui\] react msg=[0-9a-f-]{36} emoji=👍 meaning="build it"\n> Three runs fit/.test(w.body), `${tag}: 👍 went out as the spec's react line, the message quoted`);
  ok(w.kind === "event" && w.meta.react.emoji === "👍", `${tag}: as an event row with meta.react`);
  ok(await pg.getByTestId("reaction-badge").count() === 1 && (await pg.getByTestId("reaction-badge").innerText()) === "👍", `${tag}: the badge shows on the bubble at once`);
  ok(await pg.locator(".wb-user .wb-bubble", { hasText: "[yui]" }).count() === 0, `${tag}: the reaction is never a bubble`);
  await shot(pg, "badge");
  // change it, then take it back
  await pg.getByTestId("reaction-badge").click();
  await pg.waitForSelector("[data-testid=msg-menu]");
  n0 = await sent(pg);
  await pg.getByTestId("react-priority").click();
  await wait(pg, (n) => window.yuiWebDemo.wire("demo-penny").length > n, n0);
  ok(/emoji=🔥 meaning=priority changed=true/.test((await lastWire(pg)).body), `${tag}: another reaction replaces it with changed=true`);
  await pg.getByTestId("reaction-badge").click();
  n0 = await sent(pg);
  await pg.getByTestId("react-priority").click();
  await wait(pg, (n) => window.yuiWebDemo.wire("demo-penny").length > n, n0);
  ok(/emoji=none/.test((await lastWire(pg)).body) && await pg.getByTestId("reaction-badge").count() === 0, `${tag}: the same one again takes it back`);
  await wait(pg, () => !document.querySelector(".wb-working"), null, 15000);

  // your own messages take no reactions; the menu shows Reply and Copy only
  const mine = pg.locator(".wb-user .wb-hold", { hasText: "How did the week look" }).first();
  if (await mine.count()) {
    await mine.scrollIntoViewIfNeeded();
    if (phone) { await mine.dispatchEvent("pointerdown", { pointerType: "touch", clientX: 200, clientY: 300, isPrimary: true }); await pg.waitForTimeout(650); } else await mine.click({ button: "right" });
    await pg.waitForSelector("[data-testid=msg-menu]");
    ok(await pg.locator(".wc-react").count() === 0 && await pg.getByTestId("menu-reply").count() === 1, `${tag}: your own message gets Reply and Copy, no reactions`);
    await pg.keyboard.press("Escape");
  }

  // keyboard: the button on the bubble opens the same menu
  const first = pg.locator(".wb-agent .wb-hold", { hasText: "Three runs fit" }).first();
  await first.locator(".wb-more").focus();
  await pg.waitForTimeout(300);
  ok(await first.locator(".wb-more").evaluate((e) => getComputedStyle(e).opacity === "1"), `${tag}: the focused bubble shows its own actions button`);
  await pg.keyboard.press("Enter");
  await pg.waitForSelector("[data-testid=msg-menu]");
  ok(await pg.evaluate(() => document.activeElement?.closest(".wc-menu") !== null), `${tag}: focus moves into the menu`);
  await pg.keyboard.press("Escape");
  ok(await pg.getByTestId("msg-menu").count() === 0, `${tag}: Escape closes it`);

  // =============== reply ===============
  const target = pg.locator(".wb-agent .wb-hold", { hasText: "Three runs fit" }).first();
  if (phone) { await target.dispatchEvent("pointerdown", { pointerType: "touch", clientX: 100, clientY: 300, isPrimary: true }); await pg.waitForTimeout(650); } else await target.click({ button: "right" });
  await pg.getByTestId("menu-reply").click();
  await pg.waitForSelector("[data-testid=reply-bar]");
  ok((await pg.getByTestId("reply-bar").innerText()).includes("Replying to Penny"), `${tag}: Reply puts the quote above the field`);
  ok(await pg.evaluate(() => document.activeElement?.tagName === "TEXTAREA"), `${tag}: and the field is focused`);
  await shot(pg, "reply");
  await pg.getByLabel("Message Penny").fill("move Thursday to Friday");
  n0 = await sent(pg);
  await pg.getByTestId("send").click();
  await wait(pg, (n) => window.yuiWebDemo.wire("demo-penny").length > n, n0);
  w = await lastWire(pg);
  ok(/^\[yui\] reply to=[0-9a-f-]{36} from=agent quote="Three runs fit\./.test(w.body) && w.body.endsWith("\nmove Thursday to Friday"), `${tag}: the reply goes out as the app's line plus the words`);
  ok(w.meta.reply_to.from === "agent" && w.meta.reply_to.quote.startsWith("Three runs fit"), `${tag}: with meta.reply_to`);
  ok(await pg.getByTestId("reply-bar").count() === 0, `${tag}: the bar clears on send`);
  ok(await pg.getByTestId("reply-chip").count() === 1, `${tag}: the sent reply wears the quote chip`);
  await pg.getByTestId("reply-chip").click();
  await pg.waitForTimeout(500);
  ok(await pg.locator(".wb-item.flash").count() === 1, `${tag}: a tap on the chip goes back to the message`);
  ok(pg.errs.length === 0, `${tag}: no page errors (${pg.errs.join("|").slice(0, 120)})`);
  await pg.context().close();

  // =============== mentions and slash commands ===============
  pg = await open(vp, theme, { agent: "demo-yui" });
  const field = pg.getByLabel("Message Yui");
  await field.fill("/");
  await pg.waitForSelector("[data-testid=slash-list]");
  ok(await pg.locator(".wc-sug").count() === 3, `${tag}: "/" lists the agent's commands`);
  await field.fill("/ne");
  ok(await pg.locator(".wc-sug").count() === 1, `${tag}: they filter as you type`);
  await pg.getByTestId("slash-new").click();
  ok(await field.inputValue() === "/new ", `${tag}: a tap fills the command and a space for its argument`);
  await field.fill("");
  await field.pressSequentially("hi @pe");
  await pg.waitForSelector("[data-testid=mention-list]");
  ok(await pg.locator(".wc-sug").count() === 1 && (await pg.locator(".wc-sug").innerText()).includes("Penny"), `${tag}: "@pe" suggests Penny, never the open agent`);
  ok((await pg.locator(".wc-sug").innerText()).includes("Online"), `${tag}: with how it is doing`);
  await shot(pg, "mention");
  await pg.keyboard.press("ArrowDown");
  await pg.keyboard.press("Enter");
  ok(await field.inputValue() === "hi @Penny ", `${tag}: Enter takes the highlighted agent`);
  await field.pressSequentially("can you move Friday?");
  await pg.waitForSelector("[data-testid=mention-bar]");
  ok((await pg.getByTestId("mention-bar").innerText()).includes("Goes to Penny"), `${tag}: the bar says who gets it`);
  n0 = await sent(pg, "demo-yui");
  await pg.getByTestId("send").click();
  await wait(pg, (n) => window.yuiWebDemo.wire("demo-yui").length > n, n0);
  w = await lastWire(pg, "demo-yui");
  ok(w.body === "[yui] mention to=penny\nhi @Penny can you move Friday?" && w.meta.mention.handle === "penny", `${tag}: it goes out as the mention line with meta.mention`);
  ok(await pg.locator(".wb-user .wb-to", { hasText: "To Penny" }).count() === 1, `${tag}: the bubble says "To Penny"`);
  ok(await pg.locator(".wb-working").count() === 0, `${tag}: this agent is not asked, so no working row`);
  await pg.waitForSelector("[data-testid=mention-open]", { timeout: 8000 });
  ok(await pg.locator(".wb-from", { hasText: "Penny" }).count() === 1, `${tag}: Penny's answer comes back here with its name`);
  await shot(pg, "mention-answer");
  await pg.getByTestId("mention-open").click();
  await pg.waitForFunction(() => location.pathname.endsWith("demo-penny"), null, { timeout: 5000 });
  ok(true, `${tag}: "Open its thread" goes to Penny's thread`);
  // me@example.com is not a mention
  await pg.getByLabel("Message Penny").fill("mail me@pe");
  ok(await pg.locator("[data-testid=mention-list]").count() === 0, `${tag}: an email address is not an @`);
  ok(pg.errs.length === 0, `${tag}: no page errors (${pg.errs.join("|").slice(0, 120)})`);
  await pg.context().close();

  // =============== voice: hold to talk, slide to cancel, hands-free ===============
  pg = await open(vp, theme);
  const mic = pg.getByTestId("mic");
  const mb = await box(mic);
  ok(mb.width >= 44 && mb.height >= 44, `${tag}: the mic is at least 44 px (${Math.round(mb.width)}x${Math.round(mb.height)})`);
  const cx = mb.x + mb.width / 2, cy = mb.y + mb.height / 2;
  await pg.mouse.move(cx, cy);
  await pg.mouse.down();
  await pg.waitForSelector("[data-testid=voice-row]");
  await pg.evaluate(() => window.__sr.last.say("what is on my calendar", false));
  await pg.waitForTimeout(450);
  ok((await pg.getByTestId("voice-words").innerText()).includes("what is on my calendar"), `${tag}: holding the mic shows the words as they are heard`);
  ok(await pg.locator(".wc-wave i").count() === 36, `${tag}: with the waveform`);
  await shot(pg, "listening");
  n0 = await sent(pg);
  await pg.mouse.up();
  await wait(pg, (n) => window.yuiWebDemo.wire("demo-penny").length > n, n0);
  ok((await lastWire(pg)).body === "what is on my calendar", `${tag}: letting go sends the words as text`);
  await wait(pg, () => !document.querySelector(".wb-working"), null, 15000);

  // slide left to cancel
  await pg.mouse.move(cx, cy);
  await pg.mouse.down();
  await pg.waitForSelector("[data-testid=voice-row]");
  await pg.evaluate(() => window.__sr.last.say("never mind", false));
  await pg.waitForTimeout(450);
  await pg.mouse.move(cx - 120, cy, { steps: 4 });
  await pg.waitForTimeout(100);
  ok(await pg.locator(".wc-voice.cancel").count() === 1, `${tag}: sliding left says it will be thrown away`);
  n0 = await sent(pg);
  await pg.mouse.up();
  await pg.waitForTimeout(600);
  ok(await sent(pg) === n0 && await pg.getByTestId("voice-row").count() === 0, `${tag}: and nothing is sent`);

  // hands-free: a tap, talk, a pause, the reply, and it opens again
  await pg.mouse.move(cx, cy);
  await pg.mouse.down();
  await pg.waitForTimeout(80);
  await pg.mouse.up();
  await pg.waitForTimeout(500);
  ok(await pg.locator("[data-testid=voice-row][data-hf=listening]").count() === 1, `${tag}: a tap on the mic is hands-free`);
  n0 = await sent(pg);
  await pg.evaluate(() => window.__sr.last.say("plan my friday", true));
  await wait(pg, (n) => window.yuiWebDemo.wire("demo-penny").length > n, n0, 6000);
  ok((await lastWire(pg)).body === "plan my friday", `${tag}: a short quiet after the words sends them`);
  await wait(pg, () => !document.querySelector(".wb-working"), null, 15000);
  await pg.waitForSelector("[data-testid=voice-row][data-hf=listening]", { timeout: 6000 });
  ok(true, `${tag}: the mic opens again once the reply has landed`);
  await mic.click();
  await pg.waitForTimeout(300);
  ok(await pg.getByTestId("voice-row").count() === 0, `${tag}: a tap on the open mic ends hands-free`);
  // the keyboard: Enter on the focused mic is a tap
  await mic.focus();
  await pg.keyboard.press("Enter");
  await pg.waitForSelector("[data-testid=voice-row]");
  ok(true, `${tag}: Enter on the focused mic opens hands-free`);
  await pg.getByLabel("Cancel, throw away what I said").click();
  ok(await pg.getByTestId("voice-row").count() === 0, `${tag}: the trash closes it`);
  ok(pg.errs.length === 0, `${tag}: no page errors (${pg.errs.join("|").slice(0, 120)})`);
  await pg.context().close();

  // =============== the outbox survives a closed tab ===============
  const ctx = await b.newContext({ deviceScaleFactor: 2, ...vp });
  pg = await open(vp, theme, { ctx });
  await pg.evaluate(() => { window.yuiWebDemo.offline = true; });
  await pg.getByLabel("Message Penny").fill("sent while offline");
  await pg.getByTestId("send").click();
  await pg.waitForSelector(".wb-offline");
  ok(await pg.locator(".wb-user.pending .wb-bubble", { hasText: "sent while offline" }).count() === 1, `${tag}: offline, the message shows as waiting and the thread says so`);
  const kept = await pg.evaluate(() => new Promise((res) => { const r = indexedDB.open("yui-web-demo", 1); r.onsuccess = () => { const q = r.result.transaction("outbox").objectStore("outbox").getAll(); q.onsuccess = () => res(q.result.map((x) => x.body)); }; }));
  ok(kept.length === 1 && kept[0] === "sent while offline", `${tag}: it is on disk (IndexedDB) before it is ever sent`);
  await shot(pg, "offline");
  await pg.close(); // the tab closes
  pg = await open(vp, theme, { ctx }); // and opens again: a new page, a new relay, the same disk
  await wait(pg, () => window.yuiWebDemo.wire("demo-penny").some((r) => r.body === "sent while offline"), null, 10000);
  ok((await wire(pg)).filter((r) => r.body === "sent while offline").length === 1, `${tag}: back again, it goes out once`);
  await pg.waitForFunction(() => [...document.querySelectorAll(".wb-user .wb-bubble")].some((e) => e.textContent.includes("sent while offline")) && !document.querySelector(".wb-user.pending"), null, { timeout: 5000 }).catch(() => {});
  const shown = await pg.locator(".wb-user .wb-bubble", { hasText: "sent while offline" }).count(), waiting = await pg.locator(".wb-user.pending").count();
  ok(shown === 1 && waiting === 0, `${tag}: and shows once, no longer waiting (shown ${shown}, waiting ${waiting})`);
  const left = await pg.evaluate(() => new Promise((res) => { const r = indexedDB.open("yui-web-demo", 1); r.onsuccess = () => { const q = r.result.transaction("outbox").objectStore("outbox").getAll(); q.onsuccess = () => res(q.result.length); }; }));
  ok(left === 0, `${tag}: the disk is empty again`);
  // a photo waits too, bytes and all
  await pg.evaluate(() => { window.yuiWebDemo.offline = true; });
  await pg.getByTestId("attach-input").setInputFiles(small);
  await pg.waitForSelector("[data-testid=photo-thumb]");
  await pg.getByTestId("send").click();
  await pg.waitForSelector(".wb-offline");
  await pg.close();
  pg = await open(vp, theme, { ctx });
  await wait(pg, () => window.yuiWebDemo.wire("demo-penny").some((r) => r.body === "Photo" && r.meta.photos), null, 10000);
  ok((await pg.evaluate(() => window.yuiWebDemo.uploads())).length === 1, `${tag}: a photo sent offline went up after the tab came back, once`);
  await ctx.close();

  // =============== the stage's bar: attach, voice, the field ===============
  pg = await open(vp, theme, { view: "stage" });
  ok(await pg.getByTestId("stage-attach").count() === 1, `${tag}: the stage's bar has the + for photos`);
  const ab = await box(pg.getByTestId("stage-attach"));
  ok(ab.width >= 44 && ab.height >= 44, `${tag}: it is at least 44 px (${Math.round(ab.width)}x${Math.round(ab.height)})`);
  await pg.getByTestId("stage-attach-input").setInputFiles(small);
  await pg.waitForSelector("[data-testid=photo-thumb]");
  await shot(pg, "stage-tray");
  await pg.getByTestId("stage-type").click();
  await pg.locator("[data-testid=stage-field] textarea").fill("look at this");
  n0 = await sent(pg);
  await pg.getByTestId("stage-send").click();
  await wait(pg, (n) => window.yuiWebDemo.wire("demo-penny").length > n, n0);
  w = await lastWire(pg);
  ok(w.body === "look at this" && w.meta.photos?.length === 1, `${tag}: a photo sent from the stage goes as the same row`);
  await wait(pg, () => !document.querySelector("[data-testid=stage-working]"), null, 15000);
  // voice on the stage
  const sm = pg.getByTestId("stage-mic");
  if (await sm.count() === 0) { const back = pg.getByLabel("Back to the mic"); if (await back.count()) await back.click(); }
  const smb = await box(pg.getByTestId("stage-mic"));
  await pg.mouse.move(smb.x + smb.width / 2, smb.y + smb.height / 2);
  await pg.mouse.down();
  await pg.waitForSelector("[data-testid=stage-listening]");
  await pg.evaluate(() => window.__sr.last.say("stage words", false));
  await pg.waitForTimeout(450);
  ok(await pg.locator(".wb-stage .wc-wave").count() === 1, `${tag}: holding the stage's mic shows the waveform`);
  await shot(pg, "stage-listening");
  n0 = await sent(pg);
  await pg.mouse.up();
  await wait(pg, (n) => window.yuiWebDemo.wire("demo-penny").length > n, n0);
  ok((await lastWire(pg)).body === "stage words", `${tag}: and sends what was heard`);
  ok(pg.errs.length === 0, `${tag}: no page errors (${pg.errs.join("|").slice(0, 120)})`);
  await pg.context().close();
}

// ---------- a phone: the keyboard over the composer, safe areas, touch targets ----------
{
  const pg = await open(PHONE, "light");
  const targets = { "attach": "[data-testid=attach]", "send/mic": ".wb-compose .wb-send" };
  for (const [name, sel] of Object.entries(targets)) { const r = await box(pg.locator(sel).first()); ok(r.width >= 44 && r.height >= 44, `phone: ${name} is at least 44 px (${Math.round(r.width)}x${Math.round(r.height)})`); }
  // the on-screen keyboard: ThreadApp follows the visible viewport, so the composer stays above the keys
  await pg.evaluate(() => { document.documentElement.style.setProperty("--wb-vh", "480px"); document.documentElement.dataset.kbd = "1"; });
  await pg.waitForTimeout(200);
  const comp = await box(pg.getByTestId("composer"));
  ok(comp.y + comp.height <= 480 + 1, `phone: with a 480 px visible area the composer ends at ${Math.round(comp.y + comp.height)} px, above the keyboard`);
  const field16 = await pg.getByLabel("Message Penny").evaluate((e) => parseFloat(getComputedStyle(e).fontSize));
  ok(field16 >= 16, `phone: the field is ${field16}px, so iOS does not zoom on focus`);
  ok(await pg.evaluate(() => document.querySelector('meta[name=viewport]').content.includes("viewport-fit=cover")), "phone: viewport-fit=cover, so the safe areas are ours to pad");
  ok(await pg.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), "phone: nothing scrolls sideways");
  // a signed link into the private media bucket must be allowed to draw (a stored photo on reload, an agent's picture)
  const csp = (await pg.context().request.get(`${BASE}/web/agent/demo-penny?demo=penny`)).headers()["content-security-policy"] || "";
  ok(/img-src [^;]*https:\/\/txuibjxyfpalzvpneqgp\.supabase\.co/.test(csp) && /media-src [^;]*https:\/\/txuibjxyfpalzvpneqgp\.supabase\.co/.test(csp), "the page's policy lets pictures and video load from the media bucket");
  await pg.context().close();
}

await b.close();
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
