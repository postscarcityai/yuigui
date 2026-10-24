// yuicss layer 1: a look into CSS variables.
//
// An agent look (AgentLook in the app, site/lib/yl/look.mjs here) is a small
// recipe: an accent, a paper, a radius, a font, a weight and a motion. This
// file turns a compiled look into the variables every yuicss rule reads, so a
// restyle reaches every element, component and the app's chrome together.
// The contrast guard is look.mjs's (the same numbers as AgentLook.Guard); on
// top of it this file derives the accent ramp, the accent as text, and the
// good, warn and bad colors, each checked against the paper it will sit on.
// Pure, dependency free apart from look.mjs and motion.mjs.

import { AA, GUARD, SETS, YUI, appLook, contrast, fromHSL, hex, hsl, rgb } from "../yl/look.mjs";
import { motionLook, motionVars } from "../yl/motion.mjs";
import tokens from "./tokens.mjs";

export { tokens };

// The three looks the gallery shows: Yui's own, a square heavy coach, a calm serif.
export const GALLERY_LOOKS = ["yui", "coach", "zen"];

// A look by name (a set in look.mjs, "yui" is the app's own), or from the props
// of a `theme` line ({ name?, accent?, bg?, radius?, font?, weight?, motion?, pace?, ... }).
export function lookOf(x) {
  if (!x || x === "yui") return YUI;
  if (typeof x === "string") return SETS[x] ? appLook({ name: x }) : YUI;
  return appLook(x);
}

const WHITE = rgb("#FFFFFF");
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const withL = (c, l) => { const x = hsl(c); return fromHSL(x.h, x.s, clamp(l, 0, 1)); };

// Move a color away from the backgrounds, one step of lightness at a time,
// until it reads at `min` against all of them. On dark paper it lightens.
function away(c, bgs, min, dark) {
  let out = c, l = hsl(c).l;
  for (let i = 0; i < 100 && !bgs.every((b) => contrast(out, b) >= min); i++) {
    l += dark ? 0.01 : -0.01;
    if (l < 0 || l > 1) break;
    out = withL(out, l);
  }
  return out;
}

// A fill, the ink that sits on it, the same hue as text, and a soft tint.
// The fill moves away from the paper (darker on light paper, lighter on dark)
// until it reads as a control on the paper and the surface, and until one of
// the two inks reads on it. Both get better in that direction, so it always ends.
function semantic({ hue, sat }, paper, surface, darkInk, dark, tintL) {
  let fill = fromHSL(hue, sat, dark ? 0.58 : 0.42);
  const best = (f) => (contrast(WHITE, f) >= contrast(darkInk, f) ? WHITE : darkInk);
  for (let i = 0; i < 100; i++) {
    const bgOk = [paper, surface].every((b) => contrast(fill, b) >= GUARD.control);
    if (bgOk && contrast(best(fill), fill) >= GUARD.text) break;
    fill = withL(fill, hsl(fill).l + (dark ? 0.01 : -0.01));
  }
  const text = away(fromHSL(hue, sat, dark ? 0.72 : 0.36), [paper, surface], GUARD.text, dark);
  const soft = fromHSL(hue, sat * 0.75, tintL);
  return { fill: hex(fill), ink: hex(best(fill)), text: hex(text), soft: hex(soft) };
}

// Every color yuicss needs for one look in one mode, as hex.
export function palette(look = YUI, mode = "light") {
  const dark = mode === "dark";
  const p = dark ? look.dark : look.light;
  const paper = rgb(p.background), surface = rgb(p.surface), accent = rgb(p.accent);
  const darkInk = rgb(dark ? look.light.ink : p.ink);
  const { h, s } = hsl(accent);
  const sat = clamp(s, 0.25, 0.95);
  // The ramp. Tints 50 to 300 carry ink, so each one backs toward the paper
  // until the ink reads on it (a yellow at the same lightness is far brighter
  // than a plum, and the step says lightness).
  const ink = rgb(p.ink);
  const ramp = {};
  for (const [k, l0] of Object.entries(tokens.color.ramp[mode])) {
    let l = l0, c = fromHSL(h, sat, l);
    if (Number(k) <= 300) for (let i = 0; i < 100 && contrast(ink, c) < GUARD.text; i++) { l += dark ? -0.01 : 0.01; c = fromHSL(h, sat, l); }
    ramp[k] = hex(c);
  }
  ramp["500"] = p.accent;
  const out = {
    paper: p.background, surface: p.surface, ink: p.ink, muted: p.inkSoft, line: p.outline,
    accent: p.accent, accentInk: p.onAccent,
    accentText: hex(away(accent, [paper, surface], GUARD.text, dark)),
    ramp,
  };
  const tintL = tokens.color.ramp[mode]["100"];
  for (const n of ["good", "warn", "bad"]) out[n] = semantic(tokens.color.semantic[n], paper, surface, darkInk, dark, tintL);
  return out;
}

const FONTS = tokens.type.fonts;

// The CSS variables for one look in one mode: colors, type, shape, motion.
// Set them on the yuicss root (the body in the app, a frame on the site).
export function vars(look = YUI, mode = "light") {
  const pal = palette(look, mode);
  const v = {
    "--paper": pal.paper, "--surface": pal.surface, "--ink": pal.ink, "--muted": pal.muted, "--line": pal.line,
    "--accent": pal.accent, "--accent-ink": pal.accentInk, "--accent-text": pal.accentText,
  };
  for (const [k, c] of Object.entries(pal.ramp)) v[`--accent-${k}`] = c;
  for (const n of ["good", "warn", "bad"]) {
    v[`--${n}`] = pal[n].fill; v[`--${n}-ink`] = pal[n].ink; v[`--${n}-text`] = pal[n].text; v[`--${n}-soft`] = pal[n].soft;
  }
  v["--font"] = FONTS[look.font] || FONTS.rounded;
  v["--weight-heading"] = String(tokens.type.weight[look.weight] ?? tokens.type.weight[tokens.type.heading]);
  const r = look.radius in tokens.shape.radius ? look.radius : "soft";
  v["--radius"] = `${tokens.shape.radius[r]}px`;
  v["--radius-control"] = `${tokens.shape.control[r]}px`;
  v["--shadow-soft"] = tokens.shape.shadow.soft[mode];
  v["--shadow-lift"] = tokens.shape.shadow.lift[mode];
  const m = motionLook(look);
  Object.assign(v, motionVars(m));
  v["--enter-name"] = `y-${m.enter}`;
  v["--pulse-play"] = m.pulse === "still" ? "paused" : "running";
  return v;
}

// The same, as one CSS rule.
export function css(look = YUI, mode = "light", selector = ".yuicss") {
  return `${selector} {\n${Object.entries(vars(look, mode)).map(([k, val]) => `  ${k}: ${val};`).join("\n")}\n}`;
}

// What the guard promises for one look in one mode. Every pair of every look
// must pass; yuicss.test.mjs runs this over all the sets, light and dark.
export function checks(look = YUI, mode = "light") {
  const p = palette(look, mode);
  // Yui's own coral is the brand, shipped as is (look.mjs: the guard checks asked looks only);
  // every other look's accent has to read as a control against its paper.
  const own = look === YUI;
  const rows = [
    ["ink on paper", p.ink, p.paper, AA.text],
    ["ink on surface", p.ink, p.surface, AA.text],
    ["muted on paper", p.muted, p.paper, AA.text],
    ["muted on surface", p.muted, p.surface, AA.text],
    ...(own ? [] : [["accent on paper", p.accent, p.paper, AA.control]]),
    ["accent ink on accent", p.accentInk, p.accent, AA.text],
    ["accent as text on paper", p.accentText, p.paper, AA.text],
    ["accent as text on surface", p.accentText, p.surface, AA.text],
    ["ink on accent 50", p.ink, p.ramp["50"], AA.text],
    ["ink on accent 100", p.ink, p.ramp["100"], AA.text],
    ["ink on accent 200", p.ink, p.ramp["200"], AA.text],
    ["ink on accent 300", p.ink, p.ramp["300"], AA.text],
  ];
  for (const n of ["good", "warn", "bad"]) {
    rows.push([`${n} on paper`, p[n].fill, p.paper, AA.control]);
    rows.push([`${n} ink on ${n}`, p[n].ink, p[n].fill, AA.text]);
    rows.push([`${n} as text on paper`, p[n].text, p.paper, AA.text]);
    rows.push([`${n} as text on surface`, p[n].text, p.surface, AA.text]);
    rows.push([`ink on ${n} soft`, p.ink, p[n].soft, AA.text]);
  }
  return rows.map(([what, fg, bg, min]) => ({ what, fg, bg, ratio: Math.round(contrast(fg, bg) * 10) / 10, min, ok: contrast(fg, bg) >= min }));
}
