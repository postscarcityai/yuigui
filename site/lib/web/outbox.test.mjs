// node --test lib/web/outbox.test.mjs   (YUI-244: the outbox that survives a closed tab)
import test from "node:test";
import assert from "node:assert/strict";
import { createOutbox, memoryStore } from "./outbox.mjs";
import { RelayError } from "./relay.mjs";

const settle = (ms = 40) => new Promise((r) => setTimeout(r, ms));

test("outbox: oldest first, backs off on a network error, 409 is sent, a refusal that never passes is dropped", async () => {
  const order = [];
  let fail = 2;
  const sentIds = [], states = [];
  const ob = createOutbox({
    send: async (item) => {
      order.push(item.id);
      if (item.id === "bad") throw new RelayError(400, "no");
      if (fail-- > 0) throw new TypeError("network down");
    },
    onSent: (item, refusal) => sentIds.push(refusal ? `${item.id}!` : item.id),
    onState: (s) => states.push(s),
    wait: async () => {},
  });
  await ob.add({ id: "one", queuedAt: 1 });
  await ob.add({ id: "bad", queuedAt: 2 });
  await ob.add({ id: "two", queuedAt: 3 });
  await settle();
  assert.deepEqual(sentIds, ["one", "bad!", "two"]);
  assert.deepEqual(order.slice(0, 3), ["one", "one", "one"]); // two failures, then it lands
  assert.equal(states.some((s) => s.offline), true);
  assert.deepEqual(ob.pending(), []);
});

test("written to disk before the first try: a tab that dies mid-send leaves the row for the next one", async () => {
  const store = memoryStore();
  let release;
  const gate = new Promise((r) => { release = r; });
  const a = createOutbox({ send: () => gate, store, owner: "u1", wait: async () => {} });
  await a.add({ id: "m1", body: "hello", kind: "text" });
  assert.equal((await store.all()).length, 1); // on disk while the send is still in flight
  // the tab closes here: a new page opens on the same disk
  const sent = [];
  const b = createOutbox({ send: async (i) => { sent.push(i.id); }, store, owner: "u1" });
  assert.deepEqual((await b.load()).map((i) => i.id), ["m1"]);
  await settle();
  assert.deepEqual(sent, ["m1"]);
  assert.equal((await store.all()).length, 0);
  release();
});

test("two tabs, one disk: a row is sent by whoever gets there first and the other finds it gone", async () => {
  const store = memoryStore();
  const wire = new Map();
  // the relay: the id is the primary key, so a second try is a 409 which `post` turns into a quiet success
  const relay = async (item) => { await settle(5); wire.set(item.id, (wire.get(item.id) || 0) + 1); };
  const a = createOutbox({ send: relay, store, owner: "u1" });
  const b = createOutbox({ send: relay, store, owner: "u1" });
  await a.add({ id: "x1", queuedAt: 1 });
  await a.add({ id: "x2", queuedAt: 2 });
  await b.load();
  await settle(150);
  assert.deepEqual([...wire.keys()].sort(), ["x1", "x2"]);
  assert.equal((await store.all()).length, 0);
  assert.equal(a.pending().length + b.pending().length, 0);
});

test("another account's leftovers are dropped, not sent", async () => {
  const store = memoryStore();
  await store.put({ id: "theirs", userId: "u2", queuedAt: 1 });
  await store.put({ id: "mine", userId: "u1", queuedAt: 2 });
  const sent = [];
  const ob = createOutbox({ send: async (i) => { sent.push(i.id); }, store, owner: "u1" });
  await ob.load();
  await settle();
  assert.deepEqual(sent, ["mine"]);
  assert.equal((await store.all()).length, 0);
});

test("a flaky network keeps the row on disk until it lands; retry() skips the wait", async () => {
  const store = memoryStore();
  let up = false;
  const ob = createOutbox({ send: async () => { if (!up) throw new TypeError("offline"); }, store, wait: () => new Promise(() => {}) }); // only retry() wakes it
  const states = [];
  ob.subscribe((e) => e.type === "state" && states.push(e.offline));
  await ob.add({ id: "z1" });
  await settle();
  assert.equal((await store.all()).length, 1);
  assert.equal(ob.isPending("Z1"), true);
  assert.equal(states.at(-1), true);
  up = true;
  ob.retry();
  await settle();
  assert.equal((await store.all()).length, 0);
  assert.equal(states.at(-1), false);
});

test("a photo's bytes ride the item until they are up; a refusal drops the row and says so", async () => {
  const store = memoryStore();
  const events = [];
  const ob = createOutbox({ send: async (i) => { if (i.uploads?.[0]?.blob.size > 3) throw new RelayError(413, "too big"); }, store, wait: async () => {} });
  ob.subscribe((e) => events.push(e.type));
  await ob.add({ id: "p1", uploads: [{ path: "a", blob: new Blob(["xyzzy"]) }] });
  await settle();
  assert.deepEqual(events.filter((t) => t !== "state"), ["added", "refused"]);
  assert.equal(ob.pending().length, 0);
});
