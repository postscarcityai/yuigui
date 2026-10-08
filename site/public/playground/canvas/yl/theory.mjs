// Copy of site/lib/yl/ (YUI-325). Edit the original, then run node site/scripts/sync-canvas-yl.mjs.
// Music theory for the music presets (spec/MUSIC.md): note names, scales,
// roman numerals, chord names, tunings, sound words and pitch detection.
// Pure functions, no DOM and no Web Audio, so the spec can point here as the
// reference and node can test it. The sound engine lives in the playground
// (app/playground/music/engine.js).

// ---------- notes ----------
const PC = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
const SHARPS = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const FLATS = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];
const NOTE = /^([A-Ga-g])([#b]?)(-?\d)$/;

// "C4" is MIDI 60, "A4" is 69. Returns null for anything that is not a note.
export function noteToMidi(name) {
  const m = NOTE.exec(String(name).trim());
  if (!m) return null;
  const pc = PC[m[1].toUpperCase()] + (m[2] === "#" ? 1 : m[2] === "b" ? -1 : 0);
  return 12 * (Number(m[3]) + 1) + pc;
}
export const isNote = (name) => noteToMidi(name) !== null;

// 69 is "A4". Flats when asked, sharps otherwise.
export function midiName(midi, flats = false) {
  const m = Math.round(midi);
  return `${(flats ? FLATS : SHARPS)[((m % 12) + 12) % 12]}${Math.floor(m / 12) - 1}`;
}

export const midiToHz = (midi, a4 = 440) => a4 * 2 ** ((midi - 69) / 12);
export const hzToMidi = (hz, a4 = 440) => 69 + 12 * Math.log2(hz / a4);
export const noteToHz = (name, a4 = 440) => { const m = noteToMidi(name); return m === null ? null : midiToHz(m, a4); };

// ---------- keys and scales ----------
// A key is a root and a mode: "C", "F#", "Bb", "Am".
export function parseKey(key = "C") {
  const m = /^([A-Ga-g])([#b]?)(m?)$/.exec(String(key).trim());
  if (!m) return { root: 0, minor: false, name: "C", flats: false };
  const root = (PC[m[1].toUpperCase()] + (m[2] === "#" ? 1 : m[2] === "b" ? -1 : 0) + 12) % 12;
  const minor = m[3] === "m";
  const name = `${m[1].toUpperCase()}${m[2]}${m[3]}`;
  return { root, minor, name, flats: usesFlats(root, minor, m[2]) };
}

// Flat keys spell with flats: F, Bb, Eb, Ab, Db, Gb, and Dm, Gm, Cm, Fm, Bbm, Ebm.
function usesFlats(root, minor, acc) {
  if (acc === "b") return true;
  if (acc === "#") return false;
  const major = minor ? (root + 3) % 12 : root;
  return [5, 10, 3, 8, 1, 6].includes(major);
}

export const SCALES = ["major", "minor", "pentatonic", "blues", "dorian", "mixolydian", "chromatic"];
const STEPS = {
  major: [0, 2, 4, 5, 7, 9, 11],
  minor: [0, 2, 3, 5, 7, 8, 10],
  dorian: [0, 2, 3, 5, 7, 9, 10],
  mixolydian: [0, 2, 4, 5, 7, 9, 10],
  chromatic: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
};
// Semitones above the root. Pentatonic and blues follow the key: minor
// pentatonic in Am, major pentatonic in C.
export function scaleSteps(scale, minor = false) {
  if (scale === "pentatonic") return minor ? [0, 3, 5, 7, 10] : [0, 2, 4, 7, 9];
  if (scale === "blues") return minor ? [0, 3, 5, 6, 7, 10] : [0, 2, 3, 4, 7, 9];
  return STEPS[scale] || STEPS[minor ? "minor" : "major"];
}
// Whether a MIDI note is in the key's scale.
export function inScale(midi, key, scale) {
  const k = typeof key === "string" ? parseKey(key) : key;
  const pc = (((midi - k.root) % 12) + 12) % 12;
  return scaleSteps(scale, k.minor).includes(pc);
}

// ---------- chords ----------
const QUALITY = {
  "": [0, 4, 7], maj: [0, 4, 7], m: [0, 3, 7], min: [0, 3, 7],
  "7": [0, 4, 7, 10], maj7: [0, 4, 7, 11], m7: [0, 3, 7, 10], dim: [0, 3, 6], dim7: [0, 3, 6, 9],
  m7b5: [0, 3, 6, 10], aug: [0, 4, 8], "+": [0, 4, 8], sus2: [0, 2, 7], sus4: [0, 5, 7], sus: [0, 5, 7],
  "6": [0, 4, 7, 9], m6: [0, 3, 7, 9], add9: [0, 4, 7, 14], "9": [0, 4, 7, 10, 14], m9: [0, 3, 7, 10, 14], "5": [0, 7],
};
const CHORD = /^([A-G])([#b]?)([a-z0-9+]*)(?:\/([A-G][#b]?))?$/;

// "Am" is A C E, "G7" is G B D F. Returns MIDI notes: a bass root in octave 2
// or 3, then the chord from around middle C. null when the name does not read.
export function chordNotes(name) {
  const m = CHORD.exec(String(name).trim());
  if (!m || !(m[3] in QUALITY)) return null;
  const root = (PC[m[1]] + (m[2] === "#" ? 1 : m[2] === "b" ? -1 : 0) + 12) % 12;
  const bassPc = m[4] ? parseKey(m[4]).root : root;
  const top = 55 + ((root - 7 + 12) % 12); // the chord root sits G3 to F#4
  const bass = 40 + ((bassPc - 4 + 12) % 12); // the bass sits E2 to D#3
  return [bass, ...QUALITY[m[3]].map((s) => top + s)];
}

const ROMAN_NUM = { i: 0, ii: 1, iii: 2, iv: 3, v: 4, vi: 5, vii: 6 };
const RN = /^([b#]?)(vii|iii|vi|iv|ii|v|i)(.*)$/i;
// "V" in C is "G", "vi" is "Am", "bVII" is "Bb", "V7" is "G7", "ii7" is "Dm7".
// A plain degree follows the key's own scale, so "VI" in Am is "F". A b or #
// counts from the major scale, so "bVII" is "G" in Am and "Bb" in C. Uppercase
// is major, lowercase minor. Returns null for anything that is not a numeral.
export function romanToChord(numeral, key = "C") {
  const m = RN.exec(String(numeral).trim());
  if (!m) return null;
  const k = parseKey(key);
  const deg = ROMAN_NUM[m[2].toLowerCase()];
  const upper = m[2] === m[2].toUpperCase();
  const lower = m[2] === m[2].toLowerCase();
  if (!upper && !lower) return null;
  const shift = m[1] === "b" ? -1 : m[1] === "#" ? 1 : 0;
  const pc = (k.root + scaleSteps(k.minor && !shift ? "minor" : "major")[deg] + shift + 12) % 12;
  const flats = m[1] === "b" || (m[1] !== "#" && k.flats);
  const root = (flats ? FLATS : SHARPS)[pc];
  let suf = m[3] || "";
  if (suf === "°" || suf === "o") suf = "dim";
  if (lower && suf === "7") suf = "m7";
  else if (lower && suf === "dim") suf = "dim";
  else if (lower && !suf) suf = "m";
  else if (lower && !/^(m|dim)/.test(suf)) suf = `m${suf}`;
  return `${root}${suf}`;
}

// The chords a `chords` line plays: names win, else the progression in the key.
export function progression({ key = "C", prog = [], chords = [] } = {}) {
  if (chords.length) return chords.map((name) => ({ name, numeral: "" }));
  return prog.map((n) => ({ name: romanToChord(n, key) || n, numeral: n }));
}

// ---------- tunings ----------
export const TUNINGS = {
  guitar: {
    standard: ["E2", "A2", "D3", "G3", "B3", "E4"],
    dropd: ["D2", "A2", "D3", "G3", "B3", "E4"],
    dadgad: ["D2", "A2", "D3", "G3", "A3", "D4"],
  },
  ukulele: {
    standard: ["G4", "C4", "E4", "A4"],
    lowg: ["G3", "C4", "E4", "A4"],
  },
  bass: {
    standard: ["E1", "A1", "D2", "G2"],
    five: ["B0", "E1", "A1", "D2", "G2"],
  },
  chromatic: { standard: [] },
};
// The strings a tuner shows: custom strings win, else the table, else
// standard. `known` is false when the tuning fell back, so the tuner can say so.
export function tunerStrings({ instrument = "guitar", tuning = "standard", strings = [] } = {}) {
  if (strings.length) return strings.filter(isNote);
  const t = TUNINGS[instrument] || TUNINGS.guitar;
  return t[tuning] || t.standard;
}
export const knownTuning = (instrument, tuning) => !!(TUNINGS[instrument] || TUNINGS.guitar)[tuning];
// In tune is within 3 cents, under the 5 or 6 most people can hear.
export const IN_TUNE = 3;
// Where the pitch search looks, clamped to the instrument so a guitar never
// hears its own octave below (a guitar never looks under 70 Hz). Custom
// strings stretch the range to fit.
const RANGE = { guitar: [70, 1000], ukulele: [150, 1000], bass: [28, 450], chromatic: [28, 2000] };
export function pitchRange(instrument = "guitar", strings = [], a4 = 440) {
  let [lo, hi] = RANGE[instrument] || RANGE.guitar;
  for (const s of strings) {
    const hz = noteToHz(s, a4);
    if (hz) { lo = Math.min(lo, hz / 1.12); hi = Math.max(hi, hz * 1.5); }
  }
  return { minHz: lo, maxHz: hi };
}
// Samples per pitch window: two periods of the lowest note, rounded up to a
// power of two. 2048 for guitar and ukulele, 4096 for bass and chromatic.
export const pitchWindow = (instrument) => (instrument === "bass" || instrument === "chromatic" ? 4096 : 2048);
export const cents = (hz, targetHz) => 1200 * Math.log2(hz / targetHz);
// The nearest string to a pitch, and how far off it is in cents.
export function nearestString(hz, strings, a4 = 440) {
  let best = null;
  strings.forEach((s, i) => {
    const c = cents(hz, noteToHz(s, a4));
    if (!best || Math.abs(c) < Math.abs(best.cents)) best = { index: i, note: s, cents: c };
  });
  return best;
}
// The nearest note of all twelve, for the chromatic tuner.
export function nearestNote(hz, a4 = 440) {
  const m = Math.round(hzToMidi(hz, a4));
  return { note: midiName(m), midi: m, cents: cents(hz, midiToHz(m, a4)) };
}

// ---------- pitch ----------
// McLeod pitch method (McLeod and Wyvill, 2005) over one window of samples:
// the normalized squared difference function, then the first key peak above
// k times the highest one, then a parabola through it. The peak's height is
// the clarity. Quiet input or low clarity returns null, so room noise shows
// nothing instead of a jumping needle. `minHz` and `maxHz` clamp the search.
export function detectPitch(buf, sampleRate, { minHz = 30, maxHz = 1500, k = 0.9, minClarity = 0.8, minRms = 0.01 } = {}) {
  const n = buf.length;
  let sum = 0;
  for (let i = 0; i < n; i++) sum += buf[i] * buf[i];
  const rms = Math.sqrt(sum / n);
  if (rms < minRms) return null;
  const tauMax = Math.min(Math.ceil(sampleRate / minHz) + 1, n - 1);
  const tauMin = Math.max(1, Math.floor(sampleRate / maxHz));
  const nsdf = new Float32Array(tauMax + 2);
  let m = 2 * sum;
  for (let tau = 0; tau <= tauMax + 1 && tau < n; tau++) {
    if (tau > 0) m -= buf[tau - 1] * buf[tau - 1] + buf[n - tau] * buf[n - tau];
    let r = 0;
    for (let i = 0; i < n - tau; i++) r += buf[i] * buf[i + tau];
    nsdf[tau] = m > 0 ? (2 * r) / m : 0;
  }
  // Key maxima: the highest point of each positive lobe after the first
  // time the curve goes negative.
  const peaks = [];
  let t = 1;
  while (t <= tauMax && nsdf[t] > 0) t++;
  let best = -1;
  for (; t <= tauMax; t++) {
    if (nsdf[t] > 0 && nsdf[t - 1] <= 0) best = t;
    if (best >= 0 && nsdf[t] > nsdf[best]) best = t;
    if (best >= 0 && (nsdf[t] <= 0 || t === tauMax)) { peaks.push(best); best = -1; }
  }
  const inRange = peaks.filter((p) => p >= tauMin);
  if (!inRange.length) return null;
  const top = Math.max(...inRange.map((p) => nsdf[p]));
  const tau = inRange.find((p) => nsdf[p] >= k * top);
  const a = nsdf[tau - 1], b = nsdf[tau], c = nsdf[tau + 1];
  const den = a + c - 2 * b;
  const shift = den ? (a - c) / (2 * den) : 0;
  const clarity = Math.min(1, b - ((a - c) * shift) / 4);
  if (clarity < minClarity) return null;
  const hz = sampleRate / (tau + shift);
  if (hz < minHz || hz > maxHz) return null;
  return { hz, clarity, rms };
}

// ---------- sound words ----------
export const DRUMS = ["kick", "snare", "clap", "hat", "open", "rim", "tom", "shaker", "crash", "cow", "snap", "conga"];
export const FX = ["pop", "sweep", "tick"];
export const PITCHED = ["keys", "pluck", "bell", "pad", "bass", "lead"];
export const SOUNDS = [...DRUMS, ...FX, ...PITCHED];
// Words agents reach for that mean one of ours.
export const ALIAS = {
  bd: "kick", bassdrum: "kick", kickdrum: "kick", sd: "snare", snaredrum: "snare", hh: "hat", hihat: "hat", hihats: "hat",
  closedhat: "hat", openhat: "open", oh: "open", ride: "crash", cymbal: "crash", cowbell: "cow", clave: "rim", rimshot: "rim",
  shake: "shaker", maraca: "shaker", tambourine: "shaker", finger: "snap", click: "tick", bongo: "conga",
  piano: "keys", ep: "keys", organ: "keys", rhodes: "keys", guitar: "pluck", harp: "pluck", synth: "lead", saw: "lead",
  strings: "pad", choir: "pad", sub: "bass", "808": "bass", chime: "bell", glock: "bell", marimba: "bell",
  // World percussion, by the kit voice closest to it.
  surdo: "tom", repinique: "tom", repique: "tom", floortom: "tom", taiko: "tom", dhol: "tom", tabla: "conga",
  caixa: "snare", tarol: "snare", tamborim: "rim", woodblock: "rim", sidestick: "rim", claves: "rim",
  ganza: "shaker", chocalho: "shaker", guiro: "shaker", cabasa: "shaker", afuche: "shaker", maracas: "shaker", egg: "shaker",
  agogo: "cow", gankogui: "cow", triangle: "bell", cuica: "conga", timbal: "conga", timbale: "conga",
  timbales: "conga", djembe: "conga", tumba: "conga", quinto: "conga", bongos: "conga", darbuka: "conga", cajon: "kick",
  pandeiro: "shaker", splash: "crash", china: "crash", clapping: "clap", handclap: "clap", palmas: "clap",
};
// A word as the lookup reads it: lower case, no accents, no spaces, _ or -.
const bare = (word) => String(word || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[\s_-]/g, "");
// The voice for a word. `pitched` is true where a note is being played (a
// keyboard, a chord, a note row); an unknown word then plays keys, and an
// unknown drum word plays tick.
export function soundFor(word, pitched = false) {
  const w = bare(word);
  const s = SOUNDS.includes(w) ? w : Object.hasOwn(ALIAS, w) ? ALIAS[w] : null;
  if (s && (!pitched || PITCHED.includes(s))) return s;
  return pitched ? "keys" : s || "tick";
}
// The voice each of a loop's rows plays. A note row plays `sound`; a known
// drum word plays its voice; an unknown one takes the next kit voice no other
// row plays, so two unknown rows never sound the same (tick once all twelve
// are taken).
export function loopVoices(rows, sound = "pluck") {
  const drum = (r) => !isNote(r);
  const known = (r) => SOUNDS.includes(bare(r)) || Object.hasOwn(ALIAS, bare(r));
  const taken = new Set(rows.filter((r) => drum(r) && known(r)).map((r) => soundFor(r)));
  const free = DRUMS.filter((d) => !taken.has(d));
  return rows.map((r) => (!drum(r) ? soundFor(sound, true) : known(r) ? soundFor(r) : free.shift() || "tick"));
}

// ---------- patterns ----------
// A loop is one bar. Up to 8 steps, a step is an eighth note; more than 8,
// a sixteenth. So 8 steps is a bar of eighths, 16 a bar of sixteenths, and
// a 32 step take from the drum pads is two bars of sixteenths.
export const stepBeats = (steps) => (steps <= 8 ? 0.5 : 0.25);
// Seconds from step 0 to step i, with swing (percent) pushing every odd step late.
// Swing is 0 to 75.
export function stepTime(i, bpm, steps, swing = 0) {
  const d = (60 / bpm) * stepBeats(steps);
  return i * d + (i % 2 ? (Math.max(0, Math.min(75, swing)) / 100) * d * 0.5 : 0);
}
// A grid (rows of booleans) to the strings an agent writes: x a hit, . a
// rest, and an empty string for a row with no hits.
export const toPattern = (grid) => grid.map((row) => (row.some(Boolean) ? row.map((on) => (on ? "x" : ".")).join("") : ""));
// And back, padded or cut to `steps`.
export const fromPattern = (p = [], rows, steps) =>
  rows.map((_, r) => Array.from({ length: steps }, (_, i) => /[xX1o*]/.test((p[r] || "")[i] || "")));

// Pad hits ({pad, t} in seconds from the first downbeat) to a take:
// quantized to the nearest sixteenth over `steps` steps, rows are the pads
// that were hit, in pad order.
export function quantize(hits, pads, bpm, steps = 32) {
  const d = (60 / bpm) / 4;
  const grid = new Map();
  for (const h of hits) {
    const i = Math.round(h.t / d);
    if (i < 0 || i >= steps + 1) continue;
    const at = i % steps;
    if (!grid.has(h.pad)) grid.set(h.pad, Array(steps).fill(false));
    grid.get(h.pad)[at] = true;
  }
  const rows = pads.filter((p) => grid.has(p));
  return { bpm, steps, rows, p: toPattern(rows.map((r) => grid.get(r))), take: true };
}
