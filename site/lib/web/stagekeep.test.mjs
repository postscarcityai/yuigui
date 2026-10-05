import { test } from "node:test";
import assert from "node:assert/strict";
import { anonymous, keepScope, keepable, secretField } from "./stagekeep.mjs";
import { dropRun, heldForm, heldRun, heldSlide, holdForm, holdRun, holdSlide, keeps } from "./kept.mjs";

const mem = () => { const m = new Map(); return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), removeItem: (k) => m.delete(k), key: (i) => [...m.keys()][i], get length() { return m.size; } }; };

test("a named component is kept under its name, an anonymous one under its message", () => {
  assert.equal(keepScope("m1", "kit"), "kit");
  assert.equal(keepScope("m1", "n3"), "m1.n3");
  assert.equal(keepScope("m2", "n3"), "m2.n3");
  assert.equal(keepScope("", "n3"), "");
  assert.equal(keepScope(null, undefined), "");
  assert.equal(anonymous("n12"), true);
  assert.equal(anonymous("plan@kit"), false);
});

test("an anonymous plan keeps its step and answers per message, and Send clears it", () => {
  const st = mem();
  const a = keepScope("m1", "n3"), b = keepScope("m2", "n3");
  assert.equal(keeps("penny", a), true);
  holdRun("penny", a, { at: 1, ans: { q1: "M" } }, st);
  assert.deepEqual(heldRun("penny", a, ["q1"], st).ans, { q1: "M" });
  assert.equal(heldRun("penny", b, ["q1"], st), null);
  holdForm("penny", a, "n2", { name: "Al" }, st);
  holdSlide("penny", a, "n5", 7, st);
  assert.deepEqual(heldForm("penny", a, "n2", ["name"], st), { name: "Al" });
  assert.equal(heldSlide("penny", a, "n5", 0, 10, st), 7);
  assert.equal(heldSlide("penny", a, "n5", 0, 5, st), null);
  dropRun("penny", a, st);
  assert.equal(st.length, 0);
});

test("a form on its own with an anonymous id keeps nothing", () => {
  const st = mem();
  holdForm("penny", "", "n2", { name: "Al" }, st);
  assert.equal(st.length, 0);
  holdSlide("penny", "", "n5", 7, st);
  assert.equal(st.length, 0);
});

test("a secret field is never kept", () => {
  const fields = [{ key: "name", type: "text" }, { key: "api_key", type: "text" }, { key: "pw", type: "password" }, { key: "otp_code", label: "Code" }, { key: "notes" }];
  assert.deepEqual(fields.filter(secretField).map((f) => f.key), ["api_key", "pw", "otp_code"]);
  assert.deepEqual(keepable(fields, { name: "Al", api_key: "sk-1", pw: "x", otp_code: "123", notes: "hi" }), { name: "Al", notes: "hi" });
});

test("private mode or a full store fails quietly", () => {
  const boom = { getItem() { throw new Error("denied"); }, setItem() { throw new Error("full"); }, removeItem() { throw new Error("x"); }, key() { return null; }, length: 0 };
  const a = keepScope("m1", "n3");
  assert.doesNotThrow(() => { holdRun("penny", a, { at: 0, ans: {} }, boom); holdForm("penny", a, "n2", { x: 1 }, boom); holdSlide("penny", a, "n5", 3, boom); dropRun("penny", a, boom); });
  assert.equal(heldRun("penny", a, [], boom), null);
  assert.deepEqual(heldForm("penny", a, "n2", ["x"], boom), {});
  assert.equal(heldSlide("penny", a, "n5", 0, 9, boom), null);
});
