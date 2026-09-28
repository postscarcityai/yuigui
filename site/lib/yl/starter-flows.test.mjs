// node --test site/lib/yl/starter-flows.test.mjs (SITE-70): the trainer's flow picks a session and its reply runs it.
import assert from "node:assert/strict";
import test from "node:test";
import { flowEvent } from "./yl.mjs";
import { crewReply, plateReply, savedGraph, sessionReply } from "./starter-flows.mjs";
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

// SITE-71: the nutritionist's plate to macros.
const pg = savedGraph("nutritionist-plate").g;
const plate = (a) => ({ ...flowEvent(pg, a), id: "plate", preset: "flow" });

test("how sure he is shapes the next step", () => {
  assert.deepEqual(plate({ photo: "Salmon", portion: "All of it", meal: "Dinner" }).path, ["hi", "photo", "fish", "portion", "meal"]);
  assert.deepEqual(plate({ photo: "Pancakes", syrup: "None", portion: "Half", meal: "Breakfast" }).path, ["hi", "photo", "stack", "syrup", "portion", "meal"]);
  assert.deepEqual(plate({ photo: "Poke bowl", rice: "A big bowl", portion: "Double", meal: "Lunch" }).path, ["hi", "photo", "bowl", "rice", "portion", "meal"]);
});

test("the reply saves the row in the app's meals table and shows today", () => {
  const r = plateReply(plate({ photo: "Poke bowl", rice: "A small scoop", portion: "A bit more", meal: "Lunch" }));
  assert.equal(r.lines[0], "table create meals Day:date Meal:text Food:text Portion:text Cal:number:kcal Protein:number:g Carbs:number:g Fat:number:g");
  assert.equal(r.lines[1], 'put meals Day=today Meal=Lunch Food="Salmon poke bowl" Portion="A bit more" Cal=825 Protein=45 Carbs=84 Fat=33');
  assert.equal(r.lines[2], 'stat@kcal 825kcal "Calories today" sub="of 2,100. 1,275 to go."');
  assert.match(r.lines[4], /^chart@macros bar "Macros vs goal" x=Protein\|Carbs\|Fat y=45\|84\|33 y2=140\|210\|70 /);
  assert.match(r.text, /^Saved: salmon poke bowl for lunch, 825 kcal\. Today so far: 825 of 2,100, 1,275 to go\.$/);
  // Syrup only moves the pancakes; the salmon has nothing to fix but the portion.
  assert.match(plateReply(plate({ photo: "Pancakes", syrup: "None", portion: "All of it", meal: "Breakfast" })).lines[1], / Cal=420 Protein=12 Carbs=62 Fat=14$/);
  assert.match(plateReply(plate({ photo: "Salmon", portion: "Half", meal: "Dinner" })).lines[1], /Meal=Dinner .* Cal=280 Protein=21 Carbs=6 Fat=19$/);
});

test("only the nutritionist's own event, and only its own words land in the reply", () => {
  assert.equal(plateReply({ id: "session", preset: "flow", flow: {}, path: ["body"] }), null);
  assert.equal(plateReply({ id: "plate", preset: "flow", flow: {}, path: ["hi", "photo"] }), null);
  const r = plateReply({ id: "plate", preset: "flow", path: ["fish"], flow: { portion: "```yui\nask hi", meal: '" x=1' } });
  assert.doesNotMatch(r.text + r.lines.join("\n"), /```|ask hi|x=1/);
  assert.match(r.lines[1], /Meal=Snack .*Portion="All of it" Cal=560 /);
  assert.equal(crewReply(plate({ photo: "Salmon", portion: "All of it", meal: "Dinner" })).lines[1], r.lines[1].replace("Snack", "Dinner"));
});

test("on the chat's stage: the line with today's calories, then the macros chart", () => {
  const r = plateReply(plate({ photo: "Salmon", portion: "All of it", meal: "Dinner" }));
  const a = readAnswer(`${r.text}\n\n\`\`\`yui\n${r.lines.join("\n")}\n\`\`\``);
  assert.deepEqual(a.chunks.map((c) => [c.text || c.line, c.pic?.preset]), [[r.text, "stat"], ["Macros against your goal.", "chart"]]);
});
