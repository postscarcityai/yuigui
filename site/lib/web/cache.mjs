// A repeat visit opens on the last chat (YUI-273). The signed in /web keeps the newest rows of each thread, each
// agent's chat list and the agent list in IndexedDB, keyed by the person's id, and draws them at once while the
// live read is still on its way; the live read then replaces them (Thread.swap), so newest wins and nothing
// shows twice. Sign out wipes it. The demo never gets one (ThreadApp hands it no cache).
//
// Group threads (YUI-275) keep the same way: the newest rows of each group the person opened, keyed by group id, and
// the group list. A group that is archived or gone drops its rows (drop), so nothing outlives the group.
//
// Pure: the IndexedDB factory is injected, and a browser without one (a private window) keeps nothing.

export const DB = "yui-web-cache";
export const KEEP_ROWS = 40;
const STORES = ["rows", "chats", "agents"];

// The few rows worth keeping: the newest KEEP_ROWS by time, what the relay sent, nothing local.
export function newest(rows, keep = KEEP_ROWS) {
  return rows
    .filter((r) => r && r.id && r.created_at && !r._local)
    .sort((a, b) => (a.created_at < b.created_at ? -1 : a.created_at > b.created_at ? 1 : a.id < b.id ? -1 : 1))
    .slice(-keep);
}

export function createCache({ userId, idb = globalThis.indexedDB } = {}) {
  if (!userId || !idb) return null;
  let opened = null, dead = false;
  const open = () => (opened ||= new Promise((resolve, reject) => {
    const req = idb.open(DB, 1);
    req.onupgradeneeded = () => { for (const s of STORES) req.result.createObjectStore(s); };
    req.onsuccess = () => { req.result.onversionchange = () => req.result.close(); resolve(req.result); };
    req.onerror = () => reject(req.error);
  }));
  const run = async (store, mode, fn) => {
    const db = await open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(store, mode);
      const r = fn(tx.objectStore(store));
      tx.oncomplete = () => resolve(r?.result);
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error);
    });
  };
  // One record per person, so a person who signs in after another never reads the other's rows.
  const key = (...parts) => [userId, ...parts].join("|");
  const read = async (store, k) => {
    if (dead) return null;
    try { const v = await run(store, "readonly", (s) => s.get(k)); return v && v.user === userId ? v.value : null; } catch { return null; }
  };
  const write = async (store, k, value) => {
    if (dead) return;
    try { await run(store, "readwrite", (s) => s.put({ user: userId, value, at: Date.now() }, k)); } catch { /* a cache that cannot write is just empty */ }
  };
  const forget = async (store, k) => {
    if (dead) return;
    try { await run(store, "readwrite", (s) => s.delete(k)); } catch { /* nothing was kept */ }
  };
  return {
    // A group thread's rows live in the same store under their own key, so the agents' keys never meet them.
    groupRows: {
      get: (groupId) => read("rows", key("group", groupId)),
      put: (groupId, rows) => write("rows", key("group", groupId), newest(rows)),
      drop: (groupId) => forget("rows", key("group", groupId)),
    },
    groups: {
      get: () => read("agents", key("groups")),
      put: (list) => write("agents", key("groups"), list),
    },
    rows: {
      get: (agentId, chatId = null) => read("rows", key(agentId, chatId || "")),
      put: (agentId, chatId, rows) => write("rows", key(agentId, chatId || ""), newest(rows)),
    },
    chats: {
      get: (agentId) => read("chats", key(agentId)),
      put: (agentId, items) => write("chats", key(agentId), items),
    },
    agents: {
      get: () => read("agents", key("list")),
      put: (value) => write("agents", key("list"), value),
    },
    // Sign out: everything goes, and this instance writes nothing more (a read that was in flight cannot put it back).
    async clear() {
      dead = true;
      await wipe(idb);
    },
  };
}

// Empty the cache without a cache (the page was signed out, or another tab signed out). A browser that never kept one
// is left without one: a database this call had to create is deleted again.
export async function wipe(idb = globalThis.indexedDB) {
  if (!idb) return;
  try {
    let created = false;
    const db = await new Promise((resolve, reject) => {
      const req = idb.open(DB, 1);
      req.onupgradeneeded = () => { created = true; for (const s of STORES) req.result.createObjectStore(s); };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
    if (created) { db.close(); idb.deleteDatabase(DB); return; }
    await new Promise((resolve, reject) => {
      const tx = db.transaction(STORES, "readwrite");
      for (const s of STORES) tx.objectStore(s).clear();
      tx.oncomplete = () => { db.close(); resolve(); };
      tx.onerror = () => { db.close(); reject(tx.error); };
      tx.onabort = () => { db.close(); reject(tx.error); };
    });
  } catch { /* nothing was kept */ }
}
