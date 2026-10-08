// YUI-334: step back on the canvas. A hold redraw, a drag answer and a say+touch patch are three steps; undo x3 lands on the first
// picture, redo x1 on the picture after the first step, and every step says what it did in plain words and sends one event line.
// No browser: node test-undo.mjs. With a served site (python3 -m http.server 8923 in site/public) and playwright: BROWSER=1 node test-undo.mjs
import fs from "fs";
import * as C from "./yl-canvas.mjs";
import * as P from "./yl-patch.mjs";
import * as MV from "./yl-move.mjs";
import * as SY from "./yl-say.mjs";
import * as U from "./yl-undo.mjs";

const here = (p) => new URL(p, import.meta.url);
const samples = JSON.parse(fs.readFileSync(here("./yl-samples.json")));
const replies = JSON.parse(fs.readFileSync(here("./yl-replies.json")));
const page = fs.readFileSync(here("../canvas.html"), "utf8");
const out = []; let bad = 0;
const ok = (m) => out.push("ok  " + m), no = (m) => { bad++; out.push("BAD " + m); };
const is = (name, got, want) => (JSON.stringify(got) === JSON.stringify(want) ? ok(name) : no(`${name}\n     want: ${JSON.stringify(want)}\n     got:  ${JSON.stringify(got)}`));

const T0 = samples.find((x) => x.id === "bars").yl, b0 = C.build(T0);
if (b0.error) { console.log("BAD " + b0.error); process.exit(1); }
const h = U.create(b0.film, T0);
const show = () => h.states[h.at].text;

// 1. hold the Tue bar: its canned reply patches the answer
const holdId = "chart:n1:s0:1", rep1 = P.replyFor(replies, "bars", holdId), T1 = P.applyPatch(T0, rep1);
is("a hold on the Tue bar has a canned redraw", !!T1 && T1 !== T0, true);
U.push(h, { kind: "hold", id: holdId, marks: [holdId], film: C.build(T1).film, text: T1 });

// 2. say+touch on the Thu bar ("why is this one low"): the canned reply for those words patches the answer
const thu = "chart:n1:s0:3", srep = SY.sayReplyFor(replies, "bars", thu, "why is this one low"), T2 = srep ? P.applyPatch(T1, srep) : null;
is("a say+touch on the Thu bar has a canned redraw", !!T2 && T2 !== T1, true);
U.push(h, { kind: "say", id: thu, marks: [thu], film: C.build(T2).film, text: T2 });

// 3. drag the Thu bar one place left (the keyboard move): the move, and the redraw its canned reply asks for, are ONE step
const pl = MV.plan(h.states[h.at].film, T2, thu, { dx: -1 }, { hits: [] });
is("a drag moves the Thu bar", !!pl && pl.text !== T2, true);
U.push(h, { kind: "move", id: pl.newId, marks: [thu, pl.newId], film: C.build(pl.text).film, text: pl.text });
const mrep = MV.moveReplyFor(replies, "bars", thu, pl), T3 = mrep ? P.applyPatch(pl.text, mrep) : null;
if (T3) U.merge(h, { kind: "move", id: pl.newId, marks: [pl.newId], film: C.build(T3).film, text: T3 });
is("the drag answer is one step, not two", h.at, 3);
is("three steps in the history", h.steps.length, 3);

// 4. undo x3 lands on the starting picture, step numbers count down
const lines = [], said = [];
for (let i = 0; i < 3; i++) { const r = U.back(h); lines.push(U.undoLine("bars", r.n, r.step.marks)); said.push(U.words(r.step, "back")); }
is("undo x3 lands on the first text", show(), T0);
is("undo x3 lands on the first picture", h.states[h.at].film === b0.film, true);
is("the undo steps count 3, 2, 1", lines.map((l) => /step=(\d+)/.exec(l)[1]), ["3", "2", "1"]);
is("the first step back names the last change", lines[0].startsWith("[yui] bars canvas undo step=3 marks="), true);
is("each step back is announced in plain words", said, ["Back to before the bar moved.", "Back to before you spoke about the bar.", "Back to before the bar was redrawn."]);
is("nothing before the first picture", U.back(h), null);
is("Back is off at the start, Forward is on", [U.canBack(h), U.canForward(h)], [false, true]);

// 5. redo x1 lands on the picture after the first step
const f = U.forward(h);
is("redo x1 lands after the hold", show(), T1);
is("redo says what came back", U.words(f.step, "forward"), "Forward to after the bar was redrawn.");
is("the redo line", U.redoLine("bars", f.n, f.step.marks), "[yui] bars canvas redo step=1 marks=chart:n1:s0:1");

// 6. a new change after a Back drops the steps that were forward
U.push(h, { kind: "hold", id: holdId, marks: [holdId], film: b0.film, text: T0 });
is("a new change drops redo", [h.steps.length, U.canForward(h)], [2, false]);

// 6b. YUI-337: a calc slider move is one step. The film changes in place, so the page forks a fresh copy first; the history keeps the picture before it.
{
  const cs = samples.find((x) => x.id === "calc"), CT = cs.yl;
  await C.prepare(CT); C.setMeta({ ask: "calc", terms: cs.terms });
  const c0 = C.build(CT), hc = U.create(c0.film, CT);
  const fork = C.build(hc.states[hc.at].text).film;                        // what the page does on the first move of a gesture
  fork.setValue("calc.r", 0.1);
  const done = fork.commit("calc.r"), T1c = C.retext(fork, CT);
  is("a slider move sends the drag line", done && done.line, "[yui] calc canvas drag mark=calc.r value=0.1");
  is("the text keeps the slider where it landed", /r=0-0\.2@0\.1\b/.test(T1c) && /P=100-1000@100/.test(T1c), true);
  U.push(hc, { kind: "slide", id: "calc.r", marks: ["calc.r"], film: fork, text: T1c });
  is("the film in the history was not touched by the move", [c0.film.values().r, fork.values().r], [0.05, 0.1]);
  const rb = U.back(hc);
  is("Back returns the first text and film", [hc.states[hc.at].text === CT, hc.states[hc.at].film === c0.film], [true, true]);
  is("the undo line names the slider", U.undoLine("calc", rb.n, rb.step.marks), "[yui] calc canvas undo step=1 marks=calc.r");
  is("Back says it in plain words", U.words(rb.step, "back"), "Back to before the slider moved.");
  is("a move that ends where it began is not a step", (() => { const f2 = C.build(CT).film; f2.setValue("calc.r", 0.1); f2.setValue("calc.r", 0.05); return f2.commit("calc.r"); })(), null);
  for (const [n, re] of [["a fork before a slider gesture", /function ylFork\(\)/], ["a slider step recorded", /kind: "slide"/], ["frames while the result eases", /function ylLive\(\)/]]) re.test(page) ? ok(`canvas.html has ${n}`) : no(`canvas.html lost ${n}`);
}

// 7. the page wires it: keys, the Back mark, the two-finger tap and the line
for (const [n, re] of [["a named Back mark", /id="back" hidden aria-label="Back"/], ["Cmd/Ctrl+Z", /e\.metaKey \|\| e\.ctrlKey/], ["Shift for redo", /e\.shiftKey \? "forward" : "back"/], ["two-finger tap", /e\.touches\.length === 2/], ["a live region for the plain words", /id="sr" class="sr" role="status"/]])
  re.test(page) ? ok(`canvas.html has ${n}`) : no(`canvas.html lost ${n}`);

if (process.env.BROWSER) {
  const { createRequire } = await import("module");
  const require = createRequire(process.env.PW_FROM || "/Users/urzas/dev/ablejobs/package.json");
  const { chromium } = require("playwright");
  const b = await chromium.launch({ executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", headless: true });
  const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true });
  const errs = []; p.on("pageerror", (e) => errs.push(String(e)));
  await p.goto("http://localhost:" + (process.env.PORT || 8923) + "/playground/canvas.html?yl=bars&theme=dark");
  await p.waitForFunction(() => window.__canvas && window.__canvas.loaded && window.__canvas.hist, null, { timeout: 15000 });
  const fr = p.frames().find((x) => x.url().includes("player.html"));
  const txt = () => p.evaluate(() => document.getElementById("line").innerText);
  const idle = async () => { await p.waitForFunction(() => !ylBusy, null, { timeout: 10000 }); await p.waitForTimeout(150); };
  const state = () => p.evaluate(() => ({ at: window.__canvas.hist.at, steps: window.__canvas.hist.steps, last: window.__canvas.lastStep }));
  const ids = async () => (await fr.evaluate(() => window.__motion.hits().map((x) => x.id + "|" + x.label))).join(" ; ");
  await p.waitForTimeout(5000);
  const start = await ids();
  is("Back starts off", await p.evaluate(() => document.getElementById("back").disabled), true);
  // hold the Tue bar (the keyboard: focus its button, Shift+Enter), then move the Thu bar (Alt+Left)
  await fr.focus('#parts button[data-id="chart:n1:s0:1"]');
  await p.keyboard.press("Shift+Enter"); await p.waitForFunction(() => window.__canvas.hist.at === 1, null, { timeout: 8000 });
  await p.waitForTimeout(300);
  const afterHold = await ids();
  await fr.focus('#parts button[data-id="chart:n1:s0:3"]');
  await p.keyboard.press("Alt+ArrowLeft"); await p.waitForFunction(() => window.__canvas.hist.at === 2, null, { timeout: 8000 });
  await p.waitForFunction(() => !ylBusy, null, { timeout: 10000 });
  await p.waitForTimeout(300);
  const afterDrag = await ids();
  is("a hold and a drag changed the picture", [start !== afterHold, afterHold !== afterDrag], [true, true]);
  await p.keyboard.press("Control+z"); await p.waitForFunction(() => window.__canvas.lastStep && window.__canvas.lastStep.dir === "back" && window.__canvas.hist.at === 1, null, { timeout: 8000 });
  await idle();
  is("Back once returns the picture after the hold", await ids(), afterHold);
  await p.click("#back"); await p.waitForFunction(() => window.__canvas.hist.at === 0, null, { timeout: 8000 });
  await idle();
  is("Back twice returns the starting picture", await ids(), start);
  const st = await state();
  is("the agent line for the second step back", st.last.line, "[yui] bars canvas undo step=1 marks=chart:n1:s0:1");
  is("the plain words for the second step back", st.last.words, "Back to before the bar was redrawn.");
  is("the live region says it", await p.evaluate(() => document.getElementById("sr").textContent), "Back to before the bar was redrawn.");
  await p.keyboard.press("Control+Shift+z"); await p.waitForFunction(() => window.__canvas.hist.at === 1, null, { timeout: 8000 });
  await idle();
  is("Redo returns the picture after the hold", await ids(), afterHold);
  // YUI-337: a real drag on the calc knob is one step, and Back puts the slider, the result and the plot back
  await p.goto("http://localhost:" + (process.env.PORT || 8923) + "/playground/canvas.html?yl=calc&theme=dark&replies=off");
  await p.waitForFunction(() => window.__canvas && window.__canvas.loaded && window.__canvas.hist, null, { timeout: 15000 });
  const fr2 = p.frames().find((x) => x.url().includes("player.html"));
  await p.waitForTimeout(6500);
  const box = await p.evaluate(() => { const r = document.querySelector("iframe").getBoundingClientRect(); return { x: r.left, y: r.top }; });
  const knob = (await fr2.evaluate(() => window.__motion.hits())).find((x) => x.id === "calc.r");
  const sig = () => fr2.evaluate(() => { const c = document.getElementById("cv"); return c.toDataURL().length + ":" + c.toDataURL().slice(-200); });
  const names = async () => (await fr2.evaluate(() => window.__motion.hits().map((x) => x.id + "|" + x.label))).join(" ; ");   // strokes carry sub-pixel wobble, so Back is judged by what the marks say
  const before = await sig(), named0 = await names(), res0 = await p.evaluate(() => window.__canvas.yl.values().r);
  await p.mouse.move(box.x + knob.x, box.y + knob.y); await p.mouse.down();
  for (let i = 1; i <= 20; i++) { await p.mouse.move(box.x + knob.x + 6 * i, box.y + knob.y); await p.waitForTimeout(16); }
  await p.mouse.up(); await p.waitForTimeout(600);
  const moved = await p.evaluate(() => ({ r: window.__canvas.yl.values().r, hist: window.__canvas.hist, line: document.getElementById("line").innerText }));
  is("a drag on the knob is one step", [moved.hist.at, moved.r > res0], [1, true]);
  is("the drag line is sent", /^\[yui\] calc canvas drag mark=calc\.r value=0\.\d+/.test(moved.line) || moved.line.includes("[yui] calc canvas drag mark=calc.r value="), true);
  is("the picture changed with the slider", [(await sig()) !== before, (await names()) !== named0], [true, true]);
  await p.keyboard.press("Control+z"); await p.waitForFunction(() => window.__canvas.hist.at === 0, null, { timeout: 8000 });
  await p.waitForFunction(() => !ylBusy, null, { timeout: 10000 }); await p.waitForTimeout(300);
  is("Back puts the slider back", await p.evaluate(() => window.__canvas.yl.values().r), res0);
  is("Back puts the result and the slider names back", await names(), named0);
  is("no page errors", errs, []);
  await b.close();
}

console.log(out.join("\n"));
console.log(bad ? `\n${bad} bad` : `\nundo: all ${out.length} checks pass`);
process.exit(bad ? 1 : 0);
