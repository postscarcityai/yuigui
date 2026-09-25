// Looks: the YL theme sets and the contrast guard, in JavaScript.
// A port of the app's AgentLook.swift (postscarcityai/yui, Yui/Sources/Theme),
// used by the playground to draw an app restyle (spec/YL.md, theme app) and by
// the conformance runner to check that every look it makes passes WCAG AA.
// Pure, dependency free.

// Named sets, in picker order. Same values as AgentLook.sets in the app.
export const SETS = {
  yui: { accent: "#FF7E8A", bg: "#FFF9F0", radius: "yui" },
  candy: { accent: "#FF5FAE", bg: "#FFF1F7", radius: "round" },
  berry: { accent: "#B8336A", bg: "#FCF2F6", radius: "soft", weight: "bold" },
  cherry: { accent: "#D7263D", bg: "#FFF3F3", radius: "round", motion: "snappy" },
  coral: { accent: "#FF6F7D", bg: "#FFF6F4", radius: "round" },
  sunset: { accent: "#F2663A", bg: "#FFF4EC", radius: "soft", motion: "snappy" },
  peach: { accent: "#FF9466", bg: "#FFF7F1", radius: "round" },
  autumn: { accent: "#C8642B", bg: "#F7F0E6", radius: "soft", font: "serif", weight: "bold", motion: "calm" },
  honey: { accent: "#D98E04", bg: "#FFF8EC", radius: "round", motion: "calm" },
  lemon: { accent: "#E5B800", bg: "#FFFBEA", radius: "round" },
  lime: { accent: "#8CC63F", bg: "#F7FBEF", radius: "round", motion: "snappy" },
  matcha: { accent: "#7FA650", bg: "#F6F8EF", radius: "round", motion: "calm" },
  forest: { accent: "#2F7D4F", bg: "#F2F6F1", radius: "soft", font: "default", weight: "bold", motion: "calm" },
  mint: { accent: "#2FB58C", bg: "#F0FAF6", radius: "round" },
  teal: { accent: "#0E9AA7", bg: "#EFF9FA", radius: "soft" },
  sky: { accent: "#4AA8F0", bg: "#F2F8FF", radius: "round" },
  ocean: { accent: "#1E86C8", bg: "#F1F7FC", radius: "soft", font: "default", weight: "bold", motion: "calm" },
  midnight: { accent: "#5B6CFF", bg: "#F1F2FF", radius: "soft", font: "default", weight: "bold", motion: "snappy" },
  lavender: { accent: "#9B87F5", bg: "#F7F4FF", radius: "round" },
  grape: { accent: "#8E44C8", bg: "#F8F2FD", radius: "round", weight: "bold" },
  slate: { accent: "#56657F", bg: "#F3F5F8", radius: "soft", font: "default", weight: "bold", motion: "calm" },
  mono: { accent: "#4A4A4A", bg: "#FFFFFF", radius: "square", font: "default", weight: "bold", motion: "snappy" },
  wizard: { accent: "#7B5CFF", bg: "#F6F4FF", radius: "soft", font: "serif", weight: "bold", motion: "calm" },
  coach: { accent: "#FF5A36", bg: "#FFF6F2", radius: "square", font: "default", weight: "heavy", motion: "snappy" },
  zen: { accent: "#4E9A6B", bg: "#F5F8F2", radius: "round", font: "serif", weight: "regular", motion: "calm" },
  studio: { accent: "#2F7BFF", bg: "#F3F7FF", radius: "round", font: "rounded", weight: "heavy", motion: "bouncy" },
  night: { accent: "#8A7CF0", bg: "#F7F5FF", radius: "round", font: "serif", weight: "bold", motion: "calm" },
  counsel: { accent: "#1F3A68", bg: "#FAF8F3", radius: "square", font: "serif", weight: "bold", motion: "calm" },
};
export const PAPERS = { cream: "#FFF9F0", paper: "#FBFAF7", white: "#FFFFFF", mist: "#F3F6FA", sand: "#F7F0E6", blush: "#FFF1F3" };
export const RADII = ["round", "soft", "square"];
export const FONTS = ["rounded", "default", "serif", "mono"];
export const WEIGHTS = ["regular", "bold", "heavy"];
export const MOTIONS = ["bouncy", "calm", "snappy"];

// WCAG AA with a little headroom, so rounding to 8-bit hex never lands a
// hair under the line. Same numbers as AgentLook.Guard.
export const GUARD = { text: 4.6, control: 3.1 };
// The lines themselves, what the checks below hold every look to.
export const AA = { text: 4.5, control: 3 };

// Yui's own shipped look, pixel for pixel (YuiTheme.yui). It is the default
// and what `theme app reset` goes back to; the guard checks asked looks only.
export const YUI = {
  name: "yui",
  light: { background: "#FFF9F0", surface: "#FFFFFF", ink: "#3A3340", inkSoft: "#6E6478", outline: "#F0E4D6", accent: "#FF7E8A", onAccent: "#3A3340", userBubble: "#FFA8B0", userInk: "#3A3340", agentBubble: "#FFFFFF", agentInk: "#3A3340" },
  dark: { background: "#231D33", surface: "#2F2842", ink: "#F6EEF7", inkSoft: "#A99FB8", outline: "#3D3452", accent: "#FF7E8A", onAccent: "#2A2238", userBubble: "#F28D97", userInk: "#2A2238", agentBubble: "#352D4A", agentInk: "#F6EEF7" },
  radius: "yui", font: "rounded", weight: "heavy", motion: "bouncy", adjusted: { light: [], dark: [] },
};

// ---------- color math (sRGB, WCAG 2 relative luminance) ----------

export function rgb(hex) {
  const m = /^#?([0-9a-f]{6})$/i.exec(String(hex || ""));
  if (!m) return null;
  const v = parseInt(m[1], 16);
  return { r: ((v >> 16) & 255) / 255, g: ((v >> 8) & 255) / 255, b: (v & 255) / 255 };
}

function fromHSL(h, s, l) {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const hp = (((h % 360) + 360) % 360) / 60;
  const x = c * (1 - Math.abs((hp % 2) - 1));
  const [r, g, b] = hp < 1 ? [c, x, 0] : hp < 2 ? [x, c, 0] : hp < 3 ? [0, c, x] : hp < 4 ? [0, x, c] : hp < 5 ? [x, 0, c] : [c, 0, x];
  const m = l - c / 2;
  return { r: r + m, g: g + m, b: b + m };
}

export function hex(c) {
  const p = (v) => Math.round(Math.min(1, Math.max(0, v)) * 255).toString(16).toUpperCase().padStart(2, "0");
  return "#" + p(c.r) + p(c.g) + p(c.b);
}

function hsl({ r, g, b }) {
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2;
  if (mx === mn) return { h: 0, s: 0, l };
  const d = mx - mn;
  const s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn);
  const h = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return { h: h * 60, s, l };
}

function luminance({ r, g, b }) {
  const lin = (v) => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4));
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

// Contrast ratio of two colors (objects or hex strings), 1 to 21.
export function contrast(a, b) {
  const x = luminance(typeof a === "string" ? rgb(a) : a);
  const y = luminance(typeof b === "string" ? rgb(b) : b);
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}

const WHITE = { r: 1, g: 1, b: 1 };
const withL = (c, l) => { const x = hsl(c); return fromHSL(x.h, x.s, Math.min(1, Math.max(0, l))); };
function darken(c, ok) { let l = hsl(c).l; while (!ok(c) && l > 0) { l -= 0.01; c = withL(c, l); } return c; }
function lighten(c, ok) { let l = hsl(c).l; while (!ok(c) && l < 1) { l += 0.01; c = withL(c, l); } return c; }
const movedAway = (c, bg, min) => (luminance(bg) > 0.18 ? darken(c, (x) => contrast(x, bg) >= min) : lighten(c, (x) => contrast(x, bg) >= min));
function readable(c, bgs, min) {
  const ok = (x) => bgs.every((b) => contrast(x, b) >= min);
  if (ok(c)) return c;
  const avg = bgs.reduce((s, b) => s + luminance(b), 0) / bgs.length;
  return avg > 0.18 ? darken(c, ok) : lighten(c, ok);
}
const better = (opts, bg) => opts.reduce((a, b) => (contrast(b, bg) > contrast(a, bg) ? b : a));

// ---------- compiling a look ----------

// A recipe ({accent, bg?, radius, font, weight, motion}) into a light and a
// dark palette, the way AgentLook.compile does it. `adjusted` names, per mode,
// the colors the guard had to move from what was asked.
export function compile(r, name = "custom") {
  const accent = rgb(r.accent) || rgb("#FF7E8A");
  const { h, s: sat } = hsl(accent);
  let paper = rgb(r.bg) || fromHSL(h, 0.7, 0.975);
  if (hsl(paper).l < 0.93) paper = withL(paper, 0.93);
  const adjusted = { light: [], dark: [] };

  const palette = (dark) => {
    const mode = dark ? "dark" : "light";
    const bg = dark ? fromHSL(h, Math.min(0.32, sat), 0.13) : paper;
    const surface = dark ? fromHSL(h, Math.min(0.26, sat), 0.19) : fromHSL(h, 0.5, 0.995);
    const outline = dark ? fromHSL(h, Math.min(0.22, sat), 0.28) : fromHSL(h, Math.min(0.45, sat), 0.9);
    const darkInk = fromHSL(h, Math.min(0.3, sat), 0.15);
    const ink = readable(dark ? fromHSL(h, Math.min(0.35, sat), 0.95) : fromHSL(h, Math.min(0.22, sat), 0.22), [bg, surface], GUARD.text);
    const inkSoft = readable(dark ? fromHSL(h, 0.14, 0.7) : fromHSL(h, 0.1, 0.46), [bg, surface], GUARD.text);
    // Accent: a control against the paper (3:1) that also carries text (4.5:1).
    let acc = movedAway(accent, bg, GUARD.control);
    let onAccent = better([WHITE, darkInk], acc);
    if (contrast(onAccent, acc) < GUARD.text) {
      acc = dark ? lighten(acc, (x) => contrast(darkInk, x) >= GUARD.text) : darken(acc, (x) => contrast(WHITE, x) >= GUARD.text);
      onAccent = better([WHITE, darkInk], acc);
    }
    if (hex(acc) !== hex(accent)) adjusted[mode].push("accent");
    const userBubble = dark ? fromHSL(h, Math.max(0.45, Math.min(0.8, sat)), 0.72) : fromHSL(h, Math.max(0.5, Math.min(0.9, sat)), 0.86);
    const userInk = readable(darkInk, [userBubble], GUARD.text);
    const agentBubble = dark ? fromHSL(h, Math.min(0.24, sat), 0.22) : surface;
    const agentInk = readable(ink, [agentBubble], GUARD.text);
    return {
      background: hex(bg), surface: hex(surface), ink: hex(ink), inkSoft: hex(inkSoft), outline: hex(outline),
      accent: hex(acc), onAccent: hex(onAccent), userBubble: hex(userBubble), userInk: hex(userInk),
      agentBubble: hex(agentBubble), agentInk: hex(agentInk),
    };
  };

  return {
    name,
    light: palette(false),
    dark: palette(true),
    radius: RADII.includes(r.radius) || r.radius === "yui" ? r.radius : "soft",
    font: FONTS.includes(r.font) ? r.font : "rounded",
    weight: WEIGHTS.includes(r.weight) ? r.weight : "heavy",
    motion: MOTIONS.includes(r.motion) ? r.motion : "bouncy",
    adjusted,
  };
}

// The look a `theme app` line asks for, on top of the look the app has now
// (`from`, a recipe; Yui's own when missing). A set name starts fresh from
// that set, keys change only what they say, reset is Yui's own look.
export function appLook(props, from = null) {
  if (props.name === "reset") return YUI;
  let r = props.name ? { ...SETS[props.name] } : { ...(from || SETS.yui) };
  if (props.accent) r.accent = SETS[props.accent] ? SETS[props.accent].accent : props.accent;
  if (props.bg) r.bg = PAPERS[props.bg] || props.bg;
  for (const k of ["radius", "font", "weight", "motion"]) if (props[k]) r[k] = props[k];
  if (r.radius === "yui" && !props.name) r.radius = "soft";
  return compile(r, props.name || "custom");
}

// The pairs the guard promises, with their ratio and the minimum each needs.
// Every pair of every look appLook makes must pass (the conformance runner
// checks this on each `look` vector).
export function checks(p) {
  return [
    ["ink on background", p.ink, p.background, AA.text],
    ["ink on surface", p.ink, p.surface, AA.text],
    ["soft ink on background", p.inkSoft, p.background, AA.text],
    ["accent on background", p.accent, p.background, AA.control],
    ["text on accent", p.onAccent, p.accent, AA.text],
    ["your bubble", p.userInk, p.userBubble, AA.text],
    ["agent bubble", p.agentInk, p.agentBubble, AA.text],
  ].map(([what, fg, bg, min]) => ({ what, ratio: Math.round(contrast(fg, bg) * 10) / 10, min, ok: contrast(fg, bg) >= min }));
}
