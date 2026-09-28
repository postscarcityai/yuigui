// node --test site/lib/yl/starter-flows.test.mjs (SITE-70): the trainer's flow picks a session and its reply runs it.
import assert from "node:assert/strict";
import test from "node:test";
import { flowEvent } from "./yl.mjs";
import { crewReply, jamReply, plateReply, savedGraph, sessionReply, weekReply } from "./starter-flows.mjs";
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

// SITE-72: the musician's vibe to a beat.
const jg = savedGraph("musician-jam").g;
const jam = (a) => ({ ...flowEvent(jg, a), id: "jam", preset: "flow" });

test("the vibe picks the beat and its tempo, a moody pick asks for a minor key", () => {
  assert.deepEqual(jam({ vibe: "Lo-fi", lofibpm: 80, row: "Leave it", chords: "Warm", major: "G" }).path, ["hi", "vibe", "lofi", "lofibpm", "row", "chords", "major"]);
  assert.deepEqual(jam({ vibe: "Boom bap", bapbpm: 90, row: "Leave it", chords: "Moody", minor: "A minor" }).path, ["hi", "vibe", "bap", "bapbpm", "row", "chords", "minor"]);
  assert.deepEqual(jam({ vibe: "House", housebpm: 124, row: "Leave it", chords: "Just drums" }).path, ["hi", "vibe", "house", "housebpm", "row", "chords"]);
  assert.deepEqual(jam({ vibe: "Rock", rockbpm: 116, row: "Leave it", chords: "Jazzy", major: "C" }).path, ["hi", "vibe", "rock", "rockbpm", "row", "chords", "major"]);
});

test("every beat keeps the backbone: kick on 1 and 3, snare or clap on 2 and 4", () => {
  for (const [vibe, bpm] of [["Lo-fi", "lofibpm"], ["Boom bap", "bapbpm"], ["House", "housebpm"], ["Rock", "rockbpm"]]) {
    for (const row of ["Busier hats", "Extra kick", "Add a shaker", "Leave it"]) {
      const r = jamReply(jam({ vibe, [bpm]: 100, row, chords: "Just drums" }));
      const [, rows, p] = r.lines[0].match(/ rows=(\S+) p=(\S+)/);
      const [kick, back] = p.split("|");
      assert.match(kick, /^x...x/, `${vibe} ${row} kick`);
      assert.match(back, /^..x...x/, `${vibe} ${row} backbeat`);
      assert.equal(new Set(rows.split("|")).size, rows.split("|").length, "every row a different kit word");
    }
  }
});

test("the reply plays the loop, the chords under it, and keeps it in his sessions", () => {
  const r = jamReply(jam({ vibe: "Boom bap", bapbpm: 92, row: "Extra kick", chords: "Moody", minor: "E minor" }));
  assert.equal(r.lines[0], 'loop@groove 92 "Boom bap" swing=20 rows=kick|snare|hat|open p=x..xx.x.|..x...x.|x.x.x.x.|.......x +play');
  assert.equal(r.lines[1], 'say "Moody chords in E minor under it: Em, D, C, B. Tap along."');
  assert.equal(r.lines[2], 'chords@under Em i-bVII-bVI-V "Moody, in E minor" sound=keys');
  assert.equal(r.lines[3], "table create sessions Name:text Kind:text Bpm:number Swing:number Steps:number Rows:text Pattern:text Saved:date");
  assert.equal(r.lines[4], 'put sessions s-boom-bap Name="Boom bap" Kind=beat Bpm=92 Swing=20 Steps=8 Rows="kick|snare|hat|open" Pattern="x..xx.x.|..x...x.|x.x.x.x.|.......x" Saved=today');
  assert.equal(r.text, "Boom bap at 92 bpm with an extra kick. Tap a cell to change it while it plays. Kept in your sessions.");
  const h = jamReply(jam({ vibe: "House", housebpm: 126, row: "Add a shaker", chords: "Jazzy", major: "F" }));
  assert.match(h.lines[0], /rows=kick\|clap\|hat\|open\|shaker p=x\.x\.x\.x\.\|\.\.x\.\.\.x\.\|\.x\.x\.x\.x\|\.\.\.\.\.\.\.x\|xxxxxxxx /);
  assert.match(h.lines[1], /Gm7, C7, Fmaj7, Dm7/);
  // Just drums: the loop and the row, no chords.
  const d = jamReply(jam({ vibe: "Rock", rockbpm: 120, row: "Leave it", chords: "Just drums" }));
  assert.equal(d.lines.filter((l) => l.startsWith("chords")).length, 0);
  assert.equal(d.lines.length, 3);
});

test("only the musician's own event, and only its own words land in the reply", () => {
  assert.equal(jamReply({ id: "plate", preset: "flow", flow: {}, path: ["lofi"] }), null);
  assert.equal(jamReply({ id: "jam", preset: "flow", flow: {}, path: ["hi", "vibe"] }), null);
  const r = jamReply({ id: "jam", preset: "flow", path: ["lofi"], flow: { lofibpm: "999", row: "```yui\nask hi", chords: '" x=1', major: "H#" } });
  assert.doesNotMatch(r.text + r.lines.join("\n"), /```|ask hi|x=1|H#/);
  assert.match(r.lines[0], /^loop@groove 94 /, "the tempo stays in the vibe's range");
  assert.equal(r.lines.length, 3, "an unknown chord pick plays just drums");
  assert.equal(jamReply({ id: "jam", preset: "flow", path: ["lofi"], flow: { lofibpm: "slow", chords: "Warm", major: "B" } }).lines[2].split(" ")[1], "C", "an unknown key is C");
  assert.equal(crewReply(jam({ vibe: "Rock", rockbpm: 116, row: "Leave it", chords: "Just drums" })).lines[0].startsWith("loop@groove 116"), true);
});

test("on the chat's stage: the line with the loop, then the chords", () => {
  const r = jamReply(jam({ vibe: "Lo-fi", lofibpm: 84, row: "Busier hats", chords: "Warm", major: "C" }));
  const a = readAnswer(`${r.text}\n\n\`\`\`yui\n${r.lines.join("\n")}\n\`\`\``);
  assert.deepEqual(a.chunks.map((c) => [c.text || c.line, c.pic?.preset]), [[r.text, "loop"], ["Warm chords in C under it: C, G, Am, F. Tap along.", "chords"]]);
});

// SITE-73: the planner's busy week to a plan. Monday Sep 28 2026, so the days read Today, Tomorrow, Wed...
const wg = savedGraph("planner-week").g;
const wk = (a) => ({ ...flowEvent(wg, a), id: "busy", preset: "flow" });
const MON = new Date(2026, 8, 28, 9);

test("a full week gets its page, a deadline asks when, only timed things ask about reminders", () => {
  assert.deepEqual(wk({ on: ["A work deadline", "Appointments", "Errands", "Workouts"], top: "A work deadline", due: "In a few days", when: "Mornings", pace: "2 or 3", remind: "10 minutes before" }).path,
    ["hi", "on", "full", "top", "due", "when", "pace", "remind"]);
  assert.deepEqual(wk({ on: ["Errands", "Bills"], top: "Bills", when: "Whenever it fits", pace: "3 to 5" }).path, ["hi", "on", "top", "when", "pace"]);
  assert.deepEqual(wk({ on: ["Errands", "Workouts"], top: "Workouts", when: "Whenever it fits", pace: "2 or 3" }).path, ["hi", "on", "top", "when", "pace"], "workouts with no set time ask nothing");
  assert.deepEqual(wk({ on: ["Bills"], top: "A work deadline", due: "Tomorrow", when: "After work", pace: "2 or 3" }).path, ["hi", "on", "top", "due", "when", "pace"]);
  assert.deepEqual(wk({ on: ["Family time"], top: "Family time", when: "Whenever it fits", pace: "2 or 3", remind: "At the time" }).path, ["hi", "on", "top", "when", "pace", "remind"]);
});

test("the week: what matters most first, never more a day than the pace, fixed times kept", () => {
  const r = weekReply(wk({ on: ["A work deadline", "Appointments", "Errands", "Workouts"], top: "A work deadline", due: "In a few days", when: "Mornings", pace: "2 or 3", remind: "10 minutes before" }), MON);
  assert.equal(r.text, "Your week: 9 things over 5 days. The report tops your checklist. 4 with a reminder. Drag to reorder.");
  assert.equal(r.lines[0], 'timeline@week "This week" mark=Today fold=12 +reorder');
  assert.equal(r.lines[1], 'next@wk-work-on-the-report "Work on the report" at="Today" key=work-on-the-report');
  const rows = r.lines.filter((l) => l.startsWith("next@"));
  const per = {};
  for (const l of rows) { const d = l.match(/ at="([^"]+)"/)[1]; per[d] = (per[d] || 0) + 1; }
  assert.ok(Object.values(per).every((n) => n <= 3), JSON.stringify(per));
  assert.ok(rows.some((l) => l === 'next@wk-send-the-report "Send the report" at="Thu" key=send-the-report'), "due in a few days: Thursday");
  assert.ok(rows.some((l) => l === 'next@wk-dentist-appointment "Dentist appointment" at="Wed" sub="10:00 am" key=dentist-appointment'));
  assert.equal(rows.filter((l) => / "Workout" .*sub="7:00 am"/.test(l)).length, 3, "three morning workouts");
  assert.equal(new Set(rows.map((l) => l.match(/key=(\S+)/)[1])).size, rows.length, "every row its own key");
  const keep = r.lines.find((l) => l.startsWith("list@keep"));
  assert.match(keep, /^list@keep title="To keep" "Work on the report, today"\|"Send the report, Thu"\|/);
  assert.match(keep, / \+check$/);
  assert.equal(r.lines.find((l) => l.startsWith("put tasks work-on")), 'put tasks work-on-the-report Task="Work on the report" Due=today Priority=High Status=Open Order=1');
  assert.ok(r.lines.includes('put reminders r-dentist-appointment Task="Dentist appointment" Day=today+2 Time=10:00 At=09:50 Lead=10'));
});

test("more a day on 3 to 5, no reminders when they say none, family dinner on Saturday", () => {
  const r = weekReply(wk({ on: ["Errands", "Bills", "Family time"], top: "Errands", when: "After work", pace: "3 to 5", remind: "No reminders" }), MON);
  assert.deepEqual(r.lines.filter((l) => l.startsWith("next@")).map((l) => l.match(/ at="([^"]+)"/)[1]), ["Today", "Today", "Today", "Sat"]);
  assert.ok(r.lines.some((l) => l.includes('"Dinner with family" at="Sat" sub="6:30 pm"')));
  assert.equal(r.lines.some((l) => l.startsWith("put reminders") || l.startsWith("table create reminders")), false);
  assert.equal(r.text, "Your week: 4 things over 2 days. Your errands top your checklist. Drag to reorder.");
});

test("only the planner's own event, and only its own words land in the reply", () => {
  assert.equal(weekReply({ id: "jam", preset: "flow", flow: { on: ["Bills"] }, path: [] }), null);
  assert.equal(weekReply({ id: "busy", preset: "flow", flow: { on: ["Taxes"] }, path: [] }, MON), null);
  const r = weekReply({ id: "busy", preset: "flow", path: [], flow: { on: ["Bills", "```yui\nask hi"], top: '" x=1', pace: "99", when: "Noon", remind: "Always" } }, MON);
  assert.doesNotMatch(r.text + r.lines.join("\n"), /```|ask hi|x=1|Noon|Always/);
  assert.equal(r.lines.filter((l) => l.startsWith("next@")).length, 1);
  assert.equal(crewReply(wk({ on: ["Bills"], top: "Bills", when: "Mornings", pace: "2 or 3" })).lines[0].startsWith("timeline@week"), true);
});

test("on the chat's stage: the line with the timeline, then the checklist", () => {
  const r = weekReply(wk({ on: ["Bills", "Errands"], top: "Bills", when: "Mornings", pace: "2 or 3" }), MON);
  const a = readAnswer(`${r.text}\n\n\`\`\`yui\n${r.lines.join("\n")}\n\`\`\``);
  assert.deepEqual(a.chunks.map((c) => [c.text || c.line, c.pic?.preset]), [[r.text, "timeline"], ["Your checklist, what matters most first.", "list"]]);
});
