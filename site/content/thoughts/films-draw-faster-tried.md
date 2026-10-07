---
date: 2026-10-07
tag: release
title: "We tried to make new drawings come back faster. The drawings got worse."
dek: A film about a thing the kit cannot draw still waits about 9 s for scene 1. A shorter drawing call got faster, but the pictures went wrong. Out.
---

```shot
/demo/motion/look/m17-first-scene-timing.jpg | Left, the drawing call alone, median seconds per version. Right, first scene on ten new asks. Goal lines at one third off and 6.5 s.
```

Last time we found the floor: scene 1 has to carry the real drawing, so a new noun waits for one drawing call. We tried to make that call faster.

## What we tried

Ask for less. A short format: 5 to 8 shapes, one tiny line per shape, half the words coming back. Two models: sonnet and haiku.

## The numbers

Timed the call alone on ten new nouns, one at a time, cold.

- Today: 5.2 s.
- Short format, sonnet: 4.2 s. That is 19% off. Goal was a third.
- Short format, haiku: 3.2 s. 38% off, but only 8 of 10 drawings were valid.

Then the full film check on the new asks, empty cache.

- Bad frames (plain or off-subject): 9 today. Sonnet 13. Haiku 65.
- First scene: 9.2 s today. Sonnet 8.6 s. Haiku 7.2 s. Goal was 6.5 s.
- Frame pass: 90.0% today, 81.1% on sonnet.

## Why it lost

Haiku was fast and drew badly: the judge called 64 of 109 frames bad. Sonnet kept the drawings but saved under a second. And the call is only part of the wait. About 2.2 s of it is the program starting before it writes a word, and scene 1 still has to be written after the parts arrive.

## Not shipped

Reverted. Nothing reached the plugin. A new noun still costs about 4 s on its first ask, then nothing.

Next: keep one writer warm so the start cost goes away, and begin scene 1 from the first shapes instead of the full list. See films on [the motion page](/motion), and the try before this one in [we tried to start films faster on new drawings](/thoughts/films-start-fast-on-new-drawings).
