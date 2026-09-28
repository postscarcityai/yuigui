// Every share preview at a glance (SITE-86): `npm run og:sheet` renders each page's og image into one PNG grid,
// labelled with the page and its og:title, so a release's new cards can be checked in one look.
// Pages: every app/**/page.js without a [param] in its path, plus the newest Thought. Reads the real tags,
// so it shows what X, iMessage, Slack and Telegram will fetch.
// Run: node scripts/og-sheet.mjs [--base http://localhost:3019] [--out og-sheet.png]. After a deploy: --base https://www.yuigui.com.
import { readdirSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { thoughts } from "../lib/thoughts.mjs";

const SITE = fileURLToPath(new URL("..", import.meta.url));
const args = process.argv.slice(2);
const opt = (k, d) => (args.includes(k) ? args[args.indexOf(k) + 1] : d);
const BASE = opt("--base", "http://localhost:3019").replace(/\/$/, "");
const OUT = resolve(opt("--out", "og-sheet.png"));
const COLS = 5, TW = 400, TH = 210, LABEL = 46, GAP = 16;

const paths = [];
(function walk(dir) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (e.isDirectory() && !e.name.includes("[") && !e.name.startsWith("(") && !e.name.startsWith("_")) walk(join(dir, e.name));
    else if (e.name === "page.js") paths.push(`/${relative(join(SITE, "app"), dir)}`.replace(/\/$/, "") || "/");
  }
})(join(SITE, "app"));
paths.sort((a, b) => (a === "/" ? -1 : b === "/" ? 1 : a.localeCompare(b)));
process.chdir(SITE);
const newest = thoughts()[0];
if (newest) paths.push(`/thoughts/${newest.slug}`);

const attr = (html, p) => html.match(new RegExp(`<meta[^>]+(?:property|name)="${p}"[^>]+content="([^"]*)"`))?.[1]
  ?.replaceAll("&amp;", "&").replaceAll("&quot;", '"').replaceAll("&#x27;", "'").replaceAll("&#39;", "'");
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const clip = (s, n) => (s.length > n ? `${s.slice(0, n - 1)}…` : s);

async function tile(path) {
  let img = null, title = "", bad = "";
  try {
    const html = await (await fetch(`${BASE}${path}`)).text();
    title = attr(html, "og:title") || "";
    const src = attr(html, "og:image");
    if (!src) bad = "no og:image";
    else {
      // The tags name www.yuigui.com (metadataBase); draw from --base so a local build shows its own images.
      const u = new URL(src, BASE);
      const res = await fetch(`${BASE}${u.pathname}${u.search}`);
      if (!res.ok) bad = `image ${res.status}`;
      else img = await sharp(Buffer.from(await res.arrayBuffer())).resize(TW, TH, { fit: "cover" }).png().toBuffer();
    }
  } catch (e) { bad = e.message; }
  if (!img) img = await sharp({ create: { width: TW, height: TH, channels: 3, background: "#F6EEF7" } }).png().toBuffer();
  const label = Buffer.from(`<svg width="${TW}" height="${LABEL}" xmlns="http://www.w3.org/2000/svg">
<text x="2" y="18" font-family="Helvetica" font-weight="700" font-size="16" fill="${bad ? "#C23B4F" : "#3A3340"}">${esc(clip(path, 44))}${bad ? ` (${esc(bad)})` : ""}</text>
<text x="2" y="38" font-family="Helvetica" font-size="14" fill="#8C8294">${esc(clip(title, 52))}</text></svg>`);
  return { path, img, label, bad };
}

const tiles = [];
for (let i = 0; i < paths.length; i += 6) tiles.push(...(await Promise.all(paths.slice(i, i + 6).map(tile))));
const rows = Math.ceil(tiles.length / COLS);
const W = GAP + COLS * (TW + GAP), H = GAP + rows * (TH + LABEL + GAP);
const layers = tiles.flatMap((t, i) => {
  const x = GAP + (i % COLS) * (TW + GAP), y = GAP + Math.floor(i / COLS) * (TH + LABEL + GAP);
  return [{ input: t.img, left: x, top: y }, { input: t.label, left: x, top: y + TH + 4 }];
});
await sharp({ create: { width: W, height: H, channels: 3, background: "#FFF9F0" } }).composite(layers).png().toFile(OUT);
const bad = tiles.filter((t) => t.bad);
console.log(`og-sheet: ${tiles.length} pages from ${BASE} -> ${OUT}${bad.length ? `; ${bad.length} without an image: ${bad.map((t) => `${t.path} (${t.bad})`).join(", ")}` : ""}`);
process.exit(bad.length ? 1 : 0);
