// Parser tests. Run: npm test (node --test).
import test from "node:test";
import assert from "node:assert/strict";
import { parse, StreamParser, apply, initialState, tokenize, seconds } from "../site/lib/yl/yl.mjs";
import { SCREENS, DEMOS, MEDIA } from "../site/lib/yl/samples.mjs";

const one = (l) => parse(l)[0];
const props = (l) => one(l).props;

test("durations and timespecs", () => {
  assert.equal(seconds("90"), 90);
  assert.equal(seconds("90s"), 90);
  assert.equal(seconds("5m"), 300);
  assert.equal(seconds("1:30"), 90);
  assert.deepEqual(props("timer 40/20x8 Tabata"), { work: 40, rest: 20, rounds: 8, label: "Tabata" });
  assert.deepEqual(props("timer 1:00/30x5"), { work: 60, rest: 30, rounds: 5 });
  assert.deepEqual(props("timer 5m Plank hold"), { work: 300, label: "Plank hold" });
  assert.deepEqual(props("timer 0 +up Run"), { work: 0, up: true, label: "Run" });
  assert.deepEqual(props("timer 60 rounds=3"), { work: 60, rounds: 3 });
});

test("tokens: quotes, options, key/values, flags, comments", () => {
  const t = tokenize(`"Pull-up bar"|Bands cta="Start now" +other color=#ff6b3d # trailing`);
  assert.deepEqual(t[0].parts, ["Pull-up bar", "Bands"]);
  assert.equal(t[1].key, "cta");
  assert.equal(t[1].value, "Start now");
  assert.equal(t[2].raw, "+other");
  assert.equal(t[3].value, "#ff6b3d");
  assert.equal(t.length, 4);
  assert.deepEqual(tokenize(`"say \\"hi\\""`)[0].text, `say "hi"`);
});

test("ask / choose / pick", () => {
  assert.deepEqual(props(`ask "Log this set?"`), { q: "Log this set?" });
  assert.deepEqual(props(`ask Log this set?`), { q: "Log this set?" });
  assert.deepEqual(props(`ask "Send the invite now?" "Yes, send"|"Not yet"`), { q: "Send the invite now?", options: ["Yes, send", "Not yet"] });
  assert.deepEqual(props(`choose "Split?" Push|Pull|Legs +other`), { q: "Split?", options: ["Push", "Pull", "Legs"], other: true });
  assert.deepEqual(props(`pick "Gear" DB|Bench max=2`), { q: "Gear", options: ["DB", "Bench"], max: 2 });
});

test("slide", () => {
  assert.deepEqual(props(`slide "AI experience" 1-5 "Brand new"|"I run agents"`), { label: "AI experience", min: 1, max: 5, lo: "Brand new", hi: "I run agents" });
  assert.deepEqual(props(`slide "Protein left (g)" 0-200 value=85 step=5`), { label: "Protein left (g)", min: 0, max: 200, value: 85, step: 5 });
});

test("form fields", () => {
  const p = props(`form "Check-in" name:text! sleep:1-10 "Home gym":yes split:Push|Pull|Legs notes submit="Save"`);
  assert.equal(p.title, "Check-in");
  assert.equal(p.submit, "Save");
  assert.deepEqual(p.fields, [
    { key: "name", type: "text", required: true },
    { key: "sleep", type: "range", min: 1, max: 10 },
    { key: "home_gym", label: "Home gym", type: "yes" },
    { key: "split", type: "choice", options: ["Push", "Pull", "Legs"] },
    { key: "notes" },
  ]);
});

test("list, table, card, image, camera, mic, say", () => {
  assert.deepEqual(props(`list Today "Squat 5x5" "Bench 5x5" +check`), { title: "Today", items: ["Squat 5x5", "Bench 5x5"], check: true });
  assert.deepEqual(props(`list Warmup "Jumping jacks"|"Hip openers" +num`), { title: "Warmup", items: ["Jumping jacks", "Hip openers"], num: true });
  assert.deepEqual(props(`table meals`), { name: "meals" });
  assert.deepEqual(props(`table Macros Food|Cal "Eggs|140" Oats|300`), { name: "Macros", cols: ["Food", "Cal"], rows: [["Eggs", 140], ["Oats", 300]] });
  assert.deepEqual(props(`card "Leg day" "Squat, RDL." sub=Thursday cta="Go"`), { title: "Leg day", body: "Squat, RDL.", sub: "Thursday", cta: "Go" });
  assert.deepEqual(props(`image /yl/meal.svg Last night's dinner`), { src: "/yl/meal.svg", caption: "Last night's dinner" });
  assert.deepEqual(props(`image "a calm blue avatar"`), { prompt: "a calm blue avatar" });
  assert.deepEqual(props(`camera "Scan the receipt" +scan`), { prompt: "Scan the receipt", scan: true });
  assert.deepEqual(props(`camera front Selfie`), { facing: "front", prompt: "Selfie" });
  assert.deepEqual(props(`mic "What did you eat?" +auto`), { prompt: "What did you eat?", auto: true });
  assert.deepEqual(props(`say Nice work.`), { text: "Nice work." });
});

test("routing, focus, patch, save/show, clear", () => {
  const ops = parse(`timer 40/20x8
>2 timer 90 Rest
~timer rounds=10
>3
ask Ready?
timer@hiit 30
~hiit 45/15
save s3
clear
show s3`);
  assert.equal(ops[1].screen, "2");
  assert.equal(ops[3].op, "focus");
  assert.equal(ops[4].screen, "3");
  let s = initialState();
  for (const o of ops) s = apply(s, o);
  // ~timer hits the newest timer (screen 2), not screen 1's
  assert.equal(s.screens["2"][0].props.rounds, 10);
  assert.equal(s.screens["1"][0].props.rounds, 8);
  const hiit = s.screens["3"].find((c) => c.id === "hiit");
  assert.deepEqual(hiit.props, { work: 45, rest: 15 });
  assert.equal(s.screens["3"].length, 2); // clear, then show restored both
  assert.deepEqual(s.errors, []);
});

test("custom and errors never break the rest of the screen", () => {
  const ops = parse(`custom {"type":"text","text":"hi"}
custom {bad
bogus 1 2
~nothing x=1
show never
ask ok?`);
  assert.equal(ops[0].preset, "custom");
  assert.deepEqual(ops[0].props.spec, { type: "text", text: "hi" });
  assert.deepEqual(ops.slice(1, 4).map((o) => o.op), ["error", "error", "error"]);
  let s = initialState();
  for (const o of ops) s = apply(s, o);
  assert.equal(s.screens["1"].length, 2);
  assert.equal(s.errors.length, 4); // 3 parse errors + unknown saved screen
  assert.equal(s.customs.length, 1);
});

test("stream parser emits each line when its newline lands", () => {
  const sp = new StreamParser();
  const src = `timer 40/20x8 Tabata\nask "Log this set?"\nchoose A|B`;
  const seen = [];
  for (let i = 0; i < src.length; i += 3) {
    for (const op of sp.push(src.slice(i, i + 3))) seen.push([i, op.preset]);
  }
  for (const op of sp.flush()) seen.push(["flush", op.preset]);
  assert.deepEqual(seen.map((x) => x[1]), ["timer", "ask", "choose"]);
  assert.ok(seen[0][0] < 24, "timer rendered before the rest of the reply arrived");
  assert.equal(seen[2][0], "flush");
});

test("every sample and demo screen parses (demos may include one deliberate error)", () => {
  for (const s of SCREENS) assert.equal(parse(s.yl).filter((o) => o.op === "error").length, 0, s.name);
  for (const s of DEMOS) assert.ok(parse(s.yl).filter((o) => o.op === "error").length <= 1, s.name);
  for (const s of MEDIA) assert.equal(parse(`${s.yl}\n${s.next || ""}`).filter((o) => o.op === "error").length, 0, s.name);
});
