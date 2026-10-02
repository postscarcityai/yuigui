// YUI-273 e2e: a repeat visit opens on the last chat. The signed in /web keeps the newest rows, the chat list and the
// agent list in IndexedDB (yui-web-cache); the next visit draws them before the backend has answered, then the live
// rows replace them (no duplicates, a changed row as it is now, a gone row gone), and sign out wipes the lot. The
// backend is stubbed in the browser (route), the session is seeded; the demo never writes the cache. Run like signin:
//   npm run build && npx next start -p 3273 &   then   node e2e/web/cache.test.mjs
import { createRequire } from "node:module";
import { readFileSync, mkdirSync } from "node:fs";
const { chromium } = createRequire(import.meta.url)(process.env.PLAYWRIGHT || "playwright");
const BASE = process.env.BASE || "http://localhost:3273";
const SHOTS = process.env.SHOTS || "";
if (SHOTS) mkdirSync(SHOTS, { recursive: true });
let pass = 0, fail = 0;
const ok = (c, msg) => { if (c) { pass++; console.log("  ok  ", msg); } else { fail++; console.log("  FAIL", msg); } };
const penny = JSON.parse(readFileSync(new URL("../../app/web/fixtures/penny.json", import.meta.url), "utf8"));
const CORS = { "access-control-allow-origin": "*", "access-control-allow-headers": "*", "access-control-allow-methods": "GET, POST, PATCH, OPTIONS" };
const NOW = Date.now();
const row = (i, body, extra = {}) => ({ id: `00000000-0000-4000-8000-${String(i).padStart(12, "0")}`, sender: i % 2 ? "user" : "agent", body, kind: "text", meta: {}, created_at: new Date(NOW - (20 - i) * 60000).toISOString(), delivered_at: null, handled_at: null, reaction: null, doing: null, ...extra });
const chat = { id: "10000000-0000-4000-8000-000000000001", title: null, is_first: true, last_at: new Date(NOW).toISOString(), seen_at: new Date(NOW).toISOString(), unread: false, last_body: "x", last_sender: "agent", last_message_at: new Date(NOW).toISOString() };

function backend() {
  const s = { rows: [], delay: 0, answered: 0, signOuts: 0 };
  s.handle = async (route) => {
    const req = route.request();
    if (req.method() === "OPTIONS") return route.fulfill({ status: 204, headers: CORS });
    const u = new URL(req.url());
    const fn = u.pathname.split("/").pop();
    const json = (body) => route.fulfill({ status: 200, headers: { ...CORS, "content-type": "application/json" }, body: JSON.stringify(body) });
    if (fn === "yui-auth") {
      const body = req.postDataJSON();
      if (body.grant_type === "sign_out") { s.signOuts++; return json({ ok: true }); }
      return json({ access_token: "at1", token_type: "bearer", expires_in: 3600, refresh_token: "rt1", user: { id: "u1", email: "chris@example.com" } });
    }
    if (fn === "yui-agents") return json({ agents: penny.agents, crew: [], first_name: "Chris" });
    if (fn === "yui-account") return json({ user: { id: "u1", email: "chris@example.com" }, look: null });
    if (fn === "yui_messages") {
      if (u.searchParams.get("created_at")) return json([]);
      const mine = s.rows.slice();
      if (s.delay) await new Promise((r) => setTimeout(r, s.delay));
      s.answered++;
      return json(mine.slice().reverse());
    }
    if (fn === "yui_chat_list") return json([chat]);
    return json(u.pathname.includes("/rest/") ? [] : {});
  };
  return s;
}

const b = await chromium.launch();
const kept = (pg) => pg.evaluate(() => new Promise((res) => {
  const r = indexedDB.open("yui-web-cache", 1);
  r.onupgradeneeded = () => { r.result.close(); res(null); };
  r.onsuccess = () => {
    const db = r.result, out = {};
    const names = ["rows", "chats", "agents"];
    let n = 0;
    for (const s of names) { const g = db.transaction(s).objectStore(s).getAll(); g.onsuccess = () => { out[s] = g.result.length; if (++n === names.length) { db.close(); res(out); } }; }
  };
}));

for (const [name, vp] of [["390", { width: 390, height: 844 }], ["desktop", { width: 1280, height: 800 }]]) {
  for (const theme of ["light", "dark"]) {
    const tag = `${theme} ${name}`;
    const srv = backend();
    const ctx = await b.newContext({ viewport: vp, colorScheme: theme, deviceScaleFactor: vp.width < 600 ? 2 : 1 });
    await ctx.addInitScript(() => {
      if (window !== window.top || !/^https?:$/.test(location.protocol)) return; // about:blank and Apple's frames have no IndexedDB
      const r = indexedDB.open("yui-web", 1);
      r.onupgradeneeded = () => r.result.createObjectStore("session");
      r.onsuccess = () => {
        const db = r.result;
        if (!db.objectStoreNames.contains("session")) return db.close();
        const g = db.transaction("session").objectStore("session").get("session");
        g.onsuccess = () => { if (!g.result && !sessionStorage.getItem("__signedout")) db.transaction("session", "readwrite").objectStore("session").put({ refresh: "rt0", user: { id: "u1", email: "chris@example.com" }, at: Date.now() }, "session"); };
      };
    });
    await ctx.route("**/appleid.cdn-apple.com/**", (r) => r.fulfill({ status: 200, contentType: "text/javascript", body: "window.AppleID={auth:{init(){},signIn(){return Promise.reject({error:'user_cancelled_authorize'})}}}" }));
    await ctx.route("**/functions/v1/**", srv.handle);
    await ctx.route("**/rest/v1/**", srv.handle);
    const errs = [];
    ctx.on("page", (p) => { p.on("pageerror", (e) => errs.push(`${e} @${p.url().slice(0, 60)} ${(e.stack || "").split("\n").slice(1, 3).join("")}`)); });
    const url = `${BASE}/web/agent/demo-penny?view=chat&theme=${theme}`;
    const shot = async (pg, n) => { if (SHOTS) await pg.screenshot({ path: `${SHOTS}/web-cache-${n}-${name}-${theme}.png` }); };

    // First visit: nothing kept, the rows come from the backend, and then they are kept.
    srv.rows = [row(1, "Can you plan my running week?"), row(2, "Three runs fit. Thursday is dry."), row(3, "Move the long one to Sunday."), row(4, "Sunday it is. Long run, 10k.")];
    const pg = await ctx.newPage();
    await pg.goto(url);
    await pg.waitForSelector(".wb-item");
    ok(await pg.getByText("Sunday it is. Long run, 10k.").first().isVisible(), `${tag}: first visit draws the live rows`);
    let k = null;
    for (let i = 0; i < 25 && !(k?.rows && k?.chats && k?.agents); i++) { await pg.waitForTimeout(200); k = await kept(pg); }
    ok(k?.rows === 1 && k?.chats === 1 && k?.agents === 1, `${tag}: the rows, the chat list and the agent list are kept (${JSON.stringify(k)})`);
    await pg.close();

    // Repeat visit: the backend is slow (2.5 s); the kept rows are on the screen long before.
    srv.rows = [row(1, "Can you plan my running week?"), row(3, "Move the long one to Sunday.", { handled_at: new Date(NOW).toISOString() }), row(4, "Sunday it is. Long run, 10k."), row(5, "Booked. Reminder set for Sunday 8 am.")];
    srv.delay = 2500; srv.answered = 0;
    const p2 = await ctx.newPage();
    const t0 = Date.now();
    await p2.goto(url);
    await p2.getByText("Sunday it is. Long run, 10k.").first().waitFor({ timeout: 2400 });
    const drawn = Date.now() - t0;
    ok(srv.answered === 0, `${tag}: the kept rows are drawn before the backend has answered (${drawn} ms)`);
    ok(drawn < 2400 && await p2.getByText("Three runs fit. Thursday is dry.").first().isVisible(), `${tag}: the kept rows include the older ones`);
    ok(!(await p2.getByText("Booked. Reminder set for Sunday 8 am.").count()), `${tag}: the new row is not there yet`);
    await shot(p2, "kept");

    // Live lands: replaced in one pass.
    await p2.getByText("Booked. Reminder set for Sunday 8 am.").first().waitFor({ timeout: 8000 });
    ok(await p2.getByText("Booked. Reminder set for Sunday 8 am.").first().isVisible(), `${tag}: the live read brings the new row`);
    ok((await p2.getByText("Sunday it is. Long run, 10k.").count()) === 1 && (await p2.getByText("Move the long one to Sunday.").count()) === 1, `${tag}: no row shows twice`);
    ok((await p2.getByText("Three runs fit. Thursday is dry.").count()) === 0, `${tag}: a row that is gone on the server is gone here`);
    await shot(p2, "live");
    srv.delay = 0;

    // Sign out wipes it, here and for the next visit.
    const menu = p2.getByRole("button", { name: "Your agents" });
    if (await menu.isVisible()) { await menu.click(); await p2.waitForTimeout(450); }
    await p2.getByRole("button", { name: "Sign out" }).click();
    await p2.getByRole("button", { name: "Sign in with Apple" }).waitFor();
    await p2.waitForTimeout(400);
    k = await kept(p2);
    ok(k && k.rows === 0 && k.chats === 0 && k.agents === 0, `${tag}: sign out empties the cache (${JSON.stringify(k)})`);
    await p2.evaluate(() => sessionStorage.setItem("__signedout", "1")); // the seed must not sign this tab in again
    await p2.reload({ waitUntil: "networkidle" });
    k = await kept(p2);
    ok(await p2.getByRole("button", { name: "Sign in with Apple" }).isVisible() && (!k || k.rows === 0), `${tag}: a signed out visit finds nothing kept`);
    ok(errs.length === 0, `${tag}: no page errors (${errs.join("|").slice(0, 700)})`);
    await ctx.close();
  }
}

// The demo never writes a cache.
{
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 } });
  const pg = await ctx.newPage();
  await pg.goto(`${BASE}/web/agent/demo-penny?demo=penny&view=chat`);
  await pg.waitForSelector(".wb-item");
  await pg.waitForTimeout(800);
  const dbs = await pg.evaluate(async () => (indexedDB.databases ? (await indexedDB.databases()).map((d) => d.name) : []));
  ok(!dbs.includes("yui-web-cache"), `demo: no cache is written (${dbs.join(",")})`);
  await ctx.close();
}

await b.close();
console.log(`${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
