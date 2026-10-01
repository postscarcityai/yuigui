// node --test site/lib/yl/flow-run.test.mjs (SITE-144): a flow run resumes after a reload; an unknown name gets a way on.
import assert from "node:assert/strict";
import test from "node:test";
import { LIBRARY_HREF, closestFlows, loadRun, missingFlow, runKey, saveRun } from "./flow-run.mjs";

const mem = () => { const m = new Map(); return { getItem: (k) => m.get(k) ?? null, setItem: (k, v) => m.set(k, String(v)) }; };
const ids = ["kind", "goal", "pages"];

test("a reload resumes on the same step with the answers kept", () => {
  const s = mem();
  const key = runKey("flow1", "website-intake");
  saveRun(s, key, { at: "goal", ans: { kind: "Takeout" }, fromReview: false, done: false });
  assert.deepEqual(loadRun(s, key, ids), { at: "goal", ans: { kind: "Takeout" }, fromReview: false, done: false });
  // Another message or flow id does not see it.
  assert.equal(loadRun(s, runKey("flow2", "website-intake"), ids), null);
  assert.equal(loadRun(s, runKey("flow1", "first-plan"), ids), null);
});

test("a flow already sent stays sent after a reload", () => {
  const s = mem();
  const key = runKey("flow1", "website-intake");
  saveRun(s, key, { at: "pages", ans: { kind: "Both", goal: "Call" }, done: true });
  const r = loadRun(s, key, ids);
  assert.equal(r.done, true);
  assert.deepEqual(r.ans, { kind: "Both", goal: "Call" });
});

test("steps the flow no longer has are dropped, junk is ignored", () => {
  const s = mem();
  const key = runKey("m", "f");
  saveRun(s, key, { at: "gone", ans: { kind: "A", gone: "x" }, done: false });
  assert.deepEqual(loadRun(s, key, ids), { at: null, ans: { kind: "A" }, fromReview: false, done: false });
  s.setItem(key, "{not json");
  assert.equal(loadRun(s, key, ids), null);
  assert.equal(loadRun(null, key, ids), null);
});

test("the review step resumes too", () => {
  const s = mem();
  saveRun(s, "k", { at: "review", ans: {}, fromReview: true });
  assert.equal(loadRun(s, "k", ids).at, "review");
});

test("an unknown name renders a way on: the library and the closest names", () => {
  const m = missingFlow("website intake form");
  assert.match(m.note, /No saved flow by that name/);
  assert.equal(m.library.href, LIBRARY_HREF);
  assert.equal(m.near[0], "website-intake");
  assert.ok(m.near.length >= 1 && m.near.length <= 3);
  assert.equal(closestFlows("restaurant")[0], "restaurant-intake");
  assert.ok(closestFlows("").length > 0);
});
