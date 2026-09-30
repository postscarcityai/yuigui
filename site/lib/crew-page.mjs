// Meet the crew (SITE-82): Yui and the five starter agents on one page, /crew, and as markdown at /md/crew.
// Names, roles, lines, colors and looks come from the app's profiles (yui runtime/profiles/<handle>/profile.json:
// tagline, color, visual.look). `c` is the member's strong color as the playground and the site chat draw
// them (lib/chat/crew.mjs). A tool's `card` is the app card that brings it: while builds.json's `next` list
// names that card, the tool reads "In the next build"; the next VALID build empties the list and the label goes.
import builds from "../content/builds.json";
import { CREW } from "./chat/crew.mjs";

// What a look hears, in words (the /crew card says it; nothing is ever listened to there).
const HEARS = { voice: "your voice", music: "music", mic: "the room", off: "nothing" };
export const hearsLabel = (h) => HEARS[h] || HEARS.voice;

const chat = Object.fromEntries(CREW.map((m) => [m.handle, m]));

export const MEMBERS = [
  {
    handle: "yui", name: "Yui", role: "Helper and maker", color: "brand", look: "orb", c: "var(--brand)",
    line: "Ask anything. Yui knows the whole crew and sends you to the right one.",
    tools: [
      { t: "Answers anything, with a screen when a screen is better" },
      { t: "Knows the crew and says who to ask, in one line" },
      { t: "A home with your whole crew, one tap each" },
    ],
    // Yui's real first screen (runtime/profiles/yui/first.yui).
    yl: `choose "Where do you want to start?" "Get fit"|"Eat better"|"Make music"|"Plan my week"|"Learn something" +other title="Hi, I'm Yui" body="Your crew is here. Or ask me anything."`,
    try: "Tap where you want to start",
  },
  {
    handle: "arnold", color: "butter", look: "waves",
    tools: [
      { t: "Builds your training week around your days and gear" },
      { t: "Runs today's workout: one move a page, sets to tick, rest starts itself", card: "YUI-182" },
      { t: "Logs every set, with a chart for each lift" },
    ],
    share: "trainer-session", try: "Answer five questions, then the timer runs",
  },
  {
    handle: "basil", color: "mint", look: "bloom",
    tools: [
      { t: "Snap a plate and today's macros fill in" },
      { t: "Plans your week of meals around your goal", card: "YUI-183" },
      { t: "Writes the grocery list, by aisle", card: "YUI-183" },
    ],
    share: "nutritionist-plate", try: "Pick a plate and see what he reads",
  },
  {
    handle: "gouda", color: "lavender", look: "grain",
    tools: [
      { t: "Teaches a song on chord buttons, the click counts you in", card: "YUI-184" },
      { t: "Builds beats on the looper and keeps them by name", card: "YUI-184" },
      { t: "A practice log with a streak", card: "YUI-184" },
    ],
    share: "musician-jam", try: "Pick a vibe and a beat comes up",
  },
  {
    handle: "penny", color: "butter", look: "aurora",
    tools: [
      { t: "Plans your week from a brain dump, said out loud", card: "YUI-185" },
      { t: "A today list with reminders", card: "YUI-185" },
      { t: "An evening review of what's left", card: "YUI-185" },
    ],
    share: "planner-week", try: "Say what's on and your week lays out",
  },
  {
    handle: "quill", color: "lavender", look: "orb",
    tools: [
      { t: "Five minute lessons, one idea and one picture a page" },
      { t: "Turns a lesson into cards you review on a schedule", card: "YUI-186" },
      { t: "Walks you through a math problem, step by step", card: "YUI-186" },
    ],
    share: "study-quiz", try: "Pick a topic, then one question at the end",
  },
].map((m) => {
  const cm = chat[m.handle];
  return cm ? { name: cm.name, role: cm.role, line: `${cm.line}.`, c: cm.c, yl: `flow@${cm.id} ${cm.flow}`, flow: cm.flow, ...m } : m;
});

// A card is in the next build while builds.json's `next` list names it, as its card or in its words ("(YUI-183, app half)").
const next = builds.next || [];
export const inNext = (card) => !!card && next.some((c) => c.card === card || (c.text || "").includes(`(${card},`));
export const NEXT_LABEL = "In the next build";
