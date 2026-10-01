// node --test lib/web/thread.test.mjs   (YUI-242: the web thread follows the app's rules)
process.env.TZ = "America/New_York";
import test from "node:test";
import assert from "node:assert/strict";
import { Thread, before, doingOf, excerpt, folds, sentences, splitFence, wordCount } from "./thread.mjs";

const T0 = Date.parse("2026-10-01T12:00:00Z");
const iso = (s) => new Date(T0 + s * 1000).toISOString().replace("Z", "000+00:00");
let n = 0;
const row = (o) => ({ id: `r${++n}`, sender: "agent", kind: "text", body: "", meta: {}, created_at: iso(n), delivered_at: null, handled_at: null, reaction: null, doing: null, ...o });

test("fences: text outside is a bubble, a yui fence is lines, an unclosed fence still renders", () => {
  assert.deepEqual(splitFence("Hi.\n```yui\nsay \"x\"\n```\nBye."), [{ text: "Hi." }, { yl: 'say "x"' }, { text: "Bye." }]);
  assert.deepEqual(splitFence("```yui\nsay \"cut"), [{ yl: 'say "cut' }]);
  // only ```yui is Yui Lines: a code block stays text
  assert.deepEqual(splitFence("```js\nlet a = 1\n```"), [{ text: "```js\nlet a = 1\n```" }]);
  assert.deepEqual(splitFence("  ```yui  \nsay a\n  ```  "), [{ yl: "say a" }]);
});

test("long answers fold past 60 words and the excerpt is whole sentences up to 40", () => {
  const short = "Three runs fit. Thursday is dry.";
  assert.equal(folds(short), false);
  const long = Array.from({ length: 12 }, (_, i) => `Sentence number ${i} says a handful of plain words here.`).join(" ");
  assert.equal(wordCount(long) > 60, true);
  assert.equal(folds(long), true);
  const ex = excerpt(long);
  assert.equal(ex.endsWith("…"), true);
  assert.equal(wordCount(ex) <= 41, true);
  assert.equal(ex.includes("Sentence number 0"), true);
  assert.equal(excerpt("A short one."), "A short one.");
});

test("sentences keep abbreviations, initials and a lowercase continuation together", () => {
  assert.deepEqual(sentences("Ask Dr. Lee about it. Then J. Smith. Use e.g. a timer."), ["Ask Dr. Lee about it.", "Then J. Smith.", "Use e.g. a timer."]);
  assert.deepEqual(sentences("It is 5 km vs. the old 4 km. Done!"), ["It is 5 km vs. the old 4 km.", "Done!"]);
});

test("rows dedupe by lowercased id, polls overlap safely", () => {
  const t = new Thread();
  const a = row({ id: "ABC", sender: "user", body: "hi" });
  assert.equal(t.add(a), true);
  assert.equal(t.add({ ...a, id: "abc" }), false);
  assert.equal(t.messages.length, 1);
  assert.equal(t.load([a, row({ body: "yo" })]), true);
  assert.equal(t.messages.length, 2);
  assert.equal(t.cursor, t.messages.length && iso(n));
});

test("an event row shows only when it has an echo; the quiet ones stay hidden", () => {
  const t = new Thread();
  t.add(row({ sender: "user", kind: "event", body: "[yui] n1 choose choice=Legs", meta: { id: "n1", preset: "choose", value: { choice: "Legs" }, echo: "Legs" } }));
  t.add(row({ sender: "user", kind: "event", body: "[yui] hiit timer done", meta: { id: "hiit", preset: "timer", value: { done: true } } }));
  assert.deepEqual(t.messages.map((m) => m.text), ["Legs"]);
});

test("controls never show, except the person's Stop as one quiet note", () => {
  const t = new Thread();
  assert.equal(t.add(row({ sender: "agent", kind: "control", body: "{}" })), false);
  assert.equal(t.add(row({ sender: "user", kind: "control", body: "model gpt" })), false);
  assert.equal(t.add(row({ sender: "user", kind: "control", body: "stop" })), true);
  assert.equal(t.messages[0].card, "stopped");
});

test("an agent reply: text and a screen per fence, in order", () => {
  const t = new Thread();
  t.add(row({ body: "Pick one.\n```yui\nchoose \"Which?\" A|B\n```\nThen tell me." }));
  assert.deepEqual(t.messages.map((m) => (m.yl ? "screen" : m.text)), ["Pick one.", "screen", "Then tell me."]);
  assert.equal(t.messages[1].state.screens["1"][0].preset, "choose");
});

test("a patch to an id that lasts (a page) reaches the earlier reply's screen", () => {
  const t = new Thread();
  t.add(row({ body: "```yui\n>2 choose@need-1 \"Ship it?\" Yes|No\n```" }));
  t.add(row({ body: "```yui\n~need-1 +lock\n```" }));
  const screens = t.messages.filter((m) => m.yl);
  assert.equal(screens.length, 2); // the patch row keeps an empty screen, like the app
  assert.equal(t.messages[0].state.screens["2"][0].props.lock, true);
  assert.equal(t.messages[0].rev, 1);
  assert.equal(t.messages[0].ops.length, 2);
});

test("an agent reply ends the wait; the person's send starts it; a mention copy does not end it", () => {
  const t = new Thread();
  t.addLocal({ id: "u1", sender: "user", kind: "text", body: "hi" });
  assert.equal(t.waiting, true);
  t.add(row({ body: "from coach", meta: { mention_reply: { name: "Coach", handle: "coach" } } }));
  assert.equal(t.waiting, true);
  t.add(row({ body: "hello" }));
  assert.equal(t.waiting, false);
});

test("doing: words, a step, or neither", () => {
  assert.deepEqual(doingOf({ text: " Reading ", step: 1, of: 3 }), { text: "Reading", step: 1, of: 3 });
  assert.deepEqual(doingOf({ step: 2, of: 3 }), { text: null, step: 2, of: 3 });
  assert.equal(doingOf({ step: 5, of: 3 }), null);
  assert.equal(doingOf({ text: "  " }), null);
  assert.equal(doingOf("x"), null);
});

test("a thread opened mid-turn picks the wait up where it was", () => {
  const t = new Thread();
  const r = row({ sender: "user", body: "plan it", created_at: new Date(Date.now() - 20000).toISOString(), delivered_at: new Date(Date.now() - 15000).toISOString(), doing: { text: "Checking the weather", step: 1, of: 2 } });
  t.load([r], { first: true });
  assert.equal(t.waiting, true);
  assert.deepEqual(t.doing, { text: "Checking the weather", step: 1, of: 2 });
  const done = new Thread();
  done.load([{ ...r, id: "x", handled_at: new Date().toISOString() }], { first: true });
  assert.equal(done.waiting, false);
});

test("the app's reply and mention header lines are not shown; the quote is a chip", () => {
  const t = new Thread();
  t.add(row({ sender: "user", body: "[yui] reply to=abc from=agent quote=\"Three runs fit.\"\nMove Thursday", meta: { reply_to: { msg: "abc", from: "agent", quote: "Three runs fit." } } }));
  t.add(row({ sender: "user", body: "[yui] mention to=coach Does this fit my knee?", meta: { mention: { to: "x", handle: "coach", name: "Coach" } } }));
  assert.equal(t.messages[0].text, "Move Thursday");
  assert.deepEqual(t.messages[0].replyTo, { from: "agent", quote: "Three runs fit." });
  assert.equal(t.messages[1].to, "To Coach");
});

test("before() moves a timestamp back for the overlapping poll", () => {
  assert.equal(before("2026-10-01T12:00:10.123456+00:00", 10), "2026-10-01T12:00:00+00:00");
});
