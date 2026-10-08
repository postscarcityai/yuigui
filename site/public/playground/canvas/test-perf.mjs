// YUI-335: the canvas stays smooth on a phone. A frame budget and a test that holds it.
// Headless Chrome at 390x844, played start to end: the heart film, ?yl=bars, ?yl=steps and a mixed answer, then the YUI-334
// hold, drag, Back sequence. YUI-337: the math and calc samples (?yl=math, ?yl=calc) are played too, and a slider drag on ?yl=calc is measured (drag the knob, then Back). YUI-336: the map samples (?yl=map, ?yl=route and a map in a mixed answer, ?yl=mix-map) are played too, and the sequence runs on the map. Frame times are requestAnimationFrame deltas on the page.
// Budget at 1x CPU: p95 under 20 ms, no frame over 50 ms. At 4x CPU throttle (CDP Emulation.setCPUThrottlingRate): p95 under 33 ms (the worst frame is printed, not gated: a throttled laptop drops a stray frame to a GC).
// Needs Chrome and playwright. Without them it says so and exits 0 (a skip, never a pass): PERF_STRICT=1 makes that a failure.
// node test-perf.mjs                 both budgets, a table per sample
// RATES=1 node test-perf.mjs         one rate only      JSON=out.json writes the numbers
import fs from "fs";
import http from "http";
import path from "path";
import { createRequire } from "module";
import { fileURLToPath } from "url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "../.."); // site/public
const CHROME = process.env.CHROME || ["/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", "/usr/bin/google-chrome", "/usr/bin/chromium"].find((p) => fs.existsSync(p));
const skip = (why) => { console.log(`test-perf: SKIPPED (${why}). This is a skip, not a pass.`); process.exit(process.env.PERF_STRICT ? 1 : 0); };
if (!CHROME) skip("no Chrome found; set CHROME=<path>");
let chromium;
for (const from of [process.env.PW_FROM, path.join(root, "../package.json"), "/Users/urzas/dev/ablejobs/package.json"].filter(Boolean)) {
  try { chromium = createRequire(from)("playwright").chromium; break; } catch {}
}
if (!chromium) skip("playwright not installed; set PW_FROM=<a package.json beside node_modules/playwright>");

const BUDGET = { 1: { p95: 20, max: 50 }, 4: { p95: 33, max: null } };
const RATES = (process.env.RATES || "1,4").split(",").map(Number);
const MIXED = process.env.MIXED || "mix-first";
const SAMPLES = process.env.ONLY_SEQ ? [] : [["heart", "canvas.html"], ["bars", "canvas.html?yl=bars"], ["steps", "canvas.html?yl=steps"], ["mixed", `canvas.html?yl=${MIXED}`], ["map", "canvas.html?yl=map"], ["route", "canvas.html?yl=route"], ["mixed map", "canvas.html?yl=mix-map"], ["math", "canvas.html?yl=math"], ["calc", "canvas.html?yl=calc"]];   // YUI-336: the map samples are played too; YUI-337: so are math and calc
const SEQ = [["bars", "bars", "chart:n1:s0:1", "chart:n1:s0:3", "chart:n1:s0:0"], ["steps", "steps", "list:n1:2", "list:n1:3", "list:n1:1", false], ["map", "map", "map:n1:pin:karakorum", "map:n1:pin:karakorum", "map:n1:area:raided"]]; // hold, drag, Back runs on these: [label, yl id, hold part, drag part, drop on part, the hold has a canned redraw]

const mime = { ".html": "text/html", ".mjs": "text/javascript", ".js": "text/javascript", ".json": "application/json", ".css": "text/css", ".svg": "image/svg+xml" };
const srv = http.createServer((q, r) => {
  const f = path.join(root, decodeURIComponent(q.url.split("?")[0]));
  if (!f.startsWith(root) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end(); }
  r.writeHead(200, { "content-type": mime[path.extname(f)] || "application/octet-stream" }); fs.createReadStream(f).pipe(r);
});
await new Promise((ok) => srv.listen(0, "127.0.0.1", ok));
const base = `http://127.0.0.1:${srv.address().port}/playground/`;

const rec = `(() => {
  window.__ft = []; window.__fp = []; window.__ph = ""; window.__rec = false; window.__ended = false; let last = 0;
  addEventListener("message", (e) => { if (e.data && e.data.motion === "ended") window.__ended = true; });
  const tick = (now) => { if (window.__rec && last) { window.__ft.push(now - last); window.__fp.push(window.__ph); } last = window.__rec ? now : 0; requestAnimationFrame(tick); };
  requestAnimationFrame(tick);
})();`;

const pct = (a, p) => { const s = [...a].sort((x, y) => x - y); return s.length ? s[Math.min(s.length - 1, Math.ceil(p * s.length) - 1)] : 0; };
const stat = (a) => ({ frames: a.length, p50: pct(a, 0.5), p95: pct(a, 0.95), max: a.length ? Math.max(...a) : 0 });

const browser = await chromium.launch({ executablePath: CHROME, headless: true });
const results = []; let bad = 0;

async function open(rate, url) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
  const p = await ctx.newPage(), errs = []; p.on("pageerror", (e) => errs.push(String(e)));
  await p.addInitScript(rec);
  const cdp = await ctx.newCDPSession(p);
  await cdp.send("Emulation.setCPUThrottlingRate", { rate });
  await p.goto(base + url + (url.includes("?") ? "&" : "?") + "theme=dark");
  await p.waitForFunction(() => window.__canvas && window.__canvas.loaded, null, { timeout: 30000 });
  return { ctx, p, errs };
}
const frames = (p) => p.evaluate(() => window.__ft.slice());
const start = (p) => p.evaluate(() => { window.__ft = []; window.__fp = []; window.__rec = true; });
const phase = (p, n) => p.evaluate((n) => { window.__ph = n; }, n);
const slow = (p) => p.evaluate(() => window.__ft.map((t, i) => [t, window.__fp[i]]).filter((x) => x[0] > 40).map((x) => x[0].toFixed(0) + "ms@" + x[1]));
const stop = async (p) => { const f = await frames(p); await p.evaluate(() => { window.__rec = false; }); return f; };

// a film played start to end: the first frame to the "ended" message
async function play(rate, [name, url]) {
  const { ctx, p, errs } = await open(rate, url);
  await p.waitForTimeout(500);
  await start(p);
  await p.evaluate(() => { const y = window.__canvas.yui(); y.replay(); });
  const total = await p.evaluate(() => window.__canvas.total);
  await p.waitForFunction(() => window.__ended, null, { timeout: (total * 1000 + 15000) * Math.max(1, rate) });
  const f = await stop(p); await ctx.close();
  return { name, rate, f, errs };
}

// the YUI-334 sequence on one answer, with real pointer input: press and hold a part (it redraws), drag another part to a neighbour's
// place (it moves), then Back twice. The run fails if the history does not reach 2 steps and come back to 0.
async function sequence(rate, [name, yl, holdIdx, moveIdx, toIdx, holdRedraws = true]) {
  const { ctx, p, errs } = await open(rate, `canvas.html?yl=${yl}`);
  const fr = p.frames().find((x) => x.url().includes("player.html"));
  await p.waitForFunction(() => window.__canvas.hist, null, { timeout: 15000 });
  await p.waitForTimeout(5000); // let the answer finish writing in
  const to = 20000 * rate, idle = async () => { await p.waitForFunction(() => !ylBusy, null, { timeout: to }); await p.waitForTimeout(150); };
  const at = (n) => p.waitForFunction((k) => window.__canvas.hist.at === k, n, { timeout: to });
  const box = await p.evaluate(() => { const r = document.querySelector("iframe").getBoundingClientRect(); return { x: r.left, y: r.top }; });
  const parts = () => fr.evaluate(() => window.__motion.hits().filter((h) => h.id && !/^mark:/.test(h.id)).map((h) => ({ id: h.id, x: h.x, y: h.y })));
  const part = (list, id) => list.find((q) => q.id === id) || list[0];
  const m = p.mouse;
  let ps = await parts(), h = part(ps, holdIdx), steps = 0, note = "";
  await start(p);
  await phase(p, "hold");
  await m.move(box.x + h.x, box.y + h.y); await m.down(); await p.waitForTimeout(750); await m.up();
  // a hold with no canned redraw says "no answer in the demo" and adds no step; it still costs frames, so it is still played
  let n = 0;
  if (holdRedraws) { await at(++n).then(() => steps++).catch(() => { note = "hold made no step"; }); }
  else await p.waitForTimeout(3000);
  await idle().catch(() => {});
  await phase(p, "drag");
  ps = await parts(); const a = part(ps, moveIdx), z = part(ps, toIdx);
  await m.move(box.x + a.x, box.y + a.y); await m.down();
  for (let i = 1; i <= 30; i++) { await m.move(box.x + a.x + ((z.x - a.x) * i) / 30, box.y + a.y + ((z.y - a.y) * i) / 30); await p.waitForTimeout(16); }
  await m.up(); await phase(p, "drop");
  await at(++n).then(() => steps++).catch(() => { note = note || "drag made no step"; }); await idle().catch(() => {});
  await phase(p, "back");
  while (n > 0) { await p.keyboard.press("Control+z"); await at(--n).then(() => steps++).catch(() => { note = note || "Back did not step back"; }); await idle().catch(() => {}); }
  await p.waitForTimeout(600);
  const f = await stop(p), longs = await slow(p); await ctx.close();
  return { name: `${name} hold+drag+Back`, rate, f, errs, longs, note: steps === (holdRedraws ? 4 : 2) ? "" : note || "sequence incomplete" };
}

// YUI-337: drag the calc knob across the track with real pointer input (the result and the plot redraw on every move), then Back. The run fails
// when the drag is not one step in the history or Back does not return to step 0.
async function slider(rate) {
  const { ctx, p, errs } = await open(rate, "canvas.html?yl=calc");
  const fr = p.frames().find((x) => x.url().includes("player.html"));
  await p.waitForFunction(() => window.__canvas.hist, null, { timeout: 15000 });
  await p.waitForTimeout(6500 * Math.min(rate, 2));   // let the answer finish writing in
  const to = 20000 * rate, idle = async () => { await p.waitForFunction(() => !ylBusy, null, { timeout: to }); await p.waitForTimeout(150); };
  const at = (n) => p.waitForFunction((k) => window.__canvas.hist.at === k, n, { timeout: to });
  const box = await p.evaluate(() => { const r = document.querySelector("iframe").getBoundingClientRect(); return { x: r.left, y: r.top }; });
  const knob = (await fr.evaluate(() => window.__motion.hits())).find((h) => h.id === "calc.r");
  const m = p.mouse; let steps = 0, note = "";
  await start(p); await phase(p, "slide");
  await m.move(box.x + knob.x, box.y + knob.y); await m.down();
  for (let i = 1; i <= 60; i++) { await m.move(box.x + knob.x + (i <= 30 ? 6 * i : 6 * (60 - i)), box.y + knob.y); await p.waitForTimeout(16); }
  await m.move(box.x + knob.x + 180, box.y + knob.y); await p.waitForTimeout(300);   // the result and the plot ease for a moment after the last move
  await m.up(); await phase(p, "settle");
  await at(1).then(() => steps++).catch(() => { note = "the drag made no step"; }); await idle().catch(() => {});
  await phase(p, "back");
  await p.keyboard.press("Control+z"); await at(0).then(() => steps++).catch(() => { note = note || "Back did not step back"; }); await idle().catch(() => {});
  await p.waitForTimeout(600);
  const f = await stop(p), longs = await slow(p); await ctx.close();
  return { name: "calc slider drag+Back", rate, f, errs, longs, note: steps === 2 ? "" : note || "sequence incomplete" };
}

for (const rate of RATES) {
  for (const s of SAMPLES) results.push(await play(rate, s));
  for (const s of SEQ) results.push(await sequence(rate, s));
  results.push(await slider(rate));
}
await browser.close(); srv.close();

const lines = [];
for (const rate of RATES) {
  const b = BUDGET[rate] || BUDGET[1], rows = results.filter((r) => r.rate === rate);
  lines.push(`\nCPU ${rate}x, 390x844. Budget: p95 under ${b.p95} ms${b.max ? `, no frame over ${b.max} ms` : ""}`);
  lines.push("sample                 frames   p50 ms   p95 ms   max ms");
  for (const r of rows) {
    const s = (r.s = stat(r.f));
    const miss = [r.f.length < 20 ? "too few frames" : "", s.p95 >= b.p95 ? "p95" : "", b.max && s.max > b.max ? "max" : "", r.errs.length ? "page error" : "", r.note || ""].filter(Boolean);
    if (miss.length) bad++;
    if (r.longs && r.longs.length) lines.push("  long frames: " + r.longs.join(" "));
    lines.push(`${r.name.padEnd(22)} ${String(s.frames).padStart(6)} ${s.p50.toFixed(1).padStart(8)} ${s.p95.toFixed(1).padStart(8)} ${s.max.toFixed(1).padStart(8)}  ${miss.length ? "OVER " + miss.join(",") : "ok"}`);
  }
}
console.log(lines.join("\n"));
if (process.env.JSON) fs.writeFileSync(process.env.JSON, JSON.stringify(results.map((r) => ({ name: r.name, rate: r.rate, ...r.s })), null, 1));
console.log(bad ? `\nperf: ${bad} over budget` : "\nperf: within budget");
process.exit(bad ? 1 : 0);
