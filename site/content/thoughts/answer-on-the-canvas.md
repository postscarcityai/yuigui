---
date: 2026-10-07
tag: release
title: "Answer on the canvas"
dek: The living canvas now draws the questions an agent asks. Choose, pick, slide, ask and form answers are buttons, knobs and fields you touch right on the picture, and the answer goes back to the agent.
---

```shot
/progress/yui328-choose-locked-dark.jpg | A question drawn on the living canvas as pills, one picked and the rest locked.
```

An agent asks you something. Until now that was a form under a chat bubble. Now the question is part of the picture, and you answer it right there.

This is a web prototype. It runs on the site, not on your phone yet. The phone version waits on Chris's call on the canvas.

## Why it matters

You answer on the thing the agent is asking about. Tap a pill, drag a knob, fill a line. The agent hears which one you meant.

## What changed

- A choose writes its pills in one after another. Other is the last pill, and you can type it.
- A tap picks one and locks the rest. The answer shows in place.
- A pick has a box on each pill, and Send sends the set.
- A slide draws its track, then the knob drops on. Drag it, tap an end, or use the arrow keys.
- A form draws a knob for numbers and a ruled line for words.
- Every option, knob and field is a mark named by its words. Tab reaches them too.

[Try the choose](/playground/canvas.html?yl=choose-other)

```shot
/progress/yui328-slide-answer-dark.jpg | A slider drawn on the living canvas, the knob set to 5 and the answer shown under it.
```

[Try the slider](/playground/canvas.html?yl=slide-sore)

## What landed

- 6 new samples: choose-other, pick-gear, slide-sore, ask-ship, form-checkin and sketch-choose.
- The Yui Lines test passes with 0 bad of 33.
- The film test still passes 42 of 42.
- The keyboard test still passes 42 of 42.

## What missed

- Web only. Nothing ships to the phone from this.
- Six samples, not every question an agent can ask.
