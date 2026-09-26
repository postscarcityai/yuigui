// The Yui library (FLOW-2): every preset and every saved flow, one entry each,
// for yuigui.com/developers/library and /library.json. Pure data, no React.
// A preset in PRESETS (yl.mjs) with no entry here fails scripts/library-check.mjs.
import { PRESETS } from "./yl.mjs";
import { STARTER_FLOWS } from "./starter-flows.mjs";
import { findDocLeak, findLeak } from "../public-guard.mjs";

export const SITE = "https://www.yuigui.com";

// Shelves, in the order the page shows them.
export const SHELVES = [
  ["ask", "Ask something"],
  ["show", "Show something"],
  ["media", "Photos and video"],
  ["data", "Numbers and science"],
  ["group", "Pages, plans and stories"],
  ["play", "Play"],
];

// One entry per preset. `yl` is a small, complete reply that draws it; members
// of a group (page, row, done...) come with their group head so they render.
// `doc` is the anchor of its section in /yl.
export const PRESET_ENTRIES = {
  timer: {
    shelf: "ask", doc: "timer",
    purpose: "An interval timer with rounds, a ring and beeps. Opens full screen.",
    tags: ["workout", "rest", "countdown", "stopwatch", "tabata", "pomodoro"],
    yl: `timer 40/20x8 Tabata +inline`,
  },
  ask: {
    shelf: "ask", doc: "ask",
    purpose: "Yes or no, or two to four big buttons. The fastest way to get a decision.",
    tags: ["confirm", "yes no", "buttons", "decision", "approve"],
    yl: `say "Set 3 done. 225 x 5, bar speed looked good."
ask "Log this set?" "Log it"|"Redo it"`,
  },
  choose: {
    shelf: "ask", doc: "choose",
    purpose: "Pick exactly one. Add +other for a typed answer.",
    tags: ["single choice", "options", "radio", "poll", "menu"],
    yl: `choose "What are we training today?" Push|Pull|Legs +other`,
  },
  pick: {
    shelf: "ask", doc: "pick",
    purpose: "Pick any number, then send. Picks stay open to change.",
    tags: ["multi select", "checkboxes", "options", "tags", "filters"],
    yl: `pick "What gear do you have?" Dumbbells|Bench|Bands|"Pull-up bar"|Kettlebell +other`,
  },
  slide: {
    shelf: "ask", doc: "slide",
    purpose: "A slider for a number in a range, with words on both ends.",
    tags: ["number", "rating", "scale", "range", "budget", "how much"],
    yl: `slide "How much do you know about AI?" 1-5 "Brand new"|"I run agents"`,
  },
  form: {
    shelf: "ask", doc: "form",
    purpose: "Several typed fields with one submit: text, email, date, voice, photo and more.",
    tags: ["fields", "input", "signup", "intake", "contact", "details"],
    yl: `say "Nice to meet you. A couple of quick ones."
form name:text! email:email goal:voice submit="Next"`,
  },
  list: {
    shelf: "show", doc: "list",
    purpose: "A titled list. With +check every item gets a checkbox.",
    tags: ["checklist", "todo", "items", "shopping", "steps"],
    yl: `list Today "Back squat 5x5" "Bench 5x5" "Barbell row 3x10" "Plank 3x60s" +check`,
  },
  table: {
    shelf: "data", doc: "table",
    purpose: "Rows and columns, with units and tap-to-sort.",
    tags: ["grid", "rows", "spreadsheet", "compare", "log", "sort"],
    yl: `table Macros Food|Cal|Protein "Eggs|140|12" "Oats|300|10" "Chicken|280|53" "Greek yogurt|150|20" units=||g +sort`,
  },
  query: {
    shelf: "data", doc: "agent-tables-table-create-put-query",
    purpose: "A live view of an agent table: rows, a list, a chart or one number. Redraws when a row lands.",
    tags: ["table", "log", "tracker", "totals", "macros", "crm", "database"],
    yl: `table create meals Day:date Food:text Cal:number
put meals Day=today Food=Oats Cal=300
put meals Day=today Food=Eggs Cal=140
query meals where=Day=today sum=Cal as stat y=Cal label="Today"`,
  },
  card: {
    shelf: "show", doc: "card",
    purpose: "A card with a picture, a line of text and one button that does something.",
    tags: ["summary", "preview", "link", "cta", "button", "result"],
    yl: `card "Leg day" "Squat, RDL, walking lunges. About 45 minutes." sub="Thursday" img=/yl/legday.svg cta="Start workout"`,
  },
  image: {
    shelf: "media", doc: "image",
    purpose: "One picture. With +edit the person circles what to change.",
    tags: ["photo", "picture", "markup", "annotate", "edit", "generate"],
    yl: `image /demo/before_room.jpg +edit "Circle or box what to change"`,
  },
  camera: {
    shelf: "media", doc: "camera",
    purpose: "Opens the camera for one photo that goes back to the agent. +scan for documents.",
    tags: ["photo", "capture", "scan", "receipt", "document", "upload"],
    yl: `camera "Snap your plate"`,
  },
  mic: {
    shelf: "ask", doc: "mic",
    purpose: "A big talk button. Speech comes back as text.",
    tags: ["voice", "speech", "dictate", "talk", "transcript", "notes"],
    yl: `mic "What did you eat today?"`,
  },
  gallery: {
    shelf: "media", doc: "gallery",
    purpose: "Photos and videos in a row, a grid, a feed or a coverflow. +pick to choose favorites.",
    tags: ["photos", "carousel", "grid", "album", "choose images", "portfolio"],
    yl: `say "Six shots from the studio. Pick up to three."
gallery /demo/g1.jpg /demo/g2.jpg /demo/g3.jpg /demo/g4.jpg /demo/g5.jpg /demo/g6.jpg layout=grid +pick max=3 submit="Use these"`,
  },
  video: {
    shelf: "media", doc: "video",
    purpose: "One video with controls. With no URL it is a placeholder for one to generate.",
    tags: ["clip", "reel", "movie", "review", "playback"],
    yl: `video /demo/reel.mp4 "Launch reel, first cut" poster=/demo/reel-poster.jpg
ask "Ship this cut?" Ship|"One more pass"`,
  },
  compare: {
    shelf: "media", doc: "compare",
    purpose: "Before and after: a drag slider, side by side or tap to toggle, with highlights.",
    tags: ["before after", "diff", "a/b", "slider", "redesign", "edit result"],
    yl: `compare /demo/before_mug.jpg /demo/after_mug.jpg "Background swap" notes="Same mug, new scene"`,
  },
  storyboard: {
    shelf: "media", doc: "storyboard",
    purpose: "Frames in order, with captions. +reorder lets the person drag them.",
    tags: ["frames", "script", "shot list", "video plan", "reorder", "social post"],
    yl: `storyboard "Launch reel" /demo/s1.jpg|"Quiet morning" /demo/s2.jpg|"The old chipped mug" /demo/s3.jpg|"Unwrap the new one" /demo/s4.jpg|"First sip, logo" +reorder`,
  },
  chart: {
    shelf: "data", doc: "chart",
    purpose: "Line, bar, area, scatter, pie or donut, with error bars and series.",
    tags: ["graph", "plot", "trend", "analytics", "pie", "bar"],
    yl: `chart line "Weight this week" x=Mon|Tue|Wed|Thu|Fri|Sat|Sun y=181.2|180.6|180.9|179.8|179.4|179.6|178.9 unit=lb`,
  },
  stat: {
    shelf: "data", doc: "stat",
    purpose: "One big number with its change and a sparkline.",
    tags: ["kpi", "metric", "number", "dashboard", "delta", "sparkline"],
    yl: `stat 178.9lb Weight delta=-2.3 spark=181.2|180.6|180.9|179.8|179.4|179.6|178.9 good=down sub="this week"
stat 7.4h Sleep delta=+0.6 spark=6.5|6.9|7.1|6.8|7.3|7.6|7.4`,
  },
  math: {
    shelf: "data", doc: "math",
    purpose: "An equation, typeset. The rest of the line is TeX.",
    tags: ["equation", "tex", "latex", "formula", "homework"],
    yl: `math size=lg x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}`,
  },
  step: {
    shelf: "data", doc: "step",
    purpose: "Steps one at a time, with math or a timer. Lines in a row make one stepper.",
    tags: ["derivation", "protocol", "recipe", "how to", "walkthrough", "instructions"],
    yl: `step title="Gram stain" "Heat-fix the smear. Flood with crystal violet." time=1m
step "Rinse gently with water. Flood with iodine." time=1m
step "Rinse. Counterstain with safranin." time=45s`,
  },
  calc: {
    shelf: "data", doc: "calc",
    purpose: "A live formula: sliders for the inputs, the answer and a chart update as they move.",
    tags: ["calculator", "formula", "sliders", "physics", "what if", "estimate"],
    yl: `calc "How far does it fly?" f="R = v^2*sin(2*a)/g" v=5-40@20m/s a=0-90@30deg g=9.81m/s^2 plot=a unit=m`,
  },
  deck: {
    shelf: "group", doc: "deck",
    purpose: "Swipeable pages, with quiz questions mixed in.",
    tags: ["slides", "lesson", "presentation", "onboarding", "quiz", "story"],
    yl: `deck "Writing a first draft"
page "Get it down, then get it right" body="A first draft is for you. Nobody else reads it."
page "Three rules" points="Write fast, fix later|Leave gaps and keep going|Stop mid-sentence"
choose "What comes first?" "Write it"|"Fix it" answer="Write it"`,
  },
  page: {
    shelf: "group", doc: "page",
    purpose: "One page of a deck or a plan: a title, a body, points, a picture.",
    tags: ["slide", "section", "findings", "explain", "read"],
    yl: `deck "Build review"
page "What broke" body="Two buttons only took taps on their icon." points="Gallery X: full 44pt target|Done pill: never covered"`,
  },
  plan: {
    shelf: "group", doc: "plan",
    purpose: "Pages first, questions after, one Send at the end. Opens full screen.",
    tags: ["wizard", "intake", "questionnaire", "multi step", "onboarding", "survey"],
    yl: `plan@month "Your first month" submit="Build my plan" +inline
choose@goal "What's the goal?" "Get stronger"|"Lose fat"|"Run a 5k" +other
slide@days "Days a week you can train" 2-6 value=3
pick@gear "What do you have?" Dumbbells|Barbell|Bands|"Just me"`,
  },
  project: {
    shelf: "group", doc: "project",
    purpose: "A project card: status, progress, facts, next steps, and a button that reopens its plan.",
    tags: ["status", "progress", "tracker", "summary", "resume"],
    yl: `project "Kiln & Co. website" status=Planning progress=40 img=/demo/site_after_hero.jpg body="A small site for a pottery studio." facts="Kind: Local business|Pages: Home, Classes, Visit" next="Pick a template|Write the class copy"`,
  },
  narrate: {
    shelf: "group", doc: "narrate",
    purpose: "The agent reads a set of pages aloud and turns them as it goes.",
    tags: ["voice over", "walkthrough", "read aloud", "tour", "presentation"],
    yl: `narrate "What changed on the site" voice=agent
compare /demo/site_before_hero.jpg /demo/site_after_hero.jpg "The hero" notes="Headline says what you get" say="First, the hero. The new headline says what you will make."
compare /demo/site_before_classes.jpg /demo/site_after_classes.jpg "Classes" notes="Three cards with a photo and a price" say="Next, classes. A wall of text became three cards."`,
  },
  timeline: {
    shelf: "group", doc: "timeline",
    purpose: "What is done, what is happening now, what comes next.",
    tags: ["history", "roadmap", "itinerary", "status", "schedule", "changelog"],
    yl: `timeline "Lisbon, 4 days" mark="Right now"
done "Tram 28 and the castle" at=Fri
now "Time Out Market for lunch" at=12:30 sub="10 min walk"
next "Sunset at Miradouro da Graca" at=19:40`,
  },
  done: {
    shelf: "group", doc: "done-now-next",
    purpose: "A finished item in a timeline.",
    tags: ["timeline", "shipped", "complete", "history"],
    yl: `timeline "This week"
done "Saved screens" at="Sep 24"
done "Links open Safari" at="Sep 25"`,
  },
  now: {
    shelf: "group", doc: "done-now-next",
    purpose: "The item happening right now in a timeline.",
    tags: ["timeline", "current", "in progress", "live"],
    yl: `timeline "Today"
done "Warm-up" at=9:00
now "Main lift" at=9:15 sub="Back squat 5x5"`,
  },
  next: {
    shelf: "group", doc: "done-now-next",
    purpose: "A coming item in a timeline.",
    tags: ["timeline", "upcoming", "planned", "queue"],
    yl: `timeline "Up next"
now "Reply to a message"
next "Each agent's home"
next "Agent controls in the drawer"`,
  },
  sketch: {
    shelf: "group", doc: "sketch",
    purpose: "A quick drawing of a screen: strike what goes, highlight what stays.",
    tags: ["wireframe", "mockup", "before after", "feedback", "layout", "redline"],
    yl: `sketch "Build ready" frame=phone
row "Build 97 is ready" +hi note="the headline"
row "Got it" +button +x note="does nothing, cut it"
row "Install" +button +hi note="does the thing"`,
  },
  row: {
    shelf: "group", doc: "row-after",
    purpose: "One line of a sketch: text, a button, struck out or highlighted.",
    tags: ["sketch", "line", "wireframe", "markup"],
    yl: `sketch "Home" frame=window
row "Wheel-thrown mugs, made in Asheville" +hi note="keep"
row "Welcome to our website!" +x note="says nothing"
row "Book a class" +button +hi`,
  },
  after: {
    shelf: "group", doc: "row-after",
    purpose: "Splits a sketch into before and after.",
    tags: ["sketch", "before after", "diff", "redesign"],
    yl: `sketch "Where it landed" frame=bubble before="Before"
row "Parked YUI-83 in the backlog" +x note="an id means nothing"
after "Now"
row "Parked the drawing card in the backlog" +hi note="plain words"`,
  },
  shapes: {
    shelf: "show", doc: "shapes",
    purpose: "A small moving diagram: circles, boxes and arrows that come on one by one, with a caption.",
    tags: ["diagram", "explain", "idea", "flowchart", "animation", "concept"],
    yl: `shapes "How an ask reaches the app" caption="You ask, it lands on the board, a lane builds it, and it ships."
shape circle You +grow
shape arrow
shape box Board +fill
shape arrow
shape pill Lane +pulse
shape arrow label=ships
shape circle Phone tone=mint`,
  },
  shape: {
    shelf: "show", doc: "shape",
    purpose: "One part of a diagram: a circle, box, pill, dot, blob, text, line, arrow or path.",
    tags: ["diagram", "circle", "box", "arrow", "label", "part"],
    yl: `shapes "Where the time goes" w=10 h=5 caption="Most of a reply is the model thinking."
shape@think blob Thinking at=3,2.5 size=4,3 tone=lavender +fill +grow
shape@draw dot at=8,2.5 tone=mint
shape text "drawing" at=8,3.4
shape arrow from=think to=draw +dash`,
  },
  game: {
    shelf: "play", doc: "game",
    purpose: "A small game on the phone: tic-tac-toe, snake or memory. The result comes back.",
    tags: ["play", "fun", "tic tac toe", "snake", "memory", "kids", "break"],
    yl: `say Your move. You are X.
game tictactoe "Beat me"`,
  },
  flow: {
    shelf: "group", doc: "flow",
    purpose: "A saved series of screens that branches on answers, written in Mermaid.",
    tags: ["branching", "wizard", "intake", "script", "mermaid", "saved"],
    yl: `flow workout-checkin`,
  },
};

// What an agent means when it reaches for each entry, in its own words. Search reads
// these first after the name, so "get a client's website brief" finds the intake flow.
export const INTENTS = {
  timer: ["time a workout", "run an interval timer", "count down rest"],
  ask: ["ask a yes or no question", "confirm before acting", "get a quick decision"],
  choose: ["ask them to pick one option", "run a poll", "offer a menu"],
  pick: ["let them choose several", "collect preferences", "multi select from a list"],
  slide: ["ask for a number", "rate something on a scale", "ask how much"],
  form: ["collect details", "sign someone up", "ask several questions at once"],
  list: ["show a checklist", "give a to-do list", "list steps or items"],
  table: ["show rows and columns", "compare options side by side", "show a log"],
  query: ["track something over time", "show totals from a table", "keep a log and chart it"],
  card: ["show a result with one button", "preview a link", "summarize one thing"],
  image: ["show a picture", "ask them to mark up a photo", "show a generated image"],
  camera: ["ask for a photo", "scan a receipt or document", "take a picture"],
  mic: ["let them talk instead of type", "take a voice note", "dictate an answer"],
  gallery: ["show several photos", "let them pick favorite images", "show a portfolio"],
  video: ["play a video", "review a clip", "share a reel"],
  compare: ["show before and after", "compare two versions", "show an edit result"],
  storyboard: ["plan a video shot by shot", "show frames in order", "let them reorder scenes"],
  chart: ["graph a trend", "plot numbers", "show a pie or bar chart"],
  stat: ["show one key number", "report a metric and its change", "show a dashboard number"],
  math: ["typeset an equation", "show a formula", "explain math"],
  step: ["walk through steps one at a time", "teach a procedure", "show a recipe"],
  calc: ["let them play with a formula", "estimate with sliders", "what if calculator"],
  deck: ["present slides", "teach a short lesson with a quiz", "explain in pages"],
  page: ["add a page to a deck", "explain findings", "show a section"],
  plan: ["run a multi step questionnaire", "onboard someone", "survey with one submit"],
  project: ["show project status", "track progress", "reopen a plan"],
  narrate: ["read pages aloud", "give a spoken tour", "walk through changes by voice"],
  timeline: ["show what is done and what is next", "show a roadmap", "plan an itinerary"],
  done: ["mark an item finished in a timeline"],
  now: ["show what is happening now in a timeline"],
  next: ["show what comes next in a timeline"],
  sketch: ["mock up a screen", "wireframe a layout", "mark what to cut and keep"],
  row: ["add a line to a sketch", "strike or highlight part of a mockup"],
  after: ["show a sketch before and after"],
  shapes: ["draw a diagram of an idea", "explain how parts connect", "animate a concept"],
  shape: ["add a part to a diagram", "draw an arrow between two things"],
  game: ["play a game", "take a break with tic tac toe", "entertain a kid"],
  flow: ["run a saved flow by name", "branching questions", "reuse a conversation"],
  "website-intake": ["client intake", "get a client's website brief", "plan a website with a client", "scope a site redesign or shop"],
  "self-scope": ["scope a project", "turn an idea into a plan", "size up work"],
  "workout-checkin": ["check in before a workout", "ask about sleep and soreness", "adjust a training plan"],
  onboarding: ["onboard a new user", "first run welcome", "learn about someone and suggest agents"],
  connect: ["connect tools", "ask permission to use apps", "set up integrations"],
};

const docUrl = (anchor) => `${SITE}/yl#${anchor}`;
// A plain-lines playground link; readYL on the playground takes plain text.
export const playUrl = (yl, as) => `/playground?yl=${encodeURIComponent(yl)}${as ? `&as=${encodeURIComponent(as)}` : ""}`;

export const presets = () => PRESETS.map((name) => {
  const e = PRESET_ENTRIES[name];
  if (!e) return { name, kind: "preset", missing: true };
  return { name, kind: "preset", ...e, intents: INTENTS[name] || [], docs: docUrl(e.doc) };
});

export const flows = () => STARTER_FLOWS.map((f) => ({
  name: f.name,
  kind: "flow",
  title: f.title,
  purpose: f.blurb,
  intents: INTENTS[f.name] || [],
  agent: f.agent,
  tags: ["flow", ...f.title.toLowerCase().split(/\W+/).filter(Boolean)],
  yl: `flow ${f.name}`,
  source: f.source,
  demo: `flow-${f.name}`,
  docs: `${SITE}/developers/flows`,
}));

// What /library.json serves: the minimum an agent needs to find a screen and send it.
export function libraryIndex() {
  const items = [
    ...presets().map((p) => ({ name: p.name, kind: "preset", purpose: p.purpose, intents: p.intents, tags: p.tags, yl: p.yl, docs: p.docs, playground: `${SITE}${playUrl(p.yl)}` })),
    ...flows().map((f) => ({ name: f.name, kind: "flow", title: f.title, purpose: f.purpose, intents: f.intents, tags: f.tags, yl: f.yl, source: f.source, docs: f.docs, playground: `${SITE}/playground?demo=${f.demo}` })),
  ];
  return {
    name: "Yui library",
    version: 2,
    about: "Every screen preset and saved flow an agent can send to the Yui app. Send the yl lines as your reply; the app draws them. A flow's source is its Mermaid. Search by name, intent, purpose or tags, or ask the search endpoint.",
    search: `${SITE}/api/library?q=`,
    spec: `${SITE}/yl`,
    page: `${SITE}/developers/library`,
    items,
  };
}

// Search, the same on the page, at /api/library?q= and in the yui_library MCP tool.
// Every word must hit somewhere; each word scores its best field (name, then title,
// intents, tags, purpose, lines), and the whole query found in an intent or the title
// adds a bonus. Ties keep library order. Plain string matching: no model, no spend.
// Parts that only live inside a group rank under their group head unless asked for by name.
const MEMBERS = new Set(["page", "done", "now", "next", "row", "after", "shape"]);
const STOP = new Set(["a", "an", "the", "and", "or", "of", "to", "for", "with", "in", "on", "my", "me", "i", "some", "that"]);
const WEIGHTS = [["name", 10], ["title", 6], ["intents", 5], ["tags", 4], ["purpose", 2], ["yl", 1]];
const words = (q) => {
  const all = String(q || "").toLowerCase().split(/[^a-z0-9'/-]+/).filter(Boolean);
  const kept = all.filter((w) => !STOP.has(w));
  return kept.length ? kept : all;
};
const field = (item, k) => (Array.isArray(item[k]) ? item[k].join(" | ") : String(item[k] || "")).toLowerCase();

export function score(item, query) {
  const ws = words(query);
  if (!ws.length) return 1;
  let total = 0;
  for (const w of ws) {
    let best = 0;
    for (const [k, n] of WEIGHTS) if (field(item, k).includes(w)) best = Math.max(best, n);
    if (!best) return 0;
    total += best;
  }
  const name = String(item.name).toLowerCase();
  if (name === ws.join(" ")) return total + 10;
  const phrase = String(query).toLowerCase().trim().replace(/\s+/g, " ");
  if (ws.length > 1 && (field(item, "intents").includes(phrase) || field(item, "title").includes(phrase))) total += 8;
  return MEMBERS.has(name) ? Math.ceil(total / 2) : total;
}

export const matches = (item, query) => score(item, query) > 0;

// The public guard over what /library.json serves: the whole index by the site's rule, and
// each flow's Mermaid by the spec rule (a flow's budget slider says "$2k", as a spec may).
export function libraryLeaks(index) {
  const out = [];
  const bare = { ...index, items: index.items.map(({ source, ...i }) => i) };
  for (const line of JSON.stringify(bare, null, 1).split("\n")) {
    const leak = findLeak(line);
    if (leak) out.push(`library.json: ${leak[0]} "${leak[1]}" in ${line.trim().slice(0, 80)}`);
  }
  for (const i of index.items) {
    const leak = i.source && findDocLeak(i.source);
    if (leak) out.push(`flow ${i.name}: ${leak[0]} "${leak[1]}" in its Mermaid`);
  }
  return out;
}

// Ranked hits, best first. `kind` narrows to "preset" or "flow".
export function search(items, query, { limit = 10, kind } = {}) {
  return items
    .map((item, i) => ({ item, i, s: kind && item.kind !== kind ? 0 : score(item, query) }))
    .filter((h) => h.s > 0)
    .sort((a, b) => b.s - a.s || a.i - b.i)
    .slice(0, limit)
    .map((h) => ({ ...h.item, score: h.s }));
}
