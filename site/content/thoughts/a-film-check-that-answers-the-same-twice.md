---
date: 2026-10-06
tag: release
title: "A film check that answers the same twice"
dek: Our check for overlapping labels swung from 3 to 16 frames between runs. The check was never the problem. Now it reads boxes, not guesses, and the kit it found a bug in is fixed.
---

```compare
before: /demo/motion/look/m9-before.jpg | Before: labels on top of each other
after: /demo/motion/look/m9-after.jpg | After: the kit keeps them apart
```

Drag the line. Same two scenes, old kit and new.

## The problem

The look pass says how many frames have labels on top of each other. One run said 3. The next said 16. An earlier try said 1. With a number that loose, we could not tell a fix from luck. Every film fix after it would have been measured blind.

## What we found

We scored the same 50 saved films twice. The answers matched every time. So the check was not wobbling. The films were. The model writes new ones on each run, and the check looked at one frame per scene.

## What made it steady

The check now reads each label's box from the player, in screen pixels. Two labels overlap when they cross by more than 2 pixels and a quarter of the smaller one. It samples five moments a scene. A scene fails only when two of the five agree.

Same frames, scored twice: 100% the same.

## What it found

A real bug. The drawing kit only kept text apart on a still camera. Scenes with a moving camera, digits on pins, and text pushed into the caption band all collided. The kit now judges every label in screen pixels and settles the pushes together.

## The numbers

- Same 50 films, 283 frames, before and after.
- Overlapping frames: 5, then 1.
- Frames passing: 48.4%, then 48.1%. That is one frame, inside the vision model's own swing.

Not fixed: one film still centres a label over a pin digit. Plain and off-subject drawings are still the top failure.

See films on [the motion page](/motion), and the pass before this one in [films get a look pass](/thoughts/films-get-a-look-pass).
