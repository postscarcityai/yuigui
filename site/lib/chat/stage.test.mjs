// node --test site/lib/chat/stage.test.mjs (SITE-66): answers play on the stage as chunks.
import assert from "node:assert/strict";
import test from "node:test";
import { micLine, readAnswer, textParts } from "./stage.mjs";

const view = (reply) => {
  const r = readAnswer(reply);
  return { chunks: r.chunks.map((c) => [c.text || c.line, c.pic ? c.pic.preset : null]), questions: r.questions.map((q) => q.node.preset), plan: r.plan ? r.plan.node.id : null };
};

test("a plain answer is one chunk per paragraph", () => {
  assert.deepEqual(view("Yes, it's free.\n\nIt's on TestFlight."), { chunks: [["Yes, it's free.", null], ["It's on TestFlight.", null]], questions: [], plan: null });
});

test("a line of text takes the picture after it", () => {
  assert.deepEqual(view("Five minutes, go.\n```yui\ntimer 5m Plank\n```"), { chunks: [["Five minutes, go.", "timer"]], questions: [], plan: null });
});

test("a deck plays one page per chunk", () => {
  const r = view('Here is the tour.\n```yui\ndeck "Yui"\npage "Screens" body="Answers draw."\npage "Voice" body="Talk to it."\nend\n```');
  assert.deepEqual(r.chunks, [["Here is the tour.", null], ["Screens", null], ["Voice", null]]);
});

test("a plan plays its own steps: one chunk, its questions stay in it (SITE-68)", () => {
  const r = readAnswer('Two things.\n```yui\nplan@p "Before I go"\npage "Hi" body="Two quick ones."\nchoose@a "Ping you?" Yes|No\nchoose@b "Try first?" Keys|Beats\nend\n```');
  assert.deepEqual(r.chunks.map((c) => [c.text, c.pic.preset, c.pic.id]), [["Two things.", "plan", "p"]]);
  assert.deepEqual(r.questions, []);
});

test("a flow is one chunk that plays on the stage (SITE-68)", () => {
  assert.deepEqual(view("Here is the first run.\n```yui\nflow@onboard onboarding\n```"), { chunks: [["Here is the first run.", "flow"]], questions: [], plan: null });
  const inline = readAnswer('```yui\nflow@c "Check-in"\nflowchart TD\n  %% a: choose "Energy?" Low|High\n  a --> b\n  %% b: page "Thanks"\nend\n```');
  assert.equal(inline.chunks.length, 1);
  assert.equal(inline.chunks[0].pic.preset, "flow");
  assert.deepEqual(inline.chunks[0].pic.props.nodes.map((n) => n.id), ["a", "b"]);
});

test("a loose question with text before it", () => {
  const r = view('What brings you here?\n```yui\nchoose "Pick one" Curious|Builder\n```');
  assert.deepEqual(r, { chunks: [["What brings you here?", null]], questions: ["choose"], plan: null });
});

test("a list stays one chunk", () => {
  assert.deepEqual(textParts("Three ways:\n\n- Talk\n- Type\n- Tap"), ["Three ways:", "- Talk\n- Type\n- Tap"]);
});

test("the mic line says what works here", () => {
  assert.equal(micLine({ voice: false }), "Voice needs Chrome or Safari here. Type instead.");
  assert.equal(micLine({ voice: true }), "Tap the mic and talk, or T to type.");
  assert.equal(micLine({ voice: true, blocked: true }), "The mic is blocked. Allow it in the address bar, or type.");
  assert.match(micLine({ voice: true, listening: true }), /^Listening/);
});

test("headings and Label: value lines stay whole for the reader (SITE-97)", () => {
  const md = "## Status\n✅ Tests: 27 passed\n❌ Lint: 2 warnings";
  assert.deepEqual(textParts(md), [md]);
  assert.deepEqual(textParts("**Fixed:** the timer\n**Next:** ship it"), ["**Fixed:** the timer\n**Next:** ship it"]);
});
