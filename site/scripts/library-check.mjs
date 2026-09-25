// Library check (FLOW-2). Fails when the library at /developers/library and /library.json
// drifts from the parser: a preset in yl.mjs with no tile, an example that does not parse
// or does not draw its own preset, a flow missing, or anything the public guard refuses.
// Run: node scripts/library-check.mjs   Exit 0 when whole, 1 with one line per problem.
import { PRESETS, parse } from "../lib/yl/yl.mjs";
import { STARTER_FLOWS } from "../lib/yl/starter-flows.mjs";
import { PRESET_ENTRIES, SHELVES, libraryIndex, presets } from "../lib/yl/library.mjs";
import { findLeak } from "../lib/public-guard.mjs";

const problems = [];
const shelves = new Set(SHELVES.map(([k]) => k));

for (const p of presets()) {
  if (p.missing) { problems.push(`${p.name}: in PRESETS (yl.mjs) but has no library entry (lib/yl/library.mjs)`); continue; }
  if (!shelves.has(p.shelf)) problems.push(`${p.name}: unknown shelf "${p.shelf}"`);
  if (!p.purpose || !p.tags?.length) problems.push(`${p.name}: needs a purpose and tags`);
  const ops = parse(p.yl);
  const err = ops.find((o) => o.op === "error");
  if (err) problems.push(`${p.name}: example has an error line: ${err.message} (${err.line})`);
  if (!ops.some((o) => o.op === "add" && o.preset === p.name)) problems.push(`${p.name}: example does not draw a ${p.name}`);
}
for (const k of Object.keys(PRESET_ENTRIES)) if (!PRESETS.includes(k)) problems.push(`${k}: library entry for a preset yl.mjs does not have`);

const index = libraryIndex();
const names = new Set(index.items.filter((i) => i.kind === "flow").map((i) => i.name));
for (const f of STARTER_FLOWS) if (!names.has(f.name)) problems.push(`flow ${f.name}: missing from library.json`);
for (const i of index.items) {
  for (const k of ["name", "kind", "purpose", "yl", "docs"]) if (!i[k]) problems.push(`${i.kind} ${i.name}: library.json item has no ${k}`);
  if (!["preset", "flow"].includes(i.kind)) problems.push(`${i.name}: kind must be preset or flow`);
}
for (const line of JSON.stringify(index, null, 1).split("\n")) {
  const leak = findLeak(line);
  if (leak) problems.push(`library.json: ${leak[0]} "${leak[1]}" in ${line.trim().slice(0, 80)}`);
}

if (problems.length) {
  console.error(problems.join("\n"));
  process.exit(1);
}
console.log(`library ok: ${PRESETS.length} presets, ${STARTER_FLOWS.length} flows, ${index.items.length} items`);
