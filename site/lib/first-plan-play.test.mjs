import test from "node:test";
import assert from "node:assert/strict";
import { ASK, DEFAULTS, askLines, planLines, splitFor, startLines, today, wholeLines } from "./first-plan-play.mjs";
import { parse } from "./yl/yl.mjs";

const ok = (text) => assert.ok(parse(text).every((o) => o.op !== "error"), text);

test("every screen parses", () => {
  ASK.forEach((_, i) => ok(askLines(i)));
  ok(planLines({})); ok(startLines({})); ok(wholeLines({}));
});

test("days and gear change the split", () => {
  assert.equal(splitFor({ days: "2" }).length, 2);
  assert.equal(splitFor({ days: "6" }).length, 6);
  assert.equal(splitFor({ gear: "Bands" })[0][2], "Band press");
  assert.notDeepEqual(splitFor({ gear: "Barbell" }), splitFor({ gear: "Dumbbells" }));
});

test("kind and effort change the session", () => {
  assert.match(splitFor({})[0][1], /heavy/);
  assert.doesNotMatch(splitFor({ kind: "Lift and cardio" })[0][1], /heavy/);
  assert.match(today({ effort: "One rep short" }).body, /one rep short/);
  assert.deepEqual(splitFor({ effort: "Skip, use the default" }), splitFor(DEFAULTS));
});

test("the table is a real table with header cells", () => {
  const t = parse(planLines({})).find((o) => o.preset === "table");
  assert.deepEqual(t.props.cols, ["Day", "Session", "Lift"]);
});
