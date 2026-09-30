// Exports the public Yui board from the local kanban DB (read-only) into content/board.json,
// rewrites the statuses in content/mvp.json, and writes the agent-ready backlog to content/backlog.json.
// Run: node scripts/export-board.mjs [--check | --stdout]
// --check exits 0 when nothing changed, 3 when board.json, mvp.json or backlog.json would change.
// --stdout prints the board as it is right now and writes nothing (the war room's release panel, YUI-105).
// The DB never leaves this machine: only titles, a one-line summary, dates, links and owners are published.
// Building means a worker has it (running) or it stopped mid-work (blocked); a card waiting its turn is Up next.
// Every Building tile names its owner as a GitHub login (SITE-110): our own agents work as Chris (OWNER), an outside
// contributor is the author of the open [KEY] pull request. A landed card whose tile has no progress entry is not
// shown as shipped: it goes back to Up next as "Needs its demo" and is listed in UNLINKED for the lane driver.
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { slug } from "../lib/slug.mjs";
import { PRIVATE_RE, LEAKS, findLeak } from "../lib/public-guard.mjs";
import { applyTrail, readPrs, trail } from "./proposal-trail.mjs";

const DB = process.env.KANBAN_DB || `${homedir()}/.hermes/kanban.db`;
const CHECK = process.argv.includes("--check");
const STDOUT = process.argv.includes("--stdout");
const content = (f) => new URL(`../content/${f}`, import.meta.url);
const SHIPPED_DAYS = 30;
const OWNER = "CJohnDesign";
const UNLINKED = process.env.YUI_UNLINKED || `${homedir()}/.yui-board-unlinked.json`;
const APP_REPO_DIR = process.env.YUI_APP_REPO || `${homedir()}/dev/yui`;

// Yui lanes. BIZ- and FLOW- cards are only included when the card itself is about Yui.
// SOC- (social and video, GTM-1) publishes titles only: its bodies hold drafts not yet cleared to post.
const PREFIXES = ["YUI", "SITE", "OSS", "INT", "MVP", "BIZ", "FLOW", "SOC", "NOTE"];
const NEEDS_YUI_TAG = new Set(["BIZ", "FLOW"]);
const TITLE_ONLY = new Set(["BIZ", "SOC", "NOTE"]);
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

// "YUI-7 (backlog): title", and for a card split into steps "YUI-7 step 2 (app) (backlog): title",
// "YUI-7 step 2a: title", "YUI-7 step 2 proof: title" or "YUI-7 ship: title". A step keeps its card's key;
// `step` tells the tiles apart. A lettered key ("YUI-183b") is its own key, as the ship log writes it.
function parseTitle(raw) {
  const m = raw.match(/^([A-Z]+)-(\d+)([a-z])?\b\s*(?:step\s+(\d+[a-z]?)\b(?:\s+(?!\()([a-z][\w-]*))?|(ship)\b)?\s*((?:\([^)]*\)\s*)*):?\s*(.*)$/is);
  if (!m) return null;
  const [, prefix, num, letter = "", stepNum, stepWord, ship, parens, full] = m;
  const tag = [...parens.matchAll(/\(([^)]*)\)/g)].map((x) => x[1]).join(", ");
  const step = stepNum ? `Step ${stepNum}${stepWord ? ` ${stepWord}` : ""}` : ship ? "Ship" : "";
  // A trailing [label, label] ("[agent-ready, build to earn]") is a marker, not part of the title.
  const lm = full.match(/\s*\[([^\]]*)\]\s*$/);
  const labels = lm ? lm[1].split(",").map((l) => l.trim().toLowerCase()).filter(Boolean) : [];
  const rest = lm ? full.slice(0, lm.index) : full;
  const i = rest.indexOf(": ");
  return {
    prefix, num: Number(num), key: `${prefix}-${num}${letter}`, tag: tag.toLowerCase(), labels, rest, step,
    stepNum: stepNum ? stepNum.toLowerCase() : ship ? "ship" : null,
    head: i > 0 ? rest.slice(0, i) : rest, detail: i > 0 ? rest.slice(i + 2) : "",
  };
}

const rows = sql(`
  select t.id, t.title, t.status, t.assignee, t.priority, t.created_at, t.started_at, t.completed_at,
         (select max(e.created_at) from task_events e where e.task_id = t.id and e.kind in ('completed','archived')) as closed_at,
         (select count(*) from task_events e where e.task_id = t.id and e.kind = 'completed') as completions,
         (select e.payload from task_events e where e.task_id = t.id and e.kind = 'blocked' order by e.id desc limit 1) as block_why,
         (lower(t.title || ' ' || coalesce(t.body, '')) like '%yui%') as about_yui
  from tasks t
  where ${PREFIXES.map((p) => `t.title glob '${p}-[0-9]*'`).join(" or ")}
`);

// Progress log links: an entry with "card": "YUI-7" (or an array) links that card's board tile.
const progress = JSON.parse(readFileSync(content("progress.json"), "utf8"));
const logged = new Set(progress.flatMap((e) => [].concat(e.card || [])));

// Shipped means finished: done, or archived after a completion. A card archived without ever
// completing (folded into another, superseded) is not shipped and leaves the board.
// An archived card whose key is in the ship log landed too (archived straight from a release, no complete step).
const landed = (t) => t.status === "done" || (t.status === "archived" && (t.completed_at || t.completions > 0 || t.logged));

// A BIZ- or FLOW- card with an entry in the ship log is Yui work even when its brief never says "yui".
const tasks = [];
for (const r of rows) {
  const p = parseTitle(r.title);
  if (!p || !PREFIXES.includes(p.prefix)) continue;
  if (NEEDS_YUI_TAG.has(p.prefix) && !r.about_yui && !logged.has(p.key)) continue;
  r.logged = logged.has(p.key);
  if (r.status === "archived" && !landed(r)) continue;
  tasks.push({ ...r, ...p });
}

// TestFlight notes (Chris, Sep 27: "keep the site up to date on what is happening now on the board").
// A "Yui beta feedback" card has no key, so without this the work being built from a note never showed.
// It shows as NOTE-<n> under its PLAIN name only; Chris's raw comment and the body stay on this machine.
// A note another card covers ("Covered by ...") stays off unless it is the one being built.
const notes = sql(`
  select t.id, t.status, t.assignee, t.priority, t.created_at, t.started_at, t.completed_at,
         (select max(e.created_at) from task_events e where e.task_id = t.id and e.kind in ('completed','archived')) as closed_at,
         (select count(*) from task_events e where e.task_id = t.id and e.kind = 'completed') as completions,
         (select e.payload from task_events e where e.task_id = t.id and e.kind = 'blocked' order by e.id desc limit 1) as block_why,
         substr(t.body, instr(t.body, 'TestFlight feedback ') + 20, 8) as feedback,
         (select group_concat(c.body, ' ') from task_comments c where c.task_id = t.id
           and (c.body like 'fixed by%' or c.body like 'folded into%' or c.body like 'routed %' or c.body like 'covered by%')) as refs,
         (select c.body from task_comments c where c.task_id = t.id and c.body like 'PLAIN:%' order by c.id desc limit 1) as plain,
         (select count(*) from task_comments c where c.task_id = t.id and c.body like 'Covered by%') as covered
  from tasks t where t.title like 'Yui beta feedback%'
`);
for (const r of notes) {
  const name = (r.plain || "").replace(/^PLAIN:\s*/, "").trim();
  if (!name || (r.status === "archived" && !landed(r))) continue;
  // A note a worker already started and is retrying (ready again after a run) is still being built.
  if (r.status === "ready" && r.started_at) r.status = "running";
  if (r.covered && !["running", "blocked"].includes(r.status)) continue;
  const num = parseInt(r.id.slice(-4), 16);
  tasks.push({ ...r, prefix: "NOTE", num, key: `NOTE-${num}`, tag: "", labels: [], rest: name, step: "", stepNum: null,
    head: name, detail: "From a TestFlight note", feedback: /^[\w-]{8}$/.test(r.feedback || "") ? r.feedback : null,
    refs: [...new Set((r.refs || "").match(/\bt_[0-9a-f]{8}\b/g) || [])] });
}

// A card split into steps has one tile per step. Each entry goes to the tile it fits best: shared
// words, scaled so a long title does not win on length alone, one more when the tile shipped the
// day the entry was written, plus a lot for an entry that names only that step ("step 3") and a
// little for one that names it among others. Best fits are placed first, so a later entry cannot
// take a tile from the entry that fits it better.
const linkFor = new Map();
const stepsNamed = (text) => new Set([...text.matchAll(/\bstep (\d+[a-z]?)\b/gi)].map((m) => m[1].toLowerCase()));
const score = (e, t) => {
  const text = `${e.title} ${e.body}`;
  const named = stepsNamed(text);
  // An entry is written the day its work ships, so a tile that shipped that day fits a little better.
  const sameDay = landed(t) && day(t.completed_at || t.closed_at) === e.date ? 1 : 0;
  const fit = overlap(text, t.rest) / Math.sqrt(words(t.rest).size + 1) + sameDay;
  if (t.stepNum === null || !named.has(t.stepNum)) return fit;
  return fit + (named.size === 1 ? 3 : 1);
};
const pairs = [];
progress.forEach((e, i) => {
  for (const key of [].concat(e.card || [])) {
    const cands = tasks.filter((t) => t.key === key);
    // A card with one tile keeps the old rule: the first entry in the log links it.
    for (const t of cands) pairs.push({ e, i, key, t, s: cands.length > 1 ? score(e, t) : 0 });
  }
});
pairs.sort((a, b) => b.s - a.s || a.i - b.i);
const placed = new Set();
for (const { e, i, key, t } of pairs) {
  if (placed.has(`${i}:${key}`) || linkFor.has(t.id)) continue;
  linkFor.set(t.id, { href: `/progress#${slug(e.title)}`, title: e.title });
  placed.add(`${i}:${key}`);
}
// A step left over (more steps than entries) links the entry of its story that fits it best.
for (const { e, t } of pairs) if (!linkFor.has(t.id)) linkFor.set(t.id, { href: `/progress#${slug(e.title)}`, title: e.title, story: true });

// A note fixed by, folded into or routed to another card shares that card's entry (twice, for a note folded
// into a lead note).
for (let pass = 0; pass < 2; pass++) {
  for (const t of tasks) {
    if (!t.refs || linkFor.has(t.id)) continue;
    const id = t.refs.find((r) => linkFor.has(r));
    if (id) linkFor.set(t.id, linkFor.get(id));
  }
}

// MVP set: the keys in mvp.json (from ROADMAP.md "In the MVP"). Duplicate keys pair by title words.
const mvp = JSON.parse(readFileSync(content("mvp.json"), "utf8"));
const mvpTitle = new Map();
const used = new Set();
const mvpStatus = (t) => (landed(t) ? "shipped" : ["running", "blocked"].includes(t.status) ? "building" : "next");
const mvpCards = mvp.cards.map((c) => {
  const cands = tasks.filter((t) => t.key === c.key && !used.has(t.id));
  if (!cands.length) return c;
  const t = cands.reduce((a, b) => (overlap(c.title, b.title) > overlap(c.title, a.title) ? b : a));
  used.add(t.id);
  mvpTitle.set(t.id, c.title);
  return { ...c, status: mvpStatus(t) };
});

// The code behind a tile: the newest commit on main whose subject ends "(KEY ...)" in either repo, the one that
// names the tile's step when there is one; a TestFlight note links the commit naming its feedback id.
const links = JSON.parse(readFileSync(content("links.json"), "utf8"));
const REPOS = { yuigui: links.github, yui: links.appRepo };
function commits() {
  const byKey = new Map(), byNote = new Map();
  for (const [dir, url] of [[new URL("../..", import.meta.url).pathname, REPOS.yuigui], [APP_REPO_DIR, REPOS.yui]]) {
    let out = "";
    try {
      const ref = execFileSync("git", ["-C", dir, "rev-parse", "--verify", "-q", "origin/main"], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim() ? "origin/main" : "HEAD";
      out = execFileSync("git", ["-C", dir, "log", ref, "--since=45 days ago", "--format=%h %s"], { encoding: "utf8", maxBuffer: 64 << 20, stdio: ["ignore", "pipe", "ignore"] });
    } catch { console.error(`commits: could not read ${dir}`); continue; }
    for (const line of out.split("\n")) {
      const [sha, ...rest] = line.split(" ");
      const tail = (rest.join(" ").match(/\(([^()]*)\)\s*$/) || [])[1];
      if (!sha || !tail) continue;
      const href = `${url}/commit/${sha}`;
      const steps = new Set([...tail.matchAll(/\bstep (\d+[a-z]?)/gi)].map((m) => m[1].toLowerCase()));
      for (const [, key] of tail.matchAll(/\b([A-Z]+-\d+[a-z]?)\b/g)) {
        if (!byKey.has(key)) byKey.set(key, []);
        byKey.get(key).push({ href, steps });
      }
      for (const [, id] of tail.matchAll(/\bfeedback ([\w-]{8})\b/g)) if (!byNote.has(id)) byNote.set(id, href);
    }
  }
  return (t) => {
    if (t.feedback) return byNote.get(t.feedback) || null;
    const list = byKey.get(t.key) || [];
    return (list.find((c) => t.stepNum && c.steps.has(t.stepNum)) || list.find((c) => !c.steps.size) || list[0] || {}).href || null;
  };
}
const commitFor = commits();

// Pull requests titled "[KEY] ..." in both repos: open ones claim a card (Yui@home, OSS-6), merged ones link
// its tile. If GitHub cannot be reached, the last export's claims and links stand.
const oldBacklog = (() => { try { return JSON.parse(readFileSync(content("backlog.json"), "utf8")); } catch { return {}; } })();
const oldBoard = (() => { try { return JSON.parse(readFileSync(content("board.json"), "utf8")); } catch { return {}; } })();
const CLAIM_DAYS = 7;
function pullRequests() {
  if (process.env.YUI_NO_GH || STDOUT) return null; // the war room reads --stdout often; claims come from the last export
  const claims = new Map(), merged = new Map();
  try {
    for (const url of Object.values(REPOS)) {
      const repo = url.replace("https://github.com/", "");
      const out = execFileSync("gh", ["pr", "list", "--repo", repo, "--state", "all", "--limit", "300", "--json", "title,url,state,author,updatedAt,createdAt"],
        { encoding: "utf8", timeout: 20000, stdio: ["ignore", "pipe", "pipe"] });
      for (const pr of JSON.parse(out)) {
        const key = (pr.title.match(/^\s*\[([A-Z]+-\d+[a-z]?)\]/) || [])[1];
        if (!key) continue;
        pr.login = pr.author?.login && !/\[bot\]$|^app\//.test(pr.author.login) ? pr.author.login : null;
        if (pr.state === "MERGED") { if (!merged.has(key)) merged.set(key, pr.url); continue; }
        if (pr.state !== "OPEN") continue;
        const prev = claims.get(key);
        if (!prev || pr.createdAt < prev.createdAt) claims.set(key, pr);
      }
    }
  } catch (e) {
    console.error(`pull requests: could not read them (${String(e.message).split("\n")[0]}), keeping the last claims`);
    return null;
  }
  return { claims, merged };
}
const prs = pullRequests();
const lastClaim = new Map((oldBacklog.cards || []).filter((c) => c.claim).map((c) => [c.key, c.claim]));
const lastPr = new Map(Object.values(oldBoard.columns || []).flatMap((c) => c.cards || []).filter((c) => c.pr).map((c) => [c.key, c.pr]));
// A live claim: { pr, since, active, author } for an open [KEY] pull request pushed to in the last week.
function claimFor(key) {
  const pr = prs ? prs.claims.get(key) : null;
  const claim = prs ? pr && { pr: pr.url, since: pr.createdAt.slice(0, 10), active: pr.updatedAt.slice(0, 10), ...(pr.login ? { author: pr.login } : {}) } : lastClaim.get(key);
  return claim && (Date.now() - Date.parse(claim.active)) / 86400000 <= CLAIM_DAYS ? claim : null;
}
const mergedPr = (key) => (prs ? prs.merged.get(key) : lastPr.get(key)) || null;

const now = Math.floor(Date.now() / 1000);
const unlinked = [];
const cols = { building: [], next: [], backlog: [], shipped: [] };
for (const t of tasks) {
  const shippedAt = landed(t) ? t.completed_at || t.closed_at : null;
  const parked = t.tag.includes("backlog") || t.tag.includes("later");
  const link = linkFor.get(t.id);
  const claim = t.labels.includes("agent-ready") && !shippedAt ? claimFor(t.key) : null;
  let col;
  if (shippedAt) {
    if (now - shippedAt > SHIPPED_DAYS * 86400) continue;
    // Done means linked (Chris, Sep 29): no progress entry, no Shipped tile. The lane driver reopens it.
    col = link ? "shipped" : "next";
  }
  // Building means someone has it: a worker running it, one stopped mid-work, or an open [KEY] pull request.
  // A scheduled card is waiting its turn, so it is Up next, or Backlog when it is parked.
  else if (["running", "blocked"].includes(t.status) || claim) col = "building";
  else if (parked) col = "backlog";
  else col = "next";

  // A title with a private word falls back to its ship log entry's title, which is public by rule.
  const head = scrub(t.head) || (link ? link.title : "");
  if (!head) { console.error(`skipped ${t.key}: title is private`); continue; }
  const card = { key: t.key, title: cap(mvpTitle.get(t.id) || head) };
  if (t.step) card.step = t.step;
  if (!TITLE_ONLY.has(t.prefix)) {
    const summary = link && !link.story ? link.title : scrub(t.detail) || (mvpTitle.has(t.id) ? head : "");
    if (summary && summary.toLowerCase() !== card.title.toLowerCase()) card.summary = cap(summary);
  }
  if (mvpTitle.has(t.id)) card.mvp = true;
  if (t.status === "scheduled") card.waiting = true;
  // A blocked card is not being built: say who it waits on. Only the flag is published, never the reason.
  if (t.status === "blocked") card.blocked = /chris|🔴|\byou(r)?\b|\bpick\b|needs_input|review-required/i.test(t.block_why || "") ? "chris" : "other";
  if (t.labels.includes("agent-ready") && !shippedAt) card.agentReady = true;
  if (shippedAt && link) card.shipped = day(shippedAt);
  if (link) card.progress = link.href;
  // Who has it: a GitHub login, never a profile name.
  if (col === "building") card.owner = claim ? claim.author || null : OWNER;
  if (col === "building" && !card.owner) console.error(`warning: ${t.key} is building with no owner (claim ${claim?.pr || "none"} has no author)`);
  if (shippedAt || claim) {
    const pr = claim ? claim.pr : mergedPr(t.key);
    const commit = shippedAt ? commitFor(t) : null;
    if (pr) card.pr = pr;
    if (commit) card.commit = commit;
  }
  if (shippedAt && !link) {
    card.needsDemo = true;
    unlinked.push({ id: t.id, key: t.key, step: t.step || null, title: card.title, landed: day(shippedAt), commit: card.commit || null });
  }
  cols[col].push({ card, t, shippedAt: link ? shippedAt : null });
}

const byKey = (a, b) => ORDER[a.t.prefix] - ORDER[b.t.prefix] || a.t.num - b.t.num;
cols.building.sort((a, b) => (a.card.blocked ? 1 : 0) - (b.card.blocked ? 1 : 0) || (a.t.started_at || a.t.created_at) - (b.t.started_at || b.t.created_at));
cols.next.sort((a, b) => (a.card.needsDemo ? 1 : 0) - (b.card.needsDemo ? 1 : 0) || (b.card.mvp ? 1 : 0) - (a.card.mvp ? 1 : 0) || b.t.priority - a.t.priority || byKey(a, b));
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
  // No open ship card: the newest landed epic (one with cards) wins over a later patch upload with none.
  const version = (s) => ((s.title.match(/\b(\d+)\.(\d+)(?:\.(\d+))?\b/) || []).slice(1).map((n) => Number(n || 0)));
  const newer = (a, b) => { const x = version(a), y = version(b); for (let i = 0; i < 3; i++) if ((x[i] || 0) !== (y[i] || 0)) return (x[i] || 0) > (y[i] || 0) ? a : b; return a; };
  const hasCards = (s) => sql(`select count(*) as n from task_links where child_id = '${s.id}'`)[0].n > 0;
  const epics = ships.filter((s) => landed(s) && hasCards(s));
  const ship = ships.find((s) => !landed(s)) || (epics.length ? epics.reduce(newer) : ships[0]);
  if (!ship) return null;
  const parents = sql(`select parent_id as id from task_links where child_id = '${ship.id}'`).map((r) => r.id);
  const shipped = landed(ship);
  let stories = parents.map((id) => tasks.find((t) => t.id === id)).filter(Boolean);
  // A decomposed ship card's parents are its gate steps (tests, upload), not stories: use the keys it names.
  if (!stories.length) {
    const text = sql(`select title || ' ' || coalesce(body, '') as x from tasks where id = '${ship.id}'`)[0].x;
    const keys = new Set(text.match(/\b[A-Z]+-\d+[a-z]?\b/g) || []);
    stories = tasks.filter((t) => keys.has(t.key) && !t.step);
  }
  const cards = stories.map((t) => {
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
const SITE = "https://www.yuigui.com";
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

function agentReady() {
  const picks = tasks.filter((t) => t.labels.includes("agent-ready") && !landed(t) && t.status !== "archived");
  if (!picks.length) return [];
  const bodies = new Map(sql(`select id, body from tasks where id in (${picks.map((t) => `'${t.id}'`).join(",")})`).map((r) => [r.id, r.body]));
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
    // A claim goes stale after a week with no push: the card is open again, first merged pull request wins.
    const claim = claimFor(t.key);
    if (claim) { card.status = "claimed"; card.claim = claim; }
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

// A synchronous write: process.stdout on a macOS pipe is async, and exiting cut the board off at 64 KB.
if (STDOUT) { writeFileSync(1, JSON.stringify(board) + "\n"); process.exit(0); }

// Landed cards with no progress entry: a warning each, and the list the lane driver works through (never published).
for (const u of unlinked) console.error(`warning: ${u.key}${u.step ? ` ${u.step}` : ""} landed ${u.landed} with no progress entry, shown as Needs its demo (${u.id})`);
writeFileSync(UNLINKED, JSON.stringify({ updated: new Date().toISOString(), rule: "Done means linked: add a progress.json entry with \"card\": KEY (screenshots, a playground demo or a video), then the tile ships.", cards: unlinked }, null, 2) + "\n");

const strip = (o) => JSON.stringify({ ...o, updated: undefined });
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
// Proposal trail (SITE-106): card, branch, pr and taken_by land in docs/proposals from the board and GitHub.
{
  const assignees = new Map(sql("select id, assignee from tasks").map((r) => [r.id, r.assignee]));
  let prs = [];
  if (!process.env.YUI_NO_GH) { try { prs = readPrs(Object.values(REPOS)); } catch (e) { console.error(`proposal trail: could not read pull requests (${String(e.message).split("\n")[0]})`); } }
  const cards = tasks.map((t) => ({ key: t.key, title: `${t.rest || ""} ${t.title || ""}`, landed: landed(t), running: ["running", "blocked", "scheduled"].includes(t.status), assignee: assignees.get(t.id) }));
  const done = applyTrail(trail({ cards, prs }));
  if (done.length) console.log(`proposal trail: updated ${done.join(", ")}`);
}
console.log(`${boardChanged ? "wrote board.json" : "board.json unchanged"}, ${mvpChanged ? "wrote mvp.json" : "mvp.json unchanged"}, ${backlogChanged ? "wrote backlog.json" : "backlog.json unchanged"}: ${counts}; mvp ${shipped}/${mvpCards.length}; ${ready}`);
