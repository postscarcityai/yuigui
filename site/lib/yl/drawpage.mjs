// draw (spec/YL.md, draw): the page a drawing runs in. The agent's own markup (SVG,
// with CSS or a script to move it) goes in a box of its own: a sandboxed frame with a
// content policy that allows nothing but what is written inline, so it cannot fetch,
// open or send anything. The page gives it the agent's colors as CSS variables and
// classes, a blueprint's line defaults and four words of motion (draw, pop, fade,
// pulse). Pure: the web renderer (app/playground/drawing.js) builds its frame from it.
// The app's reference is DrawPage in the yui repo (Yui/Sources/Presets/DrawPreset.swift);
// keep the two the same.

// Nothing loads from anywhere: only what the drawing wrote inline runs.
export const DRAW_POLICY = "default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; img-src data:; font-src data:";

// The color names a drawing can use, as var(--name), .name (stroke) and .fill-name (fill).
export const DRAW_COLORS = ["ink", "soft", "accent", "mint", "lavender", "butter", "good", "bad"];

const clamp = (r) => Math.min(Math.max(r, 0.7), 4);
const nums = (s, sep) => String(s).split(sep).filter(Boolean).map(Number).filter((n) => Number.isFinite(n));

// Width over height: `ratio=16:9` (or `4/3`, or `1.6`), else the SVG's own viewBox, else 4:3.
// Kept between a tall 7:10 and a wide 4:1, so a wrong number never makes a sliver or a strip.
export function drawRatio(said, source) {
  if (said !== undefined && said !== null && said !== "") {
    const p = typeof said === "number" ? [said] : nums(said, /[:/]/);
    if (p.length === 2 && p[0] > 0 && p[1] > 0) return clamp(p[0] / p[1]);
    if (p.length === 1 && p[0] > 0) return clamp(p[0]);
  }
  const m = /viewBox\s*=\s*["']([^"']+)["']/.exec(String(source || ""));
  if (m) {
    const n = nums(m[1], /[ ,]/);
    if (n.length === 4 && n[2] > 0 && n[3] > 0) return clamp(n[2] / n[3]);
  }
  return 4 / 3;
}

// A color value fit to sit in a style rule: no way out of the declaration.
const safe = (v, fallback) => {
  const s = String(v ?? "").trim();
  return s && !/[;{}<>"\\]/.test(s) ? s : fallback;
};

// Dark-screen colors, used for any the host does not give.
export const DRAW_DEFAULTS = {
  ink: "#eceef6", soft: "#9aa0b8", accent: "#8b7cff", mint: "#199e8f", lavender: "#8b7cff",
  butter: "#c98500", good: "#3fbf8a", bad: "#ff7a6b", ground: "#0f1019",
};

// The whole page for a frame's srcdoc. `colors`: {ink, soft, accent, mint, lavender,
// butter, good, bad, ground}; `dark` sets the color scheme; `still` (Reduce Motion)
// shows the drawing finished.
export function drawPage(source, colors = {}, { dark = true, still = false } = {}) {
  const c = Object.fromEntries(Object.entries(DRAW_DEFAULTS).map(([k, d]) => [k, safe(colors[k], d)]));
  const vars = Object.entries(c).map(([k, v]) => `--${k}:${v}`).join(";");
  const stroke = DRAW_COLORS.map((k) => `.${k}{stroke:var(--${k})}`).join("");
  const fill = [...DRAW_COLORS, "ground"].map((k) => `.fill-${k}{fill:var(--${k})}`).join("");
  const textFill = DRAW_COLORS.filter((k) => k !== "ink").map((k) => `svg text.${k}{fill:var(--${k})}`).join("");
  return `<!doctype html><html><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta http-equiv="Content-Security-Policy" content="${DRAW_POLICY}">
<style>
:root{${vars};color-scheme:${dark ? "dark" : "light"}}
html,body{margin:0;padding:0;height:100%;background:transparent;color:var(--ink);overflow:hidden;
  font:600 15px -apple-system,system-ui,sans-serif;-webkit-user-select:none;user-select:none;-webkit-text-size-adjust:none}
body>svg,body>canvas{display:block;width:100%;height:100%;overflow:visible}
:where(svg text){fill:var(--ink);stroke:none;font-family:-apple-system,system-ui,sans-serif}
:where(svg :is(path,line,polyline,polygon,rect,circle,ellipse):not([fill])){fill:none}
:where(svg :is(path,line,polyline,polygon,rect,circle,ellipse):not([stroke])){stroke:var(--ink);stroke-width:1.5}
:where(svg :is(path,line,polyline,polygon,rect,circle,ellipse)){stroke-linecap:round;stroke-linejoin:round}
${stroke}
${fill}
svg text:is(${DRAW_COLORS.map((k) => `.${k}`).join(",")}){stroke:none}
${textFill}
.dash{stroke-dasharray:5 5}
.draw,.pop,.fade{animation-delay:calc(var(--i,0)*.22s + .1s);animation-fill-mode:both}
.draw{animation-name:yui-draw;animation-duration:.8s;animation-timing-function:ease-in-out}
.pop{animation-name:yui-pop;animation-duration:.5s;animation-timing-function:cubic-bezier(.3,1.6,.5,1);transform-box:fill-box;transform-origin:center}
.fade{animation-name:yui-fade;animation-duration:.5s;animation-timing-function:ease-out}
.pulse{animation:yui-pulse 2.2s ease-in-out infinite;animation-delay:calc(var(--i,0)*.22s + .6s);transform-box:fill-box;transform-origin:center}
@keyframes yui-draw{from{stroke-dashoffset:var(--len,1000)}to{stroke-dashoffset:0}}
@keyframes yui-pop{from{opacity:0;transform:scale(.4)}to{opacity:1;transform:scale(1)}}
@keyframes yui-fade{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
@keyframes yui-pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.08)}}
${still ? "*{animation:none!important;transition:none!important}" : ""}
</style></head><body>
${source}
<script>
(function(){var i=0;document.querySelectorAll('.draw,.pop,.fade,.pulse').forEach(function(e){
  e.style.setProperty('--i',i++);
  if(e.classList.contains('draw')&&e.getTotalLength){var n=Math.ceil(e.getTotalLength());
    e.style.setProperty('--len',n);if(!${still}){e.style.strokeDasharray=n}}
})})();
</script></body></html>`;
}

// The drawing in words, where a picture cannot go (a screen reader, Telegram): its
// caption, or its title, or nothing.
export function drawWords(p = {}) {
  return String(p.caption || "").trim() || String(p.title || "").trim();
}
