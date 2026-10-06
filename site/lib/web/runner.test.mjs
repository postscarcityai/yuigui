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

// ---- YUI-309: edits on the fly, mirroring WorkoutEditsTests.swift ----
const wk = [
  { id: "pg", preset: "page", props: { body: "Rest 60 s" } },
  { id: "e1-sets", preset: "pick", props: { title: "Back squat", options: ["Set 1", "Set 2", "Set 3", "Skip"] } },
  { id: "e1-reps", preset: "slide", props: { value: 8, min: 1, max: 30 } },
  { id: "e1-lb", preset: "slide", props: { value: 135, unit: "lb", step: 5 } },
  { id: "e2-sets", preset: "pick", props: { title: "Plank", options: ["Set 1", "Set 2", "Skip"] } },
  { id: "e2-secs", preset: "slide", props: { value: 30, step: 5 } },
];
const rp = () => R.runnerPlan(wk);
const first = (r) => r.moves[0];

test("swap renames the move and keeps its sets, numbers and the cue goes", () => {
  const r = rp();
  const p = R.swapMove(r, R.emptyProgress(), first(r), "Leg press");
  const live = R.applyEdits(r, p.edits);
  assert.equal(R.nameOf(live.moves[0]), "Leg press");
  assert.deepEqual(live.moves[0].labels, ["Set 1", "Set 2", "Set 3"]);
  assert.equal(live.moves[0].nudges.length, 2);
  assert.deepEqual(R.changesOf(r, p), ["Swapped Back squat for Leg press"]);
  // Swapping back to the plan's own move leaves no edit.
  const back = R.swapMove(r, p, first(r), "Back squat");
  assert.equal(back.edits, null);
  assert.deepEqual(R.changesOf(r, back), []);
});

test("sets, reps and weight edits are the move's numbers from here, and say what they were", () => {
  const r = rp(); let p = R.emptyProgress();
  p = R.setSets(r, p, first(r), 4);
  p = R.setReps(r, p, first(r), 10);
  p = R.setWeight(r, p, first(r), 145);
  assert.equal(R.applyEdits(r, p.edits).moves[0].labels.length, 4);
  assert.equal(p.values["e1-reps"], 10);
  assert.equal(p.values["e1-lb"], 145);
  assert.deepEqual(R.changesOf(r, p), ["Back squat: 4 sets (was 3)", "Back squat: 10 reps (was 8)", "Back squat: 145 lb (was 135 lb)"]);
  // Timed moves say seconds.
  const q = R.setReps(r, R.emptyProgress(), r.moves[1], 45);
  assert.deepEqual(R.changesOf(r, q), ["Plank: 45s (was 30s)"]);
  // Back to the plan's number: no change left, and the number is the plan's again.
  const undone = R.setReps(r, R.setSets(r, p, first(r), 3), first(r), 8);
  assert.deepEqual(R.changesOf(r, undone), ["Back squat: 145 lb (was 135 lb)"]);
  assert.equal(undone.values["e1-reps"], 8);
});

test("a cut set drops what was ticked past it", () => {
  const r = rp(); let p = R.emptyProgress();
  p = R.toggle(p, "Set 3", first(r)).progress;
  p = R.setSets(r, p, first(r), 2);
  assert.deepEqual(p.ticked["e1-sets"], []);
});

test("add appends after the move, with its own ids; the edits line says Added NxR", () => {
  const r = rp();
  let p = R.addMove(r, R.emptyProgress(), first(r), "Lunge");
  const live = R.applyEdits(r, p.edits);
  assert.deepEqual(live.moves.map(R.tagOf), ["e1", "add1", "e2"]);
  assert.deepEqual(live.moves[1].nudges.map((n) => n.id), ["add1-reps"]);
  assert.deepEqual(R.changesOf(r, p), ["Added Lunge 3x10"]);
  // Two adds after the same move keep the order they came in; a timed one starts at 30.
  p = R.addMove(r, p, first(r), "Side plank");
  assert.deepEqual(R.applyEdits(r, p.edits).moves.map(R.tagOf), ["e1", "add1", "add2", "e2"]);
  // Its numbers are its own: editing them rewrites the line, not a change on top.
  p = R.setSets(r, p, live.moves[1], 4);
  p = R.setReps(r, p, live.moves[1], 12);
  assert.deepEqual(R.changesOf(r, p), ["Added Lunge 4x12", "Added Side plank 3x30"]);
  assert.deepEqual(R.withAdded(wk.filter((s) => !r.absorbed.has(s.id)), p.edits).map((s) => s.id), ["pg", "e1-sets", "add1-sets", "add2-sets", "e2-sets"]);
  assert.equal(R.nextTag(p.edits), "add3");
});

test("skip marks the move's own answer and drops its change lines", () => {
  const r = rp();
  let p = R.setReps(r, R.emptyProgress(), first(r), 12);
  p = R.skipMove(p, first(r));
  assert.equal(R.isSkipped(p, first(r)), true);
  assert.deepEqual(R.changesOf(r, p), []);
  assert.deepEqual(R.answersOf(r, p)["e1-sets"], ["Skip"]);
  assert.equal(R.isSkipped(R.skipMove(p, first(r)), first(r)), false);
  // A move with no Skip has no way to skip.
  const none = R.runnerPlan([{ id: "a-sets", preset: "pick", props: { options: ["Set 1", "Set 2"] } }]);
  assert.equal(R.skipMove(R.emptyProgress(), none.moves[0]).ticked["a-sets"], undefined);
});

test("the plan's answer carries `edits` exactly, plus the added move's own ids", () => {
  const r = rp();
  let p = R.swapMove(r, R.emptyProgress(), first(r), "Leg press");
  p = R.addMove(r, p, first(r), "Lunge");
  const a = R.answersOf(r, p);
  assert.deepEqual(a.edits, ["Swapped Back squat for Leg press", "Added Lunge 3x10"]);
  assert.equal(a["add1-reps"], 10);
  assert.equal(a["e1-reps"], 8);
  // No edits, no `edits` key: the answer is what it was.
  assert.equal("edits" in R.answersOf(r, R.emptyProgress()), false);
});

test("alternates by move, and the usual fillers", () => {
  assert.deepEqual(R.alternates("Back squat"), ["Leg press", "Split squat", "Box squat"]);
  assert.deepEqual(R.alternates("Farmer carry"), ["Push-up", "Goblet squat", "Plank"]);
  assert.deepEqual(R.EXTRAS, ["Lunge", "Plank", "Burpee", "Curl"]);
});

test("the music strip shows only when something plays, and only buttons with something behind them", () => {
  assert.equal(R.nowPlaying(null, null), null);
  assert.equal(R.nowPlaying({ playbackState: "none" }, { paused: true, ended: false, currentTime: 0 }), null);
  const a = R.nowPlaying({ metadata: { title: "Run", artist: "Air" } }, { paused: false, ended: false, currentTime: 3 }, { nexttrack() {} });
  assert.deepEqual(a, { title: "Run", artist: "Air", playing: true, canToggle: true, canNext: true });
  const b = R.nowPlaying({ playbackState: "paused" }, null, {});
  assert.deepEqual(b, { title: "Music", artist: "", playing: false, canToggle: false, canNext: false });
});
