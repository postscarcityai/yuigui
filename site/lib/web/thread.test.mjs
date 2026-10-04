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
  assert.deepEqual(t.messages[0].replyTo, { msg: "abc", from: "agent", quote: "Three runs fit.", rows: [] });
  assert.equal(t.messages[1].to, "To Coach");
});

test("before() moves a timestamp back for the overlapping poll", () => {
  assert.equal(before("2026-10-01T12:00:10.123456+00:00", 10), "2026-10-01T12:00:00+00:00");
});

const U = "11111111-1111-4111-8111-111111111111", A = "22222222-2222-4222-8222-222222222222";

test("photos: a row's meta.photos draws as pictures, the stand-in body as no caption, a bad path never", () => {
  const t = new Thread();
  const good = `${U}/${A}/user/aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa.jpg`;
  t.add(row({ id: "p1", sender: "user", body: "Photo", meta: { photos: [good, "../../x"] } }));
  t.add(row({ id: "p2", sender: "user", body: "look at this", meta: { photos: [good] } }));
  assert.deepEqual(t.messages[0].photos, [good]);
  assert.equal(t.messages[0].text, "");
  assert.equal(t.messages[1].text, "look at this");
});

test("reactions: the row's own column, then react events, newest wins, take-back clears; the events never show", () => {
  const t = new Thread();
  t.load([
    row({ id: "R1", sender: "agent", body: "Want it kept clear?", reaction: "👍" }),
    row({ id: "e1", sender: "user", kind: "event", body: "[yui] react msg=r1 emoji=🔥 meaning=priority changed=true", meta: { react: { msg: "r1", emoji: "🔥" } } }),
  ]);
  assert.equal(t.reactions.get("r1"), "🔥");
  assert.equal(t.messages.length, 1); // the event is hidden
  t.load([row({ id: "e2", sender: "user", kind: "event", body: "[yui] react msg=r1 emoji=none", meta: { react: { msg: "r1", emoji: null } } })]);
  assert.equal(t.reactions.has("r1"), false);
  t.setReaction("R1#0", "❤️");
  assert.equal(t.reactions.get("r1"), "❤️");
});

test("the badge sits on the last bubble of the agent's row, never on another agent's answer", () => {
  const t = new Thread();
  t.add(row({ id: "r1", sender: "agent", body: "One.\n```yui\nlist \"x\" a|b\n```\nTwo." }));
  t.add(row({ id: "r2", sender: "agent", body: "Hello from Coach", meta: { mention_reply: { agent: "AA", name: "Coach", handle: "coach" } } }));
  const w = t.wearers();
  assert.equal(w.get("r1"), "r1#2");
  assert.equal(w.has("r2"), false);
  assert.deepEqual(t.messages.find((m) => m.from).from, { name: "Coach", handle: "coach", agent: "aa", status: null });
});

test("a local send shows its blob previews; a mention the agent will not answer does not start the working row", () => {
  const t = new Thread();
  t.addLocal({ id: "m1", sender: "user", body: "[yui] mention to=coach\nhi", kind: "text", meta: { mention: { to: "x", handle: "coach", name: "Coach" } } }, { owes: false });
  assert.equal(t.waiting, false);
  assert.equal(t.messages[0].to, "To Coach");
  t.addLocal({ id: "m2", sender: "user", body: "Photo", kind: "text", meta: { photos: [`${U}/${A}/user/aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa.jpg`] }, _local: ["blob:x"] });
  assert.equal(t.waiting, true);
  assert.deepEqual(t.messages[1].local, ["blob:x"]);
});

test("older rows go in front and change nothing else (YUI-254)", () => {
  const t = new Thread();
  const recent = Array.from({ length: 3 }, (_, i) => row({ id: `n${i}`, sender: i === 2 ? "user" : "agent", body: `new ${i}`, created_at: iso(1000 + i) }));
  t.load(recent, { first: true });
  assert.equal(t.hasOlder, false, "a short first page is the whole chat");
  assert.equal(t.oldestAt, recent[0].created_at);
  const waiting = t.waiting, cursor = t.cursor, newest = t.newestAgentAt;
  const old = Array.from({ length: 4 }, (_, i) => row({ id: `o${i}`, sender: i % 2 ? "user" : "agent", body: `old ${i}`, created_at: iso(100 + i), meta: i === 0 ? { native: { reminders: [{ id: "x" }] } } : {} }));
  assert.equal(t.addOlder(old, 4), 4);
  assert.deepEqual(t.messages.map((m) => m.text), ["old 0", "old 1", "old 2", "old 3", "new 0", "new 1", "new 2"]);
  assert.equal(t.hasOlder, true, "a full batch means there may be more");
  assert.equal(t.oldestAt, old[0].created_at);
  assert.equal(t.waiting, waiting, "history never ends a wait");
  assert.equal(t.cursor, cursor, "or moves the poll");
  assert.equal(t.newestAgentAt, newest);
  assert.equal(t.drainReminders().length, 0, "or fires a reminder");
  assert.equal(t.addOlder(old, 4), 0, "the same batch twice adds nothing");
  assert.equal(t.addOlder([], 4), 0);
  assert.equal(t.hasOlder, false);
});

test("a thread that opens on a full page may hold older rows", () => {
  const t = new Thread();
  t.load(Array.from({ length: 100 }, (_, i) => row({ id: `f${i}`, body: `m${i}`, created_at: iso(5000 + i) })), { first: true });
  assert.equal(t.hasOlder, true);
});

test("YUI-280: a turn that ends with no reply keeps the person's words as the unanswered ask, until anything newer", () => {
  const t = new Thread();
  const now = Date.parse(iso(60));
  t.load([row({ id: "u1", sender: "user", body: "Find a cafe", created_at: iso(1), delivered_at: iso(2), handled_at: iso(3) })]);
  t.owe();
  assert.equal(t.lostAsk, null, "not while it works");
  t.track({ delivered_at: iso(2), handled_at: iso(3) }, now);
  assert.equal(t.waiting, false);
  assert.equal(t.lostAsk?.text, "Find a cafe");
  t.add(row({ id: "u2", sender: "user", body: "Hello?", created_at: iso(20) }));
  assert.equal(t.lostAsk, null, "a newer message ends the offer");
  t.owe(); t.track({ handled_at: iso(21) }, now + 60000);
  assert.equal(t.lostAsk?.text, "Hello?");
  t.add(row({ id: "a1", body: "Here.", created_at: iso(50) }));
  assert.equal(t.lostAsk, null, "a real reply clears it");
});
