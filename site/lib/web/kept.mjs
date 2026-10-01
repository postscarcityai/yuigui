// What a screen keeps on this device until it is sent (YUI-246): the twins of Presets/ListTicks.swift (a checklist's
// ticks) and Presets/LoopDrafts.swift (a beat on a looper, YUI-184). Per agent and per component id, so a reload, or
// another agent and back, comes back to the same ticks and the same beat. Only a component the agent named
// (`list@aisle-produce`, `loop@beat`) is kept: `n3` is just its place in one reply. Pure; storage is injected.

export const keeps = (agent, id) => !!agent && !!id && !/^n\d+$/.test(String(id));

const store = (storage) => storage ?? globalThis.localStorage;
const read = (k, storage) => { try { return JSON.parse(store(storage)?.getItem(k) || "null"); } catch { return null; } };
const write = (k, v, storage) => { try { if (v == null) store(storage)?.removeItem(k); else store(storage)?.setItem(k, JSON.stringify(v)); } catch { /* private mode */ } };

// ---- list ticks ----
const tk = (agent, id) => `yui.ticks.${agent}.${id}`;
// The ticked items among `items`. Reads only.
export function ticked(agent, id, items, storage) {
  if (!keeps(agent, id)) return new Set();
  const had = read(tk(agent, id), storage);
  return new Set((Array.isArray(had) ? had : []).filter((x) => items.includes(x)));
}
// The list was drawn again: a tick on an item that is no longer there is dropped for good.
export function pruneTicks(agent, id, items, storage) {
  if (!keeps(agent, id)) return;
  const had = read(tk(agent, id), storage);
  if (!Array.isArray(had)) return;
  const now = had.filter((x) => items.includes(x));
  if (now.length !== had.length) write(tk(agent, id), now.length ? now.sort() : null, storage);
}
export function setTick(agent, id, item, on, storage) {
  if (!keeps(agent, id)) return;
  const now = new Set(read(tk(agent, id), storage) || []);
  if (on) now.add(item); else now.delete(item);
  write(tk(agent, id), now.size ? [...now].sort() : null, storage);
}

// ---- loop drafts ----
const dk = (agent, id) => `yui.loop.${agent}.${id}`;
// The loop as the agent drew it: what a draft sits on (LoopDrafts.base).
export const loopBase = ({ p, rows, steps, bpm, swing }) => `${(p || []).join("|")};${rows.join("|")};${steps};${bpm};${swing}`;
// The draft on `base`, if there is one. Reads only.
export function draft(agent, id, base, storage) {
  if (!keeps(agent, id)) return null;
  const d = read(dk(agent, id), storage);
  return d && d.base === base && Array.isArray(d.p) ? { base: d.base, p: d.p, bpm: d.bpm ?? 96, swing: d.swing ?? 0 } : null;
}
// The agent drew the loop again: a draft on a different loop goes for good.
export function pruneDraft(agent, id, base, storage) {
  if (!keeps(agent, id)) return;
  const d = read(dk(agent, id), storage);
  if (d && d.base !== base) write(dk(agent, id), null, storage);
}
export function setDraft(agent, id, d, storage) { if (keeps(agent, id)) write(dk(agent, id), d, storage); }
export function clearDraft(agent, id, storage) { if (keeps(agent, id)) write(dk(agent, id), null, storage); }
