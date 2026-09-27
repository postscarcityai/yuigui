// Stage motion (YL.md section 5, YUI-120): moods from the turn, looks from the theme.
//   node site/lib/yl/motion.test.mjs     exit 1 on any failure
import { apply, doingOf, initialState, parse } from "./yl.mjs";
import { doingMood, EASES, ENTERS, LOOK_KEYS, lookLine, lookWords, motionLook, motionTimings, motionVars, PACES, PULSES, stageMood, STILL, wordsLook } from "./motion.mjs";
import { MOTION_KEYS, appLook, mergeTheme } from "./look.mjs";

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
eq("unknown words are dropped", motionLook({ motion: "snappy" }, { pace: "glacial", enter: "spin" }), { pace: "quick", ease: "sharp", enter: "slide", pulse: "tick", character: "snappy", reduced: false });
eq("Reduce Motion wins over everything", motionLook({ motion: "snappy" }, { pulse: "beat" }, true), { ...STILL, character: "still" });

// Timings follow the pace.
const t = (m) => motionTimings(motionLook({ motion: m }));
eq("calm is slower than bouncy", t("calm").enter > t("bouncy").enter, true);
eq("snappy is quicker than bouncy", t("snappy").enter < t("bouncy").enter, true);
eq("calm breathes slower than snappy", t("calm").breath > t("snappy").breath, true);
eq("still does not move", motionTimings(motionLook({}, null, true)), { enter: 0, handoff: 0, stagger: 0, beat: 0, open: 0, breath: 0, ease: "linear", fade: 160 });
eq("vars carry the easing", motionVars(motionLook({ motion: "snappy" }))["--mo-ease"], "cubic-bezier(.3,0,0,1)");

// A look made of words (YUI-123): saved on the theme, next to the colors.
eq("the four keys ride on the theme", motionLook({ motion: "calm", ease: "heavy", enter: "drop" }), { pace: "slow", ease: "heavy", enter: "drop", pulse: "soft", character: "custom", reduced: false });
eq("a trial look wins over the saved one", motionLook({ pace: "slow" }, { pace: "quick" }).pace, "quick");
eq("an unknown saved key is dropped", motionLook({ motion: "calm", pulse: "wobble" }), { pace: "slow", ease: "float", enter: "rise", pulse: "soft", character: "calm", reduced: false });
eq("Reduce Motion still wins over a saved look", motionLook({ pace: "quick", pulse: "beat" }, null, true).character, "still");
eq("pulse still does not breathe", motionTimings(motionLook({ pulse: "still" })).breath, 0);
eq("the lists match the theme keys", LOOK_KEYS.map((k) => [k, { pace: Object.keys(PACES), ease: Object.keys(EASES), enter: ENTERS, pulse: Object.keys(PULSES) }[k]]), Object.entries(MOTION_KEYS));

const w = (x) => wordsLook(x)?.look ?? null;
eq("heavy and punchy", w("make Arnold feel heavy and punchy"), { pace: "quick", ease: "heavy", enter: "drop", pulse: "beat" });
eq("drifts like water", w("Luna drifts like water"), { pace: "slow", ease: "float", enter: "rise", pulse: "soft" });
eq("quick and crisp", w("quick and crisp"), { pace: "quick", ease: "sharp", enter: "slide", pulse: "tick" });
eq("playful keeps the pace", w("make her playful"), { ease: "spring", enter: "pop", pulse: "beat" });
eq("the first word wins a key", w("slow but bouncy").pace, "slow");
eq("a no in front skips the word", w("serious, no bounce"), { enter: "fade", pulse: "still" });
eq("not too fast", w("not too fast, gentle"), { pace: "slow", pulse: "soft" });
eq("words it knows are heard", wordsLook("heavy and punchy").heard, ["heavy", "punchy"]);
eq("words with no motion are nothing", wordsLook("purple with a hat"), null);
eq("empty is nothing", wordsLook(""), null);
eq("the line an agent writes", lookLine(w("heavy and punchy")), "theme pace=quick ease=heavy enter=drop pulse=beat");
eq("only the keys it has", lookLine({ pace: "slow" }), "theme pace=slow");
eq("no keys, no line", lookLine({}), null);
eq("the line parses back to the same look", parse(lookLine(w("drifts like water")))[0].props, { pace: "slow", ease: "float", enter: "rise", pulse: "soft" });
eq("in plain words", lookWords(motionLook({}, w("heavy and punchy"))), "quick, heavy, drops in, beats");
eq("Reduce Motion in plain words", lookWords(motionLook({}, null, true)), "Reduce Motion: no movement");

// Saved next to the colors: keys change only what they say, motion= alone starts fresh.
eq("keys add to the saved look", mergeTheme({ name: "ocean", motion: "calm" }, { ease: "heavy" }), { name: "ocean", motion: "calm", ease: "heavy" });
eq("motion= alone clears the words", mergeTheme({ motion: "calm", ease: "heavy", pulse: "beat", accent: "#123456" }, { motion: "snappy" }), { motion: "snappy", accent: "#123456" });
eq("motion= with keys keeps them", mergeTheme({ pace: "slow" }, { motion: "snappy", pulse: "beat" }), { pace: "slow", motion: "snappy", pulse: "beat" });
eq("a set starts fresh", mergeTheme({ pace: "slow" }, { name: "zen" }), { name: "zen" });
let st = initialState();
for (const op of parse("theme motion=calm\ntheme ease=heavy enter=drop\ntheme accent=#FF5A36")) st = apply(st, op);
eq("a reply's theme lines stack", st.theme, { motion: "calm", ease: "heavy", enter: "drop", accent: "#FF5A36" });
eq("an app look carries the keys", (({ motion, pace, ease }) => ({ motion, pace, ease }))(appLook({ name: "zen", pace: "quick", ease: "heavy" })), { motion: "calm", pace: "quick", ease: "heavy" });
eq("an app look with motion= alone drops old keys", appLook({ motion: "snappy" }, { accent: "#FF5A36", pace: "slow" }).pace, undefined);

console.log(bad ? `${bad}/${n} failed` : `motion: ${n} ok`);
if (bad) process.exit(1);
