// Every example line in the channel guide must parse on its own, the way
// the app parses a reply: one fresh parser per example, so a patch that
// names an id from somewhere else fails here just as it fails in the app.
//
//   node guide.test.mjs [path/to/CHANNEL.md]     exit 1 on any bad example
//
// Checked: every line of every ```yui block (one parser per block) and every
// inline `code` span in the agent-facing part whose first word is a line head
// (a preset, a core word, ~patch or >screen). Bare values like `90s` are not.

import { readFileSync } from "node:fs";
import { Parser, PRESETS, CORE } from "../../site/lib/yl/yl.mjs";
import { guideFrom } from "./run.mjs";

const path = process.argv[2] || new URL("../CHANNEL.md", import.meta.url).pathname;
const { body, version, words } = guideFrom(readFileSync(path, "utf8"));
const HEADS = new Set([...PRESETS, ...CORE]);
const isLine = (s) => {
  const head = s.trim().split(/\s+/)[0].replace(/@[\w-]+$/, "");
  if (s.trim() === "end") return false; // the word, named in prose; it only parses after a group head
  return head.startsWith("~") || /^>[\w-]+$/.test(head) || HEADS.has(head);
};

const examples = [];
// Fenced yui blocks (inside a ```` outer fence too), one parser per block.
for (const m of body.matchAll(/```yui\n([\s\S]*?)```/g)) examples.push({ lines: m[1].split("\n").filter((l) => l.trim()) });
// Inline spans outside fences.
const prose = body.replace(/````[\s\S]*?````/g, "").replace(/```[\s\S]*?```/g, "");
for (const m of prose.matchAll(/`([^`\n]+)`/g)) if (isLine(m[1])) examples.push({ lines: [m[1]] });

let bad = 0;
for (const ex of examples) {
  const p = new Parser();
  for (const l of ex.lines) {
    const op = p.line(l);
    if (op?.op === "error") { bad++; console.log(`BAD  ${l}\n     ${op.message}`); }
  }
}
const n = examples.reduce((a, e) => a + e.lines.length, 0);
console.log(`${version}: ${n} example lines, ${bad} bad, ${words} words`);
process.exit(bad ? 1 : 0);
