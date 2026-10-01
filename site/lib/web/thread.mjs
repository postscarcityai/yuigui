// The web thread (YUI-242): one agent's conversation, built from `yui_messages` rows the way the app builds
// it (Yui/Sources/Presets/ChatStore.swift `add`, Chat/Thread.swift `YuiFence`, Chat/LongText.swift).
// Pure, no DOM and no network: the relay client (relay.mjs) and the fake relay (demo.mjs) both feed
// `add(row)`; the page reads `messages`. Rows can arrive twice or out of order across polls and the
// realtime socket, so the ids dedupe (lowercased, like the app) and `add` says whether the row was new.
import { apply, initialState, lastingIds, pageOf, parse, readTyped } from "../yl/yl.mjs";
import { photoCaption, photoPaths, reactionFrom, rowOf } from "./compose.mjs";

// ---------- fences (Thread.swift YuiFence.split) ----------
// Only a ```yui fence is Yui Lines. Everything else is a bubble. An unclosed fence still renders.
export function splitFence(body) {
  const out = [];
  let text = [], yl = null;
  const flush = () => {
    const t = text.join("\n").trim();
    if (t) out.push({ text: t });
    text = [];
  };
  for (const line of String(body || "").split("\n")) {
    const t = line.trim();
    if (yl === null && t === "```yui") { flush(); yl = []; }
    else if (yl !== null && t === "```") { if (yl.length) out.push({ yl: yl.join("\n") }); yl = null; }
    else if (yl !== null) yl.push(line);
    else text.push(line);
  }
  if (yl && yl.length) out.push({ yl: yl.join("\n") });
  flush();
  return out;
}

// ---------- long answers fold (LongText.swift) ----------
export const FOLD_WORDS = 60;
export const EXCERPT_WORDS = 40;
const ABBREVIATIONS = new Set(["e.g.", "i.e.", "etc.", "vs.", "mr.", "mrs.", "ms.", "dr.", "st.", "no."]);

export const wordCount = (text) => String(text || "").split(/\s+/).filter(Boolean).length;
export const folds = (text) => wordCount(text) > FOLD_WORDS;

function abbreviation(s) {
  const last = s.split(/\s+/).filter(Boolean).pop()?.toLowerCase();
  if (!last) return false;
  const word = last.replace(/^[("']+|[("']+$/g, "");
  if (ABBREVIATIONS.has(word)) return true;
  return /^[a-z]\.$/.test(word); // an initial: "J. Smith"
}

export function sentences(text) {
  const out = [];
  const push = (s) => { const t = s.trim(); if (t) out.push(t); };
  const chars = [...String(text || "")];
  let cur = "";
  for (let i = 0; i < chars.length; i++) {
    const ch = chars[i];
    if (ch === "\n") { push(cur); cur = ""; continue; }
    cur += ch;
    if (!".!?".includes(ch) || !(i + 1 === chars.length || /\s/.test(chars[i + 1]))) continue;
    if (ch === ".") {
      if (abbreviation(cur)) continue;
      const next = chars.slice(i + 1).find((c) => !/\s/.test(c));
      if (next && next !== next.toUpperCase()) continue; // "vs. the": a lowercase word goes on
    }
    push(cur);
    cur = "";
  }
  push(cur);
  return out;
}

const trimEnd = (s) => s.trim().replace(/[.,;:]+$/, "");

// The first whole sentences, up to EXCERPT_WORDS, then an ellipsis.
export function excerpt(text) {
  const all = sentences(String(text || "").trim());
  const out = [];
  let n = 0;
  for (const s of all) {
    const w = wordCount(s);
    if (n + w > EXCERPT_WORDS) break;
    out.push(s);
    n += w;
  }
  // Too little to go on (a short opener before a long sentence): fill with words.
  if (n < EXCERPT_WORDS / 2 && out.length < all.length) {
    out.push(trimEnd(all[out.length].split(/\s+/).filter(Boolean).slice(0, EXCERPT_WORDS - n).join(" ")));
  }
  const joined = out.join(" ");
  return wordCount(joined) < wordCount(text) ? `${trimEnd(joined)}…` : joined;
}

// ---------- the person's rows ----------
const firstLine = (s) => String(s || "").split("\n")[0];

// A reply or mention row starts with one line the app wrote (RELAY.md). The words are what follows.
function userWords(body, meta) {
  // Typed on a page (ScreenTalk.swift): a `[yui] screen=2` line, then the words.
  const typed = meta?.screen && pageOf(String(meta.screen)) > 1 ? readTyped(String(body || "")) : null;
  if (typed) return typed.words.trim();
  let lines = String(body || "").split("\n");
  if (meta?.mention && lines[0]?.startsWith("[yui] mention to=")) lines = lines.slice(1);
  else if (meta?.reply_to && lines[0]?.startsWith("[yui] reply to=")) lines = lines.slice(1);
  else if (meta?.mentioned) lines = lines.filter((l) => !l.startsWith("[yui] mention from=") && !l.startsWith(">"));
  return lines.join("\n").trim();
}

export function sentAt(row) {
  const t = Date.parse(row.created_at);
  return Number.isNaN(t) ? Date.now() : t;
}

// A Postgres timestamp moved back `seconds`, for an overlapping poll (YuiTime.before).
export function before(ts, seconds) {
  const t = Date.parse(ts);
  if (Number.isNaN(t)) return ts;
  return new Date(t - seconds * 1000).toISOString().replace(/\.\d{3}Z$/, "+00:00");
}

// What the agent says it is doing (`doing`, YUI-63): {text?, step?, of?}. Anything else is the working word.
export function doingOf(v) {
  if (!v || typeof v !== "object") return null;
  const text = typeof v.text === "string" ? v.text.trim() : "";
  const d = { text: text || null };
  if (typeof v.step === "number" && typeof v.of === "number" && v.of >= 1 && v.step >= 0 && v.step <= v.of) { d.step = Math.trunc(v.step); d.of = Math.trunc(v.of); }
  return d.text == null && d.step == null ? null : d;
}

export const TURN_WINDOW = 30 * 60 * 1000; // the host's own 30 minutes
const isStop = (row) => row.sender === "user" && row.body === "stop";

export class Thread {
  constructor() {
    this.messages = [];
    this.seen = new Set();
    this.cursor = null; // newest created_at seen, for the next poll
    this.loaded = false;
    this.waiting = false;
    this.waitingSince = null;
    this.pickedUpAt = null;
    this.doing = null;
    this.newestAgentAt = null;
    this.version = 0;
    this.listeners = new Set();
    this.stopped = new Set();
    this.reactions = new Map(); // thread row id -> the emoji on it (Reactions.swift `reactions`)
  }

  subscribe(fn) { this.listeners.add(fn); return () => this.listeners.delete(fn); }
  changed() { this.version += 1; for (const fn of this.listeners) fn(this.version); }

  // The ids that last across the thread's screens, so a patch can reach a component an earlier reply drew.
  lasting() {
    const known = {};
    for (const m of this.messages) if (m.state) Object.assign(known, lastingIds(m.state));
    return known;
  }

  // A tap's echo and a typed message are shown before the relay has them: the outbox calls this with the
  // id it chose, and the poll that brings the same id back adds nothing.
  addLocal(row, { owes = true } = {}) {
    const added = this.add({ created_at: new Date().toISOString(), ...row }, { quiet: true });
    if (added && owes && row.sender === "user" && row.kind !== "control") this.owe();
    this.changed();
    return added;
  }

  // The reaction on a thread row (null takes it off), as the person set it here.
  setReaction(row, emoji) {
    const id = rowOf(row);
    if (emoji) this.reactions.set(id, emoji); else this.reactions.delete(id);
    this.changed();
  }

  // The bubble that wears a row's badge: the agent's last bubble of that row (a text, else its last card).
  wearers() {
    const out = new Map();
    for (let i = this.messages.length - 1; i >= 0; i--) {
      const m = this.messages[i];
      if (m.role !== "agent" || m.from) continue;
      const row = rowOf(m.id);
      if (!out.has(row)) out.set(row, m.id);
    }
    return out;
  }

  // The person sent something the agent has to answer: the working row starts.
  owe() {
    this.waiting = true;
    this.waitingSince = Date.now();
    this.pickedUpAt = null;
    this.doing = null;
  }

  // Rows from a poll, a socket or a history load, oldest first. True when any was new.
  load(rows, { first = false } = {}) {
    let any = false;
    for (const row of rows) if (this.add(row, { quiet: true })) any = true;
    if (first) this.resume(rows);
    const last = rows[rows.length - 1]?.created_at;
    if (last && last > (this.cursor || "")) this.cursor = last;
    this.loaded = true;
    this.changed();
    return any;
  }

  // The thread was opened mid-turn: its newest row is the person's and the agent has not finished it.
  resume(rows, now = Date.now()) {
    const last = rows[rows.length - 1];
    if (!last || last.sender !== "user" || last.kind === "control" || last.handled_at) return;
    const sent = sentAt(last);
    if (now - sent >= TURN_WINDOW) return;
    this.waiting = true;
    this.waitingSince = sent;
    this.pickedUpAt = last.delivered_at ? Date.parse(last.delivered_at) : null;
    this.doing = this.pickedUpAt ? doingOf(last.doing) : null;
  }

  // How far the turn on the person's newest row has got (the 0.9 s check). Finished with no reply after
  // a grace period (a command, a turn that errored): stop waiting.
  track(row, now = Date.now()) {
    if (row.delivered_at) { this.pickedUpAt = Date.parse(row.delivered_at); this.doing = doingOf(row.doing); }
    if (row.handled_at && now - Date.parse(row.handled_at) > 20000) this.waiting = false;
    this.changed();
  }

  // True when the row was new.
  add(row, { quiet = false } = {}) {
    const id = String(row.id).toLowerCase();
    const added = this.#add(row, id);
    if (added && !quiet) this.changed();
    return added;
  }

  #add(row, id) {
    if (row.kind === "control") {
      // Settings traffic never shows; the person's Stop is one quiet note.
      if (!isStop(row) || this.seen.has(id)) return false;
      this.seen.add(id);
      this.waiting = false; this.pickedUpAt = null; this.doing = null;
      this.messages.push({ id, role: "user", card: "stopped", at: sentAt(row) });
      return true;
    }
    if (this.seen.has(id)) return false;
    this.seen.add(id);
    const at = sentAt(row);
    const meta = row.meta && typeof row.meta === "object" ? row.meta : {};
    if (row.sender === "agent" && row.kind === "text" && row.created_at > (this.newestAgentAt || "")) this.newestAgentAt = row.created_at;
    // The reaction the row wears (the server copies it onto the agent's row) and the react events that move it.
    if (row.sender === "agent" && row.reaction) this.reactions.set(id, row.reaction);
    const react = row.sender === "user" && row.kind === "event" ? reactionFrom(meta) : null;
    if (react) { if (react.emoji) this.reactions.set(react.msg, react.emoji); else this.reactions.delete(react.msg); return false; }
    const mentionedAnswer = row.sender === "agent" && meta.mention_reply;
    // Another agent's answer copied in doesn't end this agent's turn.
    if (row.sender === "agent" && !mentionedAnswer) { this.waiting = false; this.pickedUpAt = null; this.doing = null; }

    if (row.sender === "user") {
      if (row.kind === "event") {
        // Only an answer has an echo; the rest stays hidden (RELAY.md).
        const echo = meta.echo;
        if (typeof echo === "string") this.messages.push({ id, role: "user", text: echo, at });
        return typeof echo === "string";
      }
      const photos = photoPaths(meta);
      const m = { id, role: "user", text: photoCaption(userWords(row.body, meta), photos.length), at };
      if (photos.length) m.photos = photos;
      if (row._local?.length) m.local = row._local; // the pictures still on this device (blob: links) until the row is back from the relay
      if (meta.screen && pageOf(String(meta.screen)) > 1) m.screen = String(meta.screen);
      if (meta.reply_to?.quote) m.replyTo = { msg: String(meta.reply_to.msg || "").toLowerCase(), from: meta.reply_to.from === "user" ? "You" : "agent", quote: meta.reply_to.quote, rows: Array.isArray(meta.reply_to.rows) ? meta.reply_to.rows : [] };
      if (meta.mention?.name) m.to = `To ${meta.mention.name}`;
      if (meta.mentioned?.from_name) m.to = `You, from ${meta.mentioned.from_name}'s thread`;
      this.messages.push(m);
      return true;
    }

    const from = mentionedAnswer ? { name: meta.mention_reply.name, handle: meta.mention_reply.handle, agent: String(meta.mention_reply.agent || "").toLowerCase() || null, status: meta.mention_reply.status || null } : null;
    const segs = splitFence(row.body);
    const out = [];
    segs.forEach((seg, i) => {
      const key = `${id}#${i}`;
      if (seg.text !== undefined) { out.push({ id: key, role: "agent", text: seg.text, at, ...(from ? { from } : {}) }); return; }
      if (from) { out.push({ id: key, role: "agent", text: `Sent a screen. It's in ${from.name}'s thread.`, at, from }); return; }
      out.push(this.#screen(key, seg.yl, at));
    });
    this.messages.push(...out);
    return out.length > 0;
  }

  // One fence: its screen. A patch for something an earlier reply drew lands on that reply's screen
  // (`~choose +lock` after the booking is confirmed): the newest match wins.
  #screen(id, text, at) {
    const known = this.lasting();
    let state = initialState();
    const ops = [];
    for (const op of parse(text, known)) {
      if (op.op === "patch" && op.target && !has(state, op.target)) {
        const j = this.#lastIndex((m) => m.state && has(m.state, op.target));
        if (j >= 0) {
          const m = this.messages[j];
          this.messages[j] = { ...m, state: apply(m.state, op), ops: [...m.ops, op], rev: (m.rev || 0) + 1 };
          continue;
        }
      }
      ops.push(op);
      state = apply(state, op);
    }
    return { id, role: "agent", yl: text, state, ops, at, rev: 0 };
  }

  #lastIndex(fn) {
    for (let i = this.messages.length - 1; i >= 0; i--) if (fn(this.messages[i])) return i;
    return -1;
  }
}

const has = (state, target) => Object.values(state.screens || {}).some((list) => list.some((c) => c.id === target || c.preset === target));
