// node --test lib/web/chats.test.mjs
import test from "node:test";
import assert from "node:assert/strict";
import {
  append, chatError, chatErrorOf, createChatsClient, deletePlan, deleteWords, draft, filter, lastLine, merge, openAfterDeleting,
  ordered, title, validTitle, when, whenOf, words,
} from "./chats.mjs";

const chat = (id, at, extra = {}) => ({ id, last_at: at, ...extra });

test("a row's title: what it is called, Hi <agent> for the first, New chat for the rest", () => {
  assert.equal(title({ title: "Race week" }, "Penny"), "Race week");
  assert.equal(title({ title: "  ", is_first: true }, "Penny"), "Hi Penny");
  assert.equal(title({ title: null }, "Penny"), "New chat");
});

test("the last line: fences and taps become plain words", () => {
  assert.equal(lastLine({ last_body: "how much protein", last_sender: "user" }), "You: how much protein");
  assert.equal(lastLine({ last_body: "Easy Monday.\n```yui\nchoose x\n```\nThen rest.", last_sender: "agent" }), "Easy Monday. Then rest.");
  assert.equal(lastLine({ last_body: "```yui\nform x\n```", last_sender: "agent" }), "Sent a screen");
  assert.equal(lastLine({ last_body: "```yui\nform x\n```", last_sender: "user" }), "");
  assert.equal(lastLine({ last_body: "[yui] ping choose choice=Yes", last_sender: "user" }), "You: Tapped an answer");
  assert.equal(lastLine({ last_body: "x".repeat(300), last_sender: "agent" }).length, 120);
  assert.equal(lastLine({}), "");
  assert.equal(words("a\n\n b "), "a b");
});

test("when: now, minutes, hours, days, weeks, months", () => {
  const now = Date.parse("2026-10-01T12:00:00Z");
  const ago = (s) => new Date(now - s * 1000).toISOString();
  assert.equal(when(ago(10), now), "now");
  assert.equal(when(ago(20 * 60), now), "20m");
  assert.equal(when(ago(2 * 3600), now), "2h");
  assert.equal(when(ago(3 * 86400), now), "3d");
  assert.equal(when(ago(15 * 86400), now), "2w");
  assert.equal(when(ago(130 * 86400), now), "4mo");
  assert.equal(when("", now), "");
  assert.equal(whenOf({ last_message_at: ago(120), last_at: ago(99999) }, now), "2m");
});

test("a typed title is trimmed and capped at 60", () => {
  assert.equal(validTitle("  Race week  "), "Race week");
  assert.equal(validTitle("   "), null);
  assert.equal(validTitle("x".repeat(90)).length, 60);
});

test("newest activity first, ties by id", () => {
  const list = [chat("b", "2026-10-01T10:00:00Z"), chat("c", "2026-10-01T12:00:00Z"), chat("a", "2026-10-01T10:00:00Z")];
  assert.deepEqual(ordered(list).map((c) => c.id), ["c", "a", "b"]);
});

test("merge: a short page is the whole list; a full one keeps the older chats already loaded", () => {
  const current = [chat("n3", "2026-10-03T00:00:00Z"), chat("o1", "2026-09-01T00:00:00Z"), chat("o2", "2026-08-01T00:00:00Z")];
  assert.deepEqual(merge(current, [chat("n3", "2026-10-03T00:00:00Z")], 30).map((c) => c.id), ["n3"]);
  const page = [chat("n4", "2026-10-04T00:00:00Z"), chat("n3", "2026-10-03T00:00:00Z")];
  assert.deepEqual(merge(current, page, 2).map((c) => c.id), ["n4", "n3", "o1", "o2"]);
  // a chat newer than the page's last row that the page lacks was deleted elsewhere
  const gone = [chat("x", "2026-10-05T00:00:00Z"), ...current];
  assert.deepEqual(merge(gone, page, 2).map((c) => c.id), ["n4", "n3", "o1", "o2"]);
  assert.deepEqual(append(current, [chat("o2", "2026-08-01T00:00:00Z"), chat("o3", "2026-07-01T00:00:00Z")]).map((c) => c.id), ["n3", "o1", "o2", "o3"]);
});

test("search matches the title or the last line", () => {
  const list = [{ id: "a", title: "Groceries", last_body: "milk", last_sender: "user" }, { id: "b", title: null, last_body: "race plan", last_sender: "agent" }];
  assert.deepEqual(filter(list, "Penny", "groc").map((c) => c.id), ["a"]);
  assert.deepEqual(filter(list, "Penny", "RACE").map((c) => c.id), ["b"]);
  assert.equal(filter(list, "Penny", "  ").length, 2);
});

test("the only chat is cleared, not deleted; the next newest opens when the open one goes", () => {
  assert.equal(deletePlan(1), "clear");
  assert.equal(deletePlan(0), "clear");
  assert.equal(deletePlan(2), "delete");
  const list = [chat("a", "2026-10-03T00:00:00Z"), chat("b", "2026-10-02T00:00:00Z"), chat("c", "2026-10-01T00:00:00Z")];
  assert.equal(openAfterDeleting("a", "a", list), "b");
  assert.equal(openAfterDeleting("a", "c", list), "c");
  assert.equal(openAfterDeleting("a", "a", [chat("a", "x")]), null);
  assert.deepEqual(deleteWords("delete", "Race week", "Penny"), { question: 'Delete "Race week"?', note: "Its messages go. Penny still remembers what it learned.", confirm: "Delete" });
  assert.equal(deleteWords("clear", "x", "Penny").question, "Clear this chat?");
});

test("what the server refuses a chat with, in plain words", () => {
  assert.equal(chatError("limit_reached").kind, "limitReached");
  assert.match(chatError("update_needed").spoken, /latest Yui/);
  assert.match(chatError("last_chat").spoken, /only chat/);
  assert.equal(chatError("whatever").kind, "other");
  assert.equal(chatErrorOf({ detail: JSON.stringify({ message: "chat_not_found" }) }).spoken, "That chat is gone.");
  assert.equal(chatErrorOf({ detail: "<html>" }).kind, "other");
});

test("a draft chat is a new id and not saved", () => {
  const d = draft(Date.parse("2026-10-01T12:00:00Z"), () => "uuid-1");
  assert.deepEqual(d, { id: "uuid-1", last_at: "2026-10-01T12:00:00.000Z", saved: false });
});

test("the client asks PostgREST the way the app does", async () => {
  const calls = [];
  const request = async (path, init = {}) => { calls.push([path, init.method || "GET", init.body]); return { json: async () => [{ id: "ABC", title: "x" }] }; };
  const api = createChatsClient(request);
  const page = await api.list("agent-1", { limit: 30, offset: 30 });
  assert.equal(page[0].id, "abc");
  assert.equal(calls[0][0], "rest/v1/yui_chat_list?select=*&agent_id=eq.agent-1&order=last_at.desc%2Cid.asc&limit=30&offset=30");
  await api.insert({ id: "c1", userId: "u1", agentId: "agent-1" });
  assert.deepEqual([calls[1][0], calls[1][1], JSON.parse(calls[1][2])], ["rest/v1/yui_chats", "POST", { id: "c1", user_id: "u1", agent_id: "agent-1" }]);
  await api.rename("c1", "Race week");
  assert.deepEqual([calls[2][0], calls[2][1], JSON.parse(calls[2][2])], ["rest/v1/yui_chats?id=eq.c1", "PATCH", { title: "Race week" }]);
  await api.seen("c1", "2026-10-01T12:00:00Z");
  assert.deepEqual(JSON.parse(calls[3][2]), { seen_at: "2026-10-01T12:00:00Z" });
  await api.remove("c1");
  assert.deepEqual([calls[4][0], calls[4][1]], ["rest/v1/yui_chats?id=eq.c1", "DELETE"]);
  await api.clear("c1");
  assert.deepEqual([calls[5][0], calls[5][1]], ["rest/v1/yui_messages?chat_id=eq.c1", "DELETE"]);
});

test("a chat that is already there counts as made (409)", async () => {
  const api = createChatsClient(async () => { const e = new Error("http_409"); e.status = 409; throw e; });
  await api.insert({ id: "c1", userId: "u", agentId: "a" });
  const api2 = createChatsClient(async () => { const e = new Error("http_403"); e.status = 403; e.detail = '{"message":"limit_reached"}'; throw e; });
  await assert.rejects(() => api2.insert({ id: "c1", userId: "u", agentId: "a" }), (e) => chatErrorOf(e).kind === "limitReached");
});

test("the first chat with no title reads Earlier once there are other chats (YUI-254), Hi <agent> while it is alone", () => {
  assert.equal(title({ title: null, is_first: true }, "Penny", 1), "Hi Penny");
  assert.equal(title({ title: null, is_first: true }, "Penny", 3), "Earlier");
  assert.equal(title({ title: "Race week", is_first: true }, "Penny", 3), "Race week");
  assert.equal(title({ title: null, is_first: false }, "Penny", 3), "New chat");
  // the search finds the row by the name it wears
  const list = [{ id: "a", is_first: true, title: null }, { id: "b", is_first: false, title: "Race week" }];
  assert.deepEqual(filter(list, "Penny", "earlier").map((c) => c.id), ["a"]);
});
