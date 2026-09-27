// Which models use Yui well (YUI-132): one row per model on the same guide and
// cases, from saved reports, for the table on /channel.
//
//   node scores.mjs     writes site/content/model-scores.json
//
// A model's score is its first full pass. Its misses were run once more
// (reports/<label>-rerun): a case that failed both times is a steady miss,
// one that passed the second time is noise (the suite swings a few cases).

import { existsSync, readFileSync, writeFileSync } from "node:fs";

const HERE = new URL(".", import.meta.url);
const ROWS = [
  { name: "Claude Opus 5.5", id: "claude-opus-5-5", via: "the fleet's agents", report: "v37-opus" },
  { name: "Claude Sonnet 5", id: "claude-sonnet-5", via: "Claude Code", report: "v37-sonnet" },
  { name: "GLM 5.2", id: "z-ai/glm-5.2", via: "OpenRouter, Yui's pick for text", report: "v37-glm52" },
  { name: "GLM-5V-Turbo", id: "z-ai/glm-5v-turbo", via: "OpenRouter, Yui's pick for photos", report: "v37-glm5v" },
];

// A scorer reason, in plain words (run.mjs score()).
const KINDS = [
  [/^parse:/, "lines the app can't read"],
  [/^screen: no /, "no screen when one was needed"],
  [/^screen: block has no/, "lines the app can't read"],
  [/^screen: sent a screen/, "a screen for a plain answer"],
  [/^(need|preset):/, "the wrong kind of screen"],
  [/^words:|^sentences:|^pages:/, "too long"],
  [/^text: markdown table/, "a markdown table"],
  [/^(fence|html):/, "screens written the wrong way"],
  [/^(options|dead button|tap|label):/, "a button that does nothing"],
  [/^patch:/, "a new screen instead of a change"],
  [/^(show|drawn|map|page picture):/, "words where a picture belongs"],
  [/^(one flow|one screen|one deck|components):/, "too many pieces"],
  [/^no reply:/, "no answer"],
  [/^secret:/, "asked for a secret in a form"],
  [/^doing:/, "no word on what it is doing during a long turn"],
  [/^at:/, "didn't hand work to the right agent"],
  [/^page:/, "left on the chat what belongs on a page"],
  [/^app theme:/, "didn't restyle the app"],
];
const kind = (f) => KINDS.find(([re]) => re.test(f))?.[1] ?? "other";

const load = (label) => {
  const p = new URL(`reports/${label}.json`, HERE);
  return existsSync(p) ? JSON.parse(readFileSync(p, "utf8")) : null;
};

const models = [];
let guide;
for (const row of ROWS) {
  const run = load(row.report);
  if (!run) { console.warn(`skip ${row.name}: no reports/${row.report}.json`); continue; }
  guide ??= run.guide.version;
  if (run.guide.version !== guide) throw new Error(`${row.report} is guide ${run.guide.version}, want ${guide}`);
  const again = load(`${row.report}-rerun`);
  const second = new Map((again?.results || []).map((r) => [r.id, r.score.pass]));
  const fails = run.results.filter((r) => !r.score.pass);
  const steady = fails.filter((r) => second.get(r.id) !== true);
  const cats = {};
  for (const r of run.results) { cats[r.category] ??= [0, 0]; cats[r.category][1]++; if (r.score.pass) cats[r.category][0]++; }
  const kinds = {};
  for (const r of steady) for (const k of new Set(r.score.fails.map(kind))) kinds[k] = (kinds[k] || 0) + 1;
  const pass = run.results.length - fails.length;
  models.push({
    ...row, pass, n: run.results.length, pct: Math.round((100 * pass) / run.results.length),
    steady: steady.length, noise: fails.length - steady.length, reran: !!again,
    misses: Object.entries(kinds).sort((a, b) => b[1] - a[1]).map(([what, n]) => ({ what, n })),
    steadyIds: steady.map((r) => r.id), cats,
  });
}
const out = { guide, date: new Date().toISOString().slice(0, 10), models };
writeFileSync(new URL("../../site/content/model-scores.json", HERE), JSON.stringify(out, null, 2) + "\n");
for (const m of models) console.log(`${m.name}: ${m.pass}/${m.n} (${m.pct}%), ${m.steady} steady misses: ${m.misses.map((x) => `${x.what} ${x.n}`).join(", ")}`);
