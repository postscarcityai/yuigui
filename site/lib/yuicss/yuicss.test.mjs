// yuicss checks (run by the site build and CI):
//   node site/lib/yuicss/yuicss.test.mjs     exit 1 on any failure
// 1. the built stylesheet is fresh; 2. every look, light and dark, passes the
// contrast guard on every pair yuicss promises; 3. the motion numbers match
// motion.mjs; 4. every rule is scoped under .yuicss; 5. arbitrary values parse;
// 6. the classes the plan's example screen uses exist; 7. size budget.
import { execFileSync } from "node:child_process";
import { gzipSync } from "node:zlib";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { SETS, YUI } from "../yl/look.mjs";
import { BASE, CHARACTERS, EASES, ENTERS, PACES, PULSES } from "../yl/motion.mjs";
import { checks, lookOf, tokens, vars } from "./theme.mjs";
import { splitClasses, styleFor } from "./utilities.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
let fails = 0;
const ok = (cond, what) => { if (!cond) { fails++; console.error(`FAIL ${what}`); } };

// 1. fresh
try { execFileSync(process.execPath, [path.join(here, "build.mjs"), "--check"], { stdio: "pipe" }); }
catch (e) { fails++; console.error(`FAIL build: ${String(e.stderr || e.stdout || e.message).trim()}`); }

// 2. the guard, every look, both modes
const looks = [["yui", YUI], ...Object.keys(SETS).filter((n) => n !== "yui").map((n) => [n, lookOf(n)])];
let pairs = 0;
for (const [name, look] of looks) for (const mode of ["light", "dark"]) {
  for (const c of checks(look, mode)) { pairs++; ok(c.ok, `${name} ${mode}: ${c.what} ${c.fg} on ${c.bg} is ${c.ratio}:1, needs ${c.min}:1`); }
  const v = vars(look, mode);
  ok(/^y-(rise|pop|slide|drop|fade)$/.test(v["--enter-name"]), `${name}: enter name ${v["--enter-name"]}`);
  ok(/px$/.test(v["--radius"]) && /px$/.test(v["--radius-control"]), `${name}: radius vars`);
  ok(v["--font"].length > 10, `${name}: font stack`);
}
// a theme line's props work too
ok(vars(lookOf({ accent: "#7B5CFF", font: "serif", radius: "square", motion: "calm" }), "light")["--enter-name"] === "y-rise", "theme props -> calm rises");

// 3. motion numbers never drift from motion.mjs
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
ok(same(tokens.motion.base, BASE), "motion base");
ok(same(tokens.motion.paces, PACES), "motion paces");
ok(same(tokens.motion.eases, EASES), "motion eases");
ok(same(tokens.motion.enters, ENTERS), "motion enters");
ok(same(tokens.motion.pulses, PULSES), "motion pulses");
ok(same(tokens.motion.characters, CHARACTERS), "motion characters");
// the default palette is the app's own
ok(tokens.color.light.paper === YUI.light.background && tokens.color.dark.paper === YUI.dark.background, "default paper is YuiTheme.yui");
ok(tokens.color.light.accent === YUI.light.accent && tokens.color.light.ink === YUI.light.ink, "default accent and ink are YuiTheme.yui");

// 4. scope: every rule under .yuicss
const sheet = readFileSync(path.resolve(here, "../../public/yuicss/yuicss.css"), "utf8");
const noComments = sheet.replace(/\/\*[\s\S]*?\*\//g, "");
// Split a selector list on the commas outside parentheses (:is(a, b) is one selector).
const topLevel = (s) => { const out = []; let d = 0, cur = ""; for (const ch of s) { if (ch === "(") d++; if (ch === ")") d--; if (ch === "," && d === 0) { out.push(cur); cur = ""; } else cur += ch; } out.push(cur); return out; };
let depth = 0, sel = "", unscoped = [];
for (const ch of noComments) {
  if (ch === "{") { if (depth === 0) { const s = sel.trim(); if (s && !s.startsWith("@") && !topLevel(s).every((x) => x.includes(".yuicss"))) unscoped.push(s); if (s.startsWith("@media")) depth = -1; } depth += 1; sel = ""; }
  else if (ch === "}") { depth -= 1; if (depth < 0) depth = 0; sel = ""; }
  else if (depth === 0) sel += ch;
}
ok(!unscoped.length, `unscoped rules: ${unscoped.slice(0, 5).join(" | ")}`);

// 5. arbitrary values
ok(same(styleFor("h-[62%]"), { height: "62%" }), "h-[62%]");
ok(same(styleFor("w-[220px]"), { width: "220px" }), "w-[220px]");
ok(same(styleFor("w-[220]"), { width: "220px" }), "w-[220] is px");
ok(same(styleFor("w-[2/3]"), { width: "66.67%" }), "w-[2/3]");
ok(same(styleFor("-mx-[12px]"), { "margin-left": "-12px", "margin-right": "-12px" }), "-mx-[12px]");
ok(same(styleFor("bg-[accent-200]"), { "background-color": "var(--accent-200)" }), "bg-[accent-200]");
ok(same(styleFor("text-[good]"), { color: "var(--good)" }), "text-[good] is a color");
ok(same(styleFor("text-[13px]"), { "font-size": "13px" }), "text-[13px] is a size");
ok(styleFor("bg-[#ff0000]") === null, "a bare hex is refused");
ok(styleFor("bg-[red]") === null, "a named css color is refused");
ok(styleFor("w-[expression(1)]") === null, "junk is refused");
ok(same(styleFor("grid-[3]"), { "grid-template-columns": "repeat(3, minmax(0, 1fr))" }), "grid-[3]");
ok(same(styleFor("rotate-[12]"), { rotate: "12deg" }), "rotate-[12]");
ok(same(splitClasses("row gap-2 h-[62%] bg-accent"), { style: { height: "62%" }, classes: ["row", "gap-2", "bg-accent"] }), "splitClasses");

// 6. the plan's example screen needs only these classes, and they all exist
const { classes, elements } = JSON.parse(readFileSync(path.join(here, "classes.json"), "utf8"));
const have = new Set(classes);
for (const c of ["screen", "col", "gap-4", "row", "gap-2", "items-end", "h-32", "w-8", "rounded-t", "bg-accent", "muted", "card", "chip", "tabs", "sheet", "toast", "progress", "ring", "avatar", "badge", "toggle", "slider", "stepper", "segmented", "field", "empty", "timer", "chart", "map", "shapes", "sketch", "math", "calc", "gallery", "compare", "game", "stat", "list", "timeline", "page", "deck", "say", "camera", "mic", "hero", "grid-3", "text-2xl", "bold", "rounded-full", "shadow-lift", "spin", "pulse", "float", "enter-pop", "delay-2", "bg-accent-200", "text-muted", "p-4", "w-full"]) ok(have.has(c), `class .${c} exists`);
for (const e of ["h1", "h2", "h3", "p", "button", "input", "textarea", "select", "label", "table", "th", "td", "img", "ul", "ol", "li", "a", "hr", "blockquote", "code", "pre", "details", "summary", "progress", "dialog", "figure"]) ok(elements.includes(e), `element ${e} styled with no class`);

// 6b. the gallery uses only classes the sheet defines
const { classesUsed } = await import("../../app/yuicss/examples.mjs");
for (const c of classesUsed()) ok(have.has(c) || styleFor(c), `gallery class .${c} is defined`);

// 7. size
const gz = gzipSync(sheet).length;
ok(sheet.length < 120000, `raw size ${sheet.length} under 120 KB`);
ok(gz < 20000, `gzip size ${gz} under 20 KB`);

console.log(`${fails ? "FAILED" : "ok"}: ${looks.length} looks x 2 modes, ${pairs} contrast pairs; ${classes.length} classes, ${elements.length} elements; ${sheet.length} bytes (${gz} gzip)`);
process.exit(fails ? 1 : 0);
