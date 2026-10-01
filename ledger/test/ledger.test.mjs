// Tests for ledger/yui_ledger.sql on Postgres (PGlite, in process). Stand-in yui_users, yui_messages and
// yui_native_jobs tables stand for what the Yui backend already has. Run: npm i && npm test (in ledger/test).
import { test, before } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { PGlite } from "@electric-sql/pglite";

const here = (f) => new URL(f, import.meta.url);
let db;
const q = async (sql, params) => (await db.query(sql, params)).rows;
const one = async (sql, params) => (await q(sql, params))[0];
const U = (n) => `00000000-0000-0000-0000-0000000000${String(n).padStart(2, "0")}`;
const day = (d) => new Date(Date.UTC(2026, 8, 1) + d * 864e5).toISOString().slice(0, 10); // d=0 is Sep 1
const bal = async (u, v = null) => Number((await one("select public.yui_u_balance($1::uuid, $2) b", [U(u), v])).b);
const days = (u) => q("select * from public.yui_u_days($1::uuid) order by day", [U(u)]);

// A user who joined before the window, so joining does not muddy a use test.
async function user(n, joined = "2026-08-01") {
  await db.query("insert into public.yui_users (id, apple_sub, created_at) values ($1, $2, $3) on conflict do nothing", [U(n), `sub${n}`, `${joined}T12:00:00Z`]);
}
// An answered text (handled) at a given UTC day.
async function say(n, d, body, { kind = "text", handled = true, sender = "user", hour = 10 } = {}) {
  await db.query(
    "insert into public.yui_messages (user_id, sender, body, kind, handled_at, created_at) values ($1, $2, $3, $4, $5, $6)",
    [U(n), sender, body, kind, handled ? `${day(d)}T${String(hour).padStart(2, "0")}:05:00Z` : null, `${day(d)}T${String(hour).padStart(2, "0")}:00:00Z`]);
}
const record = async (d) => Number((await one("select public.yui_ledger_record_day($1::date) n", [day(d)])).n);
const add = async (rows) => Number((await one("select public.yui_ledger_add($1::jsonb) n", [JSON.stringify(rows)])).n);

before(async () => {
  db = new PGlite();
  await db.exec(readFileSync(here("stubs.sql"), "utf8"));
  await db.exec(readFileSync(here("../yui_ledger.sql"), "utf8"));
  // It runs again without error: everything is create-if-missing.
  await db.exec(readFileSync(here("../yui_ledger.sql"), "utf8"));
});

test("a normal day is about 85 $U: 30 messages, 10 screens, 5 jobs, plus the first visit", async () => {
  await user(1);
  for (let i = 0; i < 30; i++) await say(1, 0, `m${i}`);
  for (let i = 0; i < 10; i++) await say(1, 0, `[yui] n${i} ask answer=Yes`, { kind: "event" });
  for (let i = 0; i < 5; i++) await db.query("insert into public.yui_native_jobs (user_id, status, finished_at) values ($1, 'done', $2)", [U(1), `${day(0)}T11:00:00Z`]);
  await record(0);
  const f = await q("select kind, amount from public.yui_ledger where user_id = $1 order by kind", [U(1)]);
  assert.deepEqual(f.map((r) => [r.kind, r.amount]), [["job_done", 5], ["message", 30], ["screen", 10], ["use_day", 1]]);
  const [d0] = await days(1);
  assert.equal(d0.total_u, 30 + 20 + 25 + 10);
  assert.equal(d0.streak, 1);
});

test("a second record run adds nothing, and so does a second add", async () => {
  assert.equal(await record(0), 0);
  const rows = [{ kind: "feedback_sent", day: day(0), ref: "tf-1", user_id: U(1) }];
  assert.equal(await add(rows), 1);
  assert.equal(await add(rows), 0);
});

test("a repeat message the same day counts once, an unanswered one and an agent row count never", async () => {
  await user(2);
  await say(2, 0, "hello"); await say(2, 0, "hello"); await say(2, 0, "again");
  await say(2, 0, "never answered", { handled: false });
  await say(2, 0, "from the agent", { sender: "agent", handled: false, hour: 20 });
  await record(0);
  const m = await one("select amount from public.yui_ledger where user_id = $1 and kind = 'message'", [U(2)]);
  assert.equal(m.amount, 2);
});

test("an agent row within ten minutes counts as the answer; a late one does not", async () => {
  await user(3);
  await say(3, 0, "answered by a reply", { handled: false, hour: 8 });
  await db.query("insert into public.yui_messages (user_id, sender, body, created_at) values ($1, 'agent', 'reply', $2)", [U(3), `${day(0)}T08:03:00Z`]);
  await say(3, 0, "answered too late", { handled: false, hour: 9 });
  await db.query("insert into public.yui_messages (user_id, sender, body, created_at) values ($1, 'agent', 'reply', $2)", [U(3), `${day(0)}T09:30:00Z`]);
  await record(0);
  assert.equal((await one("select amount from public.yui_ledger where user_id = $1 and kind = 'message'", [U(3)])).amount, 1);
});

test("the soft cap: full speed to 150, then a tenth", async () => {
  await user(4);
  for (let i = 0; i < 200; i++) await say(4, 0, `spam ${i}`);
  await record(0);
  const [d0] = await days(4);
  assert.equal(d0.use_u, 150 + Math.round((200 + 10 - 150) * 0.1)); // 156
});

test("streaks: x1.1 at 3, x1.25 and +50 at 7, x1.5 and +300 at 30", async () => {
  await user(5);
  for (let d = 0; d < 30; d++) { await say(5, d, "hi"); await record(d); }
  const ds = await days(5);
  const at = (n) => ds[n - 1];
  assert.equal(at(1).mult, "1"); assert.equal(at(2).mult, "1");
  assert.equal(at(3).mult, "1.1"); assert.equal(at(3).use_u, Math.round(11 * 1.1));
  assert.equal(at(7).mult, "1.25"); assert.equal(at(7).bonus_u, 50);
  assert.equal(at(8).bonus_u, 0);
  assert.equal(at(30).mult, "1.5"); assert.equal(at(30).bonus_u, 300);
  assert.equal(at(30).streak, 30);
});

test("one missed day a week is forgiven and does not add to the length; a second miss breaks it", async () => {
  await user(6);
  for (const d of [0, 1, 3, 4]) { await say(6, d, "hi"); await record(d); } // miss day 2: forgiven
  let ds = await days(6);
  assert.deepEqual(ds.map((r) => r.streak), [1, 2, 3, 4]);
  await say(6, 6, "hi"); await record(6); // miss day 5 again within 7 days: broken
  ds = await days(6);
  assert.equal(ds[4].streak, 1);
  await user(7);
  await say(7, 0, "hi"); await record(0); await say(7, 3, "hi"); await record(3); // two missed days: broken
  assert.deepEqual((await days(7)).map((r) => r.streak), [1, 1]);
});

test("building: feedback, issues and pull requests by size, joined and founding", async () => {
  await user(8, "2026-09-10");
  await record(0); // not the join day: nothing
  await db.query("insert into public.yui_users (id, apple_sub, created_at) values ($1, 'sub-new', $2)", [U(9), `${day(5)}T09:00:00Z`]);
  await record(5);
  assert.equal(await bal(9), 100 + 400);
  await add([
    { kind: "feedback_sent", day: day(6), ref: "f1", user_id: U(9) },
    { kind: "feedback_shipped", day: day(6), ref: "f1", user_id: U(9) },
    { kind: "issue_accepted", day: day(6), ref: "yuigui#1", user_id: U(9) },
    { kind: "issue_shipped", day: day(6), ref: "yuigui#1", user_id: U(9) },
    { kind: "pr_merged", day: day(6), ref: "yuigui#2", user_id: U(9), size: "S" },
    { kind: "pr_merged", day: day(6), ref: "yuigui#3", user_id: U(9), size: "M" },
    { kind: "pr_merged", day: day(6), ref: "yuigui#4", user_id: U(9), size: "L" },
    { kind: "pr_merged", day: day(6), ref: "yuigui#5", user_id: U(9) },
  ]);
  assert.equal(await bal(9), 500 + 10 + 500 + 200 + 500 + 1000 + 3000 + 10000 + 1000);
});

test("a founding user is only founding before the cutoff", async () => {
  await db.query("insert into public.yui_ledger_formula (version, from_day, params) select 1, date '2026-09-20', params || '{\"founding_until\": \"2026-09-04\"}'::jsonb || '{\"message\": 2}'::jsonb from public.yui_ledger_formula where version = 0 on conflict do nothing");
  await db.query("insert into public.yui_users (id, apple_sub, created_at) values ($1, 'sub-late', $2)", [U(10), `${day(9)}T09:00:00Z`]);
  await db.query("insert into public.yui_users (id, apple_sub, created_at) values ($1, 'sub-early', $2)", [U(11), `${day(2)}T09:00:00Z`]);
  await record(9); await record(2);
  assert.equal(Number((await one("select count(*) n from public.yui_ledger where kind = 'founding' and user_id = any($1)", [[U(10), U(11)]])).n), 1);
  await db.query("delete from public.yui_ledger_formula where version = 1");
});

test("a new formula version re-scores the same facts the same way, for everyone", async () => {
  await user(12);
  for (let i = 0; i < 10; i++) await say(12, 0, `x${i}`);
  await record(0);
  const v0 = await bal(12, 0);
  assert.equal(v0, 10 + 10);
  await db.query("insert into public.yui_ledger_formula (version, from_day, params) select 1, date '2026-10-01', params || '{\"message\": 3}'::jsonb from public.yui_ledger_formula where version = 0");
  assert.equal(await bal(12, 1), 30 + 10);
  assert.equal(await bal(12), 30 + 10); // the newest version is the default
  assert.equal(await bal(12, 0), 20); // the old one still answers
  await db.query("delete from public.yui_ledger_formula where version = 1");
});

test("clawback is a fact with a reason, never a delete, and rows cannot be changed", async () => {
  await user(13, "2026-09-10");
  await add([{ kind: "pr_merged", day: day(3), ref: "yuigui#9", user_id: U(13), size: "S" }]);
  assert.equal(await bal(13), 1000);
  assert.equal(await add([{ kind: "clawback", day: day(4), ref: "spam-1", user_id: U(13), amount: 400 }]), 0); // no reason: refused
  assert.equal(await add([{ kind: "clawback", day: day(4), ref: "spam-1", user_id: U(13), amount: 400, reason: "tiny reformat pull request" }]), 1);
  assert.equal(await bal(13), 600);
  const hist = await days(13);
  assert.equal(hist.at(-1).clawback_u, -400);
  assert.equal(Number((await one("select count(*) n from public.yui_ledger where user_id = $1", [U(13)])).n), 2);
  await assert.rejects(db.query("update public.yui_ledger set amount = 1 where user_id = $1", [U(13)]), /never changed/);
  await add([{ kind: "clawback", day: day(5), ref: "spam-2", user_id: U(13), amount: 99999, reason: "x" }]);
  assert.equal(await bal(13), 0); // the balance never goes below zero
});

test("bots and the team's accounts are excluded", async () => {
  await user(14);
  assert.equal(Number((await one("select public.yui_ledger_set_excluded($1::jsonb) n", [JSON.stringify({ users: [U(14)], github: ["dependabot", "CJohnDesign"] })])).n), 3);
  await say(14, 0, "hi"); await record(0);
  assert.equal(Number((await one("select count(*) n from public.yui_ledger where user_id = $1 and kind <> 'joined'", [U(14)])).n), 0);
  assert.equal(await add([{ kind: "pr_merged", day: day(1), ref: "yuigui#20", github: "cjohndesign", size: "L" }]), 0);
  assert.equal(await add([{ kind: "pr_merged", day: day(1), ref: "yuigui#21", github: "someone", size: "L" }]), 1);
  await db.query("select public.yui_ledger_set_excluded('{}'::jsonb)");
});

const as = async (uid, role, fn) => {
  await db.exec("begin");
  try {
    await db.query("select set_config('request.jwt.claims', $1, true)", [uid ? JSON.stringify({ sub: uid }) : "{}"]);
    await db.exec(`set local role ${role}`);
    return await fn();
  } finally { await db.exec("rollback"); }
};

test("RLS: the app sees only its own rows and its own total, never anyone else's", async () => {
  await user(15, "2026-09-10"); await user(16, "2026-09-10");
  await add([{ kind: "pr_merged", day: day(3), ref: "yuigui#30", user_id: U(15), size: "M" },
             { kind: "pr_merged", day: day(3), ref: "yuigui#31", user_id: U(16), size: "S" }]);
  const mine = await as(U(15), "yui_user", () => q("select user_id from public.yui_ledger"));
  assert.ok(mine.length >= 1 && mine.every((r) => r.user_id === U(15)));
  const j = await as(U(15), "yui_user", () => one("select public.yui_my_u(10) j"));
  assert.equal(j.j.total, 3000);
  assert.equal(j.j.note, "No cash value. Not a token yet.");
  const other = await as(U(16), "yui_user", () => one("select public.yui_my_u(10) j"));
  assert.equal(other.j.total, 1000);
  // No way to ask for another person: the caller is the token's sub, the function takes no user.
  await assert.rejects(as(U(15), "yui_user", () => q("select public.yui_u_balance($1::uuid)", [U(16)])), /permission denied/);
  await assert.rejects(as(U(15), "yui_user", () => q("select * from public.yui_u_days($1::uuid)", [U(16)])), /permission denied/);
  await assert.rejects(as(U(15), "yui_user", () => q("select * from public.yui_ledger_excluded")), /permission denied/);
  await assert.rejects(as(null, "anon", () => q("select * from public.yui_ledger")), /permission denied/);
  await assert.rejects(as(null, "authenticated", () => q("select * from public.yui_ledger")), /permission denied/);
  await assert.rejects(as(null, "anon", () => q("select public.yui_my_u(1)")), /permission denied/);
  await assert.rejects(as(U(15), "yui_user", () => q("select public.yui_ledger_record_day('2026-09-01')")), /permission denied/);
  await assert.rejects(as(U(15), "yui_user", () => q("insert into public.yui_ledger (user_id, kind, day) values ($1, 'joined', '2026-09-01')", [U(15)])), /permission denied/);
  await assert.rejects(as(null, "yui_user", () => q("select public.yui_my_u(1)")), /not signed in/);
});

test("live: today's answered messages move the total before the ledger settles", async () => {
  await user(17);
  const today = new Date().toISOString().slice(0, 10);
  await db.query("insert into public.yui_messages (user_id, sender, body, handled_at, created_at) values ($1, 'user', 'live', now(), now())", [U(17)]);
  const j = await as(U(17), "yui_user", () => one("select public.yui_my_u(5) j"));
  assert.equal(j.j.total, 1 + 10);
  assert.equal(j.j.today, 11);
  assert.equal(j.j.history[0].day, today);
  assert.equal(Number((await one("select count(*) n from public.yui_ledger where user_id = $1", [U(17)])).n), 0); // not recorded yet
  await db.query("insert into public.yui_messages (user_id, sender, body, handled_at, created_at) values ($1, 'user', 'live two', now(), now())", [U(17)]);
  assert.equal((await as(U(17), "yui_user", () => one("select public.yui_my_u(5) j"))).j.total, 2 + 10);
});

test("deleting an account deletes its rows", async () => {
  assert.ok(Number((await one("select count(*) n from public.yui_ledger where user_id = $1", [U(15)])).n) > 0);
  await db.query("delete from public.yui_users where id = $1", [U(15)]);
  assert.equal(Number((await one("select count(*) n from public.yui_ledger where user_id = $1", [U(15)])).n), 0);
});

test("the dry run matches the backfill, and a second run adds nothing", async () => {
  await db.query("insert into public.yui_users (id, apple_sub, created_at) values ($1, 'sub-bf', $2)", [U(20), `${day(40)}T09:00:00Z`]);
  await db.query("insert into public.yui_users (id, apple_sub, created_at) values ($1, 'sub-bf2', $2)", [U(21), `${day(41)}T09:00:00Z`]);
  for (let d = 40; d < 44; d++) { await say(20, d, `a${d}`); await say(21, d, `b${d}`); await say(21, d, `[yui] ${d}`, { kind: "event" }); }
  const dry = {};
  for (let d = 40; d < 44; d++)
    for (const r of await q("select * from public.yui_ledger_preview_day($1::date)", [day(d)])) dry[r.kind] = (dry[r.kind] || 0) + r.n;
  assert.equal(Number((await one("select count(*) n from public.yui_ledger where day >= $1", [day(40)])).n), 0); // dry wrote nothing
  let added = 0;
  for (let d = 40; d < 44; d++) added += await record(d);
  const got = {};
  for (const r of await q("select kind, count(*)::int n from public.yui_ledger where day >= $1 group by kind", [day(40)])) got[r.kind] = r.n;
  assert.deepEqual(got, dry);
  assert.equal(added, Object.values(dry).reduce((a, b) => a + b, 0));
  let again = 0;
  for (let d = 40; d < 44; d++) again += await record(d);
  assert.equal(again, 0);
  for (let d = 40; d < 44; d++) assert.deepEqual(await q("select * from public.yui_ledger_preview_day($1::date)", [day(d)]), []);
});

test("the formula tables on /earn match the formula row in the SQL", async () => {
  const { PARAMS, USE_ROWS, BUILD_ROWS, JOIN_ROWS, STREAK_ROWS } = await import(here("../../site/lib/earn-formula.mjs"));
  const row = (await one("select params from public.yui_ledger_formula where version = 0")).params;
  assert.deepEqual(PARAMS, Object.fromEntries(Object.keys(PARAMS).map((k) => [k, row[k]])));
  assert.equal(row.forgive_every_days, 7); // one missed day in any seven
  // The rows the page prints say the same numbers.
  const n = (s) => Number(String(s).replace(/[^0-9.]/g, ""));
  assert.deepEqual(USE_ROWS.map((r) => n(r[1])), [row.message, row.screen, row.job_done, row.first_visit]);
  assert.deepEqual(JOIN_ROWS.map((r) => n(r[1])), [row.joined, row.founding]);
  assert.deepEqual(BUILD_ROWS.map((r) => n(r[1])), [row.feedback_sent, row.feedback_shipped, row.issue_accepted, row.issue_shipped, row.pr_merged.S, row.pr_merged.M, row.pr_merged.L, row.pr_merged.none]);
  assert.deepEqual(STREAK_ROWS.map((r) => [n(r[1]), n(r[2])]), row.streak.map((s) => [s.mult, s.bonus]));
});
