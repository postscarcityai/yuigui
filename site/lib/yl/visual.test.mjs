// The visual (spec/VISUAL.md, YUI-124): colors, the level follower, the scrim and the plan.
//   node site/lib/yl/visual.test.mjs     exit 1 on any failure
import { apply, initialState, parse, visualOf } from "./yl.mjs";
import { BUDGET, DEFAULTS, ENVELOPES, LOOKS, VISUAL_LOOKS, envelope, follow, levelOf, scrimFor, themeAccent, visualColors, visualLabel, visualPlan, visualTone } from "./visual.mjs";
import { SETS, contrast, rgb } from "./look.mjs";

let bad = 0, n = 0;
const eq = (name, got, want) => {
  n++;
  if (JSON.stringify(got) !== JSON.stringify(want)) { bad++; console.log(`FAIL ${name}\n  got  ${JSON.stringify(got)}\n  want ${JSON.stringify(want)}`); }
};
const ok = (name, cond) => eq(name, !!cond, true);

// Every look in the parser has words, and the other way round.
eq("looks match the parser", Object.keys(LOOKS), VISUAL_LOOKS);
eq("defaults", DEFAULTS, { look: "orb", tone: "accent", react: "voice" });

// Colors come from the agent's look.
eq("no look is Yui's coral", themeAccent({}), "#FF7E8A");
eq("a set's accent", themeAccent({ name: "mint" }), SETS.mint.accent);
eq("accent= a hex wins over the set", themeAccent({ name: "mint", accent: "#7b5cff" }), "#7B5CFF");
eq("accent= a set name", themeAccent({ accent: "sky" }), SETS.sky.accent);
eq("tone accent is the agent's", visualTone("accent", { name: "forest" }), SETS.forest.accent);
eq("tone missing is the agent's", visualTone(undefined, { name: "forest" }), SETS.forest.accent);
eq("tone a set", visualTone("lavender", { name: "forest" }), SETS.lavender.accent);
eq("tone a hex", visualTone("#ff6b3d"), "#FF6B3D");

for (const dark of [true, false]) {
  for (const set of Object.keys(SETS)) {
    const c = visualColors(SETS[set].accent, dark);
    ok(`${set} ${dark ? "dark" : "light"}: three valid colors`, [c.a, c.b, c.c].every((h) => rgb(h)));
    // Alone, the visual is a picture: it only has to read against its ground a little.
    ok(`${set} ${dark ? "dark" : "light"}: the tone shows on the ground`, contrast(c.a, c.ground) >= 1.4);
  }
}

// Never fights the words: behind a chunk, the ink reads at AA over any pixel.
for (const dark of [true, false]) {
  for (const set of Object.keys(SETS)) {
    const c = visualColors(SETS[set].accent, dark);
    const a = scrimFor(c, BUDGET.behindDim);
    ok(`${set} ${dark ? "dark" : "light"}: a scrim under 0.92 holds AA (${a})`, a < 0.92);
  }
}
eq("no dim over the ground needs no scrim", scrimFor({ a: "#231D33", b: "#231D33", c: "#231D33", ground: "#231D33", ink: "#F6EEF7" }, 1), 0);
ok("a bright color on dark needs a scrim", scrimFor(visualColors("#FFE14D", true), 1) > 0);
ok("dimmed needs less than full", scrimFor(visualColors("#FFE14D", true), BUDGET.behindDim) <= scrimFor(visualColors("#FFE14D", true), 1));

// The level follows the sound in the look's pulse.
eq("beat envelope at even pace", envelope({ pulse: "beat", pace: "even" }), ENVELOPES.beat);
eq("soft at slow pace takes longer", envelope({ pulse: "soft", pace: "slow" }).release, Math.round(900 * 1.4));
eq("unknown pulse is beat", envelope({}).attack, 25);
eq("still never moves", follow(0.5, 1, 16, envelope({ pulse: "still" })), 0);
const beat = envelope({ pulse: "beat", pace: "even" });
const soft = envelope({ pulse: "soft", pace: "even" });
ok("beat rises faster than soft", follow(0, 1, 16, beat) > follow(0, 1, 16, soft));
ok("beat falls faster than soft", follow(1, 0, 50, beat) < follow(1, 0, 50, soft));
eq("tick moves in quarters", [0.1, 0.4, 0.7, 1].map((x) => follow(x, x, 1000, envelope({ pulse: "tick" })) * 4 % 1), [0, 0, 0, 0]);
eq("input is clamped", follow(0, 5, 1e6, beat), 1);
eq("no time, no change", follow(0.3, 1, 0, beat), 0.3);
eq("silence is 0", levelOf(new Float32Array(512)), 0);
ok("a voice sits in the middle", (() => { const s = new Float32Array(512).map((_, i) => 0.045 * Math.sin(i / 7)); const l = levelOf(s); return l > 0.3 && l < 0.7; })());
eq("full scale is 1", levelOf(new Float32Array(64).fill(1)), 1);

// The plan.
eq("no visual, no plan", visualPlan(null), null);
const p = visualPlan({}, { theme: { name: "mint" } });
eq("bare visual: orb, voice, the agent's color", [p.look, p.react, p.tone], ["orb", "voice", SETS.mint.accent]);
eq("alone: full strength, no scrim, 60 fps", [p.dim, p.scrim, p.fps], [1, 0, BUDGET.aloneFps]);
const w = visualPlan({ look: "aurora" }, { theme: { name: "mint" }, words: true });
eq("behind words: dimmed, 30 fps", [w.dim, w.fps], [BUDGET.behindDim, BUDGET.behindFps]);
eq("behind words: the scrim is only what AA needs", w.scrim, scrimFor(w.colors, BUDGET.behindDim));
eq("the scrim covers the words' zone", w.zone, BUDGET.zone);
eq("calm agent moves slower", visualPlan({}, { theme: { motion: "calm" } }).speed < visualPlan({}, { theme: { motion: "snappy" } }).speed, true);
eq("calm agent swells softly", visualPlan({}, { theme: { motion: "calm" } }).env.attack, Math.round(ENVELOPES.soft.attack * 1.4));
eq("the look's words count too", visualPlan({}, { theme: { motion: "calm", pulse: "beat" } }).env.release, Math.round(260 * 1.4));
for (const [k, why] of [["reduced", "reduce-motion"], ["lowPower", "low-power"], ["hidden", "hidden"]]) {
  const s = visualPlan({ look: "bloom" }, { [k]: true });
  eq(`${k}: one still frame`, [s.still, s.fps, s.speed, s.env.gain, s.why], [true, 0, 0, 0, why]);
}
eq("hot is still", visualPlan({}, { thermal: "serious" }).why, "hot");
eq("warm drops to 30", visualPlan({}, { thermal: "fair" }).fps, 30);
eq("react off: it drifts, no level", [visualPlan({ react: "off" }).env.gain, visualPlan({ react: "off" }).fps], [0, 60]);
eq("grain renders sharper", visualPlan({ look: "grain" }).scale, BUDGET.grainScale);
eq("still keeps its scrim behind words", visualPlan({ look: "bloom" }, { reduced: true, words: true }).scrim > 0, true);
eq("label", visualLabel("aurora", "#2FB58C", "voice"), "Aurora, listening to your voice");
eq("label music", visualPlan({ look: "waves", react: "music" }).label, "Waves, moving with the music");

// The screen state keeps the newest visual; `visual off` clears it.
const run = (text) => { let s = initialState(); for (const op of parse(text)) s = apply(s, op); return s.visual ?? null; };
eq("state keeps the newest", run("visual orb\nvisual aurora tone=mint"), { look: "aurora", tone: "mint" });
eq("state off", run("visual orb\nvisual off"), null);
eq("state untouched by others", run("say hi"), null);
eq("visualOf and state agree", run("visual waves react=music"), visualOf(parse("visual waves react=music")));
eq("nothing lands on a screen", (() => { let s = initialState(); for (const op of parse("visual bloom")) s = apply(s, op); return s.screens["1"].length; })(), 0);

console.log(`${n - bad}/${n} visual tests pass`);
if (bad) process.exit(1);
