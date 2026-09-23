// Token benchmark: Yui Lines vs the equivalent JSON, on the 10 sample screens.
// Writes ../spec/BENCHMARK.md and ../site/content/benchmark.json.
//
// The JSON is generated from the parsed YL (toJSON), so both sides carry the
// same information and the same defaults. Three JSON shapes are measured:
//   min   minified flat array, the cheapest JSON possible
//   pretty  the same, 2-space indented (how models usually emit JSON)
//   tree  a component-tree document ({screens:[{children:[{type,props}]}]}),
//         the usual generative-UI schema shape, 2-space indented
import { writeFileSync } from "node:fs";
import { getEncoding } from "js-tiktoken";
import { countTokens as claudeLegacy } from "@anthropic-ai/tokenizer";
import { parse, toJSON } from "../site/lib/yl/yl.mjs";
import { SCREENS } from "../site/lib/yl/samples.mjs";

const o200k = getEncoding("o200k_base");
const cl100k = getEncoding("cl100k_base");
const TOK = {
  o200k: (s) => o200k.encode(s).length,
  cl100k: (s) => cl100k.encode(s).length,
  claude: (s) => claudeLegacy(s),
};

const cap = (s) => s[0].toUpperCase() + s.slice(1);
function tree(ops) {
  const screens = {};
  for (const j of toJSON(ops)) {
    const { screen = 1, type, ...props } = j;
    (screens[screen] ||= []).push(type ? { type: cap(type), props } : j);
  }
  return { screens: Object.entries(screens).map(([id, children]) => ({ id, children })) };
}

const rows = SCREENS.map((s, i) => {
  const ops = parse(s.yl);
  const errs = ops.filter((o) => o.op === "error");
  if (errs.length) throw new Error(`screen ${i + 1} has parse errors: ${JSON.stringify(errs)}`);
  const flat = toJSON(ops);
  const text = {
    yl: s.yl,
    min: JSON.stringify(flat),
    pretty: JSON.stringify(flat, null, 2),
    tree: JSON.stringify(tree(ops), null, 2),
  };
  const counts = {};
  for (const [k, v] of Object.entries(text)) {
    counts[k] = { chars: v.length };
    for (const [tn, f] of Object.entries(TOK)) counts[k][tn] = f(v);
  }
  return { n: i + 1, name: s.name, components: ops.length, text, counts };
});

const sum = (k, t) => rows.reduce((a, r) => a + r.counts[k][t], 0);
const totals = {};
for (const k of ["yl", "min", "pretty", "tree"]) {
  totals[k] = { chars: sum(k, "chars") };
  for (const t of Object.keys(TOK)) totals[k][t] = sum(k, t);
}
const ratio = (a, b) => (a / b).toFixed(1);

const out = {
  generated: new Date().toISOString(),
  tokenizers: {
    o200k: "o200k_base via js-tiktoken (GPT-4o / GPT-5 family)",
    cl100k: "cl100k_base via js-tiktoken (GPT-4 / GPT-3.5)",
    claude: "@anthropic-ai/tokenizer (Anthropic's published legacy Claude tokenizer; current Claude models are not public offline)",
  },
  rows: rows.map(({ text, ...r }) => ({ ...r, yl: text.yl, min: text.min })),
  totals,
  sampleTree: rows[0].text.tree,
};
writeFileSync(new URL("../site/content/benchmark.json", import.meta.url), JSON.stringify(out, null, 2));

// Markdown report
const L = [];
L.push("# Yui Lines token benchmark");
L.push("");
L.push(`Generated ${out.generated.slice(0, 10)} by \`~/dev/yui/bench/bench.mjs\` (\`npm run bench\`). Ten sample screens from \`site/lib/yl/samples.mjs\`, the same ones the playground renders.`);
L.push("");
L.push("The JSON side is generated from the parsed YL, so it carries exactly the same information and the same defaults. Three JSON shapes:");
L.push("");
L.push("- **min**: minified flat array, the cheapest JSON possible.");
L.push("- **pretty**: the same array, 2-space indented, which is how models usually emit JSON.");
L.push("- **tree**: a component-tree document (`{screens:[{children:[{type,props}]}]}`), the usual generative-UI schema shape.");
L.push("");
L.push("Tokenizers:");
for (const v of Object.values(out.tokenizers)) L.push(`- ${v}`);
L.push("");
L.push("## Tokens per screen (o200k_base)");
L.push("");
L.push("| # | Screen | Lines | YL | JSON min | JSON pretty | JSON tree | min / YL | tree / YL |");
L.push("|---|---|---:|---:|---:|---:|---:|---:|---:|");
for (const r of rows) {
  const c = r.counts;
  L.push(`| ${r.n} | ${r.name} | ${r.components} | ${c.yl.o200k} | ${c.min.o200k} | ${c.pretty.o200k} | ${c.tree.o200k} | ${ratio(c.min.o200k, c.yl.o200k)}x | ${ratio(c.tree.o200k, c.yl.o200k)}x |`);
}
const T = totals;
L.push(`| | **Total** | ${rows.reduce((a, r) => a + r.components, 0)} | **${T.yl.o200k}** | **${T.min.o200k}** | **${T.pretty.o200k}** | **${T.tree.o200k}** | **${ratio(T.min.o200k, T.yl.o200k)}x** | **${ratio(T.tree.o200k, T.yl.o200k)}x** |`);
L.push("");
L.push("## Totals across tokenizers");
L.push("");
L.push("| Tokenizer | YL | JSON min | JSON pretty | JSON tree | min / YL | pretty / YL | tree / YL |");
L.push("|---|---:|---:|---:|---:|---:|---:|---:|");
for (const t of [...Object.keys(TOK), "chars"]) {
  L.push(`| ${t === "chars" ? "characters" : t} | ${T.yl[t]} | ${T.min[t]} | ${T.pretty[t]} | ${T.tree[t]} | ${ratio(T.min[t], T.yl[t])}x | ${ratio(T.pretty[t], T.yl[t])}x | ${ratio(T.tree[t], T.yl[t])}x |`);
}
L.push("");
L.push("## Screen 1, all four encodings");
L.push("");
L.push("YL (" + rows[0].counts.yl.o200k + " tokens):");
L.push("```\n" + rows[0].text.yl + "\n```");
L.push("JSON min (" + rows[0].counts.min.o200k + " tokens):");
L.push("```json\n" + rows[0].text.min + "\n```");
L.push("JSON tree (" + rows[0].counts.tree.o200k + " tokens):");
L.push("```json\n" + rows[0].text.tree + "\n```");
L.push("");
L.push("## Caveats");
L.push("");
L.push("- Current Claude tokenizers are not published for offline use and this machine has no Anthropic API key for `count_tokens`, so the Claude column uses Anthropic's legacy published tokenizer. Treat it as indicative. The ratios agree across all three tokenizers.");
L.push("- The JSON is the most generous version of JSON: short keys, defaults omitted. Hand-written or schema-validated JSON from a real generative-UI framework is usually longer, so the real-world gap is wider than the `min` column.");
L.push("- Output tokens are what matter for latency: at ~50-100 output tokens per second, every 10 tokens saved is 0.1-0.2 s before the screen appears. Streaming YL also renders line by line, so the first component appears after its own line, not after the whole document closes.");
writeFileSync(new URL("../spec/BENCHMARK.md", import.meta.url), L.join("\n") + "\n");

console.log(L.slice(L.indexOf("## Tokens per screen (o200k_base)"), L.indexOf("## Screen 1, all four encodings")).join("\n"));
