import test from "node:test";
import assert from "node:assert/strict";
import { ControlsError, can, controlsFor, createControls, draftKey, loadDraft, parseScheduleLine, saveDraft, scheduleLine, sectionsShown, splitFrontmatter, talkTitle, nextWords, agoWords } from "./controls.mjs";

// A relay whose host answers with `answer(meta)` after `after` polls (null = never).
function fake(answer, after = 1) {
  const posted = [], polls = {};
  return {
    posted,
    async post(row) { posted.push(row); },
    async controlAnswer({ req }) { polls[req] = (polls[req] || 0) + 1; if (answer && polls[req] >= after) return answer(posted.at(-1).meta); return null; },
  };
}
function model(relay, extra = {}) {
  let t = 0, n = 0;
  return createControls({ relay, agentId: "a1", userId: "u1", agentName: "Scout", uuid: () => `0000000${++n}-0000-4000-8000-000000000000`, now: () => t, sleep: async (ms) => { t += ms; }, ...extra });
}
const ok = (extra = {}) => (m) => ({ v: 1, req: m.req, ok: true, ...extra });

test("a request is one control row, then polls for the answer with the same req", async () => {
  const relay = fake(ok({ items: [{ id: "SOUL.md" }] }), 3);
  const c = model(relay);
  const items = await c.list("soul");
  assert.deepEqual(items, [{ id: "SOUL.md" }]);
  assert.equal(relay.posted.length, 1);
  const row = relay.posted[0];
  assert.equal(row.kind, "control");
  assert.equal(row.userId, "u1");
  assert.equal(row.agentId, "a1");
  assert.equal(row.body, "controls: list soul");
  assert.match(row.meta.req, /^c-[0-9a-f]{8}$/);
  assert.deepEqual({ ...row.meta, req: "x" }, { v: 1, req: "x", op: "list", section: "soul" });
  assert.match(row.id, /^[0-9a-f-]{36}$/);
});

test("no answer in the wait throws noAnswer in the app's words", async () => {
  const c = model(fake(null));
  await assert.rejects(() => c.get("soul", "SOUL.md"), (e) => e instanceof ControlsError && e.kind === "noAnswer" && e.message === "Your Mac didn't answer.");
});

test("get returns rev and item; put sends rev and value", async () => {
  const relay = fake(ok({ rev: "r1", item: { id: "SOUL.md", text: "# a" } }));
  const c = model(relay);
  assert.deepEqual(await c.get("soul", "SOUL.md"), { rev: "r1", item: { id: "SOUL.md", text: "# a" } });
  await c.put("soul", "SOUL.md", "r1", { text: "# b" });
  const m = relay.posted.at(-1).meta;
  assert.equal(m.op, "put"); assert.equal(m.rev, "r1"); assert.deepEqual(m.value, { text: "# b" }); assert.equal(m.id, "SOUL.md");
  assert.equal(relay.posted.at(-1).body, "controls: put soul SOUL.md");
});

test("act sends the verb; delete sends the rev and confirmed", async () => {
  const relay = fake(ok({ item: { id: "j", paused: true } }));
  const c = model(relay);
  assert.deepEqual(await c.act("schedules", "j", "pause"), { id: "j", paused: true });
  assert.equal(relay.posted.at(-1).meta.verb, "pause");
  await c.delete("memory", "m1", "r9");
  const m = relay.posted.at(-1).meta;
  assert.equal(m.op, "delete"); assert.equal(m.rev, "r9"); assert.equal(m.confirmed, true);
});

test("conflict carries the host's rev and item; version and refused say it plainly", async () => {
  let c = model(fake((m) => ({ req: m.req, ok: false, error: "conflict", rev: "r2", item: { text: "theirs" }, message: "Changed on the host since you opened it." })));
  await assert.rejects(() => c.put("soul", "SOUL.md", "r1", { text: "x" }), (e) => e.kind === "conflict" && e.rev === "r2" && e.item.text === "theirs" && /Changed/.test(e.message));
  c = model(fake((m) => ({ req: m.req, ok: false, error: "version" })));
  await assert.rejects(() => c.list("soul"), (e) => e.kind === "version" && e.message === "Update the Yui plugin on your Mac.");
  c = model(fake((m) => ({ req: m.req, ok: false, error: "bundled", message: "This skill ships with Hermes. Switch it off instead." })));
  await assert.rejects(() => c.delete("skills", "x", "r"), (e) => e.kind === "refused" && e.code === "bundled" && /ships with Hermes/.test(e.message));
  c = model(fake((m) => ({ req: m.req, ok: false })));
  await assert.rejects(() => c.list("soul"), (e) => e.kind === "refused" && e.message === "The host couldn't do that.");
});

test("sections shown follow the drawer's order and drop what the host left out", () => {
  const r = { v: 1, sections: { channels: "r", soul: "rw", skills: "rwd", memory: "rwd" } };
  const s = sectionsShown(r, "Scout");
  assert.deepEqual(s.map((x) => x.id), ["soul", "memory", "skills", "channels"]);
  assert.equal(s[0].title, "Personality"); assert.equal(s[0].sub, "Who Scout is and how it talks");
  assert.equal(sectionsShown(null).length, 0);
  assert.equal(can(r, "skills", "d"), true); assert.equal(can(r, "channels", "w"), false);
});

test("controls come back when online; a shared agent has none", () => {
  const controls = { v: 1, sections: { soul: "rw" } };
  assert.equal(controlsFor({ name: "Penny", controls, presence: "online" }).live, true);
  const off = controlsFor({ name: "Penny", controls, presence: "asleep" });
  assert.equal(off.show, true); assert.equal(off.live, false);
  assert.equal(off.note, "Penny's computer is asleep. Controls come back when it's online.");
  assert.equal(controlsFor({ name: "Penny", controls, presence: "online", shared: true }).show, false);
  assert.equal(controlsFor({ name: "Penny", presence: "online" }).show, false);
  assert.equal(controlsFor({ name: "P", controls, status: "connected" }).live, true);
});

test("drafts live under the app's key and clear on null", () => {
  const mem = new Map();
  const s = { getItem: (k) => mem.get(k) ?? null, setItem: (k, v) => mem.set(k, v), removeItem: (k) => mem.delete(k) };
  const k = draftKey("demo-penny", "soul", "SOUL.md");
  assert.equal(k, "yui.controls.draft.demo-penny.soul.SOUL.md");
  saveDraft("hello", k, s);
  assert.equal(loadDraft(k, s), "hello");
  saveDraft(null, k, s);
  assert.equal(loadDraft(k, s), null);
  assert.equal(loadDraft(k, { getItem() { throw new Error("denied"); } }), null);
});

test("frontmatter splits off, and the talk title follows the app", () => {
  const f = splitFrontmatter("---\nname: a\ndescription: Does a.\n---\n\n# A\n\nbody");
  assert.deepEqual(f.meta, { name: "a", description: "Does a." }); assert.equal(f.body, "# A\n\nbody");
  assert.equal(splitFrontmatter("# plain").body, "# plain");
  assert.equal(talkTitle("soul", {}), "SOUL.md");
  assert.equal(talkTitle("memory", { text: "x".repeat(60) }).length, 40);
  assert.equal(talkTitle("skills", { id: "s", title: "trail-planner" }), "trail-planner");
});

test("schedule lines round trip", () => {
  assert.equal(scheduleLine({ kind: "every", minutes: 15 }), "every 15m");
  assert.equal(scheduleLine({ kind: "daily", at: "08:05" }), "5 8 * * *");
  assert.equal(scheduleLine({ kind: "weekdays", at: "17:30" }), "30 17 * * 1-5");
  assert.equal(scheduleLine({ kind: "cron", cron: " 0 9 * * 1 " }), "0 9 * * 1");
  assert.deepEqual(parseScheduleLine("30 17 * * 1-5"), { kind: "weekdays", minutes: 30, at: "17:30", cron: "" });
  assert.equal(parseScheduleLine("every 45m").minutes, 45);
  assert.equal(parseScheduleLine("0 9 * * 1").kind, "cron");
});

test("times in words", () => {
  const now = Date.parse("2026-10-01T12:00:00Z");
  assert.equal(nextWords("2026-10-01T12:00:20Z", now), "in a moment");
  assert.equal(nextWords("2026-10-01T12:12:00Z", now), "in 12 min");
  assert.equal(nextWords("2026-10-01T15:00:00Z", now), "in 3 h");
  assert.equal(agoWords("2026-09-30T11:00:00Z", now), "yesterday");
  assert.equal(nextWords("junk", now), null);
});
