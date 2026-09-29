// node --test lib/chat/when.test.mjs (TZ pinned so the days are the same everywhere)
process.env.TZ = "America/New_York";
import test from "node:test";
import assert from "node:assert/strict";
const { clock, dayLabel, stageTime, stamps } = await import("./when.mjs");

const at = (y, mo, d, h, mi) => new Date(y, mo - 1, d, h, mi).getTime();
const NOW = at(2026, 9, 29, 10, 0);

test("day labels", () => {
  assert.equal(dayLabel(at(2026, 9, 29, 0, 5), NOW), "Today");
  assert.equal(dayLabel(at(2026, 9, 28, 23, 59), NOW), "Yesterday");
  assert.equal(dayLabel(at(2026, 9, 27, 12, 0), NOW), "Sun 27 Sep");
  assert.equal(dayLabel(at(2026, 9, 21, 12, 0), NOW), "Mon 21 Sep");
  assert.equal(dayLabel(at(2025, 12, 31, 12, 0), NOW), "Wed 31 Dec 2025");
});

test("clock and stage time", () => {
  assert.match(clock(at(2026, 9, 29, 9, 41)), /^9:41\s?AM$/i);
  assert.match(stageTime(at(2026, 9, 29, 9, 41), NOW), /^9:41\s?AM$/i);
  assert.match(stageTime(at(2026, 9, 28, 21, 5), NOW), /^Yesterday 9:05\s?PM$/i);
  assert.match(stageTime(at(2026, 9, 24, 8, 0), NOW), /^Thu 24 Sep, 8:00\s?AM$/i);
  assert.equal(stageTime(undefined, NOW), "");
});

test("a divider where the day changes, a time under each run", () => {
  const m = [
    { role: "user", content: "a", at: at(2026, 9, 28, 20, 0) },
    { role: "assistant", content: "b", at: at(2026, 9, 28, 20, 1) },
    { role: "assistant", content: "b2", at: at(2026, 9, 28, 20, 2) },
    { role: "user", content: "c", at: at(2026, 9, 29, 9, 30) },
    { card: "stopped", at: at(2026, 9, 29, 9, 31) },
    { role: "user", content: "d", at: at(2026, 9, 29, 9, 32) },
  ];
  const s = stamps(m, NOW);
  assert.equal(s[0].day, "Yesterday");
  assert.equal(s[3].day, "Today");
  assert.equal(s.filter((x) => x.day).length, 2);
  assert.ok(s[0].time && !s[1].time && s[2].time);   // user run, then the assistant run ends at index 2
  assert.ok(!s[3].time && !s[4].time && s[5].time);  // the card does not break the user run
});

test("messages from before this have no time and no divider", () => {
  const s = stamps([{ role: "user", content: "old" }, { role: "assistant", content: "older" }], NOW);
  assert.deepEqual(s, [{}, {}]);
  const mixed = stamps([{ role: "user", content: "old" }, { role: "user", content: "new", at: NOW }], NOW);
  assert.equal(mixed[1].day, "Today");
});
