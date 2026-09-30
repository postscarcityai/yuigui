// The shader look (spec/SHADER.md, t_b8ab6ac3 step 1): one blob in the middle
// for every agent, and what the agent is doing shows in how the blob moves.
// This is the reference the app's Metal port will follow: the states, the
// word-to-state rule, the eased weights and the per-agent numbers.

export const ACTIONS = ["idle", "thinking", "reading", "running", "searching", "done"];

export const ACTION_INFO = {
  idle: { name: "Idle", motion: "Breathes slowly.", when: "Nothing is happening." },
  thinking: { name: "Thinking", motion: "The inside turns over itself.", when: "The working word, or a doing with no clue." },
  reading: { name: "Reading", motion: "A band of light sweeps down the blob, line after line.", when: "read, open, review, check, scan, look at" },
  running: { name: "Running", motion: "A steady beat sends rings outward.", when: "run, build, deploy, test, send, install, write, save" },
  searching: { name: "Searching", motion: "A small light circles the blob and the blob leans after it.", when: "search, find, look up, browse, fetch" },
  done: { name: "Done", motion: "One bright ring, then it settles.", when: "The reply arrives." },
};

// The verbs a `doing` line's words can start with, or hold. First hit wins,
// searching before reading (a "look up" is a search), anything else thinks.
const RULES = [
  ["searching", /\b(search|searching|find|finding|look(ing)? up|browse|browsing|fetch|fetching|crawl|scour)\b/i],
  ["reading", /\b(read|reading|open|opening|review|reviewing|check|checking|scan|scanning|look(ing)? (at|through|over)|skim|parse|parsing)\b/i],
  ["running", /\b(run|running|build|building|deploy|deploying|test|testing|send|sending|install|installing|writ(e|ing)|sav(e|ing)|compil(e|ing)|push|pushing|execut(e|ing)|render|rendering)\b/i],
];

// The state a doing line names. Null or empty: the agent is only thinking.
export function actionOf(doing) {
  const text = typeof doing === "string" ? doing : doing?.text;
  if (!text) return "thinking";
  for (const [name, re] of RULES) if (re.test(text)) return name;
  return "thinking";
}

// How fast a state's weight moves to its target, per second. A state comes in
// in about a third of a second and goes out a little slower, so two states
// overlap for a moment and the blob never snaps.
export const EASE = { in: 3.2, out: 2.2 };

// One step of the weights toward `target` (an ACTIONS name). `w` maps each
// state to 0..1; the result sums to 1.
export function easeWeights(w, target, dtSeconds) {
  const out = {};
  let sum = 0;
  for (const a of ACTIONS) {
    const goal = a === target ? 1 : 0;
    const rate = goal > (w[a] || 0) ? EASE.in : EASE.out;
    const k = 1 - Math.exp(-rate * Math.max(0, dtSeconds));
    out[a] = (w[a] || 0) + (goal - (w[a] || 0)) * k;
    sum += out[a];
  }
  if (sum > 0) for (const a of ACTIONS) out[a] /= sum;
  return out;
}

export const startWeights = () => Object.fromEntries(ACTIONS.map((a) => [a, a === "idle" ? 1 : 0]));

// The uniform per-agent numbers, on the one blob. Every agent has the same
// six knobs and stays inside the same narrow range, so a new agent is a row
// here and nothing else. `set` names the theme set the colors come from.
//   size    blob radius, 1 is the base
//   wobble  how far the edge wanders, 1 is the base
//   pace    the clock: slow 0.8, even 1, quick 1.2 (a default never runs quick)
//   grain   film grain over the blob, 0..0.1
//   glow    the halo, 1 is the base
export const KNOBS = {
  size: [0.9, 1.1],
  wobble: [0.6, 1.4],
  pace: [0.75, 1.2],
  grain: [0, 0.1],
  glow: [0.7, 1.3],
};

export const LOOKS_BY_AGENT = {
  yui: { name: "Yui", set: "yui", size: 1, wobble: 1, pace: 1, grain: 0.04, glow: 1 },
  arnold: { name: "Arnold", set: "honey", size: 1.04, wobble: 0.8, pace: 1.1, grain: 0.05, glow: 1 },
  basil: { name: "Basil", set: "mint", size: 1, wobble: 1.1, pace: 0.85, grain: 0.05, glow: 1.1 },
  gouda: { name: "Gouda", set: "lavender", size: 1, wobble: 1, pace: 1, grain: 0.07, glow: 1 },
  penny: { name: "Penny", set: "peach", size: 0.96, wobble: 0.7, pace: 0.85, grain: 0.03, glow: 0.9 },
  quill: { name: "Quill", set: "sky", size: 0.98, wobble: 1.15, pace: 0.9, grain: 0.04, glow: 1 },
};

// Every agent's knobs sit inside the ranges above; a look outside them is not uniform.
export function withinKnobs(look) {
  return Object.entries(KNOBS).every(([k, [lo, hi]]) => look[k] >= lo && look[k] <= hi);
}

// The hook for later: agents do not speak yet. When they do, `voice` (0..1,
// the same follower as spec/VISUAL.md section 4) drives the blob's size and
// the edge, and the inside brightens. It is one number in, nothing else.
export const AUDIO_HOOK = { uniform: "u_voice", drives: ["size", "edge", "inner light"], from: "the agent's voice, through the look's envelope" };
