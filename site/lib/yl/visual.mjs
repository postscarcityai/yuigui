// The visual (spec/VISUAL.md, YL.md section 5, YUI-124): a live shader behind
// the stage, in the agent's colors, moving in the agent's motion look and
// listening to a voice, music or the room. This file is the part every
// renderer shares: which look, which colors, how the level follows the sound,
// how far it sinks behind words so it never fights them, and the frame budget.
// The shaders themselves are site/lib/visual/shaders.mjs (WebGL) and their
// Metal ports in the app. Pure, dependency free apart from look.mjs and motion.mjs.

import { SETS, YUI, contrast, fromHSL, hex, hsl, rgb } from "./look.mjs";
import { PACES, motionLook } from "./motion.mjs";
import { VISUAL_LOOKS, VISUAL_REACT } from "./yl.mjs";

export { VISUAL_LOOKS, VISUAL_REACT };

// The five looks, in picker order. `words` is what the person hears it called
// (the record's pill, VoiceOver), `for` what an agent reaches for it for.
export const LOOKS = {
  orb: { name: "Orb", words: "a soft ball of light that swells when someone speaks", for: "talking, a check-in, breathing" },
  aurora: { name: "Aurora", words: "slow ribbons of color", for: "calm, winding down, sleep" },
  waves: { name: "Waves", words: "layered lines that ripple with the sound", for: "music, a loop, a long talk" },
  grain: { name: "Grain", words: "a soft gradient with film grain that barely moves", for: "focus, reading, writing" },
  bloom: { name: "Bloom", words: "petals of light that open on the beat", for: "a win, a celebration, a beat" },
};

// What `visual` alone means: the orb, in the agent's own color, on the voice.
export const DEFAULTS = { look: "orb", tone: "accent", react: "voice" };

// ---------- every agent's own (YUI-180, VISUAL.md section 6) ----------

// How strong a default draws: never full. `dim` is the strength any visual has
// behind words (BUDGET.behindDim), `faint` lower still; behind words a default
// sinks again by the same 0.7.
export const STRENGTHS = { dim: 0.7, faint: 0.45 };

// The look each crew agent ships with (yui runtime/profiles/<name>/profile.json
// `visual`, the source; this copy draws the playground). `hears` is react=.
export const CREW_VISUALS = {
  yui: { look: "orb", hears: "voice", strength: "dim", pace: "slow", why: "the app's own face, calm breathing" },
  arnold: { look: "waves", hears: "music", strength: "dim", pace: "even", why: "training rhythm, swells on the beat" },
  basil: { look: "bloom", hears: "voice", strength: "dim", pace: "slow", why: "the kitchen, soft and warm" },
  gouda: { look: "grain", hears: "music", strength: "dim", pace: "even", why: "sparkles with the looper and the keys" },
  penny: { look: "aurora", hears: "off", strength: "faint", pace: "slow", why: "money, slow and steady" },
  quill: { look: "orb", hears: "voice", strength: "faint", pace: "slow", why: "study, low motion so it never distracts" },
};

// Every other agent (a connected Hermes agent, one Yui made): the soft orb.
export const FALLBACK_VISUAL = { look: "orb", hears: "voice", strength: "faint", pace: "slow" };

// The one rule every stage follows, over the thread's ops (oldest first):
// the person's switch in Settings (off beats everything), then the agent's
// newest `visual` line (`visual off` is nothing and sticks; any other draws as
// asked), then its default, quiet. Props for visualPlan, or null for nothing.
export function stageVisual(def, ops = [], personOff = false) {
  if (personOff) return null;
  const last = [...ops].reverse().find((o) => o?.op === "visual");
  if (last) return last.props?.off ? null : last.props;
  const d = def || FALLBACK_VISUAL;
  return { look: d.look, tone: d.tone || "accent", react: d.hears, strength: STRENGTHS[d.strength] ?? STRENGTHS.faint, pace: d.pace || "slow", quiet: true };
}

// ---------- color ----------

// The agent's accent from its saved look (yui_agents.theme): accent= as a hex
// or a set name, else its set's accent, else Yui's coral.
export function themeAccent(theme = {}) {
  const a = theme?.accent;
  if (rgb(a)) return hex(rgb(a));
  if (a && SETS[a]) return SETS[a].accent;
  if (theme?.name && SETS[theme.name]) return SETS[theme.name].accent;
  return YUI.light.accent;
}

// tone= over the agent's look: accent (or nothing) is the agent's own color.
export function visualTone(tone, theme = {}) {
  if (rgb(tone)) return hex(rgb(tone));
  if (tone && SETS[tone]) return SETS[tone].accent;
  return themeAccent(theme);
}

// Three colors from one: the tone itself, a lighter neighbor warmer on the
// wheel, and a deeper one cooler. The shader mixes these over the stage's
// ground (Yui's paper in light, its plum in dark), so a mint agent's aurora
// is mint, sea and teal, never a rainbow.
export function visualColors(tone, dark = true) {
  const c = hsl(rgb(tone) || rgb(YUI.light.accent));
  const s = Math.max(0.35, Math.min(0.9, c.s));
  const l = dark ? Math.max(0.5, Math.min(0.66, c.l)) : Math.max(0.46, Math.min(0.62, c.l));
  return {
    a: hex(fromHSL(c.h, s, l)),
    b: hex(fromHSL(c.h + 28, Math.min(1, s * 0.9), Math.min(0.82, l + 0.14))),
    c: hex(fromHSL(c.h - 40, Math.min(1, s * 1.05), Math.max(0.3, l - 0.14))),
    ground: dark ? YUI.dark.background : YUI.light.background,
    ink: dark ? YUI.dark.ink : YUI.light.ink,
  };
}

const mix = (x, y, t) => ({ r: x.r + (y.r - x.r) * t, g: x.g + (y.g - x.g) * t, b: x.b + (y.b - x.b) * t });

// Never fights the words. Behind a chunk the visual runs at `dim` of its
// strength, then a scrim of the ground color sits over it. The scrim is the
// least alpha that keeps the stage's ink at 4.6:1 (GUARD.text, AA with
// headroom) over the worst pixel the shader can make: any of its three
// colors at full strength, or the ground. Returns 0 to 0.92, in steps of .02.
export function scrimFor(colors, dim = 1, min = 4.6) {
  const ground = rgb(colors.ground), ink = rgb(colors.ink);
  const worst = [colors.a, colors.b, colors.c].map((h) => mix(ground, rgb(h), dim));
  for (let a = 0; a <= 0.92 + 1e-9; a += 0.02) {
    if (worst.every((p) => contrast(mix(p, ground, a), ink) >= min)) return Math.round(a * 100) / 100;
  }
  return 0.92;
}

// ---------- sound ----------

// How the level follows the sound, from the look's pulse: soft swells and
// lets go slowly, beat hits and falls fast, tick moves in four steps, still
// does not react (the visual drifts on its own clock). Times in ms, scaled
// by pace like every other move (motion.mjs PACES).
export const ENVELOPES = {
  soft: { attack: 180, release: 900, steps: 0, gain: 0.75 },
  beat: { attack: 25, release: 260, steps: 0, gain: 1 },
  tick: { attack: 10, release: 160, steps: 4, gain: 0.9 },
  still: { attack: 0, release: 0, steps: 0, gain: 0 },
};

export function envelope(look) {
  const e = ENVELOPES[look?.pulse] || ENVELOPES.beat;
  const k = PACES[look?.pace] ?? 1;
  return { ...e, attack: Math.round(e.attack * k), release: Math.round(e.release * k) };
}

// One step of the level follower: `input` is the raw level (0..1, RMS from a
// meter), `prev` the last output, `dt` ms since then. A one-pole filter with
// its own time for going up (attack) and down (release). Out of range input is
// clamped; still is always 0. The follower stays smooth: tick's quarters are
// `shown`, applied on the way to the shader, never fed back (rounded state
// stuck at 0.25 once the sound stopped, YUI-125).
export function follow(prev, input, dt, env) {
  if (!env.gain) return 0;
  const x = Math.min(1, Math.max(0, Number(input) || 0)) * env.gain;
  const t = x > prev ? env.attack : env.release;
  const k = t <= 0 ? 1 : 1 - Math.exp(-Math.max(0, dt) / t);
  return prev + (x - prev) * k;
}

// What the shader gets from the follower: tick moves in quarters, the rest as is.
export function shown(level, env) {
  return env.steps ? Math.round(level * env.steps) / env.steps : level;
}

// RMS of a block of samples (-1..1), mapped to 0..1 on a gentle curve so a
// speaking voice (about -30 dBFS) sits near the middle.
export function levelOf(samples) {
  if (!samples?.length) return 0;
  let sum = 0;
  for (const v of samples) sum += v * v;
  const db = 20 * Math.log10(Math.sqrt(sum / samples.length) + 1e-9);
  return Math.min(1, Math.max(0, (db + 60) / 50));
}

// ---------- the plan a renderer draws ----------

// The frame budget (VISUAL.md, section 5). fps 0 means one still frame.
export const BUDGET = {
  aloneFps: 60, behindFps: 30, warmFps: 30,
  scale: 0.5, grainScale: 0.75,
  gpuMs: 2, meterHz: 30,
  // Behind words: the picture at this strength, and the scrim only over the
  // words' zone (fractions of the stage height from the bottom: full scrim
  // below the first, fading to none at the second).
  behindDim: 0.7, zone: [0.34, 0.58],
  // A default (YUI-180) while nothing is heard.
  quietIdleFps: 15,
};

// Everything a renderer needs for one visual:
//   props   the visual line's props (visualOf), or null for none
//   theme   the agent's saved look (colors and motion keys)
//   dark    the stage's appearance
//   words   true when a chunk with words is on the stage (dim and scrim)
//   reduced Reduce Motion; lowPower Low Power Mode; thermal "nominal" |
//           "fair" | "serious" | "critical"; hidden the stage is closed or the
//           app is in the background
// Returns null for no visual, else { look, react, tone, colors, motion, env,
// speed, dim, scrim, zone, fps, idleFps, quiet, pace, scale, still, why, label }.
export function visualPlan(props, { theme = {}, dark = true, words = false, reduced = false, lowPower = false, thermal = "nominal", hidden = false } = {}) {
  if (!props) return null;
  const look = VISUAL_LOOKS.includes(props.look) ? props.look : DEFAULTS.look;
  const react = VISUAL_REACT.includes(props.react) ? props.react : DEFAULTS.react;
  const tone = visualTone(props.tone, theme);
  const colors = visualColors(tone, dark);
  const motion = motionLook(theme, null, reduced);
  // A default (stageVisual, props.quiet) draws at its strength, at the slower
  // of its pace and the agent's, at 30 fps and 15 while nothing is heard.
  const quiet = !!props.quiet;
  const strength = quiet ? Math.min(props.strength ?? STRENGTHS.faint, STRENGTHS.dim) : 1;
  const dim = +(strength * (words ? BUDGET.behindDim : 1)).toFixed(3);
  const pace = quiet && (PACES[props.pace] ?? 1) > (PACES[motion.pace] ?? 1) ? props.pace : motion.pace;
  const why = reduced ? "reduce-motion" : lowPower ? "low-power" : thermal === "serious" || thermal === "critical" ? "hot" : hidden ? "hidden" : null;
  const still = !!why;
  const fps = still ? 0 : quiet || words || thermal === "fair" ? BUDGET.behindFps : BUDGET.aloneFps;
  return {
    look, react, tone, colors, motion,
    env: still || react === "off" ? { ...ENVELOPES.still } : envelope(motion),
    speed: still ? 0 : 1 / (PACES[pace] ?? 1),
    dim, scrim: words ? scrimFor(colors, dim) : 0, zone: BUDGET.zone,
    fps, idleFps: still ? 0 : quiet ? BUDGET.quietIdleFps : fps, quiet, pace, scale: look === "grain" ? BUDGET.grainScale : BUDGET.scale,
    still, why,
    label: visualLabel(look, tone, react),
  };
}

// What the record's pill and VoiceOver say: "Aurora, listening to your voice".
const HEARS = { voice: "listening to your voice", music: "moving with the music", mic: "listening to the room", off: "moving on its own" };
export function visualLabel(look, tone, react) {
  return `${LOOKS[look]?.name || "Orb"}, ${HEARS[react] || HEARS.voice}`;
}
