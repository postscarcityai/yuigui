// node --test site/lib/chat/stop.test.mjs (SITE-84): Stop in the site chat. The page drops a reply
// that lands after Stop and keeps one "Stopped." row; the route ends the model call when the request
// is aborted and stores nothing for that turn.
import assert from "node:assert/strict";
import test from "node:test";
import { STOPPED, kept, stoppedRow, stopped, turnSignal, turns } from "./stop.mjs";

test("a stopped turn is not live, so its late reply is dropped", () => {
  const t = turns();
  const a = t.start();
  assert.ok(t.live(a.id));
  assert.equal(t.stop(), true);
  assert.equal(a.signal.aborted, true);
  assert.equal(t.live(a.id), false, "a reply for the stopped turn must not land");
  assert.equal(t.stop(), false, "nothing left to stop");
  const b = t.start();
  assert.ok(t.live(b.id), "the person can go again at once");
  assert.equal(t.live(a.id), false);
  t.done(b.id);
  assert.equal(t.live(b.id), false);
});

test("a new turn aborts one still in flight", () => {
  const t = turns();
  const a = t.start(), b = t.start();
  assert.equal(a.signal.aborted, true);
  assert.equal(t.live(a.id), false);
  assert.ok(t.live(b.id));
});

test("the Stopped. row is quiet: no role, so it never goes to Yui", () => {
  assert.equal(STOPPED, "Stopped.");
  const row = stoppedRow();
  assert.equal(row.card, "stopped");
  assert.equal(row.role, undefined);
  // ChatFab's history filter: rows with a role and no card.
  const history = [{ role: "user", content: "hi" }, row].filter((m) => m.role && !m.card);
  assert.deepEqual(history, [{ role: "user", content: "hi" }]);
});

test("a stopped ask is taken back: it never goes to Yui as history", () => {
  const thread = [
    { role: "user", content: "hi" }, { role: "assistant", content: "Hello." },
    { role: "user", content: "Tell me the whole story, slowly" }, stoppedRow(),
    { card: "went", path: "/start" },
  ];
  assert.deepEqual(kept(thread).map((m) => m.content), ["hi", "Hello."]);
});

test("turnSignal follows the person's abort", () => {
  const c = new AbortController();
  const s = turnSignal(c.signal, 30000);
  assert.equal(stopped(s), false);
  c.abort();
  assert.equal(stopped(s), true);
});

// The route, end to end, with the model and the store faked through fetch.
async function run({ abortAt }) {
  Object.assign(process.env, { YUI_CHAT_OPENROUTER_KEY: "test", YUI_SUPABASE_URL: "http://store.test", YUI_SUPABASE_SERVICE_ROLE_KEY: "test", YUI_CHAT_API_URL: "http://model.test/v1/chat/completions" });
  const calls = { model: 0, store: 0 };
  const ctrl = new AbortController();
  const real = globalThis.fetch;
  globalThis.fetch = async (url, init = {}) => {
    const u = String(url);
    if (u.startsWith("http://store.test")) { calls.store += 1; return new Response(null, { status: 201 }); }
    calls.model += 1;
    if (abortAt === "model") {
      // A slow model: it answers only when aborted, the way fetch does.
      setTimeout(() => ctrl.abort(), 20);
      await new Promise((_, no) => init.signal.addEventListener("abort", () => no(init.signal.reason), { once: true }));
    }
    if (abortAt === "after") ctrl.abort(); // the answer arrives just as the person hits Stop
    return Response.json({ choices: [{ message: { role: "assistant", content: "Here is a slow answer." } }] });
  };
  try {
    const { POST } = await import("../../app/api/chat/route.js");
    const req = new Request("http://localhost/api/chat", {
      method: "POST", signal: ctrl.signal, headers: { "Content-Type": "application/json", "x-forwarded-for": `10.0.0.${Math.floor(Math.random() * 250)}` },
      body: JSON.stringify({ action: "say", text: "Tell me everything about Yui, slowly.", path: "/", history: [] }),
    });
    const res = await POST(req);
    return { res, calls };
  } finally { globalThis.fetch = real; }
}

test("the route answers and stores a turn nobody stopped", async () => {
  const { res, calls } = await run({ abortAt: null });
  assert.equal(res.status, 200);
  assert.equal((await res.json()).reply, "Here is a slow answer.");
  assert.ok(calls.store >= 2, "the chat row and both messages are kept");
});

test("Stop during the model call ends it and stores nothing", async () => {
  const { res, calls } = await run({ abortAt: "model" });
  assert.equal(res.status, 499);
  assert.equal(calls.model, 1, "no second round after Stop");
  assert.equal(calls.store, 0, "no half reply in the chat store");
});

test("Stop as the answer lands still stores nothing", async () => {
  const { res, calls } = await run({ abortAt: "after" });
  assert.equal(res.status, 499);
  assert.equal(calls.store, 0);
});
