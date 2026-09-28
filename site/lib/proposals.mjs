import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";

// Proposals (SITE-87): big ideas shown before any app code, at /proposals and /proposals/<slug>.
// One file per proposal in docs/proposals/*.md (synced to content/proposals), the system in docs/PROPOSALS.md.
// Frontmatter: id, title, summary, status, date, becomes, cost, call. The body is a ```hero block of Yui Lines
// (the phone at the top of the page until SITE-88 fills it) and one ## section per assessment field, in order.
// lint() stops the sync when a field is missing, so every proposal reads the same.
const dir = path.join(process.cwd(), "content", "proposals");

export const STATUSES = ["Exploring", "Open for votes", "Accepted", "Building", "Shipped", "Not now"];
export const COSTS = { S: "A day or two", M: "About a week", L: "More than a week" };
export const CALLS = { recommend: "Yui recommends it", "not now": "Yui says not now" };
// [key, heading as written in the file]. Pros, cons and open questions are lists.
export const FIELDS = [
  ["problem", "The problem"],
  ["who", "Who it is for"],
  ["how", "How it works"],
  ["pros", "Pros"],
  ["cons", "Cons"],
  ["cost", "Cost"],
  ["risks", "Risks"],
  ["questions", "Open questions"],
  ["call", "Yui's call"],
];
const META = ["id", "title", "summary", "status", "date", "becomes", "cost", "call"];

function parse(src) {
  const m = src.match(/^---\n([\s\S]*?)\n---\n?/);
  if (!m) return { meta: {}, md: src };
  const meta = Object.fromEntries(m[1].split("\n").map((l) => l.match(/^(\w+):\s*(.*)$/)).filter(Boolean).map(([, k, v]) => [k, v.replace(/^"(.*)"$/, "$1")]));
  return { meta, md: src.slice(m[0].length) };
}

export function readProposal(file, src) {
  const { meta, md } = parse(src);
  const hero = md.match(/^```hero[ \t]*\n([\s\S]*?)\n```[ \t]*$/m)?.[1]?.trim() || "";
  const sections = {};
  for (const part of md.split(/^## /m).slice(1)) {
    const [head, ...rest] = part.split("\n");
    const key = FIELDS.find(([, h]) => h === head.trim())?.[0];
    if (key) sections[key] = rest.join("\n").trim();
  }
  return { slug: file.replace(/\.md$/, ""), ...meta, hero, sections };
}

// What is wrong with a proposal, as a list of short lines (empty when it is fine).
export function lint(p) {
  const out = [];
  for (const k of META) if (!p[k]) out.push(`no ${k}`);
  if (p.id && !/^PROP-\d+$/.test(p.id)) out.push(`id "${p.id}" is not PROP-<n>`);
  if (p.status && !STATUSES.includes(p.status)) out.push(`status "${p.status}" is not one of ${STATUSES.join(", ")}`);
  if (p.cost && !COSTS[p.cost]) out.push(`cost "${p.cost}" is not S, M or L`);
  if (p.call && !CALLS[p.call]) out.push(`call "${p.call}" is not recommend or not now`);
  if (p.date && !/^\d{4}-\d{2}-\d{2}$/.test(p.date)) out.push(`date "${p.date}" is not YYYY-MM-DD`);
  if (!p.hero) out.push("no ```hero block");
  for (const [k, h] of FIELDS) if (!p.sections[k]) out.push(`no "## ${h}" section`);
  return out;
}

// Newest first, then by id.
export function proposals() {
  let files = [];
  try { files = readdirSync(dir).filter((f) => f.endsWith(".md")); } catch { return []; }
  const num = (p) => Number(p.id?.split("-")[1] || 0);
  return files.map((f) => readProposal(f, readFileSync(path.join(dir, f), "utf8")))
    .sort((a, b) => (b.date || "").localeCompare(a.date || "") || num(b) - num(a));
}

// The system itself (docs/PROPOSALS.md), without its title line.
export function howItWorks() {
  try { return readFileSync(path.join(process.cwd(), "content", "PROPOSALS.md"), "utf8").replace(/^# .*\n+/, ""); } catch { return ""; }
}

export const niceDate = (d) => (d ? new Date(`${d}T12:00:00Z`).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" }) : "");
