---
date: 2026-09-30
tag: why
title: No empty chats
dek: Why a new agent opens on a plan you can tap, not a blank box asking what you want. Pick your crew, answer a few taps, and your first week is built. You can try both on the site today.
---

```shot
/progress/yui217-questions-light.webp | A coach agent's first screen: cards with tap answers for session length and gear, each with a Not sure, and a note that new lifters stop well short of failure
```

Chris tried the trainer in TestFlight on Sep 29. His note was short: "terrible, take a step back." He opened the agent and got an empty screen with a button that did nothing.

That is the problem with a blank box. It hands the work back to you. You just added an agent to get help, and its first move is to ask what you want.

## What a first open looks like now

A new account no longer lands on six threads. Yui says hi and asks who should join. Tap a row to add an agent, or open its page to see what it does. Bring your own agent sits in the same list.

```try
/crew#pick-your-crew | Pick your crew
```

Then you open the trainer for the first time. It asks one screen: what you are training for, days a week, minutes per session, what gear you have, how much you have lifted. One tap each. Press Build my week.

```phone
caption: The whole first open, drawn live. Tap through it.
plan@first "Your first plan" submit="Build my week"
choose@goal "What are we training for?" "Lift heavy"|"Lift and cardio"|"Mostly cardio"|"Just move more"|"Not sure"
choose@days "How many days a week?" 2|3|4|5|6|"Not sure"
choose@time "How long per session?" "30 min"|"45 min"|"60 min"|"Not sure"
pick@gear "What do you have?" "Just me"|Bands|Dumbbells|Barbell|"A gym"
choose@level "How much have you lifted?" "New to lifting"|"Some experience"|"Lifted for years"|"Not sure"
end
```

## Two ways out

A plan from five taps is a rough draft, so it says so and every day can change. It also has to let you leave.

Every question has Not sure. The plan picks a safe default and moves on. Skip keeps the starter week and takes you straight in. Nobody is stuck answering.

```shot
/progress/yui217-this-week-light.webp | The saved week: workouts this week 0 of 3, three full body days, and a Change a day row of buttons under it
```

## What you get

The answers become a week you keep. A table of days, the first session ready for today, and the counter that used to say "0 of 4" with nothing behind it now counts real sessions.

One rule matters for a trainer that pushes hard. The last set of each lift goes to failure with a safe stop, but only for people who say they have lifted for years. New lifters ease in.

```try
/crew#first-plan | Try the first plan
```

## Where this goes

The same shape comes to the rest of the crew. The food agent will ask how you eat and what you are aiming for, then save a week of meals. The music agent will ask your instrument and level. The planner will ask when your week is busy. The study agent will ask what you are learning and how long you have.

The rule is the same for all of them: the first open ends with something useful, never an empty screen.

The crew picker and the trainer's first plan are in the next TestFlight build. The site versions work now.
