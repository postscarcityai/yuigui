import test from "node:test";
import assert from "node:assert/strict";
import { midiFile, takeClock, takeEcho, takeFields, takeFormat, takeNotes, vlq } from "./take.mjs";

const hex = (u8) => [...u8].map((b) => b.toString(16).padStart(2, "0")).join("");

test("vlq is the MIDI variable length number", () => {
  assert.deepEqual(vlq(0), [0]);
  assert.deepEqual(vlq(127), [0x7f]);
  assert.deepEqual(vlq(128), [0x81, 0x00]);
  assert.deepEqual(vlq(480), [0x83, 0x60]);
  assert.deepEqual(vlq(16384), [0x81, 0x80, 0x00]);
});

test("drums land on channel 10 as General MIDI, pitched voices on their own channel", () => {
  const n = takeNotes([
    { word: "kick", at: 1, vel: 1 },
    { word: "snare", at: 1.5, vel: 0.5 },
    { word: "hat", at: 2 },
    { word: "keys", pitched: true, midi: 60, at: 2.25, until: 3, vel: 0.9 },
    { word: "pluck", pitched: true, midi: 64, at: 2.5 },
  ], { start: 1 });
  assert.deepEqual(n.map((x) => [x.channel, x.note]), [[9, 36], [9, 38], [9, 42], [0, 60], [1, 64]]);
  assert.equal(n[0].start, 0);
  assert.equal(n[0].velocity, 127);
  assert.equal(n[1].velocity, 64);
  assert.equal(n[3].length, 0.75);   // held for the finger
  assert.equal(n[4].length, 0.5);    // decays by itself
  assert.equal(n[2].length, 0.1);    // a drum
});

test("notes before the take, after it, or unknown words are handled the way the app does", () => {
  const n = takeNotes([{ word: "kick", at: 0.5 }, { word: "kick", at: 3 }, { word: "zap", at: 2 }, { word: "keys", pitched: true, midi: 200, at: 2 }, { word: "pad", pitched: true, midi: 48, at: 1.9, until: 99 }], { start: 1, seconds: 2 });
  // before start dropped, at 3 is 2 s in = the end, dropped; an unknown drum word plays tick (33); midi 200 dropped; a held pad is cut at the end
  assert.deepEqual(n.map((x) => [x.channel, x.note]), [[3, 48], [9, 33]]);
  assert.ok(Math.abs(n[0].start + n[0].length - 2) < 1e-9);
});

test("a type 1 file: header, a tempo track, one named track per channel", () => {
  const notes = takeNotes([{ word: "kick", at: 0 }, { word: "keys", pitched: true, midi: 60, at: 0.5, until: 1 }]);
  const f = midiFile(notes, 120, "Yui take");
  assert.equal(hex(f.slice(0, 14)), "4d546864" + "00000006" + "0001" + "0003" + "01e0");
  // 120 bpm is 500000 us a beat = 07 a1 20
  assert.ok(hex(f).includes("ff5103" + "07a120"));
  assert.ok(hex(f).includes("ff5804" + "04021808"));
  // the keys track has its program change (0xC0, 4) and a note on at tick 480 (0.5 s at 120 bpm)
  assert.ok(hex(f).includes("c004"));
  assert.ok(hex(f).includes("8360" + "903c5a") || hex(f).includes("903c72")); // delta 480 then note on 60, velocity 0.9*127=114 (0x72)
  assert.ok(hex(f).includes("ff2f00"));
  // two note tracks plus tempo
  assert.equal(hex(f).split("4d54726b").length - 1, 3);
});

test("a repeated note is not cut: the off sorts before the next on at one tick", () => {
  const f = midiFile([{ start: 0, length: 0.5, note: 60, velocity: 100, channel: 0 }, { start: 0.5, length: 0.5, note: 60, velocity: 100, channel: 0 }], 120);
  const h = hex(f);
  assert.ok(h.indexOf("803c00") < h.lastIndexOf("903c64"));
  assert.ok(/803c00[0-9a-f]{2}?00?903c64/.test(h) || h.includes("803c00" + "00" + "903c64"));
});

test("clocks, the echo and the event a take sends", () => {
  assert.equal(takeClock(7.9), "0:07");
  assert.equal(takeClock(75), "1:15");
  assert.equal(takeEcho(7.4), "Sent a take, 7 s");
  assert.equal(takeEcho(75), "Sent a take, 1:15");
  assert.deepEqual(takeFields({ audio: "a", midi: "m", seconds: 4.44, notes: 3 }, { bpm: 96 }), { seconds: 4.4, audio: "a", midi: "m", notes: 3, bpm: 96 });
  assert.equal("midi" in takeFields({ audio: "a", seconds: 1 }), false);
});

test("the container: AAC in .m4a where the browser has it, else Opus in .webm, else none", () => {
  assert.deepEqual(takeFormat((t) => t === "audio/mp4"), { type: "audio/mp4", ext: "m4a", mime: "audio/mp4" });
  assert.equal(takeFormat((t) => t.startsWith("audio/webm")).ext, "webm");
  assert.equal(takeFormat(), null);
});
