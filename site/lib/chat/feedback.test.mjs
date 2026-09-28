// node --test site/lib/chat/feedback.test.mjs (SITE-67): the feedback-first screens draw, and a sent
// feedback flow turns into notes.
import assert from "node:assert/strict";
import test from "node:test";
import { DISLIKES, FEEDBACK_PLAN, HELP, LIKES, PITCH, STARTERS, feedbackNotes } from "./feedback.mjs";
import { cleanLines } from "./lines.mjs";
import { readAnswer } from "./stage.mjs";

const reply = (yl) => `Tell me straight.\n\`\`\`yui\n${yl}\n\`\`\``;

test("four starters, feedback first", () => {
  assert.equal(STARTERS.length, 4);
  assert.match(STARTERS[0], /like/);
});

test("the chat keeps every line of the three screens", () => {
  for (const yl of [FEEDBACK_PLAN, PITCH, HELP("https://testflight.apple.com/join/x")]) {
    assert.equal(cleanLines(yl).split("\n").length, yl.split("\n").length, yl);
  }
});

test("the feedback flow is one plan with three questions, played as its own steps (SITE-68)", () => {
  const r = readAnswer(reply(FEEDBACK_PLAN));
  const c = r.chunks.find((x) => x.pic?.preset === "plan");
  assert.equal(c?.pic.id, "feedback");
  const members = r.parts[c.part].nodes.filter((n) => n.in === "feedback");
  assert.deepEqual(members.map((n) => n.id), ["likes", "dislikes", "line"]);
  assert.deepEqual(members[0].props.options, LIKES);
  assert.deepEqual(members[1].props.options, DISLIKES);
  assert.deepEqual(r.questions, []);
});

test("the pitch is a deck of four pages ending in a choice", () => {
  const r = readAnswer(reply(PITCH));
  assert.equal(r.chunks.filter((c) => c.page).length, 4);
  assert.deepEqual(r.questions.map((q) => q.node.preset), ["choose"]);
});

test("how to help is four cards, each with a button", () => {
  const r = readAnswer(reply(HELP("https://testflight.apple.com/join/x")));
  const cards = r.chunks.map((c) => c.pic).filter((p) => p?.preset === "card");
  assert.equal(cards.length, 4);
  for (const c of cards) assert.ok(c.props.cta, c.props.title);
  assert.equal(cards[3].id, "share");
  assert.equal(cards[3].props.url, undefined);
});

test("a sent flow: likes are praise, dislikes are confusion, the open line is handed back", () => {
  const r = feedbackNotes({ id: "feedback", preset: "plan", plan: { likes: ["Screens, not text", "Pizza mode"], dislikes: ["iPhone only"], line: { idea: "An Android app please" } } });
  assert.deepEqual(r.notes, [
    { kind: "praise", text: "Likes: Screens, not text", quote: null },
    { kind: "praise", text: "Likes: Pizza mode", quote: "Pizza mode" },
    { kind: "confusion", text: "Not landing: iPhone only", quote: null },
  ]);
  assert.equal(r.line, "An Android app please");
});

test("anything else is not a feedback flow", () => {
  assert.equal(feedbackNotes({ id: "n1", preset: "choose", choice: "Love it" }), null);
  assert.equal(feedbackNotes(null), null);
  assert.deepEqual(feedbackNotes({ id: "feedback", preset: "plan", plan: {} }), { notes: [], line: null });
});
