// The site chat asks for feedback first (SITE-67). The chat opens on four choices (and Meet the crew, SITE-69): what they like or
// not, the pitch, how to help, or just a demo. This file holds the screens for the first three, so the
// brief can hand them to the model word for word, and turns a sent feedback flow into notes the route
// saves on its own (the likes and dislikes never depend on the model remembering take_note).
// No server imports: the page reads HELLO and STARTERS from here too.

export const HELLO = "Hi, I'm Yui. What you think shapes what we build. Where do we start?";
// SITE-69: Meet the crew, the five starter agents, each with a flow to try (lib/chat/crew.mjs).
export const STARTERS = ["What do you like, or not?", "Give me the pitch", "How can I help?", "Just show me", "Meet the crew"];

export const LIKES = ["Screens, not text", "Timers and tools", "My own agent", "Open source", "Built in public", "Voice"];
export const DISLIKES = ["Hard to get", "iPhone only", "Needs an agent", "Too much to read", "Not sure it's for me"];

const opts = (a) => a.map((o) => (/^[\w.-]+$/.test(o) ? o : `"${o}"`)).join("|");

// Like and dislike: one full-screen flow, one Send at the end.
export const FEEDBACK_PLAN = [
  `plan@feedback "What you think" submit="Send it"`,
  `pick@likes "What do you like?" ${opts(LIKES)} +other`,
  `pick@dislikes "What's not landing?" ${opts(DISLIKES)} +other`,
  `form@line "One thing you'd change or add" idea:text`,
  `end`,
].join("\n");

// The pitch, from the positioning brief (docs/business/BIZ-1-marketing-positioning.md).
export const PITCH = [
  `>full`,
  `deck "The pitch"`,
  `page "Meet Yui" body="A generative user interface. Your agent stops describing things and starts showing them: a question becomes two buttons, a workout becomes a timer."`,
  `page "Where it started" body="Chris asked his trainer agent for intervals mid-workout and got a paragraph. 'If it asks me a question, I just want a button.' Now that ask comes back as a full interval timer."`,
  `page "What sets it apart" body="Native iPhone screens, not web pages in a frame. Your own agent, not ours: Hermes, OpenClaw, MCP and more. Open source, built in public."`,
  `page "Get it" body="Free on TestFlight for iPhone on iOS 26. Sign in with Apple. Yui and a starter crew are already there."`,
  `end`,
  `choose "What now?" "Tell you what I think"|"How can I help?"|"Show me a screen"`,
].join("\n");

// How to help: a card each, every one with a button. The share card has no url: the page shares it.
export const HELP = (testflight) => [
  `card "Try it, then tell us" body="Use Yui on TestFlight and send feedback from the app. It lands on our board." cta="Get TestFlight" url=${testflight || "/start"}`,
  `card "Lend your agent" body="Yui@home: your AI agent picks up open cards with its spare tokens." cta="Open Yui@home" url=/contribute`,
  `card "Build to earn" body="Merged work earns points on a public ledger. A draft: no token, nothing for sale." cta="See how" url=/earn`,
  `card@share "Share the site" body="Know someone who runs AI agents? Send them yuigui.com." cta="Share it"`,
].join("\n");
export const SHARE_URL = "https://www.yuigui.com";

const words = (v) => (Array.isArray(v) ? v : v == null ? [] : [v])
  .map((x) => String(typeof x === "number" ? x : x ?? "").trim()).filter(Boolean).slice(0, 12);
const clip = (s, n) => String(s || "").trim().slice(0, n);

// A sent feedback flow ({id: "feedback", preset: "plan", plan: {likes, dislikes, line}}) -> notes.
// Likes are praise, dislikes are confusion. The open line is left to the model (it picks the kind),
// with `line` returned so the route can fall back to a feature note when the model skips it.
export function feedbackNotes(ev) {
  if (!ev || ev.id !== "feedback" || ev.preset !== "plan" || !ev.plan || typeof ev.plan !== "object") return null;
  const p = ev.plan;
  const notes = [];
  for (const w of words(p.likes)) notes.push({ kind: "praise", text: `Likes: ${clip(w, 200)}`, quote: LIKES.includes(w) ? null : clip(w, 200) });
  for (const w of words(p.dislikes)) notes.push({ kind: "confusion", text: `Not landing: ${clip(w, 200)}`, quote: DISLIKES.includes(w) ? null : clip(w, 200) });
  const raw = p.line && typeof p.line === "object" ? Object.values(p.line).join(" ") : p.line;
  const line = clip(raw, 500) || null;
  return { notes: notes.slice(0, 16), line };
}

export const LINE_KIND = "feature";
