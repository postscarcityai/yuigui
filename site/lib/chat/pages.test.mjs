// node --test site/lib/chat/pages.test.mjs (SITE-83): the site chat's pages and dots.
import assert from "node:assert/strict";
import test from "node:test";
import { dotAt, dotsLayout, dotsView, threadPages } from "./pages.mjs";
import { readAnswer } from "./stage.mjs";

const y = (lines) => "```yui\n" + lines + "\n```";
const on = (r, k) => r.state.screens[k].map((n) => [n.preset, n.props.value ?? n.props.title ?? null]);

test("no pages: the chat alone", () => {
  const r = threadPages(["Hi.", y('choose "Pick" A|B')]);
  assert.deepEqual(r.pages, []);
  assert.equal(r.forward, null);
});

test("a line on >2 makes a page and brings it forward", () => {
  const r = threadPages([`Here.\n${y('>2\nstat 41 "Screens drawn"')}`]);
  assert.deepEqual(r.pages, ["2"]);
  assert.equal(r.forward, "2");
  assert.deepEqual(on(r, "2").map((x) => x[0]), ["stat"]);
});

test("pages keep what landed across replies, in number order, and skip numbers", () => {
  const r = threadPages([y(">5\nlist \"Groceries\" Eggs Milk"), "Plain answer.", y('>2 timer 25m Focus')]);
  assert.deepEqual(r.pages, ["2", "5"]);
  assert.equal(r.forward, "2");
});

test("a bare patch in a later reply reaches the page and does not bring it forward", () => {
  const r = threadPages([y('>2\nstat 41 "Screens drawn"'), `Up one.\n${y("~stat 42")}`]);
  assert.equal(r.state.screens["2"][0].props.value, 42);
  assert.equal(r.forward, null);
});

test("an old reply's chat never catches a patch meant for a page", () => {
  const r = threadPages([y('>2\nstat 1 "Page"'), y('stat 7 "Chat"'), y("~stat 9")]);
  assert.equal(r.state.screens["2"][0].props.value, 9);
});

test("an @id lasts: a later reply patches it by id", () => {
  const r = threadPages([y('>3\nstat@runs 1 "Runs"\nstat@km 5 "Km"'), y("~runs 2")]);
  assert.deepEqual(r.state.screens["3"].map((n) => n.props.value), [2, 5]);
});

test(">2 clear removes the page", () => {
  const r = threadPages([y('>2\nstat 1 "A"\n>3\nstat 2 "B"'), y(">2 clear")]);
  assert.deepEqual(r.pages, ["3"]);
  assert.equal(r.forward, null);
});

test(">2 talk keeps the composer on it; talk off and clear take it away", () => {
  assert.deepEqual(threadPages([y('>2 talk\n>2 stat 1 "A"')]).talk, ["2"]);
  assert.deepEqual(threadPages([y('>2 talk\n>2 stat 1 "A"'), y(">2 talk off")]).talk, []);
  assert.deepEqual(threadPages([y('>2 talk\n>2 stat 1 "A"\n>3 stat 2 "B"'), y(">2 clear")]).talk, []);
});

test("only 2 to 12 are pages; >13 and >full stay in the reply", () => {
  const r = threadPages([y('>13\nstat 1 "A"\n>full\ntimer 5m Plank')]);
  assert.deepEqual(r.pages, []);
});

test("the stage never plays a page's lines; the chat's still play", () => {
  const a = readAnswer(`Look right.\n${y('>2\nstat 41 "Screens drawn"\n>1\nchoose "Like it?" Yes|No')}`);
  assert.deepEqual(a.chunks.map((c) => c.text), ["Look right."]);
  assert.deepEqual(a.questions.map((q) => q.node.preset), ["choose"]);
});

test("dots: all at full pitch when they fit, a window of 7 when they don't", () => {
  assert.deepEqual(dotsLayout(3), { pitch: 14, pill: 16, shown: 3, width: 44 });
  assert.equal(dotsLayout(12).shown, 7);
  const tight = dotsLayout(5, 70);
  assert.ok(tight.pitch >= 10 && tight.pitch < 14);
  assert.ok(tight.width <= 70 - 16);
});

test("dots: the pill stretches between two dots and the window slides with it", () => {
  const still = dotsView(4, 1);
  assert.equal(still.pillW, 16);
  assert.equal(still.pillX, 8 + 14);
  const half = dotsView(4, 1.5);
  assert.ok(half.pillW > 16);
  const far = dotsView(12, 11);
  assert.equal(far.first, 5);
  assert.ok(far.dots[0].cut && far.dots[0].fade < 1);
  assert.ok(!far.dots[far.dots.length - 1].cut);
});

test("dots: a tap jumps to the nearest dot", () => {
  assert.equal(dotAt(4, 0, null, 8 + 14 * 2), 2);
  assert.equal(dotAt(4, 0, null, -40), 0);
  assert.equal(dotAt(4, 0, null, 999), 3);
});
