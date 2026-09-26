// Library check (FLOW-2). Fails when the library at /developers/library and /library.json
// drifts from the parser: a preset in yl.mjs with no tile, an example that does not parse
// or does not draw its own preset, a flow missing, or anything the public guard refuses.
// Runs before every `npm run build`, so a drifted library never deploys.
// Run: node scripts/library-check.mjs   Exit 0 when whole, 1 with one line per problem.
import { PRESETS, parse } from "../lib/yl/yl.mjs";
import { STARTER_FLOWS } from "../lib/yl/starter-flows.mjs";
import { INTENTS, PRESET_ENTRIES, SHELVES, libraryIndex, libraryLeaks, presets, search } from "../lib/yl/library.mjs";

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
  if (!i.intents?.length) problems.push(`${i.kind} ${i.name}: needs intent phrases (INTENTS in lib/yl/library.mjs)`);
  if (i.kind === "flow" && !i.source?.startsWith("flowchart")) problems.push(`flow ${i.name}: library.json item has no Mermaid source`);
}
for (const k of Object.keys(INTENTS)) if (!index.items.some((i) => i.name === k)) problems.push(`${k}: intents for an entry the library does not have`);
// Search finds what an agent asks for (the same search as the page, /api/library and yui_library).
for (const [q, want] of [["intake", "website-intake"], ["timer", "timer"], ["diagram", "shapes"], ["yes or no", "ask"], ["before and after", "compare"]]) {
  const top = search(index.items, q, { limit: 1 })[0];
  if (top?.name !== want) problems.push(`search "${q}": top hit is ${top?.name || "nothing"}, want ${want}`);
}
problems.push(...libraryLeaks(index));

if (problems.length) {
  console.error(problems.join("\n"));
  process.exit(1);
}
console.log(`library ok: ${PRESETS.length} presets, ${STARTER_FLOWS.length} flows, ${index.items.length} items`);
