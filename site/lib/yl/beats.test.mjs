// Beats (DLG-2): the beat builder against the three DLG-1 scripts, twenty samples the site draws, and the rules.
//   node site/lib/yl/beats.test.mjs     exit 1 on any failure
// The pinned vectors are spec/conformance/beats.json (run by spec/conformance/run.mjs).
import { readFileSync } from "node:fs";
import * as Y from "./yl.mjs";
import { ANCHOR_WORDS, AUTO_WAIT, WAIT_AFTER, beats, beatsView, filmCues, firstClause, replyParts } from "./beats.mjs";
import { DEMOS, SCREENS } from "./samples.mjs";
import { readScript } from "../../public/playground/canvas/dialogue/script.mjs";

let bad = 0, n = 0;
const eq = (name, got, want) => {
  n++;
  if (JSON.stringify(got) !== JSON.stringify(want)) { bad++; console.log(`FAIL ${name}\n  got  ${JSON.stringify(got)}\n  want ${JSON.stringify(want)}`); }
};
const ok = (name, cond, why = "") => { n++; if (!cond) { bad++; console.log(`FAIL ${name}${why ? `: ${why}` : ""}`); } };

// ---- the DLG-1 scripts: every scripted beat comes out as one beat, with its anchors and its wait, reply after reply
const dir = new URL("../../public/playground/canvas/dialogue/", import.meta.url);
for (const name of ["heart", "launch", "chicken"]) {
  const text = readFileSync(new URL(`${name}.yl`, dir), "utf8");
  const script = readScript(text, Y);
  const bodies = text.split(/^# reply .*$/m).slice(1);
  let prev = null;
  script.replies.forEach((r, i) => {
    const got = beats(bodies[i], { prev, yl: true });
    ok(`${name} reply ${r.n}: no errors`, !got.errors.length, got.errors.join("; "));
    eq(`${name} reply ${r.n}: one beat a scripted beat, spoken as written`, got.beats.map((b) => b.line), r.beats.map((b) => b.say));
    eq(`${name} reply ${r.n}: the anchors it marks`, got.beats.map((b) => (b.anchor ? b.anchor.text : null)), r.beats.map((b) => (b.anchors[0] ? b.anchors[0].words : null)));
    eq(`${name} reply ${r.n}: the waypoint where it stands`, got.beats.map((b) => (b.wait ? b.wait.id : null)), r.beats.map((b) => (b.wait ? b.wait.id : null)));
    for (const b of got.beats) if (b.wait && b.wait.into) ok(`${name} reply ${r.n}: +in draws at least one option into a mark`, Object.keys(b.wait.marks).length > 0);
    prev = got;
  });
  ok(`${name}: anchors last across the follow-ups`, prev.anchors.length === script.beats.reduce((s, b) => s + b.anchors.length, 0));
}

// ---- twenty samples the site already draws: sane beats, no errors, short anchors
const samples = [...SCREENS, ...DEMOS].filter((s) => s.yl && !/^Demo: (bad|errors)/i.test(s.name)).slice(0, 20);
ok("twenty samples", samples.length === 20);
for (const s of samples) {
  const r = beats(s.yl, { yl: true });
  ok(`sample "${s.name}": no errors`, !r.errors.length, r.errors.join("; "));
  ok(`sample "${s.name}": at least one beat`, r.beats.length > 0 || r.questions.length > 0);
  for (const b of r.beats) ok(`sample "${s.name}": every beat speaks, shows or waits`, !!(b.line || b.pic || b.wait || b.anchor || b.patch));
  for (const a of r.anchors) ok(`sample "${s.name}": anchor "${a.text}" is ${ANCHOR_WORDS} words or fewer`, a.text.split(/\s+/).length <= ANCHOR_WORDS);
}

// ---- the rules, one at a time
eq("first clause: up to the comma", firstClause("The heart is two pumps, side by side."), "The heart is two pumps");
eq("first clause: up to a dash", firstClause("Memory check — green across five agents."), "Memory check");
eq("first clause: none when over 8 words", firstClause("The heart is a muscle about the size of your fist and it never rests."), null);
eq("parts: text around a fence", replyParts("Hi.\n```yui\nsay \"x\"\n```\nBye."), [{ text: "Hi." }, { yl: 'say "x"\n' }, { text: "Bye." }]);
eq("parts: bare Yui Lines are Yui Lines", replyParts('say "Hi"\nanchor "Hi"'), [{ yl: 'say "Hi"\nanchor "Hi"' }]);
eq("parts: prose stays prose", replyParts("Say hi to the team for me."), [{ text: "Say hi to the team for me." }]);
eq("cues: api.say lines in order", filmCues(`=== 0 4 a\napi.say("Two pumps.");\napi.say('Right to the lungs.', 1)`), ["Two pumps.", "Right to the lungs."]);

const v = (text, opts) => beatsView(beats(text, opts));
eq("a bare wait holds for 6 s", beats('say "Done."\nwait', {}).beats[0].wait.after, WAIT_AFTER);
eq("a wait with options is a waypoint, not bare", v('say "Pick."\nwait@w "Which?" A|B').beats[0].wait, { id: "w", q: "Which?", options: ["A", "B"] });
eq("a plan is a form: no beat waits for it", v('plan@p "Before I go"\nchoose@a "Ping you?" Yes|No\nend').beats, []);
eq("screens 2 to 12 are not the turn", v('say "Here."\n>2\ntimer 5m Plank').beats, [{ line: "Here.", anchor: "Here" }]);
eq("a group member is a mark, not a beat", beats('shapes "H"\nshape@ra box "right atrium"', { yl: true }).marks, { "right atrium": "ra" });
const long = Array.from({ length: AUTO_WAIT * 2 }, (_, i) => `Line ${i + 1} is long enough to be one beat on its own here.`).join("\n\n");
eq("auto wait: every twelfth beat in a row with nothing to answer", beats(long).beats.map((b, i) => (b.wait ? i : -1)).filter((i) => i >= 0), [AUTO_WAIT - 1, AUTO_WAIT * 2 - 1]);
const one = beats('say "Two pumps."\nanchor "Two pumps"');
eq("follow-up: a continuation never pins an anchor again", beats('say "Again."\nanchor "Two pumps"', { prev: one }).anchors.map((a) => [a.text, a.beat]), [["Two pumps", -1]]);
eq("follow-up: ids from earlier replies take patches", beats("~ra tone=accent", { prev: beats('shapes "H"\nshape@ra box RA', { yl: true }), yl: true }).errors, []);
ok("an anchor over 8 words is an error", beats('say "x"\nanchor "one two three four five six seven eight nine"').errors.length === 1);

console.log(`${n - bad}/${n} beats checks passed`);
process.exit(bad ? 1 : 0);
