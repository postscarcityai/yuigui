// node --test lib/web/tablesync.test.mjs   (YUI-36 step 1: optional encrypted sync of agent tables)
// The relay here is a stand-in for yui_sync_rows / yui_sync_pairings: it keeps what it is sent, stamps `rev`, and
// drops an older clock, exactly as the migration's trigger does. Two browsers (two table stores) share one account.
import test from "node:test";
import assert from "node:assert/strict";
import { webcrypto } from "node:crypto";
import { parse } from "../yl/yl.mjs";
import { createTables } from "./tablestore.mjs";
import { applyUnit, cleanCode, createSync, diffUnits, memoryState, newCode, newer, openUnit, keysFrom, unb64, relayRest } from "./tablesync.mjs";

const subtle = webcrypto.subtle;
const ops = (t) => parse(t);
const USER = "user-1";
const ARNOLD = "agent-arnold";
const WORKOUT = `table create session Slot:number Move:text Done:bool
put session 1 Slot=1 Move="Goblet squat"
put session 2 Slot=2 Move="Split squat"`;

// A relay: PostgREST over two tables, enough of the query string for what the client sends.
function fakeRelay() {
  const rows = [];
  const pairings = [];
  let rev = 0;
  const param = (path) => new URLSearchParams(path.split("?")[1]);
  const relay = {
    rows, pairings,
    async get(path) {
      const p = param(path);
      if (path.includes("yui_sync_pairings")) {
        const id = p.get("id").slice(3);
        return pairings.filter((r) => r.id === id).map(({ sealed, kid }) => ({ sealed, kid }));
      }
      const since = Number((p.get("rev") || "gt.0").slice(3));
      let out = rows.filter((r) => r.rev > since).sort((a, b) => a.rev - b.rev);
      if (p.get("select") === "kid") out = out.map((r) => ({ kid: r.kid }));
      return JSON.parse(JSON.stringify(out.slice(0, Number(p.get("limit") || 1000))));
    },
    async post(path, body) {
      for (const r of body) {
        if (path.includes("yui_sync_pairings")) { pairings.push({ ...r }); continue; }
        const at = rows.findIndex((x) => x.agent_id === r.agent_id && x.id === r.id);
        if (at >= 0 && r.clock < rows[at].clock) continue; // the trigger: an older clock cannot clobber a newer one
        const next = { ...r, rev: ++rev };
        if (at >= 0) rows[at] = next; else rows.push(next);
      }
    },
    async del(path) {
      if (path.includes("yui_sync_pairings")) {
        const id = param(path).get("id")?.slice(3);
        for (let i = pairings.length - 1; i >= 0; i--) if (!id || pairings[i].id === id) pairings.splice(i, 1);
        return;
      }
      rows.length = 0;
    },
  };
  return relay;
}

let t0 = 1_800_000_000_000;
function device(relay, name) {
  const tables = createTables({ userId: USER, idb: null });
  const clock = { now: () => (t0 += 1000) };
  const sync = createSync({ userId: USER, tables, agents: () => [ARNOLD], rest: relay, state: memoryState(), device: name, now: clock.now, iterations: 1000 });
  return { tables, sync, h: tables.agent(ARNOLD) };
}
const settle = () => new Promise((r) => setTimeout(r, 650));

test("a table made on one device turns up on the other, and the relay cannot read it", async () => {
  const relay = fakeRelay();
  const a = device(relay, "phone");
  await a.h.loaded;
  a.h.file("m1#0", ops(WORKOUT));
  await a.sync.ready();
  await a.sync.enable();

  const { code } = await a.sync.pair();
  const b = device(relay, "laptop");
  await b.sync.ready();
  await b.sync.join(code);
  assert.deepEqual(b.h.store.tables.session.order, ["1", "2"]);
  assert.equal(b.h.store.tables.session.rows["2"].Move, "Split squat");

  // What the relay holds: sealed boxes. No table name, column, key or value, in any field.
  const dump = JSON.stringify(relay.rows);
  for (const word of ["session", "Slot", "Move", "Done", "Goblet", "Split squat", "squat"]) assert.ok(!dump.includes(word), `relay shows ${word}`);
  for (const r of relay.rows) {
    assert.match(r.box, /^[A-Za-z0-9+/=]+$/);
    assert.equal(unb64(r.box).length % 1, 0);
    assert.ok(unb64(r.box).length >= 12 + 512, "padded to 512 bytes");
  }
  // And a device with a different key cannot open one.
  const stranger = await keysFrom(subtle, crypto.getRandomValues(new Uint8Array(32)));
  const r0 = relay.rows[0];
  assert.equal(await openUnit(subtle, stranger, new TextEncoder().encode(`yui-sync-v1|${USER}|${r0.agent_id}|${r0.id}|${r0.clock}`), r0.box), null);
});

test("two clients converge: ticks, new rows, deletes and a second table go both ways", async () => {
  const relay = fakeRelay();
  const a = device(relay, "phone");
  const b = device(relay, "laptop");
  await a.h.loaded; await b.h.loaded;
  a.h.file("m1#0", ops(WORKOUT));
  await a.sync.ready(); await a.sync.enable();
  await b.sync.ready(); await b.sync.join((await a.sync.pair()).code);

  a.h.set("session", "1", { Done: true });
  b.h.set("session", "2", { Done: true });
  b.h.file("m2#0", ops('put session 3 Slot=3 Move="Plank"\ntable create notes Day:date Text:text\nput notes d1 Day=2026-10-05 Text="felt good"'));
  await settle();
  await a.sync.sync(); await b.sync.sync(); await a.sync.sync();
  for (const side of [a, b]) {
    const t = side.h.store.tables;
    assert.equal(t.session.rows["1"].Done, true);
    assert.equal(t.session.rows["2"].Done, true);
    assert.equal(t.session.rows["3"].Move, "Plank");
    assert.equal(t.notes.rows.d1.Text, "felt good");
  }
  assert.deepEqual(a.h.store, b.h.store);

  // A delete on one is a delete on the other.
  a.h.file("m3#0", ops("put session 3 +delete"));
  await settle();
  await a.sync.sync(); await b.sync.sync();
  assert.equal(a.h.store.tables.session.rows["3"], undefined);
  assert.equal(b.h.store.tables.session.rows["3"], undefined);
  assert.deepEqual(a.h.store, b.h.store);
});

test("the same row edited on both while apart: the newest clock wins, on both", async () => {
  const relay = fakeRelay();
  const a = device(relay, "phone");
  const b = device(relay, "laptop");
  await a.h.loaded; await b.h.loaded;
  a.h.file("m1#0", ops(WORKOUT));
  await a.sync.ready(); await a.sync.enable();
  await b.sync.ready(); await b.sync.join((await a.sync.pair()).code);

  a.h.set("session", "1", { Move: "phone move" });
  await settle();
  b.h.set("session", "1", { Move: "laptop move" }); // later clock
  await settle();
  await a.sync.sync(); await b.sync.sync(); await a.sync.sync();
  assert.equal(a.h.store.tables.session.rows["1"].Move, "laptop move");
  assert.equal(b.h.store.tables.session.rows["1"].Move, "laptop move");
});

test("a pairing code works once, a wrong one finds nothing, a bad one is refused", async () => {
  const relay = fakeRelay();
  const a = device(relay, "phone");
  await a.h.loaded;
  a.h.file("m1#0", ops(WORKOUT));
  await a.sync.ready(); await a.sync.enable();
  const { code } = await a.sync.pair();
  assert.equal(relay.pairings.length, 1);
  assert.ok(!JSON.stringify(relay.pairings).includes(code.replace("-", "")), "the relay does not hold the code");

  const wrong = device(relay, "x"); await wrong.sync.ready();
  await assert.rejects(wrong.sync.join("00000-00000"), { code: "no_code" });
  await assert.rejects(wrong.sync.join("12"), { code: "bad_code" });

  const b = device(relay, "laptop"); await b.sync.ready();
  await b.sync.join(code.toLowerCase().replace("-", " "));
  assert.equal(b.sync.on, true);
  assert.equal(relay.pairings.length, 0, "used once");
  const c = device(relay, "third"); await c.sync.ready();
  await assert.rejects(c.sync.join(code), { code: "no_code" });
});

test("a second device cannot turn sync on over a copy that is already there", async () => {
  const relay = fakeRelay();
  const a = device(relay, "phone");
  await a.h.loaded;
  a.h.file("m1#0", ops(WORKOUT));
  await a.sync.ready(); await a.sync.enable();
  const b = device(relay, "laptop"); await b.sync.ready();
  await assert.rejects(b.sync.enable(), { code: "already" });
  assert.equal(b.sync.on, false);
});

test("turning off deletes the relay's copy, and every device keeps its tables", async () => {
  const relay = fakeRelay();
  const a = device(relay, "phone");
  const b = device(relay, "laptop");
  await a.h.loaded; await b.h.loaded;
  a.h.file("m1#0", ops(WORKOUT));
  await a.sync.ready(); await a.sync.enable();
  await b.sync.ready(); await b.sync.join((await a.sync.pair()).code);
  assert.ok(relay.rows.length > 0);
  await a.sync.disable();
  assert.equal(relay.rows.length, 0);
  assert.equal(a.sync.on, false);
  assert.deepEqual(Object.keys(a.h.store.tables), ["session"]);
  assert.deepEqual(Object.keys(b.h.store.tables), ["session"]);
  // Nothing more goes out after it is off.
  a.h.set("session", "1", { Done: true });
  await settle();
  assert.equal(relay.rows.length, 0);
});

test("off by default: a table written with sync off sends nothing", async () => {
  const relay = fakeRelay();
  const a = device(relay, "phone");
  await a.h.loaded; await a.sync.ready();
  a.h.file("m1#0", ops(WORKOUT));
  await settle();
  assert.equal(relay.rows.length, 0);
  assert.equal(a.sync.status().on, false);
});

test("units: a diff names changed rows, deleted rows and column changes; apply is the inverse", () => {
  const t = (rows, cols = [{ name: "A", type: "text" }]) => ({ tables: { x: { name: "x", cols, rows, order: Object.keys(rows), next: 1 } } });
  const before = t({ 1: { A: "a" }, 2: { A: "b" } });
  const after = t({ 1: { A: "a2" }, 3: { A: "c" } });
  const units = diffUnits(before, after);
  assert.deepEqual(units.map((u) => [u.t, u.key, u.values?.A ?? null]).sort(), [["row", "1", "a2"], ["row", "2", null], ["row", "3", "c"]].sort());
  let s = before;
  for (const u of units) s = applyUnit(s, u);
  assert.deepEqual(s.tables.x.rows, after.tables.x.rows);
  assert.deepEqual(diffUnits(after, { tables: {} }), [{ t: "schema", table: "x", cols: null }]);
  assert.equal(applyUnit({ tables: {} }, { t: "row", table: "x", key: "1", values: {} }).tables.x, undefined, "a row with no table is ignored");
});

test("the clock order and the code tidy", () => {
  assert.ok(newer([2, "a"], [1, "z"]));
  assert.ok(newer([1, "b"], [1, "a"]));
  assert.ok(!newer([1, "a"], [1, "a"]));
  assert.equal(cleanCode(" abcde fghjk "), "ABCDE-FGHJK");
  assert.equal(cleanCode("0O0I1-L1000"), "00011-11000");
  assert.equal(cleanCode("abc"), null);
  assert.match(newCode(), /^[0-9A-HJKMNP-TV-Z]{5}-[0-9A-HJKMNP-TV-Z]{5}$/);
});

test("relayRest speaks PostgREST", async () => {
  const seen = [];
  const rest = relayRest(async (path, init) => { seen.push([path, init?.method || "GET", init?.body]); return { json: async () => [{ ok: 1 }] }; });
  assert.deepEqual(await rest.get("rest/v1/yui_sync_rows?x=1"), [{ ok: 1 }]);
  await rest.post("rest/v1/yui_sync_rows", [{ a: 1 }], { Prefer: "return=minimal" });
  await rest.del("rest/v1/yui_sync_rows?user_id=eq.u");
  assert.deepEqual(seen.map((s) => s[1]), ["GET", "POST", "DELETE"]);
});
