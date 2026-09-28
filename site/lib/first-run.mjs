// The first-run flow (SITE-88, PROP-1 Pick your crew): every word and screen of the hero phone on
// /proposals/pick-your-crew, in one file so the app build can reuse the copy later.
// Crew names, lines, tools, colors and looks come from lib/crew-page.mjs (the app's profiles); the
// starter screens are real Yui Lines from the starter flows (lib/yl/starter-flows.mjs) and the tools' screens.
// The commands come from lib/start-paths.mjs, the real install paths.
import { MEMBERS, inNext, NEXT_LABEL } from "./crew-page.mjs";
import { CREW } from "./chat/crew.mjs";
import { HERMES, MCP_URL } from "./start-paths.mjs";

// The rail: one entry per step, in order. `id` is the phone screen it opens.
export const STEPS = [
  { id: "tf", label: "Install", line: "Get Yui from TestFlight" },
  { id: "apple", label: "Sign in", line: "One tap with Apple" },
  { id: "hi", label: "Say hi", line: "Yui asks who joins" },
  { id: "pick", label: "Pick your crew", line: "Tap a row to add it" },
  { id: "dig", label: "Dig deeper", line: "What each one does, and its screens" },
  { id: "own", label: "Bring your own", line: "Pair an agent you already run" },
  { id: "done", label: "Your crew", line: "Home, one tap each" },
];

export const TESTFLIGHT = {
  app: "Yui",
  by: "Yui",
  sub: "Agents that answer with screens",
  rating: "Free | TestFlight beta",
  install: "Install",
  installing: "Installing",
  open: "Open",
  note: "iOS 26 or later",
};

export const APPLE = {
  title: "Sign in to Yui",
  body: "Use your Apple ID. Yui gets your name and a private email, nothing else.",
  who: "Your Apple ID",
  cta: "Continue",
  hide: "Hide my email",
  signing: "Signing in",
};

export const HI = {
  say: "Hi, I'm Yui. Let's pick your crew.",
  sub: "Who joins you? You can change it any time.",
  cta: "Choose my crew",
};

export const PICK = {
  title: "Pick your crew",
  sub: "Tap a row to add it.",
  more: "More",
  own: { name: "Bring my own agent", line: "Hermes, OpenClaw, Claude Code or anything else" },
  cta: (n) => (n ? `Start with ${n}` : "Pick at least one"),
};

// The starter screens for each crew member (Yui Lines, drawn live with LiveScreen). The first is the flow's
// opening page, the rest are its real questions and tools.
const SCREENS = {
  yui: [
    { label: "Hello", yl: MEMBERS[0].yl },
    { label: "Ask", yl: `say "Ask me anything. I know the whole crew and I send you to the right one."\nchoose "Who should handle it?" Arnold|Basil|Gouda|Penny|Quill +other` },
    { label: "Crew", yl: `list "Your crew" "Arnold, your trainer"|"Basil, what you eat"|"Gouda, beats and chords"|"Penny, your week"|"Quill, learning" +check` },
  ],
  arnold: [
    { label: "Check-in", yl: `page "Let's build today's session" body="Four quick questions. Your answers pick the moves and the intervals, then the timer runs it." points="How you slept|Anything sore|Minutes free|Your gear"` },
    { label: "Sleep", yl: `slide "How did you sleep?" 1-10 Awful|Great` },
    { label: "Timer", yl: `timer@hiit 40/20x8 Tabata +auto` },
  ],
  basil: [
    { label: "Snap a plate", yl: `page "Snap a plate, get the macros" body="Pick a plate. I guess what's on it and say how sure I am. You fix what I got wrong, and it goes in your log." points="Pick a photo|My guess, and how sure|Fix the portion|Today's totals"` },
    { label: "Pick a plate", yl: `choose "Which plate is yours?" Pancakes|Salmon|"Poke bowl"` },
    { label: "Macros", yl: `table Macros Food|Cal|Protein "Eggs|140|12" "Oats|300|10" "Chicken|280|53" "Greek yogurt|150|20"` },
  ],
  gouda: [
    { label: "Vibe", yl: `page "From a vibe to a beat" body="Pick a vibe and I build the beat, kick and snare first. You set the tempo, change a row and pick the chords." points="Pick a vibe|Set the tempo|Change one row|Chords under it"` },
    { label: "Pick a vibe", yl: `choose "What's the vibe?" Lo-fi|"Boom bap"|House|Rock` },
    { label: "Practice", yl: `timer 5m Warm up on the keys +inline\nlist Today "Two chords, slow" "Add the beat" "Play it through" +check` },
  ],
  penny: [
    { label: "Your week", yl: `page "From a busy week to a plan" body="Tell me what's on it and what matters most. I lay it out by day and hand you a checklist to keep." points="What's on this week|What matters most|Your week, day by day|A checklist to keep"` },
    { label: "What's on", yl: `pick "What's on this week?" "A work deadline"|Appointments|Errands|Bills|"Family time"|Workouts` },
    { label: "Today", yl: `list Today "Send the deadline draft" "Call the dentist" "Pick up groceries" "Evening walk" +check` },
  ],
  quill: [
    { label: "Lesson", yl: `page "Five minutes, then a quiz" body="Pick a topic. I teach it one idea a page, with a picture each, then ask you one question." points="Pick a topic|A short lesson|One question|A calculator to play with"` },
    { label: "Topic", yl: `choose "What do you want to learn?" "How vaccines work"|"How a ball flies"|"How money grows"` },
    { label: "Quiz", yl: `choose "Which one slows the spread most?" "Hand washing"|"Wearing a hat"|"Sitting far away" body="One question, then it becomes a card you review later."` },
  ],
};

// The crew rows. `about` is the line on the dig-deeper page, `hello` what the thread opens with.
const HELLO = { yui: "Hi, I'm Yui. Your crew is here. Or ask me anything." };
// One short line per row; Yui's own is longer on its page.
const ROW_LINE = { yui: "Ask anything, get sent to the right one" };
export const CREW_ROWS = MEMBERS.map((m) => {
  const cm = CREW.find((c) => c.handle === m.handle);
  return {
    handle: m.handle,
    name: m.name,
    role: m.role,
    line: ROW_LINE[m.handle] || m.line.replace(/\.$/, ""),
    color: m.color,
    c: m.c,
    look: m.look,
    // a plain label for aria: roles, never names (public guard)
    label: m.role.toLowerCase(),
    tools: m.tools.map((t) => ({ t: t.t, next: inNext(t.card) ? NEXT_LABEL : "" })),
    screens: SCREENS[m.handle],
    hello: cm?.hello || HELLO[m.handle],
  };
});

export const DIG = { tools: "What it does", screens: "Starter screens", about: "About", add: "Add to my crew", added: "In your crew", back: "Back" };

// Bring your own agent. The pairing code is a sample: the app shows a fresh one.
export const OWN = {
  title: "Bring your own agent",
  sub: "Pick what it runs on. Yui shows a code and the one command.",
  code: "482913",
  codeNote: "Your code, good for 10 minutes",
  choices: [
    { id: "hermes", name: "Hermes", line: "Three commands, then it is on your phone", cmd: HERMES.pair.replace("123456", "482913"), where: "Run on the machine with Hermes." },
    { id: "openclaw", name: "OpenClaw", line: "A channel plugin, one pair command", cmd: "openclaw yui pair 482913", where: "Run on the machine with OpenClaw." },
    { id: "claude-code", name: "Claude Code", line: "Add Yui as an MCP server", cmd: `claude mcp add --transport http yui ${MCP_URL}`, where: "Run in your terminal, then approve it in Yui." },
    { id: "other", name: "Something else", line: "Any agent that answers a web request", cmd: "python3 python/yui_webhook.py pair 482913 --ref my-agent", where: "The webhook bridge, from the app repo." },
  ],
  copy: "Copy command",
  copied: "Copied",
  add: "Add to my crew",
  back: "Back",
};

export const DONE = {
  title: "Your crew",
  sub: "One tap each. More can join any time.",
  empty: "Nobody yet. Pick someone.",
  replay: "Replay",
  edit: "Change my crew",
  open: "Open thread",
  backToCrew: "Back to crew",
};
