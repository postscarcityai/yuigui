// Exports the public Yui board from the local kanban DB (read-only) into content/board.json,
// and rewrites the statuses in content/mvp.json. Run: node scripts/export-board.mjs [--check]
// --check exits 0 when nothing changed, 3 when board.json or mvp.json would change.
// The DB never leaves this machine: only titles, a one-line summary, dates and progress links are published.
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { slug } from "../lib/slug.mjs";

const DB = process.env.KANBAN_DB || `${homedir()}/.hermes/kanban.db`;
const CHECK = process.argv.includes("--check");
const content = (f) => new URL(`../content/${f}`, import.meta.url);
const SHIPPED_DAYS = 30;

// Yui lanes. BIZ- and FLOW- cards are only included when the card itself is about Yui.
const PREFIXES = ["YUI", "SITE", "OSS", "INT", "MVP", "BIZ", "FLOW"];
const NEEDS_YUI_TAG = new Set(["BIZ", "FLOW"]);
const TITLE_ONLY = new Set(["BIZ"]);
const ORDER = Object.fromEntries(PREFIXES.map((p, i) => [p, i]));

// Words that must never reach the public board: clients, other projects, other agents, people.
const PRIVATE = [
  "AMC", "Aaron", "Cohen", "Justice Watch", "Docket", "Heathos", "Hubble", "Plannix", "Moon", "imo", "Apollo",
  "Sean Rush", "Luna", "Air Nomadics", "markzaid", "Zaid", "Healing Alliance", "Lending Genie", "WaterDamageIQ",
  "Finesse", "SigEp", "Arnold", "R0SS", "Ross", "Urza", "Monk", "Hank", "Gimp", "Akasha", "Wendy",
  "Mick", "Selene", "Firecrawl",
];
const PRIVATE_RE = new RegExp(`\\b(${PRIVATE.map((w) => w.replace(/ /g, "\\s+")).join("|")})\\b`, "i");
// Shapes that must never appear anywhere in the output.
const LEAKS = [
  [/\bt_[0-9a-f]{6,}\b/i, "task id"],
  [/(\/Users\/|~\/|\.hermes|\.openclaw|\/dev\/)/i, "path"],
  [/\$\s?\d|\b\d+\s?(usd|dollars)\b/i, "cost"],
  [/[\w.+-]+@[\w-]+\.[\w.]+/, "email"],
  [/\(\d{3}\)\s?\d{3}-\d{4}|\b\d{3}-\d{3}-\d{4}\b/, "phone"],
  [PRIVATE_RE, "private name"],
];

function sql(q) {
  // query_only instead of -readonly: a read-only open of a WAL database fails here ("unable to open database file").
  const out = execFileSync("sqlite3", ["-json", "-cmd", ".timeout 5000", "-cmd", "PRAGMA query_only=1", DB, q], { encoding: "utf8" });
  return out.trim() ? JSON.parse(out) : [];
}

const day = (sec) => new Date(sec * 1000).toLocaleDateString("en-CA", { timeZone: "America/New_York" });
// Capitalize, except domains and handles ("yuigui.com rebrand", "yuiguiai social handles").
const cap = (s) => (!s || /^(\S*\.\S+|yuiguiai)\b/i.test(s) ? s : s[0].toUpperCase() + s.slice(1));
const words = (s) => new Set((s.toLowerCase().match(/[a-z0-9]{3,}/g) || []));
const overlap = (a, b) => { const B = words(b); let n = 0; for (const w of words(a)) if (B.has(w)) n++; return n; };

// Removes private words from a title: whole parentheticals first, then comma / plus / semicolon clauses.
function scrub(s) {
  s = s.replace(/\s*\([^()]*(\([^()]*\)[^()]*)*\)/g, (m) => (PRIVATE_RE.test(m) ? "" : m));
  const parts = s.split(/(\s*[,;+]\s+|\s+\+\s+)/);
  let out = "";
  for (let i = 0; i < parts.length; i += 2) {
    if (PRIVATE_RE.test(parts[i])) continue;
    out += (out && i > 0 ? parts[i - 1] : "") + parts[i];
  }
  return out.trim().replace(/[,;+:]\s*$/, "").trim();
}

function parseTitle(raw) {
  const m = raw.match(/^([A-Z]+)-(\d+)\s*(?:\(([^)]*)\))?\s*:?\s*(.*)$/s);
  if (!m) return null;
  const [, prefix, num, tag = "", rest] = m;
  const i = rest.indexOf(": ");
  return {
    prefix, num: Number(num), key: `${prefix}-${num}`, tag: tag.toLowerCase(),
    head: i > 0 ? rest.slice(0, i) : rest, detail: i > 0 ? rest.slice(i + 2) : "",
  };
}

const rows = sql(`
  select t.id, t.title, t.status, t.priority, t.created_at, t.started_at, t.completed_at,
         (select max(e.created_at) from task_events e where e.task_id = t.id and e.kind in ('completed','archived')) as closed_at,
         (lower(t.title || ' ' || coalesce(t.body, '')) like '%yui%') as about_yui
  from tasks t
  where ${PREFIXES.map((p) => `t.title glob '${p}-[0-9]*'`).join(" or ")}
`);

const tasks = [];
for (const r of rows) {
  const p = parseTitle(r.title);
  if (!p || !PREFIXES.includes(p.prefix)) continue;
  if (NEEDS_YUI_TAG.has(p.prefix) && !r.about_yui) continue;
  tasks.push({ ...r, ...p });
}

// Progress log links: an entry with "card": "YUI-7" (or an array) links that card's board tile.
const progress = JSON.parse(readFileSync(content("progress.json"), "utf8"));
const linkFor = new Map();
for (const e of progress) {
  for (const key of [].concat(e.card || [])) {
    const cands = tasks.filter((t) => t.key === key && !linkFor.has(t.id));
    if (!cands.length) continue;
    const best = cands.reduce((a, b) => (overlap(`${e.title} ${e.body}`, b.title) > overlap(`${e.title} ${e.body}`, a.title) ? b : a));
    linkFor.set(best.id, { href: `/progress#${slug(e.title)}`, title: e.title });
  }
}

// MVP set: the keys in mvp.json (from ROADMAP.md "In the MVP"). Duplicate keys pair by title words.
const mvp = JSON.parse(readFileSync(content("mvp.json"), "utf8"));
const mvpTitle = new Map();
const used = new Set();
const mvpStatus = (t) => (["done", "archived"].includes(t.status) ? "shipped" : ["running", "blocked", "scheduled"].includes(t.status) ? "building" : "next");
const mvpCards = mvp.cards.map((c) => {
  const cands = tasks.filter((t) => t.key === c.key && !used.has(t.id));
  if (!cands.length) return c;
  const t = cands.reduce((a, b) => (overlap(c.title, b.title) > overlap(c.title, a.title) ? b : a));
  used.add(t.id);
  mvpTitle.set(t.id, c.title);
  return { ...c, status: mvpStatus(t) };
});

const now = Math.floor(Date.now() / 1000);
const cols = { building: [], next: [], backlog: [], shipped: [] };
for (const t of tasks) {
  const shippedAt = ["done", "archived"].includes(t.status) ? t.completed_at || t.closed_at : null;
  let col;
  if (shippedAt) { if (now - shippedAt > SHIPPED_DAYS * 86400) continue; col = "shipped"; }
  else if (["running", "blocked", "scheduled"].includes(t.status)) col = "building";
  else if (t.tag.includes("backlog") || t.tag.includes("later")) col = "backlog";
  else col = "next";

  const head = scrub(t.head);
  if (!head) { console.error(`skipped ${t.key}: title is private`); continue; }
  const link = linkFor.get(t.id);
  const card = { key: t.key, title: cap(mvpTitle.get(t.id) || head) };
  if (!TITLE_ONLY.has(t.prefix)) {
    const summary = link ? link.title : scrub(t.detail) || (mvpTitle.has(t.id) ? head : "");
    if (summary && summary.toLowerCase() !== card.title.toLowerCase()) card.summary = cap(summary);
  }
  if (mvpTitle.has(t.id)) card.mvp = true;
  if (t.status === "scheduled") card.waiting = true;
  if (shippedAt) card.shipped = day(shippedAt);
  if (link) card.progress = link.href;
  cols[col].push({ card, t, shippedAt });
}

const byKey = (a, b) => ORDER[a.t.prefix] - ORDER[b.t.prefix] || a.t.num - b.t.num;
cols.building.sort((a, b) => (a.t.started_at || a.t.created_at) - (b.t.started_at || b.t.created_at));
cols.next.sort((a, b) => (b.card.mvp ? 1 : 0) - (a.card.mvp ? 1 : 0) || b.t.priority - a.t.priority || byKey(a, b));
cols.backlog.sort(byKey);
cols.shipped.sort((a, b) => b.shippedAt - a.shippedAt || byKey(b, a));

const board = {
  updated: new Date().toISOString(),
  shippedDays: SHIPPED_DAYS,
  columns: [
    ["backlog", "Backlog"], ["next", "Up next"], ["building", "Building"], ["shipped", `Shipped (last ${SHIPPED_DAYS} days)`],
  ].map(([key, title]) => ({ key, title, cards: cols[key].map((x) => x.card) })),
};

// Last line of defense: refuse to write anything that looks private.
for (const [file, obj] of [["board.json", board], ["mvp.json", { cards: mvpCards }]]) {
  const text = JSON.stringify(obj);
  for (const [re, what] of LEAKS) {
    const hit = text.match(re);
    if (hit) { console.error(`refusing to write ${file}: ${what} "${hit[0]}"`); process.exit(2); }
  }
}

const strip = (o) => JSON.stringify({ ...o, updated: undefined });
const oldBoard = (() => { try { return JSON.parse(readFileSync(content("board.json"), "utf8")); } catch { return {}; } })();
const boardChanged = strip(oldBoard) !== strip(board);
const mvpChanged = JSON.stringify(mvp.cards) !== JSON.stringify(mvpCards);

const counts = board.columns.map((c) => `${c.key} ${c.cards.length}`).join(", ");
const shipped = mvpCards.filter((c) => c.status === "shipped").length;
if (CHECK) {
  console.log(`${boardChanged || mvpChanged ? "changed" : "unchanged"}: ${counts}; mvp ${shipped}/${mvpCards.length}`);
  process.exit(boardChanged || mvpChanged ? 3 : 0);
}
if (boardChanged) writeFileSync(content("board.json"), JSON.stringify(board, null, 2) + "\n");
if (mvpChanged) {
  const today = new Date().toLocaleDateString("en-CA", { timeZone: "America/New_York" });
  const src = "Statuses written by scripts/export-board.mjs from the live board. The MVP list lives in ROADMAP.md; add or remove keys here by hand.";
  writeFileSync(content("mvp.json"), JSON.stringify({ updated: today, source: src, cards: mvpCards }, null, 2) + "\n");
}
console.log(`${boardChanged ? "wrote board.json" : "board.json unchanged"}, ${mvpChanged ? "wrote mvp.json" : "mvp.json unchanged"}: ${counts}; mvp ${shipped}/${mvpCards.length}`);
