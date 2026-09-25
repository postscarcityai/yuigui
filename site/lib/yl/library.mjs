// The Yui library (FLOW-2): every preset and every saved flow, one entry each,
// for yuigui.com/developers/library and /library.json. Pure data, no React.
// A preset in PRESETS (yl.mjs) with no entry here fails scripts/library-check.mjs.
import { PRESETS } from "./yl.mjs";
import { STARTER_FLOWS } from "./starter-flows.mjs";

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

const docUrl = (anchor) => `${SITE}/yl#${anchor}`;
// A plain-lines playground link; readYL on the playground takes plain text.
export const playUrl = (yl, as) => `/playground?yl=${encodeURIComponent(yl)}${as ? `&as=${encodeURIComponent(as)}` : ""}`;

export const presets = () => PRESETS.map((name) => {
  const e = PRESET_ENTRIES[name];
  if (!e) return { name, kind: "preset", missing: true };
  return { name, kind: "preset", ...e, docs: docUrl(e.doc) };
});

export const flows = () => STARTER_FLOWS.map((f) => ({
  name: f.name,
  kind: "flow",
  title: f.title,
  purpose: f.blurb,
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
    ...presets().map((p) => ({ name: p.name, kind: "preset", purpose: p.purpose, tags: p.tags, yl: p.yl, docs: p.docs, playground: `${SITE}${playUrl(p.yl)}` })),
    ...flows().map((f) => ({ name: f.name, kind: "flow", title: f.title, purpose: f.purpose, tags: f.tags, yl: f.yl, docs: f.docs, playground: `${SITE}/playground?demo=${f.demo}` })),
  ];
  return {
    name: "Yui library",
    version: 1,
    about: "Every screen preset and saved flow an agent can send to the Yui app. Send the yl lines as your reply; the app draws them. Search by name, purpose or tags.",
    spec: `${SITE}/yl`,
    page: `${SITE}/developers/library`,
    items,
  };
}

// Client-side search: every word must match the name, purpose, tags or lines.
export function matches(item, query) {
  const words = String(query || "").toLowerCase().split(/\s+/).filter(Boolean);
  if (!words.length) return true;
  const hay = [item.name, item.title, item.purpose, ...(item.tags || []), item.yl].join(" ").toLowerCase();
  return words.every((w) => hay.includes(w));
}
