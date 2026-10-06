// YUI-312, the browser half: a real browser on the production /web asks, and times what comes back.
//   BASE, ID, TOKEN, AGENT, ASK, RUNS (json: [{theme, video, shot}]), OUT, FILM (1 = a film is expected), PW_ROOT
// Per run: ask-sent (Enter) to the film on the stage, to its first frame, scenes held, film ended; then Close and
// the record (one line and a Watch again chip). With FILM=0 the ask must draw as a sketch, never as raw text.
import { createRequire } from "module";
const require = createRequire(process.env.PW_ROOT + "/package.json");
const { chromium } = require("playwright");
const { BASE, ID, TOKEN, AGENT, ASK, OUT } = process.env;
const RUNS = JSON.parse(process.env.RUNS);
const FILM = process.env.FILM === "1";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const T0 = Date.now();
const b = await chromium.launch();
const res = [];
for (const [i, run] of RUNS.entries()) {
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true, colorScheme: run.theme,
    ...(run.video ? { recordVideo: { dir: OUT, size: { width: 390, height: 844 } } } : {}) });
  const pg = await ctx.newPage();
  const errs = [];
  pg.on("pageerror", (e) => errs.push(e.message));
  if (process.env.TRACE) pg.on("response", (x) => { if (x.request().method() === "POST") console.error(((Date.now() - T0) / 1000).toFixed(1), x.status(), x.url().replace(/^https:\/\/[^/]+/, "")); });
  await pg.route("**/functions/v1/yui-auth", (r) => r.fulfill({ status: 200, contentType: "application/json", headers: { "access-control-allow-origin": "*" }, body: JSON.stringify({ access_token: TOKEN, refresh_token: "r-" + ID, expires_in: 3000, user: { id: ID } }) }));
  await pg.addInitScript(([id]) => { const r = indexedDB.open("yui-web", 1); r.onupgradeneeded = () => r.result.createObjectStore("session"); r.onsuccess = () => r.result.transaction("session", "readwrite").objectStore("session").put({ refresh: "r-" + id, user: { id }, at: Date.now() }, "session"); }, [ID]);
  await pg.goto(`${BASE}/web/agent/${AGENT}${run.theme === "light" ? "?theme=light" : ""}`, { waitUntil: "networkidle" });
  if (await pg.getByTestId("crew-pick").waitFor({ timeout: 8000 }).then(() => true, () => false)) await pg.getByTestId("crew-start").click();  // Yui is already ticked
  if (!(await pg.getByTestId("stage-type").waitFor({ timeout: 4000 }).then(() => true, () => false)) || !/Film/.test(await pg.evaluate(() => document.body.innerText))) {
    await pg.goto(`${BASE}/web/agent/${AGENT}${run.theme === "light" ? "?theme=light" : ""}`, { waitUntil: "networkidle" });  // the picker sent us to the default agent
  }
  await pg.getByTestId("stage-type").waitFor({ timeout: 30000 }).catch(async (e) => { await pg.screenshot({ path: `${OUT}/stuck.png` }); console.error("STUCK", pg.url(), (await pg.evaluate(() => document.body.innerText)).slice(0, 400)); throw e; });
  await pg.getByTestId("stage-type").click();
  await pg.locator("[data-testid=stage-field] textarea").fill(ASK);
  await pg.keyboard.press("Enter");
  const t0 = Date.now();
  const r = { run: i + 1, theme: run.theme, errs, sentAt: t0 / 1000 };
  const player = () => pg.frames().find((f) => f.url().endsWith("/demo/motion/player.html"));
  const scenes = async () => { const f = player(); return f ? f.evaluate(() => window.__motion.scenes().length).catch(() => -1) : -1; };
  const limit = FILM ? 200000 : 60000;
  while (Date.now() - t0 < limit) {
    if (FILM) {
      if (r.film == null && (await pg.getByTestId("film").count())) r.film = (Date.now() - t0) / 1000;
      if (r.film != null && r.first == null && (await scenes()) >= 1 && !(await pg.locator(".mfs-wait").count())) r.first = (Date.now() - t0) / 1000;
      if (r.first != null && r.ended == null && (await pg.getByTestId("film").getAttribute("data-ended")) === "1") { r.ended = (Date.now() - t0) / 1000; break; }
    } else if (Date.now() - t0 > 40000) break;
    if (FILM && !r.dbg && Date.now() - t0 > 90000 && r.film == null) { r.dbg = true; await pg.screenshot({ path: `${OUT}/debug-90s.png` }); console.error('DBG', (await pg.evaluate(() => document.body.innerText)).slice(0, 600)); }
    await sleep(100);
  }
  if (FILM) {
    r.scenes = await scenes();
    if (run.shot) { await pg.screenshot({ path: `${OUT}/${run.shot}-film.png` }); }
    if (r.film != null) {
      await pg.getByTestId("film-close").click(); await sleep(500);
      r.closed = (await pg.getByTestId("film").count()) === 0;
      await pg.getByTestId("stage-record").click();
      await pg.getByTestId("film-line").waitFor({ timeout: 10000 }).catch(() => {});
      r.lines = await pg.getByTestId("film-line").count();
      r.chips = await pg.getByTestId("film-replay-chip").count();
      if (run.shot) await pg.screenshot({ path: `${OUT}/${run.shot}-record.png` });
    }
  } else {
    if (run.shot) await pg.screenshot({ path: `${OUT}/${run.shot}-sketch.png` });
    await pg.getByTestId("stage-record").click().catch(() => {}); await sleep(600);
  }
  const text = await pg.evaluate(() => document.body.innerText);
  r.raw = /\bmotion\s+"|film=|=== scene|\+last/.test(text);
  r.filmUp = (await pg.getByTestId("film").count()) > 0;
  res.push(r);
  console.error(JSON.stringify(r));
  await ctx.close();
}
await b.close();
console.log("RESULT " + JSON.stringify(res));
