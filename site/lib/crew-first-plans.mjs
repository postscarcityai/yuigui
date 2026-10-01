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
      S("instrument", "Instrument", "Hey, I'm Gouda. Four taps and you have a practice routine.", "What do you play?", ["Guitar", "Piano", "Drums", "Bass", "Voice", "Not yet"]),
      S("level", "Level", "Good. Next.", "How would you rate yourself?", ["Brand new", "Know a few things", "Getting there", "Pretty good"]),
      S("minutes", "Minutes", "Nearly there.", "Minutes a day?", ["10", "20", "30", "An hour"]),
      S("want", "Play", "Last one.", "What do you want to play?", ["Songs", "Scales", "Chords", "Make my own", "Play by ear"]),
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
      S("minutes", "Minutes", "Good. Next.", "How many minutes a day?", ["10 minutes", "20 minutes", "30 minutes", "An hour"]),
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

// Gouda's practice week, the web twin of the app's buildFirstPlan (YUI-222, runtime/src/music.ts): the instrument picked,
// sessions that add up to exactly the minutes picked, drills no harder than the level. Not sure and Skip: an
// instrument-agnostic beginner, 15 minutes a day, a bit of everything.
const D = (kind, tier, text) => ({ kind, tier, text });
export const DRILLS = [
  D("chords", 0, "Switch between two chords, one a beat, with the click at 60"),
  D("chords", 1, "Play four chords in a loop with clean changes, click at 70"),
  D("chords", 2, "Add 7th and slash chords to your loop, click at 90"),
  D("songs", 0, "Learn the first verse of an easy song on the Chords page, half speed"),
  D("songs", 1, "Play a whole easy song through at 75%, then at full speed"),
  D("songs", 2, "Learn a song with a bridge and loop the hard bar until it is easy"),
  D("scales", 0, "One major scale, slow, up and down, click at 60"),
  D("scales", 1, "A pentatonic scale in one position, click at 80"),
  D("scales", 2, "A scale in every position, click at 100, then in thirds"),
  D("write", 0, "Pick three notes and make a short phrase you like"),
  D("write", 1, "Write four bars over a chord loop and repeat them until they stick"),
  D("write", 2, "Write a verse and a chorus, then record a take"),
  D("ear", 0, "Hum the top note of a song you know, then find it"),
  D("ear", 1, "Play back a four-note phrase by ear"),
  D("ear", 2, "Work out a song's chords by ear, then check them"),
];
const WARM = {
  guitar: "Fret each string slowly, one finger a fret, up and down",
  piano: "C major scale, both hands, slow, up and down",
  drums: "Single strokes on a pad or your knees, slow to fast to slow",
  bass: "Open strings, then walk up a fret at a time on the click",
  voice: "Hum, lip trills, then slide up and down on an oo",
  "not yet": "Open Keys and play the white keys up and back, one a beat",
  any: "Shake out your hands, then play slow, even notes with the click",
};
const LEVELS = ["Brand new", "Know a few things", "Getting there", "Pretty good"];
const TIER_NAME = ["beginner", "intermediate", "advanced"];
const KIND_FOR = { songs: "songs", scales: "scales", chords: "chords", "make my own": "write", "play by ear": "ear" };
const KIND_LABEL = { chords: "Chords", songs: "A song", scales: "Scales", write: "Your own music", ear: "Ear training" };

// A session of `total` minutes cut into steps that add up to exactly that: never longer, never a step of nothing.
export function split(total) {
  const parts = total <= 10 ? [0.2, 0.5, 0.3] : [0.2, 0.4, 0.25, 0.15];
  const out = parts.map((f) => Math.max(1, Math.round(total * f)));
  out[1] += total - out.reduce((x, y) => x + y, 0);
  return out;
}
const drillFor = (kind, tier) => DRILLS.filter((d) => d.kind === kind && d.tier <= tier).sort((x, y) => y.tier - x.tier)[0];
const lower = (t) => t.replace(/^\w/, (c) => c.toLowerCase());
export const sessionBody = (s) => `${s.minutes} minutes. ${s.steps.map((x) => `${x.minutes} min, ${lower(x.text)}`).join(". ")}.`;
// Monday is 0, the app's week.
export const todayIndex = (d = new Date()) => (d.getDay() + 6) % 7;

export function goudaWeek(a = {}) {
  const instrument = ["Guitar", "Piano", "Drums", "Bass", "Voice", "Not yet"].includes(a.instrument) ? a.instrument : "";
  const lv = LEVELS.indexOf(a.level);
  const tier = lv < 2 ? 0 : lv - 1;
  const minutes = a.minutes === "An hour" ? 60 : parseInt(a.minutes, 10) || 15;
  const want = KIND_FOR[String(a.want || "").toLowerCase()];
  const cycle = want ? [want] : ["chords", "songs", "scales", "ear"];
  const warm = WARM[instrument.toLowerCase()] || WARM.any;
  const cuts = split(minutes);
  const days = WEEK.map((day, i) => {
    if (i === 6) return { day, focus: "Play for fun", minutes, steps: [{ minutes: cuts[0], text: warm }, { minutes: minutes - cuts[0], text: "Play what you love, no rules, and no click unless you want it" }] };
    const main = cycle[i % cycle.length], second = cycle[(i + 1) % cycle.length];
    const other = second === main ? ["chords", "songs", "scales", "ear", "write"].find((k) => k !== main) : second;
    const steps = [{ minutes: cuts[0], text: warm }, { minutes: cuts[1], text: drillFor(main, tier).text }];
    if (cuts.length === 4) steps.push({ minutes: cuts[2], text: drillFor(other, tier).text });
    steps.push({ minutes: cuts[cuts.length - 1], text: "Play something you like, then note what felt hard" });
    return { day, focus: KIND_LABEL[main], minutes, steps };
  });
  return { instrument, level: TIER_NAME[tier], tier, minutes, days };
}


// Penny's routine (the web twin of the app's buildRoutine and applyFirst, YUI-223 / SITE-146). The planning slot lands on
// the day and time picked, a busy day never holds more than one item, reminders go the style picked. Not sure and Skip:
// Sunday evening planning, no busy days, one nudge in the morning. `today` is 0 for Monday.
const PENNY_BUSY = { Weekdays: ["Mon", "Tue", "Wed", "Thu", "Fri"], Weekends: ["Sat", "Sun"], "Mid-week": ["Tue", "Wed", "Thu"], None: [] };
const PENNY_WHEN = { "Sunday night": ["weekly", "Sun", "7:00 pm"], "Monday morning": ["weekly", "Mon", "8:00 am"], "Each morning": ["daily", "", "8:00 am"], "Each night": ["daily", "", "8:00 pm"] };
export const MUST_DO = "Pick your one must-do for today";

export function pennyWeek(a = {}, today = todayIndex()) {
  const n = norm("penny", a);
  const busyDays = PENNY_BUSY[n.busy] ?? [];
  const when = PENNY_WHEN[n.plan] ? n.plan : "Sunday night";
  const [kind, slotDay, time] = PENNY_WHEN[when];
  const remind = n.remind ?? "A morning nudge";
  const days = Array.from({ length: 7 }, (_, i) => {
    const day = WEEK[(today + i) % 7];
    const slot = kind === "daily" ? { label: `Plan your day, ${time}`, task: "Plan your day" } : day === slotDay ? { label: `Plan your week, ${time}`, task: "Plan your week" } : null;
    return { day: i === 0 ? "Today" : day, short: day, busy: busyDays.includes(day), items: slot ? [slot] : [] };
  });
  // The first must-do prompt lands on today when the slot does not.
  if (!days[0].items.length) days[0].items.push({ label: MUST_DO, task: MUST_DO });
  return { when, kind, time, remind, busy: days.filter((d) => d.busy).map((d) => d.short).sort((x, y) => WEEK.indexOf(x) - WEEK.indexOf(y)), days, today: days[0].items.map((i) => i.task) };
}

export function pennyLine(w) {
  const slot = w.days.find((d) => d.items.some((i) => /^Plan your/.test(i.task)));
  const plan = w.kind === "daily" ? `Planning is every ${w.when === "Each night" ? "night" : "morning"} at ${w.time}` : `Planning is ${LONG[slot.short]} at ${w.time}`;
  const busy = w.busy.length ? ` ${w.busy.join(", ")} stay${w.busy.length === 1 ? "s" : ""} light.` : "";
  const how = { "At the time": " Reminders go at the time.", "10 minutes before": " Reminders go 10 minutes before.", "The night before": " Reminders go the night before.", None: " No reminders." }[w.remind] ?? " Reminders go as a nudge that morning.";
  return `Your routine is set. ${plan}.${busy}${how}`;
}

// Quill's study week (the web twin of the app's buildStudyPlan, YUI-224 / SITE-147). One session a day for seven days:
// a lesson then a quiz in the style picked, never longer than the minutes picked. Not sure and Skip: a general topic,
// 10 minutes a day, multiple choice. `today` is 0 for Monday.
const FOCUS = ["The basics", "Key ideas", "Worked examples", "Practice", "Common mistakes", "Putting it together", "Review the week"];
const ITEM_MIN = { "Flash cards": 0.5, "Multiple choice": 1, "Write it out": 2, "Out loud": 1.5 };
const NOUN = { "Flash cards": "flash cards", "Multiple choice": "multiple choice questions", "Write it out": "write-it-out prompts", "Out loud": "say-it-out-loud prompts" };
const QUILL_MIN = { "10 minutes": 10, "20 minutes": 20, "30 minutes": 30, "An hour": 60 };

export function quillWeek(a = {}, today = todayIndex()) {
  const n = norm("quill", a);
  const subject = n.topic ?? "A general topic";
  const minutes = QUILL_MIN[n.minutes] ?? 10;
  const style = n.quiz ?? "Multiple choice";
  const lesson = Math.round(minutes * 0.6);
  const quiz = minutes - lesson;
  const items = Math.max(1, Math.floor(quiz / ITEM_MIN[style]));
  const days = FOCUS.map((focus, i) => ({ day: i === 0 ? "Today" : WEEK[(today + i) % 7], focus, lesson, quiz, items }));
  return { subject, minutes, style, days };
}

const quillSession = (d, style) => `${d.lesson} minute lesson, then ${d.items} ${NOUN[style]}.`;
export const quillLine = (w) => `Your plan is set. ${w.subject}, ${w.minutes} minutes a day, quizzed with ${w.style.toLowerCase()}.`;

// What the example says it built. Each returns { say, head, cols, rows, title, body }.
const BUILD = {
  basil(a) {
    const week = basilWeek(a);
    const n = week.slots.length, days = week.rows.length;
    const out = week.avoid.length ? `, nothing with ${week.avoid.map((x) => x.toLowerCase()).join(" or ")}` : "";
    return {
      say: `Your week of meals is set. ${days} ${days === 1 ? "day" : "days"}, ${n === 4 ? "3 meals and a snack" : `${n} meals`} a day${out}.`,
      head: "Day|Meals", rows: week.rows.map((r) => row(`${r.long}, ${r.cal.toLocaleString("en-US")} kcal`, r.meals.map((m) => m.name).join(", "))), table: "Week", title: "Basil's week", body: "",
    };
  },
  gouda(a, today) {
    const plan = goudaWeek(a);
    const t = plan.days[today ?? todayIndex()];
    const on = plan.instrument && plan.instrument !== "Not yet" ? ` on ${plan.instrument.toLowerCase()}` : "";
    return {
      say: `Your practice week is set. ${plan.minutes} minutes a day${on}, ${plan.level} level.`,
      head: "Day|Focus|Time", rows: plan.days.map((d) => row(d.day, d.focus, `${d.minutes} min`)), table: "Week",
      title: `Today: ${LONG[t.day]}, ${t.focus}`, body: sessionBody(t), timer: `timer ${t.minutes}m Today`,
    };
  },
  penny(a, today) {
    const w = pennyWeek(a, today);
    return {
      say: pennyLine(w),
      head: "Day|Plan", rows: w.days.map((d) => row(d.day, d.busy ? `${[...d.items.map((i) => i.label), "light day"].join(", ").replace(/^l/, "L")}` : d.items.map((i) => i.label).join(", ") || "Open")), table: "Week",
      title: "Start this week", body: "Add your first must-do. It lands on Today and your week.", cta: "Add a to-do",
      list: w.today.length ? `list Today ${w.today.map((t) => q(t)).join(" ")} +check` : "",
    };
  },
  quill(a, today) {
    const w = quillWeek(a, today);
    const t = w.days[0];
    return {
      say: quillLine(w),
      head: "Day|Lesson|Quiz", rows: w.days.map((d) => row(d.day, `${d.lesson} min`, `${d.items} ${NOUN[w.style]}`)), table: "Week",
      title: `Today: ${t.focus}`, body: quillSession(t, w.style), cta: "Start today's lesson",
    };
  },
};

export const askLines = (handle, step) => {
  const s = MEALS[handle].ask[step];
  return `say ${s.say}\nchoose ${q(s.q)} ${s.options.map(opt).join("|")}\ncard@first-skip "Not now" "Keep the starter plan. Build yours any time." cta="Skip for now"`;
};

// `today` (0 is Monday) picks the session Gouda starts; it defaults to the real day.
export function resultLines(handle, answers, today) {
  const b = BUILD[handle](norm(handle, answers), today);
  const t = `say ${b.say}\ntable ${b.table} ${b.head} ${b.rows.join(" ")}`;
  // Basil's week ends on the week itself; Gouda's card starts today's timer (startLines).
  const cta = b.timer ? ' cta="Start today"' : b.cta ? ` cta=${q(b.cta)}` : "";
  return b.body ? `${t}${b.list ? `\n${b.list}` : ""}\ncard ${q(b.title)} body=${q(b.body)}${cta}` : t;
}

// Gouda: Start today opens the timer for today's session, full screen, the way the app's Practice page does.
export const hasTimer = (handle) => handle === "gouda" || handle === "penny" || handle === "quill";
export function startLines(handle, answers, today) {
  if (handle === "penny") return `say Say it, or pick one. It lands on Today and your week.\nchoose "Your one must-do" "Call someone back"|"Send the invoice"|"Go for a run" +other`;
  if (handle === "quill") return `say Lesson one. Pick what you know and I teach from there.\nchoose "What do you know already?" "Nothing yet"|"The basics"|"Quite a bit"`;
  const b = BUILD[handle](norm(handle, answers), today);
  return `say ${b.title}. Tap Start when you're ready.\n${b.timer}`;
}

// The playground link opens every question and the example on one screen.
export const wholeLines = (handle, answers) => `${MEALS[handle].ask.map((s) => `choose ${q(s.q)} ${s.options.map(opt).join("|")}`).join("\n")}\n${resultLines(handle, answers)}`;
