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
      S("days", "Days", "Good. Next.", "Which days should I plan?", ["Weekdays", "Weekends", "Every day", "Mon Wed Fri"]),
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

// Basil's recipe bank for the example week (the web twin of the app's applyMealFirst, YUI-221 / SITE-142).
// tags are what a leave-out drops; minutes is what the cook time keeps under. Not sure and Skip: every day, 3 meals, 30 minutes.
const R = (meal, name, cal, minutes, ...tags) => ({ meal, name, cal, minutes, tags });
export const RECIPES = [
  R("Breakfast", "Berry yogurt bowl", 320, 5, "dairy"),
  R("Breakfast", "Oatmeal and banana", 350, 10, "gluten"),
  R("Breakfast", "Fruit and seed smoothie", 300, 5),
  R("Breakfast", "Avocado toast with eggs", 424, 15, "eggs", "gluten"),
  R("Breakfast", "Tofu scramble", 430, 20),
  R("Breakfast", "Veggie omelet", 400, 20, "eggs", "dairy"),
  R("Breakfast", "Protein pancakes", 480, 40, "eggs", "gluten", "dairy"),
  R("Lunch", "Hummus veggie wrap", 450, 10, "gluten"),
  R("Lunch", "Tuna salad bowl", 520, 10, "fish"),
  R("Lunch", "Chicken burrito bowl", 700, 25, "meat"),
  R("Lunch", "Teriyaki chicken rice bowl", 650, 30, "meat"),
  R("Lunch", "Chickpea grain bowl", 560, 30),
  R("Lunch", "Turkey club, whole grain", 540, 15, "meat", "gluten"),
  R("Lunch", "Slow roast beef sandwich", 690, 60, "meat", "gluten"),
  R("Dinner", "Egg fried rice", 560, 15, "eggs"),
  R("Dinner", "Chicken stir-fry", 680, 25, "meat"),
  R("Dinner", "Tofu coconut curry", 700, 30),
  R("Dinner", "Salmon, greens and rice", 640, 30, "fish"),
  R("Dinner", "Shrimp tacos", 600, 20, "fish", "gluten"),
  R("Dinner", "Lentil pasta bake", 640, 45, "gluten", "dairy"),
  R("Dinner", "Braised beef and potatoes", 760, 90, "meat"),
  R("Snack", "Apple and peanut butter", 220, 2, "nuts"),
  R("Snack", "Fruit and seeds", 180, 2),
  R("Snack", "Greek yogurt cup", 160, 1, "dairy"),
];
export const WEEK = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const LONG = { Mon: "Monday", Tue: "Tuesday", Wed: "Wednesday", Thu: "Thursday", Fri: "Friday", Sat: "Saturday", Sun: "Sunday" };
const DAY_SETS = { Weekdays: WEEK.slice(0, 5), Weekends: WEEK.slice(5), "Every day": WEEK, "Mon Wed Fri": ["Mon", "Wed", "Fri"] };
const AVOID_TAG = { Meat: "meat", Fish: "fish", Dairy: "dairy", Gluten: "gluten", Nuts: "nuts", Eggs: "eggs" };

// The week for a set of (already normalised) answers: only the chosen days and meals a day, no leave-out, nothing over the cook time.
export function basilWeek(a = {}) {
  const days = DAY_SETS[a.days] || WEEK;
  const m = a.meals || "3";
  const slots = m === "3 and a snack" || m === "4 or more" ? ["Breakfast", "Lunch", "Dinner", "Snack"] : m === "2" ? ["Lunch", "Dinner"] : ["Breakfast", "Lunch", "Dinner"];
  const limit = { "15 minutes": 15, "30 minutes": 30, "An hour": 60 }[a.cook] || 30;
  const tag = AVOID_TAG[a.avoid];
  const pool = RECIPES.filter((r) => !tag || !r.tags.includes(tag));
  const used = new Map();
  const rows = days.map((day, i) => {
    const meals = slots.map((slot) => {
      const of = pool.filter((r) => r.meal === slot);
      // The cook time is a hard ceiling; if nothing fits, the quickest one the slot has.
      let fit = of.filter((r) => r.minutes <= limit);
      if (!fit.length) fit = [...of].sort((x, y) => x.minutes - y.minutes).slice(0, 1);
      const turn = fit.map((_, j) => fit[(j + i) % fit.length]); // a new start each day, least used first
      const pick = turn.sort((x, y) => (used.get(x.name) || 0) - (used.get(y.name) || 0))[0];
      used.set(pick.name, (used.get(pick.name) || 0) + 1);
      return { slot, ...pick };
    });
    return { day, long: LONG[day], meals, cal: meals.reduce((t, x) => t + x.cal, 0) };
  });
  return { rows, slots, avoid: tag ? [a.avoid] : [], limit };
}

// What the example says it built. Each returns { say, head, cols, rows, title, body }.
const BUILD = {
  basil(a) {
    const week = basilWeek(a);
    const n = week.slots.length, days = week.rows.length;
    const out = week.avoid.length ? `, nothing with ${week.avoid.map((x) => x.toLowerCase()).join(" or ")}` : "";
    return {
      say: `Example: your week of meals is set. ${days} ${days === 1 ? "day" : "days"}, ${n === 4 ? "3 meals and a snack" : `${n} meals`} a day${out}.`,
      head: "Day|Meals", rows: week.rows.map((r) => row(`${r.long}, ${r.cal.toLocaleString("en-US")} kcal`, r.meals.map((m) => m.name).join(", "))), table: "Week", title: "Example: Basil's week", body: "",
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
  const t = `say ${b.say}\ntable ${b.table} ${b.head} ${b.rows.join(" ")}`;
  return b.body ? `${t}\ncard ${q(b.title)} body=${q(b.body)}` : t; // Basil's week ends on the week itself
}

// The playground link opens every question and the example on one screen.
export const wholeLines = (handle, answers) => `${MEALS[handle].ask.map((s) => `choose ${q(s.q)} ${s.options.map(opt).join("|")}`).join("\n")}\n${resultLines(handle, answers)}`;
