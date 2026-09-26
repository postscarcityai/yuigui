// Exports the public Yui board from the local kanban DB (read-only) into content/board.json,
// rewrites the statuses in content/mvp.json, and writes the agent-ready backlog to content/backlog.json.
// Run: node scripts/export-board.mjs [--check | --stdout]
// --check exits 0 when nothing changed, 3 when board.json, mvp.json or backlog.json would change.
// --stdout prints the board as it is right now and writes nothing (the war room's release panel, YUI-105).
// The DB never leaves this machine: only titles, a one-line summary, dates and progress links are published.
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { slug } from "../lib/slug.mjs";
import { PRIVATE_RE, LEAKS, findLeak } from "../lib/public-guard.mjs";

const DB = process.env.KANBAN_DB || `${homedir()}/.hermes/kanban.db`;
const CHECK = process.argv.includes("--check");
const STDOUT = process.argv.includes("--stdout");
const content = (f) => new URL(`../content/${f}`, import.meta.url);
const SHIPPED_DAYS = 30;

// Yui lanes. BIZ- and FLOW- cards are only included when the card itself is about Yui.
// SOC- (social and video, GTM-1) publishes titles only: its bodies hold drafts not yet cleared to post.
const PREFIXES = ["YUI", "SITE", "OSS", "INT", "MVP", "BIZ", "FLOW", "SOC"];
const NEEDS_YUI_TAG = new Set(["BIZ", "FLOW"]);
const TITLE_ONLY = new Set(["BIZ", "SOC"]);
const ORDER = Object.fromEntries(PREFIXES.map((p, i) => [p, i]));

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
  const [, prefix, num, tag = "", full] = m;
  // A trailing [label, label] ("[agent-ready, build to earn]") is a marker, not part of the title.
  const lm = full.match(/\s*\[([^\]]*)\]\s*$/);
  const labels = lm ? lm[1].split(",").map((l) => l.trim().toLowerCase()).filter(Boolean) : [];
  const rest = lm ? full.slice(0, lm.index) : full;
  const i = rest.indexOf(": ");
  return {
    prefix, num: Number(num), key: `${prefix}-${num}`, tag: tag.toLowerCase(), labels, rest,
    head: i > 0 ? rest.slice(0, i) : rest, detail: i > 0 ? rest.slice(i + 2) : "",
  };
}

const rows = sql(`
  select t.id, t.title, t.status, t.priority, t.created_at, t.started_at, t.completed_at,
         (select max(e.created_at) from task_events e where e.task_id = t.id and e.kind in ('completed','archived')) as closed_at,
         (select count(*) from task_events e where e.task_id = t.id and e.kind = 'completed') as completions,
         (lower(t.title || ' ' || coalesce(t.body, '')) like '%yui%') as about_yui
  from tasks t
  where ${PREFIXES.map((p) => `t.title glob '${p}-[0-9]*'`).join(" or ")}
`);

// Progress log links: an entry with "card": "YUI-7" (or an array) links that card's board tile.
const progress = JSON.parse(readFileSync(content("progress.json"), "utf8"));
const logged = new Set(progress.flatMap((e) => [].concat(e.card || [])));

// Shipped means finished: done, or archived after a completion. A card archived without ever
// completing (folded into another, superseded) is not shipped and leaves the board.
const landed = (t) => t.status === "done" || (t.status === "archived" && (t.completed_at || t.completions > 0));

// A BIZ- or FLOW- card with an entry in the ship log is Yui work even when its brief never says "yui".
const tasks = [];
for (const r of rows) {
  const p = parseTitle(r.title);
  if (!p || !PREFIXES.includes(p.prefix)) continue;
  if (NEEDS_YUI_TAG.has(p.prefix) && !r.about_yui && !logged.has(p.key)) continue;
  if (r.status === "archived" && !landed(r)) continue;
  tasks.push({ ...r, ...p });
}

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
const mvpStatus = (t) => (landed(t) ? "shipped" : ["running", "blocked", "scheduled"].includes(t.status) ? "building" : "next");
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
  const shippedAt = landed(t) ? t.completed_at || t.closed_at : null;
  const parked = t.tag.includes("backlog") || t.tag.includes("later");
  let col;
  if (shippedAt) { if (now - shippedAt > SHIPPED_DAYS * 86400) continue; col = "shipped"; }
  // A scheduled backlog card is parked (frozen, or waiting its turn), not being built.
  else if (["running", "blocked"].includes(t.status) || (t.status === "scheduled" && !parked)) col = "building";
  else if (parked) col = "backlog";
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
  if (t.labels.includes("agent-ready") && !shippedAt) card.agentReady = true;
  if (shippedAt) card.shipped = day(shippedAt);
  if (link) card.progress = link.href;
  cols[col].push({ card, t, shippedAt });
}

const byKey = (a, b) => ORDER[a.t.prefix] - ORDER[b.t.prefix] || a.t.num - b.t.num;
cols.building.sort((a, b) => (a.t.started_at || a.t.created_at) - (b.t.started_at || b.t.created_at));
cols.next.sort((a, b) => (b.card.mvp ? 1 : 0) - (a.card.mvp ? 1 : 0) || b.t.priority - a.t.priority || byKey(a, b));
cols.backlog.sort(byKey);
cols.shipped.sort((a, b) => b.shippedAt - a.shippedAt || byKey(b, a));

// The release (YUI-90, spec/RELEASE.md): the open YUI-SHIP card, else the newest one that landed,
// with the cards it waits on (its parents). Only the version, dates and the parents' public board
// titles are published; the ship card's own title and body stay on this machine.
const iso = (sec) => (sec ? new Date(sec * 1000).toISOString() : null);
const cardFor = new Map(Object.values(cols).flat().map((x) => [x.t.id, x.card]));
function release() {
  const ships = sql(`
    select t.id, t.title, t.status, t.created_at, t.started_at, t.completed_at,
           (select max(e.created_at) from task_events e where e.task_id = t.id and e.kind in ('completed','archived')) as closed_at,
           (select count(*) from task_events e where e.task_id = t.id and e.kind = 'completed') as completions
    from tasks t where t.title glob 'YUI-SHIP *' order by t.created_at desc
  `).filter((s) => s.status !== "archived" || landed(s));
  const ship = ships.find((s) => !landed(s)) || ships[0];
  if (!ship) return null;
  const parents = sql(`select parent_id as id from task_links where child_id = '${ship.id}'`).map((r) => r.id);
  const shipped = landed(ship);
  const cards = parents.map((id) => tasks.find((t) => t.id === id)).filter(Boolean).map((t) => {
    const card = cardFor.get(t.id);
    const status = landed(t) ? "done" : ["running", "blocked"].includes(t.status) ? "now" : "next";
    const out = { key: t.key, title: card ? card.title : cap(scrub(t.head)), status };
    if (landed(t)) out.shipped = day(t.completed_at || t.closed_at);
    if (card?.progress) out.progress = card.progress;
    return out;
  }).filter((c) => c.title);
  const rank = { done: 0, now: 1, next: 2 };
  cards.sort((a, b) => rank[a.status] - rank[b.status] || (a.shipped || "").localeCompare(b.shipped || ""));
  return {
    version: (ship.title.match(/\b(\d+\.\d+(?:\.\d+)?)\b/) || [])[1] || null,
    status: shipped ? "shipped" : ship.status === "running" ? "shipping" : "open",
    startedAt: iso(ship.started_at || ship.created_at),
    shippedAt: shipped ? iso(ship.completed_at || ship.closed_at) : null,
    cards,
  };
}

// Yui@home (OSS-6): cards marked [agent-ready] are open to outside contributors, people or agents.
// The public brief is the ```agent-ready block in the card body (repo, size, goal, brief, spec,
// done, test); nothing else from the body leaves this machine. A card missing a field, or whose
// block trips the guard, is left out with a warning. Claims are open pull requests titled [KEY].
const links = JSON.parse(readFileSync(content("links.json"), "utf8"));
const SITE = "https://www.yuigui.com";
const REPOS = { yuigui: links.github, yui: links.appRepo };
const CLAIM_DAYS = 7;
const MULTI = new Set(["done", "test"]);

function agentBlock(body) {
  const m = (body || "").match(/```agent-ready\n([\s\S]*?)```/);
  if (!m) return null;
  const out = {};
  for (const line of m[1].split("\n")) {
    const kv = line.match(/^(\w+):\s*(.+?)\s*$/);
    if (!kv) continue;
    if (MULTI.has(kv[1])) (out[kv[1]] ||= []).push(kv[2]); else out[kv[1]] = kv[2];
  }
  return out;
}

// Open pull requests titled "[KEY] ..." in both repos. If GitHub cannot be reached, the last
// export's claims stand, so a network blip never flips the file back and forth.
const oldBacklog = (() => { try { return JSON.parse(readFileSync(content("backlog.json"), "utf8")); } catch { return {}; } })();
function openClaims() {
  if (process.env.YUI_NO_GH || STDOUT) return null; // the war room reads --stdout often; claims come from the last export
  const claims = new Map();
  try {
    for (const url of Object.values(REPOS)) {
      const repo = url.replace("https://github.com/", "");
      const out = execFileSync("gh", ["pr", "list", "--repo", repo, "--state", "open", "--limit", "200", "--json", "title,url,updatedAt,createdAt"],
        { encoding: "utf8", timeout: 20000, stdio: ["ignore", "pipe", "pipe"] });
      for (const pr of JSON.parse(out)) {
        const key = (pr.title.match(/^\s*\[([A-Z]+-\d+)\]/) || [])[1];
        if (!key) continue;
        const prev = claims.get(key);
        if (!prev || pr.createdAt < prev.createdAt) claims.set(key, pr);
      }
    }
  } catch (e) {
    console.error(`agent-ready: could not read pull requests (${String(e.message).split("\n")[0]}), keeping the last claims`);
    return null;
  }
  return claims;
}

function agentReady() {
  const picks = tasks.filter((t) => t.labels.includes("agent-ready") && !landed(t) && t.status !== "archived");
  if (!picks.length) return [];
  const bodies = new Map(sql(`select id, body from tasks where id in (${picks.map((t) => `'${t.id}'`).join(",")})`).map((r) => [r.id, r.body]));
  const claims = openClaims();
  const lastClaim = new Map((oldBacklog.cards || []).filter((c) => c.claim).map((c) => [c.key, c.claim]));
  const cards = [];
  for (const t of picks.sort((a, b) => ORDER[a.prefix] - ORDER[b.prefix] || a.num - b.num)) {
    const b = agentBlock(bodies.get(t.id));
    const missing = !b ? ["the agent-ready block"] : ["repo", "size", "goal", "done", "test"].filter((k) => !b[k]);
    if (b && b.repo && !REPOS[b.repo]) missing.push(`a known repo (not "${b.repo}")`);
    if (missing.length) { console.error(`agent-ready: skipped ${t.key}, missing ${missing.join(", ")}`); continue; }
    const title = cap(scrub(t.rest));
    const leak = findLeak(JSON.stringify([title, b]));
    if (leak || !title) { console.error(`agent-ready: skipped ${t.key}, ${leak ? `${leak[0]} "${leak[1]}"` : "title is private"}`); continue; }
    const card = { key: t.key, title, repo: REPOS[b.repo], size: b.size.toUpperCase(), goal: b.goal };
    // brief: a path in the card's repo, or "<repo>:<path>" for a brief that lives in the other one.
    if (b.brief) {
      const [, r = b.repo, path] = b.brief.match(/^(?:(\w+):)?\/*(.+)$/);
      card.brief = `${REPOS[r] || REPOS[b.repo]}/blob/main/${path}`;
    }
    if (b.spec) card.spec = b.spec.startsWith("/") ? SITE + b.spec : b.spec;
    card.done = b.done;
    card.test = b.test;
    card.status = "open";
    const pr = claims ? claims.get(t.key) : null;
    const claim = claims ? pr && { pr: pr.url, since: pr.createdAt.slice(0, 10), active: pr.updatedAt.slice(0, 10) } : lastClaim.get(t.key);
    // A claim goes stale after a week with no push: the card is open again, first merged pull request wins.
    if (claim && (Date.now() - Date.parse(claim.active)) / 86400000 <= CLAIM_DAYS) { card.status = "claimed"; card.claim = claim; }
    cards.push(card);
  }
  return cards;
}

const backlog = {
  updated: new Date().toISOString(),
  about: "Yui@home: cards any AI agent (or person) can take. Pick one open card, build it in a fork, open one pull request titled [KEY]. A person reviews every pull request; the first one merged wins.",
  howto: `${SITE}/contribute`,
  rules: `${links.github}/blob/main/CONTRIBUTING-AGENTS.md`,
  specs: `${links.github}/blob/main/docs/specs/TEMPLATE.md`,
  claim: `A claim is an open pull request titled [KEY] (a draft is fine). It goes stale after ${CLAIM_DAYS} days with no push and the card opens again. Never take a claimed card.`,
  cards: agentReady(),
};

const board = {
  updated: new Date().toISOString(),
  shippedDays: SHIPPED_DAYS,
  release: release(),
  columns: [
    ["backlog", "Backlog"], ["next", "Up next"], ["building", "Building"], ["shipped", `Shipped (last ${SHIPPED_DAYS} days)`],
  ].map(([key, title]) => ({ key, title, cards: cols[key].map((x) => x.card) })),
};

// Last line of defense: refuse to write anything that looks private.
for (const [file, obj] of [["board.json", board], ["mvp.json", { cards: mvpCards }], ["backlog.json", backlog]]) {
  const text = JSON.stringify(obj);
  for (const [re, what] of LEAKS) {
    const hit = text.match(re);
    if (hit) { console.error(`refusing to write ${file}: ${what} "${hit[0]}"`); process.exit(2); }
  }
}

if (STDOUT) { process.stdout.write(JSON.stringify(board) + "\n"); process.exit(0); }

const strip = (o) => JSON.stringify({ ...o, updated: undefined });
const oldBoard = (() => { try { return JSON.parse(readFileSync(content("board.json"), "utf8")); } catch { return {}; } })();
const boardChanged = strip(oldBoard) !== strip(board);
const mvpChanged = JSON.stringify(mvp.cards) !== JSON.stringify(mvpCards);
const backlogChanged = strip(oldBacklog) !== strip(backlog);

const counts = board.columns.map((c) => `${c.key} ${c.cards.length}`).join(", ");
const shipped = mvpCards.filter((c) => c.status === "shipped").length;
const ready = `agent-ready ${backlog.cards.length}`;
if (CHECK) {
  const changed = boardChanged || mvpChanged || backlogChanged;
  console.log(`${changed ? "changed" : "unchanged"}: ${counts}; mvp ${shipped}/${mvpCards.length}; ${ready}`);
  process.exit(changed ? 3 : 0);
}
if (backlogChanged) writeFileSync(content("backlog.json"), JSON.stringify(backlog, null, 2) + "\n");
if (boardChanged) writeFileSync(content("board.json"), JSON.stringify(board, null, 2) + "\n");
if (mvpChanged) {
  const today = new Date().toLocaleDateString("en-CA", { timeZone: "America/New_York" });
  const src = "Statuses written by scripts/export-board.mjs from the live board. The MVP list lives in ROADMAP.md; add or remove keys here by hand.";
  writeFileSync(content("mvp.json"), JSON.stringify({ updated: today, source: src, cards: mvpCards }, null, 2) + "\n");
}
console.log(`${boardChanged ? "wrote board.json" : "board.json unchanged"}, ${mvpChanged ? "wrote mvp.json" : "mvp.json unchanged"}, ${backlogChanged ? "wrote backlog.json" : "backlog.json unchanged"}: ${counts}; mvp ${shipped}/${mvpCards.length}; ${ready}`);
