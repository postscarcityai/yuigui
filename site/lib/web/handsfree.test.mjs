// node --test lib/web/handsfree.test.mjs   (YUI-244: the hands-free loop, the same walk YuiTests/HandsFreeTests makes)
import test from "node:test";
import assert from "node:assert/strict";
import { createEndOfSpeech, createHandsFree } from "./handsfree.mjs";

test("the loop: tap, listen, a quiet sends, the reply lands, a beat, the mic opens again", () => {
  const h = createHandsFree();
  assert.deepEqual(h.handle("tap"), { do: "openMic" });
  assert.equal(h.state, "starting");
  assert.equal(h.handle("micOpen"), null);
  assert.equal(h.state, "listening");
  assert.deepEqual(h.handle("endOfSpeech"), { do: "finishMic" });
  assert.deepEqual(h.handle("heard", "  what is on my calendar  "), { do: "send", words: "what is on my calendar" });
  h.handle("sent");
  assert.equal(h.state, "waiting");
  assert.deepEqual(h.handle("replyLanded"), { do: "readBeat" });
  assert.deepEqual(h.handle("readDone"), { do: "openMic" });
  assert.equal(h.state, "starting");
});

test("nothing worth sending opens the mic again; quiet too long pauses; a call pauses and resumes", () => {
  const h = createHandsFree();
  h.handle("tap"); h.handle("micOpen"); h.handle("endOfSpeech");
  assert.deepEqual(h.handle("heard", "   "), { do: "openMic" });
  h.handle("micOpen");
  assert.deepEqual(h.handle("quietTooLong"), { do: "closeMic" });
  assert.equal(h.why, "quiet");
  assert.deepEqual(h.handle("tap"), { do: "openMic" });
  h.handle("micOpen");
  assert.deepEqual(h.handle("interrupted"), { do: "closeMic" });
  assert.equal(h.why, "interrupted");
  assert.deepEqual(h.handle("interruptionEnded"), { do: "openMic" });
});

test("a refused mic or a failed send pauses it; stop closes an open mic and says nothing when it was shut", () => {
  const h = createHandsFree();
  h.handle("tap");
  h.handle("micFailed", { denied: true });
  assert.equal(h.why, "denied");
  assert.equal(h.handle("stop"), null);
  assert.equal(h.state, "off");
  h.handle("tap"); h.handle("micOpen");
  assert.deepEqual(h.handle("stop"), { do: "closeMic" });
  h.handle("tap"); h.handle("micOpen"); h.handle("endOfSpeech"); h.handle("heard", "hi");
  h.handle("sendFailed");
  assert.equal(h.why, "failed");
});

test("the words are out, the reply still comes: an interruption only pauses the mic", () => {
  const h = createHandsFree();
  h.handle("tap"); h.handle("micOpen"); h.handle("endOfSpeech"); h.handle("heard", "hi"); h.handle("sent");
  assert.equal(h.handle("interrupted"), null);
  assert.equal(h.why, "interrupted");
});

test("end of speech needs words; noise alone never ends a turn; a quiet after speech does", () => {
  const e = createEndOfSpeech({ quiet: 700 });
  assert.equal(e.feed("", true, 1000), false);
  assert.equal(e.feed("", false, 5000), false); // noise, then a long quiet: still no turn
  assert.equal(e.feed("hello there", true, 6000), false);
  assert.equal(e.feed("hello there", false, 6300), false);
  assert.equal(e.feed("hello there", false, 6700), true);
  e.reset();
  assert.equal(e.feed("again", false, 9000), false);
});
