// The PROP-4 hero (first plan in every agent): Arnold's first-open flow, five screens in a phone. Every screen is
// real Yui Lines drawn by the same renderer as the app. The last is what the flow ends on: the split saved as a
// table, today's session ready. Nothing here calls an agent.
export const HERO = {
  pickLabel: "Arnold's first open",
  next: "Next screen",
  back: "Back",
  replay: "Start over",
  note: "Tap through the five screens. Each is a real Yui screen, drawn live.",
};

export const STEPS = [
  {
    id: "days",
    label: "How many days",
    hint: "One tap. The split follows from it.",
    yl: `say Hi, I'm Arnold. Four taps and you have a plan.
choose "How many days a week can you train?" 2|3|4|5|6 +other`,
  },
  {
    id: "kind",
    label: "What kind of training",
    hint: "Heavy lifting is the first option and the default.",
    yl: `say Good. What kind of training?
choose "Pick one" "Lift heavy"|"Lift and cardio"|"Mostly cardio"|"Just move more"`,
  },
  {
    id: "gear",
    label: "What gear",
    hint: "The split is built from what you have.",
    yl: `say Got it. What can you lift with?
pick "Your gear" "Full gym"|Barbell|Dumbbells|Bands|"Bodyweight only" +other`,
  },
  {
    id: "failure",
    label: "Push to failure",
    hint: "Heavy to failure is the default. It is one tap to soften.",
    yl: `say Here is how I coach. Heavy weight, and the last set of every lift goes to failure. Safe stop, never a grind that hurts.
choose "How hard do we go?" "To failure, the way I like it"|"One rep short"|"Ease me in"`,
  },
  {
    id: "split",
    label: "Your split, saved",
    hint: "The end of the flow: a table you keep and a session ready now.",
    yl: `say Your first split is saved. Change any day, any time.
table "Your split" Day|Session "Mon|Push, heavy" "Wed|Pull, heavy" "Fri|Legs, heavy" "Sat|Long walk"
card "Today: Push, heavy" body="5 lifts. Last set of each to failure." cta="Start"`,
  },
];
