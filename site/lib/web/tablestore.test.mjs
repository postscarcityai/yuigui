// node --test lib/web/tablestore.test.mjs   (YUI-296: agent tables kept in this browser, per person and agent)
import test from "node:test";
import assert from "node:assert/strict";
import { parse } from "../yl/yl.mjs";
import { query } from "../yl/tables.mjs";
import { createTables, wipe, DB } from "./tablestore.mjs";

// The smallest IndexedDB the store needs: named stores of key -> value, transactions that finish on a later tick.
function fakeIdb() {
  const dbs = new Map();
  const later = (fn) => setTimeout(fn, 0);
  return {
    dbs,
    deleteDatabase(name) { dbs.delete(name); return {}; },
    open(name) {
      const req = {};
      later(() => {
        let data = dbs.get(name);
        const fresh = !data;
        if (fresh) dbs.set(name, (data = {}));
        const db = {
          createObjectStore: (s) => { data[s] = new Map(); },
          close() {},
          transaction(stores) {
            const tx = {};
            const names = [].concat(stores);
            const done = () => later(() => tx.oncomplete?.());
            tx.objectStore = (s) => ({
              get: (k) => { const r = { result: undefined }; later(() => { r.result = data[s].get(k); }); done(); return r; },
              put: (v, k) => { data[s].set(k, structuredClone(v)); done(); return {}; },
              clear: () => { data[s].clear(); done(); return {}; },
              delete: (k) => { data[s].delete(k); done(); return {}; },
            });
            void names;
            return tx;
          },
        };
        req.result = db;
        if (fresh) req.onupgradeneeded?.();
        req.onsuccess?.();
      });
      return req;
    },
  };
}

const ops = (text) => parse(text);
const WORKOUT = `table create session Slot:number Move:text Done:bool
put session 1 Slot=1 Move="Goblet squat"
put session 2 Slot=2 Move="Split squat"
query session sort=Slot as list check=Done "Today"`;
const settle = () => new Promise((r) => setTimeout(r, 30));
const tables = (idb, userId = "u1") => createTables({ userId, idb });

test("a reply's lines write the store; a tick is kept across a reload", async () => {
  const idb = fakeIdb();
  const a = tables(idb).agent("arnold");
  await a.loaded;
  a.file("m1#0", ops(WORKOUT));
  assert.deepEqual(a.store.tables.session.order, ["1", "2"]);
  a.set("session", "1", { Done: true });
  await settle();
  // A new page: a new instance on the same database.
  const b = tables(idb).agent("arnold");
  await b.loaded;
  assert.equal(b.store.tables.session.rows["1"].Done, true);
  const r = query(b.store, { table: "session", sort: "Slot" });
  assert.deepEqual(r.rows.map((x) => x[2]), [true, null]);
});

test("the same reply loaded again writes nothing: a tick is not written over", async () => {
  const idb = fakeIdb();
  const a = tables(idb).agent("arnold");
  await a.loaded;
  a.file("m1#0", ops(WORKOUT));
  a.set("session", "2", { Done: true });
  await settle();
  const b = tables(idb).agent("arnold");
  await b.loaded;
  b.file("m1#0", ops(WORKOUT)); // the thread loads the old reply again
  assert.equal(b.store.tables.session.rows["2"].Done, true);
  // A new reply is filed, and its put does swap the move.
  b.file("m2#0", ops('put session 2 Move="Reverse lunge"'));
  assert.equal(b.store.tables.session.rows["2"].Move, "Reverse lunge");
  assert.equal(b.store.tables.session.rows["2"].Done, true);
});

test("lines filed before the disk answers wait for it, then go in order", async () => {
  const idb = fakeIdb();
  const a = tables(idb).agent("arnold");
  await a.loaded;
  a.file("m1#0", ops(WORKOUT));
  a.set("session", "1", { Done: true });
  await settle();
  const b = tables(idb).agent("arnold");
  let told = null;
  b.file("m1#0", ops(WORKOUT), { done: (r) => { told = r; } }); // before load() resolves
  assert.equal(b.ready, false);
  await b.loaded;
  assert.deepEqual(told, []);
  assert.equal(b.store.tables.session.rows["1"].Done, true);
});

test("a refused put is handed back once, with the line and the key, and nothing is half written", async () => {
  const a = tables(fakeIdb()).agent("arnold");
  await a.loaded;
  let told = null;
  a.file("m1#0", ops("table create t N:number\nput t x N=lots\nput t y N=2"), { done: (r) => { told = r; } });
  assert.equal(told.length, 1);
  assert.deepEqual({ table: told[0].table, key: told[0].key }, { table: "t", key: "x" });
  assert.match(told[0].message, /not a number/);
  assert.match(told[0].line, /put t x N=lots/);
  assert.deepEqual(a.store.tables.t.order, ["y"]);
  let again = null;
  a.file("m1#0", ops("put t z N=lots"), { done: (r) => { again = r; } }); // same reply id: not told twice
  assert.deepEqual(again, []);
});

test("one agent's tables never reach another agent or another person", async () => {
  const idb = fakeIdb();
  const arnold = tables(idb).agent("arnold");
  await arnold.loaded;
  arnold.file("m1#0", ops(WORKOUT));
  await settle();
  const basil = tables(idb).agent("basil");
  await basil.loaded;
  assert.deepEqual(basil.store.tables, {});
  const other = tables(idb, "u2").agent("arnold");
  await other.loaded;
  assert.deepEqual(other.store.tables, {});
});

test("removing an agent removes its tables; sign out wipes every agent's", async () => {
  const idb = fakeIdb();
  const root = tables(idb);
  const arnold = root.agent("arnold");
  const basil = root.agent("basil");
  await Promise.all([arnold.loaded, basil.loaded]);
  arnold.file("m1#0", ops(WORKOUT));
  basil.file("m2#0", ops("table create t A:text"));
  await settle();
  await arnold.remove();
  assert.deepEqual(arnold.store.tables, {});
  const back = tables(idb);
  assert.deepEqual((await back.agent("arnold").loaded).store.tables, {});
  const kept = await back.agent("basil").loaded;
  assert.ok(kept.store.tables.t);
  await wipe(idb);
  assert.deepEqual((await tables(idb).agent("basil").loaded).store.tables, {});
});

test("wipe leaves a browser that kept nothing without a database", async () => {
  const idb = fakeIdb();
  await wipe(idb);
  await settle();
  assert.equal(idb.dbs.has(DB), false);
});

test("no IndexedDB (a private window) still keeps the rows for the visit", async () => {
  const a = createTables({ userId: "u1", idb: null }).agent("arnold");
  await a.loaded;
  assert.equal(a.ready, true);
  a.file("m1#0", ops(WORKOUT));
  a.set("session", "1", { Done: true });
  assert.equal(a.store.tables.session.rows["1"].Done, true);
});

test("subscribers hear about every filed reply and every tick", async () => {
  const a = tables(fakeIdb()).agent("arnold");
  await a.loaded;
  let n = 0;
  a.subscribe(() => { n++; });
  const v = a.version;
  a.file("m1#0", ops(WORKOUT));
  a.set("session", "1", { Done: true });
  assert.equal(n, 2);
  assert.equal(a.version, v + 2);
});
