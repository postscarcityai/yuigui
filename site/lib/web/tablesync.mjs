// Optional encrypted sync of agent tables (YUI-36 step 1, spec/SYNC.md). Off by default. When a person turns it on,
// each row, and each table's columns, becomes one sealed unit on the relay (`yui_sync_rows`): AES-GCM under a key
// that only their devices hold, filed under an opaque HMAC id. The relay never sees a table name, a column, a
// row key or a value. Last write wins per unit by a hybrid clock (wall time, a counter, then the device name).
//
// A second device joins with a pairing code the first one shows: 10 characters, good for 2 minutes, used once. The
// code is never the key. It seals the key for the relay to carry (`yui_sync_pairings`), and the relay never holds
// the code. Pure: the crypto, the relay (`rest`), the clock and the state file are injected.
import { LIMITS } from "../yl/tables.mjs";

const VERSION = "yui-sync-v1";
const enc = new TextEncoder();
const dec = new TextDecoder();
const ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ"; // Crockford: no I, L, O, U
export const PAIR_SECONDS = 120;
export const PAD = 512;
export const BATCH = 200;
const SCHEMA = "\u0000schema";

export const b64 = (bytes) => { let s = ""; for (const b of bytes) s += String.fromCharCode(b); return btoa(s); };
export const unb64 = (s) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
const b64url = (bytes) => b64(bytes).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
const hex = (bytes) => [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("");

// ---------------------------------------------------------------- the pairing code
export function newCode(random = (n) => crypto.getRandomValues(new Uint8Array(n))) {
  let out = "";
  for (const b of random(10)) out += ALPHABET[b & 31];
  return `${out.slice(0, 5)}-${out.slice(5)}`;
}
// What a person typed, tidied: case, spaces, the dash, and the look-alikes (O is 0, I and L are 1).
export function cleanCode(text) {
  const s = String(text || "").toUpperCase().replace(/[\s-]/g, "").replace(/O/g, "0").replace(/[IL]/g, "1");
  return s.length === 10 && [...s].every((c) => ALPHABET.includes(c)) ? `${s.slice(0, 5)}-${s.slice(5)}` : null;
}

// ---------------------------------------------------------------- keys, seals
async function hkdf(subtle, raw, label, usages, algo) {
  const base = await subtle.importKey("raw", raw, "HKDF", false, ["deriveKey"]);
  return subtle.deriveKey({ name: "HKDF", hash: "SHA-256", salt: new Uint8Array(0), info: enc.encode(`${VERSION} ${label}`) }, base, algo, false, usages);
}
// The sealing key and the id key, both derived from the one sync key.
export async function keysFrom(subtle, raw) {
  const seal = await hkdf(subtle, raw, "ops", ["encrypt", "decrypt"], { name: "AES-GCM", length: 256 });
  const ids = await hkdf(subtle, raw, "ids", ["sign"], { name: "HMAC", hash: "SHA-256", length: 256 });
  const kid = hex(new Uint8Array(await subtle.sign("HMAC", ids, enc.encode("kid"))).slice(0, 8));
  return { seal, ids, kid };
}
export async function unitId(subtle, keys, agent, table, key) {
  return b64url(new Uint8Array(await subtle.sign("HMAC", keys.ids, enc.encode(`${agent}\u0001${table}\u0001${key}`))).slice(0, 24));
}
const aadOf = (user, agent, id, clock) => enc.encode(`${VERSION}|${user}|${agent}|${id}|${clock}`);

// A unit sealed: JSON padded with spaces to the next 512 bytes, so the size says little. iv | ciphertext, base64.
export async function sealUnit(subtle, keys, aad, obj, random = (n) => crypto.getRandomValues(new Uint8Array(n))) {
  const json = enc.encode(JSON.stringify(obj));
  const padded = new Uint8Array(Math.ceil(json.length / PAD) * PAD).fill(32);
  padded.set(json);
  const iv = random(12);
  const ct = new Uint8Array(await subtle.encrypt({ name: "AES-GCM", iv, additionalData: aad }, keys.seal, padded));
  const out = new Uint8Array(iv.length + ct.length);
  out.set(iv); out.set(ct, iv.length);
  return b64(out);
}
export async function openUnit(subtle, keys, aad, box) {
  try {
    const raw = unb64(box);
    const plain = await subtle.decrypt({ name: "AES-GCM", iv: raw.slice(0, 12), additionalData: aad }, keys.seal, raw.slice(12));
    return JSON.parse(dec.decode(plain));
  } catch { return null; }
}

// The pairing code stretched (PBKDF2) into a relay id and a sealing key, so a copied relay row is slow to guess at.
async function fromCode(subtle, user, code, iterations) {
  const base = await subtle.importKey("raw", enc.encode(code), "PBKDF2", false, ["deriveBits"]);
  const bits = new Uint8Array(await subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", iterations, salt: enc.encode(`${VERSION} pairing|${user}`) }, base, 512));
  const key = await subtle.importKey("raw", bits.slice(32), "AES-GCM", false, ["encrypt", "decrypt"]);
  return { id: b64url(bits.slice(0, 16)), key };
}

// ---------------------------------------------------------------- units: what changes, and applying one
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

// What the person's store gained, changed or lost: the units to send. A table's columns are one unit, each row another.
export function diffUnits(prev, next) {
  const out = [];
  const before = prev?.tables || {};
  const after = next?.tables || {};
  for (const [name, t] of Object.entries(after)) {
    const p = before[name];
    if (!p || !same(p.cols, t.cols)) out.push({ t: "schema", table: name, cols: t.cols, next: t.next });
    for (const [key, row] of Object.entries(t.rows)) {
      if (!p || !same(p.rows[key], row)) out.push({ t: "row", table: name, key, values: row });
    }
    if (p) for (const key of Object.keys(p.rows)) if (!(key in t.rows)) out.push({ t: "row", table: name, key, values: null });
  }
  for (const name of Object.keys(before)) if (!(name in after)) out.push({ t: "schema", table: name, cols: null });
  return out;
}

// One unit applied to a store, which comes back changed or the very same object. The limits are the phone's own.
export function applyUnit(store, u) {
  const tables = store.tables;
  if (u.t === "schema") {
    if (u.cols === null) {
      if (!tables[u.table]) return store;
      const rest = { ...tables }; delete rest[u.table];
      return { ...store, tables: rest };
    }
    const t = tables[u.table];
    if (!t && Object.keys(tables).length >= LIMITS.tables) return store;
    const next = { name: u.table, cols: u.cols, rows: t?.rows || {}, order: t?.order || [], next: Math.max(t?.next || 1, u.next || 1) };
    return { ...store, tables: { ...tables, [u.table]: next } };
  }
  const t = tables[u.table];
  if (!t) return store;
  if (u.values === null) {
    if (!(u.key in t.rows)) return store;
    const rows = { ...t.rows }; delete rows[u.key];
    return { ...store, tables: { ...tables, [u.table]: { ...t, rows, order: t.order.filter((k) => k !== u.key) } } };
  }
  const known = u.key in t.rows;
  if (!known && t.order.length >= LIMITS.rows) return store;
  return { ...store, tables: { ...tables, [u.table]: { ...t, rows: { ...t.rows, [u.key]: u.values }, order: known ? t.order : [...t.order, u.key] } } };
}

// Newest clock wins; a tie goes to the larger device name, so every device picks the same one.
export const newer = (a, b) => a[0] > b[0] || (a[0] === b[0] && a[1] > b[1]);

// ---------------------------------------------------------------- the state kept in this browser
export const emptyState = () => ({ v: 1, key: "", kid: "", device: "", cursor: 0, hlc: 0, clocks: {}, outbox: [], last: 0 });

export function memoryState() {
  let kept = null;
  return { async load() { return kept && JSON.parse(JSON.stringify(kept)); }, async save(s) { kept = JSON.parse(JSON.stringify(s)); }, async clear() { kept = null; } };
}

const DB = "yui-web-tablesync";
export function idbState({ userId, idb = globalThis.indexedDB } = {}) {
  if (!idb || !userId) return memoryState();
  const open = () => new Promise((resolve, reject) => {
    const req = idb.open(DB, 1);
    req.onupgradeneeded = () => req.result.createObjectStore("state");
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  const run = async (mode, fn) => {
    const db = await open();
    try {
      return await new Promise((resolve, reject) => {
        const tx = db.transaction("state", mode);
        const r = fn(tx.objectStore("state"));
        tx.oncomplete = () => resolve(r?.result);
        tx.onerror = tx.onabort = () => reject(tx.error);
      });
    } finally { db.close(); }
  };
  return {
    async load() { try { return (await run("readonly", (s) => s.get(userId))) || null; } catch { return null; } },
    async save(s) { try { await run("readwrite", (st) => st.put(s, userId)); } catch { /* a browser that cannot keep it just asks again */ } },
    async clear() { try { await run("readwrite", (st) => st.delete(userId)); } catch { /* nothing kept */ } },
  };
}
// Sign out or delete the account: nothing of the sync stays in this browser.
export async function wipeSync(idb = globalThis.indexedDB) {
  if (!idb) return;
  await new Promise((resolve) => { const r = idb.deleteDatabase(DB); r.onsuccess = r.onerror = r.onblocked = () => resolve(); });
}

// ---------------------------------------------------------------- the sync itself
export class SyncError extends Error {
  constructor(code) { super(code); this.code = code; }
}

// tables: createTables(...) from tablestore.mjs. agents: () => the ids of this person's agents.
// rest: { get(path) -> rows, post(path, body, headers), del(path) }, the relay's PostgREST as the person.
export function createSync({ userId, tables, agents = () => [], rest, state = memoryState(), subtle = globalThis.crypto?.subtle, random = (n) => crypto.getRandomValues(new Uint8Array(n)), now = Date.now, device = "", iterations = 200000, onChange = () => {} }) {
  let s = null;
  let keys = null;
  let busy = false;
  let error = "";
  let unreadable = 0;
  let chain = Promise.resolve();
  let timer = null;
  const locked = (fn) => { const run = chain.then(fn, fn); chain = run.catch(() => {}); return run; };
  const listeners = new Set([onChange]);
  const note = () => { const st = api.status(); for (const fn of listeners) fn(st); };

  async function load() {
    if (s) return;
    s = (await state.load()) || emptyState();
    if (!s.device) s.device = device || b64url(random(6));
    if (s.key) keys = await keysFrom(subtle, unb64(s.key));
  }
  const save = () => state.save(s);
  const tick = () => { s.hlc = Math.max(now() * 1024, s.hlc + 1); return s.hlc; };
  const q = (extra) => `rest/v1/yui_sync_rows?user_id=eq.${userId}${extra}`;

  async function sealed(agent, u, clock) {
    const id = await unitId(subtle, keys, agent, u.table, u.t === "schema" ? SCHEMA : u.key);
    const gone = u.t === "schema" ? u.cols === null : u.values === null;
    const box = await sealUnit(subtle, keys, aadOf(userId, agent, id, clock), { ...u, clock, dev: s.device }, random);
    return { id, gone, box, clock };
  }
  // Units to send for one agent's change, clocked and kept in the outbox until the relay has them.
  async function enqueue(agent, units) {
    for (const u of units) {
      const clock = tick();
      const row = await sealed(agent, u, clock);
      (s.clocks[agent] ||= {})[row.id] = [clock, s.device];
      s.outbox = s.outbox.filter((o) => !(o.agent_id === agent && o.id === row.id));
      s.outbox.push({ agent_id: agent, id: row.id, box: row.box, clock, gone: row.gone });
    }
    await save();
  }

  async function flush() {
    while (s.outbox.length) {
      const part = s.outbox.slice(0, BATCH);
      await rest.post("rest/v1/yui_sync_rows?on_conflict=user_id,agent_id,id", part.map((o) => ({ user_id: userId, kid: s.kid, device: s.device, ...o })), { Prefer: "resolution=merge-duplicates,return=minimal" });
      s.outbox = s.outbox.slice(part.length);
      await save();
    }
  }

  // Everything after the cursor, applied. Each agent's store is rebuilt once per read.
  async function pull() {
    let more = true;
    while (more) {
      const rows = await rest.get(q(`&rev=gt.${s.cursor}&order=rev.asc&limit=${BATCH}`));
      const byAgent = new Map();
      for (const r of rows) {
        s.cursor = Math.max(s.cursor, r.rev);
        if (r.kid !== s.kid) { unreadable += 1; continue; }
        const mine = s.clocks[r.agent_id]?.[r.id];
        const theirs = [Number(r.clock), r.device || ""];
        if (mine && !newer(theirs, mine)) continue;
        const u = await openUnit(subtle, keys, aadOf(userId, r.agent_id, r.id, r.clock), r.box);
        if (!u || u.clock !== Number(r.clock)) { unreadable += 1; continue; }
        s.hlc = Math.max(s.hlc, theirs[0]);
        (s.clocks[r.agent_id] ||= {})[r.id] = [theirs[0], u.dev || ""];
        (byAgent.has(r.agent_id) ? byAgent.get(r.agent_id) : byAgent.set(r.agent_id, []).get(r.agent_id)).push(u);
      }
      for (const [agent, units] of byAgent) {
        const h = tables.agent(agent);
        await h.loaded;
        let store = h.store;
        // Columns first, so a row never lands before its table.
        for (const u of units.filter((x) => x.t === "schema")) store = applyUnit(store, u);
        for (const u of units.filter((x) => x.t === "row")) store = applyUnit(store, u);
        if (store !== h.store) h.replace(store);
      }
      more = rows.length === BATCH;
    }
    s.last = now();
    await save();
  }

  // Rows this device holds that the relay has never been sent (the first upload, or a table that grew offline).
  async function reconcile() {
    for (const agent of agents()) {
      const h = tables.agent(agent);
      await h.loaded;
      const known = s.clocks[agent] || {};
      const fresh = [];
      for (const u of diffUnits({ tables: {} }, h.store)) {
        const id = await unitId(subtle, keys, agent, u.table, u.t === "schema" ? SCHEMA : u.key);
        if (!known[id]) fresh.push(u);
      }
      if (fresh.length) await enqueue(agent, fresh);
    }
  }

  const guard = async (fn) => {
    busy = true; error = ""; note();
    try { return await fn(); }
    catch (e) { error = e?.code || e?.message || "failed"; throw e; }
    finally { busy = false; note(); }
  };

  async function sync() {
    await load();
    if (!s.key) return;
    await guard(async () => { await pull(); await reconcile(); await flush(); await pull(); });
  }

  const api = {
    subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); },
    async ready() { await load(); note(); return api; },
    get on() { return !!s?.key; },
    status() {
      const n = s ? Object.values(s.clocks).reduce((a, c) => a + Object.keys(c).length, 0) : 0;
      return { on: !!s?.key, busy, error, last: s?.last || 0, units: n, pending: s?.outbox.length || 0, unreadable };
    },
    // Turn on: a new key on this device and everything uploaded. Refused if another device already syncs this account.
    enable() {
      return locked(async () => {
        await load();
        if (s.key) return;
        await guard(async () => {
          const other = await rest.get(q("&select=kid&limit=1"));
          if (other.length) throw new SyncError("already");
          const raw = random(32);
          keys = await keysFrom(subtle, raw);
          s = { ...emptyState(), device: s.device, key: b64(raw), kid: keys.kid };
          await save();
          await reconcile();
          await flush();
        });
      });
    },
    // The second device's pairing code: the key sealed under it, on the relay for 2 minutes.
    pair() {
      return locked(async () => {
        await load();
        if (!s.key) throw new SyncError("off");
        return guard(async () => {
          const code = newCode(random);
          const { id, key } = await fromCode(subtle, userId, code, iterations);
          const iv = random(12);
          const ct = new Uint8Array(await subtle.encrypt({ name: "AES-GCM", iv, additionalData: enc.encode(`${VERSION}|${userId}`) }, key, unb64(s.key)));
          const out = new Uint8Array(12 + ct.length); out.set(iv); out.set(ct, 12);
          await rest.post("rest/v1/yui_sync_pairings", [{ user_id: userId, id, sealed: b64(out), kid: s.kid }], { Prefer: "return=minimal" });
          return { code, expiresAt: now() + PAIR_SECONDS * 1000 };
        });
      });
    },
    // The new device: the code typed, the key opened, the tables pulled in, then this device's own rows sent.
    join(typed) {
      return locked(async () => {
        await load();
        if (s.key) return;
        const code = cleanCode(typed);
        if (!code) throw new SyncError("bad_code");
        await guard(async () => {
          const { id, key } = await fromCode(subtle, userId, code, iterations);
          const rows = await rest.get(`rest/v1/yui_sync_pairings?user_id=eq.${userId}&id=eq.${encodeURIComponent(id)}&select=sealed,kid`);
          if (!rows.length) throw new SyncError("no_code");
          const raw = unb64(rows[0].sealed);
          let plain;
          try { plain = new Uint8Array(await subtle.decrypt({ name: "AES-GCM", iv: raw.slice(0, 12), additionalData: enc.encode(`${VERSION}|${userId}`) }, key, raw.slice(12))); }
          catch { throw new SyncError("no_code"); }
          keys = await keysFrom(subtle, plain);
          s = { ...emptyState(), device: s.device, key: b64(plain), kid: keys.kid };
          await save();
          await rest.del(`rest/v1/yui_sync_pairings?user_id=eq.${userId}&id=eq.${encodeURIComponent(id)}`); // used once
          await pull(); await reconcile(); await flush();
        });
      });
    },
    sync() { return locked(sync); },
    // Turn off: the relay's copy is deleted, then the key goes. Every device keeps its own tables.
    disable() {
      return locked(async () => {
        await load();
        await guard(async () => {
          await rest.del(`rest/v1/yui_sync_rows?user_id=eq.${userId}`);
          await rest.del(`rest/v1/yui_sync_pairings?user_id=eq.${userId}`);
          s = { ...emptyState(), device: s.device };
          keys = null;
          await state.clear();
        });
      });
    },
    // The store listener: a change the person (or a reply) made here. Sent soon, and batched.
    local(agent, prev, next) {
      if (!s?.key || !agent) return;
      const units = diffUnits(prev, next);
      if (!units.length) return;
      locked(async () => { if (s?.key) await enqueue(agent, units); }).then(() => {
        clearTimeout(timer);
        timer = setTimeout(() => { api.sync().catch(() => {}); }, 400);
      }).catch(() => {});
    },
    stop() { clearTimeout(timer); },
  };
  tables?.watch?.((agent, prev, next) => api.local(agent, prev, next));
  return api;
}

// The relay's PostgREST (relay.rest returns a Response) in the shape createSync wants.
export function relayRest(request) {
  const json = { "Content-Type": "application/json" };
  return {
    async get(path) { return (await request(path)).json(); },
    async post(path, body, headers = {}) { await request(path, { method: "POST", headers: { ...json, ...headers }, body: JSON.stringify(body) }); },
    async del(path) { await request(path, { method: "DELETE", headers: { Prefer: "return=minimal" } }); },
  };
}

// ---------------------------------------------------------------- the words in Settings > Data
export const SYNC_WORDS = {
  title: "Keep my tables in sync",
  off: "Your agents' tables stay on this device. Turn this on to keep them the same on your other devices. They are sealed here first, so Yui's server only holds copies it cannot read.",
  on: "Sealed on this device. Yui's server holds copies it cannot read. Turning this off deletes them; the tables on each device stay.",
  add: "Add a device",
  addNote: "On the other device, open Settings > Data and choose Join with a code. It works once, for 2 minutes.",
  join: "Already on another device? Join with its code",
  joinGo: "Join",
  sync: "Sync now",
  seen: "What the server can see: which agents have tables, how much, and when they change. Not a name, a column or a value.",
};
export function syncError(code) {
  return ({
    already: "Another device already syncs this account. Choose Join with a code on this one.",
    no_code: "That code did not work. It may have run out. Ask the other device for a new one.",
    bad_code: "A pairing code is 10 letters and numbers.",
    sync_full: "Your synced tables are over 50 MB. Remove some rows first.",
    off: "Turn sync on first.",
    network: "No connection. It will try again.",
  })[code] || "Sync stopped. It will try again.";
}
// "Synced just now", "Synced 4 min ago", "Syncing", or what stopped it.
export function syncLine(st, now = Date.now()) {
  if (!st?.on) return "";
  if (st.error) return syncError(st.error);
  if (st.busy) return "Syncing";
  if (!st.last) return "Waiting for the first sync";
  const m = Math.floor((now - st.last) / 60000);
  const when = m < 1 ? "just now" : m < 60 ? `${m} min ago` : `${Math.floor(m / 60)} h ago`;
  if (!st.units) return `Synced ${when}. No tables yet.`;
  return `Synced ${when}. ${st.units} ${st.units === 1 ? "piece" : "pieces"} of your tables${st.pending ? `, ${st.pending} waiting` : ""}.`;
}

// A relay held in the page, for the demo: the same two tables the migration makes, nothing sent anywhere.
export function demoRest() {
  const rows = [];
  const pairings = [];
  let rev = 0;
  const param = (path) => new URLSearchParams(path.split("?")[1]);
  return {
    async get(path) {
      const p = param(path);
      if (path.includes("yui_sync_pairings")) return pairings.filter((r) => `eq.${r.id}` === p.get("id"));
      const since = Number((p.get("rev") || "gt.0").slice(3));
      return rows.filter((r) => r.rev > since).sort((a, b) => a.rev - b.rev).slice(0, Number(p.get("limit") || 1000)).map((r) => ({ ...r }));
    },
    async post(path, body) {
      for (const r of body) {
        if (path.includes("yui_sync_pairings")) { pairings.push({ ...r }); continue; }
        const at = rows.findIndex((x) => x.agent_id === r.agent_id && x.id === r.id);
        if (at >= 0 && r.clock < rows[at].clock) continue;
        if (at >= 0) rows[at] = { ...r, rev: ++rev }; else rows.push({ ...r, rev: ++rev });
      }
    },
    async del(path) {
      const id = param(path).get("id");
      if (path.includes("yui_sync_pairings")) { for (let i = pairings.length - 1; i >= 0; i--) if (!id || `eq.${pairings[i].id}` === id) pairings.splice(i, 1); return; }
      rows.length = 0;
    },
  };
}
