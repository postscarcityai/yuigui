// The relay client (YUI-242): the browser's twin of Chat/Thread.swift `ThreadClient`, Chat/Outbox.swift and
// the agent list call in Agents/AgentStore.swift. PostgREST on `yui_messages` with the person's `yui_user`
// token (spec/RELAY.md "Credentials"), the same query the app sends, plus the Realtime socket the app
// does not use yet. The token comes from the session (YUI-241) through `token()`; nothing here stores one.
// Every network piece is injected (`fetch`, `WebSocket`) so the tests drive it with stand-ins.

export const BACKEND = "https://txuibjxyfpalzvpneqgp.supabase.co";
// A public client key: it only grants the anon role, which can read no yui_ table (YuiBackend.swift).
export const PUBLISHABLE_KEY = "sb_publishable_9DhcBgazmSHaoOJChYtqwA_qyHvI_zc";

export const COLUMNS = "id,sender,body,kind,meta,created_at,delivered_at,handled_at,reaction,doing";

// The query of a thread read (ThreadClient.fetchItems): the agent's rows, or one chat's. Controls ride the
// same table and never show, except the person's Stop. Newest `limit` rows (read back-to-front), or
// everything after `since`, oldest first with the id as the tie-break.
export function threadQuery({ agentId, chatId = null, since = null, limit = 100 }) {
  const q = [["select", COLUMNS], ["agent_id", `eq.${agentId}`]];
  if (chatId) q.push(["chat_id", `eq.${chatId}`]);
  q.push(["or", "(kind.neq.control,and(sender.eq.user,body.eq.stop))"]);
  if (since) q.push(["created_at", `gt.${since}`], ["order", "created_at.asc,id.asc"]);
  else q.push(["order", "created_at.desc"], ["limit", String(limit)]);
  return q;
}

// "+" in a timestamp ("+00:00") reads as a space in a query: URLSearchParams already writes it as %2B.
export const queryString = (pairs) => new URLSearchParams(pairs).toString();

export class RelayError extends Error {
  constructor(status, detail) {
    super(`http_${status}`);
    this.status = status;
    this.detail = detail;
  }
}

export function createRelay({ url = BACKEND, key = PUBLISHABLE_KEY, token, fetch: doFetch = (...a) => globalThis.fetch(...a), WebSocket: WS = globalThis.WebSocket } = {}) {
  async function request(path, init = {}) {
    const res = await doFetch(`${url}/${path}`, {
      ...init,
      headers: { apikey: key, Authorization: `Bearer ${await token()}`, ...init.headers },
    });
    if (!res.ok) throw new RelayError(res.status, await res.text().catch(() => ""));
    return res;
  }

  const relay = {
    // The newest `limit` rows oldest first, or everything after `since` (pass a `since` a little before
    // the last row seen: a row can commit after a later one, and the ids dedupe the overlap).
    async fetchRows(opts) {
      const res = await request(`rest/v1/yui_messages?${queryString(threadQuery(opts))}`);
      const rows = await res.json();
      return opts.since ? rows : rows.reverse();
    },

    // The person's newest row, for how far the agent's turn on it has got.
    async newestFromUser({ agentId, chatId = null }) {
      const q = [["select", COLUMNS], ["agent_id", `eq.${agentId}`], ["sender", "eq.user"], ["kind", "neq.control"], ["order", "created_at.desc"], ["limit", "1"]];
      if (chatId) q.push(["chat_id", `eq.${chatId}`]);
      const rows = await (await request(`rest/v1/yui_messages?${queryString(q)}`)).json();
      return rows[0] || null;
    },

    // One row from the person. The id is theirs (the outbox chose it), so a resend of a row that already
    // landed hits the primary key (409) and counts as sent.
    async post({ id, userId, agentId, chatId = null, body, kind = "text", meta = null }) {
      const row = { id, user_id: userId, agent_id: agentId, sender: "user", body, kind };
      if (meta) row.meta = meta;
      if (chatId && (kind !== "control" || body === "stop")) row.chat_id = chatId;
      try {
        await request("rest/v1/yui_messages", { method: "POST", headers: { "Content-Type": "application/json", Prefer: "return=minimal" }, body: JSON.stringify(row) });
      } catch (e) {
        if (e instanceof RelayError && e.status === 409) return;
        throw e;
      }
    },

    // The person's agents (yui-agents `list`, like AgentStore.refresh).
    async agents() {
      const res = await request("functions/v1/yui-agents", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "list", crew_pick: true }) });
      return res.json();
    },

    // Realtime: every INSERT on this agent's rows, pushed. `onRow(record)` gets each; `onState("open"|"closed")`
    // says whether the socket is up, so the poll can ease off while it is. Returns the unsubscribe.
    subscribe({ agentId }, onRow, onState = () => {}) {
      if (!WS) return () => {};
      let ws = null, beat = null, retry = null, stopped = false, n = 0, tries = 0;
      const topic = `realtime:yui-thread-${agentId}`;
      const send = (m) => { try { ws.send(JSON.stringify({ ...m, ref: String(++n) })); } catch { /* the close handler retries */ } };
      const open = async () => {
        if (stopped) return;
        let jwt;
        try { jwt = await token(); } catch { return later(); }
        const sock = (ws = new WS(`${url.replace(/^http/, "ws")}/realtime/v1/websocket?apikey=${encodeURIComponent(key)}&vsn=1.0.0`));
        sock.onopen = () => {
          tries = 0;
          send({ topic, event: "phx_join", payload: { config: { broadcast: { ack: false, self: false }, presence: { key: "" }, postgres_changes: [{ event: "INSERT", schema: "public", table: "yui_messages", filter: `agent_id=eq.${agentId}` }] }, access_token: jwt } });
          beat = setInterval(() => send({ topic: "phoenix", event: "heartbeat", payload: {} }), 25000);
        };
        sock.onmessage = (e) => {
          let m; try { m = JSON.parse(e.data); } catch { return; }
          if (m.event === "phx_reply" && m.topic === topic) onState(m.payload?.status === "ok" ? "open" : "closed");
          else if (m.event === "postgres_changes" && m.payload?.data?.type === "INSERT" && m.payload.data.record) onRow(m.payload.data.record);
        };
        sock.onclose = () => { clearInterval(beat); onState("closed"); later(); };
        sock.onerror = () => { try { sock.close(); } catch { /* already closed */ } };
      };
      // Back off 1 s up to 30 s, like the outbox; the poll covers the gap.
      const later = () => { if (!stopped) retry = setTimeout(open, Math.min(30000, 1000 * 2 ** tries++)); };
      open();
      return () => { stopped = true; clearInterval(beat); clearTimeout(retry); try { ws?.close(); } catch { /* gone */ } onState("closed"); };
    },
  };
  return relay;
}

// ---------- the outbox (Chat/Outbox.swift) ----------
// Rows go out oldest first, one at a time, each with an id the sender chose. A failure backs off quietly
// (1 s up to 30 s) and starts over when the network returns or the tab comes forward. A 409 counts as
// sent. The browser's copy lives in memory for the tab; keeping it across a reload is the composer story (YUI-244).
export function createOutbox({ send, onSent = () => {}, onState = () => {}, wait = (ms) => new Promise((r) => setTimeout(r, ms)) }) {
  const queue = [];
  let running = false, failures = 0, kick = null;
  const state = () => onState({ pending: queue.length, offline: failures > 0 });
  async function run() {
    if (running) return;
    running = true;
    while (queue.length) {
      const item = queue[0];
      try {
        await send(item);
        queue.shift();
        failures = 0;
        onSent(item);
        state();
      } catch (e) {
        // A refusal that will never pass (not a network blip): drop it so it cannot block the rest.
        if (e instanceof RelayError && e.status >= 400 && e.status < 500 && e.status !== 401 && e.status !== 408 && e.status !== 429) {
          queue.shift();
          onSent(item, e);
          state();
          continue;
        }
        failures += 1;
        state();
        await Promise.race([wait(Math.min(30000, 1000 * 2 ** (failures - 1))), new Promise((r) => { kick = r; })]);
        kick = null;
      }
    }
    running = false;
  }
  return {
    add(item) { queue.push(item); state(); run(); },
    // The network came back or the tab came forward: try now.
    retry() { kick?.(); run(); },
    pending: () => queue.slice(),
  };
}
