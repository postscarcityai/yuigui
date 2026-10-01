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
  const cols = new Set(["id", "sender", "body", "kind", "meta", "ago_min"]);
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
  assert.equal(thread.messages.some((m) => m.yl && m.state.screens["1"][0].id === "rest"), true);
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
