import test from "node:test";
import assert from "node:assert/strict";
import { ASK, SKIPPED, askLines, planLines, startLines, today, weekFor, wholeLines } from "./first-plan-play.mjs";
import { parse } from "./yl/yl.mjs";

const ok = (text) => assert.ok(parse(text).every((o) => o.op !== "error"), text);
const train = (a) => weekFor(a).filter((r) => r.focus !== "Rest");

test("the five questions match the app, in order", () => {
  assert.deepEqual(ASK.map((a) => a.q), ["What are we training for?", "How many days a week?", "How long per session?", "What do you have?", "How much have you lifted?"]);
  assert.deepEqual(ASK[3].options, ["Just me", "Bands", "Dumbbells", "Barbell", "A gym"]);
  for (const i of [0, 1, 2, 4]) assert.equal(ASK[i].options.at(-1), "Not sure");
  assert.ok(!ASK[3].options.includes("Not sure"));
});

test("every screen parses", () => {
  ASK.forEach((_, i) => ok(askLines(i)));
  ok(planLines({})); ok(startLines({})); ok(wholeLines({}));
});

test("each answer changes the built week", () => {
  const base = { goal: "Lift heavy", days: "4", time: "45 min", gear: "A gym", level: "Some experience" };
  const same = JSON.stringify(weekFor(base));
  for (const [k, v] of [["goal", "Mostly cardio"], ["days", "2"], ["time", "30 min"], ["gear", "Bands"], ["level", "Lifted for years"]]) {
    assert.notEqual(JSON.stringify(weekFor({ ...base, [k]: v })), same, k);
  }
  assert.equal(weekFor(base).length, 7);
  assert.equal(train({ days: "6" }).length, 6);
});

test("Not sure and Skip give the starter week", () => {
  assert.equal(train({}).length, 3);
  assert.deepEqual(weekFor({ goal: "Not sure", days: "Not sure" }), weekFor(SKIPPED));
  assert.match(today({ level: "Lifted for years" }).body, /failure/);
  assert.match(today({ level: "New to lifting" }).body, /ease in/i);
});

test("the table is a real table with header cells", () => {
  const t = parse(planLines({})).find((o) => o.preset === "table");
  assert.deepEqual(t.props.cols, ["Day", "Focus", "Time"]);
});
