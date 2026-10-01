// The relay client (YUI-242): the browser's twin of Chat/Thread.swift `ThreadClient`, Chat/Outbox.swift and
// the agent list call in Agents/AgentStore.swift. PostgREST on `yui_messages` with the person's `yui_user`
// token (spec/RELAY.md "Credentials"), the same query the app sends, plus the Realtime socket the app
// does not use yet. The token comes from the session (YUI-241) through `token()`; nothing here stores one.
// Every network piece is injected (`fetch`, `WebSocket`) so the tests drive it with stand-ins.

export const BACKEND = "https://txuibjxyfpalzvpneqgp.supabase.co";
// A public client key: it only grants the anon role, which can read no yui_ table (YuiBackend.swift).
export const PUBLISHABLE_KEY = "sb_publishable_9DhcBgazmSHaoOJChYtqwA_qyHvI_zc";

import { createChatsClient } from "./chats.mjs";
import { createAgentsClient } from "./agents.mjs";

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
  const signed = new Map();
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

    // A photo into the private media bucket under the person's own path (YuiMedia.upload). Nobody overwrites:
    // the same path again (a retry after the first try landed) is a duplicate, which counts as uploaded.
    async upload({ path, blob, type }) {
      try {
        await request(`storage/v1/object/yui-media/${path}`, { method: "POST", headers: { "Content-Type": type || blob.type || "image/jpeg" }, body: blob });
      } catch (e) {
        if (e instanceof RelayError && (e.status === 409 || /duplicate/i.test(e.detail || ""))) return;
        throw e;
      }
    },

    // A link to one of the person's own bucket paths, good for 7 days, kept until it is near expiry (YuiMedia.link).
    async sign(path) {
      const hit = signed.get(path);
      if (hit && hit.until > Date.now() + 300000) return hit.url;
      const res = await request(`storage/v1/object/sign/yui-media/${path}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ expiresIn: 604800 }) });
      const link = (await res.json()).signedURL;
      if (typeof link !== "string") throw new RelayError(502, "no_signed_url");
      const out = `${url}/storage/v1${link}`;
      signed.set(path, { url: out, until: Date.now() + 604800000 });
      return out;
    },

    // What the outbox sends for one item: its photos go up first, then the row (the outbox holds rows).
    async deliver(item) {
      for (const u of item.uploads || []) await relay.upload(u);
      await relay.post(item);
    },

    // The person's agents (yui-agents `list`, like AgentStore.refresh).
    async agents() {
      const res = await request("functions/v1/yui-agents", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "list", crew_pick: true }) });
      return res.json();
    },

    // One edge function call with the person's session (AgentStore.call). A refusal throws with the function's
    // own `{error}` as `.code`; a dead network throws code "network".
    async call(fn, body) {
      let res;
      try {
        res = await request(`functions/v1/${fn}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      } catch (e) {
        if (e instanceof RelayError) {
          let code = `http_${e.status}`;
          try { code = JSON.parse(e.detail || "{}").error || code; } catch { /* not JSON */ }
          const err = new Error(code); err.code = code; err.status = e.status; throw err;
        }
        const err = new Error("network"); err.code = "network"; throw err;
      }
      return res.json();
    },

    // An agent's recent rows that carry `menu` lines, oldest first: what its drawer holds, read without opening its
    // thread (the command palette lists every agent's shortcuts).
    async menuRows(agentId) {
      const q = [["select", "id,sender,kind,body,created_at"], ["agent_id", `eq.${agentId}`], ["sender", "eq.agent"], ["body", "ilike.*menu *"], ["order", "created_at.desc"], ["limit", "40"]];
      const rows = await (await request(`rest/v1/yui_messages?${queryString(q)}`)).json();
      return rows.reverse();
    },

    // The host's answer to a control request (ThreadClient.controlAnswer), by its `req`. Null until it lands.
    async controlAnswer({ agentId, req }) {
      const q = [["select", "meta"], ["agent_id", `eq.${agentId}`], ["kind", "eq.control"], ["sender", "eq.agent"], ["meta->>req", `eq.${req}`], ["limit", "1"]];
      const rows = await (await request(`rest/v1/yui_messages?${queryString(q)}`)).json();
      return rows[0]?.meta || null;
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
  relay.chats = createChatsClient(request);
  relay.manage = createAgentsClient((fn, body) => relay.call(fn, body));
  return relay;
}
