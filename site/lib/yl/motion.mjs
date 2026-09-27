// Stage motion (spec/YL.md section 5, YUI-120): how the stage moves with the
// agent. Two things decide every move:
//
//   the mood   what the agent is doing right now: listen, think, work,
//              found, done, ask, error. Read from the turn, with no effort
//              from the agent (stageMood, doingMood).
//   the look   who the agent is: its pace, its easing, how things come on
//              and how it breathes. Read from the agent's theme
//              (`theme motion=bouncy|calm|snappy`), and later from words the
//              person says about it (YUI-123 fills `custom`).
//
// Nothing here is new on the wire. Renderers turn a look into timings
// (motionVars) and a mood into which animation plays. Reduce Motion gets the
// still look: nothing moves, nothing breathes, every part in its last place.
// The app mirrors it in Swift (YUI-120 step 2). Pure, dependency free.

export const MOODS = ["idle", "listen", "think", "work", "found", "done", "ask", "error"];

// A doing line's words decide what kind of work it is, so the stage can show
// looking (a sweep) apart from making (a build-up). A doing that reports a
// find is the found beat.
const FOUND = /^(found|got|there(?:'s| is| are)|spotted|ready|done|all set|nailed)\b/i;
const SCAN = /\b(check|read|look|search|scan|find|fetch|pull|load|listen|watch|compar|ask|query|open|brows|review|count)\w*/i;
const MAKE = /\b(writ|draft|build|draw|mak|plan|compos|sketch|render|cook|mix|design|shap|lay|put|sav|send)\w*/i;

// doing props ({text?, step?, of?}) -> { mood: "work"|"found", flavor: "scan"|"make"|"work" }
export function doingMood(doing) {
  const t = String(doing?.text || "").trim();
  if (FOUND.test(t)) return { mood: "found", flavor: "found" };
  const scan = t.match(SCAN), make = t.match(MAKE);
  // The first verb wins: "Reading the notes to draft a plan" is looking.
  const flavor = scan && make ? (scan.index <= make.index ? "scan" : "make") : scan ? "scan" : make ? "make" : "work";
  return { mood: "work", flavor };
}

// The turn as the app sees it, newest facts first:
//   { failed, listening, asking, chunk, arrived, doing, sent }
// failed: the turn ended with an error (host error, or a reply of nothing but
// error lines). listening: the mic is open. asking: the questions screen is up.
// chunk: the index of the chunk on the stage (null before the reply plays).
// arrived: the reply just came in and the first chunk is about to play (one
// beat of found). doing: the newest doing props (doingOf), or null. sent: the
// person's words went out.
export function stageMood(turn = {}) {
  if (turn.failed) return { mood: "error", flavor: null };
  if (turn.listening) return { mood: "listen", flavor: null };
  if (turn.asking) return { mood: "ask", flavor: null };
  if (turn.chunk !== undefined && turn.chunk !== null) return { mood: "done", flavor: null };
  if (turn.arrived) return { mood: "found", flavor: "found" };
  if (turn.doing && !turn.doing.off) {
    if (!turn.doing.text) return { mood: "work", flavor: "work" };
    return doingMood(turn.doing);
  }
  if (turn.sent) return { mood: "think", flavor: null };
  return { mood: "idle", flavor: null };
}

// ---------- the look ----------

export const PACES = { slow: 1.4, even: 1, quick: 0.68 };
export const EASES = {
  float: "cubic-bezier(.45,0,.2,1)",
  spring: "cubic-bezier(.2,.9,.3,1.3)",
  sharp: "cubic-bezier(.3,0,0,1)",
  heavy: "cubic-bezier(.7,0,.2,1)",
};
export const ENTERS = ["rise", "pop", "slide", "drop", "fade"];
export const PULSES = { soft: 3.6, beat: 1.7, tick: 1.1, still: 0 };

// The three characters `theme motion=` already names, as looks.
export const CHARACTERS = {
  bouncy: { pace: "even", ease: "spring", enter: "pop", pulse: "beat" },
  calm: { pace: "slow", ease: "float", enter: "rise", pulse: "soft" },
  snappy: { pace: "quick", ease: "sharp", enter: "slide", pulse: "tick" },
};
export const STILL = { pace: "even", ease: "float", enter: "fade", pulse: "still", reduced: true };

// theme: the agent's look (`{motion}` from yui_agents.theme, or a set's
// defaults); custom: a partial look from the person's words (YUI-123), each
// key checked against its list and dropped when unknown. reduced: Reduce
// Motion, which always wins.
export function motionLook(theme = {}, custom = null, reduced = false) {
  if (reduced) return { ...STILL, character: "still" };
  const character = CHARACTERS[theme?.motion] ? theme.motion : "bouncy";
  const look = { ...CHARACTERS[character], character, reduced: false };
  if (custom && typeof custom === "object") {
    if (PACES[custom.pace] !== undefined) look.pace = custom.pace;
    if (EASES[custom.ease]) look.ease = custom.ease;
    if (ENTERS.includes(custom.enter)) look.enter = custom.enter;
    if (PULSES[custom.pulse] !== undefined) look.pulse = custom.pulse;
    if (Object.keys(custom).some((k) => ["pace", "ease", "enter", "pulse"].includes(k))) look.character = "custom";
  }
  return look;
}

// Base timings in ms at an even pace. A renderer scales them by the look.
export const BASE = { enter: 440, handoff: 360, stagger: 80, beat: 600, open: 520 };

// A look -> the numbers a renderer needs (and CSS custom properties for the web).
export function motionTimings(look) {
  if (look.reduced) return { enter: 0, handoff: 0, stagger: 0, beat: 0, open: 0, breath: 0, ease: "linear", fade: 160 };
  const k = PACES[look.pace] ?? 1;
  const t = Object.fromEntries(Object.entries(BASE).map(([n, v]) => [n, Math.round(v * k)]));
  return { ...t, breath: Math.round(PULSES[look.pulse] * 1000 * (k > 1 ? 1.1 : k < 1 ? 0.9 : 1)), ease: EASES[look.ease], fade: 160 };
}

export function motionVars(look) {
  const t = motionTimings(look);
  return {
    "--mo-enter": `${t.enter}ms`,
    "--mo-handoff": `${t.handoff}ms`,
    "--mo-stagger": `${t.stagger}ms`,
    "--mo-beat": `${t.beat}ms`,
    "--mo-open": `${t.open}ms`,
    "--mo-breath": `${t.breath || 1}ms`,
    "--mo-ease": t.ease,
  };
}
