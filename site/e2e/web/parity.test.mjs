// YUI-240: the parity map is checked like code. Run: node site/e2e/web/parity.test.mjs
// Every preset heading in spec/YL.md section 4 has a row, every row names a real story and status,
// every app file a row names exists in the app checkout (when YUI_APP points at one), and the summary
// table on spec/BROWSER.md carries the same counts as the map.
import { readFileSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "../../..");
const map = readFileSync(join(root, "docs/specs/web-parity.md"), "utf8");
const yl = readFileSync(join(root, "spec/YL.md"), "utf8");
const browser = readFileSync(join(root, "spec/BROWSER.md"), "utf8");
let pass = 0, fail = 0;
const ok = (c, msg) => { if (c) { pass++; } else { fail++; console.log("  FAIL", msg); } };

const sections = map.split(/\n## /).slice(1);
const section = (n) => sections.find((s) => s.startsWith(`${n}. `));
const rowsOf = (s) => s.split("\n").filter((l) => l.startsWith("| ") && !l.startsWith("| ---")).slice(1)
  .map((l) => l.replace(/^\||\|$/g, "").split("|").map((c) => c.trim()));

const AREAS = [2, 3, 4, 5, 6, 7, 8];
const STATUS = new Set(["open", "draws", "done", "n/a"]);
const stories = new Set(["none", "162", ...Array.from({ length: 10 }, (_, i) => String(241 + i))]);
const counts = {};
for (const n of AREAS) {
  const rows = rowsOf(section(n));
  ok(rows.length > 0, `section ${n} has rows`);
  const c = { rows: rows.length, same: 0, way: 0, iphone: 0, ahead: 0 };
  for (const r of rows) {
    ok(r.length === 5, `section ${n}: five columns in "${r[0]}"`);
    const [feature, , twin, story, status] = r;
    ok(STATUS.has(status), `"${feature}": status "${status}"`);
    for (const id of story.split(",").map((x) => x.trim())) ok(stories.has(id), `"${feature}": story "${id}"`);
    if (twin.startsWith("same")) c.same++;
    else if (twin.startsWith("web way")) c.way++;
    else if (twin.startsWith("iPhone")) c.iphone++;
    else if (twin.startsWith("web is ahead")) c.ahead++;
  }
  counts[n] = c;
}

// Every preset heading in YL section 4 has a row in section 7 (members share their group's row).
const sec4 = yl.slice(yl.indexOf("\n## 4. Presets"), yl.indexOf("\n## 5. Screens"));
const names = [...sec4.matchAll(/^#{3,4} (.+)$/gm)].map((m) => m[1].trim());
const words = (h) => h.replace(/\(.*?\)/g, "").split(/[:,]/).flatMap((x) => x.split(/\s+/)).map((x) => x.trim()).filter(Boolean);
const covered = rowsOf(section(7)).map((r) => r[0]).join(" ").toLowerCase();
const SKIP = new Set(["Media", "Data", "and", "science", "Groups", "Music", "(draft)", "core,", "not", "a", "preset", "renderers", "Agent", "tables", "Body", "text", "theme", "app", "table", "create", "put", "query"]);
for (const h of names) {
  for (const w of words(h)) {
    if (SKIP.has(w)) continue;
    ok(covered.includes(w.toLowerCase()), `YL preset "${w}" (from "${h}") has a row in section 7`);
  }
}

// Every Swift file a row names exists, when an app checkout is at hand. A shared checkout may lag its remote
// (a file the app gained last night is not on disk yet), so a git checkout is read at origin/main first.
const app = process.env.YUI_APP || join(process.env.HOME || "", "dev/yui");
if (existsSync(join(app, "Yui/Sources"))) {
  let tracked = null;
  try { tracked = new Set(execFileSync("git", ["-C", app, "ls-tree", "-r", "--name-only", "origin/main", "Yui/Sources"], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).split("\n")); } catch { /* not a git checkout */ }
  for (const m of map.matchAll(/`((?:Account|Agents|Chat|Groups|Perf|Presets|Push|Stage|Theme|Vault)\/[A-Za-z]+\.swift|(?:SettingsView|AgentsView|ChatView|ModelKeyForm)\.swift)`/g)) {
    ok(existsSync(join(app, "Yui/Sources", m[1])) || !!tracked?.has(`Yui/Sources/${m[1]}`), `app file ${m[1]} exists`);
  }
} else console.log("  skip  app files (no checkout at", app + ")");

// The summary on spec/BROWSER.md carries the map's counts.
const labels = { 2: "Account and session", 3: "The thread", 4: "The stage, pages and home", 5: "Agents and the drawer", 6: "Settings and account", 7: "Presets (every one in YL section 4)", 8: "Push, links, system" };
for (const n of AREAS) {
  const line = browser.split("\n").find((l) => l.startsWith(`| ${labels[n]} |`));
  ok(!!line, `BROWSER.md summary row for ${labels[n]}`);
  if (!line) continue;
  const [, , , split, ] = line.split("|").map((x) => x.trim());
  const w = counts[n];
  const rows = Number(line.split("|")[2]);
  const part = (k) => Number((split.match(new RegExp(`(\\d+) ${k}`)) || [0, 0])[1]);
  const got = [rows, part("same"), part("web way"), part("iPhone"), part("web is ahead")];
  const want = [w.rows, w.same, w.way, w.iphone, w.ahead];
  ok(JSON.stringify(got) === JSON.stringify(want), `BROWSER.md counts for ${labels[n]}: ${got} vs ${want}`);
}

console.log(`parity map: ${pass} ok, ${fail} failed`);
process.exit(fail ? 1 : 0);
