// YUI-248 e2e: notifications on the web. The manifest and the service worker (real, in Chromium), the Settings
// switch on the demo relay (what the page told yui-push is read from the demo's wire), and the worker's own
// behavior fed real PushEvents: a reply shows, the open thread suppresses it, a read elsewhere clears it, a click
// opens the thread. The browser's push service is stubbed (PushManager.subscribe), the rest is the real thing.
//   npx next build && npx next start -p 3248 &   then   node e2e/web/push.test.mjs
// BASE overrides the origin, PLAYWRIGHT the Playwright module, SHOTS the folder for the shots (skipped when unset).
import { createRequire } from "node:module";
import { mkdirSync } from "node:fs";
const { chromium } = createRequire(import.meta.url)(process.env.PLAYWRIGHT || "playwright");
const BASE = process.env.BASE || "http://localhost:3248";
const SHOTS = process.env.SHOTS || "";
if (SHOTS) mkdirSync(SHOTS, { recursive: true });
// New headless (the full Chromium): the headless shell answers every Notification permission with denied.
const b = await chromium.launch({ channel: "chromium" });
let pass = 0, fail = 0;
const ok = (c, msg) => { if (c) { pass++; console.log("  ok  ", msg); } else { fail++; console.log("  FAIL", msg); } };
const PHONE = { width: 390, height: 844 }, DESK = { width: 1280, height: 800 };
const AGENT = "11111111-1111-4111-8111-111111111111";
const OTHER = "22222222-2222-4222-8222-222222222222";
const ENDPOINT = "https://fcm.example.test/wpush/abc123";

// A push service we do not have in a test box: subscribe() hands back a fixed subscription, kept per page.
const STUB = `(() => {
  let sub = null;
  const make = () => ({ endpoint: ${JSON.stringify(ENDPOINT)}, toJSON() { return { endpoint: this.endpoint, keys: { p256dh: "BNcRdreALRFXTkOOUHK1EtK2wtaz5Ry4YfYCA_0QTpQtUbVlUls0VJXg7A8u-Ts1XbjhazAkj7I99e8QcYP7DkM", auth: "tBHItJI5svbpez7KI4CCXg" } }; }, unsubscribe: async () => { sub = null; return true; } });
  if (window.PushManager) {
    PushManager.prototype.subscribe = async function () { sub = make(); return sub; };
    PushManager.prototype.getSubscription = async function () { return sub; };
  }
})();`;

async function open(vp, theme, { grant = true, path = "/web/agent/demo-penny", extra = "" } = {}) {
  const ctx = await b.newContext({ viewport: vp, deviceScaleFactor: 2, serviceWorkers: "allow" });
  if (grant) await ctx.grantPermissions(["notifications"], { origin: BASE });
  await ctx.addInitScript(STUB);
  const pg = await ctx.newPage();
  pg.errs = [];
  pg.on("pageerror", (e) => pg.errs.push(e.message));
  await pg.goto(`${BASE}${path}?demo=penny&theme=${theme}${extra}`);
  await pg.waitForSelector("[data-testid=stage-record], [data-testid=key-ask]");
  await pg.waitForTimeout(500);
  pg.ctx = ctx;
  return pg;
}
const shot = async (pg, name) => { if (SHOTS) await pg.screenshot({ path: `${SHOTS}/${name}.png` }); };
async function settings(pg, vp) {
  if (vp.width < 760 && !(await pg.locator(".wb-side.open").count())) {
    const stage = pg.locator(".wb-stage-menu:visible");
    await ((await stage.count()) ? stage : pg.locator(".wb-menu:visible")).first().click();
    await pg.waitForTimeout(450);
  }
  await pg.getByTestId("open-settings").click();
  await pg.getByTestId("settings").waitFor();
  await pg.waitForTimeout(350);
}
const pushWire = (pg) => pg.evaluate(() => window.yuiWebDemo.pushCalls.map((c) => ({ ...c })));
const worker = async (pg) => {
  for (let i = 0; i < 40; i++) { const w = pg.ctx.serviceWorkers().find((x) => x.url().endsWith("/web-sw.js")); if (w) return w; await pg.waitForTimeout(150); }
  return null;
};
const send = (w, msg) => w.evaluate(async (m) => { self.dispatchEvent(Object.assign(new PushEvent("push", { data: JSON.stringify(m) }))); await new Promise((r) => setTimeout(r, 400)); }, msg);
const shown = (pg) => pg.evaluate(async () => (await (await navigator.serviceWorker.getRegistration("/web")).getNotifications()).map((n) => ({ title: n.title, body: n.body, tag: n.tag, url: n.data?.url })));

console.log("manifest and install");
{
  const pg = await open(DESK, "light", { path: "/web" });
  const href = await pg.locator('link[rel=manifest]').getAttribute("href");
  ok(href === "/web/manifest.webmanifest", "the page links the manifest");
  const m = await (await pg.request.get(`${BASE}${href}`)).json();
  ok(m.name === "Yui" && m.start_url === "/web" && m.scope === "/web" && m.display === "standalone", "manifest: Yui, /web, standalone, scope /web");
  const sizes = [];
  for (const i of m.icons) { const r = await pg.request.get(`${BASE}${i.src}`); sizes.push(r.status()); }
  ok(sizes.every((s) => s === 200), "manifest: every icon is served");
  ok(m.icons.some((i) => i.sizes === "192x192") && m.icons.some((i) => i.sizes === "512x512" && i.purpose === "maskable"), "manifest: 192 and 512 icons, one maskable");
  await pg.waitForFunction(async () => !!(await navigator.serviceWorker.getRegistration("/web"))?.active, null, { timeout: 8000 });
  ok(true, "the service worker is registered and active at /web");
  const scope = await pg.evaluate(async () => (await navigator.serviceWorker.getRegistration("/web"))?.scope);
  ok(scope === `${BASE}/web`, `the worker's scope is /web, so the install's start page is under it (${scope})`);
  const sw = await pg.request.get(`${BASE}/web-sw.js`);
  ok(sw.status() === 200 && /javascript/.test(sw.headers()["content-type"] || ""), "sw.js is served as javascript");
  ok(pg.errs.length === 0, `no page errors (${pg.errs.join(" | ")})`);
  await pg.ctx.close();
}

console.log("the Settings switch, desktop and phone, light and dark");
for (const [vp, vpName] of [[DESK, "desktop"], [PHONE, "phone"]]) {
  for (const theme of ["light", "dark"]) {
    const pg = await open(vp, theme);
    await settings(pg, vp);
    const card = pg.locator('[data-section="notifications"]');
    await card.scrollIntoViewIfNeeded();
    ok(await card.count() === 1, `${vpName} ${theme}: the Notifications card is there`);
    const sw = pg.getByTestId("push-switch").getByRole("switch");
    ok((await sw.getAttribute("aria-checked")) === "false", `${vpName} ${theme}: off at first`);
    const box = await sw.boundingBox();
    ok(box.width >= 40 && box.height >= 24, `${vpName} ${theme}: the switch is a touch target (${Math.round(box.width)}x${Math.round(box.height)})`);
    await shot(pg, `notif-${vpName}-${theme}-off`);
    await sw.click();
    await pg.waitForFunction(() => document.querySelector('[data-testid=push-switch] [role=switch]')?.getAttribute("aria-checked") === "true", null, { timeout: 8000 });
    const wire = await pushWire(pg);
    const reg = wire.find((c) => c.action === "register_web");
    ok(reg && reg.endpoint === ENDPOINT && reg.keys.auth && reg.keys.p256dh && /on /.test(reg.name || "") , `${vpName} ${theme}: on tells yui-push the subscription (${reg?.name})`);
    await pg.waitForTimeout(400);
    ok((await pushWire(pg)).some((c) => c.action === "presence" && c.active === true && c.endpoint === ENDPOINT && c.agent_id === "demo-penny"), `${vpName} ${theme}: the open thread is reported to yui-push (no double buzz)`);
    await shot(pg, `notif-${vpName}-${theme}-on`);
    if (vpName === "desktop" && theme === "light") {
      await pg.reload();
      await pg.waitForSelector("[data-testid=stage-record], [data-testid=key-ask]");
      await pg.waitForTimeout(600);
      await settings(pg, vp);
      ok((await pg.getByTestId("push-switch").getByRole("switch").getAttribute("aria-checked")) === "true", "still on after a reload (the demo keeps nothing, the browser keeps the subscription)");
      await pg.getByTestId("push-switch").getByRole("switch").click();
      await pg.waitForFunction(() => document.querySelector('[data-testid=push-switch] [role=switch]')?.getAttribute("aria-checked") === "false", null, { timeout: 8000 });
      ok((await pushWire(pg)).some((c) => c.action === "unregister_web" && c.endpoint === ENDPOINT), "off tells yui-push to forget this browser");
    }
    ok(pg.errs.length === 0, `${vpName} ${theme}: no page errors (${pg.errs.join(" | ")})`);
    await pg.ctx.close();
  }
}

console.log("a no from the browser");
{
  const pg = await open(PHONE, "light", { grant: false });
  await pg.evaluate(() => { Notification.requestPermission = async () => "denied"; });
  await settings(pg, PHONE);
  await pg.getByTestId("push-switch").getByRole("switch").click();
  await pg.getByTestId("push-error").waitFor();
  ok(/said no/.test(await pg.getByTestId("push-error").innerText()), "denied: says why, in plain words");
  ok((await pg.getByTestId("push-switch").getByRole("switch").getAttribute("aria-checked")) === "false", "denied: the switch stays off");
  ok(!(await pushWire(pg)).some((c) => c.action === "register_web"), "denied: nothing was registered");
  await shot(pg, "notif-phone-light-denied");
  await pg.ctx.close();
}

console.log("the service worker, fed real push events");
{
  const pg = await open(DESK, "light", { path: `/web/agent/${OTHER}` });
  const w = await worker(pg);
  ok(!!w, "the worker is running");
  const reply = { kind: "reply", title: "Penny", body: "Dinner is at 7", agent_id: AGENT, message_id: "m1", chat: "c1", tag: AGENT, url: `/web/agent/${AGENT}/chat/c1` };
  await send(w, reply);
  let n = await shown(pg);
  ok(n.length === 1 && n[0].title === "Penny" && n[0].body === "Dinner is at 7" && n[0].tag === AGENT, "a reply shows with the agent's name and its words");
  ok(n[0].url === `/web/agent/${AGENT}/chat/c1`, "the notification carries the thread to open");
  await send(w, { ...reply, body: "Dinner moved to 8", message_id: "m2" });
  n = await shown(pg);
  ok(n.length === 1 && n[0].body === "Dinner moved to 8", "a newer reply from the same agent replaces the older one");
  await send(w, { kind: "clear", agent_id: AGENT, tag: AGENT });
  ok((await shown(pg)).length === 0, "a read on another device clears it");
  await send(w, reply);
  ok((await shown(pg)).length === 1, "shown again for the next reply");
  // a click opens the thread in this window
  await w.evaluate(async () => {
    const [note] = await self.registration.getNotifications();
    self.dispatchEvent(new NotificationEvent("notificationclick", { notification: note }));
    await new Promise((r) => setTimeout(r, 900));
  });
  await pg.waitForURL(new RegExp(`/web/agent/${AGENT}/chat/c1`), { timeout: 8000 }).catch(() => {});
  ok(new URL(pg.url()).pathname === `/web/agent/${AGENT}/chat/c1`, `a click opens that agent's chat (${new URL(pg.url()).pathname})`);
  ok((await shown(pg)).length === 0, "the click closes the notification");
  await pg.ctx.close();
}
{
  const pg = await open(DESK, "light", { path: `/web/agent/${AGENT}` });
  const w = await worker(pg);
  await send(w, { kind: "reply", title: "Penny", body: "Dinner is at 7", agent_id: AGENT, message_id: "m1", tag: AGENT, url: `/web/agent/${AGENT}` });
  ok((await shown(pg)).length === 0, "the thread open in front of you shows no notification (no double buzz)");
  await pg.ctx.close();
}

console.log(`${pass} passed, ${fail} failed`);
await b.close();
process.exit(fail ? 1 : 0);
