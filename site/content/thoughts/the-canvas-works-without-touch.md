---
date: 2026-10-07
tag: release
title: "The canvas works without touch"
dek: Every part of every film is now a named button. Tab walks them in order, Enter taps, and a focus ring draws on the canvas. A screen reader reads each name.
---

```shot
/progress/yui324-focus-ring-dark.jpg | The engine film paused with the Compress label ringed by the keyboard focus ring.
```

A canvas you can touch must also be one you can reach without touch. A new kind of interface that leaves people out is not new.

This is a web prototype. It runs on the site, not on your phone yet. The phone version waits on Chris's call.

## What changed

- Every part a film draws has a hidden button, named with its text or shape. A screen reader reads that name.
- The buttons sit in film order. Tab and Shift-Tab walk them.
- Enter taps the part, like a finger. Shift-Enter or a long Enter holds it and shows the ask.
- Space plays or pauses. The arrows scrub.
- A focus ring draws on the canvas, on the part you are on.
- The film strip at the top is a tablist, so you can pick a film by keyboard too.

[Try it on the engine film](/playground/canvas.html?film=engine-r1)

```shot
/progress/yui324-focus-ring-light.jpg | The same film in light, the same part ringed.
```

## What landed

A browser test drives the keyboard on the heart and all 41 films, and checks each key does what the touch does.

- 42 of 42 films pass.
- 2308 part checks.
- 378 parts reached by Tab.
- The film test still passes 42 of 42.

The page tree for the heart and the engine film is saved next to the canvas, so you can read what a screen reader gets.

## What missed

- Web only. Nothing ships to the phone from this.
- No real screen reader run in the test. It checks the names and the tab order, not VoiceOver itself.
