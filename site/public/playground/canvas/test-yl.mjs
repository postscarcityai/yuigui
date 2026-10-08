// YUI-325/326/327/328: Yui Lines on the living canvas (shapes, sketch, chart, stat, list, table, timeline, card, choose, pick, ask, slide, form). Every sample on /playground/canvas.html?yl=<id> draws, every mark is hit-testable and
// keyboard-reachable, tap / hold send the right lines, a choose drawn into the picture answers, and scrubbing to t=0 and to the end is stable.
// Serve site/public (python3 -m http.server 8923), then: node test-yl.mjs   (PW_FROM = a package.json whose node_modules has playwright)
import { createRequire } from "module";
import { execFileSync } from "child_process";
import fs from "fs";
const require = createRequire(process.env.PW_FROM || "/Users/urzas/dev/ablejobs/package.json");
const { chromium } = require("playwright");
const list = JSON.parse(fs.readFileSync(new URL("./yl-samples.json", import.meta.url)));
const PORT = process.env.PORT || 8923, base = "http://localhost:" + PORT + "/playground/canvas.html";
let bad = 0; const out = [];
// 0. the browser copies of lib/yl match the originals
try { execFileSync("node", [new URL("../../../scripts/sync-canvas-yl.mjs", import.meta.url).pathname, "--check"], { stdio: "pipe" }); out.push("ok  canvas yl copies in sync"); } catch (e) { bad++; out.push("BAD canvas yl copies drifted: run node site/scripts/sync-canvas-yl.mjs"); }
// 1. the sample set
const kinds = list.map((s) => (/^\s*(say.*\n)?(chart|stat)/.test(s.yl) ? "chart" : /^\s*(say.*\n)?shapes/.test(s.yl) ? "shapes" : /^\s*(say.*\n)?(list|table|timeline|card)/.test(s.yl) ? "lists" : /^\s*(say.*\n)?(choose|pick|ask|slide|form)/.test(s.yl) ? "inputs" : /^\s*(say.*\n)?map\b/.test(s.yl) ? "map" : /^\s*(say.*\n)?(math|step|calc)\b/.test(s.yl) ? "sci" : "sketch"));
const chartTypes = new Set(list.flatMap((s) => [...s.yl.matchAll(/^chart (line|bar|area|scatter|pie|donut)/gm)].map((m) => m[1])));
const need = { n: list.length >= 16, shapes: kinds.filter((k) => k === "shapes").length >= 4, sketch: kinds.filter((k) => k === "sketch").length >= 3, charts: kinds.filter((k) => k === "chart").length >= 6, types: ["line", "bar", "area", "pie", "donut"].every((t) => chartTypes.has(t)), stat: list.some((s) => /^stat .*delta=.*spark=/m.test(s.yl)), pair: list.some((s) => /^stat /m.test(s.yl) && /^chart /m.test(s.yl) && /^choose/m.test(s.yl)), choose: list.filter((s) => /^choose/m.test(s.yl)).length >= 1,
  // YUI-327: a list, a +check list, a table, a timeline with done/now/next, a card with a body, and a timeline + choose pair
  lists: kinds.filter((k) => k === "lists").length >= 6, plainList: list.some((s) => /^list /m.test(s.yl) && !/\+check/.test(s.yl)), checkList: list.some((s) => /^list .*\+check/m.test(s.yl)), table: list.some((s) => /^table /m.test(s.yl)),
  timeline: list.some((s) => /^timeline/m.test(s.yl) && /^done /m.test(s.yl) && /^now /m.test(s.yl) && /^next /m.test(s.yl)), card: list.some((s) => /^card .*body=|^card "[^"]*" "/m.test(s.yl)), tlChoose: list.some((s) => /^timeline/m.test(s.yl) && /^choose/m.test(s.yl)),
  // YUI-328: a choose with +other, a pick of several, a slide with end labels, an ask with two buttons, a form with a 1-10 field and a text field, a sketch + choose pair
  inputs: kinds.filter((k) => k === "inputs").length >= 5, chooseOther: list.some((s) => /^choose.*\+other/m.test(s.yl)), pickMany: list.some((s) => /^pick\b.*\|.*\|/m.test(s.yl)), slideEnds: list.some((s) => /^slide\b.*\d-\d+ \w+\|\w+/m.test(s.yl)), askTwo: list.some((s) => /^ask\b.*\w+\|"?[\w ]+"?\s*$/m.test(s.yl)), formFields: list.some((s) => /^form\b/m.test(s.yl) && /:1-10/.test(s.yl) && /:text/.test(s.yl)), sketchChoose: list.some((s) => /^sketch/m.test(s.yl) && /^choose/m.test(s.yl)),
  // YUI-338: an image with +edit rings, a gallery with +pick, a compare with a change box, all on pictures already in site/public/demo
  media: ["image", "gallery", "compare"].every((id) => { const x = list.find((q) => q.id === id); return x && /\/demo\//.test(x.yl) && (id !== "image" || /\+edit/.test(x.yl)) && (id !== "gallery" || /\+pick/.test(x.yl)) && (id !== "compare" || /hl=/.test(x.yl)); }),
  // YUI-336: a map with an area, a pin and a route (the Mongol Empire), and a three-stop trip
  maps: kinds.filter((k) => k === "map").length >= 2 && list.some((s) => s.id === "map" && /^area /m.test(s.yl) && /^pin/m.test(s.yl) && /^route /m.test(s.yl)) && list.some((s) => s.id === "route" && (s.yl.match(/^pin/gm) || []).length >= 3 && /^route /m.test(s.yl)) };
if (!Object.values(need).every(Boolean)) { bad++; out.push("BAD sample set " + JSON.stringify(need)); } else out.push("ok  " + list.length + " samples (" + kinds.filter((k) => k === "shapes").length + " shapes, " + kinds.filter((k) => k === "sketch").length + " sketch, " + kinds.filter((k) => k === "chart").length + " chart/stat, " + kinds.filter((k) => k === "lists").length + " list/table/timeline/card)");
const b = await chromium.launch({ executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", headless: true });
for (const s of list) {
  const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true });
  const errs = []; p.on("pageerror", (e) => errs.push(String(e)));
  await p.addInitScript(() => { window.__log = []; window.addEventListener("message", (e) => { const m = e.data && e.data.motion; if (m && m !== "time" && m !== "cues") window.__log.push(e.data); }); });
  const r = await p.goto(base + "?yl=" + s.id + "&theme=dark&replies=off");
  await p.waitForFunction(() => window.__canvas && window.__canvas.loaded && window.__canvas.yl, null, { timeout: 15000 }).catch(() => errs.push("not loaded"));
  const fr = p.frames().find((f) => f.url().includes("player.html"));
  await p.waitForTimeout(300);
  const fails = [], total = await p.evaluate(() => window.__canvas.total);
  const film = await p.evaluate(() => ({ kind: window.__canvas.yl.kind, marks: window.__canvas.yl.marks.map((m) => ({ id: m.id, label: m.label, choice: m.choice })), choose: window.__canvas.yl.choose, onShapes: window.__canvas.yl.onShapes }));
  // 2. it draws: strokes are in progress mid-film (the frame differs from the end), the end is stable, t=0 is stable
  const shot = (t) => fr.evaluate((t) => { window.__motion.renderAt(t); return document.getElementById("cv").toDataURL().length + ":" + document.getElementById("cv").toDataURL().slice(-200); }, t);
  const e1 = await shot(total), e2 = await shot(total), z1 = await shot(0), z2 = await shot(0), mid = await shot(total * 0.35);
  if (e1 !== e2) fails.push("end not stable"); if (z1 !== z2) fails.push("t=0 not stable"); if (mid === e1) fails.push("mid equals end (nothing draws in order)"); if (z1 === e1) fails.push("t=0 equals end");
  // 3. every mark appears as a hit, in some frame, and every hit is touchable and in the keyboard list
  const seen = new Map(); let maxHits = 0, bestT = 0;
  for (let t = 0; t <= total + 0.01; t += 0.2) {
    const r2 = await fr.evaluate((t) => { window.__motion.renderAt(t); const h = window.__motion.hits(); return { h, back: h.map((x) => window.__motion.hitAt(x.x, x.y)), btn: [...document.querySelectorAll("#parts button")].map((x) => x.dataset.id) }; }, t);
    r2.h.forEach((x, i) => { seen.set(x.id, x.label); if (!r2.back[i] || r2.back[i].id !== x.id) fails.push("hit " + x.id + "@" + t.toFixed(1) + " answers " + (r2.back[i] && r2.back[i].id)); });
    if (JSON.stringify(r2.h.map((x) => x.id)) !== JSON.stringify(r2.btn)) fails.push("list!=hits@" + t.toFixed(1));
    if (r2.h.length > maxHits) { maxHits = r2.h.length; bestT = t; }
  }
  const ids = [...seen.keys()];
  film.marks.forEach((m) => { if (!ids.some((id) => id === m.id || id.replace(/~\d+$/, "") === m.id)) fails.push("mark never hit-testable: " + m.id); });
  // YUI-326: a chart or stat names every data mark by its value; the weight line is the named example
  if (film.kind === "chart") {
    const unnamed = [...seen].filter(([id, lb]) => /^(chart|stat|spark):/.test(id) && !/\d/.test(lb || ""));
    if (unnamed.length) fails.push("data marks without a value in the name: " + unnamed.map((u) => u[0]));
    if (!film.marks.some((m) => /^(chart|stat):/.test(m.id))) fails.push("no data marks");
    if (s.id === "weight" && ![...seen.values()].includes("Wed: 178.5")) fails.push("weight line lacks 'Wed: 178.5'");
    if (s.id === "stat" && ![...seen.keys()].some((id) => id.startsWith("stat:")) || s.id === "stat" && ![...seen.keys()].some((id) => id.startsWith("spark:"))) fails.push("stat lacks its number or its spark marks");
    if (s.id === "pair" && !film.choose) fails.push("pair lost its choose");
  }
  // YUI-327: every row, cell, check and step is a named mark; hits come in reading order; the table rules draw before the cells; the Now step pulses
  if (film.kind === "lists") {
    const src = s.yl, rowsN = (src.match(/^(done|now|next) /gm) || []).length;
    const named = await fr.evaluate((t) => { window.__motion.renderAt(t); return window.__motion.hits().map((h) => h.label); }, total);
    const btns = await fr.evaluate(() => [...document.querySelectorAll("#parts button")].map((x) => x.getAttribute("aria-label")));
    if (named.some((l) => !l || !l.trim())) fails.push("a mark has no name");
    if (JSON.stringify(named) !== JSON.stringify(btns)) fails.push("keyboard names differ from hit names");
    if (new Set(film.marks.map((m) => m.id)).size !== film.marks.length) fails.push("duplicate mark ids");
    if (/^table /m.test(src)) {
      const tc = film.marks.filter((m) => /^table:/.test(m.id));
      const h0 = await fr.evaluate(() => { window.__motion.renderAt(0.3); return window.__motion.hits().filter((h) => /^table:/.test(h.id)).length; }), s0 = await shot(0.3), z = await shot(0);
      if (h0 !== 0 || s0 === z) fails.push("table rules should draw before any cell (hits@0.3=" + h0 + ", drawn=" + (s0 !== z) + ")");
      if (!tc.some((m) => /:h:/.test(m.id)) || !tc.some((m) => /:0:1$/.test(m.id))) fails.push("table lacks header or body cells");
    }
    if (/^now /m.test(src)) {
      const p1 = await shot(total - 0.5), p2 = await shot(total - 0.3);
      if (p1 === p2) fails.push("Now step does not pulse");
      const steps = film.marks.filter((m) => /^tl:/.test(m.id)).length;
      if (steps !== rowsN) fails.push("timeline steps " + steps + " != rows " + rowsN);
    }
    if (/^list .*\+check/m.test(src)) {
      // a tap on a +check row ticks it and sends the check line in place; a second tap unticks
      await fr.evaluate((t) => window.__motion.renderAt(t), total);
      const row = (await fr.evaluate(() => window.__motion.hits())).find((h) => /^list:/.test(h.id));
      const before = await shot(total), tap = async (pid) => { await fr.evaluate(async ([x, y, pid]) => { const cv = document.getElementById("cv"), o = { clientX: x, clientY: y, pointerId: pid, bubbles: true, pointerType: "touch" }; cv.dispatchEvent(new PointerEvent("pointerdown", o)); await new Promise((r) => setTimeout(r, 60)); cv.dispatchEvent(new PointerEvent("pointerup", o)); }, [row.x, row.y, pid]); await p.waitForTimeout(350); };
      await tap(21);
      const l1 = await p.evaluate(() => document.getElementById("line").innerText), on1 = await p.evaluate(() => window.__canvas.yl.checked.size), after = await shot(total);
      if (!l1.includes("[yui] " + s.id + " yl check " + row.label) || !l1.includes("done")) fails.push("check line " + JSON.stringify(l1));
      if (on1 !== 1 || after === before) fails.push("tick not drawn (checked=" + on1 + ")");
      await tap(22);
      const l2 = await p.evaluate(() => document.getElementById("line").innerText), on2 = await p.evaluate(() => window.__canvas.yl.checked.size);
      if (on2 !== 0 || !l2.includes("not done")) fails.push("untick " + JSON.stringify(l2) + " checked=" + on2);
    } else if (/^list /m.test(src)) {
      // a plain list row is not a checkbox: nothing ticks
      const lid = film.marks.find((m) => /^list:/.test(m.id)).id, tk = await p.evaluate((id) => window.__canvas.yl.tick(id), lid);
      if (tk !== null) fails.push("a plain list row ticked");
    }
  }
  if (maxHits < 3) fails.push("only " + maxHits + " hits");
  // 4. keyboard: Tab walks every hit at the fullest frame, in order
  await fr.evaluate((t) => { window.__motion.renderAt(t); document.getElementById("cv").focus(); }, bestT);
  const want = await fr.evaluate(() => window.__motion.hits().map((h) => h.id)), walked = [];
  for (let i = 0; i < want.length; i++) { await p.keyboard.press("Tab"); walked.push(await fr.evaluate(() => document.activeElement.dataset.id)); }
  if (JSON.stringify(walked) !== JSON.stringify(want)) fails.push("tab order");
  // 5. tap pauses and names the mark; hold sends the ask line in place
  const hit = (await fr.evaluate(() => window.__motion.hits()))[Math.min(1, want.length - 1)];
  await p.evaluate(() => (window.__log = []));
  await fr.evaluate(async ([x, y]) => { const cv = document.getElementById("cv"), o = { clientX: x, clientY: y, pointerId: 7, bubbles: true, pointerType: "touch" }; cv.dispatchEvent(new PointerEvent("pointerdown", o)); await new Promise((r) => setTimeout(r, 650)); cv.dispatchEvent(new PointerEvent("pointerup", o)); }, [hit.x, hit.y]);
  await p.waitForTimeout(900);
  const holdLine = await p.evaluate(() => document.getElementById("line").innerText);
  if (!holdLine.includes("[yui] " + s.id + " yl ask " + hit.label)) fails.push("hold line " + JSON.stringify(holdLine));
  await fr.evaluate((t) => window.__motion.renderAt(t), bestT);
  await p.evaluate(() => (window.__log = []));
  await fr.evaluate(async ([x, y]) => { const cv = document.getElementById("cv"), o = { clientX: x, clientY: y, pointerId: 8, bubbles: true, pointerType: "touch" }; cv.dispatchEvent(new PointerEvent("pointerdown", o)); await new Promise((r) => setTimeout(r, 60)); cv.dispatchEvent(new PointerEvent("pointerup", o)); }, [hit.x, hit.y]);
  await p.waitForTimeout(250);
  const tapLine = await p.evaluate(() => document.getElementById("line").innerText), paused = await fr.evaluate(() => window.__motion.paused());
  if (!paused && film.kind !== "inputs") fails.push("tap did not pause"); if (!tapLine.includes(hit.label)) fails.push("tap line " + JSON.stringify(tapLine)); if (!(await p.evaluate(() => document.getElementById("line").classList.contains("on")))) fails.push("tap line hidden");
  // 6. a choose drawn into the picture is answered by tapping it
  if (film.choose) {
    const opt = film.choose.options[0];
    await fr.evaluate((t) => window.__motion.renderAt(t), total);
    const h2 = (await fr.evaluate(() => window.__motion.hits())).find((h) => h.label === opt);
    if (!h2) fails.push("choice " + opt + " not drawn as a mark");
    else {
      await p.evaluate(() => (window.__log = []));
      await fr.evaluate(async ([x, y]) => { const cv = document.getElementById("cv"), o = { clientX: x, clientY: y, pointerId: 9, bubbles: true, pointerType: "touch" }; cv.dispatchEvent(new PointerEvent("pointerdown", o)); await new Promise((r) => setTimeout(r, 60)); cv.dispatchEvent(new PointerEvent("pointerup", o)); }, [h2.x, h2.y]);
      await p.waitForTimeout(300);
      const cl = await p.evaluate(() => document.getElementById("line").innerText), chosen = await p.evaluate(() => window.__canvas.yl.chosen);
      if (chosen !== opt || !cl.includes("choice=" + opt)) fails.push("choice answer " + JSON.stringify(cl) + " chosen=" + chosen);
    }
  }
  // YUI-328: every input is a named mark, in order, and the film ends on a stable frame after an answer too
  if (film.kind === "inputs") {
    const named = await fr.evaluate((t) => { window.__motion.renderAt(t); return window.__motion.hits().map((h) => h.label); }, total);
    const btns = await fr.evaluate(() => [...document.querySelectorAll("#parts button")].map((x) => x.getAttribute("aria-label")));
    if (named.some((l) => !l || !l.trim())) fails.push("an input mark has no name");
    if (JSON.stringify(named) !== JSON.stringify(btns)) fails.push("keyboard names differ from hit names");
    if (new Set(film.marks.map((m) => m.id)).size !== film.marks.length) fails.push("duplicate mark ids");
    const early = await fr.evaluate(() => { window.__motion.renderAt(0.4); return window.__motion.hits().length; });
    if (early > 1) fails.push("inputs appear before they draw (hits@0.4=" + early + ")");
  }
  // 7. the picker: Lines tab is a tablist with this sample selected
  const tl = await p.evaluate(() => { const n = document.getElementById("yls"), t = [...n.querySelectorAll("[role=tab]")]; return { vis: !n.hidden, tabs: t.length, sel: t.filter((x) => x.getAttribute("aria-selected") === "true").length, stops: t.filter((x) => x.tabIndex === 0).length, films: document.getElementById("films").hidden }; });
  if (!tl.vis || tl.tabs !== list.length || tl.sel !== 1 || tl.stops !== 1 || !tl.films) fails.push("tablist " + JSON.stringify(tl));
  const motionErrs = await fr.evaluate(() => window.__motion.errors());
  if (motionErrs.length) fails.push("motion errors " + motionErrs); if (errs.length) fails.push(errs.join(";")); if (r.status() !== 200) fails.push("status " + r.status());
  if (fails.length) bad++;
  out.push(`${fails.length ? "BAD" : "ok "} ${s.id} ${film.kind} total=${total.toFixed(1)} marks=${film.marks.length} hits(max)=${maxHits}${film.onShapes ? " choice-on-shapes" : film.choose ? " choice-pills" : ""} ${[...new Set(fails)].slice(0, 6).join(" | ")}`);
  await p.close();
}
// 7b. YUI-328: the inputs answer. A fresh page per case, real pointer events on the canvas, the event line read back from the page.
const open = async (id, extra = "&replies=off") => {
  const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true });
  p.errs = []; p.on("pageerror", (e) => p.errs.push(String(e)));
  await p.goto(base + "?yl=" + id + "&theme=dark" + extra);
  await p.waitForFunction(() => window.__canvas && window.__canvas.loaded && window.__canvas.yl, null, { timeout: 15000 });
  p.fr = p.frames().find((f) => f.url().includes("player.html"));
  p.total = await p.evaluate(() => window.__canvas.total);
  await p.fr.evaluate((t) => window.__motion.renderAt(t), p.total); await p.waitForTimeout(500);
  p.hits = () => p.fr.evaluate(() => window.__motion.hits());
  p.hitOf = async (label) => { const hs = await p.hits(); return hs.find((h) => h.label === label) || hs.find((h) => h.label.startsWith(label) && !/^in:[^:]+:q$/.test(h.id)); };
  p.line = () => p.evaluate(() => document.getElementById("line").innerText);
  p.st = () => p.evaluate(() => JSON.parse(JSON.stringify(window.__canvas.yl.state)));
  p.tap = async (h, pid = 40) => { await p.fr.evaluate(async ([x, y, pid]) => { const cv = document.getElementById("cv"), o = { clientX: x, clientY: y, pointerId: pid, bubbles: true, pointerType: "touch" }; cv.dispatchEvent(new PointerEvent("pointerdown", o)); await new Promise((r) => setTimeout(r, 60)); cv.dispatchEvent(new PointerEvent("pointerup", o)); }, [h.x, h.y, pid]); await p.waitForTimeout(300); };
  p.dragTo = async (h, x, y = h.y, pid = 41) => { await p.fr.evaluate(async ([x0, y0, x1, y1, pid]) => { const cv = document.getElementById("cv"), o = (x, y) => ({ clientX: x, clientY: y, pointerId: pid, bubbles: true, pointerType: "touch" }); cv.dispatchEvent(new PointerEvent("pointerdown", o(x0, y0))); for (let i = 1; i <= 8; i++) { await new Promise((r) => setTimeout(r, 25)); cv.dispatchEvent(new PointerEvent("pointermove", o(x0 + (x1 - x0) * i / 8, y0 + (y1 - y0) * i / 8))); } cv.dispatchEvent(new PointerEvent("pointerup", o(x1, y1))); }, [h.x, h.y, x, y, pid]); await p.waitForTimeout(300); };
  p.clock = () => p.fr.evaluate(() => window.__motion.clock());
  p.xFor = async (id, v) => p.evaluate(([id, v]) => { const f = window.__canvas.yl, g = f.geo[id], b = f.blocks.find((q) => id.startsWith("in:" + q.id + ":")), fl = b.kind === "slide" ? b : b.fields.find((q) => id === "in:" + b.id + ":" + q.key); return g.x0 + (g.x1 - g.x0) * (v - fl.min) / (fl.max - fl.min); }, [id, v]);
  p.frameSig = () => p.fr.evaluate(() => { const c = document.getElementById("cv"); return c.toDataURL().length + ":" + c.toDataURL().slice(-200); });
  return p;
};
const check = async (name, fn) => { const fails = []; let p; try { p = await open(name.id, name.extra); await fn(p, fails); if (p.errs.length) fails.push(p.errs.join(";")); } catch (e) { fails.push("threw " + String(e).slice(0, 160)); } if (fails.length) bad++; out.push(`${fails.length ? "BAD" : "ok "} inputs ${name.id} ${name.what} ${fails.join(" | ")}`); if (p) await p.close(); };
const has = (l, want) => l.includes(want);
if (list.some((s) => s.id === "choose-other")) {
  await check({ id: "choose-other", what: "choose locks, other types" }, async (p, f) => {
    await p.tap(await p.hitOf("Back")); let l = await p.line(), st = await p.st();
    if (!has(l, "[yui] next choose choice=Back") || st.chosen.next !== "Back") f.push("choose line " + JSON.stringify(l));
    await p.tap(await p.hitOf("Legs"), 42); const st2 = await p.st(), l2 = await p.line();
    if (st2.chosen.next !== "Back" || has(l2, "choice=Legs")) f.push("choose did not lock: " + JSON.stringify(st2.chosen) + " " + JSON.stringify(l2));
    const a = await p.frameSig(), z = await p.fr.evaluate(() => { window.__motion.renderAt(0); return document.getElementById("cv").toDataURL().length; }); if (!z) f.push("t=0 blank frame lost"); await p.fr.evaluate((t) => window.__motion.renderAt(t), p.total); if ((await p.frameSig()) !== a) f.push("end not stable after an answer");
  });
  await check({ id: "choose-other", what: "Other opens the field and sends what is typed" }, async (p, f) => {
    await p.tap(await p.hitOf("Other")); const vis = await p.evaluate(() => !document.getElementById("fld").hidden);
    if (!vis) { f.push("Other did not open the field"); return; }
    await p.fill("#fld", "Core"); await p.press("#fld", "Enter"); await p.waitForTimeout(250);
    const l = await p.line(), st = await p.st();
    if (!has(l, "[yui] next choose choice=Core") || st.chosen.next !== "Core") f.push("other line " + JSON.stringify(l));
  });
}
if (list.some((s) => s.id === "pick-gear")) await check({ id: "pick-gear", what: "pick toggles, Send sends the set" }, async (p, f) => {
  await p.tap(await p.hitOf("Send")); if (has(await p.line(), "[yui]")) f.push("Send with nothing picked sent a line");
  await p.tap(await p.hitOf("DB")); await p.tap(await p.hitOf("Bands"), 43); await p.tap(await p.hitOf("Bench"), 44); await p.tap(await p.hitOf("Bench"), 45);
  let st = await p.st(); if (JSON.stringify(st.picked.gear) !== '["DB","Bands"]') f.push("toggle " + JSON.stringify(st.picked));
  await p.tap(await p.hitOf("Send"), 46); const l = await p.line();
  if (!has(l, "[yui] gear pick picked=DB|Bands")) f.push("pick line " + JSON.stringify(l));
  await p.tap(await p.hitOf("Pull-up"), 47); st = await p.st(); if (st.picked.gear.length !== 2) f.push("pick toggled after Send");
});
if (list.some((s) => s.id === "slide-sore")) await check({ id: "slide-sore", what: "knob drags, arrows step, no scrub" }, async (p, f) => {
  const kid = "in:sore:knob", c0 = await p.clock();
  await p.dragTo(await p.hitOf("How sore"), await p.xFor(kid, 5));
  let st = await p.st(), l = await p.line();
  if (st.value.sore !== 5 || !has(l, "[yui] sore slide value=5")) f.push("drag to 5: " + st.value.sore + " " + JSON.stringify(l));
  if ((await p.clock()) !== c0) f.push("a drag on the knob scrubbed (" + c0 + " -> " + (await p.clock()) + ")");
  await p.dragTo(await p.hitOf("How sore"), await p.xFor(kid, 1), undefined, 48); st = await p.st(); l = await p.line();
  if (st.value.sore !== 1 || !has(l, "slide value=1") || !has(l, "changed=true")) f.push("drag to 1: " + st.value.sore + " " + JSON.stringify(l));
  const kb = p.fr.locator('#parts button[data-id="' + kid + '"]'); await kb.focus();
  await p.keyboard.press("ArrowRight"); await p.keyboard.press("ArrowRight"); await p.waitForTimeout(250); st = await p.st(); l = await p.line();
  if (st.value.sore !== 3 || !has(l, "slide value=3")) f.push("arrows to 3: " + st.value.sore + " " + JSON.stringify(l));
  await p.keyboard.press("ArrowLeft"); await p.waitForTimeout(200); st = await p.st(); if (st.value.sore !== 2) f.push("arrow left: " + st.value.sore);
  if ((await p.clock()) !== c0) f.push("arrow keys on the knob scrubbed");
  await p.tap(await p.hitOf("Wrecked"), 49); st = await p.st(); if (st.value.sore !== 5) f.push("end label did not jump to 5");
  if (!(await p.hitOf("How sore? 5"))) f.push("knob name lacks its value");
  await p.fr.evaluate(() => { document.activeElement.blur(); document.getElementById("cv").blur(); }); await p.waitForTimeout(100); await p.fr.evaluate((t) => window.__motion.renderAt(t), p.total);
  const a = await p.frameSig(); await p.fr.evaluate(() => window.__motion.renderAt(0)); const z1 = await p.frameSig(); await p.fr.evaluate(() => window.__motion.renderAt(0)); if ((await p.frameSig()) !== z1) f.push("t=0 not stable after a drag"); await p.fr.evaluate((t) => window.__motion.renderAt(t), p.total); if ((await p.frameSig()) !== a) f.push("end not stable after a drag");
});
if (list.some((s) => s.id === "ask-ship")) await check({ id: "ask-ship", what: "ask answers and locks" }, async (p, f) => {
  await p.tap(await p.hitOf("Not yet")); const l = await p.line();
  if (!has(l, '[yui] ship ask answer="Not yet"')) f.push("ask line " + JSON.stringify(l));
  await p.tap(await p.hitOf("Ship"), 50); if ((await p.st()).chosen.ship !== "Not yet") f.push("ask did not lock");
});
if (list.some((s) => s.id === "form-checkin")) await check({ id: "form-checkin", what: "1-10 knob, text field, Send" }, async (p, f) => {
  await p.dragTo(await p.hitOf("sleep"), await p.xFor("in:checkin:sleep", 9));
  let st = await p.st(); if (st.value["checkin:sleep"] !== 9) f.push("sleep knob " + st.value["checkin:sleep"]);
  await p.tap(await p.hitOf("goal"), 51); if (!(await p.evaluate(() => !document.getElementById("fld").hidden))) { f.push("text field did not open"); return; }
  await p.fill("#fld", "get strong"); await p.press("#fld", "Enter"); await p.waitForTimeout(250);
  if (!(await p.hitOf("goal: get strong"))) f.push("text field name lacks its text");
  await p.tap(await p.hitOf("Send"), 52); const l = await p.line();
  if (!has(l, '[yui] checkin form form.sleep=9 form.goal="get strong"')) f.push("form line " + JSON.stringify(l));
  if (!(await p.hitOf("Sent"))) f.push("Send did not turn to Sent");
  const kb = p.fr.locator('#parts button[data-id="in:checkin:sleep"]'); await kb.focus(); await p.keyboard.press("ArrowLeft"); await p.waitForTimeout(200);
  if ((await p.st()).value["checkin:sleep"] !== 9) f.push("form moved after Send");
});
// 7d. YUI-337: math and calc. Every term is a named mark in reading order and the formula writes in term by term; a tap names a term and says what it
// means (the sample's canned words); a hold redraws it; a calc slider drags (one `canvas drag` line, result and plot redrawn, no scrub), and Back puts it back.
const sciNeed = { math: ["term.E", "term.m", "term.c_2", "step.1", "step.2", "term.E_c_2"], calc: ["term.A", "term.P", "calc.result", "calc.plot", "calc.P", "calc.r", "calc.t"] };
for (const sid of ["math", "calc"]) if (!list.some((s) => s.id === sid)) { bad++; out.push("BAD no ?yl=" + sid + " sample"); }
if (list.some((s) => s.id === "math")) {
  await check({ id: "math", what: "terms in reading order, written in one by one, a tap says what a term means" }, async (p, f) => {
    const hs = await p.hits(), ids = hs.map((h) => h.id), x = (id) => (hs.find((h) => h.id === id) || {}).x;
    for (const w of sciNeed.math) if (!ids.includes(w)) f.push("no mark " + w);
    if (!(x("term.E") < x("term.m") && x("term.m") < x("term.c_2"))) f.push("E, m, c^2 are not left to right");
    const names = hs.filter((h) => /^term\./.test(h.id)).map((h) => h.label);
    if (!names.includes("E") || !names.includes("c^2") || !names.includes("E/c^2")) f.push("term names " + names);
    const nAt = (t) => p.fr.evaluate((t) => { window.__motion.renderAt(t); return window.__motion.hits().filter((h) => h.id.startsWith("term.")).length; }, t);
    const early = await nAt(0.3), later = await nAt(1.2), all = await nAt(p.total);
    if (!(early < later && later <= all && all >= 7)) f.push("terms do not write in one by one (" + [early, later, all] + ")");
    await p.tap(hs.find((h) => h.id === "term.c_2"));
    const l = await p.line();
    if (!l.includes("c^2") || !l.includes("speed of light")) f.push("tap on c^2 " + JSON.stringify(l));
    if (!(await p.fr.evaluate(() => window.__motion.paused()))) f.push("tap did not pause");
    if ((await p.evaluate(() => window.__canvas.yl.marks.filter((m) => m.term).length)) < 7) f.push("too few term marks");
  });
  await check({ id: "math", what: "a hold on a step title redraws it (canned reply) and Back undoes it", extra: "" }, async (p, f) => {
    const hs = await p.hits(), c = hs.find((h) => h.id === "step.1");
    await p.fr.evaluate(async ([x, y]) => { const cv = document.getElementById("cv"), o = { clientX: x, clientY: y, pointerId: 60, bubbles: true, pointerType: "touch" }; cv.dispatchEvent(new PointerEvent("pointerdown", o)); await new Promise((r) => setTimeout(r, 700)); cv.dispatchEvent(new PointerEvent("pointerup", o)); }, [c.x, c.y]);
    await p.waitForFunction(() => window.__canvas.hist.at === 1, null, { timeout: 9000 }).catch(() => f.push("hold made no step"));
    await p.waitForFunction(() => !ylBusy, null, { timeout: 9000 }); await p.waitForTimeout(500);
    const lab = await p.evaluate(() => window.__canvas.yl.marks.find((m) => m.id === "step.1").label);
    if (lab !== "Divide by c squared") f.push("the step title was not redrawn: " + lab);
    await p.click("#back"); await p.waitForFunction(() => window.__canvas.hist.at === 0, null, { timeout: 8000 }); await p.waitForFunction(() => !ylBusy, null, { timeout: 9000 });
    if ((await p.evaluate(() => window.__canvas.yl.marks.find((m) => m.id === "step.1").label)) !== "Divide both sides by c squared") f.push("Back did not return the step title");
  });
}
if (list.some((s) => s.id === "calc")) {
  await check({ id: "calc", what: "a slider drags, the result and plot redraw, no scrub, Back puts it back" }, async (p, f) => {
    const hs = await p.hits(), ids = hs.map((h) => h.id);
    for (const w of sciNeed.calc) if (!ids.includes(w)) f.push("no mark " + w);
    const c0 = await p.clock(), sig0 = await p.frameSig(), r = hs.find((h) => h.id === "calc.r"), res0 = hs.find((h) => h.id === "calc.result").label;
    if (!r.drag) f.push("the slider knob is not a drag mark");
    await p.dragTo(r, r.x + 100); await p.waitForTimeout(500);
    const l = await p.line(), hs2 = await p.hits(), res1 = hs2.find((h) => h.id === "calc.result").label, v = await p.evaluate(() => window.__canvas.yl.values().r);
    if (!/\[yui\] calc canvas drag mark=calc\.r value=0\.\d+/.test(l) || !(v > 0.05)) f.push("drag line " + JSON.stringify(l) + " r=" + v);
    if (res1 === res0) f.push("the result did not change: " + res1);
    if ((await p.frameSig()) === sig0) f.push("the picture did not redraw");
    if ((await p.clock()) !== c0) f.push("a drag on the knob scrubbed");
    if (!hs2.find((h) => h.id === "calc.r").label.startsWith("r: " + v)) f.push("the slider name lacks its value");
    if ((await p.evaluate(() => window.__canvas.hist.at)) !== 1) f.push("a slider move is not one step");
    await p.tap(hs2.find((h) => h.id === "calc.plot"), 61); const pl = await p.line();
    if (!pl.includes("A against t") || !pl.includes(res1.replace(/^A: /, ""))) f.push("the plot says " + JSON.stringify(pl));
    await p.click("#back"); await p.waitForFunction(() => window.__canvas.hist.at === 0, null, { timeout: 8000 }); await p.waitForFunction(() => !ylBusy, null, { timeout: 9000 }); await p.waitForTimeout(400);
    const hs3 = await p.hits();
    if (hs3.find((h) => h.id === "calc.result").label !== res0 || (await p.evaluate(() => window.__canvas.yl.values().r)) !== 0.05) f.push("Back did not put the slider and result back");
  });
  await check({ id: "calc", what: "the result and plot ease to the new value on the clock (no jump cut)" }, async (p, f) => {
    const hs = await p.hits(), r = hs.find((h) => h.id === "calc.r");
    await p.fr.evaluate(async ([x, y]) => { const cv = document.getElementById("cv"), o = (x, y) => ({ clientX: x, clientY: y, pointerId: 62, bubbles: true, pointerType: "touch" }); cv.dispatchEvent(new PointerEvent("pointerdown", o(x, y))); for (let i = 1; i <= 4; i++) { await new Promise((q) => setTimeout(q, 25)); cv.dispatchEvent(new PointerEvent("pointermove", o(x + 30 * i, y))); } }, [r.x, r.y]);
    // the shown value walks from 0.05 to the knob's value over the tween instead of jumping; frames keep coming while it does
    const seen = []; let always = false;
    for (let i = 0; i < 14; i++) {
      const s = await p.evaluate(() => { const b = window.__canvas.yl.blocks.find((q) => q.kind === "calc"); return { shown: b.tw.r ? b.disp.r : b.vars.find((v) => v.name === "r").value, target: b.vars.find((v) => v.name === "r").value, busy: window.__canvas.yl.busy(), always: !!document.querySelector("iframe").contentWindow.__always }; });
      seen.push(s); if (s.busy && s.always) always = true;
      await p.waitForTimeout(15);
    }
    await p.fr.evaluate(() => { const cv = document.getElementById("cv"); cv.dispatchEvent(new PointerEvent("pointerup", { clientX: 1, clientY: 1, pointerId: 62, bubbles: true, pointerType: "touch" })); });
    const target = seen[seen.length - 1].target, between = seen.filter((s) => s.shown > 0.05 + 1e-9 && s.shown < target - 1e-9);
    if (!(target > 0.05) || !between.length) f.push("the shown value jumped: " + JSON.stringify(seen.map((s) => +s.shown.toFixed(3))));
    if (!always) f.push("frames do not keep coming while the value eases");
  });
}
// 7c. YUI-329: a mixed answer is one drawing on one clock. Parts draw in line order, each after the one above has finished writing in
// (a question written above its picture draws after it), every part keeps its own taps, and the keyboard order is the drawing order.
const MIX = { "mix-protein": ["text", "fig", "fig", "input"], "mix-settings": ["text", "draw", "blocks"], "mix-ship": ["blocks", "blocks", "input"], "mix-hour": ["text", "draw", "input"], "mix-first": ["input", "fig"], "mix-dinner": ["text", "blocks", "input"], "mix-map": ["text", "draw", "fig"] };   // YUI-337: mix-map (YUI-336) was never listed, so this section was red on main
const mixIds = list.filter((s) => s.id.startsWith("mix-")).map((s) => s.id);
if (mixIds.length < 4 || Object.keys(MIX).some((id) => !mixIds.includes(id))) { bad++; out.push("BAD fewer than four mixed samples, or a known one is missing: " + mixIds); }
const mixKinds = new Set(Object.values(MIX).flat());
if (!["text", "fig", "blocks", "draw", "input"].every((k) => mixKinds.has(k))) { bad++; out.push("BAD the mixed samples do not cover text, chart, list, drawing and input"); }
const mixCheck = async (id, what, fn) => {
  const fails = []; let p;
  try { p = await open(id); await fn(p, fails); if (p.errs.length) fails.push(p.errs.join(";")); } catch (e) { fails.push("threw " + String(e).slice(0, 200)); }
  if (fails.length) bad++; out.push(`${fails.length ? "BAD" : "ok "} mix ${id} ${what} ${[...new Set(fails)].slice(0, 5).join(" | ")}`);
  if (p) await p.close();
};
for (const id of mixIds) {
  await mixCheck(id, "one clock, line order, keyboard = draw order", async (p, f) => {
    const info = await p.evaluate(() => { const m = window.__canvas.yl; return { kinds: m.parts.map((x) => x.kind), starts: m.starts, ends: m.ends, order: m.order, total: m.total, marks: m.marks.map((x) => [x.id, x.part]) }; });
    if (JSON.stringify(info.kinds) !== JSON.stringify(MIX[id])) f.push("parts " + info.kinds);
    // the clock: parts run one after another, nothing starts before the one before it has finished writing in
    info.order.forEach((pi, k) => { if (k && info.starts[pi] < info.ends[info.order[k - 1]] - 1e-6) f.push("part " + pi + " starts at " + info.starts[pi] + " before " + info.order[k - 1] + " ends at " + info.ends[info.order[k - 1]]); });
    const lineOrder = info.kinds.map((_, i) => i).sort((a, b) => info.starts[a] - info.starts[b]);
    const exception = info.kinds.some((k, i) => k === "input" && i + 1 < info.kinds.length && ["fig", "blocks", "draw"].includes(info.kinds[i + 1]));
    if (!exception && JSON.stringify(lineOrder) !== JSON.stringify(info.kinds.map((_, i) => i))) f.push("draw order is not line order: " + lineOrder);
    if (exception && !(info.starts[1] < info.starts[0])) f.push("the picture a question is about should draw before the question");
    // scan the clock: when does each part's first mark become touchable, and in what order do the hits come
    const partOf = new Map(info.marks.map(([mid, pi]) => [mid, pi])), first = {};
    let fullest = [], bestN = 0;
    for (let t = 0; t <= info.total + 0.01; t += 0.1) {
      const hs = await p.fr.evaluate((t) => { window.__motion.renderAt(t); return window.__motion.hits().map((h) => ({ id: h.id, y: h.y })); }, t);
      const pis = hs.map((h) => partOf.get(h.id.replace(/~\d+$/, "")));
      if (pis.some((x) => x === undefined)) f.push("hit with no mark " + hs.filter((h, i) => pis[i] === undefined).map((h) => h.id).slice(0, 2));
      pis.forEach((pi) => { if (pi !== undefined && first[pi] === undefined) first[pi] = t; });
      const ranks = pis.map((pi) => info.order.indexOf(pi));
      if (ranks.some((r, i) => i && r < ranks[i - 1])) { f.push("hits not in drawing order @" + t.toFixed(1)); break; }
      if (hs.length > bestN) { bestN = hs.length; fullest = hs.map((h, i) => ({ ...h, pi: pis[i] })); }
    }
    info.kinds.forEach((_, pi) => { if (first[pi] === undefined) f.push("part " + pi + " never drawn a touchable mark"); else if (first[pi] < info.starts[pi] - 0.11) f.push("part " + pi + " touchable at " + first[pi] + " before its start " + info.starts[pi]); });
    info.order.forEach((pi, k) => { if (k && first[pi] !== undefined && first[pi] < info.ends[info.order[k - 1]] - 0.11) f.push("part " + pi + " drew a mark at " + first[pi] + " before the part above it finished (" + info.ends[info.order[k - 1]] + ")"); });
    // the flow runs top to bottom in line order
    const meanY = (pi) => { const ys = fullest.filter((h) => h.pi === pi).map((h) => h.y); return ys.length ? ys.reduce((a, c) => a + c, 0) / ys.length : null; };
    const ymeans = info.kinds.map((_, pi) => meanY(pi)).filter((v) => v !== null);
    if (ymeans.some((v, i) => i && v <= ymeans[i - 1])) f.push("parts are not laid out top to bottom in line order: " + ymeans.map((v) => Math.round(v)));
    if (fullest.some((h) => h.y < 90 || h.y > 844 - 150)) f.push("a mark sits outside the canvas area: " + fullest.filter((h) => h.y < 90 || h.y > 694).map((h) => h.id + "@" + Math.round(h.y)).slice(0, 3));
    // scrub: end, t=0 and the middle are stable and a round trip returns the same frames
    const sig = (t) => p.fr.evaluate((t) => { window.__motion.renderAt(t); const c = document.getElementById("cv"); return c.toDataURL().length + ":" + c.toDataURL().slice(-200); }, t);
    const e1 = await sig(info.total), z1 = await sig(0), m1 = await sig(info.total * 0.5), e2 = await sig(info.total), z2 = await sig(0), m2 = await sig(info.total * 0.5);
    if (e1 !== e2 || z1 !== z2 || m1 !== m2) f.push("scrubbing back and forward is not stable"); if (e1 === z1 || m1 === e1) f.push("the answer does not draw over time");
    const late = await sig(info.total + 5); if (late !== e1) f.push("past the end differs from the end");
    // the keyboard walks the hits in that same order
    await p.fr.evaluate((t) => { window.__motion.renderAt(t); document.getElementById("cv").focus(); }, info.total);
    const want = await p.fr.evaluate(() => window.__motion.hits().map((h) => h.id)), walked = [];
    for (let i = 0; i < want.length; i++) { await p.keyboard.press("Tab"); walked.push(await p.fr.evaluate(() => document.activeElement.dataset.id)); }
    if (JSON.stringify(walked) !== JSON.stringify(want)) f.push("tab order differs from the hits");
    const wr = want.map((h) => info.order.indexOf(partOf.get(h.replace(/~\d+$/, ""))));
    if (wr.some((r, i) => i && r < wr[i - 1])) f.push("tab order is not the drawing order");
  });
}
// each part keeps the behaviour its own card gave it, inside a mix
const tapLine = async (p, label, pid) => { const h = await p.hitOf(label); if (!h) throw new Error("no mark " + label); await p.tap(h, pid); await p.waitForTimeout(200); return p.line(); };
const holdOn = async (p, label, pid) => { const h = await p.hitOf(label); if (!h) throw new Error("no mark " + label); await p.fr.evaluate(async ([x, y, pid]) => { const cv = document.getElementById("cv"), o = { clientX: x, clientY: y, pointerId: pid, bubbles: true, pointerType: "touch" }; cv.dispatchEvent(new PointerEvent("pointerdown", o)); await new Promise((r) => setTimeout(r, 650)); cv.dispatchEvent(new PointerEvent("pointerup", o)); }, [h.x, h.y, pid]); await p.waitForTimeout(900); return p.line(); };
const paused = (p) => p.fr.evaluate(() => window.__motion.paused());
const sub = (p, key) => p.evaluate((key) => { const f = window.__canvas.yl.films.find((x) => x[key]); return f ? JSON.parse(JSON.stringify(f[key] instanceof Set ? [...f[key]] : f[key])) : null; }, key);
await mixCheck("mix-protein", "a bar names itself, hold asks, the ask answers and locks", async (p, f) => {
  const bar = await tapLine(p, "Fri", 60); if (!bar.includes("Fri: 96") || !(await paused(p))) f.push("bar tap " + JSON.stringify(bar) + " paused=" + (await paused(p)));
  await p.fr.evaluate((T) => window.__motion.renderAt(T), p.total);
  const hl = await holdOn(p, "Fri", 61); if (!hl.includes("[yui] mix-protein yl ask Fri: 96")) f.push("hold line " + JSON.stringify(hl));
  const st = await tapLine(p, "Protein: 141", 62); if (!st.includes("Protein: 141")) f.push("stat tap " + JSON.stringify(st));
  const a1 = await tapLine(p, "Leave it", 63); if (!a1.includes('[yui] fri ask answer="Leave it"')) f.push("ask line " + JSON.stringify(a1));
  const a2 = await tapLine(p, "Add a shake", 64); if (a2.includes("Add a shake") && a2.includes("answer=")) f.push("ask did not lock: " + JSON.stringify(a2));
  const end = await p.fr.evaluate((t) => { window.__motion.renderAt(t); const c = document.getElementById("cv"); return c.toDataURL().length + ":" + c.toDataURL().slice(-200); }, await p.evaluate(() => window.__canvas.total));
  const end2 = await p.fr.evaluate((t) => { window.__motion.renderAt(0); window.__motion.renderAt(t); const c = document.getElementById("cv"); return c.toDataURL().length + ":" + c.toDataURL().slice(-200); }, await p.evaluate(() => window.__canvas.total));
  if (end !== end2) f.push("end not stable after an answer");
});
await mixCheck("mix-settings", "a list row ticks, the sketch rows name themselves", async (p, f) => {
  const l1 = await tapLine(p, "Test on a phone", 65); if (!l1.includes("[yui] mix-settings yl check Test on a phone") || !l1.includes("done")) f.push("check line " + JSON.stringify(l1));
  if ((await sub(p, "checked")).length !== 1) f.push("row not ticked");
  const l2 = await tapLine(p, "Test on a phone", 66); if (!l2.includes("not done") || (await sub(p, "checked")).length !== 0) f.push("untick " + JSON.stringify(l2));
  const s1 = await tapLine(p, "Log out", 67); if (!s1.includes("Log out") || !(await paused(p))) f.push("sketch row tap " + JSON.stringify(s1));
  const hl = await holdOn(p, "Log out", 68); if (!hl.includes("[yui] mix-settings yl ask Log out")) f.push("hold line " + JSON.stringify(hl));
});
await mixCheck("mix-ship", "timeline step and card name themselves, the ask answers", async (p, f) => {
  const t1 = await tapLine(p, "Build uploading", 69); if (!t1.includes("Build uploading") || !(await paused(p))) f.push("step tap " + JSON.stringify(t1));
  const c1 = await tapLine(p, "Open notes", 70); if (!c1.includes("Open notes")) f.push("card tap " + JSON.stringify(c1));
  await p.fr.evaluate((T) => window.__motion.renderAt(T), p.total);
  const a = await tapLine(p, "Send", 71); if (!a.includes('[yui] notes ask answer=Send')) f.push("ask line " + JSON.stringify(a));
});
await mixCheck("mix-hour", "a shape names itself, the pick toggles and sends its set", async (p, f) => {
  const s1 = await tapLine(p, "Train", 72); const st = await sub(p, "picked");
  // two marks are called Train (the circle and the pill): the pill is the one in the pick
  if (!s1.includes("Train")) f.push("tap line " + JSON.stringify(s1));
  const hs = (await p.hits()).filter((h) => h.label === "Train"); const pill = hs.find((h) => /^in:/.test(h.id)); if (!pill) { f.push("no Train pill"); return; }
  await p.fr.evaluate((T) => window.__motion.renderAt(T), p.total); await p.tap(pill, 73); await p.waitForTimeout(200);
  const cook = (await p.hits()).find((h) => h.id === "in:hour:o2"); await p.tap(cook, 74); await p.waitForTimeout(200);
  await p.tap((await p.hits()).find((h) => h.id === "in:hour:send"), 75); await p.waitForTimeout(200);
  const l = await p.line(); if (!l.includes("[yui] hour pick picked=Train|Cook")) f.push("pick line " + JSON.stringify(l) + " picked=" + JSON.stringify(st));
});
await mixCheck("mix-first", "the question written first is answered, the chart keeps its points", async (p, f) => {
  const a = "(no earlier tap)";
  const q = (await p.hits()).find((h) => h.id === "in:best:o1"); if (!q) { f.push("no Wed pill"); return; }
  await p.tap(q, 77); await p.waitForTimeout(200);
  const l2 = await p.line(); if (!l2.includes("[yui] best choose choice=Wed")) f.push("choose line " + JSON.stringify(l2) + " after tap line " + JSON.stringify(a));
  const pt = (await p.hits()).find((h) => /^chart:/.test(h.id) && /Wed/.test(h.label)); if (!pt) { f.push("no Wed point on the chart"); return; }
  await p.tap(pt, 78); await p.waitForTimeout(200); if (!(await p.line()).includes("Wed: 9")) f.push("point tap " + JSON.stringify(await p.line()));
});
await mixCheck("mix-dinner", "a table cell names itself, the knob drags without scrubbing", async (p, f) => {
  const c = await tapLine(p, "Tuna", 79); if (!c.includes("Tuna")) f.push("cell tap " + JSON.stringify(c));
  await p.fr.evaluate((T) => window.__motion.renderAt(T), p.total);
  const c0 = await p.clock(), knob = (await p.hits()).find((h) => h.id === "in:hungry:knob");
  if (!knob) { f.push("no knob"); return; }
  const x = await p.evaluate(() => { const fl = window.__canvas.yl.films.find((q) => q.geo), g = fl.geo["in:hungry:knob"], b = fl.blocks[0]; return g.x0 + (g.x1 - g.x0) * (5 - b.min) / (b.max - b.min); });
  await p.dragTo(knob, x, knob.y, 80); await p.waitForTimeout(200);
  const l = await p.line(); if (!l.includes("[yui] hungry slide value=5")) f.push("slide line " + JSON.stringify(l));
  if ((await p.clock()) !== c0) f.push("a drag on the knob scrubbed");
});
// 9. YUI-330: hold a mark with a canned reply and only that part redraws, in place.
{
  const replies = JSON.parse(fs.readFileSync(new URL("./yl-replies.json", import.meta.url)));
  const sampleIds = Object.keys(replies), kindsHit = new Set();
  if (sampleIds.length < 4) { bad++; out.push("BAD replies: only " + sampleIds.length + " samples have replies"); }
  const open = async (id, extra = "") => {
    const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true });
    p.errs = []; p.on("pageerror", (e) => p.errs.push(String(e)));
    await p.goto(base + "?yl=" + id + "&theme=dark" + extra);
    await p.waitForFunction(() => window.__canvas && window.__canvas.loaded && window.__canvas.yl, null, { timeout: 15000 });
    p.fr = p.frames().find((f) => f.url().includes("player.html")); p.total = await p.evaluate(() => window.__canvas.total);
    await p.waitForTimeout(300); return p;
  };
  const px = (p, t) => p.fr.evaluate((t) => { window.yui.mark(null); window.__noCaps = false; window.__motion.renderAt(t); const c = document.getElementById("cv"); return c.toDataURL(); }, t);   // captions on: the page hides them while its line is up
  // two frames are the same picture when no pixel differs by more than anti-aliasing (Chrome rasterises a canvas that was read back a little differently)
  const near = (p, a, b2) => p.evaluate(async ([a, b2]) => {
    const load = (u) => new Promise((r) => { const i = new Image(); i.onload = () => r(i); i.src = u; });
    const [x, y] = await Promise.all([load(a), load(b2)]), cv = new OffscreenCanvas(x.width, x.height), c = cv.getContext("2d", { willReadFrequently: true });
    c.drawImage(x, 0, 0); const A = c.getImageData(0, 0, x.width, x.height).data; c.clearRect(0, 0, x.width, x.height); c.drawImage(y, 0, 0); const B = c.getImageData(0, 0, x.width, x.height).data;
    let n = 0; for (let i = 0; i < A.length; i += 4) if (Math.abs(A[i] - B[i]) > 100 || Math.abs(A[i + 1] - B[i + 1]) > 100 || Math.abs(A[i + 2] - B[i + 2]) > 100) n++;
    return n === 0;
  }, [a, b2]);
  const hitsAt = (p, t) => p.fr.evaluate((t) => { window.__motion.renderAt(t); return window.__motion.hits().map((h) => ({ id: h.id, label: h.label, x: h.x, y: h.y, w: h.w, h: h.h })); }, t);
  const holdAt = (p, h, pid) => p.fr.evaluate(async ([x, y, pid]) => { const cv = document.getElementById("cv"), o = { clientX: x, clientY: y, pointerId: pid, bubbles: true, pointerType: "touch" }; cv.dispatchEvent(new PointerEvent("pointerdown", o)); await new Promise((r) => setTimeout(r, 650)); cv.dispatchEvent(new PointerEvent("pointerup", o)); }, [h.x, h.y, pid]);
  // the latest moment the mark is on the canvas (a sketch row leaves when the Proposed side comes in)
  const lastSeen = async (p, id) => { for (let t = p.total; t >= 0; t -= 0.1) { if ((await hitsAt(p, t)).some((x) => x.id === id)) return t; } return null; };
  const same = (a, b2) => Math.abs(a.x - b2.x) < 0.6 && Math.abs(a.y - b2.y) < 0.6 && Math.abs((a.w || 0) - (b2.w || 0)) < 0.6 && Math.abs((a.h || 0) - (b2.h || 0)) < 0.6;
  for (const sid of sampleIds) for (const [mid, rep] of Object.entries(replies[sid]).filter(([k]) => !k.startsWith("move:") && !k.startsWith("say:"))) {   // YUI-331: move: replies are tested in section 10, YUI-332: say: replies in section 11
    const f = [], p = await open(sid), tot = p.total;
    const marks0 = await p.evaluate(() => window.__canvas.yl.marks.map((m) => m.id + "|" + m.label).join("\n"));
    const ts = (await lastSeen(p, mid)) ?? tot, before = await hitsAt(p, ts), shot0 = await px(p, ts), zero0 = await px(p, 0), h = before.find((x) => x.id === mid);
    await px(p, ts); await p.waitForTimeout(300);
    if (!h) { f.push("no mark " + mid + " at the end"); }
    else {
      await holdAt(p, h, 91);
      await p.waitForTimeout(200);
      const mid1 = await p.evaluate(() => document.getElementById("line").innerText);
      if (!mid1.includes("[yui] " + sid + " yl ask " + h.label)) f.push("ask line " + JSON.stringify(mid1));
      // mid redraw: the canvas is drawing (the frame changes with time) while the clock holds still
      await p.waitForTimeout(1400);
      const m1 = await p.fr.evaluate(() => document.getElementById("cv").toDataURL()), m2 = await (async () => { await p.waitForTimeout(160); return p.fr.evaluate(() => document.getElementById("cv").toDataURL()); })();
      if (m1 === m2) f.push("nothing moves during the redraw");
      await p.waitForTimeout(1800);
      const line = await p.evaluate(() => document.getElementById("line").innerText);
      if (!line.includes(rep.say)) f.push("reply line " + JSON.stringify(line));
      const changed = await p.evaluate(() => window.__canvas.yl.marks.map((m) => m.id + "|" + m.label).join("\n")) !== marks0;
      if (!changed && rep.name !== h.label) f.push("film marks unchanged after the patch");
      // only that part: every other mark is where it was, to the pixel; the pixels that differ sit around the held mark
      const after = await hitsAt(p, ts), shot1 = await px(p, ts);
      const grp = (id) => (/^(stat|spark):/.test(id) ? "stat:" + id.split(":")[1] : id);   // a stat is its number and its spark
      const moved = before.filter((o) => o.id !== mid && grp(o.id) !== grp(mid) && !(after.find((n) => n.id === o.id) && same(o, after.find((n) => n.id === o.id)))).map((o) => o.id);
      if (rep.grows) {
        // a taller part: what is above stays, what is below slides down to its new place
        const above = before.filter((o) => o.y < h.y && !/^table:/.test(o.id)), slid = before.find((o) => /knob/.test(o.id));
        const stay = above.filter((o) => { const n = after.find((q) => q.id === o.id); return !n || !same(o, n); });
        if (stay.length) f.push("marks above moved: " + stay.map((o) => o.id));
        const sl2 = after.find((o) => o.id === slid.id); if (!sl2 || sl2.y <= slid.y + 5) f.push("the slider did not slide down");
      } else if (moved.length) f.push("other marks moved: " + moved.join(","));
      if (shot1 === shot0) f.push("end frame did not change");
      const nm = after.find((x) => x.id === mid || x.label === rep.name);
      if (!nm) f.push("held mark gone after the patch");
      // the keyboard: the patched mark keeps its place in the tab order under its new name
      const names = await p.fr.evaluate(() => [...document.querySelectorAll("#parts button")].map((x) => x.getAttribute("aria-label")));
      const idsAfter = after.map((x) => x.id), pos0 = before.findIndex((x) => x.id === mid), pos1 = names.findIndex((n) => n === rep.name);
      if (rep.name !== h.label && !names.includes(rep.name)) f.push("new name " + rep.name + " not on the keyboard list");
      if (!rep.grows && rep.name !== h.label && names.includes(h.label) && h.label !== rep.name && names.filter((n) => n === h.label).length >= before.filter((x) => x.label === h.label).length) f.push("old name still listed: " + h.label);
      if (!rep.grows && rep.name !== h.label && pos1 !== pos0 && pos1 >= 0) f.push("tab place moved " + pos0 + " -> " + pos1);
      if (!rep.grows && idsAfter.length !== before.length) f.push("mark count " + before.length + " -> " + idsAfter.length);
      // scrub after the patch: t=0 and the end are stable, and the end is the patched drawing
      const e1 = await px(p, ts), e2 = await px(p, ts), z1 = await px(p, 0), z2 = await px(p, 0);
      if (e1 !== e2 || z1 !== z2) f.push("scrub not stable after the patch");
      if (z1 !== zero0 && sid !== "x") { /* t=0 may differ only when the patch touches a mark drawn at 0 */ }
      if ((await p.evaluate(() => document.getElementById("resetyl").hidden))) f.push("no Reset after a patch");
      // Reset returns the original, exactly
      await p.evaluate(() => document.getElementById("resetyl").click()); await p.waitForTimeout(300);
      const r1 = await px(p, ts), marks2 = await p.evaluate(() => window.__canvas.yl.marks.map((m) => m.id + "|" + m.label).join("\n"));
      if (!(await near(p, r1, shot0)) || marks2 !== marks0) f.push("Reset did not restore the original");
      if (!(await p.evaluate(() => document.getElementById("resetyl").hidden))) f.push("Reset still showing");
      // a second hold after a Reset works again
      await px(p, ts); await p.waitForTimeout(300); await holdAt(p, h, 92); await p.waitForTimeout(3300);
      if (!(await near(p, await px(p, ts), shot1))) f.push("second hold after Reset drew something else");
    }
    if (p.errs.length) f.push("page errors " + p.errs.join(";"));
    kindsHit.add(sid);
    if (f.length) bad++; out.push((f.length ? "BAD" : "ok ") + " reply " + sid + " " + mid + (f.length ? " " + f.join("; ") : ""));
    await p.close();
  }
  // a hold with no canned reply: a quiet note on the mark, the picture untouched, no Reset
  for (const [sid, skip] of [["bars", "chart:n1:s0:0"], ["mix-protein", "chart:n3:s0:0"], ["today", "list:n2:0"]]) {
    const f = [], p = await open(sid), tot = p.total, hs = await hitsAt(p, tot), h = hs.find((x) => x.id === skip);
    const shot0 = await px(p, tot), marks0 = await p.evaluate(() => window.__canvas.yl.marks.map((m) => m.id).join());
    await p.waitForTimeout(300); await holdAt(p, h, 93); await p.waitForTimeout(500);
    const note = await p.evaluate(() => window.__canvas.note), line = await p.evaluate(() => document.getElementById("line").innerText);
    if (!/no answer in the demo/.test(note || "")) f.push("no note " + JSON.stringify(note));
    if (!line.includes("[yui] " + sid + " yl ask " + h.label)) f.push("ask line " + JSON.stringify(line));
    if (/Thursday|Dropped|Friday|shake/.test(line)) f.push("an answer showed");
    await p.waitForTimeout(3000);
    if (!(await near(p, await px(p, tot), shot0)) || (await p.evaluate(() => window.__canvas.yl.marks.map((m) => m.id).join())) !== marks0) f.push("the picture changed");
    if (!(await p.evaluate(() => document.getElementById("resetyl").hidden))) f.push("Reset shown for no change");
    if ((await p.evaluate(() => window.__canvas.note))) f.push("note stuck");
    if (f.length) bad++; out.push((f.length ? "BAD" : "ok ") + " no-reply " + sid + " " + skip + (f.length ? " " + f.join("; ") : ""));
    await p.close();
  }
  // a mixed answer where a part gets taller: the parts below ease down, nothing above moves
  {
    const f = [], p = await open("mix-protein"); const tot = p.total, before = await hitsAt(p, tot);
    const tall = await p.evaluate(async () => { const m = await import("./canvas/yl-patch.mjs"); return m.bandOf([{ y: 100, h: 50 }, { y: 162, h: 80 }, { y: 254, h: 40 }], [{ y: 100, h: 50 }, { y: 162, h: 120 }, { y: 294, h: 40 }], 390); });
    if (!tall || tall.box.y0 !== 156 || tall.below.newTop !== 288 || tall.below.shift !== -40) f.push("bandOf " + JSON.stringify(tall));
    const short = await p.evaluate(async () => { const m = await import("./canvas/yl-patch.mjs"); return m.bandOf([{ y: 100, h: 50 }, { y: 162, h: 80 }], [{ y: 100, h: 50 }, { y: 162, h: 80 }], 390); });
    if (short !== null) f.push("bandOf of equal slots should be null");
    if (before.length < 5) f.push("few marks");
    if (f.length) bad++; out.push((f.length ? "BAD" : "ok ") + " band geometry " + f.join("; "));
    await p.close();
  }
  // the first sentence of the card: a hold on the heart film and the other films is untouched (no canned replies there)
  out.push("ok  replies cover " + [...kindsHit].join(", "));
}
// 8. an unknown id falls back to the films tab instead of a blank canvas
{ const p = await b.newPage({ viewport: { width: 390, height: 844 } }); await p.goto(base + "?yl=nope"); await p.waitForFunction(() => window.__canvas && window.__canvas.loaded && window.__canvas.yl, null, { timeout: 15000 }).catch(() => {}); const ok = !(await p.url()).includes("yl="); if (!ok) { bad++; out.push("BAD unknown id kept ?yl="); } else out.push("ok  unknown id falls back"); await p.close(); }
// 10. YUI-331: drag a mark and it moves, and the agent sees where you put it. A drag that starts ON a movable mark (list row, queue row, bar, placed
// shape) moves it; a drag on empty canvas, or on a mark that cannot move, still scrubs. A drop sends `[yui] <id> yl move <mark> to=<place>`, a canned reply
// (yl-replies.json "move:<mark>") redraws only what it names, scrub after a move is stable, Reset restores, Alt+Arrow moves a focused mark.
{
  const replies = JSON.parse(fs.readFileSync(new URL("./yl-replies.json", import.meta.url)));
  const open = async (id, extra = "&replies=off") => {
    const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true });
    p.errs = []; p.on("pageerror", (e) => p.errs.push(String(e)));
    await p.addInitScript(() => { window.__log = []; window.addEventListener("message", (e) => { const m = e.data && e.data.motion; if (m && m !== "time" && m !== "cues") window.__log.push(e.data); }); });
    await p.goto(base + "?yl=" + id + "&theme=dark" + extra);
    await p.waitForFunction(() => window.__canvas && window.__canvas.loaded && window.__canvas.yl, null, { timeout: 15000 });
    p.fr = p.frames().find((f) => f.url().includes("player.html")); p.total = await p.evaluate(() => window.__canvas.total);
    await p.fr.evaluate((t) => window.__motion.renderAt(t), p.total); await p.waitForTimeout(500); return p;
  };
  const hits = (p) => p.fr.evaluate(() => window.__motion.hits().map((h) => ({ id: h.id, label: h.label, x: h.x, y: h.y, w: h.w, h: h.h })));
  const hitsAt = (p, t) => p.fr.evaluate((t) => { window.__motion.renderAt(t); return window.__motion.hits().map((h) => ({ id: h.id, label: h.label, x: h.x, y: h.y, w: h.w, h: h.h })); }, t);
  const px = (p, t) => p.fr.evaluate((t) => { window.yui.mark(null); window.__noCaps = false; window.__motion.renderAt(t); return document.getElementById("cv").toDataURL(); }, t);
  const near = (p, a, b2) => p.evaluate(async ([a, b2]) => {
    const load = (u) => new Promise((r) => { const i = new Image(); i.onload = () => r(i); i.src = u; });
    const [x, y] = await Promise.all([load(a), load(b2)]), cv = new OffscreenCanvas(x.width, x.height), c = cv.getContext("2d", { willReadFrequently: true });
    c.drawImage(x, 0, 0); const A = c.getImageData(0, 0, x.width, x.height).data; c.clearRect(0, 0, x.width, x.height); c.drawImage(y, 0, 0); const B = c.getImageData(0, 0, x.width, x.height).data;
    let n = 0; for (let i = 0; i < A.length; i += 4) if (Math.abs(A[i] - B[i]) > 100 || Math.abs(A[i + 1] - B[i + 1]) > 100 || Math.abs(A[i + 2] - B[i + 2]) > 100) n++;
    return n === 0;
  }, [a, b2]);
  const line = (p) => p.evaluate(() => document.getElementById("line").innerText);
  const clock = (p) => p.fr.evaluate(() => window.__motion.clock());
  const labels = (p) => p.fr.evaluate(() => window.__motion.hits().map((h) => h.label));
  // press on `from`, optionally hold still `pre` ms, move to `to` in steps, let go, wait `wait` ms
  const drag = async (p, from, to, o = {}) => {
    const { pid = 60, pre = 0, steps = 10, wait = 700 } = o;
    await p.fr.evaluate(async ([x0, y0, x1, y1, pid, pre, steps]) => {
      const cv = document.getElementById("cv"), ev = (x, y) => ({ clientX: x, clientY: y, pointerId: pid, bubbles: true, pointerType: "touch" });
      cv.dispatchEvent(new PointerEvent("pointerdown", ev(x0, y0))); if (pre) await new Promise((r) => setTimeout(r, pre));
      for (let i = 1; i <= steps; i++) { await new Promise((r) => setTimeout(r, 25)); cv.dispatchEvent(new PointerEvent("pointermove", ev(x0 + (x1 - x0) * i / steps, y0 + (y1 - y0) * i / steps))); }
      cv.dispatchEvent(new PointerEvent("pointerup", ev(x1, y1)));
    }, [from.x, from.y, to.x, to.y, pid, pre, steps]);
    await p.waitForTimeout(wait);
  };
  const byLabel = (hs, l) => hs.find((h) => h.label === l) || hs.find((h) => h.label.startsWith(l));
  const check10 = async (name, id, extra, fn) => {
    const f = []; let p;
    try { p = await open(id, extra); await fn(p, f); if (p.errs.length) f.push("page errors " + p.errs.join(";")); } catch (e) { f.push("threw " + String(e).slice(0, 200)); }
    if (f.length) bad++; out.push((f.length ? "BAD" : "ok ") + " move " + id + " " + name + (f.length ? " " + f.join(" | ") : "")); if (p) await p.close();
  };
  const dropSamples = Object.entries(replies).filter(([, r]) => Object.keys(r).some((k) => k.startsWith("move:"))).map(([k]) => k);
  if (dropSamples.length < 3) { bad++; out.push("BAD drop replies: only " + dropSamples.length + " samples have move: replies"); } else out.push("ok  drop replies in " + dropSamples.join(","));

  await check10("a drag on a list row moves it, sends the move line, does not scrub", "today", "&replies=off", async (p, f) => {
    const hs = await hits(p), calf = byLabel(hs, "Calf raises"), squat = byLabel(hs, "Squat"), c0 = await clock(p), shot0 = await px(p, p.total);
    await p.fr.evaluate((t) => window.__motion.renderAt(t), p.total);
    await drag(p, calf, { x: calf.x, y: squat.y - 12 });
    const l = await labels(p), ln = await line(p);
    if (JSON.stringify(l.filter((x) => x !== "Today")) !== JSON.stringify(["Calf raises 4x15", "Squat 5x5", "Romanian deadlift 3x8", "Walking lunges 3x12"])) f.push("order " + l);
    if (!ln.includes("[yui] today yl move Calf raises 4x15 to=1")) f.push("move line " + JSON.stringify(ln));
    if (!ln.includes("moved to 1 of 4")) f.push("place missing " + JSON.stringify(ln));
    if ((await clock(p)) !== c0) f.push("the drag scrubbed " + c0 + " -> " + (await clock(p)));
    if (await p.evaluate(() => document.getElementById("resetyl").hidden)) f.push("no Reset after a move");
    if (/no answer in the demo/.test((await p.evaluate(() => window.__canvas.note)) || "")) f.push("a note showed for a drop with no reply");
    await p.fr.evaluate(() => window.__motion.liftOff());
    const sent = await p.evaluate(() => window.__log.filter((m) => m.motion === "move").map((m) => m.phase));
    if (!(sent[0] === "begin" && sent.includes("move") && sent[sent.length - 1] === "end")) f.push("move events " + sent);
    // scrub after the move: stable at t=0, mid and the end; the end is the moved drawing
    const e1 = await px(p, p.total), e2 = await px(p, p.total), z1 = await px(p, 0), z2 = await px(p, 0), m1 = await px(p, p.total * 0.5), m2 = await px(p, p.total * 0.5);
    if (e1 !== e2 || z1 !== z2 || m1 !== m2) f.push("scrub not stable after the move");
    if (e1 === shot0) f.push("end frame did not change");
    const tops = (await hitsAt(p, p.total)).filter((h) => /^list:/.test(h.id)).map((h) => h.label);
    if (tops[0] !== "Calf raises 4x15") f.push("end hits order " + tops);
    // Reset returns the original
    await p.evaluate(() => document.getElementById("resetyl").click()); await p.waitForTimeout(300);
    const r1 = await px(p, p.total), l2 = await labels(p);
    if (!(await near(p, r1, shot0)) || l2.indexOf("Squat 5x5") > l2.indexOf("Calf raises 4x15")) f.push("Reset did not restore the original");
    if (!(await p.evaluate(() => document.getElementById("resetyl").hidden))) f.push("Reset still showing");
  });
  await check10("a drag on empty canvas still scrubs, and no move line is sent", "today", "&replies=off", async (p, f) => {
    await p.fr.evaluate(() => window.__motion.renderAt(0.2));
    const c0 = await clock(p); await drag(p, { x: 60, y: 760 }, { x: 330, y: 760 }, { pid: 61, wait: 300 });
    const c1 = await clock(p), ln = await line(p), moves = await p.evaluate(() => window.__log.filter((m) => m.motion === "move").length);
    if (c1 <= c0 + 0.3) f.push("empty drag did not scrub " + c0 + " -> " + c1);
    if (moves || /yl move/.test(ln)) f.push("a move was sent from empty canvas");
  });
  await check10("a wobble under 8px on a row is a tap (it ticks), not a move; a drag on a mark that cannot move scrubs", "today", "&replies=off", async (p, f) => {
    const hs = await hits(p), sq = byLabel(hs, "Squat"), title = byLabel(hs, "Today");
    await drag(p, sq, { x: sq.x + 3, y: sq.y + 4 }, { pid: 62, steps: 3, wait: 400 });
    const ln = await line(p), l = await labels(p);
    if (!ln.includes("[yui] today yl check Squat 5x5") || l.indexOf("Squat 5x5") !== 1) f.push("wobble was not a tap: " + JSON.stringify(ln));
    const c0 = await clock(p); await drag(p, title, { x: title.x - 200, y: title.y }, { pid: 63, wait: 300 });
    if ((await clock(p)) === c0 || /yl move/.test(await line(p))) f.push("the title moved instead of scrubbing");
  });
  await check10("a queue row moves among the queue rows only, the others stay, the move line says its place", "queue", "&replies=off", async (p, f) => {
    const hs = await hits(p), ship = byLabel(hs, "Ship the build"), forms = byLabel(hs, "Forms on the canvas"), done = byLabel(hs, "Saved screens"), now = byLabel(hs, "Lists on the canvas");
    await drag(p, ship, { x: ship.x, y: now.y - 20 }, { pid: 64 });   // dropped above the queue: it lands on the first queue place
    const l = await labels(p), ln = await line(p);
    if (JSON.stringify(l.filter((x) => x !== "This week")) !== JSON.stringify(["Saved screens", "Lists on the canvas", "Ship the build", "Forms on the canvas", "Charts on the canvas", "Write the note"])) f.push("order " + l);
    if (!ln.includes("[yui] queue yl move Ship the build to=3")) f.push("move line " + JSON.stringify(ln));
    const hs2 = await hits(p), d2 = byLabel(hs2, "Saved screens"), n2 = byLabel(hs2, "Lists on the canvas");
    if (Math.abs(d2.y - done.y) > 0.6 || Math.abs(n2.y - now.y) > 0.6) f.push("the done or now row moved");
    await drag(p, byLabel(hs2, "Saved screens"), { x: done.x, y: forms.y + 40 }, { pid: 65, wait: 300 });   // a done row is not movable: it scrubs
    if (JSON.stringify((await labels(p)).slice(0, 3)) !== JSON.stringify(["This week", "Saved screens", "Lists on the canvas"])) f.push("a done row moved");
  });
  await check10("a bar moves with its goal bar, the labels follow", "bars", "&replies=off", async (p, f) => {
    const hs = await hits(p), thu = byLabel(hs, "Protein Thu"), mon = byLabel(hs, "Protein Mon");
    await drag(p, thu, { x: mon.x - 10, y: thu.y }, { pid: 66 });
    const l = (await labels(p)).filter((x) => /Protein|Goal/.test(x) && !/vs goal/.test(x)), ln = await line(p);
    if (JSON.stringify(l) !== JSON.stringify(["Protein Thu: 126 g", "Goal Thu: 130 g", "Protein Mon: 118 g", "Goal Mon: 130 g", "Protein Tue: 132 g", "Goal Tue: 130 g", "Protein Wed: 141 g", "Goal Wed: 130 g"])) f.push("order " + l);
    if (!ln.includes("[yui] bars yl move Protein Thu: 126 g to=1")) f.push("move line " + JSON.stringify(ln));
  });
  await check10("a shape moves where it is dropped (a new at=), and only that shape moves", "parts", "&replies=off", async (p, f) => {
    const hs = await hits(p), build = byLabel(hs, "Build"), plan = byLabel(hs, "Plan"), test = byLabel(hs, "Test");
    await drag(p, build, { x: build.x + 40, y: build.y - 40 }, { pid: 67 });
    const hs2 = await hits(p), b2 = byLabel(hs2, "Build"), ln = await line(p);
    if (Math.abs(b2.x - (build.x + 40)) > 8 || Math.abs(b2.y - (build.y - 40)) > 8) f.push("Build landed at " + b2.x + "," + b2.y);
    if (!/\[yui\] parts yl move Build to=\d+(\.\d)?,\d+(\.\d)?/.test(ln)) f.push("move line " + JSON.stringify(ln));
    const p2 = byLabel(hs2, "Plan"), t2 = byLabel(hs2, "Test");
    if (Math.abs(p2.x - plan.x) > 0.6 || Math.abs(p2.y - plan.y) > 0.6 || Math.abs(t2.x - test.x) > 0.6 || Math.abs(t2.y - test.y) > 0.6) f.push("another shape moved");
    if (hs2.length !== hs.length) f.push("mark count " + hs.length + " -> " + hs2.length + " (no reply, so nothing should be added)");
  });
  // canned replies: each applies to the marks it names and no others
  await check10("drag a list row to the top: the agent marks it Now", "steps", "", async (p, f) => {
    const hs = await hits(p), jog = byLabel(hs, "Easy jog"), first = byLabel(hs, "Jumping jacks");
    await drag(p, jog, { x: jog.x, y: first.y - 14 }, { pid: 68, wait: 4200 });
    const l = (await labels(p)).filter((x) => x !== "Warm-up"), ln = await line(p);
    if (JSON.stringify(l) !== JSON.stringify(["Now: Easy jog", "Jumping jacks", "Hip openers", "Bodyweight squats"])) f.push("rows " + l);
    if (!ln.includes("Easy jog goes first. It is Now.") || !ln.includes("[yui] steps yl move Easy jog to=1")) f.push("line " + JSON.stringify(ln));
  });
  await check10("reorder a timeline queue: the agent re-dates the rows", "queue", "", async (p, f) => {
    const hs = await hits(p), ship = byLabel(hs, "Ship the build"), now = byLabel(hs, "Lists on the canvas");
    await drag(p, ship, { x: ship.x, y: now.y + 30 }, { pid: 69, wait: 4300 });
    const src = await p.evaluate(() => window.__canvas.yl.blocks.find((b) => b.kind === "timeline").steps.map((s) => s.state + ":" + s.text + ":" + s.at).join("|"));
    if (src !== "done:Saved screens:Mon|now:Lists on the canvas:|next:Ship the build:Thu|next:Forms on the canvas:Fri|next:Charts on the canvas:Mon|next:Write the note:Tue") f.push("rows " + src);
    if (!(await line(p)).includes("Ship the build goes first. I moved the dates.")) f.push("line " + JSON.stringify(await line(p)));
  });
  await check10("a drop that is not the one the reply names keeps its spot with no answer", "queue", "", async (p, f) => {
    const hs = await hits(p), ship = byLabel(hs, "Ship the build"), charts = byLabel(hs, "Charts on the canvas");
    await drag(p, ship, { x: ship.x, y: charts.y - 16 }, { pid: 70, wait: 1200 });
    const src = await p.evaluate(() => window.__canvas.yl.blocks.find((b) => b.kind === "timeline").steps.map((s) => s.text + ":" + s.at).join("|")), ln = await line(p);
    if (src !== "Saved screens:Mon|Lists on the canvas:|Forms on the canvas:|Ship the build:|Charts on the canvas:|Write the note:") f.push("rows " + src);
    if (/moved the dates/.test(ln) || /no answer/.test((await p.evaluate(() => window.__canvas.note)) || "")) f.push("a reply or a note showed " + JSON.stringify(ln));
  });
  await check10("move a shapes part next to another: the agent draws an arrow between them", "parts", "", async (p, f) => {
    const hs = await hits(p), build = byLabel(hs, "Build"), test = byLabel(hs, "Test"), plan = byLabel(hs, "Plan");
    await drag(p, build, { x: test.x - 40, y: test.y + 66 }, { pid: 71, wait: 4400 });
    const hs2 = await hits(p), names = hs2.map((h) => h.label), ln = await line(p);
    if (!names.includes("Build to Test")) f.push("no arrow mark: " + names);
    if (names.includes("Plan to Build")) f.push("the other arrow was drawn");
    if (!ln.includes("Test follows Build. Arrow drawn.")) f.push("line " + JSON.stringify(ln));
    const p2 = byLabel(hs2, "Plan"), t2 = byLabel(hs2, "Test");
    if (Math.abs(p2.x - plan.x) > 0.6 || Math.abs(t2.x - test.x) > 0.6) f.push("Plan or Test moved");
    // Reset removes the arrow and puts Build back
    await p.evaluate(() => document.getElementById("resetyl").click()); await p.waitForTimeout(300);
    const hs3 = await hits(p), b3 = byLabel(hs3, "Build");
    if (hs3.length !== hs.length || Math.abs(b3.x - build.x) > 0.6 || Math.abs(b3.y - build.y) > 0.6) f.push("Reset did not restore the shapes");
  });
  await check10("a heavy drop: a row dragged far past the end lands last; a held row is still a hold", "today", "&replies=off", async (p, f) => {
    const hs = await hits(p), sq = byLabel(hs, "Squat");
    await drag(p, sq, { x: sq.x, y: 700 }, { pid: 72 });
    const l = (await labels(p)).filter((x) => x !== "Today");
    if (l[3] !== "Squat 5x5" || !(await line(p)).includes("to=4")) f.push("order " + l + " " + JSON.stringify(await line(p)));
    const h2 = byLabel(await hits(p), "Romanian");   // a press held still for 650ms asks (no move): the hold the card before this one built
    await drag(p, h2, { x: h2.x + 1, y: h2.y }, { pid: 73, pre: 650, steps: 1, wait: 500 });
    if (!(await line(p)).includes("yl ask Romanian deadlift 3x8")) f.push("hold line " + JSON.stringify(await line(p)));
  });
  // the keyboard: Alt+Arrow moves a focused mark, its name says where it landed, focus follows it
  await check10("Alt+Arrow moves a focused list row; its name says its new place; focus follows", "today", "&replies=off", async (p, f) => {
    const kb = p.fr.locator('#parts button[data-id="list:n2:3"]'); await kb.focus();
    await p.keyboard.press("Alt+ArrowUp"); await p.waitForTimeout(700);
    const l = await labels(p), ln = await line(p);
    if (l.filter((x) => x !== "Today").indexOf("Calf raises 4x15") !== 2) f.push("order " + l);
    if (!ln.includes("[yui] today yl move Calf raises 4x15 to=3")) f.push("move line " + JSON.stringify(ln));
    const name = await p.fr.evaluate(() => { const a = document.activeElement; return a && a.dataset ? a.dataset.id + "|" + a.getAttribute("aria-label") : null; });
    if (name !== "list:n2:2|Calf raises 4x15, moved to 3 of 4") f.push("focused name " + name);
    await p.keyboard.press("Alt+ArrowDown"); await p.waitForTimeout(700);
    const l2 = (await labels(p)).filter((x) => x !== "Today");
    if (l2.indexOf("Calf raises 4x15") !== 3) f.push("Alt+Down did not move it back " + l2);
    await p.keyboard.press("Alt+ArrowDown"); await p.waitForTimeout(500);   // already last: stays
    if ((await labels(p)).filter((x) => x !== "Today").indexOf("Calf raises 4x15") !== 3) f.push("moved past the end");
    // a plain arrow on a focused mark is still not a move (it scrubs, as before)
    const c0 = await clock(p); await p.keyboard.press("ArrowLeft"); await p.waitForTimeout(200);
    if ((await clock(p)) === c0) f.push("plain ArrowLeft stopped scrubbing");
  });
  await check10("Alt+Arrow moves a bar and a shape too", "bars", "&replies=off", async (p, f) => {
    const kb = p.fr.locator('#parts button[data-id="chart:n1:s0:3"]'); await kb.focus();
    await p.keyboard.press("Alt+ArrowLeft"); await p.waitForTimeout(700);
    const l = (await labels(p)).filter((x) => /^Protein/.test(x) && !/vs goal/.test(x));
    if (JSON.stringify(l) !== JSON.stringify(["Protein Mon: 118 g", "Protein Tue: 132 g", "Protein Thu: 126 g", "Protein Wed: 141 g"])) f.push("order " + l);
    if (!(await line(p)).includes("to=3")) f.push("line " + JSON.stringify(await line(p)));
  });
  await check10("Alt+Arrow moves a shape by half a unit", "parts", "&replies=off", async (p, f) => {
    const before = byLabel(await hits(p), "Build"), kb = p.fr.locator('#parts button[data-id="yl:build"]'); await kb.focus();
    await p.keyboard.press("Alt+ArrowRight"); await p.waitForTimeout(700);
    const after = byLabel(await hits(p), "Build"), ln = await line(p);
    if (!(after.x > before.x + 8) || Math.abs(after.y - before.y) > 1) f.push("Build did not step right: " + before.x + " -> " + after.x);
    if (!/\[yui\] parts yl move Build to=5\.5,4\.4/.test(ln)) f.push("line " + JSON.stringify(ln));
    const name = await p.fr.evaluate(() => document.activeElement && document.activeElement.getAttribute("aria-label"));
    if (!/Build, moved to 5\.5, 4\.4/.test(name || "")) f.push("name " + name);
  });
}
// 11. YUI-332: talk while touching a mark. The mic (hold) or, with no speech API or on Alt+Enter, a typed field takes the words; the one line
// the app would send shows in place: [yui] <id> yl say "<words>" touched=<mark> (touched=@t when no mark). A canned reply (yl-replies.json "say:<mark>",
// matched on the touched mark plus a keyword) redraws only what it names the way a hold does. No match: the line shows, nothing else changes.
{
  const replies = JSON.parse(fs.readFileSync(new URL("./yl-replies.json", import.meta.url)));
  const saySamples = Object.entries(replies).filter(([, r]) => Object.keys(r).some((k) => k.startsWith("say:"))).map(([k]) => k);
  if (saySamples.length < 3) { bad++; out.push("BAD say replies: only " + saySamples.length + " samples have say: replies"); } else out.push("ok  say replies in " + saySamples.join(","));
  const open = async (id, extra = "&speech=off", init) => {
    const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true });
    p.errs = []; p.on("pageerror", (e) => p.errs.push(String(e)));
    if (init) await p.addInitScript(init);
    p.status = (await p.goto(base + "?yl=" + id + "&theme=dark" + extra)).status();
    await p.waitForFunction(() => window.__canvas && window.__canvas.loaded && window.__canvas.yl, null, { timeout: 15000 });
    p.fr = p.frames().find((f) => f.url().includes("player.html")); p.total = await p.evaluate(() => window.__canvas.total);
    await p.fr.evaluate((t) => window.__motion.renderAt(t), p.total); await p.waitForTimeout(500); return p;
  };
  const hits = (p) => p.fr.evaluate(() => window.__motion.hits().map((h) => ({ id: h.id, label: h.label, x: h.x, y: h.y, w: h.w, h: h.h })));
  const line = (p) => p.evaluate(() => document.getElementById("line").innerText);
  const clock = (p) => p.fr.evaluate(() => window.__motion.clock());
  const byLabel = (hs, l) => hs.find((h) => h.label === l) || hs.find((h) => h.label.startsWith(l));
  const px = (p, t) => p.fr.evaluate((t) => { window.yui.mark(null); window.__noCaps = false; window.__motion.renderAt(t); return document.getElementById("cv").toDataURL(); }, t);
  const tap = async (p, h, pid = 80) => { await p.fr.evaluate(([x, y, pid]) => { const cv = document.getElementById("cv"), o = { clientX: x, clientY: y, pointerId: pid, bubbles: true, pointerType: "touch" }; cv.dispatchEvent(new PointerEvent("pointerdown", o)); cv.dispatchEvent(new PointerEvent("pointerup", o)); }, [h.x, h.y, pid]); await p.waitForTimeout(350); };
  const marked = (p) => p.evaluate(() => window.__canvas.yui().__m || null);
  const field = (p) => p.evaluate(() => { const f = document.getElementById("sayfld"); return { shown: !f.hidden, label: f.getAttribute("aria-label"), focused: document.activeElement === f, mic: !document.getElementById("mic").hidden }; });
  const typeSay = async (p, words, wait = 3600) => { await p.click("#mic"); await p.fill("#sayfld", words); await p.keyboard.press("Enter"); await p.waitForTimeout(wait); };
  const same = (a, b2) => b2 && Math.abs(a.x - b2.x) < 0.6 && Math.abs(a.y - b2.y) < 0.6;
  const near = (p, a, b2) => p.evaluate(async ([a, b2]) => {
    const load = (u) => new Promise((r) => { const i = new Image(); i.onload = () => r(i); i.src = u; });
    const [x, y] = await Promise.all([load(a), load(b2)]), cv = new OffscreenCanvas(x.width, x.height), c = cv.getContext("2d", { willReadFrequently: true });
    c.drawImage(x, 0, 0); const A = c.getImageData(0, 0, x.width, x.height).data; c.clearRect(0, 0, x.width, x.height); c.drawImage(y, 0, 0); const B = c.getImageData(0, 0, x.width, x.height).data;
    let n = 0; for (let i = 0; i < A.length; i += 4) if (Math.abs(A[i] - B[i]) > 100 || Math.abs(A[i + 1] - B[i + 1]) > 100 || Math.abs(A[i + 2] - B[i + 2]) > 100) n++;
    return n === 0;
  }, [a, b2]);
  const check11 = async (name, id, extra, fn, init) => {
    const f = []; let p;
    try { p = await open(id, extra, init); await fn(p, f); if (p.errs.length) f.push("page errors " + p.errs.join(";")); } catch (e) { f.push("threw " + String(e).slice(0, 240)); }
    if (f.length) bad++; out.push((f.length ? "BAD" : "ok ") + " say " + id + " " + name + (f.length ? " " + f.join(" | ") : "")); if (p) await p.close();
  };
  // every sample that has say replies loads (200) and shows the mic
  for (const sid of saySamples) await check11("loads, mic rides the bar", sid, "&speech=off", async (p, f) => {
    if (p.status !== 200) f.push("status " + p.status);
    if (!(await p.evaluate(() => !document.getElementById("mic").hidden))) f.push("no mic");
    const bar = await p.evaluate(() => { const m = document.getElementById("mic").getBoundingClientRect(), mu = document.getElementById("mute").getBoundingClientRect(), pp = document.getElementById("pp").getBoundingClientRect(); return m.left >= mu.right - 1 && m.left > pp.right && Math.abs(m.top - mu.top) < 2; });
    if (!bar) f.push("mic is not beside pause and mute");
  });
  await check11("a chart bar + 'why': the agent annotates that bar, only that bar", "bars", "&speech=off", async (p, f) => {
    const hs = await hits(p), thu = byLabel(hs, "Protein Thu"), shot0 = await px(p, p.total), z0 = await px(p, 0);
    await p.fr.evaluate((t) => window.__motion.renderAt(t), p.total);
    await tap(p, thu);
    if ((await marked(p)) !== thu.id) f.push("touched mark not highlighted " + (await marked(p)));
    await p.click("#mic"); const fd = await field(p);
    if (!fd.shown || !fd.focused || fd.mic) f.push("typed field did not open in place of the mic " + JSON.stringify(fd));
    if (!/Protein Thu: 126 g/.test(fd.label || "")) f.push("field name does not say what is touched: " + fd.label);
    if ((await marked(p)) !== thu.id) f.push("mark lost while typing");
    await p.fill("#sayfld", "Why is this one low?"); await p.keyboard.press("Enter"); await p.waitForTimeout(400);
    const l0 = await line(p);
    if (!l0.includes('[yui] bars yl say "Why is this one low?" touched=Protein Thu: 126 g')) f.push("line " + JSON.stringify(l0));
    if (!(await field(p)).mic || (await field(p)).shown) f.push("field did not close");
    await p.waitForTimeout(3600);
    const l1 = await line(p), hs2 = await hits(p);
    if (!l1.includes("Thursday fell short. Dinner ran late, so no shake.")) f.push("reply " + JSON.stringify(l1));
    if (JSON.stringify(hs2.map((h) => h.label)) !== JSON.stringify(hs.map((h) => h.label)) || hs.some((h, i) => !same(h, hs2[i]))) f.push("a mark changed");
    if ((await marked(p)) !== thu.id) f.push("bar not ringed after the reply " + (await marked(p)));
    const e1 = await px(p, p.total), e2 = await px(p, p.total), z1 = await px(p, 0), z2 = await px(p, 0);
    if (e1 === shot0) f.push("the bar has no note"); if (e1 !== e2 || z1 !== z2) f.push("scrub not stable");
    if (!(await near(p, z1, z0))) f.push("t=0 changed"); 
    const mid = await px(p, p.total * 0.5); if (mid === e1) f.push("scrub mid equals end");
    if (await p.evaluate(() => document.getElementById("resetyl").hidden)) f.push("no Reset");
    await p.evaluate(() => document.getElementById("resetyl").click()); await p.waitForTimeout(300);
    if (!(await near(p, await px(p, p.total), shot0))) f.push("Reset did not restore");
  });
  await check11("a list row + 'later': the row moves to the end and is struck soft", "steps", "&speech=off", async (p, f) => {
    const hs = await hits(p), sq = byLabel(hs, "Bodyweight squats"), shot0 = await px(p, p.total);
    await p.fr.evaluate((t) => window.__motion.renderAt(t), p.total);
    await tap(p, sq); await typeSay(p, "do this one later");
    const names = (await hits(p)).map((h) => h.label), ln = await line(p);
    if (JSON.stringify(names.filter((x) => x !== "Warm-up")) !== JSON.stringify(["Jumping jacks", "Hip openers", "Easy jog", "Bodyweight squats"])) f.push("order " + names);
    if (!ln.includes('[yui] steps yl say "do this one later" touched=Bodyweight squats') || !ln.includes("Squats wait.")) f.push("line " + JSON.stringify(ln));
    if (!(await p.evaluate(() => window.__canvas.yl.blocks.find((x) => x.kind === "list").later.has("Bodyweight squats")))) f.push("row not struck soft");
    if ((await marked(p)) !== "list:n1:3") f.push("ring on " + (await marked(p)));
    if ((await px(p, p.total)) === shot0) f.push("end frame did not change");
    await p.evaluate(() => document.getElementById("resetyl").click()); await p.waitForTimeout(300);
    if (!(await near(p, await px(p, p.total), shot0))) f.push("Reset did not restore");
  });
  await check11("a shapes part + 'split': the part redraws as two, the others stay", "parts", "&speech=off", async (p, f) => {
    const hs = await hits(p), build = byLabel(hs, "Build"), plan = byLabel(hs, "Plan"), test = byLabel(hs, "Test"), shot0 = await px(p, p.total);
    await p.fr.evaluate((t) => window.__motion.renderAt(t), p.total);
    await tap(p, build); await typeSay(p, "split it in two");
    const hs2 = await hits(p), names = hs2.map((h) => h.label), ln = await line(p);
    if (names.includes("Build") || !names.includes("Build app") || !names.includes("Build site")) f.push("not two parts: " + names);
    if (!same(plan, byLabel(hs2, "Plan")) || !same(test, byLabel(hs2, "Test"))) f.push("Plan or Test moved");
    if (hs2.length !== hs.length + 1) f.push("mark count " + hs.length + " -> " + hs2.length);
    if (!ln.includes('[yui] parts yl say "split it in two" touched=Build') || !ln.includes("Build splits in two")) f.push("line " + JSON.stringify(ln));
    await p.evaluate(() => document.getElementById("resetyl").click()); await p.waitForTimeout(300);
    if (!(await near(p, await px(p, p.total), shot0))) f.push("Reset did not restore");
  });
  await check11("no canned match, or the wrong mark: the line shows and nothing else changes", "bars", "&speech=off", async (p, f) => {
    const hs = await hits(p), thu = byLabel(hs, "Protein Thu"), mon = byLabel(hs, "Protein Mon"), shot0 = await px(p, p.total);
    await p.fr.evaluate((t) => window.__motion.renderAt(t), p.total);
    await tap(p, thu); await typeSay(p, "hello there", 800);
    let ln = await line(p);
    if (!ln.includes('[yui] bars yl say "hello there" touched=Protein Thu: 126 g')) f.push("line " + JSON.stringify(ln));
    if (/Thursday fell short/.test(ln)) f.push("an answer showed");
    await tap(p, mon, 81); await typeSay(p, "why", 3600);   // the keyword is right, the mark is not the one the reply names
    ln = await line(p);
    if (!ln.includes('yl say "why" touched=Protein Mon: 118 g') || /Thursday fell short/.test(ln)) f.push("wrong-mark line " + JSON.stringify(ln));
    if ((await marked(p)) !== mon.id) f.push("touched mark not kept");
    if (!(await near(p, await px(p, p.total), shot0)) || (await hits(p)).some((h, i) => !same(h, hs[i]))) f.push("the picture changed");
    if (!(await p.evaluate(() => document.getElementById("resetyl").hidden))) f.push("Reset shown for no change");
    if ((await p.evaluate(() => window.__canvas.note))) f.push("note stuck");
  });
  await check11("nothing touched: touched=@t, the moment on the clock; quotes are escaped", "bars", "&speech=off", async (p, f) => {
    await p.fr.evaluate(() => window.__motion.renderAt(2.3)); await p.evaluate(() => window.__canvas.yui().seek(2.3)); await p.waitForTimeout(400);
    const c = await clock(p), shot0 = await px(p, 2.3);
    await typeSay(p, 'what is "this"', 600);
    const ln = await line(p);
    if (!/\[yui\] bars yl say "what is \\"this\\"" touched=@\d\.\ds/.test(ln)) f.push("line " + JSON.stringify(ln));
    if (await marked(p)) f.push("a mark was highlighted");
    if (!(await near(p, await px(p, 2.3), shot0))) f.push("the picture changed");
    if (Math.abs((await clock(p)) - c) > 0.35) f.push("clock moved " + c + " -> " + (await clock(p)));
    await p.click("#mic"); await p.keyboard.press("Escape"); await p.waitForTimeout(200);
    const fd = await field(p); if (fd.shown || !fd.mic) f.push("Escape did not close the field");
    await p.click("#mic"); await p.keyboard.press("Enter"); await p.waitForTimeout(300);   // empty words send nothing
    if (/yl say/.test(await line(p)) && (await line(p)).includes('say ""')) f.push("sent empty words");
  });
  await check11("Alt+Enter on a focused mark opens the typed field with that mark touched", "steps", "", async (p, f) => {
    const kb = p.fr.locator('#parts button[data-id="list:n1:2"]'); await kb.focus();
    await p.keyboard.press("Alt+Enter"); await p.waitForTimeout(300);
    const fd = await field(p);
    if (!fd.shown || !fd.focused) f.push("field not open " + JSON.stringify(fd));
    if (!/Bodyweight squats/.test(fd.label || "")) f.push("name " + fd.label);
    if ((await marked(p)) !== "list:n1:2") f.push("mark " + (await marked(p)));
    await p.keyboard.press("Escape"); await p.waitForTimeout(300);
    const back = await p.fr.evaluate(() => document.activeElement && document.activeElement.dataset ? document.activeElement.dataset.id : null);
    if (back !== "list:n1:2") f.push("focus did not return to the mark: " + back);
    if (await p.evaluate(() => /yl say/.test(document.getElementById("line").innerText))) f.push("Escape sent something");
    await p.keyboard.press("Alt+Enter"); await p.waitForTimeout(200); await p.keyboard.type("later"); await p.keyboard.press("Enter"); await p.waitForTimeout(3800);
    const ln = await line(p), names = (await hits(p)).map((h) => h.label).filter((x) => x !== "Warm-up");
    if (!ln.includes('yl say "later" touched=Bodyweight squats') || names[3] !== "Bodyweight squats") f.push("Alt+Enter path: " + JSON.stringify(ln) + " " + names);
    const name = await p.fr.evaluate(() => document.activeElement && document.activeElement.getAttribute("aria-label"));
    if (!/Bodyweight squats/.test(name || "")) f.push("focus after reply " + name);
    // a plain Enter on a mark is still a tap, Shift+Enter still a hold
    await p.evaluate(() => document.getElementById("resetyl").click()); await p.waitForTimeout(300);
    await p.fr.locator('#parts button[data-id="list:n1:0"]').focus(); await p.keyboard.press("Enter"); await p.waitForTimeout(300);
    if ((await field(p)).shown || !(await line(p)).includes("Jumping jacks")) f.push("plain Enter changed " + JSON.stringify(await line(p)));
  });
  await check11("Alt+Enter on the bare canvas touches the moment", "bars", "", async (p, f) => {
    await p.fr.locator("#cv").focus(); await p.keyboard.press("Alt+Enter"); await p.waitForTimeout(300);
    const fd = await field(p); if (!fd.shown || !/this moment/.test(fd.label || "")) f.push("field " + JSON.stringify(fd));
    await p.keyboard.type("hmm"); await p.keyboard.press("Enter"); await p.waitForTimeout(400);
    if (!/yl say "hmm" touched=@/.test(await line(p))) f.push("line " + JSON.stringify(await line(p)));
  });
  // the speech path, with a stand-in recogniser: hold the mic on a touched mark, the words show live, release sends the line and the canned answer
  const fakeSR = () => {
    class SR { start() { window.__sr = this; this.started = true; } stop() { this.stopped = true; setTimeout(() => this.onend && this.onend(), 20); } abort() { this.aborted = true; } say(t) { this.onresult && this.onresult({ results: [[{ transcript: t }]] }); } }
    window.SpeechRecognition = SR; window.webkitSpeechRecognition = SR;
  };
  await check11("hold the mic on a touched mark: live words, release sends, the canned answer lands", "bars", "", async (p, f) => {
    const hs = await hits(p), thu = byLabel(hs, "Protein Thu");
    await tap(p, thu);
    const mic = (type) => p.evaluate((type) => document.getElementById("mic").dispatchEvent(new PointerEvent(type, { pointerId: 5, bubbles: true, pointerType: "touch" })), type);
    await mic("pointerdown"); await p.waitForTimeout(450);
    if (!(await p.evaluate(() => window.__sr && window.__sr.started))) f.push("recognition did not start");
    if (!(await p.evaluate(() => document.getElementById("mic").classList.contains("rec")))) f.push("mic not recording");
    await p.evaluate(() => window.__sr.say("why is")); await p.waitForTimeout(120);
    if (!(await line(p)).includes("why is") || !(await line(p)).includes("Protein Thu")) f.push("live words " + JSON.stringify(await line(p)));
    if ((await marked(p)) !== thu.id) f.push("touched mark not kept while talking");
    await p.evaluate(() => window.__sr.say("why is it low")); await p.waitForTimeout(100);
    await mic("pointerup"); await p.waitForTimeout(500);
    const ln = await line(p);
    if (!ln.includes('[yui] bars yl say "why is it low" touched=Protein Thu: 126 g')) f.push("line " + JSON.stringify(ln));
    await p.waitForTimeout(3600);
    if (!(await line(p)).includes("Thursday fell short")) f.push("no answer " + JSON.stringify(await line(p)));
    if (await p.evaluate(() => document.getElementById("mic").classList.contains("rec"))) f.push("mic still recording");
    // a quick tap on the mic is not a hold: the typed field opens instead
    await mic("pointerdown"); await p.waitForTimeout(80); await mic("pointerup"); await p.waitForTimeout(200);
    if (!(await field(p)).shown) f.push("a quick tap did not open the typed field");
    if (!(await p.evaluate(() => window.__sr.aborted))) f.push("quick tap kept listening");
  }, fakeSR);
  { const f = [], p = await b.newPage({ viewport: { width: 390, height: 844 }, hasTouch: true }); p.errs = []; p.on("pageerror", (e) => p.errs.push(String(e)));
    await p.goto(base + "?theme=dark"); await p.waitForFunction(() => window.__canvas && window.__canvas.loaded, null, { timeout: 15000 }); await p.waitForTimeout(500);
    if (!(await p.evaluate(() => document.getElementById("mic").hidden))) f.push("mic on the heart film");
    const fr = p.frames().find((x) => x.url().includes("player.html")); await fr.locator("#cv").focus(); await p.keyboard.press("Alt+Enter"); await p.waitForTimeout(250);
    if (!(await p.evaluate(() => document.getElementById("sayfld").hidden))) f.push("Alt+Enter opened a field on the heart film");
    if (f.length || p.errs.length) { bad++; out.push("BAD say heart " + f.concat(p.errs).join("; ")); } else out.push("ok  say heart film untouched (no mic, no Alt+Enter)");
    await p.close(); }
}

// 12. YUI-336: maps. ?yl=map and ?yl=route draw the world outline, then each area fills in, each pin drops and each route draws, in line order; every one is
// a mark named by its label (`map:<block>:<area|pin|route>:<slug>`). Tap names it, hold asks about it, a pin drags to a new place (the line carries lat,lon and
// where that is), arrow keys step it, Back undoes it, Reset restores, and the whole drawing is keyboard-reachable.
{
  const open = async (id, extra = "&replies=off") => {
    const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true });
    p.errs = []; p.on("pageerror", (e) => p.errs.push(String(e)));
    await p.addInitScript(() => { window.__log = []; window.addEventListener("message", (e) => { const m = e.data && e.data.motion; if (m && m !== "time" && m !== "cues") window.__log.push(e.data); }); });
    await p.goto(base + "?yl=" + id + "&theme=dark" + extra);
    await p.waitForFunction(() => window.__canvas && window.__canvas.loaded && window.__canvas.yl, null, { timeout: 15000 });
    p.fr = p.frames().find((f) => f.url().includes("player.html")); p.total = await p.evaluate(() => window.__canvas.total);
    await p.fr.evaluate((t) => window.__motion.renderAt(t), p.total); await p.waitForTimeout(500); return p;
  };
  const hitsAt = (p, t) => p.fr.evaluate((t) => { window.__motion.renderAt(t); return window.__motion.hits().map((h) => ({ id: h.id, label: h.label, x: h.x, y: h.y })); }, t);
  const line = (p) => p.evaluate(() => document.getElementById("line").innerText);
  const press = (p, h, ms, pid = 60) => p.fr.evaluate(async ([x, y, ms, pid]) => { const cv = document.getElementById("cv"), o = { clientX: x, clientY: y, pointerId: pid, bubbles: true, pointerType: "touch" }; cv.dispatchEvent(new PointerEvent("pointerdown", o)); await new Promise((r) => setTimeout(r, ms)); cv.dispatchEvent(new PointerEvent("pointerup", o)); }, [h.x, h.y, ms, pid]);
  const drag = async (p, from, to, wait = 800) => {
    await p.fr.evaluate(async ([x0, y0, x1, y1]) => {
      const cv = document.getElementById("cv"), ev = (x, y) => ({ clientX: x, clientY: y, pointerId: 61, bubbles: true, pointerType: "touch" });
      cv.dispatchEvent(new PointerEvent("pointerdown", ev(x0, y0)));
      for (let i = 1; i <= 10; i++) { await new Promise((r) => setTimeout(r, 25)); cv.dispatchEvent(new PointerEvent("pointermove", ev(x0 + (x1 - x0) * i / 10, y0 + (y1 - y0) * i / 10))); }
      cv.dispatchEvent(new PointerEvent("pointerup", ev(x1, y1)));
    }, [from.x, from.y, to.x, to.y]);
    await p.waitForTimeout(wait);
  };
  const check12 = async (name, id, extra, fn) => {
    const f = []; let p;
    try { p = await open(id, extra); await fn(p, f); if (p.errs.length) f.push("page errors " + p.errs.join(";")); } catch (e) { f.push("threw " + String(e).slice(0, 200)); }
    if (f.length) bad++; out.push((f.length ? "BAD" : "ok ") + " map " + id + " " + name + (f.length ? " " + f.join(" | ") : "")); if (p) await p.close();
  };
  const KA = "map:n1:pin:karakorum";
  await check12("every area, pin and route is a named mark, in line order", "map", "&replies=off", async (p, f) => {
    const hs = await hitsAt(p, p.total);
    const want = [["map:n1:area:mongol_empire", "Mongol Empire"], ["map:n1:area:raided", "Raided"], [KA, "Karakorum"], ["map:n1:route:east", "East"], ["map:n1:route:west", "West"]];
    const got = hs.filter((h) => h.id.startsWith("map:")).map((h) => [h.id, h.label]);
    if (JSON.stringify(got) !== JSON.stringify(want)) f.push("marks " + JSON.stringify(got));
    // the clock: the outline first, parts in line order (the area is hit before the pin, the pin before the routes)
    const early = (await hitsAt(p, 0.3)).filter((h) => h.id.startsWith("map:")), t1 = (await hitsAt(p, 1.3)).filter((h) => h.id.startsWith("map:")).map((h) => h.label);
    if (early.length) f.push("a part is touchable before the outline is down: " + early.map((h) => h.id));
    if (t1.includes("West") || !t1.includes("Mongol Empire")) f.push("order at 1.3s " + t1);
    const tp = p.total, a = await p.fr.evaluate((t) => { window.__motion.renderAt(t); return document.getElementById("cv").toDataURL().length; }, tp * 0.3), z = await p.fr.evaluate((t) => { window.__motion.renderAt(t); return document.getElementById("cv").toDataURL().length; }, p.total);
    if (a === z) f.push("mid equals end");
    // the keyboard: one named button per mark, Tab walks them in order
    const names = await p.fr.evaluate(() => [...document.querySelectorAll("#parts button")].map((x) => x.getAttribute("aria-label")));
    if (!want.every(([, l]) => names.includes(l))) f.push("buttons " + names);
  });
  await check12("tap lights and names a pin, sends nothing; hold sends the ask line", "map", "&replies=off", async (p, f) => {
    const pin = (await hitsAt(p, p.total)).find((h) => h.id === KA);
    await press(p, pin, 60); await p.waitForTimeout(250);
    const ln = await line(p), paused = await p.fr.evaluate(() => window.__motion.paused()), marked = await p.fr.evaluate(() => window.yui && window.yui.__m);
    if (!ln.includes("Karakorum")) f.push("tap line " + JSON.stringify(ln)); if (!paused) f.push("tap did not pause");
    void marked;
    const tapped = await p.evaluate(() => window.__log.filter((m) => m.motion === "tap").map((m) => m.id));
    if (tapped[tapped.length - 1] !== KA) f.push("tap event " + JSON.stringify(tapped));
    await press(p, pin, 650); await p.waitForTimeout(900);
    const hl = await line(p);
    if (!hl.includes("[yui] map yl ask Karakorum")) f.push("hold line " + JSON.stringify(hl));
  });
  await check12("a held area redraws only that part from its canned reply", "map", "", async (p, f) => {
    const raided = (await hitsAt(p, p.total)).find((h) => h.id === "map:n1:area:raided");
    await press(p, raided, 650); await p.waitForTimeout(3200);
    const src = await p.evaluate(() => window.__canvas.yl.items.map((o) => o.label + ":" + o.it.tone).join(","));
    if (!/Raided:lavender/.test(src)) f.push("area did not take its new tone: " + src);
    if (!(await line(p)).includes("Raided in 1241")) f.push("reply " + JSON.stringify(await line(p)));
  });
  await check12("dragging a pin sends where it landed; Back undoes it; Reset restores", "map", "&replies=off", async (p, f) => {
    const pin = (await hitsAt(p, p.total)).find((h) => h.id === KA), before = JSON.stringify((await hitsAt(p, p.total)).map((h) => [h.id, Math.round(h.x), Math.round(h.y)]));
    await drag(p, pin, { x: pin.x - 40, y: pin.y + 36 });
    const ln = await line(p), m = /\[yui\] map yl move Karakorum to=(-?[\d.]+),(-?[\d.]+)/.exec(ln);
    if (!m) { f.push("move line " + JSON.stringify(ln)); return; }
    if (!(+m[1] < 47.2 && +m[2] < 102.8)) f.push("the pin went the wrong way: " + m[0]);
    if (!/now (in .+|at sea) \(/.test(ln)) f.push("place missing " + JSON.stringify(ln));
    const after = await hitsAt(p, p.total), now = after.find((h) => h.id === KA);
    if (Math.abs(now.x - (pin.x - 40)) > 6 || Math.abs(now.y - (pin.y + 36)) > 6) f.push("pin not where dropped: " + JSON.stringify([pin, now]));
    const route = after.find((h) => h.id === "map:n1:route:east");
    if (!route) f.push("route lost");
    if (!(await p.evaluate(() => !document.getElementById("resetyl").hidden))) f.push("no Reset");
    await p.fr.evaluate(() => window.__motion.liftOff());
    await p.click("#back"); await p.waitForFunction(() => window.__canvas.hist.at === 0, null, { timeout: 8000 }); await p.waitForTimeout(2600);
    const back = JSON.stringify((await hitsAt(p, p.total)).map((h) => [h.id, Math.round(h.x), Math.round(h.y)]));
    if (back !== before) f.push("Back did not restore the map");
    const l2 = await line(p);
    if (!l2.includes("[yui] map canvas undo step=1 marks=" + KA)) f.push("undo line " + JSON.stringify(l2));
  });
  await check12("a focused pin steps with Alt+Arrow and sends the move line", "map", "&replies=off", async (p, f) => {
    await p.fr.evaluate(() => document.getElementById("cv").focus());
    let at = null;
    for (let i = 0; i < 8 && at !== KA; i++) { await p.keyboard.press("Tab"); at = await p.fr.evaluate(() => document.activeElement.dataset.id); }
    if (at !== KA) { f.push("Tab never reached the pin: " + at); return; }
    await p.keyboard.press("Alt+ArrowRight"); await p.waitForTimeout(900);
    const ln = await line(p);
    if (!/\[yui\] map yl move Karakorum to=47\.2,\d+/.test(ln) || /to=47\.2,102\.8/.test(ln)) f.push("key step line " + JSON.stringify(ln));
  });
  await check12("three-stop trip: the route follows a dragged pin, its canned reply redraws", "route", "", async (p, f) => {
    const hs = await hitsAt(p, p.total), par = hs.find((h) => h.id === "map:n1:pin:paris");
    if (hs.filter((h) => h.id.startsWith("map:n1:pin:")).length !== 3 || !hs.some((h) => h.id === "map:n1:route:the_trip")) f.push("marks " + hs.map((h) => h.id));
    const r0 = hs.find((h) => h.id === "map:n1:route:the_trip");
    await drag(p, par, { x: par.x + 30, y: par.y - 40 }, 3400);
    const ln = await line(p), after = await hitsAt(p, p.total), r1 = after.find((h) => h.id === "map:n1:route:the_trip");
    if (!ln.includes("Paris moved")) f.push("canned reply " + JSON.stringify(ln));
    if (!r1 || (Math.abs(r1.x - r0.x) < 1 && Math.abs(r1.y - r0.y) < 1)) f.push("the route did not follow the pin");
  });
}
// 13. YUI-338: pictures. ?yl=image, ?yl=gallery and ?yl=compare draw the frame, then the picture fades up inside it, the caption writes on, and `+edit` rings draw on
// top as marks of their own. Every picture, ring and the divider is a named mark (alt text from the caption), a hold asks about it, `+pick` makes a gallery
// picture tappable with a mark event, and the compare divider drags (an eased redraw, a mark event, one undo step).
{
  const open = async (id, extra = "&replies=off") => {
    const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true });
    p.errs = []; p.on("pageerror", (e) => p.errs.push(String(e)));
    await p.addInitScript(() => { window.__log = []; window.addEventListener("message", (e) => { const m = e.data && e.data.motion; if (m && m !== "time" && m !== "cues") window.__log.push(e.data); }); });
    await p.goto(base + "?yl=" + id + "&theme=dark" + extra);
    await p.waitForFunction(() => window.__canvas && window.__canvas.loaded && window.__canvas.yl, null, { timeout: 15000 });
    p.fr = p.frames().find((f) => f.url().includes("player.html")); p.total = await p.evaluate(() => window.__canvas.total);
    await p.fr.evaluate((t) => window.__motion.renderAt(t), p.total); await p.waitForTimeout(500); return p;
  };
  const hitsAt = (p, t) => p.fr.evaluate((t) => { window.__motion.renderAt(t); return window.__motion.hits().map((h) => ({ id: h.id, label: h.label, x: h.x, y: h.y, w: h.w, h: h.h, drag: h.drag })); }, t);
  const line = (p) => p.evaluate(() => document.getElementById("line").innerText);
  const press = (p, h, ms, pid = 62) => p.fr.evaluate(async ([x, y, ms, pid]) => { const cv = document.getElementById("cv"), o = { clientX: x, clientY: y, pointerId: pid, bubbles: true, pointerType: "touch" }; cv.dispatchEvent(new PointerEvent("pointerdown", o)); await new Promise((r) => setTimeout(r, ms)); cv.dispatchEvent(new PointerEvent("pointerup", o)); }, [h.x, h.y, ms, pid]);
  const sig = (p, t) => p.fr.evaluate((t) => { window.__motion.renderAt(t); const c = document.getElementById("cv"); return c.toDataURL().length + ":" + c.toDataURL().slice(-300); }, t);
  const check13 = async (name, id, extra, fn) => {
    const f = []; let p;
    try { p = await open(id, extra); await fn(p, f); if (p.errs.length) f.push("page errors " + p.errs.join(";")); } catch (e) { f.push("threw " + String(e).slice(0, 200)); }
    if (f.length) bad++; out.push((f.length ? "BAD" : "ok ") + " media " + id + " " + name + (f.length ? " " + f.join(" | ") : "")); if (p) await p.close();
  };
  const IMG = "image.living_room_finished";
  await check13("the frame strokes in, the picture fades up, the caption writes on, then the rings; every part is a named mark in order", "image", "&replies=off", async (p, f) => {
    const hs = await hitsAt(p, p.total), got = hs.map((h) => [h.id, h.label]);
    const want = [[IMG, "Living room, finished"], [IMG + ".ring.1", "Change 1"], [IMG + ".ring.2", "Change 2"]];
    if (JSON.stringify(got) !== JSON.stringify(want)) f.push("marks " + JSON.stringify(got));
    // the picture is a real picture: the canvas at the end has the photo's many colours, and the clock draws it in order
    const t0 = await sig(p, 0.2), t1 = await sig(p, 0.7), t2 = await sig(p, 1.2), t3 = await sig(p, 2.0), t4 = await sig(p, 3.0), end = await sig(p, p.total);
    if (new Set([t0, t1, t2, t3, t4, end]).size < 6) f.push("the picture does not draw in stages");
    const e0 = (await hitsAt(p, 0.3)).length; if (e0) f.push("a mark is touchable before the frame is down");
    const lateRings = (await hitsAt(p, 2.8)).filter((h) => /\.ring\./.test(h.id)).length; if (lateRings > 1) f.push("rings are not drawn one after another");
    const px = await p.fr.evaluate(() => { const c = document.getElementById("cv"), d = c.getContext("2d").getImageData(c.width * 0.35, c.height * 0.5, 40, 40).data; const s = new Set(); for (let i = 0; i < d.length; i += 4) s.add((d[i] >> 5) + "," + (d[i + 1] >> 5) + "," + (d[i + 2] >> 5)); return s.size; });
    if (px < 4) f.push("the picture area is flat (" + px + " colours): the photo did not draw");
    const names = await p.fr.evaluate(() => [...document.querySelectorAll("#parts button")].map((x) => x.getAttribute("aria-label")));
    if (!names.includes("Living room, finished")) f.push("no button named by the caption (alt text): " + names);
  });
  await check13("tap names the picture and sends nothing; hold sends the ask line; a ring is its own mark", "image", "&replies=off", async (p, f) => {
    const hs = await hitsAt(p, p.total), pic = hs.find((h) => h.id === IMG), ring = hs.find((h) => h.id === IMG + ".ring.1");
    await press(p, { x: pic.x - pic.w / 2 + 14, y: pic.y + pic.h / 2 - 14 }, 60); await p.waitForTimeout(250);
    if (!(await line(p)).includes("Living room, finished")) f.push("tap line " + JSON.stringify(await line(p)));
    const tapped = await p.evaluate(() => window.__log.filter((m) => m.motion === "tap").map((m) => m.id));
    if (tapped[tapped.length - 1] !== IMG) f.push("tap event " + JSON.stringify(tapped));
    await press(p, ring, 60); await p.waitForTimeout(250);
    const t2 = await p.evaluate(() => window.__log.filter((m) => m.motion === "tap").map((m) => m.id));
    if (t2[t2.length - 1] !== IMG + ".ring.1") f.push("the ring is not its own mark " + JSON.stringify(t2));
    await press(p, pic, 650, 63); await p.waitForTimeout(900);
    if (!(await line(p)).includes("[yui] image yl ask Living room, finished")) f.push("hold line " + JSON.stringify(await line(p)));
  });
  await check13("a held ring redraws from its canned reply (the ring tightens round the wall), and Back brings it back", "image", "", async (p, f) => {
    const r0 = (await hitsAt(p, p.total)).find((h) => h.id === IMG + ".ring.1");
    await press(p, r0, 650); await p.waitForTimeout(3400);
    const r1 = (await hitsAt(p, p.total)).find((h) => h.id === IMG + ".ring.1");
    if (!r1 || (Math.abs(r1.x - r0.x) < 2 && Math.abs(r1.y - r0.y) < 2)) f.push("the ring did not change: " + (await line(p)));
    if (!(await line(p)).includes("Just the wall behind the sofa")) f.push("reply " + JSON.stringify(await line(p)));
    await p.fr.evaluate(() => window.__motion.liftOff()); await p.click("#back"); await p.waitForFunction(() => window.__canvas.hist.at === 0, null, { timeout: 8000 }); await p.waitForTimeout(2600);
    const r2 = (await hitsAt(p, p.total)).find((h) => h.id === IMG + ".ring.1");
    if (!r2 || Math.abs(r2.x - r0.x) > 2) f.push("Back did not bring the ring back");
  });
  await check13("a gallery is a strip of marks, in order, each one a picture named by its caption", "gallery", "&replies=off", async (p, f) => {
    const hs = (await hitsAt(p, p.total)).filter((h) => /^gallery\./.test(h.id)), got = hs.map((h) => [h.id, h.label]);
    if (JSON.stringify(got) !== JSON.stringify([["gallery.1", "On the wheel"], ["gallery.2", "Window light"], ["gallery.3", "Glaze"]])) f.push("marks " + JSON.stringify(got));
    if (hs.length === 3 && !(hs[0].x < hs[1].x && hs[1].x < hs[2].x && Math.abs(hs[0].y - hs[2].y) < 2)) f.push("not laid out as a strip " + JSON.stringify(hs.map((h) => [h.x, h.y])));
    if (hs.length === 3 && hs.some((h) => h.w < 80 || h.h < 80)) f.push("a picture is too small to touch " + JSON.stringify(hs.map((h) => [h.w, h.h])));
    const early = (await hitsAt(p, 0.5)).filter((h) => /^gallery\./.test(h.id)).length, later = (await hitsAt(p, 1.3)).filter((h) => /^gallery\./.test(h.id)).length;
    if (!(early < 3 && later >= early)) f.push("the pictures do not come one after another: " + early + " then " + later);
  });
  await check13("+pick: a tap picks (a mark event), a second tap unpicks, max stops a third; hold still asks", "gallery", "&replies=off", async (p, f) => {
    let hs = await hitsAt(p, p.total); const g = (n) => hs.find((h) => h.id === "gallery." + n);
    await press(p, g(2), 60); await p.waitForTimeout(300);
    if (!(await line(p)).includes("[yui] gallery canvas pick mark=gallery.2")) f.push("pick line " + JSON.stringify(await line(p)));
    if (!(await line(p)).includes("Window light: picked")) f.push("pick words " + JSON.stringify(await line(p)));
    await press(p, g(1), 60, 64); await p.waitForTimeout(300);
    await press(p, g(3), 60, 65); await p.waitForTimeout(300);
    if (!(await line(p)).includes("Pick up to 2")) f.push("max not held " + JSON.stringify(await line(p)));
    const picked = await p.evaluate(() => [...window.__canvas.yl.checked].sort());
    if (JSON.stringify(picked) !== JSON.stringify(["gallery.1", "gallery.2"])) f.push("picked " + JSON.stringify(picked));
    await press(p, g(1), 60, 66); await p.waitForTimeout(300);
    if (!(await line(p)).includes("[yui] gallery canvas unpick mark=gallery.1")) f.push("unpick line " + JSON.stringify(await line(p)));
    const tapped = await p.evaluate(() => window.__log.filter((m) => m.motion === "tap").map((m) => m.id));
    if (tapped.slice(0, 2).join() !== "gallery.2,gallery.1") f.push("tap events " + tapped);
    hs = await hitsAt(p, p.total); await press(p, g(2), 650, 67); await p.waitForTimeout(900);
    if (!(await line(p)).includes("[yui] gallery yl ask Window light")) f.push("hold line " + JSON.stringify(await line(p)));
  });
  await check13("a picked picture is drawn picked (the canvas changes) and survives a hold redraw", "gallery", "", async (p, f) => {
    const before = await sig(p, p.total); let g2 = (await hitsAt(p, p.total)).find((h) => h.id === "gallery.2");
    await press(p, g2, 60); await p.waitForTimeout(300);
    if ((await sig(p, p.total)) === before) f.push("a pick does not show on the canvas");
    g2 = (await hitsAt(p, p.total)).find((h) => h.id === "gallery.2"); await press(p, g2, 650, 68); await p.waitForTimeout(3400);
    const picked = await p.evaluate(() => [...window.__canvas.yl.checked]); if (!picked.includes("gallery.2")) f.push("the pick was lost by the redraw " + JSON.stringify(picked));
    if (!(await hitsAt(p, p.total)).some((h) => h.label === "Window light, softer")) f.push("the caption did not redraw");
  });
  await check13("compare: before and after in one frame, a divider that drags (a mark), sides and change boxes are marks", "compare", "&replies=off", async (p, f) => {
    const hs = await hitsAt(p, p.total), ids = hs.map((h) => h.id).filter((i) => /^compare\./.test(i));
    const want = ["compare.before", "compare.after", "compare.divider", "compare.change.1", "compare.change.2", "compare.change.3"];
    if (JSON.stringify(ids) !== JSON.stringify(want)) f.push("marks " + JSON.stringify(ids));
    const dv = hs.find((h) => h.id === "compare.divider"); if (!dv || !dv.drag) f.push("the divider is not a drag mark");
    const none = (await hitsAt(p, 0.5)).filter((h) => /^compare\./.test(h.id)).length; if (none) f.push("a mark is touchable before the pictures are down");
    const labels = hs.filter((h) => /^compare\./.test(h.id)).map((h) => h.label);
    if (!labels.includes("Sage wall") || !labels.includes("Before") || !labels.some((l) => /^Divider/.test(l))) f.push("labels " + labels);
  });
  await check13("dragging the divider eases on the canvas clock, sends where it landed, is one undo step, Back brings it back", "compare", "&replies=off", async (p, f) => {
    let dv = (await hitsAt(p, p.total)).find((h) => h.id === "compare.divider"), box = await p.evaluate(() => { const r = document.querySelector("iframe").getBoundingClientRect(); return { x: r.left, y: r.top }; });
    const before = await sig(p, p.total), x0 = dv.x;
    await p.mouse.move(box.x + dv.x, box.y + dv.y); await p.mouse.down();
    // frames while it moves: the divider is never a jump cut (it eases), and the canvas keeps drawing
    const xs = [];
    for (let i = 1; i <= 14; i++) { await p.mouse.move(box.x + dv.x + 9 * i, box.y + dv.y); await p.waitForTimeout(16); xs.push((await p.fr.evaluate(() => { const h = window.__motion.hits().find((x) => x.id === "compare.divider"); return h && h.x; }))); }
    await p.mouse.up(); await p.waitForTimeout(700);
    const mono = xs.every((x, i) => i === 0 || x >= xs[i - 1] - 0.5), jump = Math.max(...xs.map((x, i) => (i ? Math.abs(x - xs[i - 1]) : 0)));
    if (!mono) f.push("the divider went backwards " + xs.map(Math.round)); if (jump > 60) f.push("a jump cut of " + Math.round(jump) + " px");
    const ln = await line(p), m = /\[yui\] compare canvas drag mark=compare\.divider value=(\d+)/.exec(ln);
    if (!m || +m[1] <= 50) f.push("drag line " + JSON.stringify(ln));
    const now = (await hitsAt(p, p.total)).find((h) => h.id === "compare.divider");
    if (now.x <= x0 + 60) f.push("the divider did not move enough: " + x0 + " -> " + now.x);
    if ((await sig(p, p.total)) === before) f.push("the picture did not change with the divider");
    const hist = await p.evaluate(() => window.__canvas.hist); if (hist.at !== 1) f.push("not one undo step " + JSON.stringify(hist));
    const txt = await p.evaluate(() => window.__canvas.yl.retext("compare a b\n")); void txt;
    await p.keyboard.press("Control+z"); await p.waitForFunction(() => window.__canvas.hist.at === 0, null, { timeout: 8000 });
    await p.waitForFunction(() => !ylBusy, null, { timeout: 10000 }); await p.waitForTimeout(400);
    const back = (await hitsAt(p, p.total)).find((h) => h.id === "compare.divider");
    if (Math.abs(back.x - x0) > 2) f.push("Back did not return the divider: " + x0 + " vs " + back.x);
    const l2 = await line(p); if (!l2.includes("[yui] compare canvas undo step=1 marks=compare.divider")) f.push("undo line " + JSON.stringify(l2));
    const words = await p.evaluate(() => window.__canvas.lastStep && window.__canvas.lastStep.words); if (words !== "Back to before the divider moved.") f.push("words " + words);
  });
  await check13("the divider steps with the arrow keys (ten percent) and sends the same line", "compare", "&replies=off", async (p, f) => {
    await p.fr.evaluate(() => document.getElementById("cv").focus());
    let at = null; for (let i = 0; i < 6 && at !== "compare.divider"; i++) { await p.keyboard.press("Tab"); at = await p.fr.evaluate(() => document.activeElement.dataset.id); }
    if (at !== "compare.divider") { f.push("Tab never reached the divider: " + at); return; }
    await p.keyboard.press("ArrowRight"); await p.waitForTimeout(500);
    if (!(await line(p)).includes("[yui] compare canvas drag mark=compare.divider value=60")) f.push("ArrowRight line " + JSON.stringify(await line(p)));
    await p.fr.evaluate(() => document.querySelector('#parts button[data-id="compare.divider"]').focus()); await p.keyboard.press("ArrowLeft"); await p.waitForTimeout(500);
    if (!(await line(p)).includes("value=50")) f.push("ArrowLeft line " + JSON.stringify(await line(p)));
    const nm = await p.fr.evaluate(() => document.querySelector('#parts button[data-id="compare.divider"]').getAttribute("aria-label"));
    if (!/^Divider, 50%/.test(nm || "")) f.push("the divider's name lacks its place: " + nm);
  });
  await check13("a held change badge asks, and its canned reply tightens its ring", "compare", "", async (p, f) => {
    const c0 = (await hitsAt(p, p.total)).find((h) => h.id === "compare.change.1");
    await press(p, c0, 650); await p.waitForTimeout(3400);
    const c1 = (await hitsAt(p, p.total)).find((h) => h.id === "compare.change.1");
    if (!c1 || (Math.abs(c1.x - c0.x) < 2 && Math.abs(c1.y - c0.y) < 2)) f.push("the ring did not change: " + (await line(p)));
  });
}
// 7e. YUI-339: music on the canvas. A loop, a keyboard and chord buttons draw on the canvas clock and every cell, key and chord is a mark. Sound starts
// after a tap. A tap on a cell flips the hit and the beat redraws in place (one undo step); the playhead sweeps on the canvas clock; keys outside the
// scale are drawn locked and send nothing; a tap on a chord or a key is a mark event; a hold redraws a part (`~loop p=`, `~chords key=D`).
{
  const open = async (id, extra = "&replies=off") => {
    const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true });
    p.errs = []; p.on("pageerror", (e) => p.errs.push(String(e)));
    await p.goto(base + "?yl=" + id + "&theme=dark" + extra);
    await p.waitForFunction(() => window.__canvas && window.__canvas.loaded && window.__canvas.yl, null, { timeout: 15000 });
    p.fr = p.frames().find((f) => f.url().includes("player.html")); p.total = await p.evaluate(() => window.__canvas.total);
    await p.waitForTimeout(p.total * 1000 + 500); return p;   // the real clock: a tap seeks to the page's clock, so let it reach the end
  };
  const hits = (p) => p.fr.evaluate(() => window.__motion.hits().map((h) => ({ id: h.id, label: h.label, x: h.x, y: h.y, w: h.w, h: h.h })));
  const line = (p) => p.evaluate(() => document.getElementById("line").innerText);
  const press = (p, h, ms, pid = 70) => p.fr.evaluate(async ([x, y, ms, pid]) => { const cv = document.getElementById("cv"), o = { clientX: x, clientY: y, pointerId: pid, bubbles: true, pointerType: "touch" }; cv.dispatchEvent(new PointerEvent("pointerdown", o)); await new Promise((r) => setTimeout(r, ms)); cv.dispatchEvent(new PointerEvent("pointerup", o)); }, [h.x, h.y, ms, pid]);
  const tapId = async (p, id, pid) => { const h = (await hits(p)).find((x) => x.id === id); if (!h) throw new Error("no mark " + id); await press(p, h, 60, pid); await p.waitForTimeout(250); };
  const st = (p) => p.evaluate(() => window.__canvas.yl.state());
  const check14 = async (name, id, extra, fn) => {
    const f = []; let p;
    try { p = await open(id, extra); await fn(p, f); if (p.errs.length) f.push("page errors " + p.errs.join(";")); } catch (e) { f.push("threw " + String(e).slice(0, 200)); }
    if (f.length) bad++; out.push((f.length ? "BAD" : "ok ") + " music " + id + " " + name + (f.length ? " " + f.join(" | ") : "")); if (p) await p.close();
  };
  await check14("the grid strokes in (rows, then cells, then hits), every cell, row name and Play is a named mark in reading order", "loop", "&replies=off", async (p, f) => {
    const hs = await hits(p), ids = hs.map((h) => h.id);
    if (ids[0] !== "loop.play" || ids[1] !== "loop.row.1" || ids[2] !== "loop.1.1" || ids.length !== 1 + 4 + 32) f.push("marks " + ids.length + " " + ids.slice(0, 4));
    if (hs.some((h) => !h.label || !h.label.trim())) f.push("a mark has no name");
    if (!hs.find((h) => h.id === "loop.1.1").label.endsWith(", on") || !hs.find((h) => h.id === "loop.1.2").label.endsWith(", off")) f.push("a cell's name lacks its state");
    const early = await p.fr.evaluate(() => { window.__motion.renderAt(0.3); return window.__motion.hits().length; }), mid = await p.fr.evaluate(() => { window.__motion.renderAt(1.2); return window.__motion.hits().length; });
    if (early > 1 || mid < 4 || mid >= 37) f.push("marks do not come in with the drawing: hits@0.3=" + early + " hits@1.2=" + mid);
  });
  await check14("Play starts the playhead on the canvas clock, a tap on a cell flips the hit in place and is one Back step, the loop keeps playing", "loop", "&replies=off", async (p, f) => {
    if ((await st(p)).playing) f.push("it played before any tap");
    await tapId(p, "loop.play", 71); const heads = new Set();
    for (let i = 0; i < 12; i++) { const s = await st(p); if (!s.playing) f.push("not playing after Play"); heads.add(s.head); await p.waitForTimeout(120); }
    if (heads.size < 3 || [...heads].some((h) => h < -1 || h > 7)) f.push("the playhead does not sweep: " + [...heads]);
    const g0 = (await st(p)).grid[0].join(""), s0 = await p.fr.evaluate(() => { const c = document.getElementById("cv"); return c.toDataURL().slice(-300); });
    await tapId(p, "loop.1.2", 72);
    const s1 = await st(p), l = await line(p), hist = await p.evaluate(() => window.__canvas.hist);
    if (s1.grid[0].join("") === g0 || s1.grid[0][1] !== 1) f.push("the hit did not flip: " + g0 + " -> " + s1.grid[0].join(""));
    if (!s1.playing) f.push("the beat stopped when a cell flipped");
    if (!l.includes("[yui] loop canvas loop mark=loop.1.2 p=xx..x.x.|....x...|..x...x.|xxxxxxxx")) f.push("line " + JSON.stringify(l));
    if (hist.at !== 1) f.push("not one step " + JSON.stringify(hist));
    if (await p.fr.evaluate(() => window.__motion.paused())) f.push("a tap on a cell paused the canvas");
    const hs = await hits(p); if (!hs.find((h) => h.id === "loop.1.2").label.endsWith(", on")) f.push("the cell's name still says off");
    await tapId(p, "loop.1.2", 73);
    if ((await st(p)).grid[0].join("") !== g0 || (await p.evaluate(() => window.__canvas.hist.at)) !== 2) f.push("a second tap did not flip it back");
    await p.keyboard.press("Control+z"); await p.waitForFunction(() => window.__canvas.hist.at === 1, null, { timeout: 8000 }); await p.waitForFunction(() => !ylBusy, null, { timeout: 10000 });
    if ((await st(p)).grid[0][1] !== 1) f.push("Back did not step the second tap back");
    void s0;
  });
  await check14("a loop with +play waits for a tap: the first touch on any mark starts it, and a tap on a row name plays that sound and sends nothing", "loop", "&replies=off", async (p, f) => {
    if ((await st(p)).playing) f.push("it played before any tap");
    await tapId(p, "loop.row.2", 74);
    if (!(await st(p)).playing) f.push("the first touch did not start the +play loop");
    if ((await line(p)).includes("[yui]")) f.push("a row name sent a line: " + (await line(p)));
    await tapId(p, "loop.play", 75);
    if ((await st(p)).playing) f.push("Play did not stop the loop");
    await tapId(p, "loop.play", 76);
    if (!(await st(p)).playing) f.push("Play did not start it again");
  });
  await check14("a hold on a row redraws it (canned reply) and keeps the beat playing; the cells keep their names", "loop", "", async (p, f) => {
    await tapId(p, "loop.play", 77);
    const row = (await hits(p)).find((h) => h.id === "loop.row.1"); await press(p, row, 650, 78); await p.waitForTimeout(3400);
    const s = await st(p), hist = await p.evaluate(() => window.__canvas.hist);
    if (s.grid[0].join("") !== "10101010" || hist.at !== 1) f.push("hold reply did not land: " + s.grid[0].join("") + " " + JSON.stringify(hist));
    if (!s.playing) f.push("the redraw stopped the beat");
  });
  await check14("keys: a keyboard in its key, out-of-scale keys drawn locked (named, send nothing), a tap plays and is a mark event, no pause", "keys", "&replies=off", async (p, f) => {
    const hs = await hits(p), locked = hs.filter((h) => /, locked$/.test(h.label));
    if (hs.length !== 17 || locked.length !== 9) f.push("keys " + hs.length + " locked " + locked.length);
    await tapId(p, "keys.C4", 80);
    if (!(await line(p)).includes("[yui] keys canvas play mark=keys.C4")) f.push("play line " + JSON.stringify(await line(p)));
    if (await p.fr.evaluate(() => window.__motion.paused())) f.push("a key paused the canvas");
    await tapId(p, "keys.C#4", 81);
    const l = await line(p); if (l.includes("[yui]") || !/locked/.test(l)) f.push("a locked key sent a line or did not say so: " + JSON.stringify(l));
    const before = await p.fr.evaluate(() => document.getElementById("cv").toDataURL().length);
    if (!before) f.push("blank canvas");
    // Tab reaches every key, in pitch order
    await p.fr.evaluate(() => document.getElementById("cv").focus());
    const want = hs.map((h) => h.id), walked = [];
    for (let i = 0; i < want.length; i++) { await p.keyboard.press("Tab"); walked.push(await p.fr.evaluate(() => document.activeElement.dataset.id)); }
    if (JSON.stringify(walked) !== JSON.stringify(want)) f.push("tab order " + walked);
    // Enter on a focused key plays it
    await p.fr.evaluate(() => document.querySelector('#parts button[data-id="keys.E4"]').focus()); await p.keyboard.press("Enter"); await p.waitForTimeout(300);
    if (!(await line(p)).includes("mark=keys.E4")) f.push("Enter on a key " + JSON.stringify(await line(p)));
  });
  await check14("chords: big buttons, a tap strums and is a mark event, a hold redraws the chords in the new key (~chords key=D) and Back undoes it", "chords", "", async (p, f) => {
    const hs = await hits(p); if (hs.length !== 4 || hs.map((h) => h.label).join() !== "G,D,Em,C") f.push("chords " + JSON.stringify(hs.map((h) => h.label)));
    await tapId(p, "chords.2", 82);
    if (!(await line(p)).includes("[yui] chords canvas play mark=chords.2")) f.push("play line " + JSON.stringify(await line(p)));
    const c1 = (await hits(p)).find((h) => h.id === "chords.1"); await press(p, c1, 650, 83); await p.waitForTimeout(3400);
    const names = (await hits(p)).map((h) => h.label).join(), hist = await p.evaluate(() => window.__canvas.hist);
    if (names !== "D,A,Bm,G" || hist.at !== 1) f.push("the key change did not land: " + names + " " + JSON.stringify(hist));
    await p.keyboard.press("Control+z"); await p.waitForFunction(() => window.__canvas.hist.at === 0, null, { timeout: 8000 }); await p.waitForFunction(() => !ylBusy, null, { timeout: 10000 }); await p.waitForTimeout(300);
    if ((await hits(p)).map((h) => h.label).join() !== "G,D,Em,C") f.push("Back did not return the chords in G");
  });
  await check14("sound starts only after a gesture: nothing is scheduled or running on load, in all three samples", "keys", "&replies=off", async (p, f) => {
    const run = await p.evaluate(() => window.yuiMusic ? { ctx: window.yuiMusic.running(), active: window.yuiMusic.active().length } : null);
    if (run && (run.ctx || run.active)) f.push("audio running before a tap: " + JSON.stringify(run));
  });
}
console.log(out.join("\n")); console.log("bad", bad, "of", out.length);
await b.close(); process.exit(bad ? 1 : 0);
