// The playable first plan (SITE-118, web parity for PROP-4 / YUI-217). Four taps, then the split as a table.
// Pure: questions, the split for a set of answers, and the Yui Lines for each screen. The component only
// holds the answers; /crew#first-plan and /playground?yl= draw the same lines.
export const ASK = [
  { id: "days", say: "Hi, I'm Arnold. Four taps and you have a plan.", q: "How many days a week can you train?", options: ["2", "3", "4", "5", "6"], base: "3" },
  { id: "kind", say: "Good. What kind of training?", q: "Pick one", options: ["Lift heavy", "Lift and cardio", "Mostly cardio", "Just move more"], base: "Lift heavy" },
  { id: "gear", say: "Got it. What can you lift with?", q: "Your gear", options: ["Full gym", "Barbell", "Dumbbells", "Bands", "Bodyweight only"], base: "Full gym" },
  { id: "effort", say: "Here is how I coach. Heavy weight, and the last set of every lift goes to failure. Safe stop, never a grind that hurts.", q: "How hard do we go?", options: ["To failure, the way I like it", "One rep short", "Ease me in", "Skip, use the default"], base: "To failure, the way I like it" },
];

export const DEFAULTS = Object.fromEntries(ASK.map((a) => [a.id, a.base]));

const DAYS = { 2: ["Mon", "Thu"], 3: ["Mon", "Wed", "Fri"], 4: ["Mon", "Tue", "Thu", "Fri"], 5: ["Mon", "Tue", "Wed", "Fri", "Sat"], 6: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] };
const SPLIT = { 2: ["Full body", "Full body"], 3: ["Push", "Pull", "Legs"], 4: ["Upper", "Lower", "Upper", "Lower"], 5: ["Push", "Pull", "Legs", "Upper", "Lower"], 6: ["Push", "Pull", "Legs", "Push", "Pull", "Legs"] };
const LIFT = {
  "Full gym": { Push: "Bench press", Pull: "Cable row", Legs: "Leg press" },
  Barbell: { Push: "Bench press", Pull: "Barbell row", Legs: "Back squat" },
  Dumbbells: { Push: "Dumbbell press", Pull: "Dumbbell row", Legs: "Goblet squat" },
  Bands: { Push: "Band press", Pull: "Band row", Legs: "Banded squat" },
  "Bodyweight only": { Push: "Push-ups", Pull: "Inverted row", Legs: "Split squat" },
};
const main = (gear, s) => LIFT[gear][s === "Upper" ? "Push" : s === "Lower" || s === "Full body" ? "Legs" : s];

export const norm = (a = {}) => {
  const v = { ...DEFAULTS, ...a };
  if (!DAYS[v.days]) v.days = DEFAULTS.days;
  if (!LIFT[v.gear]) v.gear = DEFAULTS.gear;
  if (!ASK[3].options.includes(v.effort) || v.effort.startsWith("Skip")) v.effort = DEFAULTS.effort;
  return v;
};

// Rows of [day, session, main lift]. Heavy adds ", heavy" to a lift day.
export function splitFor(answers) {
  const a = norm(answers);
  const days = DAYS[a.days], parts = SPLIT[a.days];
  const heavy = a.kind === "Lift heavy" ? ", heavy" : "";
  return days.map((d, i) => {
    const last = i === days.length - 1;
    if (a.kind === "Just move more") return [d, last ? "Stretch and mobility" : "Walk, 30 min", last ? "Ten easy holds" : "Steady pace"];
    if (a.kind === "Mostly cardio") return i === 0 ? [d, "Full body, light", main(a.gear, "Legs")] : [d, i % 2 ? "Run or bike, easy" : "Intervals", i % 2 ? "30 min, chatty pace" : "6 x 1 min hard"];
    if (a.kind === "Lift and cardio" && last && days.length > 2) return [d, "Cardio, 30 min", "Run, bike or row"];
    return [d, `${parts[i]}${heavy}`, main(a.gear, parts[i])];
  });
}

const EFFORT = {
  "To failure, the way I like it": "5 lifts. Last set of each to failure, safe stop.",
  "One rep short": "5 lifts. Last set stops one rep short of failure.",
  "Ease me in": "5 lifts, 2 sets each. Stop with plenty left.",
};

export function today(answers) {
  const a = norm(answers);
  const [, session, lift] = splitFor(a)[0];
  const lifting = /Push|Pull|Legs|Upper|Lower|Full body/.test(session);
  return { title: `Today: ${session}`, body: lifting ? `${EFFORT[a.effort]} Starts with ${lift.toLowerCase()}.` : `${lift}. Easy and steady.` };
}

const q = (s) => `"${s}"`;
export const askLines = (step) => {
  const s = ASK[step];
  return `say ${s.say}\nchoose ${q(s.q)} ${s.options.map((o) => (/[ ,]/.test(o) ? q(o) : o)).join("|")}`;
};

export function planLines(answers) {
  const a = norm(answers);
  const t = today(a);
  const rows = splitFor(a).map((r) => q(r.join("|"))).join(" ");
  return `say Your first split is saved. It is a starting point. Change any day, any time.\ntable Split Day|Session|Lift ${rows}\ncard ${q(t.title)} body=${q(t.body)} cta="Start"`;
}

export const startLines = (answers) => {
  const t = today(answers);
  return `say ${t.title}. Warm up two minutes, then go.\ntimer 2m Warm-up +inline\nlist "Warm up"|"Work sets"|"Last set, safe stop"|"Cool down" +check`;
};

// The playground link opens all four questions and the finished plan on one screen.
export const wholeLines = (answers) => `${ASK.map((_, i) => askLines(i)).join("\n")}\n${planLines(answers)}`;
