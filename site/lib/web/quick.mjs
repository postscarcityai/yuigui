// Quick actions on the web (YUI-245): the app's Agents/QuickActions.swift. On the phone the `menu shortcut`
// lines that fill an agent's drawer are the candidates for the icon's hold menu. A browser has no icon to hold,
// so the same candidates are a command palette (Cmd or Ctrl + K, and a button in the drawer): every agent's
// shortcuts, a jump to any agent, and the few things the drawer does. Pure; Palette.js draws it.
import { menuOf, parse } from "../yl/yl.mjs";
import { splitFence } from "./thread.mjs";

export const CAP = 4;
export const USED_KEY = "yui-web-quick-used";

// An agent's menu from its rows, oldest first: every ```yui fence's `menu` lines, applied in order (a later line
// with the same id replaces it, `done` takes it away) - the same rule the thread keeps (AgentMenu.apply).
export function menuFromRows(rows) {
  const ops = [];
  const sorted = [...rows].filter((r) => r.sender === "agent" && r.kind !== "control" && /(^|\n)\s*menu /.test(r.body || ""))
    .sort((a, b) => String(a.created_at).localeCompare(String(b.created_at)));
  for (const r of sorted) for (const seg of splitFence(r.body)) if (seg.yl) ops.push(...parse(seg.yl).filter((o) => o.op === "menu"));
  return menuOf(ops);
}

export const keyOf = (agentId, itemId) => `${agentId}/${itemId}`;

// Every shortcut across the agents this person can see. A shared agent's shortcuts are theirs to use too; one that
// was revoked is gone from the list, so it is gone here. Links (url=) are not quick actions.
export function candidates(agents, menus) {
  const out = [];
  for (const a of agents || []) for (const item of menus?.[a.id]?.shortcut || []) {
    if (item.url) continue;
    out.push({ agentId: a.id, agentName: a.name, item, id: keyOf(a.id, item.id) });
  }
  return out;
}

// What the icon would show: the person's picks win; otherwise newest used first, then the drawer's order, one per
// agent before any agent gets a second, up to the cap (QuickActions.pick).
export function pick(all, { picks = null, used = {}, cap = CAP } = {}) {
  if (picks) return picks.map((k) => all.find((c) => c.id === k)).filter(Boolean).slice(0, cap);
  const per = new Map();
  const order = [];
  for (const c of all) { if (!per.has(c.agentId)) { per.set(c.agentId, []); order.push(c.agentId); } per.get(c.agentId).push(c); }
  const at = (c) => used[c.id] || 0;
  for (const [agent, list] of per) per.set(agent, list.map((c, i) => [c, i]).sort((a, b) => (at(b[0]) - at(a[0])) || a[1] - b[1]).map((x) => x[0]));
  const agents = order.map((a, i) => [a, i]).sort((a, b) => (at(per.get(b[0])[0]) - at(per.get(a[0])[0])) || a[1] - b[1]).map((x) => x[0]);
  const out = [];
  for (let round = 0; out.length < cap; round++) {
    let added = false;
    for (const agent of agents) { const list = per.get(agent); if (out.length < cap && round < list.length) { out.push(list[round]); added = true; } }
    if (!added) break;
  }
  return out;
}

// What a tap does (AgentHome.tap / MenuAction.shortcut): words ending in a space are finished in the field.
export function shortcutWords(item) {
  const words = item.say ?? item.label;
  return { words, compose: /\s$/.test(words) };
}

// The palette's rows for a query. `open` is the agent in the thread; `can` says what the person may do (an invited
// account cannot add an agent, a shared agent has no Controls).
export function entries({ agents = [], menus = {}, open = null, used = {}, picks = null, query = "", light = false, can = {}, controls = [] } = {}) {
  const q = String(query || "").trim().toLowerCase();
  const all = candidates(agents, menus);
  const hotKeys = pick(all, { picks, used }).map((c) => c.id);
  const rows = [];
  for (const c of all) rows.push({ kind: "shortcut", id: `s:${c.id}`, title: c.item.label, sub: c.agentName, agentId: c.agentId, item: c.item, hot: hotKeys.includes(c.id), text: `${c.item.label} ${c.agentName} ${c.item.say || ""}` });
  for (const a of agents) rows.push({ kind: "agent", id: `a:${a.id}`, title: `Talk to ${a.name}`, sub: a.id === open?.id ? "Open now" : "Switch agent", agentId: a.id, text: `${a.name} talk to switch agent` });
  if (open) rows.push({ kind: "do", id: "d:new-chat", title: `New chat with ${open.name}`, sub: "Do", action: "new-chat", text: "new chat start conversation" });
  if (can.add !== false) rows.push({ kind: "do", id: "d:add", title: "Add an agent", sub: "Do", action: "add", text: "add agent connect new pair crew" });
  if (open && can.edit !== false) rows.push({ kind: "do", id: "d:edit", title: `Name, look and notifications for ${open.name}`, sub: "Do", action: "edit", text: `edit rename look notifications ${open.name}` });
  for (const s of controls) rows.push({ kind: "do", id: `d:ctl-${s.id}`, title: `${s.title} for ${open?.name}`, sub: "Controls", action: "controls", section: s.id, text: `${s.title} controls ${open?.name}` });
  rows.push({ kind: "do", id: "d:look", title: light ? "Switch to the dark look" : "Switch to the light look", sub: "Do", action: "look", text: "dark light look theme" });
  rows.push({ kind: "do", id: "d:settings", title: "Settings", sub: "Do", action: "settings", text: "settings account appearance look keys help sign out delete about" });
  if (!q) {
    // No query: the ones you use first, then the agents, then what you can do.
    const hot = hotKeys.map((k) => rows.find((r) => r.id === `s:${k}`));
    return [...hot, ...rows.filter((r) => r.kind === "agent"), ...rows.filter((r) => r.kind === "do").slice(0, 4)];
  }
  const words = q.split(/\s+/);
  return rows
    .map((r) => {
      const hay = r.text.toLowerCase();
      if (!words.every((w) => hay.includes(w))) return null;
      const t = r.title.toLowerCase();
      // Starts-with beats contains; a shortcut beats a do.
      const score = (t.startsWith(q) ? 0 : t.includes(q) ? 1 : 2) * 10 + ({ shortcut: 0, agent: 1, do: 2 }[r.kind]);
      return { r, score };
    })
    .filter(Boolean)
    .sort((a, b) => a.score - b.score)
    .map((x) => x.r);
}

export function loadUsed(storage = globalThis.localStorage) {
  try { return JSON.parse(storage.getItem(USED_KEY) || "{}"); } catch { return {}; }
}
export function markUsed(key, now = Date.now(), storage = globalThis.localStorage) {
  const used = loadUsed(storage);
  used[key] = now;
  try { storage.setItem(USED_KEY, JSON.stringify(used)); } catch { /* private mode */ }
  return used;
}
