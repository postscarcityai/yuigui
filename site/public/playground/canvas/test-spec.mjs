// YUI-333: spec/MOTION.md section 0b and the canvas cannot drift. Every example in its ```canvas-events block is a line
//   <how> | <sample> | <mark id> | <arg>  =>  <the line the canvas sends>
// The test builds the same event on the same sample with the canvas modules (the same ones canvas.html calls) and compares the line
// to the spec, character for character. Change a line in the spec, or a line the canvas builds, and this goes red. It also reads
// canvas.html and fails when the page sends an event line the spec does not list. No browser: node test-spec.mjs
import fs from "fs";
import * as C from "./yl-canvas.mjs";
import * as MV from "./yl-move.mjs";
import * as SY from "./yl-say.mjs";
import * as UN from "./yl-undo.mjs";

const here = (p) => new URL(p, import.meta.url);
const list = JSON.parse(fs.readFileSync(here("./yl-samples.json")));
const spec = fs.readFileSync(here("../../../../spec/MOTION.md"), "utf8");
const page = fs.readFileSync(here("../canvas.html"), "utf8");
const out = []; let bad = 0;
const ok = (m) => out.push("ok  " + m), no = (m) => { bad++; out.push("BAD " + m); };

// ---- the example lines in the spec
const block = (spec.split(/^## 0b\./m)[1] || "").split(/^## 1\./m)[0].match(/```canvas-events\n([\s\S]*?)```/);
if (!block) { console.log("BAD spec/MOTION.md section 0b has no ```canvas-events block"); process.exit(1); }
const rows = block[1].split("\n").filter((l) => l.trim()).map((l) => {
  const i = l.indexOf("=>"), left = l.slice(0, i).split("|").map((s) => s.trim());
  return { how: left[0], sample: left[1], id: left[2] || "", arg: left[3] || "", want: l.slice(i + 2).trim(), raw: l };
});

// ---- what the canvas builds for the same event (the same calls canvas.html makes)
const q = (s) => s.replace(/^"|"$/g, "");
function film(sample) { const s = list.find((x) => x.id === sample); if (!s) throw new Error("no sample " + sample); const b = C.build(s.yl); if (b.error) throw new Error(sample + ": " + b.error); return { f: b.film, text: s.yl }; }
const labelOf = (f, id) => { const m = f.marks.find((x) => x.id === id); if (!m) throw new Error("no mark " + id); return m.label; };
const key = (arg) => { const m = /^(dx|dy)=(-?\d+)$/.exec(arg); if (!m) throw new Error("bad arg " + arg); return { [m[1]]: +m[2] }; };
const build = {
  tap: ({ f }, r) => (C.touch(f, r.id) || C.tick(f, r.id) || (f.choose && C.isChoice(f, labelOf(f, r.id))) ? "(something)" : "(nothing)"),
  hold: ({ f }, r) => `[yui] ${r.sample} yl ask ${labelOf(f, r.id)}`,
  "hold-moment": (_, r) => `[yui] ${r.sample} yl ask moment @${(+r.arg).toFixed(1)}s`,
  move: ({ f, text }, r) => { if (f.kind === "shape" || /^shapes/.test(text)) f.xf = f.xf || { ox: 0, oy: 0, s: 60, dy: 0 };   // the canvas sets this when it draws; a key step needs only that it exists
    const p = MV.plan(f, text, r.id, key(r.arg), { hits: [] }); return p ? `[yui] ${r.sample} yl move ${labelOf(f, r.id)} ${p.line}` : "(no move)"; },
  say: ({ f }, r) => SY.sayLine(r.sample, q(r.arg), labelOf(f, r.id), 0),
  "say-moment": (_, r) => SY.sayLine(r.sample, q(r.arg.split(" ").slice(1).join(" ")), null, +r.arg.split(" ")[0]),
  check: ({ f }, r) => { const t = f.tick(r.id); return t ? `[yui] ${r.sample} yl check ${t.row}` : "(no check)"; },
  "choose-in-picture": ({ f }, r) => (f.choose && C.isChoice(f, r.arg) ? `[yui] ${f.choose.id} choose choice=${r.arg}` : "(not a choice)"),
  answer: ({ f }, r) => { const t = C.touch(f, r.id); return t && t.line ? t.line : "(no line)"; },
  nudge: ({ f }, r) => { const t = C.nudge(f, { id: r.id, dir: +r.arg }); return t && t.line ? t.line : "(no line)"; },
  undo: (_, r) => UN.undoLine(r.sample, +r.arg, r.id.split(",")),
  redo: (_, r) => UN.redoLine(r.sample, +r.arg, r.id.split(",")),
  form: ({ f }, r) => { for (const kv of r.arg.split(";").map((s) => s.trim()).filter(Boolean)) { const [k, v] = kv.split("="); C.setText(f, r.id.split(":")[1] + ":" + k, q(v)); } const t = C.touch(f, r.id); return t && t.line ? t.line : "(no line)"; },
};
const seen = new Set();
for (const r of rows) {
  seen.add(r.how);
  try {
    if (!build[r.how]) { no(`unknown kind "${r.how}": ${r.raw}`); continue; }
    const got = build[r.how](r.how === "hold-moment" || r.how === "say-moment" || r.how === "undo" || r.how === "redo" ? {} : film(r.sample), r);
    const want = r.want.startsWith("[yui]") ? r.want : r.want === "(nothing sent)" ? "(nothing)" : r.want;
    if (r.how === "tap") { if (want === "(nothing)" && got !== "(nothing)") no(`tap should send nothing: ${r.raw}`); else if (want !== "(nothing)" && got === "(nothing)") no(`tap sends no line but the spec says one: ${r.raw}`); else ok(`${r.how} ${r.sample} ${r.id}`); continue; }
    got === want ? ok(`${r.how} ${r.sample} ${r.id || r.arg}: ${got}`) : no(`${r.how} ${r.sample} ${r.id}\n     spec: ${want}\n     code: ${got}`);
  } catch (e) { no(`${r.how} ${r.sample} ${r.id}: ${e.message}`); }
}

// ---- every kind of event the page can send is in the spec (a new one must be written down)
const need = ["tap", "hold", "hold-moment", "move", "say", "say-moment", "check", "choose-in-picture", "answer", "nudge", "form", "undo", "redo"];
for (const k of need) seen.has(k) ? ok(`spec lists a "${k}" example`) : no(`spec has no "${k}" example`);
const sends = [["ask line", /ASKV = YL \? " yl ask "/], ["move line", /" yl move "/], ["check line", /" yl check "/], ["picture choose", /" choose choice="/], ["say line", /YLS\.sayLine/], ["undo line", /YLU\.undoLine/], ["redo line", /YLU\.redoLine/]];
for (const [n, re] of sends) re.test(page) ? ok(`canvas.html still builds the ${n}`) : no(`canvas.html no longer has the ${n}: update the test and the spec`);
const lits = [...page.matchAll(/"\[yui\] "/g)].length;
lits === 7 ? ok("canvas.html has the 7 known [yui] line builders (move, choose, check, moment, 3 ask)") : no(`canvas.html has ${lits} "[yui] " builders, the spec knows 7: a new event line must be written into MOTION.md 0b and this test`);

console.log(out.join("\n"));
console.log(bad ? `\n${bad} bad` : `\nall ${rows.length} spec lines match the canvas`);
process.exit(bad ? 1 : 0);
