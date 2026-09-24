import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";

const dir = path.join(process.cwd(), "content", "notes");

// Frontmatter is optional: a leading --- block of `key: value` lines (date, title, dek).
function parse(src) {
  const m = src.match(/^---\n([\s\S]*?)\n---\n?/);
  if (!m) return { meta: {}, md: src };
  const meta = Object.fromEntries(m[1].split("\n").map((l) => l.match(/^(\w+):\s*(.*)$/)).filter(Boolean).map(([, k, v]) => [k, v.replace(/^"(.*)"$/, "$1")]));
  return { meta, md: src.slice(m[0].length) };
}

// why-yui-is-open-source.md -> { slug, date, title, dek, md }, newest first.
export function notes() {
  return readdirSync(dir)
    .filter((f) => f.endsWith(".md"))
    .map((f) => {
      const { meta, md } = parse(readFileSync(path.join(dir, f), "utf8"));
      const title = meta.title ?? md.match(/^# (.+)$/m)?.[1] ?? f;
      const dek = meta.dek ?? md.split(/\n{2,}/).find((p) => p.trim() && !/^[#>|`!-]/.test(p.trim()))?.trim() ?? "";
      return { slug: f.replace(/\.md$/, "").toLowerCase(), date: meta.date ?? "", title, dek, md };
    })
    .sort((a, b) => b.date.localeCompare(a.date) || a.title.localeCompare(b.title));
}

// 2026-09-24 -> Sep 24, 2026
export function niceDate(d) {
  return d ? new Date(`${d}T12:00:00Z`).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" }) : "";
}
