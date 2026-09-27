// Stage motion (YL.md section 5, YUI-120): moods from the turn, looks from the theme.
//   node site/lib/yl/motion.test.mjs     exit 1 on any failure
import { doingOf, parse } from "./yl.mjs";
import { doingMood, motionLook, motionTimings, motionVars, stageMood, STILL } from "./motion.mjs";

let bad = 0, n = 0;
const eq = (name, got, want) => {
  n++;
  if (JSON.stringify(got) !== JSON.stringify(want)) { bad++; console.log(`FAIL ${name}\n  got  ${JSON.stringify(got)}\n  want ${JSON.stringify(want)}`); }
};
const mood = (t) => stageMood(t).mood;

// The turn, in order, with no effort from the agent.
eq("nothing yet is idle", mood({}), "idle");
eq("the mic open is listen", mood({ listening: true }), "listen");
eq("sent with no doing is think", mood({ sent: true }), "think");
eq("a doing is work", mood({ sent: true, doing: { text: "Checking TestFlight", step: 1, of: 2 } }), "work");
eq("a bare step keeps work", stageMood({ sent: true, doing: { step: 2, of: 5 } }), { mood: "work", flavor: "work" });
eq("doing off goes back to think", mood({ sent: true, doing: { off: true } }), "think");
eq("the reply arriving is one found beat", mood({ sent: true, arrived: true, doing: { text: "Reading" } }), "found");
eq("a chunk on the stage is done", mood({ sent: true, chunk: 0 }), "done");
eq("chunk 0 is a chunk, not nothing", mood({ chunk: 0, doing: { text: "Reading" } }), "done");
eq("the questions screen is ask", mood({ chunk: 2, asking: true }), "ask");
eq("a failed turn is error, whatever else is true", mood({ failed: true, listening: true, asking: true }), "error");

// doing words pick the kind of work.
eq("checking is looking", doingMood({ text: "Checking TestFlight" }), { mood: "work", flavor: "scan" });
eq("reading is looking", doingMood({ text: "Reading your calendar" }), { mood: "work", flavor: "scan" });
eq("drafting is making", doingMood({ text: "Drafting the plan" }), { mood: "work", flavor: "make" });
eq("the first verb wins", doingMood({ text: "Reading the notes to draft a plan" }).flavor, "scan");
eq("making first wins too", doingMood({ text: "Building the deck from your notes" }).flavor, "make");
eq("plain words are work", doingMood({ text: "Thinking it over" }), { mood: "work", flavor: "work" });
eq("found words are found", doingMood({ text: "Found a dry window" }).mood, "found");
eq("got is found", doingMood({ text: "Got it: build 160" }).mood, "found");
eq("found only at the start", doingMood({ text: "Checking what I found" }).mood, "work");
eq("from real lines", doingMood(doingOf(parse(`doing "Reading your calendar" 1/3\ndoing "Found a dry window" 3/3`))).mood, "found");

// Looks from the theme.
eq("no theme is bouncy", motionLook({}).character, "bouncy");
eq("bouncy", motionLook({ motion: "bouncy" }), { pace: "even", ease: "spring", enter: "pop", pulse: "beat", character: "bouncy", reduced: false });
eq("calm", motionLook({ motion: "calm" }), { pace: "slow", ease: "float", enter: "rise", pulse: "soft", character: "calm", reduced: false });
eq("snappy", motionLook({ motion: "snappy" }), { pace: "quick", ease: "sharp", enter: "slide", pulse: "tick", character: "snappy", reduced: false });
eq("an unknown motion is bouncy", motionLook({ motion: "wobbly" }).character, "bouncy");
eq("words (YUI-123) override key by key", motionLook({ motion: "calm" }, { pace: "slow", ease: "heavy", enter: "drop", pulse: "beat" }), { pace: "slow", ease: "heavy", enter: "drop", pulse: "beat", character: "custom", reduced: false });
eq("unknown words are dropped", motionLook({ motion: "snappy" }, { pace: "glacial", enter: "spin" }), { pace: "quick", ease: "sharp", enter: "slide", pulse: "tick", character: "custom", reduced: false });
eq("Reduce Motion wins over everything", motionLook({ motion: "snappy" }, { pulse: "beat" }, true), { ...STILL, character: "still" });

// Timings follow the pace.
const t = (m) => motionTimings(motionLook({ motion: m }));
eq("calm is slower than bouncy", t("calm").enter > t("bouncy").enter, true);
eq("snappy is quicker than bouncy", t("snappy").enter < t("bouncy").enter, true);
eq("calm breathes slower than snappy", t("calm").breath > t("snappy").breath, true);
eq("still does not move", motionTimings(motionLook({}, null, true)), { enter: 0, handoff: 0, stagger: 0, beat: 0, open: 0, breath: 0, ease: "linear", fade: 160 });
eq("vars carry the easing", motionVars(motionLook({ motion: "snappy" }))["--mo-ease"], "cubic-bezier(.3,0,0,1)");

console.log(bad ? `${bad}/${n} failed` : `motion: ${n} ok`);
if (bad) process.exit(1);
