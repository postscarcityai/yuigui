import test from "node:test";
import assert from "node:assert/strict";
import { basesToSend, pickable, rowLabel, startTitle, toggled, yuiOf } from "./crewpick.mjs";

const crew = [
  { base: "yui", name: "Yui", role: "Helper and maker" },
  { base: "arnold", name: "Arnold", role: "Trainer" },
  { base: "basil", name: "Basil", role: "Cook" },
  { base: "penny", name: "Penny", role: "Planner" },
];

test("Yui is on the crew, not on the list to pick", () => {
  assert.deepEqual(pickable(crew).map((s) => s.base), ["arnold", "basil", "penny"]);
  assert.equal(yuiOf(crew).name, "Yui");
  assert.equal(yuiOf([]).base, "yui");
});

test("the button counts the picks", () => {
  assert.equal(startTitle(0), "Start with Yui");
  assert.equal(startTitle(2), "Start with Yui and 2");
});

test("a tap adds, a second tap takes it back out", () => {
  const a = toggled(new Set(), "basil");
  assert.deepEqual([...a], ["basil"]);
  assert.deepEqual([...toggled(a, "basil")], []);
});

test("the bases go in the crew's order, whatever the order of the taps", () => {
  assert.deepEqual(basesToSend(crew, new Set(["penny", "arnold", "ghost"])), ["arnold", "penny"]);
});

test("the label says what a tap does", () => {
  assert.equal(rowLabel(crew[1], false), "Add Arnold, Trainer");
  assert.equal(rowLabel(crew[1], true), "Arnold, added");
});
