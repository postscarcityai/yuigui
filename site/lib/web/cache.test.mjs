// node --test lib/web/cache.test.mjs   (YUI-273: the last rows, chats and agents kept for a repeat visit)
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createCache, newest, wipe, KEEP_ROWS } from "./cache.mjs";
import { createDemoRelay } from "./demo.mjs";
import { Thread } from "./thread.mjs";
import { ThreadSync } from "./sync.mjs";

// The smallest IndexedDB the cache needs: named stores of key -> value, transactions that finish on a later tick.
function fakeIdb() {
  const dbs = new Map();
  const later = (fn) => setTimeout(fn, 0);
  return {
    dbs,
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

const fixture = JSON.parse(readFileSync(new URL("../../app/web/fixtures/penny.json", import.meta.url), "utf8"));
const row = (i, extra = {}) => ({ id: `r${String(i).padStart(3, "0")}`, sender: i % 2 ? "agent" : "user", body: `Row ${i}`, kind: "text", meta: {}, created_at: new Date(1e12 + i * 1000).toISOString(), ...extra });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

test("newest keeps the last KEEP_ROWS by time and drops local rows", () => {
  const rows = [...Array.from({ length: 70 }, (_, i) => row(i)).reverse(), row(99, { _local: ["blob:x"] })];
  const kept = newest(rows);
  assert.equal(kept.length, KEEP_ROWS);
  assert.equal(kept[0].id, "r030");
  assert.equal(kept.at(-1).id, "r069");
});

test("rows, chats and agents come back for the same person only", async () => {
  const idb = fakeIdb();
  const a = createCache({ userId: "u1", idb }), b = createCache({ userId: "u2", idb });
  await a.rows.put("penny", null, [row(1), row(2)]);
  await a.chats.put("penny", [{ id: "c1" }]);
  await a.agents.put({ agents: [{ id: "penny" }], crew: [], first_name: "Chris" });
  assert.deepEqual((await a.rows.get("penny", null)).map((r) => r.id), ["r001", "r002"]);
  assert.deepEqual(await a.chats.get("penny"), [{ id: "c1" }]);
  assert.equal((await a.agents.get()).first_name, "Chris");
  assert.equal(await b.rows.get("penny", null), null, "another person reads nothing");
  assert.equal(await a.rows.get("penny", "chat-9"), null, "a chat is its own key");
});

test("clear (sign out) empties it, and the instance writes nothing after", async () => {
  const idb = fakeIdb();
  const a = createCache({ userId: "u1", idb });
  await a.rows.put("penny", null, [row(1)]);
  await a.clear();
  assert.equal(await createCache({ userId: "u1", idb }).rows.get("penny", null), null);
  await a.rows.put("penny", null, [row(2)]);
  assert.equal(await createCache({ userId: "u1", idb }).rows.get("penny", null), null, "a write after sign out is dropped");
  await createCache({ userId: "u1", idb }).rows.put("penny", null, [row(3)]);
  await wipe(idb);
  assert.equal(await createCache({ userId: "u1", idb }).rows.get("penny", null), null, "wipe works without an instance");
});

test("no person or no IndexedDB: no cache", () => {
  assert.equal(createCache({ userId: null, idb: fakeIdb() }), null);
  assert.equal(createCache({ userId: "u1", idb: null }), null);
});

// A relay that answers rows after a wait, so the test can look at the thread before the live read lands.
function slowRelay(live, ms) {
  const relay = createDemoRelay(fixture, { speed: 5 });
  return { ...relay, subscribe: undefined, fetchRows: async () => { await sleep(ms); return live; }, newestFromUser: async () => null };
}
const timers = { set: (fn, ms) => setTimeout(fn, ms / 50), clear: clearTimeout };

test("a repeat visit draws the kept rows before the relay answers, then the live rows replace them", async () => {
  const idb = fakeIdb();
  const cache = createCache({ userId: "u1", idb });
  await cache.rows.put("a1", null, [row(1), row(2), row(3, { sender: "user" })]);
  // Live: row 3 was answered meanwhile, row 4 is new, row 2 is gone.
  const live = [row(1), row(3, { sender: "user", handled_at: new Date(1e12).toISOString() }), row(4)];
  const thread = new Thread();
  const sync = new ThreadSync({ relay: slowRelay(live, 120), thread, userId: "u1", agentId: "a1", cache, timers });
  const started = sync.start();
  await sleep(60);
  assert.equal(thread.loaded, true, "drawn from the cache");
  assert.deepEqual(thread.messages.map((m) => m.text), ["Row 1", "Row 2", "Row 3"]);
  assert.equal(thread.waiting, false, "kept rows never start a wait");
  let draws = 0; thread.subscribe(() => { draws++; });
  await started;
  assert.deepEqual(thread.messages.map((m) => m.text), ["Row 1", "Row 3", "Row 4"], "live is the truth: no duplicates, the gone row is gone");
  assert.equal(draws, 1, "one redraw, no flicker");
  sync.stop();
});

test("what the relay sends is kept, newest rows only", async () => {
  const idb = fakeIdb();
  const cache = createCache({ userId: "u1", idb });
  const live = Array.from({ length: 100 }, (_, i) => row(i));
  const sync = new ThreadSync({ relay: slowRelay(live, 1), thread: new Thread(), userId: "u1", agentId: "a1", cache, timers });
  await sync.start();
  await sleep(30);
  const kept = await createCache({ userId: "u1", idb }).rows.get("a1", null);
  assert.equal(kept.length, KEEP_ROWS);
  assert.equal(kept.at(-1).id, "r099");
  sync.stop();
});

test("no kept rows (a first visit): the live read draws as before", async () => {
  const cache = createCache({ userId: "u1", idb: fakeIdb() });
  const thread = new Thread();
  const sync = new ThreadSync({ relay: slowRelay([row(1), row(2)], 20), thread, userId: "u1", agentId: "a1", cache, timers });
  await sync.start();
  assert.deepEqual(thread.messages.map((m) => m.text), ["Row 1", "Row 2"]);
  sync.stop();
});

// ---- YUI-275: group threads ----
test("group rows: the newest KEEP_ROWS, keyed by group, kept per person", async () => {
  const idb = fakeIdb();
  const a = createCache({ userId: "u1", idb }), b = createCache({ userId: "u2", idb });
  await a.groupRows.put("g1", Array.from({ length: 70 }, (_, i) => row(i)));
  await a.groupRows.put("g2", [row(5)]);
  await a.rows.put("g1", null, [row(9)]);
  const kept = await a.groupRows.get("g1");
  assert.equal(kept.length, KEEP_ROWS);
  assert.equal(kept.at(-1).id, "r069");
  assert.deepEqual((await a.groupRows.get("g2")).map((r) => r.id), ["r005"]);
  assert.deepEqual((await a.rows.get("g1", null)).map((r) => r.id), ["r009"], "an agent id that looks like a group id never meets it");
  assert.equal(await b.groupRows.get("g1"), null, "another person reads nothing");
  assert.equal(await a.groupRows.get("g3"), null, "a group never opened has nothing");
});

test("the group list comes back as it was written", async () => {
  const idb = fakeIdb();
  const a = createCache({ userId: "u1", idb });
  await a.groups.put([{ id: "g1", title: "Penny and Basil", lead: "penny", members: ["penny", "basil"] }]);
  assert.equal((await createCache({ userId: "u1", idb }).groups.get())[0].title, "Penny and Basil");
  assert.equal(await createCache({ userId: "u2", idb }).groups.get(), null);
  assert.equal(await a.agents.get(), null, "the agent list is its own record");
});

test("leaving or archiving a group (drop) takes only that group's rows", async () => {
  const idb = fakeIdb();
  const a = createCache({ userId: "u1", idb });
  await a.groupRows.put("g1", [row(1)]);
  await a.groupRows.put("g2", [row(2)]);
  await a.groupRows.drop("g1");
  assert.equal(await a.groupRows.get("g1"), null);
  assert.equal((await a.groupRows.get("g2")).length, 1);
});

test("sign out clears group rows and the group list too, and nothing is written after", async () => {
  const idb = fakeIdb();
  const a = createCache({ userId: "u1", idb });
  await a.groupRows.put("g1", [row(1)]);
  await a.groups.put([{ id: "g1" }]);
  await a.clear();
  await a.groupRows.put("g1", [row(2)]);
  const fresh = createCache({ userId: "u1", idb });
  assert.equal(await fresh.groupRows.get("g1"), null);
  assert.equal(await fresh.groups.get(), null);
});
