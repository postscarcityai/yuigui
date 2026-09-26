// Stage first (YL.md section 5): how replies split into chunks.
//   node site/lib/yl/chunks.test.mjs     exit 1 on any failure
import { apply, initialState, parse } from "./yl.mjs";
import { stageChunks, textChunks } from "./chunks.mjs";

const nodesOf = (text) => {
  let s = initialState();
  for (const op of parse(text)) s = apply(s, op);
  return Object.values(s.screens).flat().sort((a, b) => a.seq - b.seq);
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

eq("text: one chunk per paragraph", textChunks("One.\n\nTwo."), ["One.", "Two."]);
const long = Array.from({ length: 6 }, (_, i) => `Sentence ${i + 1} has quite a few words in it to make it long.`).join(" ");
eq("text: a long paragraph splits every two sentences", textChunks(long).length, 3);

console.log(`${n - bad} passed, ${bad} failed`);
process.exit(bad ? 1 : 0);
