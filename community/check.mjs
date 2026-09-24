// Checks the community gallery (OSS-5): every entry must be a real screen in three lines or fewer.
//   node community/check.mjs [path/to/gallery.json]
// Exits 1 and says why on the first problem in each entry. CI runs it on every pull request.
import { readFileSync } from "node:fs";
import { apply, initialState, parse } from "../site/lib/yl/yl.mjs";
import { findLeak } from "../site/lib/public-guard.mjs";

const MAX_LINES = 3;
const file = process.argv[2] || new URL("gallery.json", import.meta.url);

// Lines that count: not blank, not a # comment.
export const counted = (yl) => yl.split("\n").filter((l) => l.trim() && !l.trim().startsWith("#"));

export function checkEntry(e) {
  const problems = [];
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(e.id || "")) problems.push("id must be lowercase words joined by dashes");
  if (!e.title || e.title.length > 60) problems.push("title is required, 60 characters at most");
  if (!e.by || e.by.length > 40) problems.push("by is required (your name or GitHub handle), 40 characters at most");
  if (e.github && !/^[A-Za-z0-9-]{1,39}$/.test(e.github)) problems.push("github is a handle, without the @");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(e.date || "")) problems.push("date is YYYY-MM-DD");
  if (typeof e.yl !== "string" || !e.yl.trim()) return [...problems, "yl is required"];
  const lines = counted(e.yl);
  if (lines.length > MAX_LINES) problems.push(`${lines.length} lines, the limit is ${MAX_LINES}`);
  let s = initialState();
  for (const op of parse(e.yl)) s = apply(s, op);
  for (const err of s.errors) problems.push(`does not parse: ${err}`);
  const drawn = Object.values(s.screens).flat().length;
  if (!drawn && !s.errors.length) problems.push("draws nothing");
  const leak = findLeak(`${e.title} ${e.by} ${e.yl}`);
  if (leak && leak[0] !== "private name") problems.push(`looks like a ${leak[0]} ("${leak[1]}"), keep those out`);
  return problems;
}

export function checkGallery(g) {
  const out = [];
  if (!Array.isArray(g.entries)) return [["gallery", ["entries must be a list"]]];
  const seen = new Set();
  for (const e of g.entries) {
    const p = checkEntry(e);
    if (seen.has(e.id)) p.push("id is already taken");
    seen.add(e.id);
    out.push([e.id || "(no id)", p]);
  }
  return out;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  let g;
  try { g = JSON.parse(readFileSync(file, "utf8")); }
  catch (err) { console.error(`gallery: not valid JSON (${err.message})`); process.exit(1); }
  let bad = 0;
  for (const [id, problems] of checkGallery(g)) {
    if (problems.length) { bad++; console.log(`FAIL ${id}`); for (const p of problems) console.log(`     ${p}`); }
    else console.log(`ok   ${id}`);
  }
  console.log(bad ? `\n${bad} of ${g.entries.length} entries need a fix.` : `\nAll ${g.entries.length} entries pass.`);
  process.exit(bad ? 1 : 0);
}
