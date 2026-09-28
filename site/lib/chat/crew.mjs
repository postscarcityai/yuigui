// Meet the crew in the site chat (SITE-69). The five starter agents on one screen, each in their own
// colors with one line on what they do (their taglines, yui runtime/profiles/<name>/profile.json). A
// tap on one plays their saved flow (SITE-70 to SITE-74) in their colors and voice; after its Send,
// their answer (crewReply) and one like or dislike question (SITE-67); that answer is noted and the
// crew comes back as "Meet another". Every step here is answered with no model turn.
// No server imports: the page reads CREW and crewOf from here too.
import { crewReply } from "../yl/starter-flows.mjs";

// c: the member's color, as the playground draws them (Playground.js COLORS, group.js LOOKS).
export const CREW = [
  { name: "Arnold", handle: "arnold", role: "Trainer", c: "#ff6b3d", flow: "trainer-session", id: "session",
    line: "Workouts built around your week and body",
    hello: "Arnold here. Four quick questions, then today's session and a timer to run it." },
  { name: "Basil", handle: "basil", role: "Nutritionist", c: "#2FB58C", flow: "nutritionist-plate", id: "plate",
    line: "Eat better without counting everything",
    hello: "Basil here. Pick a plate and I'll read it. Tell me where I'm off." },
  { name: "Gouda", handle: "gouda", role: "Musician", c: "#9B87F5", flow: "musician-jam", id: "jam",
    line: "Beats, chords and practice, right on screen",
    hello: "Gouda here. Pick a vibe and we build a beat, row by row." },
  { name: "Penny", handle: "penny", role: "Planner", c: "#e8a33d", flow: "planner-week", id: "busy",
    line: "Get your week out of your head",
    hello: "Penny here. Tell me what's on this week and I'll lay it out." },
  { name: "Quill", handle: "quill", role: "Study buddy", c: "#8b7cff", flow: "study-quiz", id: "study",
    line: "Learn anything fast, then get quizzed",
    hello: "Quill here. One topic, five minutes, one question at the end." },
];
const byName = (s) => CREW.find((m) => m.name === s) || null;
const byHandle = (s) => CREW.find((m) => m.handle === s) || null;
const byFlowId = (s) => CREW.find((m) => m.id === s) || null;

export const MEET = "Meet the crew";
export const LIKE = ["I like it", "Not for me"];

// The crew screen: one choose, drawn as the five in their colors (ChatCrew.js). Anywhere else it is
// still a plain choose of five names.
export function crewScreen(again = false) {
  const names = CREW.map((m) => m.name).join("|");
  return again
    ? `choose@crew "Who's next?" ${names} title="Meet another" body="Each one runs a real flow, start to end."`
    : `choose@crew "Who do you want to meet?" ${names} title="${MEET}" body="Every account comes with these five, each in their own colors. Tap one to try their flow."`;
}

const block = (...lines) => `\`\`\`yui\n${lines.join("\n")}\n\`\`\``;
const likeLine = (m) => `choose@crewlike-${m.handle} "How did ${m.name} do?" "${LIKE[0]}"|"${LIKE[1]}" +other`;

// "Meet the crew", "meet another": the words a visitor types or taps for the crew screen.
const ASKS = /^(meet (the )?(starter )?crew|meet another( one)?|show me the crew)$/;
const said = (t) => String(t || "").toLowerCase().replace(/[^a-z ]+/g, " ").replace(/\s+/g, " ").trim();

// One crew turn, or null when this turn is not the crew's.
//   -> { reply, notes, agent }   agent: the member whose colors the answer wears (null: Yui's)
export function crewTurn(text, ev) {
  if (ev?.id === "crew" && ev.preset === "choose") {
    const m = byName(ev.choice);
    if (!m) return null;
    return { reply: `${m.hello}\n\n${block(`flow@${m.id} ${m.flow}`)}`, notes: [], agent: m.name };
  }
  const like = typeof ev?.id === "string" && ev.preset === "choose" && ev.id.match(/^crewlike-(\w+)$/);
  if (like) {
    const m = byHandle(like[1]);
    if (!m) return null;
    const choice = String(ev.choice ?? "").trim().slice(0, 300);
    const kind = choice === LIKE[0] ? "praise" : choice === LIKE[1] ? "confusion" : "feature";
    const typed = !LIKE.includes(choice);
    const notes = choice ? [{ kind, text: `${m.name}'s flow (${m.flow}): ${typed ? choice : choice.toLowerCase()}`, quote: typed ? choice : null }] : [];
    const thanks = kind === "praise" ? `Glad ${m.name} landed. The team hears it.` : kind === "confusion" ? "Thanks for saying so. It goes to the team." : "Got it. That goes to the team, word for word.";
    return { reply: `${thanks}\n\n${block(crewScreen(true))}`, notes, agent: null };
  }
  const done = crewReply(ev);
  if (done) {
    const m = byFlowId(ev.id);
    const tail = m ? `\n\n${block(likeLine(m))}` : "";
    return { reply: `${done.text}\n\n${block(...done.lines)}${tail}`, notes: [], agent: m?.name || null };
  }
  if (!ev && ASKS.test(said(text))) {
    return { reply: `Five agents, one tap each.\n\n${block(crewScreen(false))}`, notes: [], agent: null };
  }
  return null;
}

// Whose colors an answer wears, read from the answer itself: a crew flow, or a crew member's like
// question. So a flow the model sends on its own wears its member's colors too.
export function crewOf(content) {
  const s = String(content || "");
  const like = s.match(/choose@crewlike-(\w+)\b/);
  if (like) return byHandle(like[1]);
  const flow = s.match(/^\s*flow@(\w+) ([\w-]+)\s*$/m);
  if (flow) { const m = byFlowId(flow[1]); return m && m.flow === flow[2] ? m : null; }
  return null;
}
