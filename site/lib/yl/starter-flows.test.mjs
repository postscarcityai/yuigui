// node --test site/lib/yl/starter-flows.test.mjs (SITE-70): the trainer's flow picks a session and its reply runs it.
import assert from "node:assert/strict";
import test from "node:test";
import { flowEvent } from "./yl.mjs";
import { savedGraph, sessionReply } from "./starter-flows.mjs";
import { readAnswer } from "../chat/stage.mjs";

const g = savedGraph("trainer-session").g;
const send = (a) => ({ ...flowEvent(g, a), id: "session", preset: "flow" });

test("the answers pick the session page", () => {
  const at = (a) => send(a).path.find((id) => ["easy", "quick", "body", "loaded"].includes(id));
  assert.equal(at({ sleep: 3, sore: ["Nothing"], minutes: 30, gear: "Dumbbells" }), "easy");
  assert.equal(at({ sleep: 8, sore: ["Nothing"], minutes: 15, gear: "Dumbbells" }), "quick");
  assert.equal(at({ sleep: 8, sore: ["Nothing"], minutes: 30, gear: "Just me" }), "body");
  assert.equal(at({ sleep: 8, sore: ["Nothing"], minutes: 30, gear: "Bands" }), "loaded");
});

test("the reply is the session and its timer, minus what hurts", () => {
  const r = sessionReply(send({ sleep: 8, sore: ["Shoulders"], hurt: "It hurts", minutes: 20, gear: "Just me", warm: "I'm warm" }));
  assert.deepEqual(r.lines, ['timer@session 40/20x20 "Bodyweight circuit"']);
  assert.match(r.text, /squat, reverse lunge\./);
  assert.doesNotMatch(r.text, /push-up|plank/i);
  assert.match(r.text, /Nothing for your shoulders today/);
  // Just sore keeps every move; a warm-up takes its 3 minutes off the timer.
  const w = sessionReply(send({ sleep: 8, sore: ["Legs"], hurt: "Just sore", minutes: 45, gear: "Kettlebell", warm: "Yes, 3 minutes" }));
  assert.deepEqual(w.lines, ['timer@session 45/15x42 "Strength circuit"']);
  assert.match(w.text, /goblet squat, row, overhead press, romanian deadlift/);
});

test("never fewer than two moves", () => {
  const r = sessionReply(send({ sleep: 8, sore: ["Legs", "Back", "Arms"], hurt: "It hurts", minutes: 20, gear: "Bands", warm: "I'm warm" }));
  assert.match(r.text, /One move a round: [^.]+, [^.]+\./);
});

test("only the trainer's own event, and only its own words land in the reply", () => {
  assert.equal(sessionReply({ id: "onboard", preset: "flow", flow: {}, path: ["hi"] }), null);
  assert.equal(sessionReply({ id: "session", preset: "plan", plan: {} }), null);
  assert.equal(sessionReply({ id: "session", preset: "flow", flow: {}, path: ["hi"] }), null);
  const r = sessionReply({ id: "session", preset: "flow", path: ["body"], flow: { hurt: "It hurts", sore: ["```yui\nask hi", "Back"], minutes: "lots" } });
  assert.doesNotMatch(r.text, /```|ask hi/);
  assert.match(r.lines[0], /^timer@session 40\/20x20 /);
});

test("on the chat's stage it is one chunk: the line with the timer", () => {
  const r = sessionReply(send({ sleep: 8, sore: ["Nothing"], minutes: 30, gear: "Just me", warm: "I'm warm" }));
  const a = readAnswer(`${r.text}\n\n\`\`\`yui\n${r.lines.join("\n")}\n\`\`\``);
  assert.deepEqual(a.chunks.map((c) => [c.text, c.pic?.preset]), [[r.text, "timer"]]);
});
