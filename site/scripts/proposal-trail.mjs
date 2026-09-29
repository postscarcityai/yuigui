// Proposal trail (SITE-106): fills card, branch, pr and taken_by in docs/proposals/*.md from the board and
// GitHub, and moves the status forward (Accepted -> Building -> Shipped), never back.
// A card titled with "PROP-<n>" or a pull request titled "[PROP-n]" (or "[KEY]" of the proposal's card)
// links itself. A line already in the file is never overwritten: hand-edited fields win.
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { findLeak } from "../lib/public-guard.mjs";
import { STATUSES } from "../lib/proposals.mjs";

const DIRS = ["../../docs/proposals/", "../content/proposals/"].map((d) => new URL(d, import.meta.url));
const rank = (s) => STATUSES.indexOf(s);

// Set a header line if it is not there yet; returns the new text.
function setLine(src, key, value) {
  const head = src.match(/^---\n([\s\S]*?)\n---\n/);
  if (!head || new RegExp(`^${key}:`, "m").test(head[1]) || !value) return src;
  return src.replace(/^(---\n[\s\S]*?)\n---\n/, `$1\n${key}: ${value}\n---\n`);
}

// prs: [{ title, url, branchUrl, author, merged, state }]; cards: [{ key, title, landed, running, assignee }].
export function trail({ cards, prs }) {
  const found = new Map(); // "PROP-8" -> { card, pr, branchUrl, taken, status }
  const at = (id) => { if (!found.has(id)) found.set(id, {}); return found.get(id); };
  for (const c of cards) {
    const id = c.title.match(/\bPROP-\d+\b/)?.[0];
    if (!id) continue;
    const t = at(id);
    if (!t.card || (c.landed && !t.landed)) Object.assign(t, { card: c.key, landed: c.landed, running: c.running });
    if (c.assignee === "yui") t.taken ||= "Yui worker";
  }
  for (const pr of prs) {
    const id = pr.title.match(/^\s*\[(PROP-\d+)\]/)?.[1] || cards.find((c) => pr.title.startsWith(`[${c.key}]`) && /\bPROP-\d+\b/.test(c.title))?.title.match(/\bPROP-\d+\b/)[0];
    if (!id) continue;
    const t = at(id);
    if (t.pr) continue;
    Object.assign(t, { pr: pr.url, branchUrl: pr.branchUrl, taken: pr.author && !/\[bot\]$/.test(pr.author) ? pr.author : t.taken });
    if (pr.merged) t.landed = true; else if (pr.state === "OPEN") t.running = true;
  }
  return found;
}

export function readPrs(repos) {
  const out = [];
  for (const url of repos) {
    const repo = url.replace("https://github.com/", "");
    const rows = JSON.parse(execFileSync("gh", ["pr", "list", "--repo", repo, "--state", "all", "--limit", "200", "--json", "title,url,headRefName,author,state,mergedAt"],
      { encoding: "utf8", timeout: 20000, stdio: ["ignore", "pipe", "pipe"] }));
    for (const r of rows) out.push({ title: r.title, url: r.url, branchUrl: `${url}/tree/${r.headRefName}`, author: r.author?.login || "", merged: !!r.mergedAt, state: r.state });
  }
  return out;
}

// Writes the files; returns the ids it changed.
export function applyTrail(found) {
  const changed = [];
  for (const dir of DIRS) {
    if (!existsSync(dir)) continue;
    for (const f of readdirSync(dir).filter((f) => f.endsWith(".md"))) {
      const file = new URL(f, dir);
      let src = readFileSync(file, "utf8");
      const id = src.match(/^id: (PROP-\d+)/m)?.[1];
      const t = found.get(id);
      if (!t) continue;
      const before = src;
      const status = src.match(/^status: (.*)$/m)?.[1];
      // Only a proposal Chris already accepted moves; an Exploring or Open one is never promoted by a card.
      const next = t.landed ? "Shipped" : t.running || t.pr ? "Building" : null;
      if (next && rank(status) >= rank("Accepted") && rank(next) > rank(status)) src = src.replace(/^status: .*$/m, `status: ${next}`);
      if (rank(status) >= rank("Accepted")) {
        for (const [k, v] of [["taken_by", t.taken], ["card", t.card], ["branch", t.branchUrl], ["pr", t.pr]]) {
          if (v && !findLeak(v)) src = setLine(src, k, v);
        }
      }
      if (src !== before) { writeFileSync(file, src); changed.push(id); }
    }
  }
  return [...new Set(changed)];
}
