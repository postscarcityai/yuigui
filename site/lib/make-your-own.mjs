// Make your own on /crew (SITE-159, web twin of YUI-138 Start blank). Five questions, one at a time, in the app's
// order: name, voice, look, favorite screens, model. Not sure and Skip on every step. Then the new agent greets in
// the voice picked. Pure: the questions and the Yui Lines for each screen. Nothing here calls an agent.
export const NOT_SURE = "Not sure";
export const SKIP = "Skip";

export const ASK = [
  { id: "name", label: "Name", say: "I'm new here and I can be anything. Five taps and I'm yours.", q: "What should I be called?", options: ["Nova", "Sage", "Pip", "Kit"] },
  { id: "voice", label: "Voice", say: "Good name. Next.", q: "How should I talk?", options: ["Warm", "Short", "Playful", "Calm", "Blunt"] },
  { id: "look", label: "Look", say: "Now my look.", q: "What should I look like?", options: ["Lavender", "Mint", "Butter"] },
  { id: "screens", label: "Screens", say: "Nearly there.", q: "Which screens should I reach for?", options: ["Buttons", "Lists", "Cards", "Timers", "Forms", "Charts", "Decks"] },
  { id: "model", label: "Model", say: "Last one.", q: "Which model should I run on?", options: ["Yui's pick", "GLM 5.2", "GLM-5V-Turbo"] },
];

const q = (s) => `"${s}"`;
const opt = (o) => (/[ ,']/.test(o) ? q(o) : o);
const pickedOr = (v, d) => (v && v !== NOT_SURE && v !== SKIP ? v : d);

export const askLines = (step) => {
  const s = ASK[step];
  return `say ${s.say}\nchoose ${q(s.q)} ${[...s.options, NOT_SURE].map(opt).join("|")}\ncard@blank-skip "Skip for now" "Keep it blank. Name it any time from its page." cta="Skip"`;
};

const HELLO = {
  Warm: (n) => `Hi, I'm ${n}. So glad you made me. What are we doing first?`,
  Short: (n) => `${n}. Ready. What's first?`,
  Playful: (n) => `Hey, it's ${n}! Fresh out of the box. What shall we mess with?`,
  Calm: (n) => `Hello. I'm ${n}. No rush. Tell me where to start.`,
  Blunt: (n) => `I'm ${n}. Tell me the job.`,
};

export const SKIPPED = {};

export function greetLines(ans = {}) {
  const name = pickedOr(ans.name, "Nova");
  const voice = pickedOr(ans.voice, "Warm");
  const screens = pickedOr(ans.screens, "Cards");
  const model = pickedOr(ans.model, "Yui's pick");
  const look = pickedOr(ans.look, "Lavender");
  return `say ${(HELLO[voice] || HELLO.Warm)(name)}\ncard ${q(name)} body=${q(`${voice} voice, ${look.toLowerCase()} look. Answers with ${screens.toLowerCase()}. Runs on ${model}.`)}`;
}

export const wholeLines = (ans) => `${ASK.map((s) => `choose ${q(s.q)} ${[...s.options, NOT_SURE].map(opt).join("|")}`).join("\n")}\n${greetLines(ans)}`;
