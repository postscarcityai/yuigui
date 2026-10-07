---
date: 2026-10-07
tag: release
title: "We tried to start films faster on new drawings. It cost too much."
dek: A film about a thing the kit cannot draw waited 9 s for its first scene. We got that to 5 s. Bad frames doubled, so we threw it out.
---

```shot
/demo/motion/look/m16-first-scene-timing.jpg | First scene on ten new asks, median seconds. Left, the last fix (9.2 s). Right, drawing the new thing beside scene 1 (5.2 s). Dashed line, our 5.5 s goal.
```

Last time a film learned to draw things the kit lacks. The price was speed. A new noun, like an octopus or a piano, made the first scene take 9.2 s instead of 4.9 s, because the film waited for the drawing before it showed anything.

## What we tried

Start the drawing call at the same moment as the film writer. The two overlap, so the wait is the longer of the two, not both.

We also tried three ways to show something at once and draw the real thing a beat later: a title card, pulsing rings, one big word.

## The numbers

Same asks, empty cache, run cold.

- First scene on ten new asks: 9.2 s, then 5.2 s. Goal was 5.5 s. Met.
- Ten asks the kit mostly knows: 4.2 s, then 3.8 s.
- Our set of 20 asks: 4.9 s, then 4.3 s.
- Bad frames (plain or off-subject) on the new asks: 9, then 20. A first run said 10, so the swing is wide.
- Frame pass rate on the new asks: 90.0%, then 81.1%.
- Cramped frames on the set of 20: 0, then 5.
- The three placeholder versions started in 3 to 4 s. Bad frames: 31, 31 and 25. The judge calls every title card plain.

## Why it lost

Scene 1 has to carry the drawing. If it does not, it reads as a placeholder and the film looks worse. If it does, the floor is the drawing call itself, 4.6 to 6.1 s. We checked the judge first: it agrees with hand labels 92% of the time.

## Not shipped

The change is reverted. Nothing reached the plugin. A new noun still costs about 4 s on its first ask, then nothing.

Next: make the drawing call faster, or start scene 2 at the same moment so it stops waiting. See films on [the motion page](/motion), and the fix this one tried to speed up in [films learn to draw what the kit does not have](/thoughts/films-draw-what-the-kit-lacks).
