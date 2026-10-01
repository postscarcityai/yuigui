// One Yui across phone and web (YUI-249): the few things that were per device follow the person through
// `yui_sync_state` (supabase migration 20261001200000): the words half typed in a thread (`draft`) and the
// saved screens taken off the shelf by hand (`shelf-removed`, a JSON map name -> ms). One row per person,
// agent and key; the server stamps `updated_at`, so devices never compare their own clocks with each other,
// only with the server's. Everything else (thread, chats, screens, the shelf's saves, read state) already
// shares through yui_messages and yui_chats. The app twin is Account/SyncState.swift.
//
// Pure: the REST call, the timers and the page's visibility are injected.
import { keepable } from "./compose.mjs";

export const KEYS = ["draft", "shelf-removed"];
const json = { "Content-Type": "application/json", Prefer: "resolution=merge-duplicates,return=minimal" };
const q = (pairs) => new URLSearchParams(pairs).toString().replace(/\+/g, "%2B");

// request(path, init) -> Response (relay.request).
export function createStateClient(request) {
  return {
    async list(agentId) {
      const res = await request(`rest/v1/yui_sync_state?${q([["select", "key,value,device,updated_at"], ["agent_id", `eq.${agentId}`]])}`);
      return res.json();
    },
    put: ({ userId, agentId, key, value, device }) =>
      request(`rest/v1/yui_sync_state?${q([["on_conflict", "user_id,agent_id,key"]])}`, { method: "POST", headers: json, body: JSON.stringify({ user_id: userId, agent_id: agentId, key, value, device }) }),
  };
}

// A short random name for this browser, so a device can tell its own write coming back.
export function deviceName(storage = globalThis.localStorage) {
  try {
    let d = storage?.getItem("yui-device");
    if (!d) { d = `web-${Math.random().toString(36).slice(2, 8)}`; storage?.setItem("yui-device", d); }
    return d;
  } catch { return "web"; }
}

// The shelf's removed map: two devices' lists merge by newest time per name (a name removed on either stays off).
export function mergeRemoved(a, b) {
  const parse = (s) => { try { const v = JSON.parse(s || "{}"); return v && typeof v === "object" && !Array.isArray(v) ? v : {}; } catch { return {}; } };
  const x = parse(a), y = parse(b), out = { ...x };
  for (const [k, t] of Object.entries(y)) if (!(k in out) || t > out[k]) out[k] = t;
  return JSON.stringify(out);
}

// Keeps one key of one agent in step. `read()` is what this device holds, `write(value)` puts a remote value
// there (it must not call `changed`), `at()` is when this device last changed it (ms; 0 if never).
// A remote value wins when it is newer than the last local change and nothing local is waiting to go up; a
// local change that is waiting wins and goes up (last write wins, by the server's clock for the remote side).
export function createKeySync({ client, userId, agentId, key, device, read, write, at = () => 0, merge = null, poll = 5000, delay = 700, setTimer = setTimeout, clearTimer = clearTimeout, setBeat = setInterval, clearBeat = clearInterval, visible = () => globalThis.document?.visibilityState !== "hidden", onError = () => {} }) {
  let pushed = null;      // the value last known to be on the server (from either side)
  let seen = 0;           // the server's updated_at (ms) of the row last adopted or pushed
  let timer = null, beat = null, stopped = true, busy = false, again = false;
  const safe = (v) => (key === "draft" && !keepable(v) ? "" : v);

  async function push() {
    timer = null;
    try {
      // A merging key meets the other device's list before it writes, so neither one's removals are lost.
      if (merge) {
        const row = (await client.list(agentId)).find((r) => r.key === key);
        if (row) { const m = merge(read(), row.value); if (m !== read()) write(m); }
      }
      const value = safe(read());
      if (value === pushed) return;
      await client.put({ userId, agentId, key, value, device });
      pushed = value;
      seen = Date.now();
    } catch (e) { onError(e); }
  }

  async function pull() {
    if (stopped) return;
    if (busy) { again = true; return; }
    busy = true;
    try {
      const rows = await client.list(agentId);
      const row = rows.find((r) => r.key === key);
      const local = read();
      if (!row) {
        if (pushed === null) pushed = "";
        if (local !== pushed) changed();
        return;
      }
      const when = Date.parse(row.updated_at) || 0;
      if (pushed === null) {
        // First look. Remote wins when it was written after this device last changed the value.
        pushed = row.value; seen = when;
        if (merge) { const m = merge(local, row.value); if (m !== local) write(m); if (m !== row.value) { pushed = row.value; changed(); } }
        else if (row.value !== local) { if (when >= at() || !local) write(row.value); else changed(); }
        return;
      }
      if (when <= seen && row.value === pushed) return;
      const waiting = local !== pushed;
      if (merge) {
        const m = merge(local, row.value);
        pushed = row.value; seen = when;
        if (m !== local) write(m);
        if (m !== row.value) changed();
      } else if (row.device === device && row.value === pushed) {
        seen = when;
      } else if (!waiting) {
        pushed = row.value; seen = when;
        if (row.value !== local) write(row.value);
      } else {
        seen = when; pushed = row.value; changed(); // the local words are newer: they go up
      }
    } catch (e) { onError(e); }
    finally { busy = false; if (again) { again = false; pull(); } }
  }

  function changed() {
    if (stopped) return;
    if (timer) clearTimer(timer);
    timer = setTimer(push, delay);
  }

  const wake = () => { if (visible()) pull(); };
  return {
    start() {
      stopped = false;
      pull();
      beat = setBeat(wake, poll);
      globalThis.addEventListener?.("focus", wake);
      globalThis.document?.addEventListener?.("visibilitychange", wake);
    },
    stop() {
      stopped = true;
      if (timer) { clearTimer(timer); timer = null; }
      if (beat) clearBeat(beat);
      globalThis.removeEventListener?.("focus", wake);
      globalThis.document?.removeEventListener?.("visibilitychange", wake);
    },
    changed,
    // Send now (the words were sent, the thread is closing): no waiting for the pause in typing.
    async flush() { if (timer) { clearTimer(timer); timer = null; } await push(); },
    pull,
  };
}
