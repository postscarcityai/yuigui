// node --test site/lib/chat/crew.test.mjs (SITE-69): Meet the crew in the site chat, every step with
// no model turn: the crew screen, a member's flow, their answer and one like or dislike, Meet another.
import assert from "node:assert/strict";
import test from "node:test";
import { flowEvent } from "../yl/yl.mjs";
import { STARTER_FLOWS, savedGraph } from "../yl/starter-flows.mjs";
import { CREW, LIKE, crewOf, crewScreen, crewTurn } from "./crew.mjs";
import { STARTERS } from "./feedback.mjs";
import { cleanLines, splitReply } from "./lines.mjs";
import { readAnswer } from "./stage.mjs";

const yl = (reply) => splitReply(reply).filter((p) => p.yl).map((p) => p.yl).join("\n");

// One full run of each member's flow, the answers a visitor could give.
const RUNS = {
  Arnold: { sleep: 8, sore: ["Nothing"], minutes: 30, gear: "Just me", warm: "Yes, 3 minutes" },
  Basil: { photo: "Salmon", portion: "Half", meal: "Dinner" },
  Gouda: { vibe: "Lo-fi", lofibpm: 80, row: "Busier hats", chords: "Warm", major: "G" },
  Penny: { on: ["Errands", "Bills"], top: "Bills", when: "Whenever it fits", pace: "3 to 5" },
  Quill: { topic: "How a ball flies", know: "A little", bq: "45 degrees", again: "In 3 days" },
};

test("Meet the crew is a starter, and its words bring the crew screen", () => {
  assert.ok(STARTERS.includes("Meet the crew"));
  for (const t of ["Meet the crew", "meet the crew!", "Meet the starter crew", "Meet another"]) {
    const r = crewTurn(t, null);
    assert.ok(r, t);
    assert.equal(yl(r.reply), crewScreen(false));
    assert.equal(r.agent, null);
  }
  assert.equal(crewTurn("Tell me about the crew and pricing", null), null);
  assert.equal(crewTurn("Is it free?", null), null);
});

test("the crew screen: one choose of all five, kept by the chat, one question on the stage", () => {
  for (const again of [false, true]) {
    const line = crewScreen(again);
    assert.equal(cleanLines(line), line);
    const a = readAnswer(`Five agents.\n\n\`\`\`yui\n${line}\n\`\`\``);
    assert.equal(a.questions.length, 1);
    assert.equal(a.questions[0].node.id, "crew");
    assert.deepEqual(a.questions[0].node.props.options, CREW.map((m) => m.name));
  }
  assert.equal(new Set(CREW.map((m) => m.c)).size, 5, "five colors");
});

test("a tap on a member plays their saved flow, in their colors", () => {
  for (const m of CREW) {
    const r = crewTurn(`[yui] crew choose choice=${m.name}`, { id: "crew", preset: "choose", choice: m.name });
    assert.equal(r.agent, m.name);
    assert.equal(yl(r.reply), `flow@${m.id} ${m.flow}`);
    assert.ok(r.reply.startsWith(`${m.name} here.`));
    assert.ok(STARTER_FLOWS.find((f) => f.name === m.flow && f.id === m.id), `${m.flow} is a saved flow`);
    assert.equal(crewOf(r.reply), m);
    const a = readAnswer(r.reply);
    assert.equal(a.chunks.some((c) => c.pic?.preset === "flow"), true, `${m.name}'s flow is on the stage`);
  }
  assert.equal(crewTurn("", { id: "crew", preset: "choose", choice: "Mallory" }), null);
});

test("each flow end to end: their answer, then one like or dislike question", () => {
  for (const m of CREW) {
    const ev = { ...flowEvent(savedGraph(m.flow).g, RUNS[m.name]), id: m.id, preset: "flow" };
    const r = crewTurn("[yui] flow", ev);
    assert.ok(r, `${m.name}'s flow answers`);
    assert.equal(r.agent, m.name);
    assert.equal(crewOf(r.reply), m);
    const a = readAnswer(r.reply);
    const last = a.questions[a.questions.length - 1];
    assert.equal(last.node.id, `crewlike-${m.handle}`);
    assert.deepEqual(last.node.props.options, LIKE);
    assert.equal(last.node.props.other, true);
  }
});

test("the like answer is noted, then Meet another", () => {
  const liked = crewTurn("", { id: "crewlike-gouda", preset: "choose", choice: "I like it" });
  assert.deepEqual(liked.notes, [{ kind: "praise", text: "Gouda's flow (musician-jam): i like it", quote: null }]);
  assert.equal(yl(liked.reply), crewScreen(true));
  assert.equal(liked.agent, null);
  const not = crewTurn("", { id: "crewlike-penny", preset: "choose", choice: "Not for me" });
  assert.equal(not.notes[0].kind, "confusion");
  const typed = crewTurn("", { id: "crewlike-quill", preset: "choose", choice: "More topics please", other: true });
  assert.deepEqual(typed.notes, [{ kind: "feature", text: "Quill's flow (study-quiz): More topics please", quote: "More topics please" }]);
  assert.equal(crewTurn("", { id: "crewlike-mallory", preset: "choose", choice: "I like it" }), null);
});

test("a flow the model sends on its own wears its member's colors; others wear Yui's", () => {
  assert.equal(crewOf("Try this.\n\n```yui\nflow@study study-quiz\n```").name, "Quill");
  assert.equal(crewOf("```yui\nflow@onboard onboarding\n```"), null);
  assert.equal(crewOf("```yui\nflow@study planner-week\n```"), null);
  assert.equal(crewOf("Hi."), null);
});
