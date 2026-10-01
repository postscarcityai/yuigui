// The notes of a take and the .mid file they become (YUI-246), the line-for-line twin of the app's
// Packages/YuiSound MIDIFile.swift and Take.swift (spec/MUSIC.md section 3). The engine tells this file what it
// played while Record ran; this file turns those events into notes and a Standard MIDI File, type 1, 480 ticks a
// beat: a tempo track, then one named track per channel. Drums go on channel 10 as General MIDI drums, each pitched
// voice on its own channel with a program close to it. Pure, so node tests it with no browser.
import { DRUMS, FX, PITCHED, soundFor } from "./theory.mjs";

export const PPQ = 480;
export const MAX_TAKE_SECONDS = 120;
export const MIN_TAKE_SECONDS = 0.5;

// The kit in the app's pad order (kick, snare, clap, hat, open, rim, tom, shaker, crash, cow, snap, conga, pop, sweep,
// tick, bell) as General MIDI drum notes (YuiSound GM.drums).
const KIT = [...DRUMS, ...FX, "bell"];
const GM_DRUMS = [36, 38, 39, 42, 46, 37, 45, 70, 49, 56, 54, 63, 76, 55, 33, 53];
// Channel (0-based), program (0-based) and track name per pitched voice (GM.channel).
export const VOICES = {
  keys: { channel: 0, program: 4, name: "Keys" },
  pluck: { channel: 1, program: 24, name: "Pluck" },
  bell: { channel: 2, program: 14, name: "Bell" },
  pad: { channel: 3, program: 88, name: "Pad" },
  bass: { channel: 4, program: 38, name: "Bass" },
  lead: { channel: 5, program: 81, name: "Lead" },
};
const channelName = (ch) => (ch === 9 ? "Drums" : Object.values(VOICES).find((v) => v.channel === ch)?.name || "Notes");
const channelProgram = (ch) => (ch === 9 ? null : Object.values(VOICES).find((v) => v.channel === ch)?.program ?? null);

// Engine events to notes. An event is { word, midi, pitched, vel (0..1), at (seconds on the audio clock), until }.
// A note ends at its release (`until`, a finger held, a strum's hold), else a 16th of a second-ish for a drum
// (0.1 s) and half a second for a pitched voice. A note that starts before the take or after it is dropped; one
// still sounding when the take ends ends with it (TakeNotes.from).
export function takeNotes(events, { start = 0, seconds = Infinity } = {}) {
  const out = [];
  const list = [...events].sort((a, b) => a.at - b.at);
  for (const e of list) {
    const t = e.at - start;
    if (t < 0 || t >= seconds) continue;
    const name = soundFor(e.word, !!e.pitched);
    let note; let channel;
    if (e.pitched && Number.isFinite(e.midi) && PITCHED.includes(name)) { note = Math.round(e.midi); channel = VOICES[name].channel; }
    else { const i = KIT.indexOf(name); note = GM_DRUMS[i < 0 ? KIT.indexOf("tick") : i]; channel = 9; }
    if (!(note >= 0 && note <= 127)) continue;
    const natural = channel === 9 ? 0.1 : 0.5;
    const length = e.until != null ? Math.max(0.01, e.until - e.at) : natural;
    out.push({ start: t, length: Math.min(length, Math.max(0.01, seconds - t)), note, velocity: Math.max(1, Math.min(127, Math.round((e.vel ?? 0.9) * 127))), channel });
  }
  return out;
}

const be16 = (v) => [(v >> 8) & 0xff, v & 0xff];
const be32 = (v) => [(v >>> 24) & 0xff, (v >> 16) & 0xff, (v >> 8) & 0xff, v & 0xff];
export function vlq(value) {
  let v = Math.max(0, Math.floor(value));
  const out = [v & 0x7f];
  v >>= 7;
  while (v > 0) { out.unshift((v & 0x7f) | 0x80); v >>= 7; }
  return out;
}
const meta = (type, bytes) => [0xff, type, ...vlq(bytes.length), ...bytes];
const text = (s, max = 64) => [...new TextEncoder().encode(s)].slice(0, max);
function encode(events) {
  const out = [];
  let last = 0;
  for (const [t, bytes] of events) { out.push(...vlq(t - last), ...bytes); last = t; }
  return [...out, 0x00, 0xff, 0x2f, 0x00];
}

// The Standard MIDI File of a take: a Uint8Array.
export function midiFile(notes, bpm = 120, name = "Yui take") {
  const tempo = Math.max(20, Math.min(Number(bpm) || 120, 300));
  const ticks = (s) => Math.max(0, Math.round((s * tempo / 60) * PPQ));
  const us = Math.round(60_000_000 / tempo);
  const tracks = [encode([[0, meta(0x03, text(name))], [0, meta(0x51, [(us >> 16) & 0xff, (us >> 8) & 0xff, us & 0xff])], [0, meta(0x58, [4, 2, 24, 8])]])];
  for (const ch of [...new Set(notes.map((n) => n.channel))].sort((a, b) => a - b)) {
    const events = [[0, meta(0x03, text(channelName(ch)))]];
    const program = channelProgram(ch);
    if (program != null) events.push([0, [0xc0 | ch, program]]);
    const timed = [];
    for (const n of notes) {
      if (n.channel !== ch) continue;
      const on = ticks(n.start);
      const off = Math.max(on + 1, ticks(n.start + n.length));
      timed.push([on, 1, [0x90 | ch, n.note, n.velocity]], [off, 0, [0x80 | ch, n.note, 0]]);
    }
    // Offs before ons at the same tick, so a repeated note is not cut.
    timed.sort((a, b) => (a[0] !== b[0] ? a[0] - b[0] : a[1] - b[1]));
    tracks.push(encode([...events, ...timed.map((t) => [t[0], t[2]])]));
  }
  const bytes = [...text("MThd", 4), ...be32(6), ...be16(1), ...be16(tracks.length), ...be16(PPQ)];
  for (const t of tracks) bytes.push(...text("MTrk", 4), ...be32(t.length), ...t);
  return Uint8Array.from(bytes);
}

// "0:07" for a clock (TakeUpload.clock) and the line the thread echoes (TakeUpload.echo).
export const takeClock = (seconds) => { const s = Math.floor(seconds); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`; };
export const takeEcho = (seconds) => { const s = Math.round(seconds); return s < 60 ? `Sent a take, ${s} s` : `Sent a take, ${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`; };

// The audio container this browser records: AAC in an .m4a where it can (Safari, new Chromium), else Opus in
// WebM, said in the extension so the agent knows what it opened. `supported` is MediaRecorder.isTypeSupported.
export function takeFormat(supported = () => false) {
  for (const [type, ext] of [["audio/mp4;codecs=mp4a.40.2", "m4a"], ["audio/mp4", "m4a"], ["audio/webm;codecs=opus", "webm"], ["audio/webm", "webm"]]) {
    if (supported(type)) return { type, ext, mime: type.split(";")[0] };
  }
  return null;
}

// The event a finished take sends (TakeUpload.fields): signed links, seconds (one decimal), and what the loop adds.
export function takeFields({ audio, midi, seconds, notes }, extra = {}) {
  const out = { seconds: Math.round(seconds * 10) / 10, audio, ...(midi ? { midi } : {}), ...(notes != null ? { notes } : {}) };
  return { ...out, ...extra };
}
