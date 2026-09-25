// Differential check: random YL documents through the JS reference and the
// Rust parser, outputs compared.
//   node parsers/rust/diff.mjs [count=2000] [seed=1]
// Builds the Rust binary (cargo), then compares, per document: the ops of a
// whole parse (with `line`, without an error's `message`), the ops of a
// stream fed in random chunks, the ids that open on the stage under a random
// style, the pages with the composer on, and every add resolved over its
// defaults. Exits 1 on any difference and prints the first few.
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { isDeepStrictEqual } from "node:util";
import { onStage, parse, PRESETS, resolve, StreamParser, talking } from "../../site/lib/yl/yl.mjs";

const here = fileURLToPath(new URL(".", import.meta.url));
const count = Number(process.argv[2] || 2000);
let seed = Number(process.argv[3] || 1);

// mulberry32
function rand() {
  seed = (seed + 0x6d2b79f5) | 0;
  let t = seed;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}
const int = (n) => Math.floor(rand() * n);
const pick = (a) => a[int(a.length)];
const some = (n, f) => Array.from({ length: 1 + int(n) }, f);

// Pieces that hit every branch of the parser: numbers, durations, ranges,
// quantities, URLs, fields, flags, key=values, quotes, escapes, pipes and
// the JS whitespace set.
const WS = [" ", " ", " ", "  ", "\t", "\u00a0", "\u2003", "\u3000", "\ufeff", "\u2028"];
const WORDS = ["Tabata", "Ready?", "leg", "day", "Yes", "No", "hi", "x", "front", "back", "line", "bar", "pie", "tictactoe",
  "snake", "memory", "on", "off", "true", "false", "#", "#tag", "=", "a=b", "é", "日本", "😀", "-", "@", "~", "$", "±", "done"];
const NUMS = ["0", "-0", "5", "40", "-3", "1.5", "007", "12.50", "1e5", "100000000000000000000000", "0.0000001", "9"];
const DURS = ["40", "40/20", "40/20x8", "1:30", "90s", "2m", "1.5h", "1:3", "1:300", "5x3", "20/10x", "1:30.5/15"];
const RANGES = ["1-5", "0-10", "-5--1", "1.5-3", "1-5@3", "0-100@25%", "1-5kg", "1-5 kg", "1-5@x", "1-5.5.x", "2-8@4.5 m/s"];
const QTYS = ["72.5kg", "12%", "$40", "€5", "$5kg", "3e8m/s", "5e12.5", "5E3", "5.", "-3", "9.81m/s^2", "£-2", "5 kg"];
const PM = ["12.5±0.4", "3+-1", "2±", "-1±0.5", "4+-0.25"];
const URLS = ["/a.jpg", "https://x.co/p", "http://y.io", "data:image/png;base64,AA", "/b.png|Cap", "https://z.dev|Two"];
const FIELDS = ["name", "email:email", "age:number!", "\"Your name\":text", "\"Pick\":a|b|c", "mood:1-5", "x:!", "x:!!",
  "\"A \\\"q\\\"\":long!", "\"\":text", "_k:\"a\"|\"b\"", "Bad-Key:yes", "k:", "\"Title\""];
const KEYS = ["answer", "rounds", "rest", "up", "inline", "layout", "cta", "open", "x", "o", "y", "y2", "err", "err2",
  "names", "color", "notes", "caps", "hl", "spark", "time", "kind", "value", "min", "max", "items", "labels", "__proto__",
  "f", "digits", "unit", "g", "screen", "points", "facts", "next", "units", "lo"];
const VALS = () => pick([pick(NUMS), pick(WORDS), pick(DURS), pick(RANGES), pick(QTYS), pick(PM), pick(URLS),
  `"${pick(WORDS)} ${pick(WORDS)}"`, `${pick(NUMS)}|${pick(PM)}|${pick(WORDS)}`, "1,2,3,4|5,6,7,8|1,2", "5|1|x",
  `"${pick(NUMS)}"|${pick(NUMS)}`, "", "row3d", "true", "4"]);

function token() {
  switch (int(14)) {
    case 0: return pick(WORDS);
    case 1: return pick(NUMS);
    case 2: return pick(DURS);
    case 3: return pick(RANGES);
    case 4: return pick(QTYS);
    case 5: return pick(URLS);
    case 6: return pick(FIELDS);
    case 7: return `+${pick(["x", "hi", "dim", "button", "inline", "check", "y", "_no", "up"])}`;
    case 8: return `${pick(KEYS)}=${VALS()}`;
    case 9: return `"${pick(WORDS)} ${pick(WORDS)}"`;
    case 10: return some(3, () => pick(WORDS)).join("|");
    case 11: return pick(["\"unterminated", "\"a\\\"b\"", "\"x\"y", "a\"b c\"", "\"\"", "\"a|b\"", "\"/a.jpg|Two words\"", "/a.jpg|\"Two words\""]);
    case 12: return pick(PM);
    default: return pick(["$", "\\", "#", "|", "=x", "x=", "a|", "|b"]);
  }
}

const sep = () => (rand() < 0.85 ? " " : pick(WS));
const tokens = (n) => some(n, token).map((t) => sep() + t).join("");

const HEADS = [...PRESETS, "say", "custom", "save", "show", "forget", "clear", "end", "theme", "close", "talk", "Timer", "nope"];
const CUSTOMS = ['{"type":"box","n":1}', '{"a":[1,2.5,-0,1e400,true,null],"b":{"c":"\\u00e9\\ud83d\\ude00"}}', '{"a":1,"a":2}',
  '{"__proto__":{"x":1}}', "[1,2", "{'a':1}", '{"a":01}', '"str"', "  {}  ", "{} x", '{"t":"a\\tb"}', "tru", "-", "1.", '{"a":"\u2028"}'];

function line() {
  const r = rand();
  if (r < 0.04) return "";
  if (r < 0.07) return pick(["# a comment", "#", "  # x", "#tag"]);
  if (r < 0.14) return `>${pick(["2", "3", "12", "13", "02", "chat", "full", "x-y", "2!"])}${rand() < 0.5 ? "" : " " + (rand() < 0.3 ? "# c" : line())}`;
  if (r < 0.19) return `custom${rand() < 0.4 ? "@" + pick(["c1", "box", "a.b", ""]) : ""}${pick([" ", "  ", "\u00a0", ""])}${pick(CUSTOMS)}`;
  if (r < 0.26) return `~${pick([...PRESETS, "say", "custom", "n1", "n2", "c1", "t", "hiit", "timer@n1", "timer@t", "card@n2", "nope@x", "say@s"])}${tokens(3)}`;
  if (r < 0.31) return `math${rand() < 0.5 ? " caption=" + pick(['"a b"', "x", '"u\\"q"', '"a"b', '"open']) : ""}${rand() < 0.4 ? " size=" + pick(["lg", '""']) : ""} ${pick(["x^2", '"\\frac{a}{b}"', "a # b", "", '"a" "b"'])}`;
  if (r < 0.35) return `step${tokens(3)}${pick([" $ x^2", " $", "$ y", " $$ z", "\u00a0$\u00a0e=mc^2", ""])}`;
  if (r < 0.39) return `talk${pick(["", " on", " off", " maybe", " on off"])}`;
  const head = pick(HEADS) + (rand() < 0.2 ? "@" + pick(["t", "hiit", "n1", "x-1", "", "a@b"]) : "");
  return head + (rand() < 0.1 ? "" : tokens(6)) + (rand() < 0.05 ? pick([" # trailing", "\r", "  "]) : "");
}

function doc() {
  const lines = some(10, line);
  return lines.join(rand() < 0.1 ? "\r\n" : "\n") + (rand() < 0.3 ? "\n" : "");
}

// Random chunks, split on code points (a Rust string cannot hold half a pair).
function chunks(d) {
  const cps = [...d];
  const out = [];
  for (let i = 0; i < cps.length; ) {
    const n = 1 + int(8);
    out.push(cps.slice(i, i + n).join(""));
    i += n;
  }
  return out;
}

const STYLES = [{}, { screen: "chat" }, { screen: "full" }, { gallery: "row3d" }];
const noMessage = (ops) => ops.map(({ message, ...o }) => o);
// Both sides through JSON so -0, NaN and key order read the same.
const canon = (x) => JSON.parse(JSON.stringify(x));

const cases = Array.from({ length: count }, () => {
  const d = doc();
  return { doc: d, chunks: chunks(d), style: pick(STYLES) };
});

execFileSync("cargo", ["build", "--release", "--quiet", "--bin", "yl"], { cwd: here, stdio: "inherit" });
const rust = JSON.parse(execFileSync(`${here}target/release/yl`, ["--batch"], { input: JSON.stringify(cases), maxBuffer: 1 << 30 }).toString());

let diffs = 0, ops = 0;
cases.forEach((c, i) => {
  const whole = parse(c.doc);
  const s = new StreamParser();
  const stream = c.chunks.flatMap((ch) => s.push(ch)).concat(s.flush());
  const js = canon({
    ops: noMessage(whole),
    stream: noMessage(stream),
    stage: whole.filter((o) => onStage(o, c.style)).map((o) => o.id),
    talk: talking(whole),
    resolved: whole.filter((o) => o.op === "add").map((o) => resolve(o.preset, o.props)),
  });
  const rs = canon({ ...rust[i], ops: noMessage(rust[i].ops), stream: noMessage(rust[i].stream) });
  ops += whole.length;
  if (isDeepStrictEqual(js, rs)) return;
  if (++diffs <= 5) {
    for (const k of Object.keys(js)) {
      if (isDeepStrictEqual(js[k], rs[k])) continue;
      console.log(`DIFF doc ${i} (${k}): ${JSON.stringify(c.doc)}`);
      const a = [].concat(js[k]), b = [].concat(rs[k]);
      const j = a.findIndex((x, n) => !isDeepStrictEqual(x, b[n]));
      console.log(`  js:   ${JSON.stringify(a[j])}\n  rust: ${JSON.stringify(b[j])}`);
    }
  }
});
console.log(`${count - diffs}/${count} documents identical (${ops} ops), ${diffs} differ`);
process.exit(diffs ? 1 : 0);
