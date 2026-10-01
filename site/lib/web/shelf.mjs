// The shelf (YUI-246): an agent's saved screens as chips at the top of its thread. The twin of
// Presets/Shelf.swift: rebuilt from the thread's `save` and `forget` lines in the order they were written, newest
// save first, kept per agent so the chips the person took off by hand stay off until the agent saves that name
// again after it. Pure, no DOM; the chips are app/web/ShelfBar.js.

// What the thread's replies did to the shelf: [{ name, stage, at }] newest first. `removed` is name -> when the
// person took it off (ms): only a save written after that brings it back.
export function shelfOf(messages, removed = {}) {
  const entries = new Map();
  for (const m of messages) {
    if (m.role !== "agent" || m.from || !m.ops) continue;
    const at = Number.isFinite(m.at) ? m.at : 0;
    for (const op of m.ops) {
      if (op.op === "save" && op.name) {
        if ((removed[op.name] ?? -1) >= at && removed[op.name] != null) continue;
        const old = entries.get(op.name);
        if (old && old.at > at) continue;
        // `save` after `>full` is the stage (op.screen "full"), and it opens on the stage again.
        entries.set(op.name, { name: op.name, stage: String(op.screen) === "full", at });
      } else if (op.op === "forget" && op.name) {
        const old = entries.get(op.name);
        if (old && old.at <= at) entries.delete(op.name);
      }
    }
  }
  return [...entries.values()].sort((a, b) => (a.at === b.at ? a.name.localeCompare(b.name) : b.at - a.at));
}

// A removed-by-hand list per agent, in the browser's own storage (the shelf file in Application Support).
const key = (agentId) => `yui-shelf-removed-${String(agentId).toLowerCase()}`;
export function loadRemoved(agentId, storage = globalThis.localStorage) {
  try { const v = JSON.parse(storage?.getItem(key(agentId)) || "{}"); return v && typeof v === "object" ? v : {}; } catch { return {}; }
}
export function remove(agentId, name, now = Date.now(), storage = globalThis.localStorage) {
  const next = { ...loadRemoved(agentId, storage), [name]: now };
  try { storage?.setItem(key(agentId), JSON.stringify(next)); } catch { /* private mode: it comes back on reload */ }
  return next;
}

// The removed list as one string, for the person's other devices (state.mjs): read it, and take theirs in.
export const removedText = (agentId, storage = globalThis.localStorage) => JSON.stringify(loadRemoved(agentId, storage));
export function setRemovedText(agentId, text, storage = globalThis.localStorage) {
  try { storage?.setItem(key(agentId), text || "{}"); } catch { /* private mode */ }
}
