// Stage first (YL.md section 5): how replies split into chunks.
//   node site/lib/yl/chunks.test.mjs     exit 1 on any failure
import { apply, initialState, pageOf, parse } from "./yl.mjs";
import { splitSentences, stageChunks, textChunks } from "./chunks.mjs";
import { BASIL_KNOWN, BASIL_WEEK } from "./basil-week.mjs";

const nodesOf = (text, known = {}, chat = false) => {
  let s = initialState();
  for (const op of parse(text, known)) s = apply(s, op);
  return Object.entries(s.screens).filter(([k]) => !chat || pageOf(k) === 1).flatMap(([, list]) => list).sort((a, b) => a.seq - b.seq);
};
const view = (text) => {
  const r = stageChunks(nodesOf(text));
  return { chunks: r.chunks.map((c) => [c.line, c.pic ? c.pic.preset : null]), questions: r.questions.map((q) => q.id), plan: r.plan ? r.plan.id : null };
};

let bad = 0, n = 0;
const eq = (name, got, want) => {
  n++;
  if (JSON.stringify(got) !== JSON.stringify(want)) { bad++; console.log(`FAIL ${name}\n  got  ${JSON.stringify(got)}\n  want ${JSON.stringify(want)}`); }
};

eq("a status answer is one chunk", view(`say "Yes. Build 160, the newest."
shapes caption="Your iPad is on 135."
shape box "iPhone 160"
shape box "iPad 135"`), { chunks: [["Yes. Build 160, the newest.", "shapes"]], questions: [], plan: null });

eq("each say takes the picture after it; plan questions go last", view(`say "0.3.2 is building."
shapes
shape box Build
say "Keys ride along."
sketch "In 0.3.2"
row Keys +hi
plan@before "Before I go"
choose@ping "Ping you?" Yes|No
choose@try "Try first?" Keys|Chords
end`), { chunks: [["0.3.2 is building.", "shapes"], ["Keys ride along.", "sketch"]], questions: ["ping", "try"], plan: "before" });

eq("a picture with no line is its own chunk", view(`sketch "Bar" frame=phone
row Mic +button
say "Talk first."`), { chunks: [[null, "sketch"], ["Talk first.", null]], questions: [], plan: null });

eq("a page is a chunk with its picture", view(`deck "What changed"
page "Plain words" body="Cards say what they are."
sketch frame=bubble
row "Parked YUI-83" +x
page "One idea a page"
end`), { chunks: [["Plain words", "sketch"], ["One idea a page", null]], questions: [], plan: null });

eq("loose questions wait for the end too", view(`ask "Log it?"
say "Done."
stat 3 Sets`), { chunks: [["Done.", "stat"]], questions: ["n1"], plan: null });

eq("a timer is its own chunk", view(`say "Tabata."
card "Eight rounds"
timer 20/10x8 Tabata`), { chunks: [["Tabata.", "card"], [null, "timer"]], questions: [], plan: null });

// YUI-183 (the app's BasilToolsTests.testTheWeekPlaysADayAPageAndASwapGoesAtOnce):
// inside a deck, a question with its own title is a page, played in turn, and
// its tap goes at once. Pages 2 to 12 are the agent's screens, not the turn's story.
const week = stageChunks(nodesOf(BASIL_WEEK, BASIL_KNOWN, true));
eq("a titled question in a deck is its own page", week.chunks.map((c) => c.line ?? c.pic?.id ?? ""), ["3 days planned", "swap-20260928", "swap-20260929", "swap-20260930"]);
eq("the days do not wait for one Send", week.questions.map((q) => q.id), []);
eq("a lesson's quiz (no title) still waits for the end", view(`deck@lesson-x "Capitals" +full
page "France" body="Paris."
choose@quiz-x-1 "Capital of France?" Paris|Lyon answer=Paris
end`).questions, ["quiz-x-1"]);
eq("a titled question in a plan still waits for Send", view(`plan@p "Before I go"
choose@a "Ping you?" Yes|No title="Pings"
end`), { chunks: [], questions: ["a"], plan: "p" });

eq("text: one chunk per paragraph", textChunks("One.\n\nTwo."), ["One.", "Two."]);
const long = Array.from({ length: 6 }, (_, i) => `Sentence ${i + 1} has quite a few words in it to make it long.`).join(" ");
eq("text: a long paragraph splits every two sentences", textChunks(long).length, 3);

// A period inside a number, URL or file name is not a sentence end (SITE-96).
const filler = Array.from({ length: 40 }, () => "word").join(" ");
eq("text: a 3 sentence paragraph stays on one page", textChunks("First thing. Second thing. Third thing.").length, 1);
eq("text: markdown lines stay together", textChunks("**Pipeline:** still audio\nPossible ✅\n- video ❌"), ["**Pipeline:** still audio\nPossible ✅\n- video ❌"]);
eq("text: 4 sentences split in two", textChunks("One. Two. Three. Four.").length, 2);
eq("text: a version number stays whole", textChunks("0.6.0 ships and is built for agents."), ["0.6.0 ships and is built for agents."]);
eq("split: version in a sentence", splitSentences("Yui 0.6.0 ships today. Try it."), ["Yui 0.6.0 ships today. ", "Try it."]);
eq("split: decimals and v1.2", splitSentences("Pi is 3.5 or v1.2 maybe. Fine."), ["Pi is 3.5 or v1.2 maybe. ", "Fine."]);
eq("split: urls and file names", splitSentences("See https://yuigui.com/a.b and chunks.mjs now. Done."), ["See https://yuigui.com/a.b and chunks.mjs now. ", "Done."]);
eq("split: e.g. and vs. before lowercase", splitSentences("Use tools, e.g. a hammer vs. a saw. Go."), ["Use tools, e.g. a hammer vs. a saw. ", "Go."]);
eq("split: abbreviation before a capital", splitSentences("Ask Dr. Smith about it. Go."), ["Ask Dr. Smith about it. ", "Go."]);
eq("split: Build 0.6. Next up. splits once", splitSentences("Build 0.6. Next up."), ["Build 0.6. ", "Next up."]);
eq("split: ! and ? and quotes", splitSentences('Really? "Yes." Wow! ok'), ['Really? ', '"Yes." ', 'Wow! ok']);
eq("split: ends at text end", splitSentences("Done."), ["Done."]);
const ver = Array.from({ length: 3 }, () => `Yui 0.6.0 ships and is built to work for other agents too ${filler}.`).join(" ");
eq("text: no chunk starts mid-number", textChunks(ver).every((c) => !/^\d+ /.test(c)), true);

console.log(`${n - bad} passed, ${bad} failed`);
process.exit(bad ? 1 : 0);
