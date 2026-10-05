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

// ---- a flow or plan in progress, and what its forms and mics hold (YUI-279) ----
// The twin of Presets/FlowPresets.swift's kept answers (578c978): the step, the answers, the review, a form's fields
// and a mic's words come back after Back, another agent or a reload, until the flow or plan is sent. Per agent and per
// flow / plan id (`scope`); a form or mic inside one is also kept under it, so the one drop at Send clears them all.
const rk = (agent, id) => `yui.run.${agent}.${id}`;
const fk = (agent, scope, nid) => `yui.form.${agent}.${scope}.${nid}`;
const mk = (agent, scope, nid) => `yui.mic.${agent}.${scope}.${nid}`;
const sk = (agent, scope, nid) => `yui.slide.${agent}.${scope}.${nid}`;
// Inside a kept plan or flow the scope is already one message's, so a part's own place in it (`n2`) is enough.
const keepsIn = (agent, scope, nid) => !!agent && !!nid && (keeps(agent, nid) || !!scope);

// The run kept for `id`, cut down to what the steps still hold. Reads only.
export function heldRun(agent, id, stepIds, storage) {
  if (!keeps(agent, id)) return null;
  const r = read(rk(agent, id), storage);
  if (!r || typeof r !== "object") return null;
  const ids = new Set(stepIds);
  const ans = {};
  if (r.ans && typeof r.ans === "object") for (const [k, v] of Object.entries(r.ans)) if (ids.has(k)) ans[k] = v;
  return { at: typeof r.at === "number" ? r.at : r.at === "review" || ids.has(r.at) ? r.at : null, ans, fromReview: !!r.fromReview };
}
export function holdRun(agent, id, run, storage) {
  if (keeps(agent, id)) write(rk(agent, id), { at: run.at ?? null, ans: run.ans, fromReview: !!run.fromReview }, storage);
}
// Sent: the run goes, and so does every form and mic kept under it.
export function dropRun(agent, id, storage) {
  if (!keeps(agent, id)) return;
  const st = store(storage);
  write(rk(agent, id), null, storage);
  try {
    const gone = [];
    for (let i = 0; i < (st?.length || 0); i++) {
      const k = st.key(i);
      if (k && (k.startsWith(`yui.form.${agent}.${id}.`) || k.startsWith(`yui.mic.${agent}.${id}.`) || k.startsWith(`yui.slide.${agent}.${id}.`))) gone.push(k);
    }
    gone.forEach((k) => st.removeItem(k));
  } catch { /* nothing kept */ }
}

// A form's fields: only the keys it still has. `scope` is the flow or plan it sits in ("" on its own).
export function heldForm(agent, scope, nid, keys, storage) {
  if (!keepsIn(agent, scope, nid)) return {};
  const d = read(fk(agent, scope, nid), storage);
  const out = {};
  if (d && typeof d === "object") for (const [k, v] of Object.entries(d)) if (keys.includes(k)) out[k] = v;
  return out;
}
export function holdForm(agent, scope, nid, v, storage) {
  if (keepsIn(agent, scope, nid)) write(fk(agent, scope, nid), Object.keys(v).length ? v : null, storage);
}

// A mic's words and what was typed in its box: kept only inside a flow or plan, dropped with it.
export function heldMic(agent, scope, nid, storage) {
  if (!scope || !keepsIn(agent, scope, nid)) return { text: "", typed: "" };
  const d = read(mk(agent, scope, nid), storage);
  return { text: typeof d?.text === "string" ? d.text : "", typed: typeof d?.typed === "string" ? d.typed : "" };
}
export function holdMic(agent, scope, nid, m, storage) {
  if (scope && keepsIn(agent, scope, nid)) write(mk(agent, scope, nid), m.text || m.typed ? { text: m.text || "", typed: m.typed || "" } : null, storage);
}

// A slider's place inside a plan or flow, before it is answered (YUI-289): a number, within the slider's own range.
export function heldSlide(agent, scope, nid, min, max, storage) {
  if (!scope || !keepsIn(agent, scope, nid)) return null;
  const v = read(sk(agent, scope, nid), storage);
  return typeof v === "number" && Number.isFinite(v) && v >= min && v <= max ? v : null;
}
export function holdSlide(agent, scope, nid, v, storage) {
  if (scope && keepsIn(agent, scope, nid)) write(sk(agent, scope, nid), Number.isFinite(v) ? v : null, storage);
}
