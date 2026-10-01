// node --test lib/web/relay.test.mjs   (YUI-242: the same requests the app sends, with stand-ins for the network)
import test from "node:test";
import assert from "node:assert/strict";
import { COLUMNS, RelayError, createRelay, queryString, threadQuery } from "./relay.mjs";

test("the thread read is the app's query (ThreadClient.fetchItems)", () => {
  const first = Object.fromEntries(threadQuery({ agentId: "a1", limit: 100 }));
  assert.equal(first.select, COLUMNS);
  assert.equal(first.agent_id, "eq.a1");
  assert.equal(first.or, "(kind.neq.control,and(sender.eq.user,body.eq.stop))");
  assert.equal(first.order, "created_at.desc");
  assert.equal(first.limit, "100");
  assert.equal(first.chat_id, undefined);
  const next = Object.fromEntries(threadQuery({ agentId: "a1", chatId: "c1", since: "2026-10-01T12:00:00+00:00" }));
  assert.equal(next.chat_id, "eq.c1");
  assert.equal(next.created_at, "gt.2026-10-01T12:00:00+00:00");
  assert.equal(next.order, "created_at.asc,id.asc");
  assert.equal(next.limit, undefined);
  // a "+" in a timestamp must not turn into a space
  assert.match(queryString(threadQuery({ agentId: "a1", since: "2026-10-01T12:00:00+00:00" })), /gt\.2026-10-01T12%3A00%3A00%2B00%3A00/);
});

function fakeFetch(handler) {
  const calls = [];
  const f = async (url, init = {}) => {
    calls.push({ url, init });
    const r = await handler(url, init, calls.length);
    return { ok: r.status < 400, status: r.status, json: async () => r.json, text: async () => r.text || "" };
  };
  f.calls = calls;
  return f;
}

test("every request carries the key and the person's token", async () => {
  const f = fakeFetch(async () => ({ status: 200, json: [] }));
  const relay = createRelay({ url: "https://x.test", key: "K", token: async () => "T", fetch: f });
  await relay.fetchRows({ agentId: "a1" });
  assert.equal(f.calls[0].init.headers.apikey, "K");
  assert.equal(f.calls[0].init.headers.Authorization, "Bearer T");
  assert.match(f.calls[0].url, /^https:\/\/x\.test\/rest\/v1\/yui_messages\?/);
});

test("the first read comes back oldest first", async () => {
  const f = fakeFetch(async () => ({ status: 200, json: [{ id: "b" }, { id: "a" }] }));
  const relay = createRelay({ url: "https://x.test", token: async () => "T", fetch: f });
  assert.deepEqual((await relay.fetchRows({ agentId: "a1" })).map((r) => r.id), ["a", "b"]);
  assert.deepEqual((await relay.fetchRows({ agentId: "a1", since: "2026-10-01T00:00:00+00:00" })).map((r) => r.id), ["b", "a"]);
});

test("a post is the app's row; a 409 counts as sent; other refusals throw", async () => {
  const f = fakeFetch(async (_u, _i, n) => (n === 1 ? { status: 201 } : n === 2 ? { status: 409 } : { status: 403, text: "no" }));
  const relay = createRelay({ url: "https://x.test", token: async () => "T", fetch: f });
  const row = { id: "i1", userId: "u1", agentId: "a1", chatId: "c1", body: "[yui] n1 choose choice=A", kind: "event", meta: { id: "n1", preset: "choose", value: { choice: "A" }, echo: "A" } };
  await relay.post(row);
  const sent = JSON.parse(f.calls[0].init.body);
  assert.deepEqual(sent, { id: "i1", user_id: "u1", agent_id: "a1", sender: "user", body: "[yui] n1 choose choice=A", kind: "event", meta: row.meta, chat_id: "c1" });
  assert.equal(f.calls[0].init.headers.Prefer, "return=minimal");
  await relay.post(row); // 409
  await assert.rejects(relay.post(row), (e) => e instanceof RelayError && e.status === 403);
  // a control other than stop is the agent's settings traffic: no chat id
  await relay.post({ ...row, kind: "control", body: "model x" }).catch(() => {});
  assert.equal("chat_id" in JSON.parse(f.calls[3].init.body), false);
});

test("realtime: joins with the token and a filter, hands over inserts, reports its state, retries", async () => {
  const sockets = [];
  class WS {
    constructor(u) { this.url = u; this.sent = []; sockets.push(this); setTimeout(() => this.onopen?.(), 0); }
    send(m) { this.sent.push(JSON.parse(m)); }
    close() { this.onclose?.(); }
  }
  const relay = createRelay({ url: "https://x.test", key: "K", token: async () => "JWT", fetch: async () => ({}), WebSocket: WS });
  const got = [], states = [];
  const off = relay.subscribe({ agentId: "a1" }, (r) => got.push(r.id), (s) => states.push(s));
  await new Promise((r) => setTimeout(r, 10));
  const ws = sockets[0];
  assert.match(ws.url, /^wss:\/\/x\.test\/realtime\/v1\/websocket\?apikey=K&vsn=1\.0\.0$/);
  const join = ws.sent[0];
  assert.equal(join.event, "phx_join");
  assert.equal(join.payload.access_token, "JWT");
  assert.deepEqual(join.payload.config.postgres_changes, [{ event: "INSERT", schema: "public", table: "yui_messages", filter: "agent_id=eq.a1" }]);
  ws.onmessage({ data: JSON.stringify({ topic: join.topic, event: "phx_reply", payload: { status: "ok" } }) });
  ws.onmessage({ data: JSON.stringify({ topic: join.topic, event: "postgres_changes", payload: { data: { type: "INSERT", record: { id: "r9" } } } }) });
  ws.onmessage({ data: "not json" });
  assert.deepEqual(got, ["r9"]);
  assert.equal(states.at(-1), "open");
  off();
  assert.equal(states.at(-1), "closed");
});
