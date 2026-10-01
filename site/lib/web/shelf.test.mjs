import test from "node:test";
import assert from "node:assert/strict";
import { loadRemoved, remove, shelfOf } from "./shelf.mjs";

const reply = (at, ...ops) => ({ id: `m${at}#0`, role: "agent", at, ops });
const save = (name, screen = "1") => ({ op: "save", name, screen });
const forget = (name) => ({ op: "forget", name });

test("newest save first, a save again replaces, forget takes it off", () => {
  const s = shelfOf([reply(1, save("workout")), reply(2, save("plan")), reply(3, save("workout")), reply(4, forget("plan"))]);
  assert.deepEqual(s.map((x) => x.name), ["workout"]);
  assert.equal(s[0].at, 3);
  assert.deepEqual(shelfOf([reply(1, save("a")), reply(2, save("b"))]).map((x) => x.name), ["b", "a"]);
});

test("a screen saved from the stage opens on the stage again", () => {
  assert.equal(shelfOf([reply(1, save("hiit", "full"))])[0].stage, true);
  assert.equal(shelfOf([reply(1, save("hiit", "2"))])[0].stage, false);
});

test("forgetting a name never saved does nothing; history in any order lands the same", () => {
  assert.deepEqual(shelfOf([reply(1, forget("ghost"))]), []);
  const a = shelfOf([reply(2, save("x")), reply(1, save("x"))]);
  assert.equal(a[0].at, 2);
});

test("a name the person removed stays off until the agent saves it after that", () => {
  const msgs = [reply(10, save("workout"))];
  assert.deepEqual(shelfOf(msgs, { workout: 10 }), []);
  assert.deepEqual(shelfOf(msgs, { workout: 20 }), []);
  assert.deepEqual(shelfOf([...msgs, reply(30, save("workout"))], { workout: 20 }).map((x) => x.name), ["workout"]);
});

test("other agents' copies and the person's own rows never reach the shelf", () => {
  const m = [{ ...reply(1, save("x")), from: { name: "Basil" } }, { id: "u", role: "user", at: 1 }];
  assert.deepEqual(shelfOf(m), []);
});

test("removals are kept per agent in storage", () => {
  const mem = new Map();
  const storage = { getItem: (k) => mem.get(k) ?? null, setItem: (k, v) => mem.set(k, v) };
  assert.deepEqual(loadRemoved("A1", storage), {});
  remove("A1", "workout", 5, storage);
  assert.deepEqual(loadRemoved("a1", storage), { workout: 5 });
  assert.deepEqual(loadRemoved("b2", storage), {});
});
