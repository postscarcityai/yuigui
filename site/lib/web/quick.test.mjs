// node --test lib/web/quick.test.mjs
import test from "node:test";
import assert from "node:assert/strict";
import { candidates, CAP, entries, keyOf, loadUsed, markUsed, menuFromRows, pick, shortcutWords } from "./quick.mjs";

const fence = (lines) => "Hi.\n```yui\n" + lines.join("\n") + "\n```";
const row = (body, at, extra = {}) => ({ sender: "agent", kind: "text", body, created_at: at, ...extra });

test("an agent's menu from its rows: later lines replace, done removes, links and plain talk are ignored", () => {
  const rows = [
    row(fence(['menu shortcut@log "Log a meal" say="Log a meal: "', 'menu shortcut@groc "Grocery list" say="Show my grocery list"']), "2026-10-01T10:00:00Z"),
    row("just words, no menu", "2026-10-01T10:05:00Z"),
    row(fence(['menu shortcut@groc "Groceries" say="Show groceries"', 'menu backlog@plan "Planning" sub="Back tonight"']), "2026-10-01T11:00:00Z"),
    row(fence(["menu done log"]), "2026-10-01T12:00:00Z"),
    { sender: "user", kind: "text", body: 'menu shortcut@x "Not mine"', created_at: "2026-10-01T12:30:00Z" },
    row(fence(['menu shortcut@old "Old"']), "2026-09-30T08:00:00Z"),
  ];
  const m = menuFromRows(rows);
  assert.deepEqual(m.shortcut.map((s) => s.id).sort(), ["groc", "old"]);
  assert.equal(m.shortcut.find((s) => s.id === "groc").label, "Groceries");
  assert.deepEqual(m.backlog.map((s) => s.id), ["plan"]);
  assert.deepEqual(m.review, []);
});

test("candidates: every agent's shortcuts, never a link", () => {
  const agents = [{ id: "a", name: "Penny" }, { id: "b", name: "Basil" }];
  const menus = { a: { shortcut: [{ id: "x", label: "Review" }, { id: "y", label: "Site", url: "https://x.y" }] }, b: { shortcut: [{ id: "z", label: "Groceries" }] } };
  assert.deepEqual(candidates(agents, menus).map((c) => c.id), ["a/x", "b/z"]);
  assert.equal(keyOf("a", "x"), "a/x");
});

test("pick: one per agent before a second, newest used first, the cap, the person's picks win", () => {
  const mk = (a, i, l) => ({ agentId: a, id: keyOf(a, i), item: { id: i, label: l }, agentName: a });
  const all = [mk("a", "1", "A1"), mk("a", "2", "A2"), mk("b", "1", "B1"), mk("b", "2", "B2"), mk("c", "1", "C1")];
  assert.deepEqual(pick(all).map((c) => c.id), ["a/1", "b/1", "c/1", "a/2"]);
  assert.equal(CAP, 4);
  assert.deepEqual(pick(all, { used: { "b/2": 5, "c/1": 3 } }).map((c) => c.id), ["b/2", "c/1", "a/1", "b/1"]);
  assert.deepEqual(pick(all, { picks: ["c/1", "gone/1", "a/2"] }).map((c) => c.id), ["c/1", "a/2"]);
  assert.deepEqual(pick([]), []);
});

test("a shortcut sends its words; words ending in a space wait in the field", () => {
  assert.deepEqual(shortcutWords({ label: "Groceries", say: "Show my grocery list" }), { words: "Show my grocery list", compose: false });
  assert.deepEqual(shortcutWords({ label: "Log a meal", say: "Log a meal: " }), { words: "Log a meal: ", compose: true });
  assert.deepEqual(shortcutWords({ label: "What's new" }), { words: "What's new", compose: false });
});

test("the palette: no query leads with what you use, then agents; a query ranks starts-with first", () => {
  const agents = [{ id: "a", name: "Penny" }, { id: "b", name: "Basil" }];
  const menus = { a: { shortcut: [{ id: "x", label: "Evening review", say: "Evening review" }] }, b: { shortcut: [{ id: "z", label: "Grocery list" }, { id: "w", label: "Log a meal", say: "Log a meal: " }] } };
  const used = entries({ agents, menus, open: agents[0], used: { "b/w": 99 } });
  assert.equal(used[0].title, "Log a meal", "what was used last leads");
  const home = entries({ agents, menus, open: agents[0] });
  assert.deepEqual(home.slice(0, 2).map((r) => r.kind), ["shortcut", "shortcut"]);
  assert.ok(home.some((r) => r.id === "a:b" && r.title === "Talk to Basil"));
  assert.ok(home.some((r) => r.id === "d:new-chat" && r.title === "New chat with Penny"));
  const q = entries({ agents, menus, open: agents[0], query: "gro" });
  assert.equal(q[0].title, "Grocery list");
  assert.equal(q[0].sub, "Basil");
  assert.deepEqual(entries({ agents, menus, open: agents[0], query: "zzz" }), []);
  const noAdd = entries({ agents, menus, open: agents[0], query: "add", can: { add: false } });
  assert.ok(!noAdd.some((r) => r.action === "add"));
  const look = entries({ agents, menus, open: agents[0], query: "look", light: true });
  assert.ok(look.some((r) => r.title === "Switch to the dark look"));
  const ctl = entries({ agents, menus, open: agents[0], query: "personality", controls: [{ id: "soul", title: "Personality" }] });
  assert.equal(ctl[0].section, "soul");
  assert.equal(ctl[0].title, "Personality for Penny");
});

test("used marks live in storage", () => {
  const store = new Map();
  const storage = { getItem: (k) => store.get(k) ?? null, setItem: (k, v) => store.set(k, v) };
  assert.deepEqual(loadUsed(storage), {});
  markUsed("a/x", 1000, storage);
  markUsed("b/z", 2000, storage);
  assert.deepEqual(loadUsed(storage), { "a/x": 1000, "b/z": 2000 });
  assert.deepEqual(loadUsed({ getItem: () => "{broken" }), {});
});
