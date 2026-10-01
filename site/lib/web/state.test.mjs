import test from "node:test";
import assert from "node:assert/strict";
import { createKeySync, mergeRemoved } from "./state.mjs";

// A server with one row, the server's clock, and a device with its own words.
function world() {
  const rows = new Map();
  let clock = 1000;
  const client = {
    async list() { return [...rows.values()].map((r) => ({ ...r })); },
    async put({ key, value, device }) { clock += 10; rows.set(key, { key, value, device, updated_at: new Date(clock).toISOString() }); },
  };
  const device = (name, key = "draft", extra = {}) => {
    const d = { text: "", at: 0 };
    const timers = [];
    const sync = createKeySync({ client, userId: "u", agentId: "a", key, device: name, read: () => d.text, write: (v) => { d.text = v; }, at: () => d.at,
      setTimer: (fn) => { timers.push(fn); return timers.length; }, clearTimer: () => {}, setBeat: () => 0, clearBeat: () => {}, visible: () => true, ...extra });
    sync.start();
    return { d, sync, type: (v) => { d.text = v; d.at = Date.now(); sync.changed(); }, settle: async () => { const t = timers.splice(0); for (const fn of t) await fn(); } };
  };
  return { rows, device };
}
const tick = () => new Promise((r) => setTimeout(r, 0));

test("words typed on the phone show on the web, and sending clears them on both", async () => {
  const w = world();
  const phone = w.device("phone"), web = w.device("web-1");
  await tick();
  phone.type("milk and eggs"); await phone.settle();
  await web.sync.pull(); await tick();
  assert.equal(web.d.text, "milk and eggs");
  phone.type(""); await phone.settle();
  await web.sync.pull(); await tick();
  assert.equal(web.d.text, "");
});

test("a newer local edit waiting to go up is not overwritten by an older remote value", async () => {
  const w = world();
  const phone = w.device("phone"), web = w.device("web-1");
  await tick();
  phone.type("one"); await phone.settle();
  await web.sync.pull(); await tick();
  web.type("one two");              // not pushed yet
  await web.sync.pull(); await tick();
  assert.equal(web.d.text, "one two");
  await web.settle();
  await phone.sync.pull(); await tick();
  assert.equal(phone.d.text, "one two");
});

test("a pasted key is never sent", async () => {
  const w = world();
  const web = w.device("web-1");
  await tick();
  web.type("sk-abcdefghijklmnopqrstuvwxyz0123"); await web.settle();
  assert.equal(w.rows.get("draft")?.value ?? "", "");
});

test("the shelf's removed names merge by newest time", async () => {
  assert.equal(mergeRemoved('{"a":5,"b":1}', '{"b":9,"c":2}'), '{"a":5,"b":9,"c":2}');
  const w = world();
  const merge = mergeRemoved;
  const phone = w.device("phone", "shelf-removed", { merge });
  const web = w.device("web-1", "shelf-removed", { merge });
  await tick();
  phone.type('{"x":5}'); await phone.settle();
  web.type('{"y":6}'); await web.settle();
  await web.sync.pull(); await tick(); await web.settle();
  await phone.sync.pull(); await tick();
  assert.deepEqual(JSON.parse(web.d.text), { x: 5, y: 6 });
  assert.deepEqual(JSON.parse(phone.d.text), { x: 5, y: 6 });
});
