// node --test lib/web/manage.test.mjs   (YUI-245: the demo host for agents and chats, talk about this, the relay's new calls)
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createDemoRelay } from "./demo.mjs";
import { createRelay, RelayError } from "./relay.mjs";
import { Thread } from "./thread.mjs";
import { ThreadSync } from "./sync.mjs";
import { createComposer } from "./composer.mjs";
import { attachBody, readAttach } from "../yl/yl.mjs";
import { isConnected, isPaired } from "./agents.mjs";

const fixture = JSON.parse(readFileSync(new URL("../../app/web/fixtures/penny.json", import.meta.url), "utf8"));
const shared = JSON.parse(readFileSync(new URL("../../app/web/fixtures/shared.json", import.meta.url), "utf8"));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const until = async (fn, ms = 4000) => { const t = Date.now(); while (!fn()) { if (Date.now() - t > ms) throw new Error("timed out"); await sleep(5); } };

test("add an agent: a code, then its computer pairs, then its gateway listens", async () => {
  const relay = createDemoRelay(fixture, { speed: 20 });
  const made = await relay.manage.create({ name: "  Nova  ", color: "mint" });
  assert.equal(made.agent.name, "Nova");
  assert.equal(made.agent.handle, "nova");
  assert.match(made.pairing.code, /^\d{6}$/);
  assert.ok(Date.parse(made.pairing.expires_at) > Date.now() + 9 * 60000);
  let a = (await relay.agents()).agents.find((x) => x.id === made.agent.id);
  assert.equal(isPaired(a), false);
  relay.host.pair(a.id);
  a = (await relay.agents()).agents.find((x) => x.id === a.id);
  assert.equal(isPaired(a), true);
  assert.equal(isConnected(a), false);
  assert.equal(a.presence, "not_listening");
  relay.host.listen(a.id);
  a = (await relay.agents()).agents.find((x) => x.id === a.id);
  assert.equal(isConnected(a), true);
  // a second Nova gets its own handle
  const again = await relay.manage.create({ name: "Nova" });
  assert.equal(again.agent.handle, "nova-2");
  const fresh = await relay.manage.pairCode(again.agent.id);
  assert.notEqual(fresh.code, again.pairing.code);
  await assert.rejects(() => relay.manage.create({ name: "   " }), (e) => e.code === "invalid_name");
  await assert.rejects(() => relay.manage.pairCode("nope"), (e) => e.code === "not_found");
});

test("rename, mute, make default, reorder and remove act on the list", async () => {
  const relay = createDemoRelay(fixture);
  await relay.manage.rename("demo-penny", "Penelope");
  await relay.manage.mute("demo-penny", true);
  await relay.manage.makeDefault("demo-penny");
  let list = (await relay.agents()).agents;
  const p = list.find((a) => a.id === "demo-penny");
  assert.deepEqual([p.name, p.push_muted, p.is_default], ["Penelope", true, true]);
  assert.equal(list.filter((a) => a.is_default).length, 1);
  await relay.manage.reorder(["demo-basil", "demo-penny", "demo-yui"]);
  assert.deepEqual((await relay.agents()).agents.map((a) => a.id), ["demo-basil", "demo-penny", "demo-yui"]);
  await relay.manage.setLook("demo-basil", "grape");
  assert.equal((await relay.agents()).agents[0].theme.preset, "grape");
  assert.deepEqual(await relay.manage.remove("demo-penny"), { deleted: true });
  list = (await relay.agents()).agents;
  assert.deepEqual(list.map((a) => a.id), ["demo-basil", "demo-yui"]);
  assert.equal(list.filter((a) => a.is_default).length, 1, "a default is left");
  assert.deepEqual(await relay.fetchRows({ agentId: "demo-penny" }), [], "its thread went with it");
  await assert.rejects(() => relay.manage.rename("demo-penny", "x"), (e) => e.code === "not_found");
});

test("the crew: one tap adds, a tap on a present one adds nothing, add all fills the rest", async () => {
  const relay = createDemoRelay(fixture);
  const r = await relay.manage.crewAdd("arnold");
  assert.equal(r.agent.id, "demo-arnold");
  assert.equal((await relay.manage.crewAdd("arnold")).agent.id, "demo-arnold");
  assert.equal((await relay.agents()).agents.filter((a) => a.id === "demo-arnold").length, 1);
  const all = await relay.manage.crewAddAll();
  assert.deepEqual(all.added.sort(), ["gouda", "quill"]);
  const { crew } = await relay.agents();
  assert.ok(crew.every((c) => c.agent_id));
});

test("an agent given to you: shared fields come through the list", async () => {
  const relay = createDemoRelay(shared);
  const { agents, first_name } = await relay.agents();
  assert.equal(first_name, "Maya");
  assert.deepEqual(agents.map((a) => [a.id, a.shared, a.shared_by]), [["demo-basil", true, "Sam"], ["demo-quill", true, "Sam"]]);
});

test("chats: the first one holds the old rows, a new one starts empty, rename, seen, clear and delete", async () => {
  const relay = createDemoRelay(fixture);
  let list = await relay.chats.list("demo-penny");
  assert.deepEqual(list.map((c) => c.title), [null, "Race week plan", "Groceries"]);
  assert.equal(list[0].is_first, true);
  assert.equal(list[1].last_sender, "agent");
  assert.equal(list[2].last_body, null);
  // a chat's rows are its own
  const c2 = await relay.fetchRows({ agentId: "demo-penny", chatId: "demo-penny-c2" });
  assert.deepEqual(c2.map((r) => r.sender), ["user", "agent"]);
  const c1 = await relay.fetchRows({ agentId: "demo-penny", chatId: "demo-penny-c1" });
  assert.ok(c1.length >= 10 && c1.every((r) => !r.chat_id));
  // a new one: nothing until it is made and said in
  await relay.chats.insert({ id: "new-chat-1", userId: "demo-user", agentId: "demo-penny" });
  await relay.chats.insert({ id: "new-chat-1", userId: "demo-user", agentId: "demo-penny" });
  assert.equal((await relay.chats.list("demo-penny")).length, 4);
  await relay.post({ id: "00000000-0000-4000-8000-0000000000aa", userId: "demo-user", agentId: "demo-penny", chatId: "new-chat-1", body: "hello", kind: "text" });
  await until(async () => true);
  const mine = await relay.fetchRows({ agentId: "demo-penny", chatId: "new-chat-1" });
  assert.equal(mine[0].body, "hello");
  assert.equal(mine[0].chat_id, "new-chat-1");
  assert.equal((await relay.fetchRows({ agentId: "demo-penny", chatId: "demo-penny-c2" })).length, 2);
  await relay.chats.rename("new-chat-1", "Hello chat");
  list = await relay.chats.list("demo-penny");
  assert.equal(list.find((c) => c.id === "new-chat-1").title, "Hello chat");
  await relay.chats.clear("new-chat-1");
  assert.deepEqual(await relay.fetchRows({ agentId: "demo-penny", chatId: "new-chat-1" }), []);
  await relay.chats.remove("new-chat-1");
  assert.equal((await relay.chats.list("demo-penny")).length, 3);
  // the only chat of an agent cannot be deleted
  await assert.rejects(() => relay.chats.remove("demo-yui-c1"), (e) => /last_chat/.test(e.detail));
});

test("an agent's reply lands in the chat the question was asked in", async () => {
  const relay = createDemoRelay(fixture, { speed: 50 });
  const thread = new Thread();
  const timers = { set: (fn, ms) => setTimeout(fn, ms / 50), clear: clearTimeout };
  const sync = new ThreadSync({ relay, thread, userId: "demo-user", agentId: "demo-penny", chatId: "demo-penny-c3", timers, turnCheck: 5 });
  await sync.start();
  assert.equal(thread.messages.length, 0);
  sync.send("What should I buy?");
  await until(() => !thread.waiting && thread.messages.at(-1)?.role === "agent");
  const rows = await relay.fetchRows({ agentId: "demo-penny", chatId: "demo-penny-c3" });
  assert.deepEqual(rows.map((r) => r.sender), ["user", "agent"]);
  assert.ok(rows.every((r) => r.chat_id === "demo-penny-c3"));
  assert.equal((await relay.fetchRows({ agentId: "demo-penny", chatId: "demo-penny-c2" })).length, 2);
  sync.stop();
});

test("talk about this: the attach line goes first, the bubble shows the words and an About tag", async () => {
  const relay = createDemoRelay(fixture, { speed: 50 });
  const thread = new Thread();
  const timers = { set: (fn, ms) => setTimeout(fn, ms / 50), clear: clearTimeout };
  const sync = new ThreadSync({ relay, thread, userId: "demo-user", agentId: "demo-penny", timers, turnCheck: 5 });
  await sync.start();
  const about = { section: "soul", id: "SOUL.md", rev: "b41c09", title: "SOUL.md" };
  try {
  const sent = async (words, opts) => { const n = relay.wire("demo-penny").length; sync.send(words, opts); await until(() => relay.wire("demo-penny").length > n); return relay.wire("demo-penny").at(-1); };
  const wire = await sent("Less playful when I'm working.", { about });
  assert.equal(wire.body, "[yui] attach section=soul id=SOUL.md rev=b41c09\nLess playful when I'm working.");
  assert.equal(wire.body, attachBody(about, "Less playful when I'm working."));
  assert.deepEqual(wire.meta.about, { section: "soul", id: "SOUL.md", title: "SOUL.md" });
  const bubble = thread.messages.at(-1);
  assert.equal(bubble.text, "Less playful when I'm working.");
  assert.equal(bubble.about, "SOUL.md");
  assert.deepEqual(readAttach(wire.body), { section: "soul", id: "SOUL.md", rev: "b41c09", words: "Less playful when I'm working." });
  // a slash command never carries it; a malformed item sends the plain words
  assert.equal((await sent("/help", { about })).body, "/help");
  const plain = await sent("plain", { about: { section: "soul", id: "../x", rev: "b41c09", title: "x" } });
  assert.equal(plain.body, "plain");
  assert.equal(plain.meta.about, undefined);
  } finally { sync.stop(); }
});

test("the chip stays across messages until it is taken off", () => {
  const store = createComposer({ agentId: "a1" });
  const item = { section: "memory", id: "m-3", rev: "abc123", title: "Out of date" };
  store.setAbout(item);
  store.setDraft("that moved");
  assert.deepEqual(store.take().about, item);
  store.setDraft("and again");
  assert.deepEqual(store.take().about, item, "sending does not clear it");
  store.clearAbout();
  store.setDraft("free now");
  assert.equal(store.take().about, null);
  store.destroy();
});

test("the relay's call: the function's own error comes back as .code; a dead network is `network`", async () => {
  const mk = (fetch) => createRelay({ token: async () => "t", fetch, WebSocket: null });
  const ok = mk(async (url, init) => ({ ok: true, json: async () => ({ url, body: JSON.parse(init.body), auth: init.headers.Authorization }) }));
  const r = await ok.call("yui-agents", { action: "list" });
  assert.equal(r.url, "https://txuibjxyfpalzvpneqgp.supabase.co/functions/v1/yui-agents");
  assert.deepEqual(r.body, { action: "list" });
  assert.equal(r.auth, "Bearer t");
  const refuse = mk(async () => ({ ok: false, status: 400, text: async () => '{"error":"invalid_name"}' }));
  await assert.rejects(() => refuse.call("yui-agents", {}), (e) => e.code === "invalid_name" && e.status === 400);
  const html = mk(async () => ({ ok: false, status: 502, text: async () => "<html>" }));
  await assert.rejects(() => html.call("yui-agents", {}), (e) => e.code === "http_502");
  const dead = mk(async () => { throw new TypeError("Failed to fetch"); });
  await assert.rejects(() => dead.call("yui-agents", {}), (e) => e.code === "network");
  assert.ok(new RelayError(500, "").status === 500);
});

test("the relay's control answer asks for the host's row by req", async () => {
  const seen = [];
  const relay = createRelay({ token: async () => "t", WebSocket: null, fetch: async (url) => { seen.push(url); return { ok: true, json: async () => [{ meta: { req: "c-1", ok: true } }] }; } });
  const a = await relay.controlAnswer({ agentId: "a1", req: "c-1" });
  assert.deepEqual(a, { req: "c-1", ok: true });
  const u = new URL(seen[0]);
  assert.equal(u.searchParams.get("kind"), "eq.control");
  assert.equal(u.searchParams.get("sender"), "eq.agent");
  assert.equal(u.searchParams.get("meta->>req"), "eq.c-1");
  assert.equal(u.searchParams.get("agent_id"), "eq.a1");
});
