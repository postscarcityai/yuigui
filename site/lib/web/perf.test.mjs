import test from "node:test";
import assert from "node:assert/strict";
import { frameStats, hudLine, pageTimings } from "./perf.mjs";

test("60 frames a second reads 60 with a 17 ms worst frame", () => {
  const stamps = Array.from({ length: 61 }, (_, i) => Math.round(i * (1000 / 60)));
  const s = frameStats(stamps);
  assert.equal(s.fps, 60);
  assert.ok(s.worst <= 17);
});

test("one long frame shows as the worst", () => {
  assert.deepEqual(frameStats([0, 16, 32, 132, 148]), { fps: 27, worst: 100 });
});

test("under two frames there is nothing to say", () => {
  assert.deepEqual(frameStats([5]), { fps: null, worst: null });
  assert.deepEqual(frameStats(null), { fps: null, worst: null });
});

test("the line carries what it has", () => {
  assert.equal(hudLine({ fps: 59, worst: 20 }, { fcp: 812.4, longest: 61 }), "59 fps · worst 20 ms · paint 812 ms · long task 61 ms");
  assert.equal(hudLine({ fps: null, worst: null }), "- fps");
});

test("page timings read the entries the browser has", () => {
  const perf = { getEntriesByName: () => [{ startTime: 300 }], getEntriesByType: () => [{ duration: 70 }, { duration: 90 }] };
  assert.deepEqual(pageTimings(perf), { fcp: 300, longest: 90 });
  assert.deepEqual(pageTimings(null), { fcp: null, longest: null });
});
