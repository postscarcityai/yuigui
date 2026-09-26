---
date: 2026-09-26
tag: release
title: "Yui 0.3.2: ask any agent for a beat"
dek: A looper and drum pads that play in the app, hold to reply, a quiet dot on the menu, and a working row that says what your agent is doing and how long it usually takes. Build 176 is on TestFlight.
---

```shot
/progress/yui116s2-loop-light.webp | A Boom bap loop playing full screen in the app: kick, snare, clap and hat lit on a grid, Stop, Swing 25% and Send
/progress/yui116s2-drums-recording-dark.webp | Finger drums in dark mode: four big pads, recording bar 2 of 2
```

Build 176 is on TestFlight. It is Yui 0.3.2.

The headline: Yui makes sound now. Ask any agent for a beat and it sends a looper you can play. Ask for drum pads and you get pads that hit the moment you touch them.

The rest came from the feedback button, like the last release did.

## A beat in one line

The looper is a grid. Rows are sounds, columns are steps. The agent writes the beat, you tap cells while it plays, and Send hands your version back in the same words.

```phone
caption: A loop, drawn live from one line. Turn your sound on.
say "Here is a boom bap beat. Tap cells to make it yours."
loop@beat 90 "Boom bap" steps=16 swing=25 rows=kick|snare|clap|hat|open|rim p=x......x..x.....|....x.......x...|............x...|x.x.x.x.x.x.x...|..............x.|...x.......x....
```

Drum pads count you in, keep two bars and send the take back as a loop. Both run on Yui's own sound engine, so they stay in time with each other.

```shot
/progress/yui116s2-drums-sent-light.webp | Finger drums after a take: Take sent, and Record again
/progress/yui116s2-inline-light.webp | Drums and a loop sitting in the chat, under the agent's message
/progress/yui116s2-loop-dark.webp | The Boom bap loop in dark mode
```

Keys, chords, the tuner and the metronome come next, one release at a time. The [music page](/developers/music) has all six.

## Hold to reply

Chris, Sep 26: "I wanna get rid of this swipe to the left to reply because it's blocking other UX motion gestures."

Swipe to reply is gone. Hold a message and tap Reply. A sideways drag now always switches screens.

```shot
/progress/fb-aacneo9w-hold-reply-dark.webp | Holding a bubble: the reactions above, Reply, Copy, Select text and Share below
/progress/fb-aacneo9w-swipe-pages-light.webp | A left swipe on a bubble pages to screen 2 and sets no reply
```

## A quiet dot

The menu button used to carry a count. Chris: "I think that can just have a dot if there's something new." Now a small dot springs on while something waits on you, and springs off when you answer the last one.

```shot
/progress/feedback-menu-before.webp | Before: a green 3 on the menu button
/progress/feedback-menu-dot-light.webp | After: one small purple dot at the corner of the menu button
/progress/feedback-menu-nodot-light.webp | Answered: the dot is gone
```

## What your agent is doing

The working row used to say Pondering and count. Now the agent can say what it is actually doing, in a few words, with a thin bar when it knows the steps.

```shot
/progress/yui63s2-app-weather-light.webp | Plan my afternoon, and the working row reads Checking the weather, 9s, with a bar two thirds full
/progress/yui63s2-app-plan-dark.webp | Dark mode: Drafting the plan, 12s, the bar nearly full
```

And it says how long this agent usually takes, like an app install on iPhone. Once the phone has seen three turns, the row reads Usually 1 to 2 min. Past that it says Longer than usual, and that you can leave: the answer lands here.

```shot
/progress/feedback-eta-light.webp | Piecing it together, 50s, and under it Usually 1 to 2 min
/progress/feedback-eta-dark.webp | Dark mode: Noodling, 58s, Usually 1 to 2 min
```

Under the hood, speed numbers from your phone are now stored once, even when iOS puts the app away mid-send.

## What to try

This list is a real Yui screen. Tap the rows as you go.

```phone
caption: The 0.3.2 checklist, drawn from one line.
say "Try Yui 0.3.2. Tick each one as you go."
list "Ask any agent for a beat" "Ask for drum pads and record a take" "Hold a message and reply" "Swipe sideways to switch screens" "Watch the working row on a long ask" +check
```

Something still in your way? Use the feedback button in TestFlight. Most of this release came from it.

```try
/mockups#release-032 | See 0.3.2, screen by screen
/changelog#build-176 | Build 176, change by change
```
