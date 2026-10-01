// Reminders an agent keeps (YUI-246, Presets/Reminders.swift, YUI-185). A reply that changes them carries the whole
// set in `meta.native.reminders` as `[{key, text, at}]`, `at` in the person's local time ("2026-09-29T08:50"). Each
// set replaces the last one for that agent and an older reply never undoes a newer one. The phone hands them to
// the clock as local notifications; a tab cannot, so the web way is the Notifications API while the tab is open and
// Web Push from the same set when it is closed (YUI-248). Pure scheduling, injected clock and storage: the browser
// bits are in createReminders' arguments.

// "2026-09-29T08:50" as a local Date, or null when it is not a time.
export function reminderDate(at) {
  const p = String(at ?? "").split(/[-T:]/).map((x) => Number.parseInt(x, 10));
  if (p.length < 5 || p.slice(0, 5).some((n) => !Number.isFinite(n))) return null;
  const [y, mo, d, h, mi] = p;
  if (mo < 1 || mo > 12 || d < 1 || d > 31 || h < 0 || h > 23 || mi < 0 || mi > 59) return null;
  const date = new Date(y, mo - 1, d, h, mi, 0, 0);
  return date.getMonth() === mo - 1 ? date : null;
}

// The set in an agent row's meta, or null when the row says nothing about reminders. An empty list is a set (it clears).
export function reminderItems(meta) {
  const list = meta?.native?.reminders;
  if (!Array.isArray(list)) return null;
  return list.flatMap((r) => (r && typeof r.key === "string" && r.key && reminderDate(r.at) ? [{ key: r.key, text: typeof r.text === "string" ? r.text : "", at: r.at }] : []));
}

const KEY = (agent) => `yui-reminders-${String(agent).toLowerCase()}`;
const ASKED = "yui-reminders-asked";

// The scheduler. `notify({ title, body, key, agent })` shows one; `ask()` asks for permission (returns "granted" | ...),
// `permission()` reads it. Timers wake at most every 30 s so a sleeping laptop catches up on its next tick.
export function createReminders({ storage = globalThis.localStorage, now = () => Date.now(), notify, ask = async () => "denied", permission = () => "default", setTimer = setTimeout, clearTimer = clearTimeout, tick = 30000 } = {}) {
  const read = (k) => { try { return JSON.parse(storage?.getItem(k) || "null"); } catch { return null; } };
  const write = (k, v) => { try { storage?.setItem(k, JSON.stringify(v)); } catch { /* private mode */ } };
  const plans = new Map(); // agent -> { name, items, timer, fired:Set }

  const arm = (agent) => {
    const p = plans.get(agent);
    if (!p) return;
    clearTimer(p.timer);
    const t = now();
    for (const it of p.items) {
      const when = reminderDate(it.at)?.getTime();
      if (when == null || p.fired.has(it.key) || when > t) continue;
      p.fired.add(it.key);
      // A reminder that came due while the tab was away by more than a minute is missed, not shown late (a closed
      // tab stops; Web Push covers it): the same as an alarm that is already in the past on the phone.
      if (t - when <= 60000 && permission() === "granted") notify?.({ title: p.name, body: it.text, key: it.key, agent });
    }
    const pending = p.items.filter((it) => !p.fired.has(it.key));
    if (!pending.length) { p.timer = null; return; }
    const next = Math.min(...pending.map((it) => reminderDate(it.at).getTime())) - now();
    p.timer = setTimer(() => arm(agent), Math.max(250, Math.min(next, tick)));
  };

  return {
    // An agent row arrived. `live`: it came while the thread was open (not history on open), so it may ask for
    // permission, once. Returns false when the row says nothing or was older than the set kept.
    take({ meta, agent, name, createdAt, live = false }) {
      const items = reminderItems(meta);
      if (!agent || !items) return false;
      const when = Date.parse(createdAt) || now();
      const had = read(KEY(agent));
      if (had && had.at > when) return false;
      write(KEY(agent), { at: when, name, items });
      const old = plans.get(agent);
      if (old) clearTimer(old.timer);
      plans.set(agent, { name, items, timer: null, fired: new Set(old?.fired || []) });
      const future = items.some((it) => (reminderDate(it.at)?.getTime() ?? 0) > now());
      if (live && future && !read(ASKED) && permission() === "default") { write(ASKED, true); Promise.resolve(ask()).finally(() => arm(agent)); }
      arm(agent);
      return true;
    },
    // What is kept for an agent (oldest first).
    saved(agent) { return (read(KEY(agent))?.items || []).slice().sort((a, b) => a.at.localeCompare(b.at)); },
    // The agent's set from storage back on the clock, when the thread opens before any reply replays it.
    resume(agent) {
      const had = read(KEY(agent));
      if (!had || plans.has(agent)) return false;
      plans.set(agent, { name: had.name, items: had.items, timer: null, fired: new Set() });
      arm(agent);
      return true;
    },
    stop() { for (const p of plans.values()) clearTimer(p.timer); plans.clear(); },
    pending(agent) { const p = plans.get(agent); return p ? p.items.filter((it) => !p.fired.has(it.key)).map((it) => it.key) : []; },
  };
}

// The browser's Notifications API as the three arguments createReminders wants. A tap on the notification brings
// the tab forward (the phone's opens the agent's thread).
export function browserNotifier(onOpen) {
  const has = () => typeof Notification !== "undefined";
  return {
    permission: () => (has() ? Notification.permission : "denied"),
    ask: async () => (has() ? Notification.requestPermission() : "denied"),
    notify({ title, body, key, agent }) {
      if (!has()) return;
      try {
        const n = new Notification(title, { body, tag: `yui.reminder.${agent}.${key}`, silent: false });
        n.onclick = () => { try { window.focus(); } catch { /* not focusable */ } onOpen?.(agent); n.close(); };
      } catch { /* a page that may not make one */ }
    },
  };
}

// One clock for the whole tab, so a reminder set in one agent's thread still goes off while another is open.
let shared = null;
export function sharedReminders() {
  if (!shared && typeof window !== "undefined") shared = createReminders(browserNotifier());
  return shared;
}
