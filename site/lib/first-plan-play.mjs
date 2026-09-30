// The playable first plan (SITE-118, rebuilt for SITE-123 to match Yui 0.6.1, YUI-217). Five questions, one at a
// time, the same ones in the same order as the app: what you train for, days, time, what you have, how much you have
// lifted. Not sure on four of them, and Skip keeps the starter week. Then the built week with today's session.
// Pure: questions, the week for a set of answers, and the Yui Lines for each screen. The component only holds the
// answers; /crew#first-plan and /playground?yl= draw the same lines. The week maths mirrors runtime/src/workouts.ts.
export const NOT_SURE = "Not sure";

export const ASK = [
  { id: "goal", label: "Training for", say: "Hi, I'm Arnold. Five taps and you have a week you'll actually do.", q: "What are we training for?", options: ["Lift heavy", "Lift and cardio", "Mostly cardio", "Just move more", NOT_SURE] },
  { id: "days", label: "Days", say: "Good. Next.", q: "How many days a week?", options: ["2", "3", "4", "5", "6", NOT_SURE] },
  { id: "time", label: "Session", say: "Nearly there.", q: "How long per session?", options: ["30 min", "45 min", "60 min", NOT_SURE] },
  { id: "gear", label: "Gear", say: "What can you train with?", q: "What do you have?", options: ["Just me", "Bands", "Dumbbells", "Barbell", "A gym"] },
  { id: "level", label: "Lifted", say: "Last one. Heavy lifters finish the last set of each lift at failure with a safe stop. New lifters stop well short.", q: "How much have you lifted?", options: ["New to lifting", "Some experience", "Lifted for years", NOT_SURE] },
];

// Skip is the starter week: every answer is Not sure, and gear is the smallest kit.
export const SKIPPED = { goal: NOT_SURE, days: NOT_SURE, time: NOT_SURE, gear: "Just me", level: NOT_SURE };

const DAY_KEYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
const DAYS_FOR = { 2: ["mon", "thu"], 3: ["mon", "wed", "fri"], 4: ["mon", "tue", "thu", "fri"], 5: ["mon", "tue", "wed", "fri", "sat"], 6: ["mon", "tue", "wed", "thu", "fri", "sat"] };
const HEAVY = { 2: ["Full body", "Full body"], 3: ["Full body", "Full body", "Full body"], 4: ["Upper", "Lower", "Upper", "Lower"], 5: ["Push", "Pull", "Legs", "Upper", "Lower"], 6: ["Push", "Pull", "Legs", "Push", "Pull", "Legs"] };
const MIXED = { 2: ["Full body", "Cardio"], 3: ["Full body", "Cardio", "Full body"], 4: ["Upper", "Cardio", "Lower", "Cardio"], 5: ["Upper", "Cardio", "Lower", "Cardio", "Full body"], 6: ["Push", "Cardio", "Pull", "Cardio", "Legs", "Cardio"] };
const MOVES = {
  "Full body": ["Squat", "Bench press", "Lat pulldown", "Romanian deadlift", "Plank"],
  Push: ["Bench press", "Overhead press", "Push-up", "Plank"],
  Pull: ["Lat pulldown", "Dumbbell row", "Pull-up", "Dead bug"],
  Legs: ["Squat", "Romanian deadlift", "Step-up", "Glute bridge"],
  Upper: ["Bench press", "Dumbbell row", "Overhead press", "Lat pulldown"],
  Lower: ["Deadlift", "Squat", "Step-up", "Dead bug"],
};
const SWAPS = {
  "A gym": {},
  Barbell: { "Lat pulldown": "Pull-up", "Step-up": "Reverse lunge" },
  Dumbbells: { Squat: "Goblet squat", "Bench press": "Dumbbell bench press", Deadlift: "Romanian deadlift", "Lat pulldown": "Dumbbell row", "Pull-up": "Dumbbell row", "Step-up": "Reverse lunge" },
  Bands: { Squat: "Banded squat", "Bench press": "Push-up", Deadlift: "Glute bridge", "Romanian deadlift": "Glute bridge", "Lat pulldown": "Banded row", "Dumbbell row": "Banded row", "Pull-up": "Banded row", "Step-up": "Reverse lunge", "Overhead press": "Banded overhead press" },
  "Just me": { Squat: "Air squat", "Bench press": "Push-up", Deadlift: "Glute bridge", "Romanian deadlift": "Glute bridge", "Lat pulldown": "Bird dog", "Dumbbell row": "Bird dog", "Pull-up": "Bird dog", "Step-up": "Reverse lunge", "Overhead press": "Pike push-up" },
};
const CORE = new Set(["Plank", "Dead bug", "Bird dog", "Glute bridge"]);
const GOALS = ASK[0].options.slice(0, 4);

export const norm = (a = {}) => {
  const v = { ...SKIPPED, ...a };
  for (const q of ASK) if (!q.options.includes(v[q.id])) v[q.id] = SKIPPED[q.id];
  return v;
};

// The kit that counts is the biggest one picked. The app's "gear" answer can hold several; the site asks for one.
const tier = (gear) => (SWAPS[gear] ? gear : "Just me");
const effort = (level) => (/years/i.test(level) ? "failure" : /^new/i.test(level) ? "ease" : "short");
const num = (s) => { const n = parseInt(s, 10); return Number.isFinite(n) ? n : null; };

const focuses = (goal, n) => {
  if (goal === "Lift heavy") return HEAVY[n];
  if (goal === "Lift and cardio") return MIXED[n];
  return Array.from({ length: n }, (_, i) => (i === 1 ? "Full body" : "Cardio"));
};

// The moves of one session, as data. The week table writes them as text, the timed session (SITE-141) runs them.
export function movesFor(focus, kit, eff, heavy) {
  const swaps = SWAPS[kit];
  const moves = MOVES[focus].map((m) => swaps[m] ?? m).filter((m, i, a) => a.indexOf(m) === i);
  const [sets, reps] = heavy && eff === "failure" ? [4, 6] : eff === "ease" ? [2, 10] : heavy ? [3, 8] : [3, 10];
  return moves.map((name) => (name === "Plank" ? { name, sets: 3, secs: 30 } : CORE.has(name) ? { name, sets: 3, reps: 10 } : { name, sets, reps }));
}

const workout = (focus, kit, eff, heavy) => movesFor(focus, kit, eff, heavy).map((m) => `${m.name} ${m.sets}x${m.secs ? `${m.secs}s` : m.reps}`).join(", ");

// Rows of { day, focus, workout, minutes }: seven days, rest days included, like This week in the app.
export function weekFor(answers) {
  const a = norm(answers);
  const goal = GOALS.includes(a.goal) ? a.goal : GOALS[0];
  const n = Math.max(2, Math.min(6, num(a.days) ?? 3));
  const minutes = num(a.time) ?? 45;
  const kit = tier(a.gear), eff = effort(a.level), heavy = /^Lift/.test(goal);
  const plan = new Map(DAYS_FOR[n].map((k, i) => [k, focuses(goal, n)[i]]));
  return DAY_KEYS.map((k) => {
    const focus = plan.get(k), day = k[0].toUpperCase() + k.slice(1);
    if (!focus) return { day, focus: "Rest", workout: "Rest", minutes: 0 };
    if (focus === "Cardio") return { day, focus, workout: goal === "Just move more" ? "A brisk walk, easy pace" : "Run or bike, easy pace", minutes };
    return { day, focus, workout: workout(focus, kit, eff, heavy), minutes };
  });
}

const LAST = { failure: "The last set of each lift goes to failure, with a safe stop.", short: "The last set of each lift stops one rep short.", ease: "We ease in. Every set stays well short of failure." };

export function today(answers) {
  const a = norm(answers);
  const d = weekFor(a).find((r) => r.focus !== "Rest");
  const lifting = d.focus !== "Cardio";
  return { day: d.day, title: `Today: ${d.focus}`, body: lifting ? `${d.workout}. ${LAST[effort(a.level)]}` : `${d.workout}. ${d.minutes} min.` };
}

const q = (s) => `"${s}"`;
const opt = (o) => (/[ ,]/.test(o) ? q(o) : o);
export const askLines = (step) => {
  const s = ASK[step];
  return `say ${s.say}\nchoose ${q(s.q)} ${s.options.map(opt).join("|")}\ncard@first-skip "Not now" "Keep the starter week. Build yours any time from This week." cta="Skip for now"`;
};

export function planLines(answers) {
  const a = norm(answers);
  const t = today(a);
  const rows = weekFor(a).map((r) => q(`${r.day}|${r.focus}|${r.focus === "Rest" ? "-" : `${r.minutes} min`}`)).join(" ");
  return `say Your week is built. It is a starting point. Change any day, any time.\ntable Week Day|Focus|Time ${rows}\ncard ${q(t.title)} body=${q(t.body)} cta="Start today"`;
}

export const startLines = (answers) => {
  const t = today(answers);
  return `say ${t.title}. Warm up two minutes, then go.\ntimer 2m Warm-up +inline\nlist "Warm up"|"Work sets"|"Last set, safe stop"|"Cool down" +check`;
};

// The timed session (SITE-141, the web twin of YUI-220): a work set, the rest countdown with its Next line, the next
// move, no taps between, a finish card. The words are the app's (runtime/src/workouts.ts coachCue, WorkoutSession.swift).
export const FAIL_LINE = "To failure. Stop when form breaks.";
const NO_FAILURE = /\b(?:plank|dead bug|bird dog|glute bridge|bridge|walk|stretch)\b/i;

// Arnold's one line for a move, caveman voice.
export function coachCue(name) {
  const n = name.toLowerCase();
  if (/plank|hollow|hold/.test(n)) return "Straight line. Squeeze everything.";
  if (/dead bug|bird dog/.test(n)) return "Slow. Low back stays down.";
  if (/deadlift|rdl|romanian|bridge/.test(n)) return "Flat back. Hips back.";
  if (/squat|lunge|step/.test(n)) return "Brace. Knees out. Drive up.";
  if (/press|push|bench|dip/.test(n)) return "Brace. Slow down.";
  if (/row|pull|lat|curl/.test(n)) return "Chest up. Pull, pause, lower.";
  return "Slow down. Own every rep.";
}

// Demo timing so a visitor sees the whole session in about a minute: three moves, three sets, short clocks.
export const DEMO = { moves: 3, sets: 3, work: 4, rest: 3, failAuto: 6 };

// Steps: { kind: "work" | "fail" | "rest", move, of, set, sets, seconds, name, cue, next }. seconds 0 = open ended
// (the to-failure set waits for Stop). Only a heavy lifter (Lifted for years) ever gets a fail step, and never on a
// plank or a hold: the app's rule.
export function sessionFor(answers, demo = DEMO) {
  const a = norm(answers);
  const t = today(a), eff = effort(a.level);
  const day = weekFor(a).find((r) => r.focus !== "Rest");
  if (day.focus === "Cardio") {
    const step = { kind: "work", move: 0, of: 1, set: 1, sets: 1, seconds: demo.work * 4, name: day.workout, cue: "Go at a pace you can talk at." };
    return { title: t.title, heavy: false, moves: [day.workout], steps: [step] };
  }
  const heavy = /^Lift/.test(GOALS.includes(a.goal) ? a.goal : GOALS[0]);
  const moves = movesFor(day.focus, tier(a.gear), eff, heavy).slice(0, demo.moves).map((m) => ({ ...m, sets: Math.min(m.sets, demo.sets) }));
  const steps = [];
  moves.forEach((m, mi) => {
    for (let n = 1; n <= m.sets; n++) {
      const last = n === m.sets, fail = last && eff === "failure" && !m.secs && !NO_FAILURE.test(m.name) && m.sets > 1;
      steps.push({ kind: fail ? "fail" : "work", move: mi, of: moves.length, set: n, sets: m.sets, seconds: fail ? 0 : demo.work, name: m.name, cue: coachCue(m.name) });
      if (!(mi === moves.length - 1 && last)) steps.push({ kind: "rest", move: mi, of: moves.length, set: n, sets: m.sets, seconds: demo.rest, name: m.name, cue: "" });
    }
  });
  // A rest says what is next: the next set of this move, or the next move, else finish. Its cue is for that move.
  steps.forEach((s, i) => {
    if (s.kind !== "rest") return;
    const n = steps.slice(i + 1).find((x) => x.kind !== "rest");
    s.next = !n ? "Next: finish" : n.set === 1 ? `Next: ${n.name}` : `Next: ${n.name}, set ${n.set} of ${n.sets}`;
    s.cue = n ? n.cue : "";
  });
  return { title: t.title, heavy: steps.some((s) => s.kind === "fail"), moves: moves.map((m) => m.name), steps };
}

// The playground link opens all five questions and the built week on one screen.
export const wholeLines = (answers) => `${ASK.map((s) => `choose ${q(s.q)} ${s.options.map(opt).join("|")}`).join("\n")}\n${planLines(answers)}`;
