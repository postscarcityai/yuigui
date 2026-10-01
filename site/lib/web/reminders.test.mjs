import test from "node:test";
import assert from "node:assert/strict";
import { createReminders, reminderDate, reminderItems } from "./reminders.mjs";

const mem = () => { const m = new Map(); return { getItem: (k) => m.get(k) ?? null, setItem: (k, v) => m.set(k, v) }; };
const at = (d) => { const p = (n) => String(n).padStart(2, "0"); return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`; };

function rig(over = {}) {
  let t = new Date(2026, 8, 29, 8, 0, 0).getTime();
  const shown = []; const timers = [];
  const state = { permission: "granted", asked: 0 };
  const r = createReminders({
    storage: mem(), now: () => t,
    notify: (n) => shown.push(n), ask: async () => { state.asked++; state.permission = "granted"; return "granted"; }, permission: () => state.permission,
    setTimer: (fn, ms) => { const h = { fn, ms, live: true }; timers.push(h); return h; }, clearTimer: (h) => { if (h) h.live = false; },
    ...over,
  });
  return { r, shown, timers, state, advance: (ms) => { t += ms; for (const h of timers.filter((x) => x.live)) { h.live = false; h.fn(); } } };
}
const row = (items, createdAt = "2026-09-29T12:00:00Z") => ({ meta: { native: { reminders: items } }, agent: "penny", name: "Penny", createdAt, live: true });

test("local time parsing", () => {
  assert.equal(reminderDate("2026-09-29T08:50").getHours(), 8);
  assert.equal(reminderDate("2026-13-29T08:50"), null);
  assert.equal(reminderDate("2026-02-31T08:50"), null);
  assert.equal(reminderDate("nope"), null);
});

test("items: the whole set, bad rows dropped, an empty list is a set, no key means no word about reminders", () => {
  assert.deepEqual(reminderItems({ native: { reminders: [{ key: "a", text: "Call", at: "2026-09-29T08:50" }, { key: "", at: "2026-09-29T08:50" }, { key: "b", at: "bad" }] } }), [{ key: "a", text: "Call", at: "2026-09-29T08:50" }]);
  assert.deepEqual(reminderItems({ native: { reminders: [] } }), []);
  assert.equal(reminderItems({ native: {} }), null);
  assert.equal(reminderItems(null), null);
});

test("a reminder goes off at its time with the agent's name, and only once", () => {
  const { r, shown, advance } = rig();
  assert.equal(r.take(row([{ key: "dentist", text: "Call the dentist, 9:00 am", at: "2026-09-29T08:50" }])), true);
  assert.deepEqual(r.pending("penny"), ["dentist"]);
  advance(5 * 60000);        // 08:05, nothing yet
  assert.equal(shown.length, 0);
  advance(46 * 60000);       // 08:51: due and still fresh
  assert.deepEqual(shown, [{ title: "Penny", body: "Call the dentist, 9:00 am", key: "dentist", agent: "penny" }]);
  advance(60 * 60000);
  assert.equal(shown.length, 1);
});

test("a newer set replaces the old one; an older reply never undoes a newer one", () => {
  const { r } = rig();
  r.take(row([{ key: "a", text: "A", at: "2026-09-29T09:00" }], "2026-09-29T12:00:00Z"));
  assert.equal(r.take(row([{ key: "old", text: "Old", at: "2026-09-29T10:00" }], "2026-09-29T11:00:00Z")), false);
  assert.deepEqual(r.saved("penny").map((x) => x.key), ["a"]);
  assert.equal(r.take(row([{ key: "b", text: "B", at: "2026-09-29T10:00" }], "2026-09-29T13:00:00Z")), true);
  assert.deepEqual(r.pending("penny"), ["b"]);
  r.take(row([], "2026-09-29T14:00:00Z"));
  assert.deepEqual(r.pending("penny"), []);
});

test("missed by more than a minute is not shown late; no permission shows nothing", () => {
  const a = rig();
  a.r.take(row([{ key: "x", text: "X", at: "2026-09-29T08:10" }]));
  a.advance(30 * 60000);
  assert.equal(a.shown.length, 0);
  const b = rig();
  b.state.permission = "denied";
  b.r.take(row([{ key: "x", text: "X", at: "2026-09-29T08:01" }]));
  b.advance(2 * 60000);
  assert.equal(b.shown.length, 0);
});

test("permission is asked once, the first time a live reply carries a future reminder", async () => {
  const { r, state } = rig();
  state.permission = "default";
  r.take({ ...row([{ key: "a", text: "A", at: "2026-09-29T09:00" }]), live: false });
  assert.equal(state.asked, 0);
  r.take(row([{ key: "a", text: "A", at: "2026-09-29T09:00" }], "2026-09-29T12:30:00Z"));
  await new Promise((x) => setTimeout(x, 0));
  assert.equal(state.asked, 1);
  state.permission = "default";
  r.take(row([{ key: "b", text: "B", at: "2026-09-29T09:30" }], "2026-09-29T13:00:00Z"));
  await new Promise((x) => setTimeout(x, 0));
  assert.equal(state.asked, 1);
});

test("resume puts the kept set back on the clock after a reload", () => {
  const storage = mem();
  const a = rig({ storage });
  a.r.take(row([{ key: "k", text: "K", at: "2026-09-29T08:30" }]));
  const b = rig({ storage });
  assert.equal(b.r.resume("penny"), true);
  assert.deepEqual(b.r.pending("penny"), ["k"]);
  b.advance(31 * 60000);
  assert.equal(b.shown.length, 1);
  assert.ok(at(new Date()));
});
