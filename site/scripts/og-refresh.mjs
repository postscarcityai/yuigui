// Fresh share previews after a release (SITE-86). One step in the ship flow: `npm run og:refresh` from site/.
// 1. Copies ROADMAP.md into content/ and reads its "Latest release" line (lib/og/release.mjs).
// 2. Makes the share jpg of any Thought that lacks one (the release Thought's lead is the release picture),
//    and public/og/release/<release id>.jpg from its first shot on /mockups when the release has no Thought.
// 3. Prints what the home page, /changelog, /progress and /mockups will share, with their image URLs.
//    Each URL carries the build number and a hash, so the new picture is a new URL chat apps fetch fresh.
// --base https://www.yuigui.com (after the deploy): checks those pages serve that release and its image.
// --check: changes nothing, exits 1 when a picture is missing or stale. Commit the jpgs it writes.
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { latestRelease, releaseScreenFile, releaseVersion } from "../lib/og/release.mjs";
import { pageImage } from "../lib/og/meta.mjs";
import { PAGES } from "../lib/og/pages.mjs";

const SITE = fileURLToPath(new URL("..", import.meta.url));
process.chdir(SITE);
const args = process.argv.slice(2);
const CHECK = args.includes("--check");
const BASE = args.includes("--base") ? args[args.indexOf("--base") + 1].replace(/\/$/, "") : null;
const W = 540; // the phone in the card is 270 wide; 2x
const problems = [];
const wrote = [];

const sharp = async () => (await import("sharp")).default;
async function toJpg(src, out) {
  const buf = await (await sharp())(join(SITE, "public", src)).resize({ width: W }).jpeg({ quality: 82, mozjpeg: true }).toBuffer();
  if (existsSync(out) && readFileSync(out).equals(buf)) return false;
  if (CHECK) { problems.push(`${out.replace(SITE, "")} is missing or stale (from ${src})`); return false; }
  mkdirSync(join(out, ".."), { recursive: true });
  writeFileSync(out, buf);
  wrote.push(out.replace(SITE, ""));
  return true;
}

// 1. The roadmap line.
const root = join(SITE, "..", "ROADMAP.md");
if (!CHECK && existsSync(root)) copyFileSync(root, join(SITE, "content", "ROADMAP.md"));
const rel = latestRelease();
if (!rel) {
  console.error("og-refresh: no **Latest release: Yui <version>, build <n>, <date>: <name>.** line in ROADMAP.md");
  process.exit(1);
}
console.log(`release: Yui ${rel.version}, build ${rel.build}, ${rel.date}: ${rel.name} (${rel.id}${rel.thought ? `, thought ${rel.thought}` : ""})`);

// 2. Every published Thought's share jpg (BUILD-IN-PUBLIC.md "Share preview"), made when missing.
const { thoughts } = await import("../lib/thoughts.mjs");
for (const t of thoughts()) {
  const out = join(SITE, "public/og/thoughts", `${t.slug}.jpg`);
  if (t.lead?.src && !existsSync(out)) await toJpg(t.lead.src, out);
}

// The release's picture when it has no Thought yet (or the Thought has no lead shot).
const showcase = JSON.parse(readFileSync(join(SITE, "content", "showcase.json"), "utf8"));
const group = showcase.groups.find((g) => g.id === rel.id);
const shots = (group?.entries || []).flatMap((e) => e.shots || []);
const shot = shots.find((s) => /-light\./.test(s)) || shots[0];
if (rel.thought && existsSync(join(SITE, "public/og/thoughts", `${rel.thought}.jpg`))) { /* the Thought's lead is the picture */ }
else if (shot) await toJpg(shot, join(SITE, "public/og/release", `${rel.id}.jpg`));
else console.log(`note: /mockups has no shots for ${rel.id}; the card draws the page's lines`);

const pic = releaseScreenFile(rel);
if (!pic) problems.push(`no picture for ${rel.id}: add shots to its /mockups group or a Thought linked from the release line`);
else console.log(`picture: ${pic.file.replace(SITE, "")}`);

// 3. What each release page will share (not the home page: it is evergreen, SITE-103).
const pages = Object.keys(PAGES).filter((k) => PAGES[k].release);
const want = {};
for (const k of pages) {
  const src = readFileSync(join(SITE, "app", k, "page.js"), "utf8");
  const title = src.match(/title:\s*"([^"]+)"/)?.[1] || "";
  want[k] = pageImage(k, title.replace(/\s*\|\s*Yui$/, ""));
  console.log(`${k.padEnd(11)} ${want[k]}`);
}
console.log(`version: ${releaseVersion(rel)}`);

// After the deploy: the live pages carry this release's image URL and it answers.
if (BASE) {
  const attr = (html, p) => html.match(new RegExp(`<meta[^>]+property="${p}"[^>]+content="([^"]*)"`))?.[1]?.replaceAll("&amp;", "&");
  for (const k of pages) {
    const html = await (await fetch(`${BASE}${k}`)).text();
    const img = attr(html, "og:image");
    const v = img?.match(/[?&]v=([^&]+)/)?.[1];
    const ok = img && v === want[k].match(/[?&]v=([^&]+)/)[1];
    const res = img ? await fetch(img) : null;
    const line = `${BASE}${k}: og:title "${attr(html, "og:title")}", v=${v} ${ok ? "current" : `expected ${want[k].match(/v=(.+)$/)[1]}`}, image ${res?.status} ${res?.headers.get("content-type")}`;
    console.log(line);
    if (!ok || res?.status !== 200) problems.push(line);
  }
}

if (wrote.length) console.log(`wrote ${wrote.join(", ")}: commit them with the release`);
if (problems.length) {
  for (const p of problems) console.error(`og-refresh: ${p}`);
  process.exit(1);
}
console.log(CHECK ? "og-refresh ok: release pictures are current" : "og-refresh ok");
