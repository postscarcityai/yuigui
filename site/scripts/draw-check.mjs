// Every example on /developers/draw must parse with the reference parser, with no dropped line and no stray op.
// Run: node scripts/draw-check.mjs. Exit 0 when every example parses.
import { apply, initialState, parse } from "../lib/yl/yl.mjs";
import { COMING, DRAWINGS } from "../lib/draw-examples.mjs";

const problems = [];
for (const d of DRAWINGS) {
  const lines = d.yl.split("\n");
  let ops;
  try { ops = parse(d.yl); } catch (e) { problems.push(`${d.id}: parse threw ${e.message}`); continue; }
  if (!ops.length) problems.push(`${d.id}: parsed to nothing`);
  const bad = ops.filter((o) => o.op === "error" || o.error);
  if (bad.length) problems.push(`${d.id}: ${bad.length} op(s) with an error`);
  let s = initialState();
  for (const op of ops) s = apply(s, op);
  const nodes = Object.values(s.screens).flat();
  if (!nodes.length) problems.push(`${d.id}: drew no node`);
  if (process.env.SHOW) console.log(d.id, lines.length, "lines ->", ops.length, "ops,", nodes.map((n) => n.preset || n.group?.preset).join(","));
}
const ids = new Set();
for (const x of [...DRAWINGS, ...COMING]) { if (ids.has(x.id)) problems.push(`${x.id}: duplicate id`); ids.add(x.id); }
for (const x of [...DRAWINGS, ...COMING]) for (const t of [x.title, x.what]) if (/—|–/.test(t) || /\b[A-Z]{2,5}-\d+\b/.test(t)) problems.push(`${x.id}: em dash or card id in text`);

if (problems.length) { console.error(problems.join("\n")); process.exit(1); }
console.log(`draw-check: ${DRAWINGS.length} examples parse`);
