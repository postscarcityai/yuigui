// The PROP-5 hero: $U trickling in as you use Yui. Copy, the rates and the moves the phone plays.
// The rates are PROP-5's formula v0 (docs/proposals/earn-u-by-using-yui.md); keep the two in step.

export const RATES = {
  message: 1, // a message you send that gets an answer
  screen: 2, // a screen you answer: a tap, a pick, a form
  done: 5, // something an agent finished for you: a meal logged, a workout done, a plan saved
  firstOfDay: 10,
  softCap: 150, // $U from use a day at full speed; past it, a tenth
};

// Day of the streak -> multiplier on use, and the bonus the day it is reached.
export const STREAK = [
  { day: 3, x: 1.1 },
  { day: 7, x: 1.25, bonus: 50 },
  { day: 30, x: 1.5, bonus: 300 },
];

export const streakX = (day) => STREAK.reduce((x, s) => (day >= s.day ? s.x : x), 1);
export const streakBonus = (day) => STREAK.find((s) => s.day === day)?.bonus || 0;

// What a visitor can do. `kind` picks the rate; `flat` earns a fixed amount with no streak or cap.
export const MOVES = [
  { id: "msg", kind: "message", label: "Send a message", hint: "+1 $U, every time", say: "What should I eat after leg day?", reply: "Chicken, rice and greens. Log it?" },
  { id: "tap", kind: "screen", label: "Answer a screen", hint: "+2 $U a tap, pick or form", say: "Log it", tap: true, reply: "Logged. 620 kcal, 48 g protein." },
  { id: "done", kind: "done", label: "Get something done", hint: "+5 $U when an agent finishes a job", say: "Plan my meals for tomorrow", reply: "Done. Three meals, 2,100 kcal, on your list." },
  { id: "feedback", flat: 10, label: "Send feedback", hint: "+10 now, +500 if it ships", say: "Feedback: the timer is hard to read in the dark", reply: "Thanks, it's on the board. If it ships, +500 $U." },
  { id: "pr", flat: 3000, big: true, label: "Merge a pull request", hint: "+1,000 to +10,000 by size", say: "My Go parser merged (OSS-8, size M)", reply: "Your pull request merged. +3,000 $U." },
];

// The show it plays while nobody has touched it: mostly use, a feedback now and then.
export const LOOP = ["msg", "tap", "done", "msg", "tap", "msg", "done", "feedback", "msg", "tap"];

export const START = { balance: 1240, day: 6, today: 38 };

export const HERO = {
  pickLabel: "Use Yui and watch it count",
  nextDay: "Come back tomorrow",
  nextDayHint: (day) => `Day ${day + 1} of your streak`,
  replay: "Start over",
  agent: "Basil",
  todayLabel: "Today",
  slower: "Past 150 today: a tenth as fast",
  streakLabel: (day) => `${day}-day streak`,
  hint: (auto) => (auto ? "Playing on its own. Tap anything to try it." : "Your turn. Every move counts."),
  note: "No cash value. Not a token yet.",
  claim: "A mockup. The numbers are PROP-5's formula v0; nothing here records anything.",
};
