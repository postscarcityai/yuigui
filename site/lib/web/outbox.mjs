// The outbox (YUI-244): what the person sent that the relay does not have yet. The browser's twin of
// Chat/Outbox.swift (spec/RELAY.md, Delivery): every message and answered tap is written to disk before
// the first try, so a dropped network, a closed tab or a killed browser never loses one. They go out oldest
// first, each with the id the sender chose: a resend of a row that already landed hits the primary key
// (409, the relay's `post` counts it sent), so nothing is written twice. Retries back off quietly
// (1 s up to 30 s) and start over when the network returns or the tab comes forward.
//
// The disk is IndexedDB (a photo's bytes ride along as a Blob until they are uploaded). Several tabs can be
// open on one account: a Web Lock lets one at a time flush, and each pass re-reads the store, so a row
// another tab already sent is gone and never goes out twice.
import { RelayError } from "./relay.mjs";

// ---------- the disk ----------
export function memoryStore() {
  const rows = new Map();
  return {
    memory: true,
    async all() { return [...rows.values()]; },
    async put(item) { rows.set(item.id, item); },
    async delete(id) { rows.delete(id); },
    async clear() { rows.clear(); },
  };
}

// IndexedDB, or memory when the browser has none (a private window that refuses it still sends; it just
// cannot outlive the tab).
export function idbStore(name = "yui-web") {
  const idb = globalThis.indexedDB;
  if (!idb) return memoryStore();
  let opened = null;
  const open = () => (opened ||= new Promise((resolve, reject) => {
    const req = idb.open(name, 1);
    req.onupgradeneeded = () => req.result.createObjectStore("outbox", { keyPath: "id" });
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  }));
  const run = async (mode, fn) => {
    const db = await open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction("outbox", mode);
      const r = fn(tx.objectStore("outbox"));
      tx.oncomplete = () => resolve(r?.result);
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error);
    });
  };
  return {
    memory: false,
    all: () => run("readonly", (s) => s.getAll()).then((x) => x || []),
    put: (item) => run("readwrite", (s) => s.put(item)),
    delete: (id) => run("readwrite", (s) => s.delete(id)),
    clear: () => run("readwrite", (s) => s.clear()),
  };
}

// One flusher at a time across tabs, where the browser has Web Locks; else just this tab.
const withLock = (name, fn) => (globalThis.navigator?.locks ? navigator.locks.request(name, fn) : fn());

// A failure that will never pass (not a network blip): drop it so it cannot block the rest.
export const refused = (e) => e instanceof RelayError && e.status >= 400 && e.status < 500 && e.status !== 401 && e.status !== 408 && e.status !== 429;

export function createOutbox({ send, store = memoryStore(), owner = null, lock = "yui-outbox", onSent = () => {}, onState = () => {}, wait = (ms) => new Promise((r) => setTimeout(r, ms)) }) {
  let mem = [];            // what is waiting, oldest first (a mirror of the store, for the screen)
  let running = false, failures = 0, kick = null, last = 0;
  // Strictly increasing, so two sends in one millisecond still go out in the order they were made.
  const stamp = () => (last = Math.max(Date.now(), last + 1));
  const listeners = new Set();
  const emit = (e) => { for (const fn of listeners) { try { fn(e); } catch { /* a listener must not stop the queue */ } } };
  const state = () => { const s = { pending: mem.length, offline: failures > 0 }; onState(s); emit({ type: "state", ...s }); };
  const order = (list) => list.sort((a, b) => (a.queuedAt || 0) - (b.queuedAt || 0) || (a.id < b.id ? -1 : 1));

  // Re-read the disk: another tab may have sent or added rows. Another account's leftovers go (Outbox.swift).
  async function sync() {
    let all = [];
    try { all = await store.all(); } catch { all = mem; }
    const mine = [];
    for (const it of all) {
      if (owner && it.userId && it.userId !== owner) { store.delete(it.id).catch(() => {}); continue; }
      mine.push(it);
    }
    mem = order(mine);
  }

  async function pass() {
    for (;;) {
      await sync();
      const item = mem[0];
      if (!item) { state(); return; }
      try {
        await send(item);
        await store.delete(item.id).catch(() => {});
        mem = mem.filter((x) => x.id !== item.id);
        failures = 0;
        onSent(item);
        emit({ type: "sent", item });
        state();
      } catch (e) {
        if (refused(e)) {
          await store.delete(item.id).catch(() => {});
          mem = mem.filter((x) => x.id !== item.id);
          onSent(item, e);
          emit({ type: "refused", item, error: e });
          state();
          continue;
        }
        failures += 1;
        state();
        await Promise.race([wait(Math.min(30000, 1000 * 2 ** (failures - 1))), new Promise((r) => { kick = r; })]);
        kick = null;
      }
    }
  }

  async function run() {
    if (running) return;
    running = true;
    try { await withLock(lock, pass); } finally { running = false; }
  }

  return {
    // Written to disk first, then tried. Resolves once it is kept.
    async add(item) {
      const full = { ...item, id: String(item.id).toLowerCase(), ...(owner && !item.userId ? { userId: owner } : {}), queuedAt: item.queuedAt || stamp() };
      if (mem.some((x) => x.id === full.id)) return full;
      mem = order([...mem, full]);
      emit({ type: "added", item: full });
      state();
      try { await store.put(full); } catch { /* memory only: it still sends */ }
      run();
      return full;
    },
    // Opened (or signed in): what a closed tab left behind goes out now.
    async load() { await sync(); state(); run(); return mem.slice(); },
    // The network came back or the tab came forward: try now.
    retry() { kick?.(); run(); },
    pending: () => mem.slice(),
    isPending: (id) => mem.some((x) => x.id === String(id).toLowerCase()),
    // Sign out: what was waiting belonged to that account.
    async clear() { mem = []; await store.clear().catch(() => {}); state(); },
    subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); },
  };
}
