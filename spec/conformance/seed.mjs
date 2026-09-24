// Bootstrap only. Writes vector files from the case list below, with
// `expected` taken from the JS reference parser. The committed JSON files are
// the source of truth after hand review: never re-seed to make a failing
// parser pass. Refuses to overwrite an existing file unless --force.
//
//   node seed.mjs [--force]
import { writeFileSync, existsSync } from "node:fs";
import { parse, StreamParser } from "../../site/lib/yl/yl.mjs";
import { normalize } from "./run.mjs";

const force = process.argv.includes("--force");

// [name, input] or [name, input, { chunks }]
const FILES = {
  "01-lines": [
    ["blank lines produce nothing", "\n\n   \n\t\n"],
    ["whole-line comment", "# rest block"],
    ["bare hash is a comment", "#"],
    ["comment after leading spaces", "   # indented comment\ntimer 60"],
    ["hash glued to a word is not a comment", "#hashtag"],
    ["one op per line, blanks skipped", "timer 60\n\nask Ready?\n# note\nsay Go."],
    ["CRLF line endings", "timer 60\r\nask Ready?\r\n"],
    ["leading and trailing spaces are trimmed", "   timer 60   "],
    ["tabs separate tokens", "timer\t40/20x8\tTabata"],
    ["no trailing newline", "say one\nsay two"],
  ],
  "02-tokens": [
    ["quoted string keeps spaces", `ask "Log this set?"`],
    ["bare words join with single spaces", `ask   Log   this   set?`],
    ["escaped quote and backslash inside quotes", `say "She said \\"hi\\" and left a \\\\"`],
    ["backslash outside quotes is literal", `say C:\\path\\to`],
    ["quotes inside a token", `say pre"fix and"post`],
    ["unterminated quote runs to end of line", `ask "Log this set`],
    ["options split on pipe", `choose Split? Push|Pull|Legs`],
    ["quoted options", `choose When? "3:00 pm"|"4:00 pm"`],
    ["quoted part next to bare part", `pick Gear "Pull-up bar"|Bands`],
    ["pipe inside quotes is not a split", `say "a|b"`],
    ["key=value number", `timer 60 rounds=3`],
    ["key=value decimals and negatives", `slide Temp min=-10 max=2.5 step=0.5`],
    ["key=value booleans", `timer 60 sound=off auto=on up=false`],
    ["key=value true stays boolean", `timer 60 up=true`],
    ["quoted key=value stays text", `card Leg cta="5" sub="on"`],
    ["key=value with spaces needs quotes", `card Leg cta="Start workout"`],
    ["key=value options", `table Macros cols=Food|Cal`],
    ["key=value options mix quoted and bare", `card X tags=1|"2"|three`],
    ["value keeps later equals signs", `card X sub=a=b`],
    ["empty value", `card X sub=`],
    ["exponent is not a number", `card X sub=1e5`],
    ["leading-dot decimal is not a number", `card X sub=.5`],
    ["key=value wins over positionals", `timer 40/20x8 rounds=3 work=30`],
    ["last duplicate key wins", `timer 60 rounds=3 rounds=5`],
    ["key=value wins over flag", `timer 60 +auto auto=off`],
    ["flag sets true", `choose Split? Push|Pull +other`],
    ["quoted plus is not a flag", `say "+other"`],
    ["plus with digits is not a flag", `say +1 for that`],
    ["comment after tokens", `timer 60 Rest # between sets`],
    ["hash at end of line ends it", `timer 60 Rest #`],
    ["hash color value is not a comment", `card Brand color=#ff6b3d`],
    ["hash inside a word is not a comment", `ask Is #1 the best?`],
    ["hash inside quotes is not a comment", `say "we are # one"`],
    ["unicode and emoji text", `say Great set 💪 café`],
  ],
  "03-timer": [
    ["seconds", "timer 45"],
    ["seconds suffix", "timer 90s"],
    ["minutes", "timer 5m Plank hold"],
    ["hours", "timer 1h"],
    ["m:ss", "timer 1:30"],
    ["decimal minutes", "timer 1.5m"],
    ["work/rest x rounds", "timer 40/20x8 Tabata"],
    ["m:ss work with rounds", "timer 1:00/30x5"],
    ["work x rounds, no rest", "timer 30x4 Sprints"],
    ["count up", "timer 0 +up Run"],
    ["label only, no timespec", "timer Tabata"],
    ["second timespec is label text", "timer 60 90"],
    ["quoted number is label, not work", `timer "60" Rest`],
    ["id on a timer", "timer@hiit 40/20x8"],
    ["no args", "timer"],
  ],
  "04-ask-choose-pick": [
    ["ask quoted question", `ask "Log this set?"`],
    ["ask bare question", `ask Log this set?`],
    ["ask with options", `ask "Send the invite now?" "Yes, send"|"Not yet"`],
    ["ask with no args", `ask`],
    ["ask: first options token wins, later ones are text", `ask Pick A|B C|D`],
    ["choose with other", `choose "What are we training?" Push|Pull|Legs +other`],
    ["choose options before question text", `choose Push|Pull Which one?`],
    ["pick with max and submit", `pick "Gear" Dumbbells|Bench|Bands max=2 submit=Go +other`],
    ["q and options by key", `ask q="Ready?" options=Go|Wait`],
  ],
  "05-slide": [
    ["range with end labels", `slide "AI experience" 1-5 "Brand new"|"I run agents"`],
    ["range with value and step", `slide "Protein left (g)" 0-200 value=85 step=5`],
    ["negative range", `slide Mood -5-5`],
    ["decimal range", `slide Weight 0.5-2.5`],
    ["range only", `slide 1-10`],
    ["three-way options are label text", `slide Pace 1-3 Slow|Mid|Fast`],
    ["unit by key", `slide Distance 0-10 unit=km`],
  ],
  "06-form": [
    ["typed fields, required, key submit", `form name:text! goal:voice level:1-5 submit="Next"`],
    ["quoted title, labeled field, choice", `form "Check-in" sleep:1-10 "Home gym":yes split:Push|Pull|Legs`],
    ["every named type", `form a:text b:long c:voice d:number e:email f:phone g:date h:time i:url j:yes k:photo`],
    ["bare identifier is a text field", `form "About you" name email`],
    ["required without a type", `form name!`],
    ["label slug", `form "Your Email Address":email!`],
    ["quoted choice options", `form when:"3 pm"|"4 pm"`],
    ["required choice", `form level:Beginner|Mid|Pro!`],
    ["unknown type is kept as written", `form "Setup" colour:mauve name`],
    ["field with an empty type is title text", `form Re: note`],
    ["quoted label without type is title", `form "Daily check-in" mood:1-5`],
    ["bare words are fields, so titles are quoted", `form Daily check-in`],
    ["no fields", `form "Just a title"`],
  ],
  "07-list-table": [
    ["title and checklist items", `list Today "Squat 5x5 @ 225" "Bench 5x5 @ 185" +check`],
    ["options items, numbered", `list Warmup "Jumping jacks"|"Hip openers" +num`],
    ["quoted first token is an item", `list "Eggs" "Milk"`],
    ["bare words after the title are items", `list Groceries milk eggs`],
    ["title only", `list Empty`],
    ["bound table", `table meals`],
    ["inline table, cells coerced to numbers", `table Macros Food|Cal|Protein "Eggs|140|12" "Oats|300|10"`],
    ["inline table without a name", `table Food|Cal Eggs|140`],
    ["table cells coerce booleans", `table Habits Habit|Done "Water|on" "Walk|off"`],
  ],
  "08-card-image-camera-mic-say": [
    ["card full", `card "Leg day" "Squat, RDL, lunges." sub=Thursday img=/yl/legday.svg cta="Start workout"`],
    ["card bare title and body", `card Leg day is today`],
    ["card title only", `card Done`],
    ["image path and caption", `image /yl/meal.svg Last night's dinner`],
    ["image https", `image https://example.com/a.png`],
    ["image data url", `image data:image/png;base64,AAAA Dot`],
    ["image prompt only", `image "a calm blue avatar with a wizard hat"`],
    ["image url after text makes text a caption", `image Dinner /yl/meal.svg`],
    ["image relative path is not a url", `image yl/meal.svg`],
    ["camera prompt", `camera "Snap your plate"`],
    ["camera scan", `camera "Scan the receipt" +scan`],
    ["camera facing", `camera front Selfie time`],
    ["camera quoted facing word is prompt", `camera "front"`],
    ["mic prompt auto lang", `mic "What did you eat today?" +auto lang=en-US`],
    ["mic no args", `mic`],
    ["say text", `say Nice work.`],
    ["say empty", `say`],
    ["say with id", `say@hello Hi there`],
  ],
  "09-screens": [
    ["route one line", `>2 timer 90 Rest\nask Ready?`],
    ["focus moves later lines", `>2\ntimer 90\nask Ready?\n>1\nsay back`],
    ["named screen", `>stats-view say hello`],
    ["focus with trailing comment", `>3 # summary screen\nsay here`],
    ["route does not move focus", `>2\n>3 say once\nsay still two`],
    ["space after > is not a route", `> 2 timer 60`],
  ],
  "10-patch": [
    ["patch by id parses with the target preset", "timer@hiit 40/20x8\n~hiit rounds=10\n~hiit 30/10"],
    ["patch by preset name", "timer 60\n~timer rounds=3"],
    ["patch say", "say hi\n~say bye"],
    ["patch unknown id is an error", "~nope rounds=3"],
    ["patch before the id exists is an error", "~later 30\ntimer@later 60"],
    ["patch a custom block is an error", `custom@box {"type":"divider"}\n~box x=1`],
    ["patch on a routed line", ">2 ~timer 45"],
    ["patch ask by id with options", "ask@q1 Ready?\n~q1 Go|Wait"],
    ["patch by preset name is not checked against the screen", "~ask Go|Wait"],
    ["tilde alone is an error", "~ 30"],
  ],
  "11-save-show-clear": [
    ["save and show", "timer 60\nsave workout\nclear\nshow workout"],
    ["quoted save name", `save "leg day"`],
    ["save without a name is an error", "save"],
    ["show without a name is an error", "show"],
    ["clear ignores args", "clear everything now"],
    ["show of a name never saved is not a parse error", "show nothing"],
    ["routed save and clear", ">2 save stats\n>2 clear"],
  ],
  "12-custom": [
    ["custom object", `custom {"type":"text","text":"hi","size":"lg"}`],
    ["custom with id", `custom@countdown {"type":"stat","value":"3","label":"days"}`],
    ["custom nested", `custom {"type":"stack","children":[{"type":"badge","text":"PR"},{"type":"divider"},{"type":"stat","value":1.5,"label":"km"}]}`],
    ["custom scalar JSON", `custom 42`],
    ["custom array JSON", `custom [1,true,null,"x"]`],
    ["custom takes no comments", `custom {"type":"divider"} # note`],
    ["custom bad JSON is an error", `custom {type: text}`],
    ["custom with nothing after it is an error", `custom`],
    ["custom escapes and unicode", `custom {"type":"text","text":"a \\"q\\" \\u00e9 \\n end"}`],
    ["custom routed", `>2 custom {"type":"divider"}`],
  ],
  "13-ids": [
    ["auto ids count adds in line order", "say a\nask b\ntimer 60"],
    ["custom takes a c id from the same counter", `say a\ncustom {"type":"divider"}\nsay b`],
    ["explicit ids do not advance the counter", "say@x a\nsay b"],
    ["errors do not advance the counter", "bogus\nsay a"],
    ["patches do not advance the counter", "timer 60\n~timer 30\nsay a"],
  ],
  "14-errors": [
    ["unknown preset", "dance 5 minutes"],
    ["preset names are lowercase", "Timer 60"],
    ["quoted head is not a preset", `"timer" 60`],
    ["bad id characters", "timer@ 60"],
    ["error does not stop later lines", "timer 60\nnonsense here\nask Ready?"],
    ["save with id syntax is unknown", "save@x name"],
  ],
  "15-streaming": [
    ["line renders when its newline lands", "timer 40/20x8 Tabata\nask Log this set?\n", { chunks: ["tim", "er 40/20x8 Tab", "ata\nask Log", " this set?\n"] }],
    ["flush parses the tail", "say one\nsay two", { chunks: ["say one\nsay ", "two"] }],
    ["CR and LF in different chunks", "timer 60\r\nsay hi\r\n", { chunks: ["timer 60\r", "\nsay hi\r", "\n"] }],
    ["several lines in one chunk", "say a\nsay b\nsay c\n", { chunks: ["say a\nsay b\nsay c\n"] }],
    ["whitespace-only tail is dropped on flush", "say a\n   ", { chunks: ["say a\n", "   "] }],
    ["focus carries across chunks", ">2\nsay a\n", { chunks: [">2", "\nsay", " a\n"] }],
  ],
};

function streamEmits(chunks) {
  const s = new StreamParser();
  const out = chunks.map((c) => normalize(s.push(c)));
  out.push(normalize(s.flush()));
  return out;
}

let total = 0;
for (const [file, cases] of Object.entries(FILES)) {
  const path = new URL(`./${file}.json`, import.meta.url);
  if (existsSync(path) && !force) { console.log(`skip ${file}.json (exists)`); continue; }
  const vectors = cases.map(([name, input, opt = {}]) => {
    const expected = normalize(parse(input));
    const v = { name, input, expected };
    if (expected.some((o) => o.op === "error")) v.error = true;
    if (opt.chunks) { v.chunks = opt.chunks; v.emits = streamEmits(opt.chunks); }
    return v;
  });
  total += vectors.length;
  writeFileSync(path, JSON.stringify({ version: "YL v0", area: file.slice(3), vectors }, null, 2) + "\n");
  console.log(`wrote ${file}.json (${vectors.length})`);
}
console.log(`${total} vectors`);
