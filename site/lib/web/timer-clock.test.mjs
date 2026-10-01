import test from "node:test";
import assert from "node:assert/strict";
import { advance, clockLabel, tabTitle } from "./timer-clock.mjs";

const plan = { work: 20, rest: 10, rounds: 3, up: false };
const start = { round: 1, phase: "work", left: 20, done: false };

test("a short step just counts down", () => {
  const s = advance(start, plan, 5);
  assert.deepEqual([s.round, s.phase, s.left, s.done], [1, "work", 15, false]);
});

test("the last three seconds beep once each, however the steps fall", () => {
  let s = { ...start, left: 5 };
  const heard = [];
  for (let i = 0; i < 50; i++) { s = advance(s, plan, 0.1); heard.push(...s.beeps); if (s.cross.length) break; }
  assert.deepEqual(heard, [3, 2, 1]);
  assert.deepEqual(advance({ ...start, left: 5 }, plan, 4).beeps, [3, 2, 1]);
});

test("work rolls to rest, rest to the next round, the last round to done", () => {
  let s = advance(start, plan, 20);
  assert.deepEqual([s.round, s.phase, s.left], [1, "rest", 10]);
  assert.deepEqual(s.cross, ["rest"]);
  s = advance(s, plan, 10);
  assert.deepEqual([s.round, s.phase, s.left], [2, "work", 20]);
  s = advance({ round: 3, phase: "work", left: 1, done: false }, plan, 1);
  assert.equal(s.done, true);
  assert.deepEqual(s.cross, ["done"]);
});

test("a tab away for ten minutes lands where the clock says, across every phase it missed", () => {
  // 35 s in: 20 work, 10 rest, then 5 s into round 2's work
  const s = advance(start, plan, 35);
  assert.deepEqual([s.round, s.phase, s.left], [2, "work", 15]);
  assert.deepEqual(s.cross, ["rest", "work"]);
  const all = advance(start, plan, 600);
  assert.equal(all.done, true);
  assert.deepEqual(all.cross, ["rest", "work", "rest", "work", "done"]);
});

test("no rest between rounds goes straight on; a stopwatch counts up", () => {
  const s = advance(start, { ...plan, rest: 0 }, 21);
  assert.deepEqual([s.round, s.phase, Math.round(s.left)], [2, "work", 19]);
  assert.equal(advance({ round: 1, phase: "work", left: 12.5, done: false }, { up: true }, 2.5).left, 15);
});

test("the labels", () => {
  assert.equal(clockLabel(65.2), "1:06");
  assert.equal(tabTitle("Yui", 65, 2, 8), "1:05 · 2/8 · Yui");
  assert.equal(tabTitle("Yui", 9, 1, 1), "0:09 · Yui");
});
