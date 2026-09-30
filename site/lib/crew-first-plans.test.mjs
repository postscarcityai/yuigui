import test from "node:test";
import assert from "node:assert/strict";
import { HANDLES, NAMES, NOT_SURE, ask, askLines, resultLines, skipped, wholeLines } from "./crew-first-plans.mjs";
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
