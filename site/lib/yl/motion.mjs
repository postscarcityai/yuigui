// Stage motion (spec/YL.md section 5, YUI-120): how the stage moves with the
// agent. Two things decide every move:
//
//   the mood   what the agent is doing right now: listen, think, work,
//              found, done, ask, error. Read from the turn, with no effort
//              from the agent (stageMood, doingMood).
//   the look   who the agent is: its pace, its easing, how things come on
//              and how it breathes. Read from the agent's theme
//              (`theme motion=bouncy|calm|snappy`), with four keys on top
//              that come from the person's words (YUI-123:
//              `theme pace=quick ease=heavy enter=drop pulse=beat`).
//
// The wire carries only the look's keys, on the `theme` line. Renderers turn a look into timings
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

export const LOOK_KEYS = ["pace", "ease", "enter", "pulse"];
const known = { pace: (v) => PACES[v] !== undefined, ease: (v) => !!EASES[v], enter: (v) => ENTERS.includes(v), pulse: (v) => PULSES[v] !== undefined };

// theme: the agent's saved look (yui_agents.theme: `motion` names the
// character, `pace ease enter pulse` are the person's words on top of it);
// custom: a look being tried before it is saved. Each key is checked against
// its list and dropped when unknown; custom wins over theme, theme over the
// character. reduced: Reduce Motion, which always wins.
export function motionLook(theme = {}, custom = null, reduced = false) {
  if (reduced) return { ...STILL, character: "still" };
  const character = CHARACTERS[theme?.motion] ? theme.motion : "bouncy";
  const look = { ...CHARACTERS[character], character, reduced: false };
  let own = false;
  for (const src of [theme, custom]) {
    if (!src || typeof src !== "object") continue;
    for (const k of LOOK_KEYS) if (known[k](src[k])) { look[k] = src[k]; own = true; }
  }
  if (own) look.character = "custom";
  return look;
}

// ---------- words to a look (YUI-123) ----------

// How a person says an agent moves, as a small rule table. The agent does
// this with judgment ("make Arnold feel heavy and punchy" -> a theme line);
// the table is the reference, used by the playground and by any host that
// has no model at hand. Each key takes the first word in the description
// that sets it, so "heavy and punchy" is heavy first, then punchy's pace.
export const WORD_RULES = [
  [/\b(heav|weight|solid|stomp|thud|tank|massive|big|strong|power)\w*/i, { ease: "heavy", enter: "drop" }],
  [/\b(punch|hit|slam|bold|jab|kick)\w*/i, { pace: "quick", enter: "drop", pulse: "beat" }],
  [/\b(drift|float|glid|hover|cloud|feather|breez)\w*/i, { pace: "slow", ease: "float", enter: "rise", pulse: "soft" }],
  [/\b(water|flow|wave|liquid|ocean|stream|smooth|silk)\w*/i, { pace: "slow", ease: "float", enter: "fade", pulse: "soft" }],
  [/\b(quick|fast|zip|sharp|crisp|snap|brisk|nimble|swift|rapid)\w*/i, { pace: "quick", ease: "sharp", enter: "slide", pulse: "tick" }],
  [/\b(bounc|play|happy|spring|fun|cute|excit|energ|cheer|peppy|joy)\w*/i, { ease: "spring", enter: "pop", pulse: "beat" }],
  [/\b(elastic|rubber|jell|wobbl)\w*/i, { ease: "spring", enter: "pop" }],
  [/\b(calm|zen|quiet|peace|gentle|soft|relax|chill|sleep|lazy|dream)\w*/i, { pace: "slow", pulse: "soft" }],
  [/\b(slow|unhurried|patient|lazy)\w*/i, { pace: "slow" }],
  [/\b(steady|even|measured|normal|balanced)\w*/i, { pace: "even" }],
  [/\b(precise|robot|mechanic|clock|tick|machine)\w*/i, { ease: "sharp", pulse: "tick" }],
  [/\b(heartbeat|pulse|drum|beat|thump)\w*/i, { pulse: "beat" }],
  [/\b(still|stoic|serious|subtle|minimal|plain|no bounce|calm down)\w*/i, { enter: "fade", pulse: "still" }],
  [/\b(rise|rising|grow|bloom|lift)\w*/i, { enter: "rise" }],
  [/\b(pop|burst)\w*/i, { enter: "pop" }],
  [/\b(slide|swoosh|swipe|sweep)\w*/i, { enter: "slide" }],
  [/\b(drop|fall|land)\w*/i, { enter: "drop" }],
  [/\b(fade|ghost|mist|whisper|shy)\w*/i, { enter: "fade" }],
];

const NOT = /\b(no|not|never|without|less|don'?t|isn'?t|nothing)\s+(too\s+|so\s+|very\s+|much\s+)?$/i;

// words -> { look: {pace?, ease?, enter?, pulse?}, heard: [the words that
// counted] }, or null when nothing in them names a motion.
export function wordsLook(words) {
  const t = String(words || "");
  const hits = [];
  for (const [re, keys] of WORD_RULES) {
    // "no bounce", "not too fast": a word said with a no in front is skipped.
    const all = [...t.matchAll(new RegExp(re.source, "gi"))].filter((m) => !NOT.test(t.slice(Math.max(0, m.index - 16), m.index)));
    if (all.length) hits.push({ at: all[0].index, word: all[0][0].toLowerCase(), keys });
  }
  if (!hits.length) return null;
  hits.sort((a, b) => a.at - b.at);
  const look = {};
  const heard = [];
  for (const h of hits) {
    let used = false;
    for (const k of LOOK_KEYS) if (h.keys[k] && !(k in look)) { look[k] = h.keys[k]; used = true; }
    if (used && !heard.includes(h.word)) heard.push(h.word);
  }
  return { look: Object.fromEntries(LOOK_KEYS.filter((k) => k in look).map((k) => [k, look[k]])), heard };
}

// A look (or its words' part) -> the one line an agent writes to save it.
export function lookLine(look) {
  const keys = LOOK_KEYS.filter((k) => look && known[k](look[k])).map((k) => `${k}=${look[k]}`);
  return keys.length ? `theme ${keys.join(" ")}` : null;
}

// A look in a few plain words, for a row or a note: "quick, heavy, drops in, beats".
const SAY = {
  pace: { slow: "slow", even: "even", quick: "quick" },
  ease: { float: "floats", spring: "springs", sharp: "sharp", heavy: "heavy" },
  enter: { rise: "rises in", pop: "pops in", slide: "slides in", drop: "drops in", fade: "fades in" },
  pulse: { soft: "breathes long", beat: "beats", tick: "ticks", still: "holds still" },
};
export function lookWords(look) {
  if (look?.reduced) return "Reduce Motion: no movement";
  return LOOK_KEYS.map((k) => SAY[k][look?.[k]]).filter(Boolean).join(", ");
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
    // pulse=still does not breathe, but a sweep or a morph still needs a period.
    "--mo-breath": `${t.breath || (look.reduced ? 1 : 2400)}ms`,
    "--mo-ease": t.ease,
  };
}
