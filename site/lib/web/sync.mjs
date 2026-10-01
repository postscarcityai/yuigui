// Keeps a Thread (thread.mjs) current against a relay (relay.mjs, or the fake one in demo.mjs), the way
// Presets/ChatStore.swift `refresh` does: one read when it opens, then a poll that overlaps the last row by
// 10 s (a row can commit after a later one; ids dedupe), a ~1 s look at the person's newest row while the
// agent works (pickup, `doing`, finished), and the realtime socket as a faster path that never replaces the
// poll. Sending goes through the outbox, so a dropped network never loses a message.
import { before } from "./thread.mjs";
import { createOutbox } from "./relay.mjs";
import { echoFor, eventLine, relays, valueOf } from "../../../mcp-app/src/events.mjs";
import { typedBody } from "../yl/yl.mjs";

export const IDLE_POLL = 1500;   // ChatStore.idlePoll
export const SOCKET_POLL = 6000; // the socket is up: the poll is only the safety net
export const TURN_CHECK = 900;   // ChatStore.turnCheck

const uuid = () => (globalThis.crypto?.randomUUID?.() ?? "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (c) => (c ^ (Math.random() * 16 >> c / 4)).toString(16)));

export class ThreadSync {
  constructor({ relay, thread, userId, agentId, chatId = null, timers = { set: (fn, ms) => setTimeout(fn, ms), clear: (t) => clearTimeout(t) }, onStatus = () => {}, turnCheck = TURN_CHECK }) {
    Object.assign(this, { relay, thread, userId, agentId, chatId, timers, onStatus, turnCheck });
    this.socket = false;
    this.offline = false;
    this.alive = false;
    this.turnCheckedAt = 0;
    this.outbox = createOutbox({
      send: (item) => relay.post({ ...item, userId, agentId, chatId }),
      onSent: (item, refusal) => { this.#pending(item.id, false); if (refusal) this.#failed(item.id); },
      onState: (s) => { this.offline = s.offline; this.onStatus({ offline: s.offline, pending: s.pending }); },
    });
  }

  async start() {
    this.alive = true;
    await this.refresh(true);
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

  // The person typed something. False when it is empty.
  send(text, { screen = null } = {}) {
    const words = String(text || "").trim();
    if (!words) return false;
    // Said on a page that keeps talking (`>2 talk`, ScreenTalk.swift): `[yui] screen=2`, then the words.
    const body = screen ? typedBody(String(screen), words) : words;
    this.#out({ id: uuid(), body, kind: "text", meta: body === words ? null : { screen: String(screen) } });
    return true;
  }

  // A tap on a screen: the same row the phone sends (Presets/ChatStore.swift `receive`). It shows its echo at
  // once; it goes to the agent only when the person answered something, something finished, or it is a
  // game move. A quiet event (a timer starting, a checklist tick) stays on the page.
  tap(ev, said = null) {
    const echo = said ?? echoFor(ev);
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

  #out(row) {
    const t = this.thread;
    const full = { ...row, sender: "user", created_at: new Date().toISOString() };
    if (row.kind === "control") t.add(full);
    else if (t.addLocal(full)) this.#pending(row.id, true);
    this.outbox.add(row);
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
