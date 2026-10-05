// node --test lib/yl/tables.test.mjs   (YUI-296: the store the app, the playground and /web all apply, spec/TABLES.md)
import test from "node:test";
import assert from "node:assert/strict";
import { parse } from "./yl.mjs";
import { boundTables, emptyStore, LIMITS, query, replay, write } from "./tables.mjs";

const ctx = { today: "2026-10-05", now: "2026-10-05T09:30" };
const run = (text) => replay(emptyStore(), parse(text), ctx);

const WORKOUTS = `table create session Slot:number Move:text Sets:number Done:bool
put session 1 Slot=1 Move="Goblet squat" Sets=3
put session 2 Slot=2 Move="Split squat" Sets=3`;

test("table create and put build the rows in order, keyed", () => {
  const { store, errors } = run(WORKOUTS);
  assert.deepEqual(errors, []);
  const t = store.tables.session;
  assert.deepEqual(t.order, ["1", "2"]);
  assert.equal(t.rows["1"].Move, "Goblet squat");
  assert.equal(t.rows["2"].Sets, 3);
});

test("a put to a key changes that row only; an empty value clears the cell", () => {
  let { store } = run(WORKOUTS);
  store = write(store, { op: "put", table: "session", key: "1", values: { Done: true } }, ctx).store;
  assert.equal(store.tables.session.rows["1"].Done, true);
  assert.equal(store.tables.session.rows["1"].Move, "Goblet squat");
  assert.equal(store.tables.session.rows["2"].Done, undefined);
  store = write(store, { op: "put", table: "session", key: "1", values: { Done: "" } }, ctx).store;
  assert.equal("Done" in store.tables.session.rows["1"], false);
});

test("a put with no key appends r1, r2; delete takes the row out", () => {
  let { store } = run("table create log Note:text\nput log Note=a\nput log Note=b");
  assert.deepEqual(store.tables.log.order, ["r1", "r2"]);
  store = write(store, { op: "put", table: "log", key: "r1", delete: true }, ctx).store;
  assert.deepEqual(store.tables.log.order, ["r2"]);
  const again = write(store, { op: "put", table: "log", key: "gone", delete: true }, ctx);
  assert.equal(again.error, undefined);
});

test("a wrong value refuses the whole put and leaves the store as it was", () => {
  const { store } = run(WORKOUTS);
  const r = write(store, { op: "put", table: "session", key: "9", values: { Slot: 9, Sets: "lots" } }, ctx);
  assert.match(r.error, /Sets: "lots" is not a number/);
  assert.equal(r.store, store);
  assert.equal(write(store, { op: "put", table: "nope", key: "x", values: {} }, ctx).error, 'put: no table "nope"');
  assert.match(write(store, { op: "put", table: "session", key: "x", values: { Nope: 1 } }, ctx).error, /no column "Nope"/);
});

test("replay reports each refused line and keeps going", () => {
  const { store, errors } = run(`${WORKOUTS}\nput session 3 Sets=lots\nput session 4 Slot=4 Move=Row`);
  assert.equal(errors.length, 1);
  assert.match(errors[0].message, /not a number/);
  assert.deepEqual(store.tables.session.order, ["1", "2", "4"]);
});

test("table create on an existing table keeps its rows and converts a changed column", () => {
  let { store } = run("table create t A:text B:number\nput t k A=x B=5");
  store = write(store, { op: "table", name: "t", cols: [{ name: "A", type: "text" }, { name: "B", type: "text" }, { name: "C", type: "bool" }] }, ctx).store;
  assert.equal(store.tables.t.rows.k.B, "5");
  assert.equal(store.tables.t.rows.k.C, undefined);
});

test("the app's limits hold", () => {
  const big = { op: "table", name: "t", cols: Array.from({ length: LIMITS.cols + 1 }, (_, i) => ({ name: `c${i}`, type: "text" })) };
  assert.match(write(emptyStore(), big, ctx).error, /columns at most/);
  assert.match(write(emptyStore(), { op: "table", name: "1bad", cols: [{ name: "a", type: "text" }] }, ctx).error, /bad name/);
  assert.match(write(emptyStore(), { op: "table", name: "t", cols: [{ name: "key", type: "text" }] }, ctx).error, /row key/);
  let s = emptyStore();
  for (let i = 0; i < LIMITS.tables; i++) s = write(s, { op: "table", name: `t${i}`, cols: [{ name: "a", type: "text" }] }, ctx).store;
  assert.match(write(s, { op: "table", name: "extra", cols: [{ name: "a", type: "text" }] }, ctx).error, /tables per agent/);
  let t = write(emptyStore(), { op: "table", name: "t", cols: [{ name: "a", type: "text" }] }, ctx).store;
  t = { tables: { t: { ...t.tables.t, order: Array.from({ length: LIMITS.rows }, (_, i) => `k${i}`), rows: {} } } };
  assert.match(write(t, { op: "put", table: "t", key: "new", values: { a: "x" } }, ctx).error, /is full/);
  assert.match(write(t, { op: "put", table: "t", key: "k".repeat(LIMITS.key + 1), values: {} }, ctx).error, /1 to 64 characters/);
  assert.match(write(t, { op: "put", table: "t", key: "a", values: { a: "x".repeat(LIMITS.text + 1) } }, ctx).error, /over 1000 characters/);
});

test("date words resolve to the person's day", () => {
  const { store } = run("table create d Day:date\nput d a Day=today\nput d b Day=today-6\nput d c Day=now");
  assert.equal(store.tables.d.rows.a.Day, "2026-10-05");
  assert.equal(store.tables.d.rows.b.Day, "2026-09-29");
  assert.equal(store.tables.d.rows.c.Day, "2026-10-05T09:30");
});

test("query: where, sort, cols, limit, keys", () => {
  const { store } = run(`${WORKOUTS}\nput session 3 Slot=3 Move="Push-up" Sets=2 +Done`);
  const r = query(store, { table: "session", where: "Done=on", cols: ["Move", "Done"] }, ctx);
  assert.deepEqual(r.rows, [["Push-up", true]]);
  assert.deepEqual(r.keys, ["3"]);
  const s = query(store, { table: "session", sort: "-Slot", limit: 2 }, ctx);
  assert.deepEqual(s.keys, ["3", "2"]);
  assert.equal(s.count, 3);
  assert.deepEqual(query(store, { table: "nope" }, ctx), { missing: "nope" });
  assert.match(query(store, { table: "session", where: "Nope=1" }, ctx).error, /no column/);
});

test("query: group and aggregates have no row keys", () => {
  const { store } = run("table create l Lift:text W:number\nput l a Lift=Squat W=200\nput l b Lift=Squat W=220\nput l c Lift=Bench W=150");
  const r = query(store, { table: "l", group: "Lift", max: "W", count: true, sort: "-W" }, ctx);
  assert.deepEqual(r.rows, [["Squat", 220, 2], ["Bench", 150, 1]]);
  assert.deepEqual(r.keys, [null, null]);
});

test("boundTables hands the renderers cols, rows in order and units", () => {
  const { store } = run("table create m Food:text Cal:number:kcal\nput m a Food=Oats Cal=300");
  assert.deepEqual(boundTables(store).m, { cols: ["Food", "Cal"], rows: [["Oats", 300]], units: ["", "kcal"] });
});

test("a store is never changed in place", () => {
  const { store } = run(WORKOUTS);
  const before = JSON.stringify(store);
  write(store, { op: "put", table: "session", key: "1", values: { Done: true } }, ctx);
  write(store, { op: "put", table: "session", key: "2", delete: true }, ctx);
  assert.equal(JSON.stringify(store), before);
});
