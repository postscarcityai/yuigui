// The shader look (spec/SHADER.md): the doing word to state rule, the eased weights and the agent knobs.
//   node site/lib/visual/action.test.mjs     exit 1 on any failure
import { ACTIONS, ACTION_INFO, KNOBS, LOOKS_BY_AGENT, actionOf, easeWeights, startWeights, withinKnobs } from "./action.mjs";
import { ACTION_FRAGMENT } from "./actionshader.mjs";
import { SETS } from "../yl/look.mjs";

let bad = 0, n = 0;
const eq = (name, got, want) => {
  n++;
  if (JSON.stringify(got) !== JSON.stringify(want)) { bad++; console.log(`FAIL ${name}\n  got  ${JSON.stringify(got)}\n  want ${JSON.stringify(want)}`); }
};
const ok = (name, cond) => eq(name, !!cond, true);

eq("states", ACTIONS, ["idle", "thinking", "reading", "running", "searching", "done"]);
ok("every state says what it looks like", ACTIONS.every((a) => ACTION_INFO[a].motion && ACTION_INFO[a].when));

eq("no doing thinks", actionOf(null), "thinking");
eq("empty text thinks", actionOf({ text: "" }), "thinking");
eq("reading a document", actionOf({ text: "Reading your calendar" }), "reading");
eq("a string works", actionOf("Reviewing the draft"), "reading");
eq("running a command", actionOf({ text: "Running the tests" }), "running");
eq("building", actionOf({ text: "Building the site" }), "running");
eq("searching", actionOf({ text: "Searching the web" }), "searching");
eq("look up is a search", actionOf({ text: "Looking up flights" }), "searching");
eq("look at is reading", actionOf({ text: "Looking at your plate" }), "reading");
eq("no clue thinks", actionOf({ text: "Pondering" }), "thinking");

// The weights stay a mix that sums to 1 and reach the target.
let w = startWeights();
eq("starts idle", w.idle, 1);
for (let i = 0; i < 20; i++) w = easeWeights(w, "reading", 0.05);
ok("moves toward reading", w.reading > 0.6 && w.idle < 0.3);
eq("sums to 1", Math.round(Object.values(w).reduce((a, b) => a + b, 0) * 1e6) / 1e6, 1);
ok("passes through a mix, never a snap", easeWeights(startWeights(), "running", 0.016).running < 0.1);
for (let i = 0; i < 200; i++) w = easeWeights(w, "done", 0.05);
ok("settles on done", w.done > 0.99);

// Every agent is a row of the same six knobs, inside the same ranges, on a real theme set.
for (const [id, look] of Object.entries(LOOKS_BY_AGENT)) {
  ok(`${id} is inside the knob ranges`, withinKnobs(look));
  ok(`${id} names a real theme set`, SETS[look.set]);
  eq(`${id} has every knob`, Object.keys(KNOBS).every((k) => typeof look[k] === "number"), true);
}
ok("the outlier fails the check", !withinKnobs({ size: 2, wobble: 1, pace: 1, grain: 0, glow: 1 }));
ok("Basil is no longer a bloom: same knobs as the rest", Object.keys(LOOKS_BY_AGENT.basil).sort().join() === Object.keys(LOOKS_BY_AGENT.yui).sort().join());
ok("the shader reads every uniform the knobs and states name", ["u_think", "u_read", "u_run", "u_search", "u_done", "u_since", "u_size", "u_wobble", "u_grain", "u_glow", "u_voice"].every((u) => ACTION_FRAGMENT.includes(u)));

console.log(bad ? `${bad} of ${n} failed` : `all ${n} passed`);
process.exit(bad ? 1 : 0);
