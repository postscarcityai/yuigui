// Freshness check for yuigui.com (SITE-31). Fails when the roadmap or a page says something the builds
// and the board have already moved past:
//   1. a build number at or below the newest VALID TestFlight build, called "next" or "on its way";
//   2. a shipped card labelled next or building: "YUI-50 (next)", "Building now, YUI-31", a "- YUI-50:" line
//      under a "Building now:" or "Up next:" heading, or "IN THE NEXT BUILD, YUI-31" once a VALID build has it.
// Reads ROADMAP.md, the page sources in app/ and content/showcase.json; builds from content/builds.json,
// card status from content/board.json and content/mvp.json (run the exporters first for today's truth).
// Run: node scripts/freshness.mjs   Exit 0 when fresh, 1 with one line per problem.
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const SITE = fileURLToPath(new URL("..", import.meta.url));
const ROOT = join(SITE, "..");
const json = (f) => JSON.parse(readFileSync(join(SITE, "content", f), "utf8"));

const builds = json("builds.json");
const newest = Math.max(...builds.builds.filter((b) => b.state === "live").map((b) => b.build));
const inNext = new Set((builds.next || []).map((c) => c.card).filter(Boolean));

// Shipped keys, minus any key that also sits in an open column (two cards once shared an id).
const board = json("board.json");
const col = (k) => board.columns.find((c) => c.key === k)?.cards.map((c) => c.key) || [];
const open = new Set([...col("backlog"), ...col("next"), ...col("building")]);
const shipped = new Set([...col("shipped"), ...json("mvp.json").cards.filter((c) => c.status === "shipped").map((c) => c.key)]);
for (const k of open) shipped.delete(k);

// Files to read. ROADMAP.md at the root is the source; site/content/ROADMAP.md is its copy.
const files = [join(ROOT, "ROADMAP.md"), join(SITE, "content", "showcase.json")].filter(existsSync);
(function walk(dir) {
  for (const f of readdirSync(dir)) {
    const p = join(dir, f);
    if (statSync(p).isDirectory()) walk(p);
    else if (/\.(js|jsx|mjs|md)$/.test(f)) files.push(p);
  }
})(join(SITE, "app"));

const KEY = "\\b((?:YUI|SITE|OSS|INT|MVP|BIZ|FLOW|SOC|WAR|INV)-\\d+)\\b";
const problems = [];
const say = (file, line, msg) => problems.push(`${relative(ROOT, file)}:${line}: ${msg}`);

for (const file of files) {
  const lines = readFileSync(file, "utf8").split("\n");
  let heading = "";
  lines.forEach((text, i) => {
    const n = i + 1;
    // A "Building now:" / "Up next:" heading owns the "- KEY" lines under it until the next heading or blank-then-text.
    const h = text.match(/^\s*(?:#+\s*)?(Building now|Up next|Still to go)\b[^:]*:\s*$/i);
    if (h) { heading = h[1]; return; }
    if (/^\s*(#|\*\*|[A-Z][^-]*:\s*$)/.test(text)) heading = "";
    if (heading) {
      const m = text.match(new RegExp(`^\\s*-\\s+${KEY}`));
      if (m && shipped.has(m[1])) say(file, n, `${m[1]} is shipped but listed under "${heading}"`);
    }

    // 1. A build at or below the newest VALID one, called next or on its way:
    //    "Next release: build 57", "the next build, 57", "build 57 is on its way", "build 57 comes next".
    const called = [
      ...[...text.matchAll(/\bnext\s+(?:release|build|up)\b\W{0,4}(?:build\s+)?(\d+)\b/gi)].map((m) => m[1]),
      ...[...text.matchAll(/\bbuild\s+(\d+)\b[^.]{0,60}?\b(?:is\s+on\s+its\s+way|on\s+its\s+way|comes\s+next|is\s+next|is\s+coming)/gi)].map((m) => m[1]),
    ];
    for (const b of new Set(called.map(Number)))
      if (b <= newest) say(file, n, `build ${b} is called next or on its way, but build ${newest} is already VALID`);

    // 2. A shipped card labelled next or building.
    for (const m of text.matchAll(new RegExp(`${KEY}\\s*\\((next|building(?: now)?|up next)\\b`, "gi")))
      if (shipped.has(m[1])) say(file, n, `${m[1]} is shipped but labelled "${m[2]}"`);
    for (const m of text.matchAll(new RegExp(`\\b(BUILDING NOW|NEXT UP|UP NEXT),?\\s+${KEY}`, "g")))
      if (shipped.has(m[2])) say(file, n, `${m[2]} is shipped but marked "${m[1]}"`);
    for (const m of text.matchAll(new RegExp(`\\bIN THE NEXT BUILD,?\\s+${KEY}`, "g")))
      if (shipped.has(m[1]) && !inNext.has(m[1])) say(file, n, `${m[1]} is on a VALID build already, not "in the next build"`);
    for (const m of text.matchAll(new RegExp(`\\bNOT STARTED,?\\s+${KEY}`, "g")))
      if (shipped.has(m[1])) say(file, n, `${m[1]} is shipped but marked "NOT STARTED"`);
  });
}

if (problems.length) {
  console.error(`freshness: ${problems.length} stale ${problems.length === 1 ? "line" : "lines"} (newest VALID build ${newest})`);
  for (const p of problems) console.error(`  ${p}`);
  process.exit(1);
}
console.log(`freshness: ok. ${files.length} files, newest VALID build ${newest}, ${shipped.size} shipped cards checked`);
