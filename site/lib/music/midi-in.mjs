// A MIDI keyboard and the computer keyboard play the keys (YUI-246, Presets/MusicKeys.swift + MIDIFeed.swift).
// Pure helpers: the browser parts (navigator.requestMIDIAccess, key events) live in app/playground/music/music.js.

// One Web MIDI message to { on, note, velocity } or null. Note on with velocity 0 is a note off. Channel 10 (the
// drum channel, index 9) is ignored: it is not the keys.
export function parseMidi(data) {
  if (!data || data.length < 3) return null;
  const status = data[0] & 0xf0;
  const channel = data[0] & 0x0f;
  if (channel === 9) return null;
  if (status === 0x90 && data[2] > 0) return { on: true, note: data[1], velocity: data[2] / 127 };
  if (status === 0x80 || status === 0x90) return { on: false, note: data[1], velocity: 0 };
  return null;
}

// The computer keyboard as a piano, one octave and a bit: the home row is the white keys, the row above the black.
const WHITE_KEYS = "asdfghjkl;";
const BLACK_KEYS = { w: 1, e: 3, t: 6, y: 8, u: 10, o: 13, p: 15 };
const WHITE_SEMIS = [0, 2, 4, 5, 7, 9, 11, 12, 14, 16];
// A key's semitone above the keyboard's lowest C, or null when the key is not a piano key.
export function keySemitone(key) {
  const k = String(key || "").toLowerCase();
  const w = WHITE_KEYS.indexOf(k);
  if (k.length === 1 && w >= 0) return WHITE_SEMIS[w];
  return Object.hasOwn(BLACK_KEYS, k) ? BLACK_KEYS[k] : null;
}

// The name a connected keyboard shows on the MIDI chip: its first 14 characters (MIDIButton).
export const midiChip = (names) => (names?.length ? String(names[0]).slice(0, 14) : "MIDI");
