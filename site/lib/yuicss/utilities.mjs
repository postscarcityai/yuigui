// yuicss layer 3, the part a renderer needs: arbitrary values.
//
// Tailwind lets a class carry its own value: `h-[62%]`, `w-[220px]`,
// `bg-[--accent-200]`. CSS cannot do that on its own, so the renderer turns
// such a class into an inline style with styleFor(). Colors are only ever
// tokens (a bare hex is refused), so contrast holds whatever the agent writes.
// Pure, dependency free.

// class prefix -> CSS property (or properties)
export const ARBITRARY = {
  w: ["width"], h: ["height"], size: ["width", "height"],
  "min-w": ["min-width"], "min-h": ["min-height"], "max-w": ["max-width"], "max-h": ["max-height"],
  p: ["padding"], px: ["padding-left", "padding-right"], py: ["padding-top", "padding-bottom"],
  pt: ["padding-top"], pr: ["padding-right"], pb: ["padding-bottom"], pl: ["padding-left"],
  m: ["margin"], mx: ["margin-left", "margin-right"], my: ["margin-top", "margin-bottom"],
  mt: ["margin-top"], mr: ["margin-right"], mb: ["margin-bottom"], ml: ["margin-left"],
  gap: ["gap"], top: ["top"], right: ["right"], bottom: ["bottom"], left: ["left"], inset: ["inset"],
  text: ["font-size"], leading: ["line-height"], tracking: ["letter-spacing"], rounded: ["border-radius"],
  z: ["z-index"], opacity: ["opacity"], basis: ["flex-basis"], grid: ["grid-template-columns"],
  rotate: ["rotate"], scale: ["scale"], delay: ["animation-delay"], duration: ["animation-duration"],
  bg: ["background-color"], "text-color": ["color"], border: ["border-color"], fill: ["fill"], stroke: ["stroke"],
};

const COLOR = new Set(["bg", "text-color", "border", "fill", "stroke"]);
// A length or a number: 62%, 220px, 1.5rem, 40vh, 3, -8px, 2/3 (a fraction of the parent).
const LENGTH = /^-?\d*\.?\d+(px|%|rem|em|vh|vw|dvh|ch|deg|ms|s)?$|^-?\d+\/\d+$/;
// A color is a token name (accent, accent-200, good, muted) or a --var of one.
const TOKEN = /^(--)?(paper|surface|ink|muted|line|accent(-ink|-text|-\d{2,3})?|(good|warn|bad)(-ink|-text|-soft)?)$/;

// "h-[62%]" -> { "height": "62%" }; "bg-[accent-200]" -> { "background-color": "var(--accent-200)" }.
// Anything it does not understand returns null, so a renderer leaves the class alone.
export function styleFor(cls) {
  const m = /^(-?)([a-z-]+?)-\[(.+)\]$/.exec(String(cls || ""));
  if (!m) return null;
  const [, neg, key0, raw] = m;
  // `text-[accent]` is a color, `text-[13px]` a size.
  const key = key0 === "text" && TOKEN.test(raw.replace(/^--/, "")) ? "text-color" : key0;
  const props = ARBITRARY[key];
  if (!props) return null;
  let val = raw.trim();
  if (COLOR.has(key)) {
    if (!TOKEN.test(val)) return null;
    val = `var(--${val.replace(/^--/, "")})`;
  } else {
    if (!LENGTH.test(val)) return null;
    if (/^-?\d+\/\d+$/.test(val)) { const [a, b] = val.split("/").map(Number); val = `${Math.round((a / b) * 10000) / 100}%`; }
    else if (/^-?\d+$/.test(val) && !["z", "opacity", "scale", "grid"].includes(key)) val = `${val}px`;
    if (key === "grid") val = `repeat(${val}, minmax(0, 1fr))`;
    if (key === "rotate" && !/deg$/.test(val)) val = `${parseFloat(val)}deg`;
    if (neg) val = val.startsWith("-") ? val.slice(1) : `-${val}`;
  }
  return Object.fromEntries(props.map((p) => [p, val]));
}

// Every arbitrary class in a class list, as one style object, plus the classes left over.
export function splitClasses(list) {
  const style = {}, rest = [];
  for (const c of String(list || "").split(/\s+/).filter(Boolean)) {
    const s = styleFor(c);
    if (s) Object.assign(style, s); else rest.push(c);
  }
  return { style, classes: rest };
}
