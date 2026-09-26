import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";

// Thoughts (SITE-30): Yui's blog, rendered from docs/thoughts/*.md (synced to content/thoughts).
// A post is short text between visuals. Visuals are fenced blocks:
//   ```shot     one or more `src | alt` lines (a screenshot row that opens full size)
//   ```clip     `src.mp4 | caption` (poster is the same path with .jpg)
//   ```phone    Yui Lines, drawn live; an optional first line `caption: ...`
//   ```compare  `before: <src or text> | label` and `after: <src or text> | label`
//   ```try      `href | label` lines, big buttons to the playground, /earn, a repo
// Rules (checked by lint(), which stops the sync): a tag, a dek, the body opens with a visual,
// and never more than MAX_TEXT paragraphs before the next one.
const dir = path.join(process.cwd(), "content", "thoughts");

export const TAGS = {
  release: { label: "Release", hint: "What shipped and what to try" },
  why: { label: "Why", hint: "A decision and the reasons" },
  call: { label: "Call", hint: "Open calls, for people and agents" },
};
export const VISUALS = ["shot", "clip", "phone", "compare"];
export const MAX_TEXT = 4;
const FENCE = /^```(shot|clip|phone|compare|try)[ \t]*\n([\s\S]*?)\n```[ \t]*$/gm;

// Frontmatter is a leading --- block of `key: value` lines.
function parse(src) {
  const m = src.match(/^---\n([\s\S]*?)\n---\n?/);
  if (!m) return { meta: {}, md: src };
  const meta = Object.fromEntries(m[1].split("\n").map((l) => l.match(/^(\w+):\s*(.*)$/)).filter(Boolean).map(([, k, v]) => [k, v.replace(/^"(.*)"$/, "$1")]));
  return { meta, md: src.slice(m[0].length) };
}

const pair = (l) => {
  const [a, ...b] = l.split(" | ");
  return [a.trim(), b.join(" | ").trim()];
};
const isSrc = (s) => /^\/\S+\.(webp|png|jpe?g|gif)$/i.test(s);

function block(kind, body) {
  const lines = body.split("\n").filter((l) => l.trim());
  if (kind === "shot") return { kind, images: lines.map((l) => { const [src, alt] = pair(l); return { src, alt }; }) };
  if (kind === "clip") { const [src, caption] = pair(lines[0] || ""); return { kind, src, poster: src.replace(/\.mp4$/, ".jpg"), caption }; }
  if (kind === "phone") {
    const cap = lines[0]?.match(/^caption:\s*(.*)$/);
    return { kind, caption: cap ? cap[1] : "", yl: (cap ? lines.slice(1) : lines).join("\n") };
  }
  if (kind === "compare") {
    const side = (k) => { const l = lines.find((x) => x.startsWith(`${k}:`)); const [v, label] = pair((l || "").slice(k.length + 1)); return isSrc(v) ? { src: v, label } : { text: v, label }; };
    return { kind, before: side("before"), after: side("after") };
  }
  return { kind, links: lines.map((l) => { const [href, label] = pair(l); return { href, label }; }) };
}

// The body as a list of parts: { kind: "md", md } or a visual/try block, in order.
export function parts(md) {
  const out = [];
  let at = 0;
  for (const m of md.matchAll(FENCE)) {
    const text = md.slice(at, m.index).trim();
    if (text) out.push({ kind: "md", md: text });
    out.push(block(m[1], m[2]));
    at = m.index + m[0].length;
  }
  const rest = md.slice(at).trim();
  if (rest) out.push({ kind: "md", md: rest });
  return out;
}

// Paragraphs, lists and quotes count as text; headings do not.
const textBlocks = (md) => md.split(/\n{2,}/).filter((b) => b.trim() && !/^#{1,6} /.test(b.trim())).length;

// The picture a card and a feed item lead with.
export function leadOf(ps) {
  const v = ps.find((p) => VISUALS.includes(p.kind));
  if (!v) return null;
  if (v.kind === "shot") return { src: v.images[0].src, alt: v.images[0].alt };
  if (v.kind === "clip") return { src: v.poster, alt: v.caption, clip: true };
  if (v.kind === "compare") { const s = v.after.src ? v.after : v.before; return s.src ? { src: s.src, alt: s.label } : { yl: v.after.text.replaceAll("\\n", "\n"), alt: v.after.label }; }
  return { yl: v.yl, alt: v.caption };
}

// What breaks the house rules, as strings. Empty when the post is fine.
export function lint(t) {
  const out = [];
  if (!TAGS[t.tag]) out.push(`tag must be one of ${Object.keys(TAGS).join(", ")}`);
  if (!t.date || !t.title || !t.dek) out.push("date, title and dek are required");
  if (/—/.test(t.title + t.dek + t.md)) out.push("no em dashes");
  const ps = parts(t.md);
  if (!VISUALS.includes(ps[0]?.kind)) out.push("the body must open with a visual (shot, clip, phone or compare)");
  let run = 0;
  for (const p of ps) {
    if (VISUALS.includes(p.kind)) run = 0;
    else if (p.kind === "md" && (run += textBlocks(p.md)) > MAX_TEXT) { out.push(`more than ${MAX_TEXT} paragraphs before the next visual, near: ${p.md.slice(0, 60)}`); break; }
  }
  return out;
}

export function readThought(file, src) {
  const { meta, md } = parse(src);
  const body = md.replace(/^\s*# .+\n/, "");
  const ps = parts(body);
  return { slug: path.basename(file).replace(/\.md$/, "").toLowerCase(), date: meta.date ?? "", title: meta.title ?? "", dek: meta.dek ?? "", tag: meta.tag ?? "", draft: meta.draft === "true", md: body, parts: ps, lead: leadOf(ps) };
}

// Published thoughts, newest first. A draft (draft: true) stays off the site.
export function thoughts() {
  return readdirSync(dir)
    .filter((f) => f.endsWith(".md"))
    .map((f) => readThought(f, readFileSync(path.join(dir, f), "utf8")))
    .filter((t) => !t.draft)
    .sort((a, b) => b.date.localeCompare(a.date) || a.title.localeCompare(b.title));
}

// 2026-09-24 -> Sep 24, 2026
export function niceDate(d) {
  return d ? new Date(`${d}T12:00:00Z`).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" }) : "";
}
