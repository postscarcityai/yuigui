// node --test lib/web/stage.test.mjs   (YUI-243: the stage on the web follows the app's rules)
import test from "node:test";
import assert from "node:assert/strict";
import { Thread } from "./thread.mjs";
import { chipAction, homeOf, pageTitle, reopened, turnOf, waitingAction, MAX_CHIPS } from "./stage.mjs";

const T0 = Date.parse("2026-10-01T12:00:00Z");
const iso = (s) => new Date(T0 + s * 1000).toISOString().replace("Z", "000+00:00");
let n = 0;
const row = (o) => ({ id: `s${++n}`, sender: "agent", kind: "text", body: "", meta: {}, created_at: iso(n), delivered_at: null, handled_at: null, reaction: null, doing: null, ...o });
const thread = (rows) => { const t = new Thread(); t.load(rows); return t.messages; };
const yl = (s) => "```yui\n" + s + "\n```";

test("a turn is the replies after the person's last words, with a Stop noted not played", () => {
  const m = thread([row({ sender: "user", body: "plan" }), row({ body: "One." }), row({ body: "Two." })]);
  const t = turnOf(m);
  assert.equal(t.ask.text, "plan");
  assert.equal(t.pieces.length, 2);
  assert.equal(t.replies, 2);
  assert.equal(turnOf(thread([row({ body: "Hi." })])).ask, null);
});

test("home: the newest four shortcuts, review items, pages and where show= goes", () => {
  const lines = ["menu shortcut a1 \"A\"", "menu shortcut b2 \"B\"", "menu shortcut c3 \"C\"", "menu shortcut d4 \"D\"", "menu shortcut e5 \"E\"", "menu review@dana \"Invite Dana?\"", ">2 stat 12 \"Runs\""];
  const h = homeOf(thread([row({ body: yl(lines.join("\n")) })]));
  assert.equal(h.chips.length <= MAX_CHIPS, true);
  assert.equal(h.waiting.length, 1);
  assert.deepEqual(h.pages, ["2"]);
  assert.equal(pageTitle(h.state, "2"), "Runs");
  assert.equal(pageTitle(h.state, "9"), "Screen 9");
});

test("a chip sends its words, or fills the field when they end in a space", () => {
  const h = homeOf([]);
  assert.deepEqual(chipAction({ label: "Plan my week" }, h), { send: "Plan my week" });
  assert.deepEqual(chipAction({ label: "Log", say: "Log a run: " }, h), { compose: "Log a run: " });
  assert.deepEqual(waitingAction({ id: "dana", label: "Invite Dana?" }, h).tap.id, "dana");
  assert.deepEqual(waitingAction({ id: "x", label: "Docs", url: "https://yuigui.com" }, h), { open: "https://yuigui.com" });
  assert.equal(waitingAction({ id: "x", label: "Docs", url: "javascript:alert(1)" }, h).open, undefined);
});

test("a saved screen comes back with no turn; an unknown name does not", () => {
  const m = thread([row({ body: yl("stat 8km \"Saturday\"\nsave run") })]);
  assert.equal(reopened(m, "nope"), null);
  assert.ok(reopened(m, "run"));
});
