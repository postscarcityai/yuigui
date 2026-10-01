// node --test lib/web/presence.test.mjs
import test from "node:test";
import assert from "node:assert/strict";
import { liveness, presenceLabel, waitingNote, workingLine } from "./presence.mjs";

test("presence falls back to the older per-computer status", () => {
  assert.equal(liveness({ presence: "asleep" }), "asleep");
  assert.equal(liveness({ status: "connected" }), "online");
  assert.equal(liveness({ presence: "weird", status: "pending" }), "pending");
  assert.equal(liveness({}), "offline");
  assert.equal(presenceLabel({ presence: "not_listening" }), "Not listening yet");
});

test("the one line after a send, in RELAY.md's words", () => {
  const a = (presence) => ({ name: "Coach", presence });
  assert.equal(waitingNote(a("online")), null);
  assert.equal(waitingNote(a("asleep")), "Coach is asleep. It gets this when its computer wakes.");
  assert.equal(waitingNote(a("offline")), "Coach is offline. It gets this when it's back.");
  assert.match(waitingNote(a("not_listening")), /isn't listening yet\. This waits/);
});

test("the working row", () => {
  assert.equal(workingLine(null, { name: "Penny" }), "Penny is working");
  assert.equal(workingLine({ text: "Reading your calendar", step: 1, of: 3 }, { name: "Penny" }), "Reading your calendar (1 of 3)");
});
