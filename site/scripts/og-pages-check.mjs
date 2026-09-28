// Every page shares as itself (SITE-85). Fails the build when an app/**/page.js sets no openGraph of its
// own, because Next then shares it as the home page: the layout's title, line and picture.
// A page passes when its metadata goes through pageMeta (lib/og/meta.mjs) or sets openGraph itself, or
// when it re-exports the metadata of a page that does. The home page is the one exception: layout.js
// holds its openGraph. It also fails when a pageMeta key has no row in lib/og/pages.mjs.
// Run: node scripts/og-pages-check.mjs (npm run build runs it first). Exit 0 when every page passes.
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { PAGES } from "../lib/og/pages.mjs";

const SITE = fileURLToPath(new URL("..", import.meta.url));
const APP = join(SITE, "app");
const HOME = join(APP, "page.js");

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
  if (f === HOME) continue;
  if (!passes(f)) problems.push(`${rel}: no openGraph of its own, so it shares as the home page. Use pageMeta from lib/og/meta.mjs.`);
  const src = readFileSync(f, "utf8");
  for (const m of src.matchAll(/pageMeta\(\{([^}]*)/g)) {
    const key = m[1].match(/\bkey:\s*"([^"]+)"/)?.[1] ?? m[1].match(/\bpath:\s*"([^"]+)"/)?.[1];
    if (key && !PAGES[key]) problems.push(`${rel}: pageMeta key "${key}" has no row in lib/og/pages.mjs`);
  }
}

if (problems.length) {
  for (const p of problems) console.error(`og-pages: ${p}`);
  console.error(`og-pages: ${problems.length} problem(s) across ${pages.length} pages`);
  process.exit(1);
}
console.log(`og-pages ok: ${pages.length - 1} pages share as themselves (home uses layout.js)`);
