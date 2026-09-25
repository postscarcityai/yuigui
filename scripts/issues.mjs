#!/usr/bin/env node
// Open board cards as GitHub issues (OSS-3). The board stays the source of truth; this is a
// one-way mirror of the drafts in docs/issues/<card>.md.
//
//   node scripts/issues.mjs            dry run: check every draft, say what would change
//   node scripts/issues.mjs --apply    create the labels, then create or update each issue
//   node scripts/issues.mjs --apply OSS-4 YUI-76    only these cards
//
// A draft is frontmatter (card, repo, title, labels) and a markdown body. Each issue carries
// `<!-- yui-card: KEY -->` in its body, so a second run edits the same issue instead of opening
// another. Closed issues are left closed. Needs `gh` signed in with write access to the repos.
import { readFileSync, readdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { findLeak } from "../site/lib/public-guard.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dir = join(root, "docs/issues");
const args = process.argv.slice(2);
const apply = args.includes("--apply");
const only = args.filter((a) => !a.startsWith("--"));

const LABELS = {
  "good first issue": ["7057ff", "Good for newcomers"],
  "help wanted": ["008672", "Extra attention is needed"],
  "area:parsers": ["c5def5", "Yui Lines parsers and conformance"],
  "area:adapters": ["bfd4f2", "Connecting an agent framework to Yui"],
  "area:app": ["fbca04", "The Yui app"],
};

const marker = (card) => `<!-- yui-card: ${card} -->`;
const footer = (card) => `

---
From the Yui board, card ${card}. The board is the source of truth: https://www.yuigui.com/board
Taking it? Say so in a comment, then open a pull request that names ${card}. Agents welcome: https://www.yuigui.com/developers/contribute

${marker(card)}`;

function parse(file) {
  const text = readFileSync(join(dir, file), "utf8");
  const m = text.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!m) throw new Error(`${file}: no frontmatter`);
  const meta = Object.fromEntries(m[1].split("\n").map((l) => {
    const i = l.indexOf(":");
    return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^"(.*)"$/, "$1")];
  }));
  for (const k of ["card", "repo", "title", "labels"]) if (!meta[k]) throw new Error(`${file}: missing ${k}`);
  if (`${meta.card}.md` !== file) throw new Error(`${file}: card ${meta.card} does not match the file name`);
  const labels = meta.labels.split(",").map((s) => s.trim()).filter(Boolean);
  for (const l of labels) if (!LABELS[l]) throw new Error(`${file}: unknown label "${l}"`);
  const body = m[2].trim() + footer(meta.card);
  const leak = findLeak(`${meta.title}\n${body.replace(/https:\/\/[^\s)]+/g, "")}`);
  if (leak) throw new Error(`${file}: ${leak[0]} "${leak[1]}" must not go public`);
  return { ...meta, labels, body };
}

const gh = (...a) => execFileSync("gh", a, { encoding: "utf8", stdio: ["pipe", "pipe", "inherit"] });

let drafts;
try {
  drafts = readdirSync(dir).filter((f) => f.endsWith(".md") && f !== "README.md").sort().map(parse);
} catch (e) {
  console.error(`issues: ${e.message}`);
  process.exit(2);
}
if (only.length) drafts = drafts.filter((d) => only.includes(d.card));
console.log(`${drafts.length} drafts ok${apply ? "" : " (dry run, add --apply to write to GitHub)"}`);

const repos = [...new Set(drafts.map((d) => d.repo))];
const existing = {};
for (const repo of repos) {
  const list = JSON.parse(gh("issue", "list", "-R", repo, "--state", "all", "--limit", "1000", "--json", "number,state,body,title,url"));
  existing[repo] = new Map();
  for (const i of list) {
    const k = (i.body || "").match(/<!-- yui-card: ([A-Z]+-\d+) -->/);
    if (k) existing[repo].set(k[1], i);
  }
  if (apply) {
    for (const [name, [color, description]] of Object.entries(LABELS)) {
      gh("label", "create", name, "-R", repo, "--color", color, "--description", description, "--force");
    }
  }
}

for (const d of drafts) {
  const had = existing[d.repo].get(d.card);
  if (had && had.state !== "OPEN") { console.log(`${d.card}: ${had.url} is closed, left alone`); continue; }
  if (had && had.title === d.title && had.body.trim() === d.body.trim()) { console.log(`${d.card}: ${had.url} up to date`); continue; }
  if (!apply) { console.log(`${d.card}: would ${had ? `update ${had.url}` : `open in ${d.repo}`}: ${d.title}`); continue; }
  const labelArgs = d.labels.flatMap((l) => [had ? "--add-label" : "--label", l]);
  if (had) {
    gh("issue", "edit", String(had.number), "-R", d.repo, "--title", d.title, "--body", d.body, ...labelArgs);
    console.log(`${d.card}: updated ${had.url}`);
  } else {
    const url = gh("issue", "create", "-R", d.repo, "--title", d.title, "--body", d.body, ...labelArgs).trim();
    console.log(`${d.card}: opened ${url}`);
  }
}
