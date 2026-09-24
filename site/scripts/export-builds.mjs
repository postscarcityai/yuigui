// Exports the TestFlight build list into content/builds.json for yuigui.com/changelog.
// Run: node scripts/export-builds.mjs [--check]
// --check exits 0 when nothing changed, 3 when builds.json would change. Exits 2 and writes nothing on a leak.
// Sources: App Store Connect (via the app repo's scripts/asc.py, key stays on this machine) and the app repo's git log.
// A build number is the app repo's commit count at upload, so build N ships commits (previous build, N].
// Commits name their card at the end of the subject, "... (YUI-7)". KEYS covers the early ones that do not.
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { findLeak } from "../lib/public-guard.mjs";

const APP = process.env.YUI_APP_REPO || `${homedir()}/dev/yui`;
const APP_ID = "6815454240";
const CHECK = process.argv.includes("--check");
const OUT = new URL("../content/builds.json", import.meta.url);

const KEYS = {
  e963d62: "YUI-2", d350f2d: "YUI-3", "6ca3ca3": "YUI-5", f85580a: "YUI-5", c699523: "YUI-4",
  bee7944: "YUI-9", "1a8fbcd": "OSS-1",
};

const asc = (path) => {
  const out = execFileSync("python3", [`${APP}/scripts/asc.py`, "GET", path], { encoding: "utf8" });
  if (!out.trimStart().startsWith("{")) throw new Error(`ASC: ${out.slice(0, 200)}`);
  return JSON.parse(out);
};
const day = (iso) => new Date(iso).toLocaleDateString("en-CA", { timeZone: "America/New_York" });

const builds = asc(`/v1/builds?filter[app]=${APP_ID}&limit=200&sort=-uploadedDate&fields[builds]=version,uploadedDate,processingState,expired`)
  .data.map((b) => ({ n: Number(b.attributes.version), uploaded: b.attributes.uploadedDate, state: b.attributes.processingState }))
  .filter((b) => Number.isInteger(b.n) && b.state !== "INVALID")
  .sort((a, b) => a.n - b.n);

const commits = execFileSync("git", ["-C", APP, "log", "--reverse", "--first-parent", "--format=%h%x09%s", "main"], { encoding: "utf8" })
  .trim().split("\n").map((l, i) => {
    const [sha, subject] = l.split("\t");
    const m = subject.match(/\s*\(([A-Z]+-\d+)\)\s*$/);
    return { n: i + 1, card: m ? m[1] : KEYS[sha] || null, text: m ? subject.slice(0, m.index) : subject };
  });

const change = (c) => (c.card ? { text: c.text, card: c.card } : { text: c.text });
let prev = 0;
const out = [];
for (const b of builds) {
  out.push({
    build: b.n, date: day(b.uploaded), uploaded: b.uploaded, state: b.state === "VALID" ? "live" : "processing",
    changes: commits.filter((c) => c.n > prev && c.n <= b.n).map(change),
  });
  prev = b.n;
}
out.reverse();
const next = commits.filter((c) => c.n > prev).map(change);
const data = { builds: out, next };

const text = JSON.stringify(data, null, 2);
const leak = findLeak(text);
if (leak) { console.error(`refusing to write builds.json: ${leak[0]} "${leak[1]}"`); process.exit(2); }

const old = existsSync(OUT) ? readFileSync(OUT, "utf8") : "";
const changed = old.trim() !== text.trim();
console.log(`${changed ? "changed" : "unchanged"}: ${out.length} builds, latest ${out[0]?.build ?? "none"}, ${next.length} commits since`);
if (CHECK) process.exit(changed ? 3 : 0);
if (changed) writeFileSync(OUT, text + "\n");
