// YUI-271: time /web on a phone. 390 wide, 4x CPU throttle, slow 4G, one headless Chrome, a prod build.
//   cd site && npm run build && npx next start -p 3271 &   then   node scripts/web-speed.mjs [runs]
// BASE overrides the origin, PLAYWRIGHT the module. Prints one JSON object: medians over the runs.
import { createRequire } from "node:module";
const { chromium } = createRequire(import.meta.url)(process.env.PLAYWRIGHT || "playwright");
const BASE = process.env.BASE || "http://localhost:3271";
const RUNS = Number(process.argv[2] || 3);
const URL_ = `${BASE}/web/agent/demo-penny?demo=penny&view=chat&demohistory=400&theme=dark`;
const med = (a) => a.slice().sort((x, y) => x - y)[Math.floor(a.length / 2)];
const b = await chromium.launch({ args: ["--enable-precise-memory-info", "--js-flags=--expose-gc"] });
const rows = [];
for (let i = 0; i < RUNS; i++) {
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
  const pg = await ctx.newPage();
  const cdp = await ctx.newCDPSession(pg);
  await cdp.send("Network.enable");
  await cdp.send("Network.setCacheDisabled", { cacheDisabled: true });
  await cdp.send("Network.emulateNetworkConditions", { offline: false, latency: 150, downloadThroughput: (1.6 * 1024 * 1024) / 8, uploadThroughput: (750 * 1024) / 8 });
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
  let js = 0, jsFiles = 0; const urls = new Map();
  cdp.on("Network.responseReceived", (e) => { if (e.type === "Script") urls.set(e.requestId, e.response.url); });
  cdp.on("Network.loadingFinished", (e) => { if (urls.has(e.requestId)) { js += e.encodedDataLength; jsFiles++; } });
  await pg.addInitScript(() => {
    window.__lt = 0;
    try { new PerformanceObserver((l) => l.getEntries().forEach((e) => { window.__lt += e.duration; })).observe({ type: "longtask", buffered: true }); } catch {}
  });
  const t0 = Date.now();
  await pg.goto(URL_, { waitUntil: "commit" });
  await pg.waitForSelector(".wb-item", { timeout: 120000 });
  const items = Date.now() - t0;
  const jsAtRows = js;
  const fcp = await pg.evaluate(() => performance.getEntriesByName("first-contentful-paint")[0]?.startTime ?? null);
  await pg.waitForTimeout(5000);
  const jsFirst = js, filesFirst = jsFiles;
  // first tap that answers: the menu button opens the drawer
  const menu = pg.locator(".wb-menu:visible, .wb-stage-menu:visible").first();
  await menu.waitFor();
  const t1 = Date.now();
  await menu.click();
  await pg.getByTestId("drawer").waitFor();
  await pg.waitForFunction(() => document.querySelector(".wb-side.open") && document.querySelector(".wb-side").getBoundingClientRect().left >= -1, null, { timeout: 30000 }).catch(() => {});
  const drawerOpen = Date.now() - t1;
  // switch agents: bar, panel, pick another row
  const t2 = Date.now();
  await pg.getByTestId("agent-bar").click();
  await pg.getByTestId("agents-panel").waitFor();
  const panel = Date.now() - t2;
  const other = pg.locator("li.ag-row:not(.on) a.wb-agent-row").nth(1);
  let switchMs = null;
  if (await other.count()) {
    const t3 = Date.now();
    await other.click();
    await pg.waitForFunction(() => !document.querySelector("[data-testid=agents-panel]"), null, { timeout: 30000 }).catch(() => {});
    switchMs = Date.now() - t3 + panel;
  }
  // memory after scrolling back 300 rows
  await pg.goto(URL_, { waitUntil: "load" });
  await pg.waitForSelector(".wb-item");
  await pg.waitForTimeout(1500);
  let n = 0;
  for (let k = 0; k < 120 && n < 300; k++) {
    await pg.evaluate(() => { let e = document.querySelector(".wb-messages"); while (e && e.scrollHeight <= e.clientHeight + 1) e = e.parentElement; if (e) e.scrollTop = 0; });
    await pg.mouse.wheel(0, -300);
    await pg.waitForTimeout(200);
    n = await pg.locator(".wb-item").count();
  }
  await cdp.send("HeapProfiler.enable"); await cdp.send("HeapProfiler.collectGarbage");
  const mem = await pg.evaluate(() => performance.memory.usedJSHeapSize / 1048576);
  const lt = await pg.evaluate(() => window.__lt);
  rows.push({ fcp, items, jsAtRowsKB: jsAtRows / 1024, jsKB: jsFirst / 1024, jsFiles: filesFirst, drawerOpen, panel, switchMs, rowsDrawn: n, memMB: mem, longTaskMs: lt });
  await ctx.close();
}
const out = {};
for (const k of Object.keys(rows[0])) { const v = rows.map((r) => r[k]).filter((x) => x != null); out[k] = v.length ? Math.round(med(v) * 10) / 10 : null; }
console.log(JSON.stringify({ runs: RUNS, median: out, all: rows }, null, 1));
await b.close();
