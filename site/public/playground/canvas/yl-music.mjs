// YUI-339: music on the living canvas. A `loop`, `keys` or `chords` answer (spec/MUSIC.md) draws on the same canvas clock as a film, and every
// cell, key and chord is a mark. The loop strokes its grid in (kit-word names first, then the rows), its hits pop in, and a playhead sweeps the
// columns on the canvas clock while it plays. A tap on a cell toggles the hit and the beat redraws in place (the page rebuilds the film from
// the new text, so Back steps it back like any other change). `keys` draws a keyboard with the keys outside the scale drawn locked; a tap plays
// a key. `chords` draws big chord buttons; a tap strums. `~chords key=D` redraws them in place (a hold, or the agent's patch).
// Sound is the playground's own engine (yl/music-engine.mjs, a synced copy of app/playground/music/engine.js): Web Audio only, no sample files,
// and nothing starts before a tap (the first touch is the gesture the browser wants). With no audio the picture and the playhead still run.
// Mark ids: `loop.play`, `loop.row.<n>` (1-based), `loop.<row>.<step>` (1-based); `keys.<note>` (`keys.C4`); `chords.<n>` (1-based).
// Frames (test-perf.mjs, headless Chrome 390x844, CPU 1x, budget p95 under 20 ms): loop 312 frames p95 16.7 ms max 16.8; keys 256 frames p95 16.7
// max 16.8; chords 259 frames p95 16.7 max 16.8; loop play + 8 cell taps + Back 631 frames p95 16.7 max 16.8; chords 8 strums 224 frames p95 16.7 max 16.8.
// Events (spec/MOTION.md 0b): a cell is `canvas loop mark=<id> p=<pattern>`, a key `canvas play mark=<id>`, a chord `canvas play mark=<id>`.
import { KIT } from "./yl/yl.mjs";
import { audio, warm, play, note, clock } from "./yl/music-engine.mjs";
import { loopVoices, stepTime, fromPattern, noteToMidi, parseKey, inScale, midiName, progression, chordNotes } from "./yl/theory.mjs";
import { applyPatch } from "./yl-patch.mjs";

export const MUSIC = ["loop", "keys", "chords"];
export const isMusic = (preset) => MUSIC.includes(preset);

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const seg = (t, a, b) => clamp((t - a) / (b - a), 0, 1);
const eout = (u) => 1 - Math.pow(1 - u, 3);
const back = (u) => { const c = 1.70158, v = u - 1; return 1 + (c + 1) * v * v * v + c * v * v; };   // a pop that overshoots, then settles
const now = () => (typeof performance !== "undefined" ? performance.now() : Date.now());
const clampInt = (v, lo, hi, d) => { const n = Math.round(Number(v)); return Number.isFinite(n) ? clamp(n, lo, hi) : d; };
const TONES = ["accent", "good", "a3", "warn", "a2", "bad"];
const BUMP_MS = 280, PRESS_MS = 420, STRUM_MS = 900;

let META = { ask: "" };
export function setMeta(m) { META = { ask: "", ...(m || {}) }; }
const ask = () => META.ask || "music";

// ---- the transport -----------------------------------------------------------------------------------------------------------
// One loop plays at a time. The engine clock books the sounds ahead of time; the playhead is read from wall time since the loop started, so a
// frame never waits on audio and a page with no audio still sweeps. `film` is the loop whose grid the clock reads: a toggle builds a new film
// from the new text, and the page hands it over with adopt() (also when Back or a hold redraw swaps the film).
const T = { clk: null, playing: false, t0: 0, film: null, resume: false, touched: false, frozen: null };

function rowSound(cfg, ri, when) {
  const m = noteToMidi(cfg.rows[ri]);
  if (m !== null) note(cfg.sound, m, { when, dur: (60 / cfg.bpm) * (cfg.steps <= 8 ? 0.5 : 0.25) * 0.9 });
  else play(cfg.voices[ri], { when, vel: 0.9 });
}
function startLoop(film) {
  stopLoop();
  T.film = film; T.playing = true; T.frozen = null;
  T.t0 = now() + 60;   // the engine books its first step 60 ms ahead
  T.clk = clock({
    gap: (i) => { const s = T.film.cfg, k = i % s.steps; return stepTime(k + 1, s.bpm, s.steps, s.swing) - stepTime(k, s.bpm, s.steps, s.swing); },
    onTick: (i, when) => { const s = T.film.cfg, k = i % s.steps; s.rows.forEach((_, ri) => { if (s.grid[ri][k]) rowSound(s, ri, when); }); },
    lead: 0.06,
  });
}
function stopLoop() { if (T.clk) T.clk.stop(); T.clk = null; T.playing = false; }
// The column under the playhead, or -1 when nothing plays.
function headOf(cfg) {
  if (T.frozen !== null) return T.frozen;
  if (!T.playing) return -1;
  const d = (60 / cfg.bpm) * (cfg.steps <= 8 ? 0.5 : 0.25), el = (now() - T.t0) / 1000;
  if (el < 0) return -1;
  const at = el % (d * cfg.steps);
  let k = 0;
  for (let i = cfg.steps - 1; i >= 0; i--) if (stepTime(i, cfg.bpm, cfg.steps, cfg.swing) <= at) { k = i; break; }
  return k;
}
// The page hands over the film now on screen (a toggle, Back, Redo, a hold redraw): the clock plays what is drawn.
export function adopt(film) {
  if (!film || film.music !== "loop") return;
  const was = T.film && T.film.cfg;
  T.film = film;
  if (T.playing && was && (was.bpm !== film.cfg.bpm || was.steps !== film.cfg.steps || was.swing !== film.cfg.swing)) startLoop(film);
}
// A diff of two films is drawn on two frames: hold the playhead still between them so the playhead is never part of the difference.
export function freeze(on) { T.frozen = on && T.playing && T.film ? headOf(T.film.cfg) : null; }
// The canvas pause: the loop stops with it and starts again where the person lets go (a tap on the canvas is a gesture too).
export function pause(film, on) {
  if (!film || film.music !== "loop") return;
  if (on) { if (T.playing) { T.resume = true; stopLoop(); } }
  else if (T.resume || (film.cfg.autoplay && !T.touched)) { T.resume = false; T.touched = true; audio(); startLoop(film); }
}
export const playing = () => T.playing;
// For the tests: the transport as the page sees it.
export const state = () => ({ playing: T.playing, head: T.film ? headOf(T.film.cfg) : -1 });
export function reset() { stopLoop(); T.resume = false; T.touched = false; T.frozen = null; T.film = null; }

// ---- reading -------------------------------------------------------------------------------------------------------------------

// The audio context and the sound chain are built once, in idle time after the answer loads, so the first tap makes no long frame. The context stays
// silent (suspended) until a tap: nothing sounds before a gesture.
let warmed = false;
function warmUp() {
  if (warmed || typeof window === "undefined") return;
  warmed = true;
  const go = () => { try { warm(); } catch (e) { /* no audio here */ } };
  if (window.requestIdleCallback) window.requestIdleCallback(go, { timeout: 1500 }); else setTimeout(go, 300);
}

export function musicFilm(op, read0, host) {
  warmUp();
  if (op.preset === "loop") return loopFilm(op, read0, host);
  if (op.preset === "keys") return keysFilm(op, read0, host);
  if (op.preset === "chords") return chordsFilm(op, read0, host);
  return null;
}
const lastLine = (text, preset) => String(text).split("\n").findIndex((l) => new RegExp("^\\s*" + preset + "\\b").test(l));
const sayLines = (film, api, total) => film.says.slice(0, 1).forEach((s0) => api.say(s0, 0.3, Math.min(total - 0.5, 3.6), { y: "bottom", size: 20 }));
const addChoose = (film, read0, host, total) => { film.choose = read0.choose; film.chosen = null; film.onShapes = false; film.total = total + (read0.choose ? 1.2 : 0); };
// the area every music picture draws in (the same frame as a film's pictures)
const area = (api, cH) => ({ top: 120, bottom: api.h - 196 - cH });
const ring = (api, x, y, w, h, r) => api.rect(x - 3, y - 3, w + 6, h + 6, { c: "warn", w: 4.5, a: 0.9, r: r + 3, rough: 0 });

// ---- loop ---------------------------------------------------------------------------------------------------------------------

function loopFilm(op, read0, host) {
  const p = op.props || {}, text = host.text || op.line || "";
  const steps = clampInt(p.steps, 4, 16, 8), bpm = clampInt(p.bpm, 40, 240, 96), swing = clampInt(p.swing, 0, 75, 0);
  const rows = (Array.isArray(p.rows) && p.rows.length ? p.rows.map(String) : KIT.slice(0, 8)).slice(0, 8), nr = rows.length;
  const sound = String(p.sound || "pluck"), grid = fromPattern((Array.isArray(p.p) ? p.p : []).map(String), rows, steps);
  const cfg = { steps, bpm, swing, rows, grid, sound, voices: loopVoices(rows, sound), autoplay: !!p.play };
  const title = String(p.title || "Loop").trim(), name = (r) => String(rows[r]);
  const idCell = (r, s) => `loop.${r + 1}.${s + 1}`, idRow = (r) => `loop.row.${r + 1}`;
  const R0 = 0.45, rowT = (r) => R0 + r * 0.2, P0 = R0 + nr * 0.2 + 0.3, popT = (r, s) => P0 + s * 0.06 + r * 0.04, PLAYT = P0 + steps * 0.06 + nr * 0.04 + 0.2;
  const cellLabel = (r, s) => `${name(r)}, step ${s + 1}, ${grid[r][s] ? "on" : "off"}`;
  const marks = [{ id: "loop.play", label: "Play", words: "Play or stop the loop.", appear: PLAYT }];
  rows.forEach((_, r) => {
    marks.push({ id: idRow(r), label: name(r), words: `${name(r)}. Tap to hear it.`, appear: rowT(r) });
    for (let s = 0; s < steps; s++) marks.push({ id: idCell(r, s), label: cellLabel(r, s), words: `${cellLabel(r, s)}. Tap to turn it ${grid[r][s] ? "off" : "on"}.`, appear: rowT(r) + 0.4 });
  });
  const total = PLAYT + 1.4 + host.HOLD;
  const film = {
    kind: "music", music: "loop", cfg, text, marks, total, says: read0.says, title, caption: "", choose: null, chosen: null, onShapes: false,
    state: () => ({ ...state(), grid: grid.map((g) => g.map(Number)), bpm, swing }),
    // a tap: the play mark and the row names sound, a cell flips and the page rebuilds the film from the new text (Back steps it back)
    touch(id) {
      const wake = cfg.autoplay && !T.touched;
      audio();
      if (wake) { T.touched = true; if (!T.playing) startLoop(film); }
      if (id === "loop.play") {
        if (wake) return { say: "Playing", line: null };
        if (T.playing) { T.resume = false; stopLoop(); return { say: "Play: stopped", line: null }; }
        T.touched = true; startLoop(film); return { say: "Play: playing", line: null };
      }
      let m = /^loop\.row\.(\d+)$/.exec(id);
      if (m && +m[1] >= 1 && +m[1] <= nr) { rowSound(cfg, +m[1] - 1); return { say: name(+m[1] - 1), line: null }; }
      m = /^loop\.(\d+)\.(\d+)$/.exec(id);
      if (!m || +m[1] < 1 || +m[1] > nr || +m[2] < 1 || +m[2] > steps) return null;
      const r = +m[1] - 1, s = +m[2] - 1, on = !grid[r][s];
      if (on && !T.playing) rowSound(cfg, r);
      const next = grid.map((g, ri) => g.map((v, si) => (ri === r && si === s ? on : v)));
      const pat = next.map((g) => g.map((v) => (v ? "x" : ".")).join("")).join("|");
      const i = lastLine(text, "loop"), patched = i < 0 ? null : applyPatch(text, { patch: `~loop p=${pat}` });
      return { say: `${name(r)}, step ${s + 1}: ${on ? "on" : "off"}`, line: `[yui] ${ask()} canvas loop mark=${id} p=${pat}`, text: patched || text, id, kind: "beat", bump: id };
    },
    draw(t, api) {
      const W = api.w, H = api.h, on = api.marked, head = headOf(cfg), A = area(api, 0), banks = steps > 8 ? 2 : 1, per = Math.ceil(steps / banks);
      const nameW = 54, gx = 20 + nameW, gw = W - 40 - nameW, cw = gw / per, subY = A.top + 14;
      const availH = A.bottom - (subY + 22) - 64, rh = clamp(availH / (nr * banks + (banks - 1) * 0.35), 26, 68), bankH = nr * rh;
      const used = banks * bankH + (banks - 1) * rh * 0.35 + 24 + 100, gy0 = subY + 24 + Math.max(0, (A.bottom - subY - used) / 3);
      api.text(title, W / 2, A.top - 8, { size: 24, weight: 800, k: seg(t, 0, 0.5), maxw: W - 40, free: true });
      api.text(`${bpm} BPM${swing ? ` · swing ${swing}%` : ""}`, W / 2, subY, { size: 14, c: "dim", weight: 700, k: seg(t, 0.2, 0.7), free: true });
      const bump = BUMP && BUMP.film === text ? BUMP : null, hitsOut = [];
      for (let b = 0; b < banks; b++) {
        const gy = gy0 + b * (bankH + rh * 0.35), s0 = b * per, s1 = Math.min(steps, s0 + per);
        // the playhead column under the cells
        if (head >= s0 && head < s1) api.highlight(gx + (head - s0) * cw - 1, gy - 3, cw + 2, bankH + 4, { c: "warn", a: 0.2 });
        rows.forEach((_, r) => {
          const y = gy + r * rh, col = TONES[r % TONES.length], kr = seg(t, rowT(r), rowT(r) + 0.4);
          api.text(name(r), 20 + nameW - 8, y + rh / 2 - 2, { size: 14, weight: 800, c: col, align: "right", k: kr, type: true, free: true, maxw: nameW - 6 });
          for (let s = s0; s < s1; s++) {
            const x = gx + (s - s0) * cw + 2, w = cw - 4, h = rh - 6, isOn = grid[r][s], beat = s % 4 === 0, hot = s === head;
            const kc = seg(t, rowT(r) + 0.1 + (s - s0) * 0.03, rowT(r) + 0.5 + (s - s0) * 0.03);
            if (kc <= 0) continue;
            let sc = 1;
            if (isOn) { sc = back(seg(t, popT(r, s), popT(r, s) + 0.28)); if (bump && bump.id === idCell(r, s)) sc = back(clamp((now() - bump.at) / BUMP_MS, 0, 1)); if (hot) sc = Math.max(sc, 1) * 1.1; }
            api.rect(x, y, w, h, { c: beat ? "dim" : "line", w: isOn ? 1.5 : 2, a: isOn ? 0.4 : 0.9, r: 8, k: kc, rough: 0 });
            if (isOn && sc > 0.02) api.rect(x + w * (1 - sc) / 2, y + h * (1 - sc) / 2, w * sc, h * sc, { c: col, w: 2.5, r: 8, fill: col, fa: hot ? 1 : 0.85, rough: 0 });
            if (on === idCell(r, s)) ring(api, x, y, w, h, 8);
            hitsOut.push([idCell(r, s), x + w / 2, y + h / 2, w, h, cellLabel(r, s), t > rowT(r) + 0.5]);
          }
          if (on === idRow(r)) api.rect(20 - 2, y + 1, nameW + 2, rh - 8, { c: "warn", w: 4, r: 10, a: 0.9, rough: 0 });
        });
      }
      // Play / Stop
      const py = gy0 + banks * bankH + (banks - 1) * rh * 0.35 + 38, kp = seg(t, PLAYT, PLAYT + 0.4), pl = T.playing;
      if (kp > 0) {
        api.label(pl ? "Stop" : "Play", W / 2, py, { size: 17, weight: 800, k: kp, bg: pl ? "good" : "panel", c: pl ? "ink" : "fg", border: pl ? "good" : "accent", free: true, noHit: true });
        if (on === "loop.play") api.rect(W / 2 - 52, py - 22, 104, 44, { c: "warn", w: 4, r: 22, a: 0.9, rough: 0 });
        if (!pl) api.text(cfg.autoplay && !T.touched ? "Tap to hear it" : "Tap a cell. It plays next time round.", W / 2, py + 40, { size: 13, c: "dim", weight: 600, k: seg(t, PLAYT + 0.2, PLAYT + 0.7), free: true, maxw: W - 40 });
      }
      // hits, in reading order: play, then each row's name and cells
      if (kp > 0.5) api.hitBox("loop.play", W / 2, py, 112, 44, "Play");
      rows.forEach((_, r) => {
        const y = gy0 + r * rh;
        if (t > rowT(r) + 0.3) api.hitBox(idRow(r), 20 + nameW / 2, y + rh / 2 - 3, nameW, rh - 6, name(r));
        hitsOut.filter((h) => h[0].startsWith(`loop.${r + 1}.`)).forEach((h) => { if (h[6]) api.hitBox(h[0], h[1], h[2], h[3], h[4], h[5]); });
      });
      sayLines(film, api, total);
    },
  };
  addChoose(film, read0, host, total);
  return film;
}

// A bump marks the cell just flipped so it pops (the film is rebuilt from the new text; the module remembers which cell and when).
let BUMP = null;
export function bump(film, id) { BUMP = { film: film.text, id, at: now() }; }

// ---- keys ---------------------------------------------------------------------------------------------------------------------

function keysFilm(op, read0, host) {
  const p = op.props || {}, text = host.text || op.line || "";
  const keyName = String(p.key || "C"), k = parseKey(keyName), scale = String(p.scale || (k.minor ? "minor" : "major")), octave = clampInt(p.octave, 1, 6, 4), sound = String(p.sound || "keys");
  const lo = 12 * (octave + 1), N = 17, midis = Array.from({ length: N }, (_, i) => lo + i);
  const black = (m) => [1, 3, 6, 8, 10].includes(((m % 12) + 12) % 12), locked = (m) => scale !== "chromatic" && !inScale(m, k, scale);
  const nm = (m) => midiName(m, k.flats), id = (m) => `keys.${nm(m)}`;
  const label = (m) => (locked(m) ? `${nm(m)}, locked` : nm(m));
  const whites = midis.filter((m) => !black(m)), title = String(p.title || "Keys").trim();
  const T0 = 0.45, whiteT = (i) => T0 + i * 0.07, blackT = T0 + whites.length * 0.07 + 0.1, lockT = blackT + 0.4;
  const keyLabel = `${keyName} ${scale}`;
  const marks = midis.map((m, i) => ({ id: id(m), label: label(m), words: locked(m) ? `${nm(m)} is locked. It is not in ${keyName} ${scale}.` : `${nm(m)}. Tap to play.`, appear: black(m) ? blackT : whiteT(whites.indexOf(m)) }));
  const total = lockT + 1.2 + host.HOLD, PRESS = new Map();
  const film = {
    kind: "music", music: "keys", cfg: { key: keyName, scale, octave, sound, midis }, text, marks, total, says: read0.says, title, caption: "", choose: null, chosen: null, onShapes: false,
    pressed: PRESS,
    touch(i) {
      const m = midis.find((x) => id(x) === i);
      if (m === undefined) return null;
      audio();
      if (locked(m)) return { say: `${label(m)}. Not in ${keyName} ${scale}.`, line: null };
      PRESS.set(m, now());
      note(sound, m, { dur: 0.7 });
      return { say: nm(m), line: `[yui] ${ask()} canvas play mark=${i}` };
    },
    draw(t, api) {
      const W = api.w, A = area(api, 0), kx = 20, kw = W - 40, ww = kw / whites.length, bw = ww * 0.62, ky = A.top + 64, kh = clamp(A.bottom - ky - 70, 150, 260), bh = kh * 0.6, on = api.marked;
      api.text(title, W / 2, A.top - 8, { size: 24, weight: 800, k: seg(t, 0, 0.5), maxw: W - 40, free: true });
      api.text(keyLabel, W / 2, A.top + 22, { size: 15, c: "dim", weight: 700, k: seg(t, 0.2, 0.7), free: true });
      const wx = (m) => kx + whites.indexOf(m) * ww, bx = (m) => kx + (whites.indexOf(m - 1) + 1) * ww - bw / 2;
      const glow = (m) => { const at = PRESS.get(m); return at === undefined ? 0 : 1 - clamp((now() - at) / PRESS_MS, 0, 1); };
      whites.forEach((m, i) => {
        const kk = seg(t, whiteT(i), whiteT(i) + 0.4); if (kk <= 0) return;
        const g = glow(m), x = wx(m);
        api.rect(x + 1.5, ky, ww - 3, kh, { c: locked(m) ? "line" : "fg", w: 2.5, r: 8, k: kk, fill: g > 0 ? "accent" : locked(m) ? "line" : "panel", fa: g > 0 ? 0.35 + 0.6 * g : locked(m) ? 0.3 : 0.9, rough: 0 });
        if (!locked(m) && (((m % 12) + 12) % 12 === k.root)) api.dot(x + ww / 2, ky + kh - 20, 5, { c: "accent", a: kk });
        if (locked(m)) lockIcon(api, x + ww / 2, ky + kh - 22, seg(t, lockT, lockT + 0.4));
        if (kk > 0.9) api.text(nm(m).replace(/\d/, ""), x + ww / 2, ky + kh - 44, { size: 11, c: locked(m) ? "dim" : "fg", weight: 700, free: true, a: locked(m) ? 0.5 : 1 });
        if (on === id(m)) ring(api, x + 1.5, ky, ww - 3, kh, 8);
      });
      midis.filter(black).forEach((m) => {
        const kk = seg(t, blackT, blackT + 0.4); if (kk <= 0) return;
        const g = glow(m), x = bx(m);
        api.rect(x, ky, bw, bh * kk, { c: "fg", w: 2.5, r: 6, fill: g > 0 ? "accent" : locked(m) ? "line" : "fg", fa: g > 0 ? 0.5 + 0.5 * g : 1, rough: 0 });
        if (locked(m)) lockIcon(api, x + bw / 2, ky + bh - 18, seg(t, lockT, lockT + 0.4), true);
        if (on === id(m)) ring(api, x, ky, bw, bh, 6);
      });
      // hits in pitch order; a black key is smaller than the white under it, so it wins where they overlap
      midis.forEach((m) => {
        if (black(m)) { if (t > blackT + 0.2) api.hitBox(id(m), bx(m) + bw / 2, ky + bh / 2, bw, bh, label(m)); }
        else if (t > whiteT(whites.indexOf(m)) + 0.2) api.hitBox(id(m), wx(m) + ww / 2, ky + kh / 2, ww - 3, kh, label(m));
      });
      if (seg(t, lockT, lockT + 0.5) > 0 && scale !== "chromatic") api.text("Grey keys are locked. Nothing sounds wrong.", W / 2, ky + kh + 26, { size: 13, c: "dim", weight: 600, k: seg(t, lockT, lockT + 0.5), free: true, maxw: W - 40 });
      sayLines(film, api, total);
    },
  };
  addChoose(film, read0, host, total);
  return film;
}
// a small padlock: a body and a shackle
function lockIcon(api, x, y, k, small) {
  if (k <= 0) return;
  const s = small ? 0.8 : 1;
  api.rect(x - 6 * s, y - 2 * s, 12 * s, 9 * s, { c: "dim", w: 2, r: 2, fill: "dim", fa: 0.7 * k, rough: 0, a: k });
  api.stroke([[x - 4 * s, y - 2 * s], [x - 4 * s, y - 6 * s], [x - 2 * s, y - 8.5 * s], [x + 2 * s, y - 8.5 * s], [x + 4 * s, y - 6 * s], [x + 4 * s, y - 2 * s]], { c: "dim", w: 2, a: k, rough: 0 });
}

// ---- chords -------------------------------------------------------------------------------------------------------------------

function chordsFilm(op, read0, host) {
  const p = op.props || {}, text = host.text || op.line || "";
  const keyName = String(p.key || "C"), sound = String(p.sound || "pluck"), strum = ["down", "up", "off"].includes(String(p.strum)) ? String(p.strum) : "down";
  const list = progression({ key: keyName, prog: (Array.isArray(p.prog) ? p.prog : []).map(String), chords: (Array.isArray(p.chords) ? p.chords : []).map(String) }).slice(0, 8), n = list.length;
  if (!n) return null;
  const title = String(p.title || "Chords").trim(), id = (i) => `chords.${i + 1}`;
  const cols = n === 1 ? 1 : n <= 4 ? 2 : 3, rowsN = Math.ceil(n / cols);
  const T0 = 0.45, at = (i) => T0 + i * 0.22, total = at(n - 1) + 1.8 + host.HOLD, STRUM = new Map();
  const marks = list.map((c, i) => ({ id: id(i), label: c.name, words: `${c.name}${c.numeral ? `, ${c.numeral}` : ""}. Tap to strum.`, appear: at(i) + 0.3 }));
  const film = {
    kind: "music", music: "chords", cfg: { key: keyName, chords: list.map((c) => c.name), strum, sound }, text, marks, total, says: read0.says, title, caption: "", choose: null, chosen: null, onShapes: false,
    strummed: STRUM,
    touch(i) {
      const ix = list.findIndex((_, q) => id(q) === i);
      if (ix < 0) return null;
      const c = audio(), notes = chordNotes(list[ix].name);
      if (!notes) return { say: `${list[ix].name}: I do not know this chord.`, line: null };
      STRUM.set(ix, now());
      const order = strum === "up" ? notes.slice().reverse() : notes, gap = strum === "off" ? 0 : 0.025, t0 = c ? c.currentTime : 0;
      order.forEach((m, q) => note(sound, m, { when: t0 + q * gap, dur: 1.4 }));
      return { say: list[ix].name, line: `[yui] ${ask()} canvas play mark=${i}` };
    },
    draw(t, api) {
      const W = api.w, A = area(api, 0), gap = 12, top = A.top + 20, aw = W - 40, bwid = (aw - gap * (cols - 1)) / cols, bh = clamp((A.bottom - top - 40 - gap * (rowsN - 1)) / rowsN, 90, 170), on = api.marked;
      api.text(title, W / 2, A.top - 8, { size: 24, weight: 800, k: seg(t, 0, 0.5), maxw: W - 40, free: true });
      list.forEach((c, i) => {
        const kk = seg(t, at(i), at(i) + 0.5); if (kk <= 0) return;
        const col = TONES[i % TONES.length], r = Math.floor(i / cols), q = i % cols, x = 20 + q * (bwid + gap), y = top + r * (bh + gap), s0 = STRUM.get(i);
        const u = s0 === undefined ? 1 : clamp((now() - s0) / STRUM_MS, 0, 1), flash = s0 === undefined ? 0 : 1 - clamp((now() - s0) / PRESS_MS, 0, 1);
        api.rect(x, y, bwid, bh, { c: col, w: 3.5, r: 20, k: kk, fill: col, fa: 0.14 + 0.5 * flash, rough: 0 });
        // five strings that shake when the chord is strummed
        for (let sIx = 0; sIx < 5; sIx++) {
          const sy = y + bh * (0.56 + sIx * 0.07), amp = (1 - u) * 5 * (1 - sIx * 0.12), pts = [];
          for (let z = 0; z <= 14; z++) { const px = x + 14 + (bwid - 28) * z / 14; pts.push([px, sy + (u < 1 ? Math.sin(z * 1.3 + now() / 28 + sIx) * amp * Math.sin(Math.PI * z / 14) : 0)]); }
          api.stroke(pts, { c: col, w: 1.6, a: 0.55 * kk, rough: 0 });
        }
        api.text(c.name, x + bwid / 2, y + bh * (c.numeral ? 0.32 : 0.4), { size: Math.min(44, bwid / 3), weight: 800, c: "fg", k: kk, free: true, maxw: bwid - 16 });
        if (c.numeral) api.text(c.numeral, x + bwid / 2, y + bh * 0.47, { size: 14, weight: 700, c: "dim", k: kk, free: true });
        if (on === id(i)) ring(api, x, y, bwid, bh, 20);
        if (t > at(i) + 0.3) api.hitBox(id(i), x + bwid / 2, y + bh / 2, bwid, bh, c.name);
      });
      const ly = top + rowsN * (bh + gap) + 6;
      api.text(`Key of ${keyName}${strum === "off" ? "" : ` · strum ${strum}`}. Tap a chord.`, W / 2, ly + 10, { size: 13, c: "dim", weight: 600, k: seg(t, at(n - 1) + 0.4, at(n - 1) + 0.9), free: true, maxw: W - 40 });
      sayLines(film, api, total);
    },
  };
  addChoose(film, read0, host, total);
  return film;
}
