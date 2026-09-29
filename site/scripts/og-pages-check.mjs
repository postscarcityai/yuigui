// Every page shares as itself (SITE-85). Fails the build when an app/**/page.js sets no openGraph of its
// own, because Next then shares it as the home page: the layout's title, line and picture.
// A page passes when its metadata goes through pageMeta (lib/og/meta.mjs) or sets openGraph itself, or
// when it re-exports the metadata of a page that does. The home page shares a fixed picture (SITE-103), not the release.
// It also fails when a pageMeta key has no row in lib/og/pages.mjs, and when ROADMAP.md has no Latest release
// line for the release cards to follow.
// Run: node scripts/og-pages-check.mjs (npm run build runs it first). Exit 0 when every page passes.
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { PAGES } from "../lib/og/pages.mjs";
import { latestRelease, releaseScreenFile } from "../lib/og/release.mjs";

const SITE = fileURLToPath(new URL("..", import.meta.url));
const APP = join(SITE, "app");

const pages = [];
(function walk(dir) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (e.isDirectory()) walk(join(dir, e.name));
    else if (e.name === "page.js") pages.push(join(dir, e.name));
  }
})(APP);

const own = (src) => /\bpageMeta\(/.test(src) || /\bopenGraph\s*:/.test(src);
function passes(file, seen = new Set()) {
  if (seen.has(file)) return false;
  seen.add(file);
  const src = readFileSync(file, "utf8");
  if (own(src)) return true;
  const re = src.match(/export\s*\{[^}]*\bmetadata\b[^}]*\}\s*from\s*["']([^"']+)["']/);
  if (!re) return false;
  const target = resolve(dirname(file), re[1]);
  return passes(target.endsWith(".js") ? target : `${target}.js`, seen);
}

const problems = [];
for (const f of pages.sort()) {
  const rel = relative(SITE, f);
  if (!passes(f)) problems.push(`${rel}: no openGraph of its own, so it shares as the home page. Use pageMeta from lib/og/meta.mjs.`);
  const src = readFileSync(f, "utf8");
  for (const m of src.matchAll(/pageMeta\(\{([^}]*)/g)) {
    const key = m[1].match(/\bkey:\s*"([^"]+)"/)?.[1] ?? m[1].match(/\bpath:\s*"([^"]+)"/)?.[1];
    if (key && !PAGES[key]) problems.push(`${rel}: pageMeta key "${key}" has no row in lib/og/pages.mjs`);
  }
}

const rel = latestRelease(SITE);
if (!rel) problems.push("content/ROADMAP.md: no **Latest release: Yui <version>, build <n>, <date>: <name>.** line, so the release cards have nothing to follow");
else if (!releaseScreenFile(rel, SITE)) console.warn(`og-pages: no picture for Yui ${rel.version} yet, its cards draw lines. Run npm run og:refresh and commit the jpg.`);

if (problems.length) {
  for (const p of problems) console.error(`og-pages: ${p}`);
  console.error(`og-pages: ${problems.length} problem(s) across ${pages.length} pages`);
  process.exit(1);
}
console.log(`og-pages ok: ${pages.length} pages share as themselves; ${Object.keys(PAGES).filter((k) => PAGES[k].release).join(", ")} follow Yui ${rel.version}`);
