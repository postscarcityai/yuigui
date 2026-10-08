// YUI-324: every film on /playground/canvas.html works by keyboard and screen reader.
// Per film: every touchable part has a focusable button with a name, Tab walks them in film order, Enter = the touch tap,
// Shift-Enter / long Enter = the touch hold, Space = tap on nothing (play/pause), Left/Right scrub. Two films also dump the AX tree.
// Serve site/public (python3 -m http.server 8923), then: node test-keyboard.mjs   (PW_FROM = a package.json whose node_modules has playwright)
import { createRequire } from "module";
const require = createRequire(process.env.PW_FROM || "/Users/urzas/dev/ablejobs/package.json");
const { chromium } = require("playwright");
import fs from "fs";
const list = JSON.parse(fs.readFileSync(new URL("./films.json", import.meta.url)));
const ids = ["heart"]; list.forEach(f => f.runs.forEach(r => ids.push(f.id + "-r" + r)));
const DUMP = (process.env.DUMP || "heart,engine-r1").split(",");
const b = await chromium.launch({ executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", headless: true });
const out = []; let bad = 0, parts = 0, filmsWithParts = 0, checks = 0;
for (const id of ids) {
  const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true });
  const errs = []; p.on("pageerror", e => errs.push(String(e)));
  await p.addInitScript(() => { window.__log = []; window.addEventListener("message", e => { const m = e.data && e.data.motion; if (m && m !== "time" && m !== "cues") window.__log.push(e.data); }); });
  await p.goto("http://localhost:" + (process.env.PORT || 8923) + "/playground/canvas.html" + (id === "heart" ? "?" : "?film=" + id + "&") + "theme=dark");
  await p.waitForFunction(() => window.__canvas && window.__canvas.loaded, null, { timeout: 15000 }).catch(() => {});
  const fr = p.frames().find(f => f.url().includes("player.html"));
  await p.waitForTimeout(id.startsWith("three") ? 2500 : 300);
  const total = await p.evaluate(() => window.__canvas.total);
  const fails = [];
  // 1. at every sampled frame the hidden list matches the hits: one named, focusable button per part, same order
  let best = { n: 0, t: 1 };
  for (let t = 1; t < total; t += Math.max(1, total / 14)) {
    const r = await fr.evaluate(t => {
      window.__motion.renderAt(t); const h = window.__motion.hits();
      const bs = [...document.querySelectorAll("#parts button")];
      return { ids: h.map(x => x.id), btn: bs.map(x => x.dataset.id), names: bs.map(x => x.getAttribute("aria-label")), ok: bs.map(x => x.tabIndex >= 0 && !x.disabled) };
    }, t);
    checks += r.ids.length;
    if (JSON.stringify(r.ids) !== JSON.stringify(r.btn)) fails.push("list!=hits@" + t.toFixed(1));
    if (r.names.some(n => !n || !n.trim())) fails.push("unnamed@" + t.toFixed(1));
    if (r.ok.some(x => !x)) fails.push("unfocusable@" + t.toFixed(1));
    if (r.ids.length > best.n) best = { n: r.ids.length, t, names: r.names, ids: r.ids };
  }
  // 2. Tab walks every part in film order, the ring draws, Enter / Shift-Enter / Space / arrows send the touch's events
  let walked = 0, same = "-";
  if (best.n) {
    filmsWithParts++; parts += best.n;
    await fr.evaluate(t => { window.__motion.renderAt(t); document.getElementById("cv").focus(); }, best.t);
    const seen = [];
    for (let i = 0; i < best.n; i++) { await p.keyboard.press("Tab"); seen.push(await fr.evaluate(() => document.activeElement.dataset.id)); }
    walked = seen.length;
    if (JSON.stringify(seen) !== JSON.stringify(best.ids)) fails.push("tab order " + seen.join(",") + " != " + best.ids.join(","));
    if (await fr.evaluate(() => window.__motion.focusId()) !== best.ids[best.n - 1]) fails.push("ring not on focused part");
    // touch reference for the last part, then the same by keyboard
    const hit = (await fr.evaluate(() => window.__motion.hits())).at(-1);
    const touch = async (ms) => { await p.evaluate(() => (window.__log = [])); await fr.evaluate(async ([x, y, ms]) => {
      const cv = document.getElementById("cv"), o = { clientX: x, clientY: y, pointerId: 7, bubbles: true, pointerType: "touch" };
      cv.dispatchEvent(new PointerEvent("pointerdown", o)); await new Promise(r => setTimeout(r, ms)); cv.dispatchEvent(new PointerEvent("pointerup", o)); }, [hit.x, hit.y, ms]); await p.waitForTimeout(120); return p.evaluate(() => window.__log.filter(m => m.motion === "tap" || m.motion === "hold").map(m => ({ motion: m.motion, id: m.id, label: m.label }))); };
    const key = async (fn) => { await p.evaluate(() => (window.__log = [])); await fn(); await p.waitForTimeout(700); return p.evaluate(() => window.__log.filter(m => m.motion === "tap" || m.motion === "hold").map(m => ({ motion: m.motion, id: m.id, label: m.label }))); };
    const tT = await touch(60), kT = await key(() => p.keyboard.press("Enter"));
    const tH = await touch(650), kH = await key(() => p.keyboard.press("Shift+Enter"));
    const kL = await key(async () => { await p.keyboard.down("Enter"); await p.waitForTimeout(620); await p.keyboard.up("Enter"); });
    if (tT.length !== 1 || JSON.stringify(tT) !== JSON.stringify(kT)) fails.push("tap " + JSON.stringify(tT) + " vs Enter " + JSON.stringify(kT));
    if (tH.length !== 1 || JSON.stringify(tH) !== JSON.stringify(kH)) fails.push("hold " + JSON.stringify(tH) + " vs Shift-Enter " + JSON.stringify(kH));
    if (JSON.stringify(kL) !== JSON.stringify(kH)) fails.push("long Enter " + JSON.stringify(kL) + " vs Shift-Enter");
    same = "tap+hold=same";
  }
  // 3. Space = tap on nothing (play/pause); arrows scrub and bracket with scrub begin/end; the host button toggles with Space too
  await fr.evaluate(() => document.getElementById("cv").focus());
  const sp = await (async () => { await p.evaluate(() => (window.__log = [])); await p.keyboard.press("Space"); await p.waitForTimeout(150); return p.evaluate(() => window.__log.filter(m => m.motion === "tap")); })();
  if (sp.length !== 1 || sp[0].id !== undefined) fails.push("space " + JSON.stringify(sp));
  await fr.evaluate(() => window.__motion.renderAt(2));
  await p.evaluate(() => (window.__log = []));
  await p.keyboard.press("ArrowRight"); await p.waitForTimeout(450);
  const c1 = await fr.evaluate(() => window.__motion.clock());
  await p.keyboard.press("ArrowLeft"); await p.waitForTimeout(450);
  const c2 = await fr.evaluate(() => window.__motion.clock());
  const ph = await p.evaluate(() => window.__log.filter(m => m.motion === "scrub").map(m => m.phase).join(","));
  if (Math.abs(c1 - 4) > 0.2 || Math.abs(c2 - 2) > 0.2) fails.push(`arrows ${c1}/${c2}`);
  if (ph !== "begin,move,end,begin,move,end") fails.push("scrub phases " + ph);
  // 4. the picker is a tablist: one selected tab, one tab stop, arrows move
  const tl = await p.evaluate(() => { const n = document.getElementById("films"), t = [...n.querySelectorAll('[role=tab]')]; return { role: n.getAttribute("role"), tabs: t.length, sel: t.filter(x => x.getAttribute("aria-selected") === "true").length, stops: t.filter(x => x.tabIndex === 0).length }; });
  if (tl.role !== "tablist" || tl.tabs !== ids.length || tl.sel !== 1 || tl.stops !== 1) fails.push("tablist " + JSON.stringify(tl));
  await p.focus("#films [tabindex='0']"); await p.keyboard.press("ArrowRight");
  const moved = await p.evaluate(() => document.activeElement.getAttribute("role") === "tab" && document.activeElement.tabIndex === 0);
  if (!moved) fails.push("tab arrows");
  // 5. a screen-reader tree for two films
  if (DUMP.includes(id)) {
    await p.goto(p.url()); await p.waitForFunction(() => window.__canvas && window.__canvas.loaded, null, { timeout: 15000 }).catch(() => {}); await p.waitForTimeout(400);
    const fr2 = p.frames().find(f => f.url().includes("player.html"));
    await fr2.evaluate(t => window.__motion.renderAt(t), best.t || 3);
    const snap = await p.locator("body").ariaSnapshot().catch(() => "");
    const snapF = await p.frameLocator("#cv").locator("body").ariaSnapshot().catch(() => "");
    fs.writeFileSync(new URL("./ax/ax-" + id + ".txt", import.meta.url), "# host page\n" + snap + "\n# canvas frame (film " + id + " at " + (best.t || 3).toFixed(1) + "s)\n" + snapF + "\n");
  }
  if (errs.length) fails.push(errs.join(";"));
  if (fails.length) bad++;
  out.push(`${fails.length ? "BAD" : "ok "} ${id} parts=${best.n} walked=${walked} ${same} ${fails.join(" | ")}`);
  await p.close();
}
// YUI-336: the map samples of the yl canvas. Every area, pin and route is one named, focusable button, Tab walks them in line order, Enter and
// Shift-Enter do what a tap and a hold do, and Alt+Arrow on a pin moves it (the same `yl move` line a drag sends).
for (const yid of ["map", "route"]) {
  const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true });
  const errs = [], fails = []; p.on("pageerror", e => errs.push(String(e)));
  await p.addInitScript(() => { window.__log = []; window.addEventListener("message", e => { const m = e.data && e.data.motion; if (m && m !== "time" && m !== "cues") window.__log.push(e.data); }); });
  await p.goto("http://localhost:" + (process.env.PORT || 8923) + "/playground/canvas.html?yl=" + yid + "&theme=dark&replies=off");
  await p.waitForFunction(() => window.__canvas && window.__canvas.loaded && window.__canvas.yl, null, { timeout: 15000 }).catch(() => fails.push("not loaded"));
  const fr = p.frames().find(f => f.url().includes("player.html"));
  await p.waitForTimeout(300);
  const total = await p.evaluate(() => window.__canvas.total);
  const r = await fr.evaluate(t => { window.__motion.renderAt(t); const h = window.__motion.hits(); const bs = [...document.querySelectorAll("#parts button")]; return { ids: h.map(x => x.id), btn: bs.map(x => x.dataset.id), names: bs.map(x => x.getAttribute("aria-label")), ok: bs.map(x => x.tabIndex >= 0 && !x.disabled) }; }, total);
  const marks = r.ids.filter(i => i.startsWith("map:"));
  checks += r.ids.length; parts += marks.length; filmsWithParts++;
  if (marks.length < (yid === "map" ? 5 : 4)) fails.push("only " + marks.length + " map marks");
  if (JSON.stringify(r.ids) !== JSON.stringify(r.btn)) fails.push("list!=hits");
  if (r.names.some(n => !n || !n.trim())) fails.push("unnamed " + JSON.stringify(r.names));
  if (r.ok.some(x => !x)) fails.push("unfocusable");
  await fr.evaluate(() => document.getElementById("cv").focus());
  const seen = [];
  for (let i = 0; i < r.ids.length; i++) { await p.keyboard.press("Tab"); seen.push(await fr.evaluate(() => document.activeElement.dataset.id)); }
  if (JSON.stringify(seen) !== JSON.stringify(r.ids)) fails.push("tab order " + seen + " != " + r.ids);
  const pinId = marks.find(i => /:pin:/.test(i)), hit = (await fr.evaluate(() => window.__motion.hits())).find(h => h.id === pinId);
  const sent = () => p.evaluate(() => window.__log.filter(m => m.motion === "tap" || m.motion === "hold").map(m => ({ motion: m.motion, id: m.id, label: m.label })));
  const touch = async (ms) => { await p.evaluate(() => (window.__log = [])); await fr.evaluate(async ([x, y, ms]) => { const cv = document.getElementById("cv"), o = { clientX: x, clientY: y, pointerId: 7, bubbles: true, pointerType: "touch" }; cv.dispatchEvent(new PointerEvent("pointerdown", o)); await new Promise(r => setTimeout(r, ms)); cv.dispatchEvent(new PointerEvent("pointerup", o)); }, [hit.x, hit.y, ms]); await p.waitForTimeout(150); return sent(); };
  const focusPin = async () => { await fr.evaluate(id => document.querySelector('#parts button[data-id="' + id + '"]').focus(), pinId); };
  const key = async (fn) => { await p.evaluate(() => (window.__log = [])); await fn(); await p.waitForTimeout(700); return sent(); };
  const tT = await touch(60); await focusPin(); const kT = await key(() => p.keyboard.press("Enter"));
  const tH = await touch(650); await focusPin(); const kH = await key(() => p.keyboard.press("Shift+Enter"));
  if (tT.length !== 1 || tT[0].id !== pinId || JSON.stringify(tT) !== JSON.stringify(kT)) fails.push("tap " + JSON.stringify(tT) + " vs Enter " + JSON.stringify(kT));
  if (tH.length !== 1 || JSON.stringify(tH) !== JSON.stringify(kH)) fails.push("hold " + JSON.stringify(tH) + " vs Shift-Enter " + JSON.stringify(kH));
  await focusPin(); await p.keyboard.press("Alt+ArrowRight"); await p.waitForTimeout(900);
  const ln = await p.evaluate(() => document.getElementById("line").innerText);
  if (!/\[yui\] \S+ yl move .+ to=-?[\d.]+,-?[\d.]+/.test(ln)) fails.push("Alt+Arrow line " + JSON.stringify(ln));
  if (errs.length) fails.push(errs.join(";"));
  if (fails.length) bad++;
  out.push(`${fails.length ? "BAD" : "ok "} yl=${yid} map marks=${marks.length} walked=${seen.length} tap+hold=same ${fails.join(" | ")}`);
  await p.close();
}
// YUI-337: the math and calc samples of the yl canvas. Every term, the result, the plot and every slider is one named, focusable button, Tab walks them
// in reading order, Enter and Shift-Enter do what a tap and a hold do, and the arrow keys on a slider step it and send the same `canvas drag` line a drag sends.
for (const yid of ["math", "calc"]) {
  const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true });
  const errs = [], fails = []; p.on("pageerror", e => errs.push(String(e)));
  await p.addInitScript(() => { window.__log = []; window.addEventListener("message", e => { const m = e.data && e.data.motion; if (m && m !== "time" && m !== "cues") window.__log.push(e.data); }); });
  await p.goto("http://localhost:" + (process.env.PORT || 8923) + "/playground/canvas.html?yl=" + yid + "&theme=dark&replies=off");
  await p.waitForFunction(() => window.__canvas && window.__canvas.loaded && window.__canvas.yl, null, { timeout: 15000 }).catch(() => fails.push("not loaded"));
  const fr = p.frames().find(f => f.url().includes("player.html"));
  await p.waitForTimeout(300);
  const total = await p.evaluate(() => window.__canvas.total);
  const r = await fr.evaluate(t => { window.__motion.renderAt(t); const h = window.__motion.hits(); const bs = [...document.querySelectorAll("#parts button")]; return { ids: h.map(x => x.id), btn: bs.map(x => x.dataset.id), names: bs.map(x => x.getAttribute("aria-label")), ok: bs.map(x => x.tabIndex >= 0 && !x.disabled) }; }, total);
  checks += r.ids.length; parts += r.ids.length; filmsWithParts++;
  const want = yid === "math" ? ["term.E", "term.m", "term.c_2", "step.1", "step.2"] : ["term.A", "term.P", "calc.result", "calc.plot", "calc.P", "calc.r", "calc.t"];
  for (const w of want) if (!r.ids.includes(w)) fails.push("no mark " + w);
  if (JSON.stringify(r.ids) !== JSON.stringify(r.btn)) fails.push("list!=hits");
  if (r.names.some(n => !n || !n.trim())) fails.push("unnamed " + JSON.stringify(r.names));
  if (r.ok.some(x => !x)) fails.push("unfocusable");
  await fr.evaluate(() => document.getElementById("cv").focus());
  const seen = [];
  for (let i = 0; i < r.ids.length; i++) { await p.keyboard.press("Tab"); seen.push(await fr.evaluate(() => document.activeElement.dataset.id)); }
  if (JSON.stringify(seen) !== JSON.stringify(r.ids)) fails.push("tab order " + seen + " != " + r.ids);
  const termId = r.ids.find(i => /^term\./.test(i)), hit = (await fr.evaluate(() => window.__motion.hits())).find(h => h.id === termId);
  const sent = () => p.evaluate(() => window.__log.filter(m => m.motion === "tap" || m.motion === "hold").map(m => ({ motion: m.motion, id: m.id, label: m.label })));
  const touch = async (ms) => { await p.evaluate(() => (window.__log = [])); await fr.evaluate(async ([x, y, ms]) => { const cv = document.getElementById("cv"), o = { clientX: x, clientY: y, pointerId: 7, bubbles: true, pointerType: "touch" }; cv.dispatchEvent(new PointerEvent("pointerdown", o)); await new Promise(r => setTimeout(r, ms)); cv.dispatchEvent(new PointerEvent("pointerup", o)); }, [hit.x, hit.y, ms]); await p.waitForTimeout(120); return sent(); };
  const focusIt = async (id) => { await fr.evaluate(id => document.querySelector('#parts button[data-id="' + id + '"]').focus(), id); };
  const key = async (fn) => { await p.evaluate(() => (window.__log = [])); await fn(); await p.waitForTimeout(700); return sent(); };
  const tT = await touch(60); await focusIt(termId); const kT = await key(() => p.keyboard.press("Enter"));
  const tH = await touch(650); await focusIt(termId); const kH = await key(() => p.keyboard.press("Shift+Enter"));
  if (tT.length !== 1 || tT[0].id !== termId || JSON.stringify(tT) !== JSON.stringify(kT)) fails.push("tap " + JSON.stringify(tT) + " vs Enter " + JSON.stringify(kT));
  if (tH.length !== 1 || JSON.stringify(tH) !== JSON.stringify(kH)) fails.push("hold " + JSON.stringify(tH) + " vs Shift-Enter " + JSON.stringify(kH));
  if (yid === "calc") {
    await fr.evaluate(t => window.__motion.renderAt(t), total);
    await focusIt("calc.r"); await p.keyboard.press("ArrowRight"); await p.waitForTimeout(500);
    let ln = await p.evaluate(() => document.getElementById("line").innerText);
    if (!ln.includes("[yui] calc canvas drag mark=calc.r value=0.06")) fails.push("ArrowRight line " + JSON.stringify(ln));
    await focusIt("calc.r"); await p.keyboard.press("ArrowLeft"); await p.waitForTimeout(500);
    ln = await p.evaluate(() => document.getElementById("line").innerText);
    if (!ln.includes("[yui] calc canvas drag mark=calc.r value=0.05")) fails.push("ArrowLeft line " + JSON.stringify(ln));
    const nm = await fr.evaluate(() => document.querySelector('#parts button[data-id="calc.r"]').getAttribute("aria-label"));
    if (!/^r: 0\.05/.test(nm || "")) fails.push("slider name lacks its value: " + nm);
  }
  if (errs.length) fails.push(errs.join(";"));
  if (fails.length) bad++;
  out.push(`${fails.length ? "BAD" : "ok "} yl=${yid} marks=${r.ids.length} walked=${seen.length} tap+hold=same ${fails.join(" | ")}`);
  await p.close();
}
console.log(out.join("\n"));
console.log(`bad ${bad} of ${ids.length} films; films_with_parts ${filmsWithParts}; max-parts parts checked ${parts}; per-frame part checks ${checks}`);
await b.close(); process.exit(bad ? 1 : 0);
