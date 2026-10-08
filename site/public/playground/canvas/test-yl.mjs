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
const kinds = list.map((s) => (/^\s*(say.*\n)?(chart|stat)/.test(s.yl) ? "chart" : /^\s*(say.*\n)?shapes/.test(s.yl) ? "shapes" : /^\s*(say.*\n)?(list|table|timeline|card)/.test(s.yl) ? "lists" : /^\s*(say.*\n)?(choose|pick|ask|slide|form)/.test(s.yl) ? "inputs" : "sketch"));
const chartTypes = new Set(list.flatMap((s) => [...s.yl.matchAll(/^chart (line|bar|area|scatter|pie|donut)/gm)].map((m) => m[1])));
const need = { n: list.length >= 16, shapes: kinds.filter((k) => k === "shapes").length >= 4, sketch: kinds.filter((k) => k === "sketch").length >= 3, charts: kinds.filter((k) => k === "chart").length >= 6, types: ["line", "bar", "area", "pie", "donut"].every((t) => chartTypes.has(t)), stat: list.some((s) => /^stat .*delta=.*spark=/m.test(s.yl)), pair: list.some((s) => /^stat /m.test(s.yl) && /^chart /m.test(s.yl) && /^choose/m.test(s.yl)), choose: list.filter((s) => /^choose/m.test(s.yl)).length >= 1,
  // YUI-327: a list, a +check list, a table, a timeline with done/now/next, a card with a body, and a timeline + choose pair
  lists: kinds.filter((k) => k === "lists").length >= 6, plainList: list.some((s) => /^list /m.test(s.yl) && !/\+check/.test(s.yl)), checkList: list.some((s) => /^list .*\+check/m.test(s.yl)), table: list.some((s) => /^table /m.test(s.yl)),
  timeline: list.some((s) => /^timeline/m.test(s.yl) && /^done /m.test(s.yl) && /^now /m.test(s.yl) && /^next /m.test(s.yl)), card: list.some((s) => /^card .*body=|^card "[^"]*" "/m.test(s.yl)), tlChoose: list.some((s) => /^timeline/m.test(s.yl) && /^choose/m.test(s.yl)),
  // YUI-328: a choose with +other, a pick of several, a slide with end labels, an ask with two buttons, a form with a 1-10 field and a text field, a sketch + choose pair
  inputs: kinds.filter((k) => k === "inputs").length >= 5, chooseOther: list.some((s) => /^choose.*\+other/m.test(s.yl)), pickMany: list.some((s) => /^pick\b.*\|.*\|/m.test(s.yl)), slideEnds: list.some((s) => /^slide\b.*\d-\d+ \w+\|\w+/m.test(s.yl)), askTwo: list.some((s) => /^ask\b.*\w+\|"?[\w ]+"?\s*$/m.test(s.yl)), formFields: list.some((s) => /^form\b/m.test(s.yl) && /:1-10/.test(s.yl) && /:text/.test(s.yl)), sketchChoose: list.some((s) => /^sketch/m.test(s.yl) && /^choose/m.test(s.yl)) };
if (!Object.values(need).every(Boolean)) { bad++; out.push("BAD sample set " + JSON.stringify(need)); } else out.push("ok  " + list.length + " samples (" + kinds.filter((k) => k === "shapes").length + " shapes, " + kinds.filter((k) => k === "sketch").length + " sketch, " + kinds.filter((k) => k === "chart").length + " chart/stat, " + kinds.filter((k) => k === "lists").length + " list/table/timeline/card)");
const b = await chromium.launch({ executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", headless: true });
for (const s of list) {
  const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true });
  const errs = []; p.on("pageerror", (e) => errs.push(String(e)));
  await p.addInitScript(() => { window.__log = []; window.addEventListener("message", (e) => { const m = e.data && e.data.motion; if (m && m !== "time" && m !== "cues") window.__log.push(e.data); }); });
  const r = await p.goto(base + "?yl=" + s.id + "&theme=dark");
  await p.waitForFunction(() => window.__canvas && window.__canvas.loaded, null, { timeout: 15000 }).catch(() => errs.push("not loaded"));
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
const open = async (id) => {
  const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true });
  p.errs = []; p.on("pageerror", (e) => p.errs.push(String(e)));
  await p.goto(base + "?yl=" + id + "&theme=dark");
  await p.waitForFunction(() => window.__canvas && window.__canvas.loaded, null, { timeout: 15000 });
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
const check = async (name, fn) => { const fails = []; let p; try { p = await open(name.id); await fn(p, fails); if (p.errs.length) fails.push(p.errs.join(";")); } catch (e) { fails.push("threw " + String(e).slice(0, 160)); } if (fails.length) bad++; out.push(`${fails.length ? "BAD" : "ok "} inputs ${name.id} ${name.what} ${fails.join(" | ")}`); if (p) await p.close(); };
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
// 8. an unknown id falls back to the films tab instead of a blank canvas
{ const p = await b.newPage({ viewport: { width: 390, height: 844 } }); await p.goto(base + "?yl=nope"); await p.waitForFunction(() => window.__canvas && window.__canvas.loaded, null, { timeout: 15000 }).catch(() => {}); const ok = !(await p.url()).includes("yl="); if (!ok) { bad++; out.push("BAD unknown id kept ?yl="); } else out.push("ok  unknown id falls back"); await p.close(); }
console.log(out.join("\n")); console.log("bad", bad, "of", list.length + 3);
await b.close(); process.exit(bad ? 1 : 0);
