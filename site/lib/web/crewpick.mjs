// First run, pick your crew (Agents/CrewPick.swift, YUI-216): a new account's first minute. Yui is always on the
// crew; each other starter is a tap to add and a short page of its own; "Bring my own agent" is a row in the same
// list that leads into pairing. The answer is saved on the account (yui-agents `crew_choose`), so it never comes back.

/** The starters a person picks from: everyone but Yui. */
export const pickable = (crew) => (crew || []).filter((s) => s.base !== "yui");

/** Yui's row: the starter as the server sent it, or a stand-in with her name. */
export const yuiOf = (crew) => (crew || []).find((s) => s.base === "yui") || { base: "yui", name: "Yui", color: "brand" };

/** The big button: "Start with Yui" until something is picked. */
export const startTitle = (count) => (count > 0 ? `Start with Yui and ${count}` : "Start with Yui");

/** A pick toggled: the same set with the base added or taken out. */
export function toggled(picked, base) {
  const next = new Set(picked);
  if (next.has(base)) next.delete(base); else next.add(base);
  return next;
}

/** The bases to send, in the crew's order, only ones that are on offer. */
export const basesToSend = (crew, picked) => pickable(crew).map((s) => s.base).filter((b) => picked.has(b));

/** The row's spoken label (the app's accessibility label). */
export const rowLabel = (s, on) => (on ? `${s.name}, added` : `Add ${s.name}, ${s.role}`);

export const SAVE_ERROR = "Couldn't save your crew just now. Check your connection and tap again.";
