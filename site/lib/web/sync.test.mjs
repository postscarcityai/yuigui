// node --test lib/web/sync.test.mjs   (YUI-242: send, tap and the working row, on the demo relay)
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createDemoRelay } from "./demo.mjs";
import { Thread } from "./thread.mjs";
import { ThreadSync } from "./sync.mjs";
import { eventLine } from "../../../mcp-app/src/events.mjs";

const fixture = JSON.parse(readFileSync(new URL("../../app/web/fixtures/penny.json", import.meta.url), "utf8"));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const until = async (fn, ms = 4000) => { const t = Date.now(); while (!fn()) { if (Date.now() - t > ms) throw new Error("timed out"); await sleep(5); } };
async function open(agentId = "demo-penny") {
  const relay = createDemoRelay(fixture, { speed: 5 });
  const thread = new Thread();
  const timers = { set: (fn, ms) => setTimeout(fn, ms / 50), clear: clearTimeout };
  const sync = new ThreadSync({ relay, thread, userId: "demo-user", agentId, timers, turnCheck: 5 });
  await sync.start();
  return { relay, thread, sync };
}

test("the recorded thread opens: bubbles and screens in order, nothing waiting", async () => {
  const { thread, sync } = await open();
  assert.equal(thread.loaded, true);
  assert.equal(thread.waiting, false);
  assert.equal(thread.messages.filter((m) => m.yl).length >= 3, true);
  assert.equal(thread.messages.some((m) => m.text === "Add all three" && m.role === "user"), true); // the echo of the tap
  sync.stop();
});

test("fixture rows keep the real column shape (spec/RELAY.md)", () => {
  const cols = new Set(["id", "sender", "body", "kind", "meta", "ago_min", "chat_id"]);
  for (const [agent, rows] of Object.entries(fixture.threads)) for (const r of rows) {
    assert.deepEqual(Object.keys(r).filter((k) => !cols.has(k)), [], `${agent}/${r.id}`);
    assert.match(r.id, /^[0-9a-f-]{36}$/);
    assert.ok(["user", "agent"].includes(r.sender));
    assert.ok(["text", "event"].includes(r.kind));
    assert.ok(r.body.length >= 1 && r.body.length <= 32000);
    if (r.kind === "event") { assert.equal(r.sender, "user"); assert.ok(r.body.startsWith("[yui] ")); assert.equal(r.meta.id, r.body.split(" ")[1]); }
  }
});

test("send: the bubble shows at once, the working row runs with the agent's doing words, the reply ends it", async () => {
  const { thread, sync, relay } = await open();
  assert.equal(sync.send("  can you move friday?  "), true);
  assert.equal(thread.messages.at(-1).text, "can you move friday?");
  assert.equal(thread.waiting, true);
  const seen = new Set();
  await until(() => { if (thread.doing?.text) seen.add(thread.doing.text); return !thread.waiting && thread.messages.at(-1).role === "agent"; });
  assert.ok(seen.has("Reading your week"), [...seen].join("|"));
  assert.equal(thread.messages.some((m) => m.yl && m.state.screens["1"][0]?.id === "rest"), true);
  assert.equal(relay.wire("demo-penny").at(-1).body, "can you move friday?");
  assert.equal(sync.send("   "), false);
  sync.stop();
});

test("a tap sends the phone's line byte for byte; a quiet one stays on the page", async () => {
  const { thread, sync, relay } = await open("demo-yui");
  const ev = { id: "n1", preset: "choose", choice: "Timer" };
  const row = sync.tap(ev);
  assert.equal(row.body, "[yui] n1 choose choice=Timer");
  assert.equal(row.body, eventLine(ev));
  assert.deepEqual(row.meta, { id: "n1", preset: "choose", value: { choice: "Timer" }, echo: "Timer" });
  assert.equal(thread.messages.at(-1).text, "Timer"); // the echo, as the person's bubble
  const changed = sync.tap({ id: "n1", preset: "choose", choice: "Form", changed: true });
  assert.equal(changed.body, "[yui] n1 choose changed choice=Form");
  assert.equal(sync.tap({ id: "hiit", preset: "timer", started: true }), null); // a timer starting is quiet
  await until(() => relay.wire("demo-yui").length === 2);
  assert.deepEqual(relay.wire("demo-yui").map((r) => r.body), ["[yui] n1 choose choice=Timer", "[yui] n1 choose changed choice=Form"]);
  assert.equal(relay.wire("demo-yui")[0].kind, "event");
  sync.stop();
});

test("the same row coming back from the poll adds nothing twice", async () => {
  const { thread, sync } = await open();
  sync.send("one");
  await until(() => !thread.waiting);
  const mine = thread.messages.filter((m) => m.role === "user" && m.text === "one");
  assert.equal(mine.length, 1);
  sync.stop();
});

test("stop leaves one quiet note and starts no turn", async () => {
  const { thread, sync, relay } = await open();
  sync.stopTurn();
  assert.equal(thread.messages.at(-1).card, "stopped");
  assert.equal(thread.waiting, false);
  await until(() => relay.wire("demo-penny").some((r) => r.body === "stop"));
  sync.stop();
});

// ---------- the composer (YUI-244) ----------
import { createOutbox, memoryStore } from "./outbox.mjs";
import { replyQuote } from "./compose.mjs";
import { REACTIONS } from "./compose.mjs";
const agent = (id) => fixture.agents.find((a) => a.id === id);
const U = "demo-user";
// The wire holds the recorded history too: wait for what this test sends.
const sentSince = async (relay, agentId, n0, n = 1) => { await until(() => relay.wire(agentId).length >= n0 + n); return relay.wire(agentId).slice(n0); };

test("a reply goes out as the app's line with the quote in meta, and shows as a chip", async () => {
  const { thread, sync, relay } = await open();
  const target = thread.messages.find((m) => m.role === "agent" && m.text);
  const q = replyQuote(target);
  const n0 = relay.wire("demo-penny").length;
  assert.equal(sync.send("move it to Thursday", { reply: q }), true);
  const [w] = await sentSince(relay, "demo-penny", n0);
  assert.equal(w.body, `[yui] reply to=${q.msg} from=agent quote="${q.quote.replace(/"/g, '\\"')}"\nmove it to Thursday`);
  assert.deepEqual(w.meta.reply_to, { msg: q.msg, from: "agent", quote: q.quote });
  const mine = thread.messages.at(-1);
  assert.equal(mine.text, "move it to Thursday");
  assert.equal(mine.replyTo.quote, q.quote);
  sync.stop();
});

test("a slash command never carries a reply or a screen tag", async () => {
  const { thread, sync, relay } = await open("demo-yui");
  const n0 = relay.wire("demo-yui").length;
  sync.send("/new weekly", { reply: { msg: "a", fromUser: false, quote: "x", rows: [] }, screen: "2" });
  const [w] = await sentSince(relay, "demo-yui", n0);
  assert.equal(w.body, "/new weekly");
  assert.deepEqual(w.meta, {});
  sync.stop();
});

test("a mention goes to the other agent: its line, no working row here, its answer comes back with a header", async () => {
  const { thread, sync, relay } = await open("demo-yui");
  const penny = agent("demo-penny");
  const n0 = relay.wire("demo-yui").length;
  sync.send("@Penny can you move Friday?", { mention: penny });
  const [w] = await sentSince(relay, "demo-yui", n0);
  assert.equal(w.body, "[yui] mention to=penny\n@Penny can you move Friday?");
  assert.deepEqual(w.meta.mention, { to: "demo-penny", handle: "penny", name: "Penny" });
  assert.equal(thread.waiting, false);
  assert.equal(thread.messages.at(-1).to, "To Penny");
  await until(() => thread.messages.some((m) => m.from?.name === "Penny"));
  assert.equal(thread.messages.find((m) => m.from).from.agent, "demo-penny");
  assert.equal(thread.waiting, false); // another agent's answer never started or ended this agent's turn
  sync.stop();
});

test("photos go up first, then one row carries their paths; the body is the stand-in; a retry never uploads twice", async () => {
  const { thread, sync, relay } = await open();
  const blob = new Blob(["jpegbytes"], { type: "image/jpeg" });
  const n0 = relay.wire("demo-penny").length;
  assert.equal(sync.send("", { photos: [{ blob }, { blob }] }), true);
  const mine = thread.messages.at(-1);
  assert.equal(mine.text, "");
  assert.equal(mine.photos.length, 2);
  assert.equal(mine.local.length, 2);
  const [w] = await sentSince(relay, "demo-penny", n0);
  assert.equal(w.body, "2 photos");
  assert.equal(w.meta.photos.length, 2);
  for (const p of w.meta.photos) assert.match(p, new RegExp(`^${U}/demo-penny/user/[0-9a-f-]{36}\\.jpg$`));
  assert.equal(await relay.sign(w.meta.photos[0]) !== "", true);
  assert.equal(sync.send("", { photos: [] }), false);
  sync.stop();
});

test("a reaction: the badge shows at once, the agent gets the spec's line, again takes it back, another replaces it", async () => {
  const { thread, sync, relay } = await open();
  const target = thread.messages.find((m) => m.role === "agent" && m.text && !m.yl);
  const row = target.id.split("#")[0];
  const [up, , , , , fire] = REACTIONS;
  const n0 = relay.wire("demo-penny").length;
  assert.equal(sync.react(target.id, up), true);
  assert.equal(thread.reactions.get(row), "👍");
  let w = (await sentSince(relay, "demo-penny", n0))[0];
  assert.match(w.body, new RegExp(`^\\[yui\\] react msg=${row} emoji=👍 meaning="build it"\\n> `));
  assert.deepEqual(w.meta, { react: { msg: row, emoji: "👍" } });
  assert.equal(thread.waiting, true); // every reaction is a turn
  assert.equal(sync.react(target.id, fire), true);
  w = (await sentSince(relay, "demo-penny", n0, 2))[1];
  assert.match(w.body, /^\[yui\] react msg=\S+ emoji=🔥 meaning=priority changed=true\n> /);
  assert.equal(sync.react(target.id, fire), true); // the same again: taken back
  w = (await sentSince(relay, "demo-penny", n0, 3))[2];
  assert.match(w.body, /^\[yui\] react msg=\S+ emoji=none\n> /);
  assert.equal(thread.reactions.has(row), false);
  assert.equal(sync.react(target.id, null), false); // nothing to take back
  assert.equal(thread.messages.filter((m) => m.role === "user" && /react/.test(m.text || "")).length, 0); // never a bubble
  const mineRow = thread.messages.find((m) => m.role === "user");
  assert.equal(sync.react(mineRow.id, up), false); // your own messages take none
  sync.stop();
});

test("what a closed tab left behind shows pending when the thread opens, and goes out once", async () => {
  const store = memoryStore();
  const relay = createDemoRelay(fixture, { speed: 5 });
  await store.put({ id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa", userId: U, agentId: "demo-penny", chatId: null, body: "left behind", kind: "text", meta: null, queuedAt: Date.now() - 5000 });
  let open;
  const gate = new Promise((r) => { open = r; });
  const outbox = createOutbox({ send: async (i) => { await gate; await relay.deliver(i); }, store, owner: U });
  await outbox.load(); // the page opens: the row is found on the disk
  const thread = new Thread();
  const sync = new ThreadSync({ relay, thread, userId: U, agentId: "demo-penny", outbox, timers: { set: (fn, ms) => setTimeout(fn, ms / 50), clear: clearTimeout }, turnCheck: 5 });
  await sync.start();
  assert.equal(thread.messages.at(-1).text, "left behind");
  assert.equal(thread.messages.at(-1).pending, true);
  open();
  await until(() => relay.wire("demo-penny").some((r) => r.body === "left behind"));
  await until(() => thread.messages.find((m) => m.text === "left behind").pending === false);
  await outbox.load(); // a second open: still once
  await new Promise((r) => setTimeout(r, 30));
  assert.equal(relay.wire("demo-penny").filter((r) => r.body === "left behind").length, 1);
  sync.stop();
});
