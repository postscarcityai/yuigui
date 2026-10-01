// SITE-153 e2e: the chat bubble keeps past chats. Makes two chats, reloads, opens the first again.
//   npx next start -p 3153 &   then   node e2e/chat-history.mjs
// BASE overrides the site URL; PLAYWRIGHT the Playwright module; SHOTS a folder for the 390px shots.
const { chromium } = await import(process.env.PLAYWRIGHT || "playwright");
const BASE = process.env.BASE || "http://localhost:3153";
const SHOTS = process.env.SHOTS || "";
const b = await chromium.launch();
let pass = 0, fail = 0;
const ok = (c, msg) => { if (c) pass++; else { fail++; console.log("  FAIL", msg); } };

async function boot(ctx) {
  const pg = await ctx.newPage();
  await pg.addInitScript(() => { delete window.webkitSpeechRecognition; delete window.SpeechRecognition; });
  pg.errs = [];
  pg.on("pageerror", (e) => pg.errs.push(e.message));
  await pg.route("**/api/chat", async (r) => {
    const body = JSON.parse(r.request().postData() || "{}");
    if (body.action !== "say") return r.fulfill({ json: { ok: true } });
    await r.fulfill({ json: { reply: `Answer to: ${body.text}` } });
  });
  return pg;
}
const openChat = async (pg) => { await pg.click(".yc-fab", { force: true }); await pg.waitForSelector(".yc-panel"); };  // force: the bubble floats, so it is never "stable"
async function ask(pg, text) {
  await pg.keyboard.press("x"); // a key anywhere opens the field (and is not typed into it)
  await pg.waitForSelector(".yc-input textarea");
  await pg.locator(".yc-input textarea").fill(text);
  await pg.keyboard.press("Enter");
  await pg.waitForSelector(".ys-me, .yl-stage, .ys-center", { timeout: 5000 });
  await pg.waitForTimeout(1200); // the reply lands and is saved
}
const shot = async (pg, name) => { await pg.waitForTimeout(800); if (SHOTS) await pg.screenshot({ path: `${SHOTS}/${name}.png` }); };

for (const scheme of ["dark", "light"]) {
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, colorScheme: scheme });
  const pg = await boot(ctx);
  await pg.goto(BASE);
  await openChat(pg);
  await ask(pg, "What is Yui?");
  // New chat from the drawer, a second thread
  await pg.click(".ys-chats");
  await pg.waitForSelector(".ys-drawer");
  await pg.click(".ys-newchat");
  await pg.waitForSelector(".ys-drawer", { state: "detached" });
  await ask(pg, "How do I get the app?");
  // reload: both survive
  await pg.reload();
  await openChat(pg);
  await pg.click(".ys-chats");
  await pg.waitForSelector(".ys-drawer");
  const rows = await pg.locator(".ys-chatrow strong").allTextContents();
  ok(rows.length === 2, `${scheme}: two chats after reload, got ${rows.length}`);
  ok(rows[0].startsWith("How do I") && rows[1].startsWith("What is Yui"), `${scheme}: newest first, titled from the first ask: ${rows}`);
  ok((await pg.locator(".ys-chat-last").first().textContent()).startsWith("Answer to"), `${scheme}: last line shows`);
  await shot(pg, `site-153-list-${scheme}`);
  // keyboard: the New chat button has focus, Tab reaches a row
  ok(await pg.evaluate(() => document.activeElement?.classList.contains("ys-newchat")), `${scheme}: New chat has focus`);
  await pg.keyboard.press("Tab"); await pg.keyboard.press("Tab");
  ok(await pg.evaluate(() => document.activeElement?.classList.contains("ys-chatrow")), `${scheme}: a row is keyboard reachable`);
  // open the first chat again
  await pg.locator(".ys-chatrow", { hasText: "What is Yui" }).click();
  await pg.waitForSelector(".ys-record");
  const said = await pg.locator(".ys-record").innerText();
  ok(said.includes("What is Yui?") && said.includes("Answer to: What is Yui?"), `${scheme}: the old chat reopened with its messages`);
  ok(!said.includes("How do I get the app?"), `${scheme}: the other chat is not mixed in`);
  await shot(pg, `site-153-reopened-${scheme}`);
  // Esc closes drawer first
  await pg.keyboard.press("Escape"); // record
  await pg.click(".ys-chats"); await pg.waitForSelector(".ys-drawer");
  await pg.keyboard.press("Escape");
  ok((await pg.locator(".ys-drawer").count()) === 0, `${scheme}: Esc closes the drawer`);
  ok(!(await pg.evaluate(() => document.documentElement.scrollWidth > innerWidth)), `${scheme}: no sideways scroll at 390`);
  ok(pg.errs.length === 0, `${scheme}: no page errors ${pg.errs}`);
  await ctx.close();
}

// migration: the old single key becomes the first thread, and the cap holds at 20
{
  const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
  const pg = await boot(ctx);
  await pg.addInitScript(() => { if (!localStorage.getItem("yui-chats-v2")) localStorage.setItem("yui-chat-v1", JSON.stringify({ msgs: [{ role: "user", content: "old ask", at: 1 }, { role: "assistant", content: "old answer", at: 2 }] })); });
  await pg.goto(BASE);
  await openChat(pg);
  await pg.click(".ys-chats");
  ok((await pg.locator(".ys-chatrow strong").allTextContents()).join() === "old ask", "the old single thread is the first chat");
  await pg.evaluate(() => {
    const s = JSON.parse(localStorage.getItem("yui-chats-v2"));
    s.threads = Array.from({ length: 24 }, (_, i) => ({ id: `t${i}`, at: 1000 + i, msgs: [{ role: "user", content: `ask ${i}`, at: 1000 + i }] }));
    s.cur = "t23";
    localStorage.setItem("yui-chats-v2", JSON.stringify(s));
  });
  await pg.reload(); await openChat(pg);
  await pg.click(".ys-chats"); await pg.click(".ys-newchat");
  await pg.keyboard.press("x"); await pg.waitForSelector(".yc-input textarea"); await pg.locator(".yc-input textarea").fill("one more"); await pg.keyboard.press("Enter");
  await pg.waitForTimeout(900);
  const n = await pg.evaluate(() => JSON.parse(localStorage.getItem("yui-chats-v2")).threads.length);
  ok(n <= 20, `cap at 20, got ${n}`);
  await ctx.close();
}
await b.close();
console.log(`${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
