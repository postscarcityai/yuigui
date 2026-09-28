// What is new (SITE-86): the roadmap's "Latest release" line is the one source for every share preview
// that follows the release: the home page, /changelog, /progress and /mockups. Bump that line and the next
// build changes their og title, line, picture and image URL; nobody edits a share card by hand.
// The picture is the release Thought's share jpg (its lead shot, picked by whoever wrote it). A release with
// no Thought yet uses public/og/release/<id>.jpg, which `npm run og:refresh` makes from its first shot on
// /mockups (satori reads jpeg, not webp). With neither, the card draws the page's lines.
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const RE = /\*\*Latest release: Yui ([\d.]+), build (\d+), ([^:]+): ([^*]+?)\.?\*\*([^\n]*)/;

// { version, build, date, name, id: "release-050", thought: slug or null } or null when the line is missing.
export function parseRelease(md) {
  const m = md.match(RE);
  if (!m) return null;
  const [, version, build, date, name, rest] = m;
  const thought = rest.match(/\]\(\/thoughts\/([a-z0-9-]+)\)/)?.[1] || null;
  return { version, build, date: date.trim(), name: name.trim(), id: `release-${version.replace(/\./g, "")}`, thought };
}

export function latestRelease(root = process.cwd()) {
  return parseRelease(readFileSync(join(root, "content", "ROADMAP.md"), "utf8"));
}

// The release's picture, first one that exists: its Thought's share jpg, then its own.
export function releaseScreenFile(rel, root = process.cwd()) {
  if (!rel) return null;
  for (const f of [rel.thought && join(root, "public/og/thoughts", `${rel.thought}.jpg`), join(root, "public/og/release", `${rel.id}.jpg`)]) {
    if (!f) continue;
    try { return { file: f, buf: readFileSync(f) }; } catch { /* next */ }
  }
  return null;
}

export function releaseScreen(rel, root) {
  const s = releaseScreenFile(rel, root);
  return s ? `data:image/jpeg;base64,${s.buf.toString("base64")}` : null;
}

// "Yui 0.5.0 | Sep 27" for an eyebrow; "Yui 0.5.0: the crew feels ready" for a headline.
export const releaseTag = (rel) => `Yui ${rel.version} | ${rel.date}`;
export const releaseHead = (rel) => `Yui ${rel.version}: ${rel.name}`;

// The image version: build number plus a hash of the release and its picture, so a new release or a new
// shot is a new og:image URL and X, iMessage, Slack and Telegram fetch it fresh.
export function releaseVersion(rel, root) {
  if (!rel) return "none";
  const s = releaseScreenFile(rel, root);
  const h = createHash("sha1").update(`${rel.version}\n${rel.build}\n${rel.date}\n${rel.name}\n`).update(s ? s.buf : "").digest("hex").slice(0, 8);
  return `${rel.build}-${h}`;
}
