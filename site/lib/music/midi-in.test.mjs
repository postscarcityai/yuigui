import test from "node:test";
import assert from "node:assert/strict";
import { keySemitone, midiChip, parseMidi } from "./midi-in.mjs";

test("note on, note off, and a note on at velocity 0", () => {
  assert.deepEqual(parseMidi([0x90, 60, 127]), { on: true, note: 60, velocity: 1 });
  assert.deepEqual(parseMidi([0x91, 64, 64]).on, true);
  assert.deepEqual(parseMidi([0x80, 60, 0]), { on: false, note: 60, velocity: 0 });
  assert.deepEqual(parseMidi([0x90, 60, 0]), { on: false, note: 60, velocity: 0 });
});

test("everything else is ignored: drums, controllers, short messages", () => {
  assert.equal(parseMidi([0x99, 36, 100]), null);
  assert.equal(parseMidi([0xb0, 64, 127]), null);
  assert.equal(parseMidi([0x90, 60]), null);
  assert.equal(parseMidi(null), null);
});

test("the computer keyboard is a piano", () => {
  assert.equal(keySemitone("a"), 0);
  assert.equal(keySemitone("w"), 1);
  assert.equal(keySemitone("S"), 2);
  assert.equal(keySemitone(";"), 16);
  assert.equal(keySemitone("z"), null);
  assert.equal(keySemitone("Enter"), null);
});

test("the chip shows the keyboard's name, cut at 14", () => {
  assert.equal(midiChip([]), "MIDI");
  assert.equal(midiChip(["Arturia KeyStep 32 Bluetooth"]), "Arturia KeySte");
});
