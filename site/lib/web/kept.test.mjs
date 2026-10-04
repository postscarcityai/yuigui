import test from "node:test";
import assert from "node:assert/strict";
import * as K from "./kept.mjs";

const mem = () => { const m = new Map(); return { getItem: (k) => m.get(k) ?? null, setItem: (k, v) => m.set(k, v), removeItem: (k) => m.delete(k), key: (i) => [...m.keys()][i] ?? null, get length() { return m.size; }, m }; };

test("only a component the agent named is kept", () => {
  assert.equal(K.keeps("penny", "aisle-produce"), true);
  assert.equal(K.keeps("penny", "n3"), false);
  assert.equal(K.keeps("", "aisle"), false);
  assert.equal(K.keeps("penny", ""), false);
});

test("list ticks survive a reload, an untick removes, a removed item is dropped for good", () => {
  const s = mem();
  K.setTick("penny", "aisle", "Milk", true, s);
  K.setTick("penny", "aisle", "Eggs", true, s);
  assert.deepEqual([...K.ticked("penny", "aisle", ["Milk", "Eggs", "Bread"], s)].sort(), ["Eggs", "Milk"]);
  K.setTick("penny", "aisle", "Milk", false, s);
  assert.deepEqual([...K.ticked("penny", "aisle", ["Milk", "Eggs"], s)], ["Eggs"]);
  // the agent drew the list again without Eggs
  K.pruneTicks("penny", "aisle", ["Milk", "Bread"], s);
  assert.equal(s.m.has("yui.ticks.penny.aisle"), false);
  assert.deepEqual([...K.ticked("penny", "aisle", ["Eggs"], s)], []);
  // another agent's list of the same name is its own
  K.setTick("arnold", "aisle", "Milk", true, s);
  assert.equal(K.ticked("penny", "aisle", ["Milk"], s).size, 0);
  // unnamed lists keep nothing
  K.setTick("penny", "n1", "Milk", true, s);
  assert.equal(K.ticked("penny", "n1", ["Milk"], s).size, 0);
});

test("a loop draft sits on the loop the agent drew and goes when the agent draws another", () => {
  const s = mem();
  const base = K.loopBase({ p: ["x...", "..x."], rows: ["kick", "snare"], steps: 4, bpm: 96, swing: 0 });
  assert.equal(base, "x...|..x.;kick|snare;4;96;0");
  assert.equal(K.draft("gouda", "beat", base, s), null);
  K.setDraft("gouda", "beat", { base, p: ["xx..", "..x."], bpm: 100, swing: 25 }, s);
  assert.deepEqual(K.draft("gouda", "beat", base, s), { base, p: ["xx..", "..x."], bpm: 100, swing: 25 });
  const other = K.loopBase({ p: ["x...", "x..."], rows: ["kick", "snare"], steps: 4, bpm: 96, swing: 0 });
  assert.equal(K.draft("gouda", "beat", other, s), null);
  K.pruneDraft("gouda", "beat", other, s);
  assert.equal(s.m.has("yui.loop.gouda.beat"), false);
  K.setDraft("gouda", "beat", { base, p: ["x..."], bpm: 90, swing: 0 }, s);
  K.clearDraft("gouda", "beat", s);
  assert.equal(K.draft("gouda", "beat", base, s), null);
});

test("a flow or plan in progress comes back per agent and id, and Send drops it with its forms and mics", () => {
  const s = mem();
  K.holdRun("penny", "kit", { at: "who", ans: { who: { name: "Al" }, gone: 1 }, fromReview: false }, s);
  K.holdForm("penny", "kit", "who", { name: "Al", old: "x" }, s);
  K.holdMic("penny", "kit", "say", { text: "hello", typed: "he" }, s);
  assert.deepEqual(K.heldRun("penny", "kit", ["who", "size"], s), { at: "who", ans: { who: { name: "Al" } }, fromReview: false });
  assert.equal(K.heldRun("penny", "kit", ["size"], s).at, null); // the step is gone: start at the first
  assert.deepEqual(K.heldForm("penny", "kit", "who", ["name"], s), { name: "Al" });
  assert.deepEqual(K.heldMic("penny", "kit", "say", s), { text: "hello", typed: "he" });
  // a plan keeps its place as a number
  K.holdRun("penny", "plan1", { at: 2, ans: {} }, s);
  assert.equal(K.heldRun("penny", "plan1", [], s).at, 2);
  // another agent, another flow
  assert.equal(K.heldRun("arnold", "kit", ["who"], s), null);
  K.holdForm("penny", "other", "who", { name: "Bo" }, s);
  K.dropRun("penny", "kit", s);
  assert.equal(K.heldRun("penny", "kit", ["who"], s), null);
  assert.deepEqual(K.heldForm("penny", "kit", "who", ["name"], s), {});
  assert.deepEqual(K.heldMic("penny", "kit", "say", s), { text: "", typed: "" });
  assert.deepEqual(K.heldForm("penny", "other", "who", ["name"], s), { name: "Bo" });
  // unnamed flows and a mic outside a flow keep nothing
  K.holdRun("penny", "n2", { at: 1, ans: {} }, s);
  assert.equal(K.heldRun("penny", "n2", [], s), null);
  K.holdMic("penny", "", "say", { text: "x", typed: "" }, s);
  assert.deepEqual(K.heldMic("penny", "", "say", s), { text: "", typed: "" });
  // emptied fields remove the entry
  K.holdForm("penny", "other", "who", {}, s);
  assert.equal(s.m.has("yui.form.penny.other.who"), false);
});
