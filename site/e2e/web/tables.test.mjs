// YUI-296 e2e: agent tables work on /web the way they do on the phone. The coach's workout table (YUI-89) is drawn
// from a reply, a row is ticked, the page is reloaded and the row is still ticked: the rows live in IndexedDB
// (yui-web-tables), per person and agent, and the reply that drew them is filed once so it cannot write over the
// tick. A tick stays quiet; a refused line is told to the agent once; Send hands over the rows and shows its echo.
// The backend is stubbed in the browser (route), the session is seeded. Prod build only (CSP):
//   npm run build && npx next start -p 3296 &   then   node e2e/web/tables.test.mjs
import { createRequire } from "node:module";
import { readFileSync, mkdirSync } from "node:fs";
const { chromium } = createRequire(import.meta.url)(process.env.PLAYWRIGHT || "playwright");
const BASE = process.env.BASE || "http://localhost:3296";
const SHOTS = process.env.SHOTS || "";
if (SHOTS) mkdirSync(SHOTS, { recursive: true });
let pass = 0, fail = 0;
const ok = (c, msg) => { if (c) { pass++; console.log("  ok  ", msg); } else { fail++; console.log("  FAIL", msg); } };
const penny = JSON.parse(readFileSync(new URL("../../app/web/fixtures/penny.json", import.meta.url), "utf8"));
const CORS = { "access-control-allow-origin": "*", "access-control-allow-headers": "*", "access-control-allow-methods": "GET, POST, PATCH, OPTIONS" };
const NOW = Date.now();
const row = (i, body, extra = {}) => ({ id: `00000000-0000-4000-8000-${String(i).padStart(12, "0")}`, sender: i % 2 ? "user" : "agent", body, kind: "text", meta: {}, created_at: new Date(NOW - (20 - i) * 60000).toISOString(), delivered_at: null, handled_at: null, reaction: null, doing: null, ...extra });
const chat = { id: "10000000-0000-4000-8000-000000000001", title: null, is_first: true, last_at: new Date(NOW).toISOString(), seen_at: new Date(NOW).toISOString(), unread: false, last_body: "x", last_sender: "agent", last_message_at: new Date(NOW).toISOString() };

// The Arnold workouts reply from YUI-89 (YuiUITests/AgentTablesTests.swift).
const WORKOUTS = `table create workouts Day:date Name:text Focus:text Done:bool
put workouts w1 Day=today-4 Name="Legs A" Focus=Legs +Done
put workouts w3 Day=today Name="Legs B" Focus=Legs
table create session Slot:number Move:text Sets:number Reps:number Done:bool
put session 1 Slot=1 Move="Goblet squat" Sets=3 Reps=8
put session 2 Slot=2 Move="Split squat" Sets=3 Reps=10
put session 3 Slot=3 Move="Romanian deadlift" Sets=3 Reps=8
query workouts sort=Day cols=Day|Name|Focus|Done as table "This week"
query session sort=Slot cols=Move|Sets|Reps|Done as list check=Done "Today: Legs B"
query session sort=Slot cols=Move|Sets as send "Share the session"`;
const fence = (yl) => "```yui\n" + yl + "\n```";

function backend() {
  const s = { rows: [], posts: [] };
  s.handle = async (route) => {
    const req = route.request();
    if (req.method() === "OPTIONS") return route.fulfill({ status: 204, headers: CORS });
    const u = new URL(req.url());
    const fn = u.pathname.split("/").pop();
    const json = (body) => route.fulfill({ status: 200, headers: { ...CORS, "content-type": "application/json" }, body: JSON.stringify(body) });
    if (req.method() === "POST" && fn === "yui_messages") { try { s.posts.push(req.postDataJSON()); } catch { /* not json */ } return json([]); }
    if (fn === "yui-auth") return json({ access_token: "at1", token_type: "bearer", expires_in: 3600, refresh_token: "rt1", user: { id: "u1", email: "chris@example.com" } });
    if (fn === "yui-agents") return json({ agents: penny.agents, crew: [], first_name: "Chris" });
    if (fn === "yui-account") return json({ user: { id: "u1", email: "chris@example.com" }, look: null });
    if (fn === "yui_messages") return u.searchParams.get("created_at") ? json([]) : json(s.rows.slice().reverse());
    if (fn === "yui_chat_list") return json([chat]);
    if (fn === "yui_threads") return json([]);
    return json(u.pathname.includes("/rest/") ? [] : {});
  };
  return s;
}
const bodies = (s) => s.posts.flat().map((p) => String(p?.body ?? ""));

const kept = (pg) => pg.evaluate(() => new Promise((res) => {
  const r = indexedDB.open("yui-web-tables", 1);
  r.onupgradeneeded = () => { r.result.close(); res(null); };
  r.onsuccess = () => { const db = r.result; const g = db.transaction("agents").objectStore("agents").getAll(); g.onsuccess = () => { db.close(); res(g.result); }; };
}));

const b = await chromium.launch();
for (const [name, vp] of [["390", { width: 390, height: 844 }], ["desktop", { width: 1280, height: 800 }]]) {
  for (const theme of ["light", "dark"]) {
    const tag = `${theme} ${name}`;
    const srv = backend();
    const ctx = await b.newContext({ viewport: vp, colorScheme: theme, deviceScaleFactor: vp.width < 600 ? 2 : 1 });
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
    ctx.on("page", (p) => { p.on("pageerror", (e) => errs.push(`${e} @${p.url().slice(0, 60)}`)); });
    const url = `${BASE}/web/agent/demo-penny?view=chat&theme=${theme}`;
    const shot = async (pg, n) => { if (SHOTS) await pg.screenshot({ path: `${SHOTS}/web-tables-${n}-${name}-${theme}.png` }); };
    const listRow = (pg, text) => pg.locator(".yl-list li", { hasText: text }).first();

    srv.rows = [row(1, "Build me a workout week."), row(2, fence(WORKOUTS))];
    const pg = await ctx.newPage();
    await pg.goto(url);
    await pg.locator(".yl-list li", { hasText: "Goblet squat" }).first().waitFor({ timeout: 10000 });
    ok(await pg.getByText("Legs A").first().isVisible(), `${tag}: the table view draws the rows the reply put`);
    ok((await pg.locator(".yl-list li.done").count()) === 0, `${tag}: nothing is ticked yet`);

    // Tick a row, and it goes nowhere: the phone writes it and the agent is not asked.
    await listRow(pg, "Split squat").click();
    await pg.locator(".yl-list li.done", { hasText: "Split squat" }).waitFor({ timeout: 4000 });
    ok(true, `${tag}: a tapped row is ticked`);
    await pg.waitForTimeout(800);
    ok(!bodies(srv).some((x) => x.includes("op=row")), `${tag}: a tick stays on the page, no [yui] line goes up (${bodies(srv).length} posts)`);
    let k = null;
    for (let i = 0; i < 25 && !k?.length; i++) { await pg.waitForTimeout(200); k = await kept(pg); }
    ok(k?.length === 1 && k[0].user === "u1" && k[0].store.tables.session.rows["2"].Done === true, `${tag}: the tick is in IndexedDB under the person (${JSON.stringify(k?.map((x) => x.user))})`);
    await shot(pg, "before-reload");

    // Reload: the same reply is drawn again, and the tick is still there.
    await pg.reload();
    await pg.locator(".yl-list li", { hasText: "Goblet squat" }).first().waitFor({ timeout: 10000 });
    await pg.waitForTimeout(500);
    ok(await listRow(pg, "Split squat").evaluate((el) => el.classList.contains("done")), `${tag}: after a reload the ticked row is still ticked`);
    ok((await pg.locator(".yl-list li.done").count()) === 1, `${tag}: and only that one`);
    ok(await pg.getByText("3 rows · session · on this phone").first().isVisible().catch(() => false) || await pg.getByText(/3 rows · session/).first().isVisible(), `${tag}: the view's footer counts the stored rows`);
    await shot(pg, "after-reload");

    // Un-tick keeps too.
    await listRow(pg, "Split squat").click();
    await pg.waitForTimeout(500);
    await pg.reload();
    await pg.locator(".yl-list li", { hasText: "Goblet squat" }).first().waitFor({ timeout: 10000 });
    await pg.waitForTimeout(400);
    ok((await pg.locator(".yl-list li.done").count()) === 0, `${tag}: an un-tick is kept too`);

    // Send hands the rows to the agent, once the person taps, with an echo they can see.
    const send = pg.getByRole("button", { name: "Send", exact: true }).first();
    await send.click();
    await pg.waitForTimeout(800);
    ok(bodies(srv).some((x) => x.startsWith("[yui] ") && x.includes("op=query") && x.includes("table=session") && x.includes("count=3")), `${tag}: Send goes up as the query event with the rows`);
    ok(await pg.getByText("Sent 3 rows from session").first().isVisible(), `${tag}: the person sees what went`);

    // A refused line is told to the agent once after a new reply; history tells nobody.
    srv.posts = [];
    srv.rows = [...srv.rows, row(3, "Swap the third move."), row(4, fence('put session 3 Sets=lots\nput session 3 Move="Hip thrust"\nquery session sort=Slot cols=Move|Sets as table "After the swap"'))];
    await pg.reload();
    await pg.getByText("After the swap").first().waitFor({ timeout: 10000 });
    await pg.waitForTimeout(800);
    ok(bodies(srv).filter((x) => x.includes("op=row") && x.includes("error=")).length === 0, `${tag}: a refusal in a reply loaded from history tells nobody`);
    ok(await pg.getByText("Hip thrust").first().isVisible(), `${tag}: the good line of that reply landed, the swap shows in the view`);
    ok(!errs.length, `${tag}: no page errors${errs.length ? " " + errs[0] : ""}`);
    await ctx.close();
  }
}
await b.close();
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
