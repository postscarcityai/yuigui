// node --test lib/web/groups.test.mjs   (SITE-162: group threads on the web follow the app's rules, GroupRowsTests.swift)
import test from "node:test";
import assert from "node:assert/strict";
import { MAX_HOPS, MIN_HOPS, clampHops, settingsOf, addressed, addressees, askOf, canStart, completing, createGroupsClient, groupError, groupItem, groupItems, groupOf, groupWorking, membersOf, orderedGroups, partialMention, plain, suggest, suggestedTitle, tapOf, validTitle } from "./groups.mjs";
import { createDemoGroups, SAMPLE_ID } from "./groups-demo.mjs";

const coach = "c0000000-0000-4000-8000-000000000001", sage = "c0000000-0000-4000-8000-000000000002", quill = "c0000000-0000-4000-8000-000000000003";
const AT = "2026-10-01T14:00:00.000000+00:00";
const row = (id, sender, body, o = {}) => ({ id, sender, body, kind: "text", meta: {}, created_at: AT, delivered_at: null, handled_at: null, agent_id: null, ...o });
const g = (group, extra = {}) => ({ meta: { group, ...extra } });
const members = [{ id: coach, handle: "coach", name: "Coach" }, { id: sage, handle: "sage", name: "Sage" }, { id: quill, handle: "quill", name: "Quill" }];

test("a person row draws the words, never the quote", () => {
  const r = row("u1", "user", '[yui] group "Race week" hop=0 from=person\n> Person: hi\n@Sage what should I eat?', { agent_id: sage, ...g({ words: "@Sage what should I eat?", to: [sage] }) });
  assert.deepEqual({ ...groupItem(r), at: 0 }, { kind: "you", id: "u1", text: "@Sage what should I eat?", to: [sage], at: 0 });
});

test("a person row without words strips the header and the quote", () => {
  const r = row("u1", "user", '[yui] group "G" hop=0 from=person\nRace week, just before:\n> Person: hi\nplan Saturday', { agent_id: coach });
  const it = groupItem(r);
  assert.equal(it.text.endsWith("plan Saturday"), true);
  assert.equal(it.text.includes("[yui]") || it.text.includes("> Person"), false);
});

test("copies, Let it and Stop rows and control rows are hidden", () => {
  assert.equal(groupItem(row("c1", "user", "x", { agent_id: sage, ...g({ copy_of: "u1" }) })), null);
  assert.equal(groupItem(row("c2", "user", "[yui] group stop", { agent_id: coach, ...g({ control: "stop" }) })), null);
  assert.equal(groupItem(row("c3", "user", "[yui] group continue guard=g", { agent_id: coach, ...g({ control: "continue", guard: "g" }) })), null);
  assert.equal(groupItem(row("c4", "agent", "{}", { agent_id: coach, kind: "control" })), null);
});

test("an agent reply is a bubble for that agent", () => {
  const it = groupItem(row("a1", "agent", "Five days.", { agent_id: coach, ...g({ hop: 0 }) }));
  assert.equal(it.kind, "agent"); assert.equal(it.agent, coach); assert.equal(it.text, "Five days.");
  assert.equal(groupItem(row("a2", "agent", "orphan")), null);
});

test("a handoff row names both agents and one line of the ask", () => {
  const body = '[yui] group "Race week" hop=1 from=coach\nRace week, just before:\n> Coach: Five days.\n@Sage can you fit a wind-down before bed each night?';
  const it = groupItem(row("h1", "user", body, { agent_id: sage, ...g({ from: coach, from_name: "Coach", msg: "a1", hop: 1 }) }));
  assert.deepEqual([it.kind, it.from, it.to, it.ask, it.msg, it.cancelled], ["handoff", coach, sage, "can you fit a wind-down before bed each night?", "a1", false]);
  assert.equal(groupItem(row("h2", "user", "[yui] group x\n@Sage hi", { agent_id: sage, ...g({ from: coach, cancelled: true }) })).cancelled, true);
});

test("a guard row carries its state and its target", () => {
  const guard = { to: quill, to_name: "Quill", from: coach, msg: "a2", hop: 4, reason: "hops", state: "held" };
  const it = groupItem(row("g1", "agent", 'Coach wants to ask Quill: "cards"\nThat\'s 3 handoffs since you last said something.', { agent_id: coach, ...g({ guard }) }));
  assert.deepEqual([it.kind, it.id, it.asker, it.to, it.toName, it.state], ["guard", "g1", coach, quill, "Quill", "held"]);
  assert.equal(it.text.includes("3 handoffs"), true);
  for (const s of ["continued", "stopped", "gone"]) assert.equal(groupItem(row("g2", "agent", "x", { agent_id: coach, ...g({ guard: { to: quill, state: s } }) })).state, s);
  assert.equal(groupItem(row("g3", "agent", "x", { agent_id: coach, ...g({ guard: { to: quill, state: "weird" } }) })).state, "held");
});

test("a status line is about the agent it names", () => {
  const it = groupItem(row("s1", "agent", "Sage is asleep. It gets this when its computer wakes.", { agent_id: sage, ...g({ status: "asleep", about: sage }) }));
  assert.deepEqual([it.kind, it.about], ["status", sage]);
  assert.equal(it.text.startsWith("Sage is asleep"), true);
});

test("a tap on a screen shows what was picked, or nothing", () => {
  const line = "[yui] pick-day choose answer=Legs";
  const shown = row("t1", "user", `[yui] group x\n${line}`, { agent_id: sage, meta: { group: { to: [sage], words: line }, echo: "Legs" } });
  assert.equal(groupItem(shown).text, "Legs");
  assert.equal(groupItem(row("t2", "user", `[yui] group x\n${line}`, { agent_id: sage, ...g({ to: [sage], words: line }) })), null);
});

test("items keep the row order", () => {
  const rows = [row("u1", "user", "hi", { agent_id: coach, ...g({ words: "hi" }) }), row("x", "user", "copy", { agent_id: sage, ...g({ copy_of: "u1" }) }), row("a1", "agent", "hello", { agent_id: coach })];
  assert.deepEqual(groupItems(rows).map((i) => i.id), ["u1", "a1"]);
});

test("plain and askOf", () => {
  assert.equal(plain("[yui] group x\n> a\nhello\nthere"), "hello\nthere");
  assert.equal(askOf("[yui] group x\n@Sage @Quill both of you"), "both of you");
  assert.equal(askOf("[yui] group x\n@Sage"), "@Sage");
});

test("working: an agent works while its row is unhandled, lead first; waiting and cancelled ones do not", () => {
  const rows = [
    row("u1", "user", "x", { agent_id: sage, ...g({ words: "x" }) }),
    row("u2", "user", "y", { agent_id: coach, created_at: "2026-10-01T14:00:01.000000+00:00", delivered_at: "2026-10-01T14:00:02.000000+00:00", doing: { text: "Reading" }, ...g({ words: "y" }) }),
    row("u3", "user", "z", { agent_id: quill, handled_at: AT, ...g({}) }),
  ];
  const w = groupWorking(rows, coach);
  assert.deepEqual(w.map((x) => x.agent), [coach, sage]);
  assert.deepEqual(w[0].doing, { text: "Reading" });
  assert.equal(typeof w[0].pickedUp, "number"); assert.equal(w[1].pickedUp, null);
  const asleep = [...rows, row("s", "agent", "asleep", { agent_id: sage, created_at: "2026-10-01T14:00:03.000000+00:00", ...g({ status: "asleep", about: sage }) })];
  assert.deepEqual(groupWorking(asleep, coach).map((x) => x.agent), [coach]);
  assert.deepEqual(groupWorking([row("h", "user", "x", { agent_id: sage, ...g({ from: coach, cancelled: true }) })], coach), []);
  assert.deepEqual(groupWorking([row("c", "user", "stop", { agent_id: coach, ...g({ control: "stop" }) })], coach), []);
});

test("@ picks members in order, three at most, and ignores words that are not handles", () => {
  assert.deepEqual(addressed("@Coach @sage plan Saturday", members), [coach, sage]);
  assert.deepEqual(addressed("@sage @sage twice", members), [sage]);
  assert.deepEqual(addressed("email me@coach.com or @nobody", members), []);
  const four = [...members, { id: "d", handle: "dex", name: "Dex" }, { id: "e", handle: "eli", name: "Eli" }];
  assert.equal(addressed("@coach @sage @quill @dex", four).length, 3);
});

test("a typed @ suggests members and finishes as @handle", () => {
  assert.equal(partialMention("hi @sa"), "sa"); assert.equal(partialMention("hi @"), ""); assert.equal(partialMention("hi @sage there"), null); assert.equal(partialMention("a@b"), null);
  assert.deepEqual(suggest("@s", members).map((a) => a.handle), ["sage"]);
  assert.equal(suggest("@", members).length, 3);
  assert.deepEqual(suggest("no at", members), []);
  assert.equal(completing("ask @sa", "sage"), "ask @sage ");
});

test("a reply goes to its author; an @ wins over a reply; neither means the lead", () => {
  assert.deepEqual(addressees("thanks", members, sage), [sage]);
  assert.deepEqual(addressees("@coach thanks", members, sage), [coach]);
  assert.deepEqual(addressees("thanks", members, null), []);
  assert.deepEqual(addressees("thanks", members, "gone"), []);
});

test("titles: suggested from names, trimmed and cut to 60, blank is nothing", () => {
  assert.equal(suggestedTitle(["Coach", "Sage", "Quill"]), "Coach, Sage and Quill");
  assert.equal(suggestedTitle(["Coach", "Sage"]), "Coach and Sage");
  assert.equal(suggestedTitle([]), "");
  assert.equal(validTitle("  Race week  "), "Race week"); assert.equal(validTitle("   "), null); assert.equal(validTitle("x".repeat(80)).length, 60);
  assert.equal(canStart([coach], "", ["Coach"]), false); assert.equal(canStart([coach, sage], "", ["Coach", "Sage"]), true); assert.equal(canStart([coach, sage], "   ", []), false);
});

test("errors come out in plain words", () => {
  const e = (message) => ({ detail: JSON.stringify({ message }) });
  assert.equal(groupError(e("group_archived")).spoken, "That group is archived. Nothing more goes in it.");
  assert.equal(groupError(e("group_too_many")).spoken, "Ask up to three agents at once.");
  assert.equal(groupError(e("update_needed")).kind, "update_needed");
  for (const m of ["limit_reached", "group_not_found", "group_agent_not_member", "group_uses_to", "group_guard_gone", "group_lead_not_member", "group_lead_cannot_leave"]) assert.equal(groupError(e(m)).kind, m);
  assert.equal(groupError({ detail: "<html>" }).kind, "other"); assert.equal(groupError(e("weird")).spoken, "Couldn't do that right now. Try again in a moment.");
});

test("a group: left members are dropped, the lead is first, newest first, archived hidden", () => {
  const a = groupOf({ id: "1", title: "A", lead: sage, created_at: "2026-10-01", yui_thread_members: [{ agent_id: coach, left_at: null }, { agent_id: sage, left_at: null }, { agent_id: quill, left_at: "x" }] });
  assert.deepEqual(a.members, [coach, sage]); assert.equal(a.maxHops, 3);
  assert.deepEqual(membersOf(a, members.map((m) => ({ ...m }))).map((m) => m.id), [sage, coach]);
  const b = groupOf({ id: "2", title: "B", lead: coach, created_at: "2026-10-02", yui_thread_members: [] });
  const c = groupOf({ id: "3", title: "C", lead: coach, created_at: "2026-10-03", archived_at: "y", yui_thread_members: [] });
  assert.deepEqual(orderedGroups([a, c, b]).map((x) => x.id), ["2", "1"]);
});

// ---------- the calls ----------
function stub(handler) {
  const calls = [];
  const request = async (path, init = {}) => { calls.push({ path, init, body: init.body ? JSON.parse(init.body) : null }); const out = await handler(path, init); return { ok: true, json: async () => out }; };
  return { request, calls };
}
test("create seats the thread, then the others; Let it and Stop are rows in the lead's thread", async () => {
  const s = stub(() => []);
  const api = createGroupsClient(s.request, { userId: "me" });
  await api.create({ id: "t1", title: "Race week", lead: coach, members: [coach, sage, quill] });
  assert.equal(s.calls[0].path, "rest/v1/yui_threads"); assert.deepEqual(s.calls[0].body, { id: "t1", user_id: "me", title: "Race week", lead: coach });
  assert.equal(s.calls[1].path, "rest/v1/yui_thread_members"); assert.deepEqual(s.calls[1].body, [{ thread_id: "t1", agent_id: sage, user_id: "me" }, { thread_id: "t1", agent_id: quill, user_id: "me" }]);
  await api.letIt({ guard: "g9", thread: "t1", lead: coach });
  await api.stop({ thread: "t1", lead: coach });
  const [l, st] = s.calls.slice(2).map((c) => c.body);
  assert.deepEqual([l.body, l.agent_id, l.thread_id, l.sender, l.meta], ["[yui] group continue guard=g9", coach, "t1", "user", { group: { control: "continue", guard: "g9" } }]);
  assert.deepEqual([st.body, st.meta], ["[yui] group stop", { group: { control: "stop" } }]);
});

test("say writes the words with meta.group.to; a service key never appears", async () => {
  const s = stub(() => []);
  const api = createGroupsClient(s.request, { userId: "me" });
  await api.say({ id: "m1", thread: "t1", agent: sage, words: "@Sage hi", to: [sage], echo: "Legs" });
  assert.deepEqual(s.calls[0].body, { id: "m1", user_id: "me", agent_id: sage, thread_id: "t1", sender: "user", kind: "text", body: "@Sage hi", meta: { group: { to: [sage] }, echo: "Legs" } });
  assert.equal(JSON.stringify(s.calls).includes("service_role"), false);
});

test("a refusal is thrown with its plain words", async () => {
  const api = createGroupsClient(async () => { throw Object.assign(new Error("http_403"), { status: 403, detail: JSON.stringify({ message: "update_needed" }) }); }, { userId: "me" });
  await assert.rejects(() => api.create({ id: "t", title: "x", lead: coach, members: [coach, sage] }), (e) => e.group.kind === "update_needed");
});

test("rows read the thread, newest 100 oldest first; a cursor reads what came after, a little early", async () => {
  const s = stub((path) => (path.includes("order=created_at.desc") ? [{ id: "b" }, { id: "a" }] : []));
  const api = createGroupsClient(s.request, { userId: "me" });
  assert.deepEqual((await api.rows({ thread: "t1" })).map((r) => r.id), ["a", "b"]);
  await api.rows({ thread: "t1", since: "2026-10-01T14:00:10.000000+00:00" });
  assert.equal(s.calls[1].path.includes("created_at=gt.2026-10-01T14%3A00%3A05"), true);
});

// ---------- the demo ----------
test("the demo group: a sample with a handoff, an asleep line and a held guard; Let it and Stop work", async () => {
  const agents = [{ id: "demo-yui", handle: "yui", name: "Yui", presence: "online" }, { id: "demo-penny", handle: "penny", name: "Penny", presence: "online" }, { id: "demo-basil", handle: "basil", name: "Basil", presence: "asleep" }];
  const d = createDemoGroups({ agents: () => agents, speed: 100 });
  const [grp] = await d.list();
  assert.equal(grp.sample, true); assert.equal(grp.id, SAMPLE_ID); assert.equal(grp.lead, "demo-penny"); assert.equal(grp.members.length, 3);
  const kinds = groupItems(await d.rows({ thread: SAMPLE_ID })).map((i) => i.kind);
  assert.deepEqual(kinds, ["you", "agent", "handoff", "status", "handoff", "agent", "guard"]);
  const held = groupItems(await d.rows({ thread: SAMPLE_ID })).find((i) => i.kind === "guard");
  await d.letIt({ guard: held.id, thread: SAMPLE_ID, lead: grp.lead });
  const after = groupItems(await d.rows({ thread: SAMPLE_ID }));
  assert.equal(after.find((i) => i.id === held.id).state, "continued");
  await assert.rejects(() => d.letIt({ guard: held.id, thread: SAMPLE_ID, lead: grp.lead }), (e) => e.group.kind === "group_guard_gone");
  // a message to the lead is answered by the lead; an @ to the sleeper gets a status line, not an answer
  await d.say({ id: "m1", thread: SAMPLE_ID, agent: "demo-penny", words: "thanks", to: [] });
  const until = async (fn) => { for (let i = 0; i < 100 && !(await fn()); i++) await new Promise((r) => setTimeout(r, 20)); };
  await until(async () => (await d.rows({ thread: SAMPLE_ID })).some((r) => r.sender === "agent" && /Penny here/.test(r.body)));
  const rows = await d.rows({ thread: SAMPLE_ID });
  assert.equal(rows.some((r) => r.sender === "agent" && r.agent_id === "demo-penny" && /Penny here/.test(r.body)), true);
  await d.say({ id: "m2", thread: SAMPLE_ID, agent: "demo-basil", words: "@Basil hi", to: ["demo-basil"] });
  await until(async () => (await d.rows({ thread: SAMPLE_ID })).filter((r) => r.meta.group?.status === "asleep").length >= 2);
  assert.equal((await d.rows({ thread: SAMPLE_ID })).filter((r) => r.meta.group?.status === "asleep").length >= 2, true);
  await d.stop({ thread: SAMPLE_ID, lead: grp.lead });
  await d.archive(SAMPLE_ID);
  assert.deepEqual(await d.list(), []);
});

test("a tap on a screen goes as the event line, quiet events stay on the page", () => {
  const picked = tapOf({ id: "n2", preset: "choose", choice: "Legs" });
  assert.equal(picked.words.startsWith("[yui] n2 choose"), true); assert.equal(picked.echo, "Legs");
  assert.equal(tapOf({ id: "n3", preset: "list", checked: [0] }), null);
});

test("settings: hops stay 1 to 5, the lead cannot leave, outsiders can be added", () => {
  assert.deepEqual([0, 1, 3, 5, 9, "x", 2.6].map(clampHops), [1, 1, 3, 5, 5, 1, 3]);
  assert.equal(MIN_HOPS, 1); assert.equal(MAX_HOPS, 5);
  const agents = [{ id: "a", name: "A" }, { id: "b", name: "B" }, { id: "c", name: "C" }];
  const grp = groupOf({ id: "g", title: "G", lead: "b", max_hops: 4, yui_thread_members: [{ agent_id: "a", left_at: null }, { agent_id: "b", left_at: null }, { agent_id: "c", left_at: "2026-01-01T00:00:00+00:00" }] });
  const s = settingsOf(grp, agents);
  assert.equal(s.hops, 4);
  assert.deepEqual(s.inGroup.map((a) => a.id), ["b", "a"]);
  assert.deepEqual(s.outside.map((a) => a.id), ["c"]);
  assert.equal(s.canLeave("b"), false); assert.equal(s.canLeave("a"), true); assert.equal(s.canAdd, true);
});

test("settings writes: the demo group takes hops, add, leave, make lead and archive, reading back on list", async () => {
  const agents = [{ id: "demo-penny", handle: "penny", name: "Penny" }, { id: "demo-basil", handle: "basil", name: "Basil" }, { id: "demo-yui", handle: "yui", name: "Yui" }, { id: "demo-sage", handle: "sage", name: "Sage" }];
  const d = createDemoGroups({ agents: () => agents, speed: 100 });
  await d.setMaxHops(5, SAMPLE_ID); await d.add(["demo-sage"], SAMPLE_ID); await d.leave("demo-basil", SAMPLE_ID); await d.makeLead("demo-yui", SAMPLE_ID);
  const [g1] = await d.list();
  assert.equal(g1.maxHops, 5); assert.equal(g1.lead, "demo-yui"); assert.equal(g1.members.includes("demo-sage"), true); assert.equal(g1.members.includes("demo-basil"), false);
  await d.archive(SAMPLE_ID);
  assert.deepEqual(await d.list(), []);
});

test("settings writes on the real client are the app's PATCHes on the group row", async () => {
  const calls = [];
  const c = createGroupsClient(async (path, init) => { calls.push([path, init?.method, init?.body]); return { json: async () => [] }; }, { userId: "u" });
  await c.setMaxHops(2, "g1"); await c.makeLead("a", "g1"); await c.leave("b", "g1"); await c.archive("g1");
  assert.deepEqual(calls.map((x) => [x[0].split("?")[0], x[1]]), [["rest/v1/yui_threads", "PATCH"], ["rest/v1/yui_threads", "PATCH"], ["rest/v1/yui_thread_members", "PATCH"], ["rest/v1/yui_threads", "PATCH"]]);
  assert.equal(calls[0][2], '{"max_hops":2}'); assert.equal(calls[1][2], '{"lead":"a"}');
  assert.match(calls[2][0], /thread_id=eq\.g1/); assert.match(calls[3][2], /"archived_at":"20/);
});
