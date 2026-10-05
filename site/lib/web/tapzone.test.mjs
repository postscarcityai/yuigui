import test from "node:test";
import assert from "node:assert/strict";
import { tapTarget, isControl } from "./tapzone.mjs";

const box = { left: 0, width: 390, n: 4 };
test("the left third goes back", () => {
  assert.equal(tapTarget({ ...box, x: 10, at: 3 }), 2);
  assert.equal(tapTarget({ ...box, x: 129, at: 2 }), 1);
});
test("the rest goes forward", () => {
  assert.equal(tapTarget({ ...box, x: 130, at: 1 }), 2);
  assert.equal(tapTarget({ ...box, x: 380, at: 2 }), 3);
});
test("page 1 stays on a left tap, the last page stays on a right tap", () => {
  assert.equal(tapTarget({ ...box, x: 10, at: 1 }), null);
  assert.equal(tapTarget({ ...box, x: 380, at: 3 }), null);
});
test("the home and a single screen never page by tap", () => {
  assert.equal(tapTarget({ ...box, x: 10, at: 0 }), null);
  assert.equal(tapTarget({ ...box, x: 380, at: 0 }), null);
  assert.equal(tapTarget({ ...box, x: 380, at: 1, n: 1 }), null);
});
test("the zone is measured from the pager's own left edge", () => {
  assert.equal(tapTarget({ left: 400, width: 600, x: 500, at: 2, n: 4 }), 1);
  assert.equal(tapTarget({ left: 400, width: 600, x: 700, at: 2, n: 4 }), 3);
});
test("controls and selections keep their tap", () => {
  const el = (hit) => ({ closest: (s) => (hit && s.includes("button") ? {} : null) });
  assert.equal(isControl(el(true)), true);
  assert.equal(isControl(el(false)), false);
  assert.equal(isControl(el(false), "some words"), true);
  assert.equal(isControl(null), false);
});
