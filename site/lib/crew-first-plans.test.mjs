import test from "node:test";
import assert from "node:assert/strict";
import { HANDLES, NAMES, NOT_SURE, ask, askLines, norm, resultLines, skipped, wholeLines } from "./crew-first-plans.mjs";
import { parse } from "./yl/yl.mjs";

const ok = (text) => assert.ok(parse(text).every((o) => o.op !== "error"), text);

test("questions match the saved flows of YUI-227", () => {
  assert.deepEqual(ask("basil").map((s) => s.q), ["What's the goal?", "Which days should I plan?", "How many meals a day?", "What should I leave out?", "How long can you cook?"]);
  assert.deepEqual(ask("gouda").map((s) => s.q), ["What do you play?", "How would you rate yourself?", "Minutes a day?", "What do you want to play?"]);
  assert.deepEqual(ask("penny").map((s) => s.q), ["Which days are packed?", "When do you plan?", "How do you want reminders?"]);
  assert.deepEqual(ask("quill").map((s) => s.q), ["What are you learning?", "How long do you have?", "How do you like to be quizzed?"]);
  for (const h of HANDLES) for (const s of ask(h)) assert.equal(s.options.at(-1), NOT_SURE);
});

test("every screen parses, for every member", () => {
  for (const h of HANDLES) {
    ask(h).forEach((_, i) => ok(askLines(h, i)));
    ok(resultLines(h, {})); ok(resultLines(h, skipped(h))); ok(wholeLines(h, {}));
    assert.ok(NAMES[h]);
  }
});

test("each answer changes the example", () => {
  for (const h of HANDLES) {
    const base = Object.fromEntries(ask(h).map((s) => [s.id, s.options[0]]));
    const same = resultLines(h, base);
    const changed = ask(h).filter((s) => resultLines(h, { ...base, [s.id]: s.options[1] }) !== same).length;
    assert.ok(changed >= ask(h).length - 1, `${h} answers do nothing (${changed})`);
  }
});

test("the example is labelled as one", () => {
  for (const h of HANDLES) assert.match(resultLines(h, {}), /Example/);
});

// SITE-141: Arnold's timed session, the web twin of YUI-220.
import { DEMO, FAIL_LINE, coachCue, sessionFor } from "./first-plan-play.mjs";
const heavy = { goal: "Lift heavy", days: "3", time: "45 min", gear: "A gym", level: "Lifted for years" };
const fresh = { ...heavy, level: "New to lifting" };

test("a session runs work, rest, work with no step missing, and ends on a set", () => {
  const { steps } = sessionFor(heavy);
  assert.equal(steps.at(-1).kind !== "rest", true);
  assert.equal(steps[0].kind, "work");
  steps.forEach((s, i) => { if (s.kind === "rest") assert.notEqual(steps[i + 1].kind, "rest"); });
  assert.equal(steps.filter((s) => s.kind === "rest").length, steps.filter((s) => s.kind !== "rest").length - 1);
});

test("the demo runs in about a minute", () => {
  for (const a of [heavy, fresh, {}]) {
    const secs = sessionFor(a).steps.reduce((t, s) => t + (s.kind === "fail" ? DEMO.failAuto : s.seconds), 0);
    assert.ok(secs >= 30 && secs <= 75, `${secs}s`);
  }
});

test("only heavy lifters get a to-failure last set, once per lift, never on a hold", () => {
  const h = sessionFor(heavy);
  assert.equal(h.heavy, true);
  const fails = h.steps.filter((s) => s.kind === "fail");
  assert.equal(fails.length, h.moves.length);
  for (const f of fails) { assert.equal(f.set, f.sets); assert.equal(f.seconds, 0); }
  assert.match(FAIL_LINE, /^To failure\. Stop when form breaks\.$/);
  for (const a of [fresh, { ...heavy, level: "Some experience" }, {}, { ...heavy, level: "Not sure" }]) {
    const s = sessionFor(a);
    assert.equal(s.heavy, false);
    assert.equal(s.steps.some((x) => x.kind === "fail"), false);
  }
  // A plank is never taken to failure, even for a heavy lifter.
  const core = sessionFor({ ...heavy, days: "5" }, { ...DEMO, moves: 6 });
  assert.equal(core.steps.some((s) => s.kind === "fail" && /plank/i.test(s.name)), false);
});

test("a rest names what is next and carries that move's cue", () => {
  const { steps } = sessionFor(fresh);
  const rests = steps.filter((s) => s.kind === "rest");
  assert.match(rests[0].next, /^Next: .+, set 2 of \d$/);
  const between = rests.find((r) => /^Next: [^,]+$/.test(r.next) && r.next !== "Next: finish");
  assert.ok(between, "a rest before the next move");
  const after = steps[steps.indexOf(between) + 1];
  assert.equal(between.next, `Next: ${after.name}`);
  assert.equal(between.cue, after.cue);
});

test("the coach lines are the app's words", () => {
  assert.equal(coachCue("Squat"), "Brace. Knees out. Drive up.");
  assert.equal(coachCue("Bench press"), "Brace. Slow down.");
  assert.equal(coachCue("Lat pulldown"), "Chest up. Pull, pause, lower.");
  assert.equal(coachCue("Plank"), "Straight line. Squeeze everything.");
  assert.equal(coachCue("Burpee"), "Slow down. Own every rep.");
});

test("a cardio day is one easy block", () => {
  const s = sessionFor({ goal: "Mostly cardio" });
  assert.equal(s.steps.length, 1);
  assert.equal(s.steps[0].cue, "Go at a pace you can talk at.");
});

// SITE-142: Basil's real week, the web twin of YUI-221.
import { RECIPES, basilWeek } from "./crew-first-plans.mjs";
const flat = (w) => w.rows.flatMap((r) => r.meals);

test("leave-out Meat never shows meat, for every answer", () => {
  for (const cook of ["15 minutes", "30 minutes", "An hour", null]) for (const meals of ["2", "3", "3 and a snack"]) {
    const meat = new Set(RECIPES.filter((r) => r.tags.includes("meat")).map((r) => r.name));
    for (const m of flat(basilWeek({ days: "Every day", meals, avoid: "Meat", cook }))) assert.equal(meat.has(m.name), false, m.name);
  }
});

test("each leave-out drops its own tag", () => {
  for (const [avoid, tag] of [["Fish", "fish"], ["Dairy", "dairy"], ["Gluten", "gluten"], ["Nuts", "nuts"], ["Eggs", "eggs"]])
    for (const m of flat(basilWeek({ avoid }))) assert.equal(m.tags.includes(tag), false, `${avoid}: ${m.name}`);
});

test("15 minutes never shows a longer recipe; 30 keeps to 30", () => {
  for (const m of flat(basilWeek({ cook: "15 minutes", meals: "3 and a snack" }))) assert.ok(m.minutes <= 15, `${m.name} ${m.minutes}`);
  for (const m of flat(basilWeek({ cook: "30 minutes", meals: "3 and a snack" }))) assert.ok(m.minutes <= 30, `${m.name} ${m.minutes}`);
  assert.ok(flat(basilWeek({ cook: "An hour" })).every((m) => m.minutes <= 60));
});

test("days: 3 days gives 3 rows, weekdays 5, weekends 2, every day 7", () => {
  assert.equal(basilWeek({ days: "Mon Wed Fri" }).rows.length, 3);
  assert.deepEqual(basilWeek({ days: "Mon Wed Fri" }).rows.map((r) => r.day), ["Mon", "Wed", "Fri"]);
  assert.equal(basilWeek({ days: "Weekdays" }).rows.length, 5);
  assert.equal(basilWeek({ days: "Weekends" }).rows.length, 2);
  assert.equal(basilWeek({ days: "Every day" }).rows.length, 7);
  assert.equal(resultLines("basil", { days: "Mon Wed Fri" }).match(/^table .*$/m)[0].match(/"[^"]*"/g).length, 3);
});

test("meals a day: 2, 3, and a snack", () => {
  assert.ok(basilWeek({ meals: "2" }).rows.every((r) => r.meals.length === 2));
  assert.ok(basilWeek({ meals: "3" }).rows.every((r) => r.meals.length === 3));
  assert.ok(basilWeek({ meals: "3 and a snack" }).rows.every((r) => r.meals.length === 4));
});

test("Not sure and Skip: every day, 3 meals, 30 minutes", () => {
  for (const a of [{}, skipped("basil")]) {
    const w = basilWeek(norm("basil", a));
    assert.equal(w.rows.length, 7);
    assert.ok(w.rows.every((r) => r.meals.length === 3));
    assert.ok(flat(w).every((m) => m.minutes <= 30));
  }
});

test("the reply is one line, then the week last", () => {
  const lines = resultLines("basil", { days: "Weekdays" }).split("\n");
  assert.equal(lines.length, 2);
  assert.match(lines[0], /^say /);
  assert.match(lines[1], /^table /);
  assert.ok(lines[0].split(/\s+/).length <= 30);
  ok(lines.join("\n"));
});
