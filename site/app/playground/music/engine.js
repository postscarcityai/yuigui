// The sound engine for the music presets (spec/MUSIC.md). Every sound is a
// small Web Audio graph made on the spot: oscillators, one shared noise
// buffer, filters and gain envelopes. No sample files. The recipes are ports
// of brag-output/work/synth.py. Theory (notes, scales, chords) lives in
// lib/music/theory.mjs.
import { midiToHz, soundFor } from "../../../lib/music/theory.mjs";
import { MAX_TAKE_SECONDS, takeFormat, takeNotes } from "../../../lib/music/take.mjs";

let ctx = null;
const per = new WeakMap(); // per context: out, noise buffer, shaper curves

// The one AudioContext, made on the first tap. Browsers keep it silent until
// a user gesture, so call this from pointerdown or click.
export function audio() {
  if (typeof window === "undefined") return null;
  session("playback");
  if (!ctx) {
    const C = window.AudioContext || window.webkitAudioContext;
    if (!C) return null;
    ctx = new C({ latencyHint: "interactive" });
  }
  if (ctx.state === "suspended") ctx.resume().catch(() => {});
  return ctx;
}
export const running = () => !!ctx && ctx.state === "running";

// Safari's audio session: "playback" plays through the silent switch,
// "play-and-record" while the tuner listens. Feature-checked.
export function session(type) {
  try { if (typeof navigator !== "undefined" && navigator.audioSession && navigator.audioSession.type !== type) navigator.audioSession.type = type; } catch { /* not settable here */ }
}
export const now = () => (ctx ? ctx.currentTime : 0);

// The master chain: a gain, then a soft limiter, then a meter. Pitched
// voices go through `tone`, which adds a small room.
function chain(c) {
  let g = per.get(c);
  if (g) return g;
  const master = c.createGain();
  master.gain.value = 0.8;
  const lim = c.createDynamicsCompressor();
  lim.threshold.value = -10;
  lim.knee.value = 8;
  lim.ratio.value = 12;
  lim.attack.value = 0.003;
  lim.release.value = 0.2;
  const meter = c.createAnalyser();
  meter.fftSize = 1024;
  master.connect(lim).connect(meter).connect(c.destination);
  // What a take records (YUI-246): the master after the limiter, never the mic.
  const record = c.createMediaStreamDestination();
  lim.connect(record);
  const noise = c.createBuffer(1, c.sampleRate * 2, c.sampleRate);
  const d = noise.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  const tone = c.createGain();
  tone.connect(master);
  const room = c.createConvolver();
  room.buffer = roomImpulse(c);
  const wet = c.createGain();
  wet.gain.value = 0.18;
  tone.connect(room).connect(wet).connect(master);
  g = { out: master, tone, meter, noise, curves: {}, record };
  per.set(c, g);
  return g;
}

// A small room: 1.2 seconds of noise that fades, a little darker each side.
function roomImpulse(c) {
  const len = Math.round(c.sampleRate * 1.2);
  const b = c.createBuffer(2, len, c.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const d = b.getChannelData(ch);
    let z = 0;
    for (let i = 0; i < len; i++) { z += 0.35 * (Math.random() * 2 - 1 - z); d[i] = z * Math.exp(-i / (c.sampleRate * 0.28)); }
  }
  return b;
}

// tanh saturation, normalized so a full-scale sine stays full scale.
function drive(c, k) {
  const g = chain(c);
  if (!g.curves[k]) {
    const n = 1024;
    const curve = new Float32Array(n);
    for (let i = 0; i < n; i++) { const x = (i / (n - 1)) * 2 - 1; curve[i] = Math.tanh(x * k) / Math.tanh(k); }
    g.curves[k] = curve;
  }
  const s = c.createWaveShaper();
  s.curve = g.curves[k];
  return s;
}

// ---------- building blocks ----------
function osc(c, type, freq, t, stop) {
  const o = c.createOscillator();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  o.start(t);
  o.stop(stop);
  return o;
}
function noise(c, t, stop) {
  const s = c.createBufferSource();
  s.buffer = chain(c).noise;
  s.loop = true;
  s.start(t, Math.random() * 1.5);
  s.stop(stop);
  return s;
}
function filter(c, type, freq, q = 0.7) {
  const f = c.createBiquadFilter();
  f.type = type;
  f.frequency.value = freq;
  f.Q.value = q;
  return f;
}
// A hit: up to `peak` in `att` seconds, then an exponential fall with time
// constant `tau` (the synth.py exp(-t / tau)).
function hit(c, t, peak, tau, att = 0.002) {
  const g = c.createGain();
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(peak, t + att);
  g.gain.setTargetAtTime(0, t + att, tau);
  return g;
}
// A held note: up to `peak` in `att`, `sustain` after `decay`, and a release
// the caller triggers.
function held(c, t, peak, att, sustain = peak, decay = 0.3) {
  const g = c.createGain();
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(peak, t + att);
  if (sustain !== peak) g.gain.setTargetAtTime(sustain, t + att, decay);
  return g;
}
function releaser(c, g, nodes, rel) {
  let done = false;
  return (at = c.currentTime) => {
    if (done) return;
    done = true;
    at = Math.max(at, c.currentTime);
    const p = g.gain;
    if (p.cancelAndHoldAtTime) p.cancelAndHoldAtTime(at);
    else { p.cancelScheduledValues(at); p.setValueAtTime(p.value, at); }
    p.setTargetAtTime(0, at, rel / 3);
    for (const n of nodes) { try { n.stop(at + rel * 2 + 0.05); } catch { /* already stopped */ } }
  };
}
const NOOP = () => {};

// ---------- drums ----------
const DRUM = {
  kick(c, out, t, v) {
    const o = osc(c, "sine", 134, t, t + 0.7);
    o.frequency.setTargetAtTime(44, t, 0.045);
    const body = hit(c, t, v, 0.28);
    const click = hit(c, t, 0.25 * v, 0.002, 0.0005);
    const sat = drive(c, 1.6);
    const g = c.createGain();
    g.gain.value = 0.9;
    o.connect(body).connect(sat);
    noise(c, t, t + 0.03).connect(click).connect(sat);
    sat.connect(g).connect(out);
  },
  snare(c, out, t, v) {
    const n = noise(c, t, t + 0.6);
    const hp = filter(c, "highpass", 1200), lp = filter(c, "lowpass", 7500);
    const sat = drive(c, 1.3);
    n.connect(hp).connect(lp).connect(hit(c, t, 1.4 * v, 0.12)).connect(sat);
    osc(c, "sine", 190, t, t + 0.4).connect(hit(c, t, 0.8 * v, 0.06)).connect(sat);
    const g = c.createGain();
    g.gain.value = 0.8;
    sat.connect(g).connect(out);
  },
  clap(c, out, t, v) {
    const n = noise(c, t, t + 0.45);
    const bp = filter(c, "highpass", 900);
    const lp = filter(c, "lowpass", 4200);
    n.connect(bp).connect(lp);
    const bursts = c.createGain();
    bursts.gain.setValueAtTime(0, t);
    for (const o of [0, 0.011, 0.022]) {
      bursts.gain.setValueAtTime(1.3 * v, t + o);
      bursts.gain.setTargetAtTime(0, t + o, 0.008);
    }
    lp.connect(bursts).connect(out);
    lp.connect(hit(c, t, 0.8 * v, 0.09)).connect(out);
  },
  hat(c, out, t, v) { hat(c, out, t, v, false); },
  open(c, out, t, v) { hat(c, out, t, v, true); },
  rim(c, out, t, v) {
    const g = hit(c, t, v, 0.012, 0.0005);
    osc(c, "sine", 820, t, t + 0.1).connect(gain(c, 0.7)).connect(g);
    noise(c, t, t + 0.1).connect(filter(c, "highpass", 400)).connect(gain(c, 0.3)).connect(g);
    g.connect(out);
  },
  tom(c, out, t, v) {
    const o = osc(c, "sine", 220, t, t + 0.7);
    o.frequency.setTargetAtTime(110, t, 0.08);
    o.connect(hit(c, t, 0.9 * v, 0.16)).connect(drive(c, 1.4)).connect(out);
  },
  shaker(c, out, t, v) {
    noise(c, t, t + 0.2).connect(filter(c, "highpass", 5500)).connect(hit(c, t, 1.4 * v, 0.035, 0.012)).connect(out);
  },
  crash(c, out, t, v) {
    noise(c, t, t + 3).connect(filter(c, "highpass", 3500)).connect(filter(c, "lowpass", 14000)).connect(hit(c, t, 0.55 * v, 0.7)).connect(out);
  },
  cow(c, out, t, v) {
    const bp = filter(c, "bandpass", 900, 2);
    osc(c, "square", 540, t, t + 0.4).connect(bp);
    osc(c, "square", 800, t, t + 0.4).connect(bp);
    bp.connect(hit(c, t, 0.5 * v, 0.07)).connect(out);
  },
  snap(c, out, t, v) {
    noise(c, t, t + 0.12).connect(filter(c, "bandpass", 2300, 2.5)).connect(hit(c, t, 2.2 * v, 0.014, 0.001)).connect(out);
    osc(c, "sine", 1600, t, t + 0.05).connect(hit(c, t, 0.15 * v, 0.006)).connect(out);
  },
  conga(c, out, t, v) {
    const o = osc(c, "sine", 330, t, t + 0.5);
    o.frequency.exponentialRampToValueAtTime(220, t + 0.15);
    o.connect(hit(c, t, 0.8 * v, 0.1)).connect(out);
    noise(c, t, t + 0.03).connect(filter(c, "bandpass", 1500, 1)).connect(hit(c, t, 0.2 * v, 0.004)).connect(out);
  },
  tick(c, out, t, v, o) {
    const pitch = o.hz || 3000;
    const g = hit(c, t, v, 0.004, 0.0005);
    osc(c, "sine", pitch, t, t + 0.05).connect(gain(c, 0.6)).connect(g);
    noise(c, t, t + 0.05).connect(gain(c, 0.4)).connect(g);
    g.connect(out);
  },
  pop(c, out, t, v, o) {
    const f = midiToHz(o.pitched ? o.midi : 72);
    const s = osc(c, "sine", f * 0.7, t, t + 0.35);
    s.frequency.linearRampToValueAtTime(f, t + 0.025);
    s.connect(hit(c, t, 0.8 * v, 0.05)).connect(out);
  },
  sweep(c, out, t, v) {
    const d = 0.5;
    const o = osc(c, "sine", 300, t, t + d + 0.02);
    o.frequency.exponentialRampToValueAtTime(2400, t + d);
    const g = c.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.5 * v, t + d / 2);
    g.gain.linearRampToValueAtTime(0, t + d);
    o.connect(g).connect(out);
  },
};
function hat(c, out, t, v, open) {
  noise(c, t, t + (open ? 0.5 : 0.1)).connect(filter(c, "highpass", 7000)).connect(hit(c, t, 0.9 * v, open ? 0.08 : 0.018, 0.001)).connect(out);
}
function gain(c, v) { const g = c.createGain(); g.gain.value = v; return g; }

// ---------- pitched ----------
// Each returns a release function. Plucks and bells fade on their own; a
// release only shortens the tail.
const TONE = {
  pluck(c, out, t, v, m) { return plucked(c, out, t, v, m, 0.14, 1, 1.4); },
  // keys: the pluck with more body and a longer tail.
  keys(c, out, t, v, m) { return plucked(c, out, t, v, m, 0.7, 1.8, 4); },
  bell(c, out, t, v, m) {
    const f = midiToHz(m);
    const car = osc(c, "sine", f, t, t + 3);
    const mod = osc(c, "sine", f * 3.5, t, t + 3);
    const depth = c.createGain();
    depth.gain.setValueAtTime(2.2 * f * 3.5, t);
    depth.gain.setTargetAtTime(0, t, 0.25);
    mod.connect(depth).connect(car.frequency);
    const env = hit(c, t, 0.4 * v, 0.55);
    car.connect(env).connect(out);
    const p2 = osc(c, "sine", f * 2, t, t + 2);
    p2.connect(hit(c, t, 0.1 * v, 0.3)).connect(out);
    return releaser(c, env, [car, mod, p2], 0.4);
  },
  pad(c, out, t, v, m) {
    const f = midiToHz(m);
    const env = held(c, t, 0.3 * v, 0.35);
    const nodes = [-7, 0, 6].map((det) => {
      const o = osc(c, "triangle", f, t, t + 30);
      o.detune.value = det;
      o.connect(env);
      return o;
    });
    env.connect(filter(c, "lowpass", 3200)).connect(out);
    return releaser(c, env, nodes, 0.5);
  },
  bass(c, out, t, v, m) {
    const f = midiToHz(m);
    const sat = drive(c, 1.4);
    const a = osc(c, "sine", f, t, t + 30);
    const b = osc(c, "sine", f * 2, t, t + 30);
    a.connect(sat);
    b.connect(gain(c, 0.3)).connect(sat);
    const env = held(c, t, 0.55 * v, 0.01);
    sat.connect(env).connect(out);
    return releaser(c, env, [a, b], 0.08);
  },
  lead(c, out, t, v, m) {
    const f = midiToHz(m);
    const saw = osc(c, "sawtooth", f, t, t + 30);
    const sq = osc(c, "square", f, t, t + 30);
    const lfo = osc(c, "sine", 5.2, t, t + 30);
    const vib = c.createGain();
    vib.gain.setValueAtTime(0, t);
    vib.gain.linearRampToValueAtTime(0.004 * f, t + 0.25);
    lfo.connect(vib);
    vib.connect(saw.frequency);
    vib.connect(sq.frequency);
    const hp = filter(c, "highpass", 250), lp = filter(c, "lowpass", 2400);
    saw.connect(gain(c, 0.5)).connect(hp);
    sq.connect(gain(c, 0.3)).connect(hp);
    const env = held(c, t, 0.28 * v, 0.04);
    hp.connect(lp).connect(env).connect(out);
    return releaser(c, env, [saw, sq, lfo], 0.08);
  },
};
// A sine and three harmonics, each with its own decay (synth.py pluck).
// `slow` stretches the harmonics' decays, so keys keep more body.
function plucked(c, out, t, v, m, tau, slow, len) {
  const f = midiToHz(m);
  const env = hit(c, t, 0.45 * v, tau, 0.003);
  const nodes = [];
  for (const [k, a, d] of [[1, 1, 0], [2, 0.35, 0.05], [3, 0.12, 0.03], [5, 0.06, 0.015]]) {
    const o = osc(c, "sine", f * k, t, t + len);
    nodes.push(o);
    o.connect(d ? hit(c, t, a, d * slow, 0.001) : gain(c, a)).connect(env);
  }
  env.connect(out);
  return releaser(c, env, nodes, 0.15);
}

// Plays a sound word into context `c` at time `t`. Drum words ignore `midi`
// (bell on a pad plays C5). Returns a release function for held notes.
// `hz` sets the pitch of a tick (the metronome's accent).
// `take: false` keeps a sound out of a take's MIDI file (the metronome's clicks).
export function voice(c, out, word, t, { midi = 60, vel = 1, pitched = false, hz, take = true } = {}) {
  const name = soundFor(word, pitched);
  const ev = recording && take ? { word, midi: name === "bell" && !pitched ? 72 : midi, pitched, vel, at: t } : null;
  if (ev) recording.events.push(ev);
  if (TONE[name]) {
    const release = TONE[name](c, out === chain(c).out ? chain(c).tone : out, t, vel, name === "bell" && !pitched ? 72 : midi);
    return ev ? (at) => { ev.until = at ?? c.currentTime; release(at); } : release;
  }
  DRUM[name](c, out, t, vel, { midi, pitched, hz });
  return NOOP;
}

// ---------- takes (YUI-246, spec/MUSIC.md section 3) ----------
// Record on the looper, drums, keys and chords records what the engine plays: the audio of the master chain in a
// MediaRecorder, and every voice started meanwhile as a note for the .mid. Never the mic.
let recording = null;
export const takeSupport = () => typeof MediaRecorder !== "undefined" && !!takeFormat((t) => MediaRecorder.isTypeSupported(t));
export function startTake() {
  const c = audio();
  const fmt = typeof MediaRecorder !== "undefined" ? takeFormat((t) => MediaRecorder.isTypeSupported(t)) : null;
  if (!c || !fmt || recording) return false;
  const rec = new MediaRecorder(chain(c).record.stream, { mimeType: fmt.type, audioBitsPerSecond: 160000 });
  const chunks = [];
  rec.ondataavailable = (e) => { if (e.data?.size) chunks.push(e.data); };
  const start = c.currentTime;
  recording = { events: [], start, rec, chunks, fmt, wall: performance.now() };
  rec.start(250);
  return true;
}
export const takeSeconds = () => (recording ? (performance.now() - recording.wall) / 1000 : 0);
export const takeIsOn = () => !!recording;
// Stops the take; resolves { audio: Blob, ext, mime, seconds, notes } or null when nothing was recorded.
export function stopTake() {
  const r = recording;
  if (!r) return Promise.resolve(null);
  recording = null;
  const c = audio();
  const seconds = Math.min(MAX_TAKE_SECONDS, (performance.now() - r.wall) / 1000);
  const end = r.start + seconds;
  return new Promise((resolve) => {
    r.rec.onstop = () => {
      const blob = new Blob(r.chunks, { type: r.fmt.mime });
      if (!blob.size) { resolve(null); return; }
      resolve({ audio: blob, ext: r.fmt.ext, mime: r.fmt.mime, seconds, notes: takeNotes(r.events.map((e) => ({ ...e, until: e.until != null ? Math.min(e.until, end) : undefined })), { start: r.start, seconds }) });
    };
    try { r.rec.state !== "inactive" ? r.rec.stop() : r.rec.onstop(); } catch { resolve(null); }
  });
}

// Plays now (or at `when` on the context clock) through the master chain.
export function play(word, opts = {}) {
  const c = audio();
  if (!c) return NOOP;
  return voice(c, chain(c).out, word, opts.when ?? c.currentTime, opts);
}
// Plays a note until the release function is called, then fades it.
export function hold(word, midi, vel = 0.9) {
  const c = audio();
  if (!c) return NOOP;
  return voice(c, chain(c).out, word, c.currentTime, { midi, vel, pitched: true });
}
// A pitched note that lets go by itself after `dur` seconds.
export function note(word, midi, { when, dur = 0.5, vel = 0.9 } = {}) {
  const c = audio();
  if (!c) return;
  const t = when ?? c.currentTime;
  voice(c, chain(c).out, word, t, { midi, vel, pitched: true })(t + dur);
}

// How loud the master is right now (RMS of the last 1024 samples).
export function level() {
  if (!ctx) return 0;
  const m = chain(ctx).meter;
  const buf = new Float32Array(m.fftSize);
  m.getFloatTimeDomainData(buf);
  let s = 0;
  for (const x of buf) s += x * x;
  return Math.sqrt(s / buf.length);
}

// Renders one sound offline and measures it. The proof that a voice makes sound.
export async function renderOffline(word, { midi = 60, seconds = 0.5, pitched = false } = {}) {
  const C = window.OfflineAudioContext || window.webkitOfflineAudioContext;
  const c = new C(1, Math.round(44100 * seconds), 44100);
  const release = voice(c, chain(c).out, word, 0, { midi, pitched });
  release(seconds * 0.6);
  const buf = await c.startRendering();
  const d = buf.getChannelData(0);
  let s = 0, peak = 0;
  for (const x of d) { s += x * x; peak = Math.max(peak, Math.abs(x)); }
  return { rms: Math.sqrt(s / d.length), peak };
}

// ---------- voices that outlive their screen (SITE-100) ----------
// A loop, a metronome or a latched chord belongs to the chat or the playground,
// not to the screen it was started on: swipe away and it keeps playing, so
// several layer. Each registers here under the id of its node. A screen that
// unmounts inside a keep scope (KeepCtx, keep.js) `park`s its voice; one that
// mounts again `claim`s it back. Closing the chat or leaving the page calls
// stopAll. Outside a scope a voice stops with its screen, as before.
const reg = new Map(); // id -> { id, kind, stop, data, parked }
export function keep(id, kind, stop, data) {
  reg.get(id)?.stop();
  const e = { id, kind, stop, data, parked: false };
  reg.set(id, e);
  return e;
}
export function claim(id) {
  const e = reg.get(id);
  if (!e) return null;
  e.parked = false;
  return e;
}
export function drop(e) { if (e && reg.get(e.id) === e) reg.delete(e.id); }
export function active() { return [...reg.values()].map(({ id, kind, parked }) => ({ id, kind, parked })); }
export function stopAll() { for (const e of [...reg.values()]) e.stop(); reg.clear(); }

// A steady clock. `gap(i)` is the time from tick i to tick i+1, read live so
// tempo changes land on the next tick. `onTick(i, time)` books sounds.
// `onShow(i, time)` runs on an animation frame when tick i reaches the speaker
// (base and output latency added), for the playhead. Handlers can be swapped
// with `bind` (a screen taking a running clock back), and `park` drops the
// playhead callback while the sound goes on. `id` + `kind` list it in the
// registry above.
export function clock({ gap, onTick, onShow, lead = 0.06, id, kind }) {
  const c = audio();
  if (!c) return { stop: NOOP, park: NOOP, bind: NOOP, start: 0 };
  const h = { gap, onTick, onShow };
  let i = 0;
  let next = c.currentTime + lead;
  const start = next;
  const due = [];
  let timer = null, frame = null, entry = null;
  const pump = () => {
    while (next < c.currentTime + 0.1) {
      h.onTick(i, next);
      if (h.onShow) due.push([i, next]);
      next += h.gap(i);
      i++;
    }
    timer = setTimeout(pump, 25);
  };
  const draw = () => {
    frame = null;
    if (!h.onShow) return;
    const heard = c.currentTime - (c.baseLatency || 0) - (c.outputLatency || 0);
    let last = null;
    while (due.length && due[0][1] <= heard) last = due.shift();
    if (last) h.onShow(last[0], last[1]);
    frame = requestAnimationFrame(draw);
  };
  pump();
  if (onShow) frame = requestAnimationFrame(draw);
  const handle = {
    start,
    stop() { clearTimeout(timer); cancelAnimationFrame(frame); frame = null; due.length = 0; drop(entry); },
    park() { h.onShow = null; due.length = 0; if (entry) entry.parked = true; },
    bind(next) {
      Object.assign(h, next);
      if (h.onShow && frame == null) frame = requestAnimationFrame(draw);
    },
  };
  if (id) entry = keep(id, kind || "clock", handle.stop, handle);
  return handle;
}

// For tests and the curious: window.yuiMusic.play("kick"), .level(), .renderOffline("bell").
if (typeof window !== "undefined") window.yuiMusic = { play, note, level, renderOffline, audio, running, active, stopAll, startTake, stopTake, takeIsOn };
