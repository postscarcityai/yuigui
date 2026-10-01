// node --test lib/web/composer.test.mjs   (YUI-244: what the composer holds)
import test from "node:test";
import assert from "node:assert/strict";
import { createComposer } from "./composer.mjs";
import { PhotoError } from "./photo.mjs";

const mem = () => { const m = new Map(); return { getItem: (k) => m.get(k) ?? null, setItem: (k, v) => m.set(k, v), removeItem: (k) => m.delete(k), m }; };
const fake = async (f) => { if (f.bad) throw new PhotoError("not_a_photo"); return { id: f.name, blob: new Blob([f.name]), type: "image/jpeg", preview: `blob:${f.name}` }; };
const agents = [{ id: "a1", name: "Yui", handle: "yui" }, { id: "a2", name: "Penny", handle: "penny", presence: "online" }];

test("the draft is kept per agent and comes back; a pasted key is never kept; sending clears it", () => {
  const storage = mem();
  const a = createComposer({ agentId: "a1", storage, prepare: fake });
  a.setDraft("half typed");
  assert.equal(storage.m.get("yui.draft.a1"), "half typed");
  assert.equal(createComposer({ agentId: "a1", storage, prepare: fake }).get().draft, "half typed"); // reopened
  assert.equal(createComposer({ agentId: "a2", storage, prepare: fake }).get().draft, "");           // another agent's own
  a.setDraft("key sk-abcdefghijklmnopqrstuvwxyz123456");
  assert.equal(storage.m.has("yui.draft.a1"), false);
  a.setDraft("hello @Penny");
  const out = a.take({ agents, current: "a1" });
  assert.equal(out.text, "hello @Penny");
  assert.equal(out.mention.id, "a2");
  assert.equal(a.get().draft, "");
  assert.equal(storage.m.has("yui.draft.a1"), false);
});

test("photos: the first unreadable one says why, the rest land, 12 is the most, a photo alone sends", async () => {
  const c = createComposer({ agentId: "a1", storage: mem(), prepare: fake });
  const seen = [];
  const d = createComposer({ agentId: "a1", storage: mem(), prepare: fake, onProblem: (p) => seen.push(p) });
  assert.equal(await d.addFiles([{ name: "a" }, { bad: true }, { name: "b" }]), 2);
  assert.deepEqual(seen, ["not_a_photo"]);
  assert.equal(d.get().problem, "not_a_photo");
  assert.equal(d.canSend, true);
  d.removePhoto("a");
  assert.equal(d.get().photos.length, 1);
  assert.equal(await c.addFiles(Array.from({ length: 14 }, (_, i) => ({ name: `p${i}` }))), 12);
  assert.equal(c.get().problem, "limit");
  const out = c.take();
  assert.equal(out.photos.length, 12);
  assert.equal(out.text, "");
  assert.equal(c.get().photos.length, 0);
});

test("voice words go out without touching a half-typed draft; a reply rides one send and then clears", () => {
  const c = createComposer({ agentId: "a1", storage: mem(), prepare: fake });
  c.setDraft("typing");
  c.setReply({ msg: "r", fromUser: false, quote: "q", rows: [] });
  const out = c.take({ words: "move it to Thursday" });
  assert.equal(out.text, "move it to Thursday");
  assert.equal(out.reply.msg, "r");
  assert.equal(c.get().draft, "typing");
  assert.equal(c.get().reply, null);
  assert.equal(c.take({ words: "  " }), null);
});

test("hints: / lists commands, @ lists the other agents, a finished @Name says who it goes to", () => {
  const c = createComposer({ agentId: "a1", storage: mem(), prepare: fake });
  const cmds = [{ name: "new", description: "Start a new session" }];
  c.setDraft("/n");
  assert.equal(c.hints({ agents, current: "a1", commands: cmds }).list[0].title, "/new");
  c.setDraft("hi @pe");
  assert.equal(c.hints({ agents, current: "a1", commands: cmds }).list[0].title, "Penny");
  c.setDraft("hi @Penny and more");
  const h = c.hints({ agents, current: "a1", commands: cmds });
  assert.equal(h.list.length, 0);
  assert.equal(h.to.name, "Penny");
});

test("subscribers hear every change; a slash command never mentions", () => {
  const c = createComposer({ agentId: "a1", storage: mem(), prepare: fake });
  let n = 0;
  c.subscribe(() => n++);
  c.setDraft("a"); c.setDraft("ab"); c.setDraft("ab");
  assert.equal(n, 2);
  c.setDraft("/new @Penny");
  assert.equal(c.take({ agents, current: "a1" }).mention, null);
});
