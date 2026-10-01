// node --test site/lib/chat/threads.test.mjs (SITE-153): past chats in the site chat.
import assert from "node:assert/strict";
import test from "node:test";
import { MAX, current, fresh, list, open, pick, write } from "./threads.mjs";

const say = (n, at = n) => [{ role: "user", content: `ask ${n}`, at }, { role: "assistant", content: `answer ${n}`, at: at + 1 }];

test("the old single thread becomes the first thread, nothing lost", () => {
  const s = open(null, { msgs: say(1) });
  assert.equal(s.threads.length, 1);
  assert.deepEqual(current(s).msgs, say(1));
  assert.equal(open(null, null).threads[0].msgs.length, 0);
});

test("new chat keeps the old thread and starts an empty one, once", () => {
  let s = write(open(null, null), say(1));
  const first = s.cur;
  s = fresh(s);
  assert.notEqual(s.cur, first);
  assert.equal(current(s).msgs.length, 0);
  assert.equal(fresh(s), s, "an empty thread is not stacked");
  assert.equal(s.threads.length, 2);
  s = pick(write(s, say(2, 100)), first);
  assert.deepEqual(current(s).msgs, say(1));
});

test("the list is newest first, titled from the first ask, last line, no empties", () => {
  let s = write(open(null, null), say(1, 10));
  s = write(fresh(s), say(2, 500));
  s = fresh(s);
  const l = list(s);
  assert.deepEqual(l.map((r) => r.title), ["ask 2", "ask 1"]);
  assert.equal(l[0].last, "answer 2");
});

test("twenty threads at most, oldest drop first, the one on show stays", () => {
  let s = open(null, null);
  for (let i = 1; i <= 25; i++) s = fresh(write(s, say(i, i * 10)));
  s = write(s, say(26, 9999));
  assert.ok(s.threads.length <= MAX);
  assert.ok(!list(s).some((r) => r.title === "ask 1"));
  assert.ok(list(s).some((r) => r.title === "ask 26"));
  assert.ok(s.threads.some((t) => t.id === s.cur));
});
