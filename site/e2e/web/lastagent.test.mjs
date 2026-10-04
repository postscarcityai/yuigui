// YUI-281 e2e: a bare /web opens the agent this browser had open last. The id sits beside the session (IndexedDB
// yui-web), is read before the agent list answers, so that agent's rows leave at once; an agent that is gone from the
// list opens the default with no flash of the wrong thread; sign out clears it. The backend is stubbed in the browser
// (route), the session is seeded. Run like cache.test.mjs:
//   npm run build && npx next start -p 3273 &   then   node e2e/web/lastagent.test.mjs     (SHOTS=<dir> for 390 px shots)
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
const SAY = { "demo-yui": "Yui here. Three runs fit this week.", "demo-basil": "Basil here. Dinner is the lentil soup." };
const row = (agent) => ({ id: `00000000-0000-4000-8000-${agent === "demo-yui" ? "000000000001" : "000000000002"}`, sender: "agent", body: SAY[agent], kind: "text", meta: {}, created_at: new Date(NOW - 60000).toISOString(), delivered_at: null, handled_at: null, reaction: null, doing: null });
const chat = { id: "10000000-0000-4000-8000-000000000001", title: null, is_first: true, last_at: new Date(NOW).toISOString(), seen_at: new Date(NOW).toISOString(), unread: false, last_body: "x", last_sender: "agent", last_message_at: new Date(NOW).toISOString() };

function backend() {
  const s = { agentsDelay: 0, agentsAnswered: false, rowsBeforeList: [], signOuts: 0 };
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
    if (fn === "yui-agents") {
      if (s.agentsDelay) await new Promise((r) => setTimeout(r, s.agentsDelay));
      s.agentsAnswered = true;
      return json({ agents: penny.agents, crew: [], first_name: "Chris" });
    }
    if (fn === "yui-account") return json({ user: { id: "u1", email: "chris@example.com" }, look: null });
    if (fn === "yui_messages") {
      if (u.searchParams.get("created_at")) return json([]);
      const agent = (u.searchParams.get("agent_id") || "").replace("eq.", "");
      if (!s.agentsAnswered) s.rowsBeforeList.push(agent);
      return json(SAY[agent] ? [row(agent)] : []);
    }
    if (fn === "yui_chat_list") return json([chat]);
    if (fn === "yui_threads") return json([]);
    return json(u.pathname.includes("/rest/") ? [] : {});
  };
  return s;
}

const b = await chromium.launch();
const record = (pg) => pg.evaluate(() => new Promise((res) => {
  const r = indexedDB.open("yui-web", 1);
  r.onupgradeneeded = () => { r.result.close(); res(null); };
  r.onsuccess = () => { const db = r.result; const g = db.transaction("session").objectStore("session").get("session"); g.onsuccess = () => { db.close(); res(g.result || null); }; };
}));
const putLast = (pg, id) => pg.evaluate((last) => new Promise((res) => {
  const r = indexedDB.open("yui-web", 1);
  r.onsuccess = () => { const db = r.result; const tx = db.transaction("session", "readwrite"); const st = tx.objectStore("session"); const g = st.get("session"); g.onsuccess = () => { st.put({ ...g.result, lastAgent: last }, "session"); }; tx.oncomplete = () => { db.close(); res(); }; };
}), id);

for (const theme of ["light", "dark"]) {
  const tag = `${theme} 390`;
  const srv = backend();
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, colorScheme: theme, deviceScaleFactor: 2 });
  await ctx.addInitScript(() => {
    if (window !== window.top || !/^https?:$/.test(location.protocol)) return;
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
  ctx.on("page", (p) => { p.on("pageerror", (e) => errs.push(String(e))); });
  const shot = async (pg, n) => { if (SHOTS) await pg.screenshot({ path: `${SHOTS}/web-lastagent-${n}-${theme}.png` }); };
  const bare = `${BASE}/web?view=chat&theme=${theme}`;

  // Nothing kept: a bare /web opens the default agent (today's path) and then keeps it.
  const p1 = await ctx.newPage();
  await p1.goto(bare);
  await p1.getByText(SAY["demo-yui"]).first().waitFor({ timeout: 8000 });
  let rec = null;
  for (let i = 0; i < 25 && !rec?.lastAgent; i++) { await p1.waitForTimeout(200); rec = await record(p1); }
  ok(rec?.lastAgent === "demo-yui", `${tag}: the default agent is kept as last open (${rec?.lastAgent})`);
  ok(rec?.refresh === "rt1", `${tag}: the session's refresh token is intact (${rec?.refresh})`);

  // Open another agent from the address: it becomes the last open one.
  await p1.goto(`${BASE}/web/agent/demo-basil?view=chat&theme=${theme}`);
  await p1.getByText(SAY["demo-basil"]).first().waitFor({ timeout: 8000 });
  for (let i = 0; i < 25 && (await record(p1))?.lastAgent !== "demo-basil"; i++) await p1.waitForTimeout(200);
  ok((await record(p1))?.lastAgent === "demo-basil", `${tag}: opening Basil keeps Basil`);
  await p1.close();

  // A bare /web now: Basil's rows leave before the agent list answers, and Basil is what is drawn (no Yui first).
  srv.agentsDelay = 2000; srv.agentsAnswered = false; srv.rowsBeforeList = [];
  const p2 = await ctx.newPage();
  await p2.goto(bare);
  await p2.getByText(SAY["demo-basil"]).first().waitFor({ timeout: 8000 });
  ok(srv.rowsBeforeList.includes("demo-basil"), `${tag}: Basil's rows were asked before the agent list answered (${JSON.stringify(srv.rowsBeforeList)})`);
  ok(!srv.agentsAnswered, `${tag}: and drawn while the list was still on its way`);
  ok(!(await p2.getByText(SAY["demo-yui"]).count()), `${tag}: Yui's thread never showed`);
  await shot(p2, "bare-basil");
  await p2.close();

  // The kept agent is gone from the live list: the default opens, no flash of the wrong thread.
  srv.agentsDelay = 0;
  const p3 = await ctx.newPage();
  await p3.goto(`${BASE}/web?view=chat&theme=${theme}`);
  await putLast(p3, "ghost");
  srv.agentsAnswered = false; srv.rowsBeforeList = [];
  await p3.reload();
  await p3.getByText(SAY["demo-yui"]).first().waitFor({ timeout: 8000 });
  ok(!(await p3.getByText(SAY["demo-basil"]).count()), `${tag}: a gone agent opens the default, nothing else drawn`);
  for (let i = 0; i < 25 && (await record(p3))?.lastAgent !== "demo-yui"; i++) await p3.waitForTimeout(200);
  ok((await record(p3))?.lastAgent === "demo-yui", `${tag}: the default replaces the gone id`);
  await shot(p3, "gone-default");

  // Sign out clears it.
  const menu = p3.getByRole("button", { name: "Your agents" });
  if (await menu.isVisible()) { await menu.click(); await p3.waitForTimeout(450); }
  await p3.getByRole("button", { name: "Sign out" }).click();
  await p3.getByRole("button", { name: "Sign in with Apple" }).waitFor();
  await p3.waitForTimeout(400);
  ok((await record(p3)) === null || (await record(p3)) === undefined, `${tag}: sign out clears the record, last agent included`);
  ok(errs.length === 0, `${tag}: no page errors (${errs.join("|").slice(0, 400)})`);
  await ctx.close();
}
await b.close();
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
