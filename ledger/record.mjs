#!/usr/bin/env node
// The private ledger's recorder (OSS-7, spec/LEDGER.md). Records facts, never what anyone said:
// who joined and who used Yui on a day (the database works that out, yui_ledger_record_day),
// and pull requests merged into the public repos (read from GitHub, added with yui_ledger_add).
// Safe to run again: a fact already on the ledger is skipped.
//
//   node ledger/record.mjs                      yesterday (UTC)
//   node ledger/record.mjs --from 2026-09-23    every day from then to yesterday: the backfill
//   node ledger/record.mjs --prs                also merged pull requests since --from (or yesterday)
//   node ledger/record.mjs --dry                print what it would record, write nothing
//
// Needs YUI_SUPABASE_URL and YUI_SUPABASE_SERVICE_ROLE_KEY, the same two the site uses, except with --dry.
// GITHUB_TOKEN is optional: the repos are public, a token only lifts GitHub's rate limit.
// The hub, the app and one repo per platform (site/lib/platforms.mjs).
import { PLATFORMS } from "../site/lib/platforms.mjs";
const REPOS = ["postscarcityai/yuigui", ...PLATFORMS.map((p) => `postscarcityai/${p.repo}`)];
const BOTS = /\[bot\]$|^dependabot|^github-actions/i;

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
if (!dry && (!url || !key)) {
  console.error("YUI_SUPABASE_URL and YUI_SUPABASE_SERVICE_ROLE_KEY are needed (or --dry)");
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

// Merged pull requests on a repo, newest first, stopping once they are older than the range.
async function merged(repo) {
  const headers = { Accept: "application/vnd.github+json", "User-Agent": "yui-ledger" };
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  const out = [];
  for (let page = 1; page <= 20; page++) {
    const res = await fetch(`https://api.github.com/repos/${repo}/pulls?state=closed&sort=updated&direction=desc&per_page=100&page=${page}`, { headers });
    if (!res.ok) throw new Error(`GitHub ${repo}: ${res.status}`);
    const prs = await res.json();
    for (const p of prs) {
      if (!p.merged_at || !p.user || BOTS.test(p.user.login)) continue;
      const day = p.merged_at.slice(0, 10);
      if (day >= from && day <= to) out.push({ kind: "pr_merged", github: p.user.login, day, ref: `${repo}#${p.number}` });
    }
    if (prs.length < 100 || prs.every((p) => (p.updated_at || "").slice(0, 10) < from)) break;
  }
  return out;
}

let total = 0;
for (const day of days) {
  if (dry) { console.log(`would record ${day}: joined and use_day`); continue; }
  const n = await rpc("yui_ledger_record_day", { p_day: day });
  total += n;
  console.log(`${day}: ${n} new`);
}

if (flag("--prs")) {
  const rows = (await Promise.all(REPOS.map(merged))).flat();
  if (dry) {
    for (const r of rows) console.log(`would add ${r.kind} ${r.github} ${r.day} ${r.ref}`);
    console.log(`${rows.length} merged pull requests from ${from} to ${to}`);
  } else if (rows.length) {
    const n = await rpc("yui_ledger_add", { p_rows: rows });
    total += n;
    console.log(`pull requests: ${n} new of ${rows.length}`);
  } else console.log("pull requests: none in range");
}

if (!dry) console.log(`ledger: ${total} new facts, ${from} to ${to}`);
