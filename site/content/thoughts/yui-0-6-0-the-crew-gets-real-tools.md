---
date: 2026-09-29
tag: release
title: "Yui 0.6.0: the crew gets real tools"
dek: All five agents get their own tools, flows and default screens, not just chat, and a quiet visual behind every one. Build 342 is on TestFlight.
---

```shot
/progress/yui182-runner-move-light.webp | The workout runner: one move on the page, its sets to tick, the weight you lifted last already filled in
/progress/yui186-lesson-light.webp | Quill's five minute lesson: one idea per page, the next step waiting under it
```

Build 342 is on TestFlight. It is Yui 0.6.0.

Chris said it plainly on Sep 28: get the crew more tools, with detailed flows and default screens. Until now an agent could answer with a screen, but only if you knew what to ask it. This release gives each of the five something to do the moment you open it.

Yui is a GUI layer. It is early, and it is yours: your agents, your keys, your data, open source and built in the open. The point was never to make another chat box. It was to give the agents you already run somewhere to draw.

## Arnold runs the workout

Start today's workout opens full screen, one move per page. Tick each set. Nudge the reps and the weight, which starts from what you lifted last. Say how it felt, then one Finish. After that his own screens move on their own: the day ticked on This week, today marked done, and Progress with your streak, your best set and a chart per main lift.

```shot
/progress/yui182-runner-review-dark.webp | The end of a session in dark mode: every set logged, the review page before Finish
/progress/yui182-progress-dark.webp | Arnold's Progress screen: a streak, a best set and a line chart for the goblet squat
```

## Basil plans and reads a plate

Plan my meals draws today's macros board. Photograph a plate and he reads it, and says how sure he is. Add oat milk to my groceries ticks onto the list, and the list shares straight out of the phone. Ask for a swap and he swaps one meal, not the week.

```shot
/progress/yui183-plan-likes-light.webp | Basil's plan: the week of meals with what you like already accounted for
/progress/yui183-groceries-light.webp | The grocery list with oat milk ticked on, and a Share button above it
```

## Gouda teaches a song and keeps time

Learn a song hands you the chord grid to play along with. Make a beat opens the looper. Log practice keeps the session. The loop and the click keep playing while you move between his screens, and Tune up opens the tuner with no turn to wait for.

```shot
/progress/yui184-chords-dark.webp | The chord grid in dark mode, the song's chords in order with the beat under them
/progress/yui184-looper-light.webp | Gouda's looper: kick and snare rows laid out, playing
```

## Penny takes the week out of your head

Say it out loud, all of it, then Plan my week draws the plan. What's next today? gives the today list. Evening review closes the day. Reminders land on the phone's own clock, and the order you saved is the order you get back.

```shot
/progress/yui185-plan-talk-light.webp | Penny listening: the week coming out as spoken lines before the plan is drawn
/progress/yui185-review-dark.webp | The evening review in dark mode: what got done, what moves to tomorrow
```

## Quill is new here

Teach me something new opens a five minute lesson. Quiz me on what I learned scores the deck and sets the next review, spaced out. Walk me through a math problem goes one step per page instead of one wall of text. His Studying and Progress screens keep the score.

```shot
/progress/yui186-review-dark.webp | A quiz being reviewed in dark mode, each card rated, the next review date set
/progress/yui186-problem-light.webp | A math problem walked one step per page, the working shown
```

## A quiet visual behind each one

Every agent draws its own from the first open: waves for Arnold, a bloom for Basil, grain for Gouda, an aurora for Penny, an orb for Quill. They are meant to be barely there, behind what you came for. If one pulls your eye, tell us, that is a bug and not a feature.

Each agent's settings has a switch to turn it off. Low Power or Reduce Motion drops every visual to one still frame on its own, so nothing moves when you have asked the phone for nothing to move.

```shot
/progress/yui180-gouda-dark.webp | Gouda's home in dark mode with his grain behind the shortcuts
/progress/yui180-switch-light.webp | An agent's settings with the switch that turns its visual off
```

## Also in this build

Hold the mic and slide left to throw the take away, or slide up onto the lock to keep recording with your thumb off the glass. Every message says when it was sent, and the thread breaks into days. A notification opens on page one of what came in, not the last page. The guitar tuner no longer crashes. A long session now holds about 35 MB less memory than it did.

```shot
/progress/yui201-lock-armed.webp | Holding the mic with the lock armed above it, recording without a thumb on the glass
/progress/yui202-day-dividers-dark.webp | A thread with a Yesterday divider and a sent time under each message
```

## What to try

This list is a real Yui screen. Tap the rows as you go.

```phone
caption: The 0.6.0 checklist, drawn from one line.
say "Try Yui 0.6.0. Tick each one as you go."
list "Open Arnold and say start today's workout" "Photograph a plate for Basil" "Ask Gouda to learn a song, then tap Tune up" "Tell Penny your week out loud" "Ask Quill to teach you something, then quiz you" "Watch the visual behind each agent, then switch one off" +check
```

Before this build went up it ran 705 tests with no new regressions against the pre-release commit, and a pass on a real account: 25 agent opens and four force-kill relaunches, zero crashes. That last part matters because the 0.5.0 crash only ever showed up on the real path, never on the demo account our tests used.

So please try to break it. Switch agents fast, force quit with an answer still coming, relaunch. The feedback button in TestFlight goes straight onto the board.

```try
/mockups#release-060 | See Yui 0.6.0
/changelog#build-342 | Build 342, change by change
```
