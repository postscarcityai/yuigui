// Brand colors for the 404 (SITE-104). Light uses deeper cuts of lavender, mint and butter so they read on cream;
// dark uses the dark theme's own. Each scene takes 2 or 3 hues and drifts between them.
import { pick } from "./rng.mjs";

export const HUES = {
  light: { coral: "#FF7E8A", lavender: "#9A83E0", mint: "#3FAE86", butter: "#E0A22A", ink: "#3A3340" },
  dark: { coral: "#FF7E8A", lavender: "#B8ABDD", mint: "#9FCDB9", butter: "#E6D08F", ink: "#F6EEF7" },
};
export const NAMES = ["coral", "lavender", "mint", "butter"];

export function chooseHues(rng) {
  const pool = NAMES.slice();
  const out = [];
  const k = rng() < 0.5 ? 2 : 3;
  while (out.length < k) out.push(pool.splice(Math.floor(rng() * pool.length), 1)[0]);
  return out;
}

const rgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
const mix = (a, b, t) => a.map((v, i) => Math.round(v + (b[i] - v) * t));
const css = (c, a = 1) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;

// Five paint slots: 0-2 the drifting accents, 3 faint ink, 4 solid ink.
export function colorsAt(names, theme, t) {
  const H = HUES[theme] || HUES.light;
  const k = names.length;
  const ink = rgb(H.ink);
  const out = [];
  for (let i = 0; i < 3; i++) {
    const a = rgb(H[names[i % k]]);
    const b = rgb(H[names[(i + 1) % k]]);
    out.push(css(mix(a, b, 0.5 + 0.5 * Math.sin(t * 0.18 + i * 2.1))));
  }
  out.push(css(ink, theme === "dark" ? 0.3 : 0.26), css(ink));
  return out;
}
export { pick };
