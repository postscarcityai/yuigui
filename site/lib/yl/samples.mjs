// The 10 benchmark screens. The playground loads these too, so what is
// measured is exactly what renders.
export const SCREENS = [
  {
    name: "Tabata timer",
    agent: "Arnold",
    yl: `timer 40/20x8 Tabata`,
  },
  {
    name: "Log a set",
    agent: "Arnold",
    yl: `say "Set 3 done. 225 x 5, bar speed looked good."
ask "Log this set?"`,
  },
  {
    name: "Pick a split",
    agent: "Arnold",
    yl: `choose "What are we training today?" Push|Pull|Legs +other`,
  },
  {
    name: "Gear check",
    agent: "Arnold",
    yl: `pick "What gear do you have?" Dumbbells|Bench|Bands|"Pull-up bar"|Kettlebell +other`,
  },
  {
    name: "Onboarding",
    agent: "Yui",
    yl: `say "Nice to meet you. A couple of quick ones."
form name:text! goal:voice submit="Next"
slide "How much do you know about AI?" 1-5 "Brand new"|"I run agents"`,
  },
  {
    name: "Today's workout",
    agent: "Arnold",
    yl: `list Today "Back squat 5x5 @ 225" "Bench 5x5 @ 185" "Barbell row 3x10" "Plank 3x60s" +check
>2 timer 90 Rest`,
  },
  {
    name: "Meal photo log",
    agent: "Arnold",
    yl: `camera "Snap your plate"
table meals`,
  },
  {
    name: "Macros so far",
    agent: "Arnold",
    yl: `table Macros Food|Cal|Protein "Eggs|140|12" "Oats|300|10" "Chicken|280|53" "Greek yogurt|150|20"
slide "Protein left today (g)" 0-200 value=85 step=5`,
  },
  {
    name: "Book a client call",
    agent: "Urza",
    yl: `say "Thursday works. Which slot?"
choose "Client call, Thursday" "3:00 pm"|"4:00 pm" +other
ask "Send the invite now?" "Yes, send"|"Not yet"`,
  },
  {
    name: "Leg day card + voice log",
    agent: "Arnold",
    yl: `card "Leg day" "Squat, RDL, walking lunges. About 45 minutes." sub="Thursday" img=/yl/legday.svg cta="Start workout"
image /yl/meal.svg Last night's dinner
mic "What did you eat today?"`,
  },
];

// Playground-only demos for the non-preset lines. Not in the benchmark.
export const DEMOS = [
  {
    name: "Demo: live patch (~)",
    agent: "Arnold",
    yl: `timer@hiit 40/20x8 Tabata +auto
say "Try the agent line below: ~hiit rounds=10  or  ~hiit 30/10"`,
  },
  {
    name: "Demo: screens (>) and save/show",
    agent: "Arnold",
    yl: `list Warmup "Jumping jacks 60s" "Hip openers" "Goblet squat x10"
save warmup
>2 timer 45/15x6 Circuit
>3 say "Screen 3. Tap the screen tabs above the phone."
>3 ask "Ready for the circuit?"
show warmup`,
  },
  {
    name: "Demo: custom {json} escape hatch",
    agent: "Urza",
    yl: `say "No preset fits a split-flap countdown, so the agent drops to custom."
custom {"type":"stack","children":[{"type":"badge","text":"Launch"},{"type":"text","text":"Plannix V2 goes live","size":"lg"},{"type":"row","children":[{"type":"stat","label":"days","value":"99"},{"type":"stat","label":"hours","value":"14"}]},{"type":"button","text":"Open checklist","action":"checklist"}]}
custom {oops not json}`,
  },
];
