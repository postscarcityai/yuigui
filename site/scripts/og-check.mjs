// Share preview check (SITE-48). Every /s/<id> in the sitemap needs a committed capture at
// public/og/screens/<id>.jpg, or its preview falls back to the simpler drawn screen. It reads the same
// list the sitemap does (lib/share.mjs) and the capture files git tracks, so an untracked jpg on this
// machine does not count. It also fails when a share link's agent or title carries a private name.
// Run: node scripts/og-check.mjs [--base https://www.yuigui.com]
//   --base also asks the host for each capture and fails on anything but 200.
//   Exit 0 when every link has its capture, 1 with one line per problem.
// Missing captures: scripts/capture-og.py --missing (BUILD-IN-PUBLIC.md, "Share links").
import { register } from "node:module";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

// lib/ imports JSON the way Next does (no import attribute); plain node needs the attribute.
const hook = "export async function load(u,c,n){return n(u,u.endsWith('.json')?{...c,importAttributes:{...c.importAttributes,type:'json'}}:c)}";
register("data:text/javascript," + encodeURIComponent(hook));
const { shareItems } = await import("../lib/share.mjs");
const { PRIVATE_RE } = await import("../lib/public-guard.mjs");

const SITE = fileURLToPath(new URL("..", import.meta.url));
const arg = (k) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : null; };
const BASE = arg("--base")?.replace(/\/$/, "");

const tracked = new Set(
  execFileSync("git", ["ls-files", "public/og/screens"], { cwd: SITE, encoding: "utf8" })
    .split("\n").filter((f) => f.endsWith(".jpg")).map((f) => f.replace(/^.*\//, "").replace(/\.jpg$/, "")),
);
// A video entry with no lines draws no phone screen, so capture-og.py has nothing to save.
const noScreen = (it) => it.video && !it.yl;

const items = shareItems();
const problems = [];
for (const it of items) {
  if (!tracked.has(it.id) && !noScreen(it)) problems.push(`${it.id}: no committed capture at site/public/og/screens/${it.id}.jpg`);
  for (const k of ["agent", "title"]) {
    const hit = (it[k] || "").match(PRIVATE_RE);
    if (hit) problems.push(`${it.id}: ${k} "${it[k]}" carries a private name (${hit[0]})`);
  }
}

if (BASE) {
  const want = items.filter((it) => tracked.has(it.id));
  let i = 0;
  await Promise.all(Array.from({ length: 8 }, async () => {
    while (i < want.length) {
      const id = want[i++].id;
      const url = `${BASE}/og/screens/${id}.jpg`;
      try {
        const res = await fetch(url, { method: "HEAD", redirect: "follow" });
        if (res.status !== 200) problems.push(`${id}: ${url} answers ${res.status}`);
      } catch (e) { problems.push(`${id}: ${url} ${e.cause?.code || e.message}`); }
    }
  }));
}

const ids = new Set(items.map((it) => it.id));
const orphans = [...tracked].filter((id) => !ids.has(id));
if (orphans.length) console.log(`og: ${orphans.length} capture(s) with no share link, harmless: ${orphans.join(", ")}`);
if (problems.length) {
  for (const p of problems) console.error(`og: ${p}`);
  console.error(`og: ${problems.length} problem(s) across ${items.length} share links`);
  process.exit(1);
}
console.log(`og ok: ${items.length} share links, ${items.filter((it) => tracked.has(it.id)).length} committed captures${BASE ? `, all 200 on ${BASE}` : ""}`);
