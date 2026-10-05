// node --test lib/web/stage.test.mjs   (YUI-243: the stage on the web follows the app's rules)
import test from "node:test";
import assert from "node:assert/strict";
import { Thread } from "./thread.mjs";
import { arrivalOf, chipAction, dismissEvent, holdsWorkout, homeOf, isHostAsk, isRow, notYetEvent, landingOf, playFor, pageTitle, reopened, turnOf, waitingAction, MAX_CHIPS } from "./stage.mjs";

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
  assert.equal(pageTitle(h.state, "9"), "Page");
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

test("YUI-262: a push names a message, a row is that id or its #part", () => {
  assert.equal(isRow("ABC#2", "abc"), true);
  assert.equal(isRow("abcd", "abc"), false);
  const m = thread([row({ id: "u1", sender: "user", body: "hi" }), row({ id: "a1", body: "one" }), row({ id: "a2", body: "two" })]);
  const ids = m.map((x) => x.id);
  assert.equal(isRow(ids[2], "a2"), true);
  assert.equal(landingOf(m, "a2"), ids[2]);
  assert.equal(landingOf(m, "a1"), ids[1]);
  assert.equal(landingOf(m, "nope"), ids[1]); // not found: the first thing said after the person's last word
  assert.equal(playFor(m, ids[2]), ids[0]);
  assert.equal(playFor(thread([row({ id: "x", body: "hello" })]), thread([row({ id: "x", body: "hello" })])[0].id).startsWith("x"), true);
  assert.equal(arrivalOf(m.slice(1)), ids[1]);
  assert.equal(arrivalOf(m.slice(0, 1)), null);
});

test("YUI-252: the tuner is a page of the signed-in web (Gouda's sixth screen)", () => {
  const m = thread([row({ id: "g1", body: yl(">2\nloop@l 92 \"Lazy\" p=x...|....\nsave looper\n>6\ntuner@tuner guitar +inline\nsave tuner") })]);
  const h = homeOf(m);
  assert.deepEqual(h.pages, ["2", "6"]);
  assert.equal(h.saved.tuner, "6");
});

test("YUI-270: a dismissed ask leaves the home until the host draws it again", () => {
  const body = yl("menu review@need-t_0a0b0c \"Outside testers\"\nmenu review@dana \"Invite Dana?\"");
  const msgs = thread([row({ body })]);
  assert.equal(homeOf(msgs).waiting.length, 2);
  assert.deepEqual(homeOf(msgs, { "need-t_0a0b0c": Date.now() + 60000 }).waiting.map((w) => w.id), ["dana"]);
  assert.equal(homeOf(msgs, { "need-t_0a0b0c": msgs[0].at - 1 }).waiting.length, 2, "drawn again after the tap: it is back");
  assert.equal(isHostAsk({ id: "need-t_0a0b0c" }), true);
  assert.equal(isHostAsk({ id: "dana" }), false);
  assert.deepEqual(dismissEvent({ id: "need-t_0a0b0c" }), { id: "need-t_0a0b0c", preset: "menu", bucket: "review", dismissed: true });
  assert.deepEqual(notYetEvent({ id: "need-t_0a0b0c" }), { id: "need-t_0a0b0c", preset: "choose", choice: "Not yet" });
});

test("a Review row for a workout plays the workout on the stage, never in the drawer (YUI-304)", () => {
  const wk = "plan@wk \"Full body A\"\npage \"Full body A\" body=\"Rest 90 seconds.\"\npick@e1-sets \"Squat\" \"Set 1\"|\"Set 2\"|Skip\nslide@e1-reps \"Reps\" 1-30 value=10";
  const m = thread([row({ sender: "user", body: "Start today's workout" }), row({ body: yl(wk) }), row({ body: yl("menu review@need-w \"Today's workout\"") })]);
  assert.equal(holdsWorkout(wk), true);
  assert.equal(holdsWorkout("plan@p \"Trip\"\npick@x \"Where\" Rome|Paris"), false);
  const h = homeOf(m);
  assert.ok(h.workout);
  assert.deepEqual(waitingAction({ id: "need-w", label: "Today's workout" }, h), { play: h.workout });
  // it plays from the workout's own message (a lead turn), not from whatever the person asked before it
  assert.equal(turnOf(m, h.workout).ask, null);
  assert.ok(turnOf(m, h.workout).replies >= 1);
  // another row still goes back to the agent
  assert.equal(waitingAction({ id: "dana", label: "Invite Dana?" }, h).tap.id, "dana");
  // no workout in the thread: the row is an ordinary ask
  assert.equal(waitingAction({ id: "w", label: "Today's workout" }, homeOf(thread([row({ body: "Hi." })]))).tap.id, "w");
});

test("YUI-306: a page is named by its saved name, its title, then a word for its kind, never Screen N", () => {
  const m = thread([row({ body: yl(">2 timer 5m\n>3 list \"a\" \"b\"\nsave this-week\n>4 stat 12 \"A very long title that overruns the pill\"") })]);
  const h = homeOf(m);
  assert.equal(pageTitle(h.state, "2"), "Timer");
  assert.equal(pageTitle(h.state, "4"), "A very long title tha…");
  assert.equal(pageTitle(h.state, "4").length, 22);
  assert.equal(pageTitle(h.state, "3", { "this-week": "3" }), "This week");
  assert.equal(pageTitle(h.state, "7"), "Page");
  for (const k of h.pages) assert.doesNotMatch(pageTitle(h.state, k, h.saved), /^Screen \d/);
});
