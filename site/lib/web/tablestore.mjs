// Agent tables on /web (YUI-296): the twin of Yui/Sources/Tables/AgentTables.swift. One store per person and per
// agent, kept in IndexedDB in this browser, never sent anywhere (spec/TABLES.md section 4). The store itself is the
// pure one in lib/yl/tables.mjs, so `table create`, `put` and delete apply exactly as on the phone, with the same
// limits. Like the app, a reply's lines are filed once (`applied`): a thread that loads again writes nothing a
// second time, so a tick the person made is not written over by the reply that drew the box.
//
// Pure: the IndexedDB factory is injected. A browser without one (a private window) keeps the rows for the visit.
import { emptyStore, write } from "../yl/tables.mjs";

export const DB = "yui-web-tables";
export const KEEP_APPLIED = 2000; // reply ids remembered per agent

const isData = (op) => op && (op.op === "table" || op.op === "put");

export function createTables({ userId = "", idb = globalThis.indexedDB } = {}) {
  let opened = null, dead = false;
  const open = () => (opened ||= new Promise((resolve, reject) => {
    const req = idb.open(DB, 1);
    req.onupgradeneeded = () => req.result.createObjectStore("agents");
    req.onsuccess = () => { req.result.onversionchange = () => req.result.close(); resolve(req.result); };
    req.onerror = () => reject(req.error);
  }));
  const run = async (mode, fn) => {
    const db = await open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction("agents", mode);
      const r = fn(tx.objectStore("agents"));
      tx.oncomplete = () => resolve(r?.result);
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error);
    });
  };
  // One record per person and agent, so a person who signs in after another never reads the other's rows.
  const key = (agentId) => `${userId}|${agentId}`;
  const handles = new Map();
  // Sync (tablesync.mjs) hears every change made here: (agentId, before, after). A change a sync brings in is not one.
  const watchers = new Set();
  const heard = (id, before, after) => { for (const fn of watchers) { try { fn(id, before, after); } catch { /* a listener must not break a write */ } } };

  function agent(agentId) {
    const id = String(agentId || "");
    if (handles.has(id)) return handles.get(id);
    let store = emptyStore();
    let applied = [];
    let ready = !idb || !userId || !id; // nothing to read: an agent with no id (a preview) lives in memory only
    let version = 0;
    let queue = Promise.resolve();
    const listeners = new Set();
    const waiting = [];
    const changed = () => { version += 1; for (const fn of listeners) fn(); };
    const persist = () => {
      if (dead || !idb || !userId || !id) return;
      const record = { user: userId, store, applied: applied.slice(-KEEP_APPLIED), at: Date.now() };
      queue = queue.then(() => run("readwrite", (s) => s.put(record, key(id)))).catch(() => { /* a store that cannot write just does not last */ });
    };

    const h = {
      get ready() { return ready; },
      get store() { return store; },
      get version() { return version; },
      subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); },
      // The record on disk, read once. Lines filed before it came wait for it, then go in order.
      async load() {
        if (!ready && !dead) {
          try {
            const v = await run("readonly", (s) => s.get(key(id)));
            if (v && v.user === userId && v.store && typeof v.store.tables === "object") {
              store = v.store;
              applied = Array.isArray(v.applied) ? v.applied : [];
            }
          } catch { /* nothing was kept */ }
          ready = true;
        }
        for (const w of waiting.splice(0)) w();
        changed();
        return h;
      },
      // A reply's `table create` and `put` lines, once per reply. `done` gets what was refused:
      // [{ table, key?, message, line }], to tell the agent once (TABLES.md section 3, event 1).
      file(reply, ops, { ctx = {}, done = null } = {}) {
        const run1 = () => {
          const writes = (ops || []).filter(isData);
          if (!writes.length || (reply && applied.includes(reply))) { done?.([]); return; }
          if (reply) applied.push(reply);
          const before = store;
          const refused = [];
          for (const op of writes) {
            const r = write(store, op, ctx);
            store = r.store;
            if (r.error) refused.push({ table: op.table || op.name || "", ...(op.key != null ? { key: String(op.key) } : {}), message: r.error, line: op.line });
          }
          persist();
          changed();
          heard(id, before, store);
          done?.(refused);
        };
        if (ready) run1(); else waiting.push(run1);
      },
      // The person changed a row in a view (a tick): written the way a `put` would, with no reply.
      set(table, rowKey, values, ctx = {}) {
        const r = write(store, { op: "put", table, key: rowKey, values, line: `put ${table} ${rowKey}` }, ctx);
        if (r.error) return r;
        const before = store;
        store = r.store;
        persist();
        changed();
        heard(id, before, store);
        return r;
      },
      // A store a sync brought in from another device: kept and drawn, not sent back.
      replace(next) {
        store = next;
        persist();
        changed();
      },
      // Tables with their row counts, for an agent's settings.
      summary() {
        return Object.values(store.tables).map((t) => ({ name: t.name, rows: t.order.length, cols: t.cols.length }));
      },
      // Removing an agent removes its tables (TABLES.md section 4).
      async remove() {
        store = emptyStore();
        applied = [];
        handles.delete(id);
        changed();
        if (dead || !idb || !userId || !id) return;
        queue = queue.then(() => run("readwrite", (s) => s.delete(key(id)))).catch(() => {});
        await queue;
      },
    };
    handles.set(id, h);
    h.loaded = h.load();
    return h;
  }

  return {
    agent,
    watch(fn) { watchers.add(fn); return () => watchers.delete(fn); },
    // Sign out or delete the account: every agent's tables go, and this instance writes nothing more.
    async clear() {
      dead = true;
      handles.clear();
      await wipe(idb);
    },
  };
}

// Empty the tables without an instance (the page was signed out, or another tab signed out). A browser that never
// kept any is left without a database: one this call had to create is deleted again.
export async function wipe(idb = globalThis.indexedDB) {
  if (!idb) return;
  try {
    let created = false;
    const db = await new Promise((resolve, reject) => {
      const req = idb.open(DB, 1);
      req.onupgradeneeded = () => { created = true; req.result.createObjectStore("agents"); };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
    if (created) { db.close(); idb.deleteDatabase(DB); return; }
    await new Promise((resolve, reject) => {
      const tx = db.transaction("agents", "readwrite");
      tx.objectStore("agents").clear();
      tx.oncomplete = () => { db.close(); resolve(); };
      tx.onerror = () => { db.close(); reject(tx.error); };
      tx.onabort = () => { db.close(); reject(tx.error); };
    });
  } catch { /* nothing was kept */ }
}
