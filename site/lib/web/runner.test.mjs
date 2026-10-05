import test from "node:test";
import assert from "node:assert/strict";
import * as R from "./runner.mjs";

const page = { id: "p1", preset: "page", props: { body: "Today is legs. Rest about 75 seconds between sets." } };
const sets = (id, n, extra = []) => ({ id, preset: "pick", props: { options: [...Array.from({ length: n }, (_, i) => `Set ${i + 1}`), ...extra] } });
const slide = (id, value, props = {}) => ({ id, preset: "slide", props: { value, ...props } });
const steps = [page, sets("e1-sets", 3, ["Skip"]), slide("e1-reps", 8, { min: 1, max: 30 }), slide("e1-lb", 135, { unit: "lb", step: 5 }), sets("e2-sets", 2), { id: "felt", preset: "choose", props: { options: ["Easy", "Hard"] } }];

test("a plan of set picks reads as a workout: moves, skip, nudges, rest from the words", () => {
  const r = R.runnerPlan(steps);
  assert.deepEqual(r.moves.map((m) => m.id), ["e1-sets", "e2-sets"]);
  assert.deepEqual(r.moves[0].labels, ["Set 1", "Set 2", "Set 3"]);
  assert.equal(r.moves[0].skip, "Skip");
  assert.deepEqual(r.moves[0].nudges.map((n) => n.id), ["e1-reps", "e1-lb"]);
  assert.equal(r.moves[1].skip, null);
  assert.equal(r.rest, 75);
  assert.deepEqual([...r.absorbed], ["e1-reps", "e1-lb"]);
});

test("any other plan is not a workout; rest defaults to 90 and clamps", () => {
  assert.equal(R.runnerPlan([page, { id: "q", preset: "pick", props: { options: ["Red", "Blue", "Green"] } }]), null);
  assert.equal(R.runnerPlan([{ id: "q", preset: "choose", props: { options: ["Set 1"] } }]), null);
  assert.equal(R.runnerPlan([sets("a-sets", 2)]).rest, 90);
  assert.equal(R.runnerPlan([{ id: "p", preset: "page", props: { body: "Rest 5 s" } }, sets("a-sets", 2)]).rest, 10);
});

test("ticking a set, ticking it off, Skip clears the sets and a set clears Skip", () => {
  const r = R.runnerPlan(steps); const m = r.moves[0];
  let p = R.emptyProgress();
  let o = R.toggle(p, "Set 1", m); assert.equal(o.went, true); p = o.progress;
  o = R.toggle(p, "Set 2", m); p = o.progress;
  assert.deepEqual(p.ticked["e1-sets"], ["Set 1", "Set 2"]);
  o = R.toggle(p, "Set 1", m); assert.equal(o.went, false); p = o.progress;
  assert.deepEqual(p.ticked["e1-sets"], ["Set 2"]);
  p = R.toggle(p, "Skip", m).progress;
  assert.deepEqual(p.ticked["e1-sets"], ["Skip"]);
  p = R.toggle(p, "Set 3", m).progress;
  assert.deepEqual(p.ticked["e1-sets"], ["Set 3"]);
});

test("'done' out loud ticks the next set, once per word heard", () => {
  assert.equal(R.voiceDone("done"), 1);
  assert.equal(R.voiceDone("Done, next set, and that was done"), 3);
  assert.equal(R.voiceDone("I am undone"), 0);
  const m = R.runnerPlan(steps).moves[0];
  let p = R.emptyProgress();
  for (let i = 0; i < 3; i++) { const o = R.tickNext(p, m); assert.equal(o.went, true); p = o.progress; }
  assert.deepEqual(p.ticked["e1-sets"], ["Set 1", "Set 2", "Set 3"]);
  assert.equal(R.tickNext(p, m).went, false);
});

test("the rest clock keeps true time from its end moment, +15s grows the ring", () => {
  const r = R.restStart(75, 1000);
  assert.equal(R.restLeft(r, 1000), 75);
  assert.equal(R.restLeft(r, 1000 + 30_000), 45);
  assert.equal(R.restLeft(r, 1000 + 74_100), 1);
  assert.equal(R.restOver(r, 1000 + 75_000), true);
  assert.equal(R.restProgress(r, 1000 + 30_000), 0.4);
  const more = R.restAdd(r, 15, 1000 + 30_000);
  assert.equal(R.restLeft(more, 1000 + 30_000), 60);
  assert.equal(more.total, 90);
  // adding after it ended counts from now
  assert.equal(R.restLeft(R.restAdd(r, 15, 1000 + 200_000), 1000 + 200_000), 15);
  assert.equal(R.restLabel(75), "1:15");
});

test("the plan's answers: ticked sets as picks and every nudge as its number, untouched ones as drawn", () => {
  const r = R.runnerPlan(steps);
  let p = R.toggle(R.emptyProgress(), "Set 1", r.moves[0]).progress;
  p = R.nudged(p, "e1-lb", 145);
  assert.deepEqual(R.answersOf(r, p), { "e1-sets": ["Set 1"], "e1-reps": 8, "e1-lb": 145 });
  assert.equal(R.targetOf(r, r.moves[0], p), "8 reps · 145 lb");
});

test("progress is kept per plan in storage and cleared", () => {
  const m = new Map(); const storage = { getItem: (k) => m.get(k) ?? null, setItem: (k, v) => m.set(k, v), removeItem: (k) => m.delete(k) };
  assert.equal(R.loadProgress("legs", storage), null);
  R.saveProgress("legs", { ...R.emptyProgress(), at: 2 }, storage);
  assert.equal(R.loadProgress("legs", storage).at, 2);
  R.clearProgress("legs", storage);
  assert.equal(R.loadProgress("legs", storage), null);
});

test("the log step starts from the plan's numbers and offers chips around them (YUI-304)", () => {
  const r = R.runnerPlan(steps); const m = r.moves[0];
  const s = R.logStart(m, R.emptyProgress());
  assert.deepEqual([s.reps, s.weight, s.timed, s.weightStep], [8, 135, false, 5]);
  assert.deepEqual(R.chipsAround(135, 5, 0, 500), [125, 130, 135, 140, 145]);
  assert.deepEqual(R.chipsAround(1, 1, 1, 30), [1, 2, 3]);
  assert.equal(R.logStart(R.runnerPlan([sets("p-sets", 2), slide("p-secs", 30)]).moves[0], R.emptyProgress()).timed, true);
});

test("'8 reps at 135' said out loud gives reps, then weight", () => {
  assert.deepEqual(R.hearRepsWeight("8 reps at 135"), { reps: 8, weight: 135 });
  assert.deepEqual(R.hearRepsWeight("ten reps"), null);
  assert.deepEqual(R.hearRepsWeight("12"), { reps: 12, weight: null });
});

test("logging a set ticks it, keeps its numbers, starts the rest and the next set starts where it ended", () => {
  const r = R.runnerPlan(steps); const m = r.moves[0];
  let p = R.logSet(r, R.emptyProgress(), m, "Set 1", { reps: 7, weight: 140 }, 1000);
  assert.deepEqual(p.ticked["e1-sets"], ["Set 1"]);
  assert.equal(p.values["e1-s1-reps"], 7);
  assert.equal(p.values["e1-s1-lb"], 140);
  assert.equal(R.restLeft(p.rest, 1000), 75);
  assert.equal(R.nextSet(p, m), "Set 2");
  assert.deepEqual([R.logStart(m, p).reps, R.logStart(m, p).weight], [7, 140]);
  p = R.logSet(r, p, m, "Set 2", { reps: 6, weight: 140 }, 90_000);
  assert.deepEqual(p.ticked["e1-sets"], ["Set 1", "Set 2"]);
  // the plan's answers carry the last numbers
  assert.deepEqual(R.answersOf(r, p), { "e1-sets": ["Set 1", "Set 2"], "e1-reps": 6, "e1-lb": 140 });
  p = R.logSet(r, p, m, "Set 3", { reps: 6, weight: 140 }, 200_000);
  assert.equal(R.nextSet(p, m), null);
  assert.equal(R.logTitle(m, "Set 2"), "Set 2 of 3 done");
});

test("a skipped move has no next set; +15s and Skip rest work on the logged rest", () => {
  const r = R.runnerPlan(steps); const m = r.moves[0];
  const skipped = R.toggle(R.emptyProgress(), "Skip", m).progress;
  assert.equal(R.nextSet(skipped, m), null);
  const p = R.logSet(r, R.emptyProgress(), m, "Set 1", { reps: 8, weight: 135 }, 0);
  assert.equal(R.restLeft(R.restAdd(p.rest, 15, 10_000), 10_000), 80);
  assert.equal(R.logSet(r, p, m, "Set 1", { reps: 9, weight: 135 }, 5_000).values["e1-reps"], 9);
});
