// The visual (spec/VISUAL.md, YUI-124): colors, the level follower, the scrim and the plan.
//   node site/lib/yl/visual.test.mjs     exit 1 on any failure
import { apply, initialState, parse, visualOf } from "./yl.mjs";
import { BUDGET, CREW_VISUALS, DEFAULTS, FALLBACK_VISUAL, STRENGTHS, stageVisual, ENVELOPES, LOOKS, VISUAL_LOOKS, envelope, follow, levelOf, shown, scrimFor, themeAccent, visualColors, visualLabel, visualPlan, visualTone } from "./visual.mjs";
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
eq("tick moves in quarters", [0.1, 0.4, 0.7, 1].map((x) => shown(follow(x, x, 1000, envelope({ pulse: "tick" })), envelope({ pulse: "tick" })) * 4 % 1), [0, 0, 0, 0]);
{
  // Rounded state used to stick at 0.25 after the sound stopped (YUI-125): it falls all the way now.
  const tick = envelope({ pulse: "tick" });
  let y = 1;
  for (let i = 0; i < 60; i++) y = follow(y, 0, 33, tick);
  eq("tick falls back to 0 when the sound stops", shown(y, tick), 0);
  eq("beat shows as is", shown(0.37, envelope({ pulse: "beat" })), 0.37);
}
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

// Every agent's own (YUI-180, VISUAL.md section 6): quiet by default.
eq("the crew's picks", Object.fromEntries(Object.entries(CREW_VISUALS).map(([k, v]) => [k, [v.look, v.hears]])),
  { yui: ["orb", "voice"], arnold: ["orb", "music"], basil: ["orb", "voice"], gouda: ["orb", "music"], penny: ["orb", "off"], quill: ["orb", "voice"] });
for (const [k, v] of Object.entries(CREW_VISUALS)) {
  ok(`${k}: a known look and react`, VISUAL_LOOKS.includes(v.look) && ["voice", "music", "mic", "off"].includes(v.hears));
  ok(`${k}: never full`, STRENGTHS[v.strength] <= BUDGET.behindDim);
}
eq("fallback is the soft orb", FALLBACK_VISUAL, { look: "orb", hears: "voice", strength: "faint", pace: "slow" });
const ops = (t) => parse(t);
eq("defaults resolve", stageVisual(CREW_VISUALS.arnold, ops("say hi")), { look: "orb", tone: "accent", react: "music", strength: 0.7, pace: "even", quiet: true });
eq("no pick: the fallback", stageVisual(null, []).look, "orb");
eq("no pick: faint", stageVisual(undefined, []).strength, STRENGTHS.faint);
eq("the agent's line wins", stageVisual(CREW_VISUALS.yui, ops("visual aurora react=voice\nsay hi")), { look: "aurora", react: "voice" });
eq("off sticks", stageVisual(CREW_VISUALS.yui, [...ops("visual off"), ...ops("say later"), ...ops("say much later")]), null);
eq("a new line after off", stageVisual(CREW_VISUALS.yui, [...ops("visual off"), ...ops("visual grain")]), { look: "grain" });
eq("the person's switch beats all", stageVisual(CREW_VISUALS.yui, ops("visual bloom"), true), null);
{
  const alone = visualPlan(stageVisual(CREW_VISUALS.yui, []), { theme: { name: "yui", motion: "bouncy" } });
  const behind = visualPlan(stageVisual(CREW_VISUALS.yui, []), { theme: { name: "yui", motion: "bouncy" }, words: true });
  const faint = visualPlan(stageVisual(CREW_VISUALS.quill, []), { theme: { name: "lavender" }, words: true });
  const asked = visualPlan({ look: "orb" }, { theme: { name: "yui", motion: "bouncy" } });
  eq("a default alone is dim", alone.dim, 0.7);
  eq("a default alone runs 30 fps", alone.fps, BUDGET.behindFps);
  eq("and 15 while nothing is heard", alone.idleFps, BUDGET.quietIdleFps);
  eq("the slower pace wins", [alone.pace, visualPlan(stageVisual(CREW_VISUALS.arnold, []), { theme: { name: "coach", motion: "snappy" } }).pace], ["slow", "even"]);
  ok("a default is slower than the agent's own pace", alone.speed < asked.speed);
  eq("behind words it sinks again", behind.dim, 0.49);
  eq("faint behind words", faint.dim, 0.315);
  ok("never behind text at full strength", behind.dim < BUDGET.behindDim && behind.scrim > 0);
  eq("an asked visual is unchanged", [asked.dim, asked.fps, asked.quiet], [1, BUDGET.aloneFps, false]);
  eq("still under Reduce Motion", visualPlan(stageVisual(CREW_VISUALS.gouda, []), { reduced: true }).fps, 0);
}

console.log(`${n - bad}/${n} visual tests pass`);
if (bad) process.exit(1);
