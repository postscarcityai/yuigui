#!/usr/bin/env node
// The private ledger's recorder (OSS-7, spec/LEDGER.md). Records facts, never what anyone said:
// who joined, and what each person used on a day (counts of answered messages, screens and finished jobs;
// the database works that out), and pull requests merged into the two public repos (read from GitHub,
// with the card size from the [KEY] in the title). Safe to run again: a fact already on the ledger is skipped.
//
//   node ledger/record.mjs                      yesterday (UTC)
//   node ledger/record.mjs --from 2026-09-23    every day from then to yesterday: the backfill
//   node ledger/record.mjs --prs                also merged pull requests since --from (or yesterday)
//   node ledger/record.mjs --facts file.json    add facts by hand: [{kind, day, ref, user_id|github, size?, reason?}]
//   node ledger/record.mjs --dry                print what it would record, write nothing
//
// Bots and the team's accounts are listed in ledger/excluded.json and copied to the database each run.
// Needs YUI_SUPABASE_URL and YUI_SUPABASE_SERVICE_ROLE_KEY (the yuigui project), except with --dry, which
// needs them too (it asks the database what a day would add) but writes nothing.
// GITHUB_TOKEN is optional: the repos are public, a token only lifts GitHub's rate limit.
import { readFileSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { homedir } from "node:os";

const REPOS = ["postscarcityai/yuigui", "postscarcityai/yui"];
const here = (f) => new URL(f, import.meta.url);
const excluded = JSON.parse(readFileSync(here("./excluded.json"), "utf8"));
const botRe = /\[bot\]$/i;
const skipHandle = (login) => botRe.test(login) || excluded.github.some((h) => h.toLowerCase() === login.toLowerCase());

const args = process.argv.slice(2);
const flag = (k) => args.includes(k);
const opt = (k) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : null; };
const DAY = /^\d{4}-\d{2}-\d{2}$/;

const iso = (d) => d.toISOString().slice(0, 10);
const yesterday = iso(new Date(Date.now() - 864e5));
const from = opt("--from") || yesterday;
const to = opt("--to") || yesterday;
if (!DAY.test(from) || !DAY.test(to) || from > to) {
  console.error(`bad range: --from ${from} --to ${to} (YYYY-MM-DD, from on or before to)`);
  process.exit(2);
}
const days = [];
for (let d = new Date(`${from}T00:00:00Z`); iso(d) <= to; d = new Date(d.getTime() + 864e5)) days.push(iso(d));

const dry = flag("--dry");
const url = process.env.YUI_SUPABASE_URL, key = process.env.YUI_SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("YUI_SUPABASE_URL and YUI_SUPABASE_SERVICE_ROLE_KEY are needed");
  process.exit(2);
}

async function rpc(fn, body) {
  const res = await fetch(`${url}/rest/v1/rpc/${fn}`, {
    method: "POST",
    headers: { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`${fn}: ${res.status} ${await res.text()}`);
  return res.json();
}

// Card sizes, by key: the agent-ready block (size: S|M|L) of the card on the board, else the public backlog.
function cardSizes() {
  const sizes = new Map();
  const backlog = here("../site/content/backlog.json");
  if (existsSync(backlog)) for (const c of JSON.parse(readFileSync(backlog, "utf8")).cards || []) if (c.key && c.size) sizes.set(c.key, c.size.toUpperCase());
  const db = process.env.KANBAN_DB || `${homedir()}/.hermes/kanban.db`;
  if (existsSync(db)) {
    try {
      const out = execFileSync("sqlite3", ["-json", "-cmd", "PRAGMA query_only=1", db, "select title, body from tasks where body like '%agent-ready%'"], { encoding: "utf8", maxBuffer: 1 << 26 });
      for (const t of out.trim() ? JSON.parse(out) : []) {
        const key = (t.title.match(/^([A-Z]+-\d+[a-z]?)\b/) || [])[1];
        const m = (t.body || "").match(/```agent-ready\n([\s\S]*?)```/);
        const size = m && (m[1].match(/^size:\s*([SML])\b/im) || [])[1];
        if (key && size) sizes.set(key, size.toUpperCase());
      }
    } catch { /* no board here: the backlog file is enough */ }
  }
  return sizes;
}

// Merged pull requests on a repo, newest first, stopping once they are older than the range.
async function merged(repo, sizes) {
  const headers = { Accept: "application/vnd.github+json", "User-Agent": "yui-ledger" };
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  const out = [];
  for (let page = 1; page <= 20; page++) {
    const res = await fetch(`https://api.github.com/repos/${repo}/pulls?state=closed&sort=updated&direction=desc&per_page=100&page=${page}`, { headers });
    if (!res.ok) throw new Error(`GitHub ${repo}: ${res.status}`);
    const prs = await res.json();
    for (const p of prs) {
      if (!p.merged_at || !p.user || skipHandle(p.user.login)) continue;
      const day = p.merged_at.slice(0, 10);
      if (day < from || day > to) continue;
      const row = { kind: "pr_merged", github: p.user.login, day, ref: `${repo}#${p.number}` };
      const k = (p.title.match(/\[([A-Z]+-\d+[a-z]?)\]/) || [])[1];
      const size = k && sizes.get(k);
      if (size) row.size = size;
      out.push(row);
    }
    if (prs.length < 100 || prs.every((p) => (p.updated_at || "").slice(0, 10) < from)) break;
  }
  return out;
}

let total = 0;
if (!dry) await rpc("yui_ledger_set_excluded", { p: { users: excluded.users, github: excluded.github } });

for (const day of days) {
  if (dry) {
    const rows = await rpc("yui_ledger_preview_day", { p_day: day });
    console.log(`would record ${day}: ${rows.map((r) => `${r.n} ${r.kind}`).join(", ") || "nothing new"}`);
    total += rows.reduce((a, r) => a + r.n, 0);
    continue;
  }
  const n = await rpc("yui_ledger_record_day", { p_day: day });
  total += n;
  console.log(`${day}: ${n} new`);
}

let extra = [];
if (flag("--prs")) {
  const sizes = cardSizes();
  extra = (await Promise.all(REPOS.map((r) => merged(r, sizes)))).flat();
  const sized = extra.filter((r) => r.size).length;
  console.log(`merged pull requests ${from} to ${to}: ${extra.length} (${sized} sized, ${extra.length - sized} unsized)`);
}
if (opt("--facts")) extra.push(...JSON.parse(readFileSync(opt("--facts"), "utf8")));
if (dry) {
  for (const r of extra) console.log(`would add ${r.kind} ${r.github || r.user_id} ${r.day} ${r.ref}${r.size ? ` ${r.size}` : ""}`);
  console.log(`ledger dry run: ${total} day facts and ${extra.length} added facts, ${from} to ${to}. Nothing written.`);
} else {
  if (extra.length) {
    const n = await rpc("yui_ledger_add", { p_rows: extra });
    total += n;
    console.log(`added facts: ${n} new of ${extra.length}`);
  }
  console.log(`ledger: ${total} new facts, ${from} to ${to}`);
}
