// Keeps a Thread (thread.mjs) current against a relay (relay.mjs, or the fake one in demo.mjs), the way
// Presets/ChatStore.swift `refresh` does: one read when it opens, then a poll that overlaps the last row by
// 10 s (a row can commit after a later one; ids dedupe), a ~1 s look at the person's newest row while the
// agent works (pickup, `doing`, finished), and the realtime socket as a faster path that never replaces the
// poll. Sending goes through the outbox, so a dropped network never loses a message.
import { before } from "./thread.mjs";
import { createOutbox } from "./outbox.mjs";
import { mediaPath, mentionBody, mentionMeta, photoBody, photoMeta, reactionBody, reactionMeta, reactionOf, replyBody, replyMeta, rowOf } from "./compose.mjs";
import { echoFor, eventLine, relays, valueOf } from "../../../mcp-app/src/events.mjs";
import { attachBody, typedBody } from "../yl/yl.mjs";

export const IDLE_POLL = 1500;   // ChatStore.idlePoll
export const SOCKET_POLL = 6000; // the socket is up: the poll is only the safety net
export const TURN_CHECK = 900;   // ChatStore.turnCheck

const uuid = () => (globalThis.crypto?.randomUUID?.() ?? "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (c) => (c ^ (Math.random() * 16 >> c / 4)).toString(16)));

export class ThreadSync {
  // `outbox` is the one the whole page shares (what a closed tab left behind goes out from there); a thread
  // opened on its own (the tests) gets a private one that lives in memory.
  constructor({ relay, thread, userId, agentId, chatId = null, outbox = null, timers = { set: (fn, ms) => setTimeout(fn, ms), clear: (t) => clearTimeout(t) }, onStatus = () => {}, turnCheck = TURN_CHECK }) {
    Object.assign(this, { relay, thread, userId, agentId, chatId, timers, onStatus, turnCheck });
    this.socket = false;
    this.offline = false;
    this.alive = false;
    this.turnCheckedAt = 0;
    this.outbox = outbox || createOutbox({ send: (item) => (relay.deliver ? relay.deliver(item) : relay.post(item)), owner: userId });
  }

  #mine(item) { return item.agentId === this.agentId && (item.chatId || null) === (this.chatId || null); }

  // What this thread's outbox events mean for it: a row that landed stops looking pending; a refused one says so.
  #listen(e) {
    if (e.type === "state") { this.offline = e.offline; this.onStatus({ offline: e.offline, pending: e.pending }); return; }
    if (!e.item || !this.#mine(e.item)) return;
    // A row this thread never showed (sent in the gap before it opened) is one poll away: fetch it now.
    if (e.type === "sent") { this.#pending(e.item.id, false); if (!this.thread.seen.has(e.item.id.toLowerCase()) && this.alive) this.refresh(); }
    else if (e.type === "refused") { this.#pending(e.item.id, false); this.#failed(e.item.id); }
  }

  // Rows a closed tab left in the outbox are still the person's: show them, pending, in order.
  #rehydrate() {
    for (const item of this.outbox.pending()) {
      if (!this.#mine(item) || this.thread.seen.has(item.id)) continue;
      const row = { id: item.id, sender: "user", body: item.body, kind: item.kind, meta: item.meta || {}, created_at: new Date(item.queuedAt || Date.now()).toISOString(), _local: (item.uploads || []).map((u) => u.blob).filter(Boolean).map((b) => URL.createObjectURL(b)) };
      if (this.thread.addLocal(row, { owes: !item.meta?.mention })) this.#pending(item.id, true);
    }
  }

  async start() {
    this.alive = true;
    this.unlisten = this.outbox.subscribe((e) => this.#listen(e));
    await this.refresh(true);
    this.#rehydrate();
    this.unsubscribe = this.relay.subscribe?.({ agentId: this.agentId }, (row) => {
      // A realtime row lands the same way a polled one does.
      if (this.thread.add(row)) this.thread.cursor = row.created_at > (this.thread.cursor || "") ? row.created_at : this.thread.cursor;
    }, (s) => { this.socket = s === "open"; });
    this.#schedule();
    if (typeof document !== "undefined") {
      this.onShow = () => { if (!document.hidden) { this.outbox.retry(); this.refresh(); } };
      document.addEventListener("visibilitychange", this.onShow);
      globalThis.addEventListener?.("online", this.onShow);
    }
  }

  stop() {
    this.alive = false;
    this.timers.clear(this.timer);
    this.unsubscribe?.();
    this.unlisten?.();
    if (this.onShow) { document.removeEventListener("visibilitychange", this.onShow); globalThis.removeEventListener?.("online", this.onShow); }
  }

  #schedule() {
    if (!this.alive) return;
    this.timer = this.timers.set(async () => { await this.refresh(); this.#schedule(); }, this.socket ? SOCKET_POLL : IDLE_POLL);
  }

  async refresh(first = false) {
    const t = this.thread;
    try {
      const rows = await this.relay.fetchRows({ agentId: this.agentId, chatId: this.chatId, since: first ? null : t.cursor && before(t.cursor, 10), limit: 100 });
      t.load(rows, { first });
      // About once a second while the agent works: the host writes `doing` onto the person's row.
      if (t.waiting && Date.now() - this.turnCheckedAt > this.turnCheck && this.outbox.pending().length === 0) {
        this.turnCheckedAt = Date.now();
        const row = await this.relay.newestFromUser({ agentId: this.agentId, chatId: this.chatId });
        if (row && t.waiting) t.track(row);
      }
      this.error = null;
    } catch (e) {
      this.error = e;
      t.loaded = true;
      t.changed();
    }
  }

  // The person typed something (and maybe attached photos). False when there is nothing to send.
  //   screen   said on a page that keeps talking (`>2 talk`, ScreenTalk.swift): `[yui] screen=2`, then the words
  //   mention  an agent (compose.mjs `mentionTarget`): the words go to that one, with this thread's last lines
  //   reply    the quote this answers (compose.mjs `replyQuote`), above the words
  //   photos   [{ blob, type }] already shrunk (photo.mjs); they go up first, the row carries their bucket paths
  //   about    the Controls item the words are about (TalkAbout.swift): `[yui] attach section= id= rev=` first
  send(text, { screen = null, mention = null, reply = null, photos = [], about = null } = {}) {
    const words = String(text || "").trim();
    if (!words && !photos.length) return false;
    const command = words.startsWith("/");
    if (screen && !command && !photos.length) {
      const body = typedBody(String(screen), words);
      this.#out({ id: uuid(), body, kind: "text", meta: body === words ? null : { screen: String(screen) } });
      return true;
    }
    const uploads = photos.map((p) => ({ path: mediaPath(this.userId, this.agentId, uuid()), blob: p.blob, type: p.type || p.blob.type || "image/jpeg" }));
    const said = photoBody(words, uploads.length);
    const base = photoMeta(uploads.map((u) => u.path));
    const local = uploads.map((u) => URL.createObjectURL(u.blob));
    if (mention) {
      // A reply quote would point at a row the other agent cannot see, so it stays here.
      this.#out({ id: uuid(), body: mentionBody(said, mention), kind: "text", meta: mentionMeta(base, mention), uploads }, { owes: false, local });
    } else {
      const q = command ? null : reply;
      const talk = command ? null : about;
      const body = talk ? attachBody(talk, replyBody(said, q)) : replyBody(said, q);
      const meta = replyMeta(base, q);
      this.#out({ id: uuid(), body, kind: "text", meta: talk && body !== replyBody(said, q) ? { ...(meta || {}), about: { section: talk.section, id: talk.id, title: talk.title } } : meta, uploads }, { local });
    }
    return true;
  }

  // A reaction on the agent's message (Presets/ChatStore.swift `react`): the same one again takes it back,
  // another replaces it. It goes to the agent as one event turn and the badge shows at once.
  react(messageId, pick) {
    const t = this.thread;
    const m = t.messages.find((x) => x.id === messageId);
    if (!m || m.role !== "agent" || m.from) return false;
    const row = rowOf(m.id);
    const old = reactionOf(t.reactions.get(row));
    const next = pick && old && pick.emoji === old.emoji ? null : pick;
    if (!next && !old) return false;
    if (next && old && next.emoji === old.emoji) return false;
    t.setReaction(row, next ? next.emoji : null);
    const quoting = t.messages.filter((x) => rowOf(x.id) === row && x.role === "agent" && x.yl == null).map((x) => x.text).join("\n");
    this.#out({ id: uuid(), body: reactionBody({ msg: row, reaction: next, changed: !!old && !!next, quoting }), kind: "event", meta: reactionMeta({ msg: row, reaction: next }) }, { owes: true });
    return true;
  }

  // A tap on a screen: the same row the phone sends (Presets/ChatStore.swift `receive`). It shows its echo at
  // once; it goes to the agent only when the person answered something, something finished, or it is a
  // game move. A quiet event (a timer starting, a checklist tick) stays on the page.
  // `_echo` is the words a screen picks for its own echo (a take: "Sent a take, 7 s"); it never rides the wire.
  tap(full, said = null) {
    const { _echo, ...ev } = full;
    const echo = said ?? _echo ?? echoFor(ev);
    if (!relays(ev, echo)) return null;
    const meta = { id: ev.id, preset: ev.preset, value: valueOf(ev), ...(echo != null ? { echo } : {}) };
    const row = { id: uuid(), body: eventLine(ev), kind: "event", meta };
    this.#out(row);
    return row;
  }

  // Stop the agent's turn (YUI-190): a control row the host reads, and a quiet "Stopped." in the thread.
  stopTurn() {
    this.#out({ id: uuid(), body: "stop", kind: "control", meta: null });
  }

  #out(row, { owes = true, local = null } = {}) {
    const t = this.thread;
    const item = { ...row, userId: this.userId, agentId: this.agentId, chatId: this.chatId || null };
    const full = { ...row, sender: "user", created_at: new Date().toISOString(), ...(local?.length ? { _local: local } : {}) };
    delete full.uploads;
    if (row.kind === "control") t.add(full);
    else if (t.addLocal(full, { owes })) this.#pending(row.id, true);
    // A reaction has no bubble, but the agent still owes it an answer (every reaction is a turn).
    else if (row.kind === "event" && owes && row.meta?.react) { t.owe(); t.changed(); }
    this.outbox.add(item);
  }

  #pending(id, on) {
    const m = this.thread.messages.find((x) => x.id === id.toLowerCase());
    if (m && m.pending !== on) { m.pending = on; this.thread.changed(); }
  }

  #failed(id) {
    const m = this.thread.messages.find((x) => x.id === id.toLowerCase());
    if (m) { m.failed = true; this.thread.waiting = false; this.thread.changed(); }
  }
}
