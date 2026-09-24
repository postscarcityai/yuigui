// Exports the "watch Yui grow" timeline into content/timeline.json for yuigui.com/timeline (SITE-5).
// Run: node scripts/export-timeline.mjs [--check]
// --check exits 0 when nothing changed, 3 when timeline.json would change. Exits 2 and writes nothing on a leak.
// Sources: the git history of both public repos (app and site), content/builds.json and content/progress.json.
// A shipped entry is timed by the site commit that first put it on the ship log.
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { findLeak } from "../lib/public-guard.mjs";
import { shotsOf } from "../lib/shots.mjs";
import { slug } from "../lib/slug.mjs";

const REPOS = {
  app: { dir: process.env.YUI_APP_REPO || `${homedir()}/dev/yui`, url: "https://github.com/postscarcityai/yui" },
  site: { dir: new URL("../..", import.meta.url).pathname, url: "https://github.com/postscarcityai/yuigui" },
};
const LOG_PATH = "site/content/progress.json";
const CHECK = process.argv.includes("--check");
const OUT = new URL("../content/timeline.json", import.meta.url);
const read = (f) => JSON.parse(readFileSync(new URL(`../content/${f}`, import.meta.url), "utf8"));
const git = (dir, ...args) => execFileSync("git", ["-C", dir, ...args], { encoding: "utf8", maxBuffer: 64 << 20 });
// The branch that is live: origin/main when there is one, so a half-done local branch never leaks in.
const head = (dir) => { try { git(dir, "rev-parse", "--verify", "-q", "origin/main"); return "origin/main"; } catch { return "HEAD"; } };
const day = (iso) => new Date(iso).toLocaleDateString("en-CA", { timeZone: "America/New_York" });
// Every time goes out in UTC, so times from git and App Store Connect sort as plain strings.
const utc = (iso) => new Date(iso).toISOString();
const CARD = /\b(?:YUI|SITE|OSS|MVP|BIZ|INT|SOC|FLOW)-\d+\b/;

// A commit subject goes public as written, minus anything the guard would stop.
let redacted = 0;
function clean(text) {
  let t = text.replace(/\s*\(?\bt_[0-9a-f]{6,}\b\)?/gi, "").replace(/\s{2,}/g, " ").trim();
  if (t.length > 140) t = `${t.slice(0, 137).replace(/\s+\S*$/, "")}...`;
  if (findLeak(t)) { redacted++; return "A change with private details, left out here"; }
  return t;
}

const commits = [];
for (const [repo, { dir, url }] of Object.entries(REPOS)) {
  const lines = git(dir, "log", "--reverse", "--first-parent", "--format=%h%x09%aI%x09%s", head(dir)).trim().split("\n");
  for (const l of lines) {
    const [sha, at, subject] = l.split("\t");
    commits.push({ repo, sha, at: utc(at), card: subject.match(CARD)?.[0] || null, text: clean(subject), url: `${url}/commit/${sha}` });
  }
}
commits.sort((a, b) => a.at.localeCompare(b.at));

// When each ship-log entry first appeared, by title, else by card key.
const firstSeen = { title: new Map(), card: new Map() };
const site = REPOS.site.dir;
for (const l of git(site, "log", "--reverse", "--format=%H%x09%aI", head(site), "--", LOG_PATH).trim().split("\n")) {
  const [sha, at] = l.split("\t");
  let entries;
  try { entries = JSON.parse(git(site, "show", `${sha}:${LOG_PATH}`)); } catch { continue; }
  for (const e of entries) {
    if (!firstSeen.title.has(e.title)) firstSeen.title.set(e.title, utc(at));
    if (e.card && !firstSeen.card.has(e.card)) firstSeen.card.set(e.card, utc(at));
  }
}

const log = read("progress.json");
let skipped = 0;
const ships = log.map((e, i) => ({
  kind: "ship",
  i,
  // Not committed yet means it is shipping right now.
  at: firstSeen.title.get(e.title) || (e.card && firstSeen.card.get(e.card)) || (e.date === day(Date.now()) ? utc(Date.now()) : utc(`${e.date}T12:00:00-04:00`)),
  title: e.title,
  card: e.card || null,
  anchor: slug(e.title),
  // A screenshot whose caption names someone the guard protects stays on /progress only.
  images: shotsOf(e).filter((im) => !findLeak(im.alt) || (skipped++, false)).map(({ src, alt }) => ({ src, alt })),
  commits: e.card ? commits.filter((c) => c.card === e.card).length : 0,
}));
const builds = read("builds.json").builds.map((b) => ({ kind: "build", at: utc(b.uploaded), build: b.build, changes: b.changes.length }));

// Entries that landed in one commit keep the log's order (it is newest first).
const moments = [...ships, ...builds].sort((a, b) => a.at.localeCompare(b.at) || (a.kind === "build" ? -1 : b.kind === "build" ? 1 : b.i - a.i));
// Running totals at each moment, so the page can show the app growing.
for (const m of moments) {
  const before = commits.filter((c) => c.at <= m.at);
  m.totals = {
    app: before.filter((c) => c.repo === "app").length,
    site: before.filter((c) => c.repo === "site").length,
    builds: builds.filter((b) => b.at <= m.at).length,
    shipped: ships.filter((s) => s.at < m.at || s === m || (s.at === m.at && s.i > m.i)).length,
  };
}
for (const s of ships) delete s.i;

const days = [...new Set([...moments, ...commits].map((x) => day(x.at)))].sort().reverse().map((d) => ({
  date: d,
  moments: moments.filter((m) => day(m.at) === d).reverse(),
  commits: commits.filter((c) => day(c.at) === d).reverse().map(({ repo, sha, at, text, url }) => ({ repo, sha, at, text, url })),
}));
const data = {
  since: commits[0]?.at || null,
  totals: {
    app: commits.filter((c) => c.repo === "app").length,
    site: commits.filter((c) => c.repo === "site").length,
    builds: builds.length,
    shipped: ships.length,
    screenshots: ships.reduce((n, s) => n + s.images.length, 0),
  },
  days,
};

const text = JSON.stringify(data, null, 2);
const leak = findLeak(text);
if (leak) { console.error(`refusing to write timeline.json: ${leak[0]} "${leak[1]}"`); process.exit(2); }

const old = existsSync(OUT) ? readFileSync(OUT, "utf8") : "";
const changed = old.trim() !== text.trim();
console.log(`${changed ? "changed" : "unchanged"}: ${days.length} days, ${commits.length} commits, ${ships.length} shipped, ${builds.length} builds${redacted ? `, ${redacted} subjects left out` : ""}${skipped ? `, ${skipped} screenshots left out` : ""}`);
if (CHECK) process.exit(changed ? 3 : 0);
if (changed) writeFileSync(OUT, text + "\n");
