// Library check (FLOW-2). Fails when the library at /developers/library and /library.json
// drifts from the parser: a preset in yl.mjs with no tile, an example that does not parse
// or does not draw its own preset, a flow missing, or anything the public guard refuses.
// Runs before every `npm run build`, so a drifted library never deploys.
// Run: node scripts/library-check.mjs   Exit 0 when whole, 1 with one line per problem.
import { PRESETS, parse } from "../lib/yl/yl.mjs";
import { FLOW_VARIANTS, STARTER_FLOWS, savedGraph } from "../lib/yl/starter-flows.mjs";
import { INTENTS, MUSIC_SCREENS, PRESET_ENTRIES, SHELVES, libraryIndex, libraryLeaks, presets, search } from "../lib/yl/library.mjs";

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
for (const f of [...STARTER_FLOWS, ...FLOW_VARIANTS]) if (!names.has(f.name)) problems.push(`flow ${f.name}: missing from library.json`);
for (const i of index.items) {
  for (const k of ["name", "kind", "purpose", "yl", "docs"]) if (!i[k]) problems.push(`${i.kind} ${i.name}: library.json item has no ${k}`);
  if (!["preset", "flow", "screen"].includes(i.kind)) problems.push(`${i.name}: kind must be preset, flow or screen`);
  if (!i.intents?.length) problems.push(`${i.kind} ${i.name}: needs intent phrases (INTENTS in lib/yl/library.mjs)`);
  if (i.kind === "flow" && !i.base && !i.source?.startsWith("flowchart")) problems.push(`flow ${i.name}: library.json item has no Mermaid source`);
  if (i.kind === "flow" && i.base) {
    // A variant: its lines parse with no error line, name a base in the library and build a graph.
    const ops = parse(i.yl);
    const err = ops.find((o) => o.op === "error");
    if (err) problems.push(`flow ${i.name}: variant lines have an error line: ${err.message} (${err.line})`);
    if (!ops.some((o) => o.op === "patch" && o.props.changes?.length)) problems.push(`flow ${i.name}: variant lines change nothing`);
    if (!names.has(i.base)) problems.push(`flow ${i.name}: base ${i.base} is not in the library`);
    if (!savedGraph(i.name)?.g.nodes?.length) problems.push(`flow ${i.name}: variant builds no graph`);
  }
}
// A ready-made screen (YUI-117): its lines parse with no error line and draw at least one preset
// besides say; its name is not a preset's or a flow's, so search and the page keep them apart.
const MUSIC = ["loop", "drums", "keys", "chords", "tuner", "metronome"];
for (const s of MUSIC_SCREENS) {
  const ops = parse(s.yl);
  const err = ops.find((o) => o.op === "error");
  if (err) problems.push(`screen ${s.name}: an error line: ${err.message} (${err.line})`);
  if (!ops.some((o) => o.op === "add" && MUSIC.includes(o.preset))) problems.push(`screen ${s.name}: draws no music preset`);
  if (PRESETS.includes(s.name) || names.has(s.name)) problems.push(`screen ${s.name}: name taken by a preset or a flow`);
  if (!index.items.some((i) => i.kind === "screen" && i.name === s.name && i.app === "coming")) problems.push(`screen ${s.name}: missing from library.json, or not marked app "coming"`);
}
for (const k of Object.keys(INTENTS)) if (!index.items.some((i) => i.name === k)) problems.push(`${k}: intents for an entry the library does not have`);
for (const q of ["music", "guitar"]) if (search(index.items, q, { kind: "screen" }).length < 2) problems.push(`search "${q}": finds fewer than 2 music screens`);
// Search finds what an agent asks for (the same search as the page, /api/library and yui_library).
for (const [q, want] of [["intake", "website-intake"], ["timer", "timer"], ["diagram", "shapes"], ["yes or no", "ask"], ["before and after", "compare"], ["restaurant", "restaurant-intake"], ["music practice", "practice-session"], ["strum along", "chord-chart"]]) {
  const top = search(index.items, q, { limit: 1 })[0];
  if (top?.name !== want) problems.push(`search "${q}": top hit is ${top?.name || "nothing"}, want ${want}`);
}
problems.push(...libraryLeaks(index));

if (problems.length) {
  console.error(problems.join("\n"));
  process.exit(1);
}
console.log(`library ok: ${PRESETS.length} presets, ${STARTER_FLOWS.length} flows, ${FLOW_VARIANTS.length} variant, ${MUSIC_SCREENS.length} music screens, ${index.items.length} items`);
