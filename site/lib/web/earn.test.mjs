// node --test lib/web/earn.test.mjs   (SITE-161: the formatting and the count of Your $U, the app's EarnStore on the web)
import test from "node:test";
import assert from "node:assert/strict";
import { COUNT_DELAY_MS, countMs, dayWords, fetchSummary, firstName, formatU, initialOf, parseSummary, plan, readSeen, sampleSummary, seenKey, shortDay, speedWords, streakWords, valueAt, writeSeen } from "./earn.mjs";

const reply = { total: 1284, today: 82, soft_cap: 150, streak: 6, mult: 1.1, history: [{ day: "2026-09-30", messages: 34, screens: 9, jobs: 4, earned: 82 }, { nope: 1 }] };

test("the summary reads the yui_my_u reply and the built rows in plain words", () => {
  const s = parseSummary(reply, [{ day: "2026-09-27", kind: "feedback_shipped" }, { day: "2026-09-26", kind: "something_else" }, { day: "2026-09-25", kind: "pr_merged" }]);
  assert.equal(s.total, 1284); assert.equal(s.today, 82); assert.equal(s.softCap, 150); assert.equal(s.streak, 6); assert.equal(s.mult, 1.1);
  assert.equal(s.sample, false);
  assert.deepEqual(s.days, [{ day: "2026-09-30", messages: 34, screens: 9, jobs: 4, earned: 82 }]);
  assert.deepEqual(s.built.map((b) => b.words), ["Your feedback shipped", "Your code was added"]);
});

test("a thin or odd reply never breaks it, and a negative total is zero", () => {
  const s = parseSummary({ total: -5 });
  assert.equal(s.total, 0); assert.equal(s.softCap, 150); assert.equal(s.mult, 1); assert.deepEqual(s.days, []); assert.deepEqual(s.built, []);
  assert.equal(parseSummary(null), null);
  assert.equal(parseSummary([]), null);
  assert.equal(parseSummary({ total: "12" }).total, 12);
});

test("numbers and days read the way the app reads them", () => {
  assert.equal(formatU(1284), "1,284"); assert.equal(formatU(0), "0"); assert.equal(formatU(1234567), "1,234,567"); assert.equal(formatU(-3), "0");
  assert.equal(shortDay("2026-09-29"), "Sep 29"); assert.equal(shortDay("2026-10-01"), "Oct 1"); assert.equal(shortDay("junk"), "junk");
  assert.equal(streakWords(0), "None yet"); assert.equal(streakWords(1), "1 day"); assert.equal(streakWords(6), "6 days");
  assert.equal(speedWords(1), "x1"); assert.equal(speedWords(1.1), "x1.1"); assert.equal(speedWords(1.25), "x1.25"); assert.equal(speedWords(1.5000001), "x1.5");
  assert.equal(dayWords({ messages: 34, screens: 9, jobs: 4, earned: 82 }), "34 messages, 9 screens, 4 jobs, +82");
});

test("the name is the first name from the email, else You (a private relay names nobody)", () => {
  assert.equal(firstName("maya@example.com"), "Maya"); assert.equal(initialOf("maya@example.com"), "M");
  assert.equal(firstName("x7q.2k@privaterelay.appleid.com"), "You"); assert.equal(firstName(""), "You"); assert.equal(firstName(null), "You"); assert.equal(initialOf(undefined), "Y");
});

test("the count lasts half a second for a few and never over 1.6 s, easing out to the exact total", () => {
  assert.ok(countMs(100, 101) >= 500 && countMs(100, 101) < 700);
  assert.equal(countMs(0, 10_000_000), 1600);
  assert.equal(valueAt(100, 180, 0), 100);
  assert.equal(valueAt(100, 180, countMs(100, 180)), 180);
  assert.equal(valueAt(100, 180, 99999), 180);
  assert.equal(valueAt(100, 180, -50), 100);
  let last = 100;
  for (let t = 0; t <= countMs(100, 180); t += 16) { const v = valueAt(100, 180, t); assert.ok(v >= last && v <= 180); last = v; }
  assert.ok(valueAt(100, 180, countMs(100, 180) / 2) > 140, "eases out: more than half done at half time");
  assert.equal(COUNT_DELAY_MS, 450);
});

test("it counts up once, only when the drawer was just opened and the number grew", () => {
  assert.deepEqual(plan({ seen: 1000, total: 1284, animate: true, reduceMotion: false }), { mode: "count", from: 1000, to: 1284 });
  // nothing new since the last look, a first visit, a drop, or a move while the drawer is already open: it just changes
  assert.equal(plan({ seen: 1284, total: 1284, animate: true, reduceMotion: false }).mode, "set");
  assert.equal(plan({ seen: null, total: 1284, animate: true, reduceMotion: false }).mode, "set");
  assert.equal(plan({ seen: 2000, total: 1284, animate: true, reduceMotion: false }).mode, "set");
  assert.equal(plan({ seen: 1000, total: 1284, animate: false, reduceMotion: false }).mode, "set");
  // reduced motion: the new total at once, no count
  assert.deepEqual(plan({ seen: 1000, total: 1284, animate: true, reduceMotion: true }), { mode: "set", from: 1284, to: 1284 });
});

test("what the person last saw is kept per account and survives junk and a closed store", () => {
  const mem = new Map();
  const storage = { getItem: (k) => (mem.has(k) ? mem.get(k) : null), setItem: (k, v) => mem.set(k, v) };
  assert.equal(readSeen(storage, "u1"), null);
  writeSeen(storage, "u1", 1284);
  assert.equal(mem.get(seenKey("u1")), "1284");
  assert.equal(readSeen(storage, "u1"), 1284); assert.equal(readSeen(storage, "u2"), null);
  mem.set(seenKey("u3"), "abc"); assert.equal(readSeen(storage, "u3"), null);
  mem.set(seenKey("u4"), "-4"); assert.equal(readSeen(storage, "u4"), null);
  const dead = { getItem() { throw new Error("denied"); }, setItem() { throw new Error("denied"); } };
  assert.equal(readSeen(dead, "u1"), null); assert.doesNotThrow(() => writeSeen(dead, "u1", 5));
  assert.equal(readSeen(null, "u1"), null);
});

test("the two reads are the app's: yui_my_u for 30 days and the built rows, with the person's own session", async () => {
  const calls = [];
  const request = async (path, init = {}) => {
    calls.push({ path, init });
    return { json: async () => (path.includes("rpc/yui_my_u") ? reply : [{ day: "2026-09-27", kind: "issue_shipped" }]) };
  };
  const s = await fetchSummary(request);
  assert.equal(s.total, 1284); assert.deepEqual(s.built, [{ day: "2026-09-27", words: "Your idea shipped" }]);
  assert.equal(calls[0].path, "rest/v1/rpc/yui_my_u"); assert.equal(calls[0].init.method, "POST"); assert.equal(calls[0].init.body, '{"p_days":30}');
  const q = new URLSearchParams(calls[1].path.split("?")[1]);
  assert.match(calls[1].path, /^rest\/v1\/yui_ledger\?/);
  assert.equal(q.get("select"), "kind,day"); assert.equal(q.get("order"), "day.desc"); assert.equal(q.get("limit"), "20");
  assert.equal(q.get("kind"), "in.(feedback_shipped,issue_accepted,issue_shipped,pr_merged)");
});

test("a failed first read is null (no number at all, never a wrong one); a failed second read only drops the built rows", async () => {
  assert.equal(await fetchSummary(async () => { throw new Error("401"); }), null);
  const s = await fetchSummary(async (path) => { if (path.includes("yui_ledger")) throw new Error("500"); return { json: async () => reply }; });
  assert.equal(s.total, 1284); assert.deepEqual(s.built, []);
});

test("the sample is marked as a sample and a real read never is", () => {
  const s = sampleSummary();
  assert.equal(s.sample, true); assert.ok(s.total > 0 && s.days.length && s.built.length);
  assert.equal(parseSummary(reply).sample, false);
});
