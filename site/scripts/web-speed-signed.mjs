// YUI-273: time the SIGNED IN /web on a phone, cold visit and repeat visit. Same rig as web-speed.mjs (390 wide,
// 4x CPU throttle, slow 4G, one headless Chrome, a prod build), but the backend is a stub in the browser (route):
// the page is signed in with a stored session, and every edge function and table read is answered by a local
// HTTPS server after a fixed delay that stands in for the real network (a throttle does not reach localhost):
// 450 ms for the first call (DNS, TCP, TLS, request) and 250 ms for each after it (one round trip plus the server).
// The supabase host is mapped to that server (a host resolver rule, a throwaway certificate), not stubbed with
// page.route: Playwright turns the HTTP cache off while a route is on, and a repeat visit needs it.
//   cd site && npm run build && npx next start -p 3273 &   then   node scripts/web-speed-signed.mjs [runs]
// BASE overrides the origin, PLAYWRIGHT the module. Prints one JSON object: medians over the runs.
//   cold    a new browser profile: no HTTP cache, nothing stored but the session
//   repeat  the same profile a moment later: the HTTP cache is warm (Next's chunks are immutable), the page has
//           been open once, so whatever the page keeps locally is there
import { createRequire } from "node:module";
import { readFileSync, mkdtempSync } from "node:fs";
import { createServer } from "node:https";
import { execFileSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";
const { chromium } = createRequire(import.meta.url)(process.env.PLAYWRIGHT || "playwright");
const BASE = process.env.BASE || "http://localhost:3273";
const RUNS = Number(process.argv[2] || 3);
const FIRST_MS = Number(process.env.FIRST_MS || 450), NEXT_MS = Number(process.env.NEXT_MS || 250);
const URL_ = `${BASE}/web/agent/demo-penny?view=chat&theme=dark`;
const med = (a) => a.slice().sort((x, y) => x - y)[Math.floor(a.length / 2)];
const penny = JSON.parse(readFileSync(new URL("../app/web/fixtures/penny.json", import.meta.url), "utf8"));
const CORS = { "access-control-allow-origin": "*", "access-control-allow-headers": "*", "access-control-allow-methods": "GET, POST, PATCH, OPTIONS" };

// 100 rows, newest last, the way a long thread reads.
const NOW = Date.now();
const rows = Array.from({ length: 100 }, (_, i) => ({
  id: `00000000-0000-4000-8000-${String(i + 1).padStart(12, "0")}`,
  sender: i % 2 ? "agent" : "user",
  body: i % 2 ? `Row ${i}. Three runs fit this week, and Thursday is dry.\n\`\`\`yui\nchoose "Add them?" Yes|No\n\`\`\`` : `Question ${i}: can you plan my running week?`,
  kind: "text", meta: {}, created_at: new Date(NOW - (100 - i) * 60000).toISOString(), delivered_at: null, handled_at: null, reaction: null, doing: null,
}));
const chat = { id: "10000000-0000-4000-8000-000000000001", title: null, is_first: true, last_at: rows[99].created_at, seen_at: rows[99].created_at, unread: false, last_body: "x", last_sender: "agent", last_message_at: rows[99].created_at };

let t0 = 0, calls = 0, liveRows = null;
const dir = mkdtempSync(join(tmpdir(), "yui-speed-"));
execFileSync("openssl", ["req", "-x509", "-newkey", "rsa:2048", "-nodes", "-keyout", join(dir, "k.pem"), "-out", join(dir, "c.pem"), "-days", "2", "-subj", "/CN=txuibjxyfpalzvpneqgp.supabase.co"], { stdio: "ignore" });
const backend = createServer({ key: readFileSync(join(dir, "k.pem")), cert: readFileSync(join(dir, "c.pem")) }, async (req, res) => {
  const h = { ...CORS, "access-control-allow-origin": req.headers.origin || "*" };
  if (req.method === "OPTIONS") { res.writeHead(204, h); return res.end(); }
  await new Promise((r) => setTimeout(r, calls++ === 0 ? FIRST_MS : NEXT_MS));
  const u = new URL(req.url, "https://x");
  const json = (body) => { res.writeHead(200, { ...h, "content-type": "application/json" }); res.end(JSON.stringify(body)); };
  const fn = u.pathname.split("/").pop();
  if (fn === "yui-auth") return json({ access_token: "at1", token_type: "bearer", expires_in: 3600, refresh_token: "rt1", user: { id: "u1", email: "chris@example.com" } });
  if (fn === "yui-agents") return json({ agents: penny.agents, crew: [], first_name: "Chris" });
  if (fn === "yui-account") return json({ user: { id: "u1", email: "chris@example.com" }, look: null });
  if (fn === "yui_messages") {
    if (u.searchParams.get("created_at")) return json([]);
    if (liveRows === null) liveRows = Date.now() - t0;
    return json(rows.slice(-Number(u.searchParams.get("limit") || 100)).reverse());
  }
  if (fn === "yui_chat_list") return json([chat]);
  return json(u.pathname.includes("/rest/") ? [] : {});
});
await new Promise((r) => backend.listen(0, "127.0.0.1", r));
const b = await chromium.launch({ args: [`--host-resolver-rules=MAP txuibjxyfpalzvpneqgp.supabase.co 127.0.0.1:${backend.address().port}`, "--ignore-certificate-errors"] });
const out = [];
for (let i = 0; i < RUNS; i++) {
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
  // The session a signed in person has stored (lib/web/auth.mjs browserDeps): only when there is none yet. A returning
  // person has an access token from the last renewal that is still good (YUI-274); the old code ignores the extra fields.
  await ctx.addInitScript(() => {
    const r = indexedDB.open("yui-web", 1);
    r.onupgradeneeded = () => r.result.createObjectStore("session");
    r.onsuccess = () => {
      const db = r.result;
      if (!db.objectStoreNames.contains("session")) return db.close();
      const g = db.transaction("session").objectStore("session").get("session");
      g.onsuccess = () => { if (!g.result) db.transaction("session", "readwrite").objectStore("session").put({ refresh: "rt0", user: { id: "u1", email: "chris@example.com" }, at: Date.now(), access: "at0", accessExpiresAt: Date.now() + 1800000 }, "session"); };
    };
  });
  const visit = async (cacheOff) => {
    const pg = await ctx.newPage();
    const cdp = await ctx.newCDPSession(pg);
    await cdp.send("Network.enable");
    await cdp.send("Network.setCacheDisabled", { cacheDisabled: cacheOff });
    await cdp.send("Network.emulateNetworkConditions", { offline: false, latency: 150, downloadThroughput: (1.6 * 1024 * 1024) / 8, uploadThroughput: (750 * 1024) / 8 });
    await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
    t0 = 0; calls = 0; liveRows = null;
    await pg.addInitScript(() => { try { new PerformanceObserver((l) => l.getEntries().forEach((e) => { if (e.name === "first-contentful-paint") window.__fcp = e.startTime; })).observe({ type: "paint", buffered: true }); } catch {} });
    t0 = Date.now();
    await pg.goto(URL_, { waitUntil: "commit" });
    await pg.waitForSelector(".wb-item", { timeout: 120000 });
    const firstRow = Date.now() - t0;
    const fcp = await pg.evaluate(() => performance.getEntriesByName("first-contentful-paint")[0]?.startTime ?? null);
    const drawn = await pg.locator(".wb-item").count();
    await pg.waitForTimeout(3000);
    const after = await pg.locator(".wb-item").count();
    await pg.close();
    return { fcp, firstRow, rowsAtFirst: drawn, rowsAfter3s: after, liveRowsAnsweredAt: liveRows };
  };
  const cold = await visit(true);
  const repeat = await visit(false);
  out.push({ cold, repeat });
  await ctx.close();
}
const pick = (k, f) => { const v = out.map((r) => r[k][f]).filter((x) => x != null); return v.length ? Math.round(med(v)) : null; };
const summary = {};
for (const k of ["cold", "repeat"]) summary[k] = { fcp: pick(k, "fcp"), firstRow: pick(k, "firstRow"), rowsAtFirst: pick(k, "rowsAtFirst"), rowsAfter3s: pick(k, "rowsAfter3s"), liveRowsAnsweredAt: pick(k, "liveRowsAnsweredAt") };
console.log(JSON.stringify({ runs: RUNS, median: summary, all: out }, null, 1));
await b.close();
backend.close();
