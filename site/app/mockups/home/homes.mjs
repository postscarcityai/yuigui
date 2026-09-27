// YUI-168 step 1: each starter agent's home.yui (spec/HOME.md, section 4), as the mock plays it.
// Shortcuts are `menu shortcut` lines (sent most important last, since the home shows newest first),
// pages are `>2`, `>3` ... with lasting @ids. `asks` stands in for the thread's open asks and `menu review`.
export const HOMES = {
  arnold: {
    name: "Arnold",
    face: "A",
    job: "Your trainer. Plans the week, runs the timer.",
    asks: [
      { title: "Saturday: legs or a rest day?", sub: "You slept 5h last night", opts: ["Legs", "Rest day"] },
      { title: "New squat max?", sub: "Last three sets looked easy", opts: ["Test it Thursday", "Not yet"] },
    ],
    replies: {
      "start-a-workout": "Pull day. Deadlift first, 3 sets of 5. The timer is up.",
    },
    yl: `menu shortcut@split "My split" show="this week"
menu shortcut@start-a-workout "Start a workout" say="Start today's workout"
>2
stat 3/4 "Workouts this week" spark=1|2|2|3 sub="Legs left, Saturday"
list@days Week "Mon Push"|"Tue Pull"|"Thu Legs"|"Sat Legs" +check
save this week
>3
card@today "Today's workout" "Pull day. About 50 minutes." sub="Tuesday" cta="Start"
list@sets Pull "Deadlift 3x5 @ 275" "Pull-ups 4x8" "Barbell row 3x10" "Face pulls 3x15" +check
save today`,
  },
  basil: {
    name: "Basil",
    face: "B",
    job: "Your nutritionist. Log a meal, see where you stand.",
    asks: [
      { title: "Dinner tonight?", sub: "680 kcal and 44 g protein left", opts: ["Plan it for me", "I have it"] },
    ],
    replies: {},
    yl: `menu shortcut@groceries "Grocery list" show=groceries
menu shortcut@log "Log a meal" say="Log a meal: "
>2
stat 1420kcal "Calories today" delta=-680 sub="of 2,100" spark=380|760|1100|1420
chart bar "Macros vs goal" x=Protein|Carbs|Fat y=96|150|48 y2=140|210|70 names=Today|Goal unit=g
save today
>3
list@groceries Groceries "Chicken thighs" "Greek yogurt" Spinach Rice Eggs Berries +check
save groceries`,
  },
  gouda: {
    name: "Gouda",
    face: "G",
    job: "Your music buddy. Beats, chords, keys, practice.",
    asks: [],
    replies: {},
    yl: `menu shortcut@tune "Tune up" say="Tune my guitar"
menu shortcut@jam "Jam" say="Make me a beat to jam on"
>2
loop 92 "Looper" p=x...x...|....x...|..x...x.|x.x.x.x. +inline
save looper
>3
chords C I-V-vi-IV "Chords" +inline
save chords
>4
keys C major "Keys" +inline
save keys`,
  },
};

export const ORDER = ["arnold", "basil", "gouda"];
