// The drawn phone's loop (YUI-267 web): which side is on show, its badge and its numbered notes.
import assert from "node:assert/strict";
import { test } from "node:test";
import { PHONE_HOLD_MS, phoneBadge, phoneNotes, phoneSide } from "./sketchphone.mjs";

test("the phone plays before, then after, and loops", () => {
  const seen = [0, 1, 2, 3, 4].map((t) => phoneSide(t, true, false));
  assert.deepEqual(seen, [0, 1, 0, 1, 0]);
  assert.ok(PHONE_HOLD_MS >= 2500 && PHONE_HOLD_MS <= 3500, "about 3 s a side");
});

test("reduced motion holds the after, whatever the tick", () => {
  for (let t = 0; t < 4; t++) assert.equal(phoneSide(t, true, true), 1);
});

test("a sketch with no after is one side and has no badge", () => {
  for (let t = 0; t < 3; t++) assert.equal(phoneSide(t, false, false), 0);
  assert.equal(phoneSide(5, false, true), 0);
  assert.equal(phoneBadge(0, false, "Before", "After"), null);
});

test("the badge is red BEFORE, then green AFTER with the after line's label", () => {
  assert.deepEqual(phoneBadge(0, true, "Before", "Now"), { text: "Before", tone: "bad", icon: "x" });
  assert.deepEqual(phoneBadge(1, true, "Before", "Now"), { text: "Now", tone: "good", icon: "check" });
});

test("notes are numbered per side, in row order", () => {
  const before = [{ text: "a", note: "old" }, { text: "b" }, { text: "c", note: "gone", x: true }];
  const after = [{ text: "d", note: "new" }];
  assert.deepEqual(phoneNotes(before), [
    { row: 0, n: 1, note: "old", x: false },
    { row: 2, n: 2, note: "gone", x: true },
  ]);
  assert.deepEqual(phoneNotes(after), [{ row: 0, n: 1, note: "new", x: false }]);
  assert.deepEqual(phoneNotes([{ text: "plain" }]), []);
});
