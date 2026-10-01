// Past chats in the site chat (SITE-153, the web twin of the app's YUI-254). The bubble keeps many threads
// in this browser's localStorage, not one. { cur, threads: [{ id, at, msgs }] }, newest `at` first in the
// list. New chat files the current thread away and starts an empty one (an empty thread is never kept
// twice). The old single-thread key (`yui-chat-v1`) becomes the first thread and is left in place.
// Twenty threads at most: the oldest drop first, never the one on show.
import { readTyped } from "../yl/yl.mjs";
import { splitReply } from "./lines.mjs";

export const KEY = "yui-chats-v2";
export const LEGACY = "yui-chat-v1";
export const MAX = 20;
export const KEEP = 60; // messages kept per thread

const mk = (msgs = []) => ({ id: `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`, at: msgs.at(-1)?.at || Date.now(), msgs });

// legacy: what the old key held ({ msgs }). saved: what this key held ({ cur, threads }).
export function open(saved, legacy) {
  if (saved?.threads?.length) {
    const threads = saved.threads.filter((t) => t && Array.isArray(t.msgs)).slice(0, MAX);
    if (threads.length) return { cur: threads.some((t) => t.id === saved.cur) ? saved.cur : threads[0].id, threads };
  }
  const first = mk(Array.isArray(legacy?.msgs) ? legacy.msgs : []);
  return { cur: first.id, threads: [first] };
}

export const current = (s) => s.threads.find((t) => t.id === s.cur) || s.threads[0];

// The messages of the thread on show changed: write them in.
export function write(s, msgs) {
  const kept = msgs.slice(-KEEP);
  return { ...s, threads: s.threads.map((t) => (t.id === s.cur ? { ...t, msgs: kept, at: kept.length ? kept.at(-1).at || t.at : t.at } : t)) };
}

// New chat: the thread on show stays in the list; a fresh one opens. Already empty: nothing to add.
export function fresh(s) {
  if (!current(s).msgs.length) return s;
  const t = mk();
  return cap({ cur: t.id, threads: [t, ...s.threads] });
}

export const pick = (s, id) => (s.threads.some((t) => t.id === id) ? { ...s, cur: id } : s);

// Oldest drop first (by last activity). The thread on show always stays.
export function cap(s) {
  if (s.threads.length <= MAX) return s;
  const drop = new Set(s.threads.filter((t) => t.id !== s.cur).sort((a, b) => b.at - a.at).slice(MAX - 1).map((t) => t.id));
  return { ...s, threads: s.threads.filter((t) => !drop.has(t.id)) };
}

const clip = (t, n) => { const s = t.replace(/\s+/g, " ").trim(); return s.length > n ? `${s.slice(0, n - 1).trimEnd()}…` : s; };
const sayOf = (m) => {
  if (m.role === "user") return m.label || readTyped(m.content)?.words || m.content || "";
  return splitReply(m.content || "").find((p) => !p.yl && p.text.trim())?.text || "";
};

// The list row: the title is the first thing the person said, the last line is the newest thing said.
export function row(t) {
  const said = t.msgs.filter((m) => m.role === "user" || m.role === "assistant");
  const first = said.find((m) => m.role === "user");
  const last = [...said].reverse().find((m) => sayOf(m));
  return { id: t.id, at: t.at, title: first ? clip(sayOf(first), 44) || "Chat" : "New chat", last: last ? clip(sayOf(last), 70) : "", empty: !said.length };
}

// Newest first, empty threads left out (the one on show with nothing in it is the New chat row's job).
export const list = (s) => s.threads.filter((t) => t.msgs.length).sort((a, b) => b.at - a.at).map(row);
