// Every crew member's first plan, playable on /crew (SITE-124). The questions are the saved flows of YUI-227
// (first-meals, first-practice, first-week, first-study); the site asks each as one tap, Not sure and Skip on every one.
// The last screen is a small example result, labelled as one. Arnold's is lib/first-plan-play.mjs (SITE-123).
// Pure: questions, the example for a set of answers, and the Yui Lines for each screen. Nothing calls an agent.
export const NOT_SURE = "Not sure";

const S = (id, label, say, q, options) => ({ id, label, say, q, options: [...options, NOT_SURE] });


const MEALS = {
  basil: {
    ask: [
      S("goal", "Goal", "Hi, I'm Basil. Five taps and you have meals for the week.", "What's the goal?", ["Eat better", "Lose weight", "Build muscle", "Save time"]),
      S("days", "Days", "Good. Next.", "Which days should I plan?", ["Weekdays", "Weekends", "Every day"]),
      S("meals", "Meals", "Nearly there.", "How many meals a day?", ["2", "3", "3 and a snack", "4 or more"]),
      S("avoid", "Leave out", "Anything I should keep off the plate?", "What should I leave out?", ["Nothing", "Meat", "Fish", "Dairy", "Gluten"]),
      S("cook", "Cook time", "Last one.", "How long can you cook?", ["15 minutes", "30 minutes", "An hour"]),
    ],
  },
  gouda: {
    ask: [
      S("instrument", "Instrument", "Hey, I'm Gouda. Four taps and you have a practice routine.", "What do you play?", ["Guitar", "Piano", "Drums", "Voice"]),
      S("level", "Level", "Good. Next.", "How would you rate yourself?", ["Brand new", "Know a few things", "Getting there"]),
      S("minutes", "Minutes", "Nearly there.", "Minutes a day?", ["10", "20", "30", "An hour"]),
      S("want", "Play", "Last one.", "What do you want to play?", ["Songs", "Scales", "Chords", "Make my own"]),
    ],
  },
  penny: {
    ask: [
      S("busy", "Busy days", "Hi, I'm Penny. Three taps and your week has a routine.", "Which days are packed?", ["Weekdays", "Weekends", "Mid-week", "None"]),
      S("plan", "Planning", "Good. Next.", "When do you plan?", ["Sunday night", "Monday morning", "Each morning", "Each night"]),
      S("remind", "Reminders", "Last one.", "How do you want reminders?", ["At the time", "10 minutes before", "The night before", "None"]),
    ],
  },
  quill: {
    ask: [
      S("topic", "Learning", "Hi, I'm Quill. Three taps and you have a study plan.", "What are you learning?", ["A language", "A school subject", "A skill for work", "Something for fun"]),
      S("time", "Time", "Good. Next.", "How long do you have?", ["A week", "A month", "3 months", "No deadline"]),
      S("quiz", "Quiz", "Last one.", "How do you like to be quizzed?", ["Flash cards", "Multiple choice", "Write it out", "Out loud"]),
    ],
  },
};

// Skip is the starter plan: every answer is Not sure.
export const skipped = (handle) => Object.fromEntries(MEALS[handle].ask.map((s) => [s.id, NOT_SURE]));
export const ask = (handle) => MEALS[handle].ask;
export const HANDLES = Object.keys(MEALS);
export const NAMES = { basil: "Basil", gouda: "Gouda", penny: "Penny", quill: "Quill" };

// Not sure falls back to a sensible default, the way the agent would.
export function norm(handle, a = {}) {
  const v = {};
  for (const s of MEALS[handle].ask) v[s.id] = s.options.includes(a[s.id]) && a[s.id] !== NOT_SURE ? a[s.id] : null;
  return v;
}

const q = (s) => `"${s}"`;
const opt = (o) => (/[ ,]/.test(o) ? q(o) : o);
const row = (...cells) => q(cells.join("|"));

// What the example says it built. Each returns { say, head, cols, rows, title, body }.
const BUILD = {
  basil(a) {
    const goal = a.goal || "Eat better", days = a.days || "Weekdays";
    const n = a.meals === "2" ? 2 : a.meals === "4 or more" ? 4 : 3, snack = a.meals === "3 and a snack" || n === 4;
    const cook = a.cook || "30 minutes", quick = cook === "15 minutes", avoid = a.avoid || "Nothing";
    const protein = /Meat/.test(avoid) ? "tofu" : /Fish/.test(avoid) ? "chicken" : "salmon";
    const dairy = /Dairy/.test(avoid) ? "oat yogurt" : "Greek yogurt";
    const grain = /Gluten/.test(avoid) ? "rice" : "whole grain toast";
    const slots = [
      ["Breakfast", quick ? `${dairy} and berries` : `Eggs on ${grain}`],
      ["Lunch", quick ? `${protein} wrap, ${grain === "rice" ? "rice paper" : "whole grain"}` : `${protein} grain bowl`],
      ["Dinner", quick ? `${protein}, greens and ${grain === "rice" ? "rice" : "couscous"}` : `Sheet pan ${protein} and vegetables`],
    ];
    if (n === 2) slots.splice(0, 1);
    if (snack) slots.push(["Snack", /Nuts/.test(avoid) ? "Fruit and seeds" : "Fruit and almonds"]);
    return {
      say: `Your meals are planned. ${days}, ${slots.length} a day, ${quick ? "all under 15 minutes" : `about ${cook === "An hour" ? "an hour" : "30 minutes"} of cooking`}. It is an example. Change any meal.`,
      head: "Meal|Idea", rows: slots.map(([m, d]) => row(m, d)), table: "Meals", title: "Example: Basil's plan", body: `${goal}. ${days}. Avoiding: ${avoid.toLowerCase()}. A grocery list comes with it.`,
    };
  },
  gouda(a) {
    const ins = a.instrument || "Guitar", lvl = a.level || "Brand new", mins = a.minutes === "An hour" ? 60 : parseInt(a.minutes, 10) || 20, want = a.want || "Songs";
    const easy = lvl === "Brand new";
    const warm = Math.max(2, Math.round(mins * 0.2)), tech = Math.max(3, Math.round(mins * 0.3)), play = Math.max(3, Math.round(mins * 0.4));
    const free = Math.max(1, mins - warm - tech - play);
    const tech0 = { Guitar: easy ? "Open chords, slow" : "Barre chords and scales", Piano: easy ? "Five-finger patterns" : "Scales and arpeggios", Drums: easy ? "Single strokes on the pad" : "Rudiments at 80 bpm", Voice: easy ? "Breathing and easy slides" : "Scales and intervals" }[ins];
    const play0 = { Songs: "One song, a bar at a time", Scales: "Scales, up and back", Chords: "Chord changes with the click", "Make my own": "Build a four bar idea" }[want];
    return {
      say: `Your practice is built. ${mins} minutes a day for ${ins.toLowerCase()}. It is an example. Change any step.`,
      head: "Step|What|Time", rows: [row("Warm up", "Loose hands, slow tempo", `${warm} min`), row("Technique", tech0, `${tech} min`), row("Play", play0, `${play} min`), row("Free play", "Whatever you feel like", `${free} min`)],
      table: "Practice", title: "Example: Gouda's routine", body: `${ins}, ${lvl.toLowerCase()}. The click counts you in and a streak starts today.`,
    };
  },
  penny(a) {
    const busy = a.busy || "Weekdays", plan = a.plan || "Sunday night", rem = a.remind || "10 minutes before";
    const light = busy === "None" ? "Nothing is packed. Every day is open." : `${busy} are packed, so they get three things at most.`;
    return {
      say: `Your routine is set. ${light} It is an example. Change any of it.`,
      head: "Part|Yours", rows: [row("Packed", busy === "None" ? "None" : busy), row("Plan", plan), row("Reminders", rem === "None" ? "Off" : rem), row("Evening", "A two minute review of what is left")],
      table: "Routine", title: "Example: Penny's routine", body: `${plan}, you lay out the week. ${rem === "None" ? "No reminders." : `Reminders: ${rem.toLowerCase()}.`}`,
    };
  },
  quill(a) {
    const topic = a.topic || "A skill for work", time = a.time || "A month", mode = a.quiz || "Flash cards";
    const step = { "A week": ["Day 1-2|Learn the basics|5 min", "Day 3-5|Practice|10 min", "Day 6-7|Review and test|10 min"], "A month": ["Week 1|Learn the basics|5 min a day", "Week 2-3|Practice a little each day|10 min a day", "Week 4|Review and test|10 min a day"], "3 months": ["Month 1|Learn the basics|5 min a day", "Month 2|Practice and build|10 min a day", "Month 3|Review and test|15 min a day"], "No deadline": ["Now|Learn one idea a day|5 min", "Every week|Review what you learned|10 min", "Every month|A short test|15 min"] }[time];
    return {
      say: `Your study plan is built. ${topic}, ${time.toLowerCase()}, quizzed with ${mode.toLowerCase()}. It is an example. Change any step.`,
      head: "When|Focus|Time", rows: step.map((r) => q(r)), table: "Study", title: "Example: Quill's plan", body: `${topic}. Quizzed with ${mode.toLowerCase()}, on a schedule that gets further apart as you remember.`,
    };
  },
};

export const askLines = (handle, step) => {
  const s = MEALS[handle].ask[step];
  return `say ${s.say}\nchoose ${q(s.q)} ${s.options.map(opt).join("|")}\ncard@first-skip "Not now" "Keep the starter plan. Build yours any time." cta="Skip for now"`;
};

export function resultLines(handle, answers) {
  const b = BUILD[handle](norm(handle, answers));
  return `say ${b.say}\ntable ${b.table} ${b.head} ${b.rows.join(" ")}\ncard ${q(b.title)} body=${q(b.body)}`;
}

// The playground link opens every question and the example on one screen.
export const wholeLines = (handle, answers) => `${MEALS[handle].ask.map((s) => `choose ${q(s.q)} ${s.options.map(opt).join("|")}`).join("\n")}\n${resultLines(handle, answers)}`;
