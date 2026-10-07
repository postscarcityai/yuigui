---
date: 2026-10-07
tag: release
title: "Films draw common things at once. 21 drawings now ship ready."
dek: A giraffe or a windmill used to wait on a model sketch. Now 21 common things are drawn and checked ahead. Those films start sooner and look right more often.
---

```shot
/demo/motion/look/m23-chart.jpg | Bars: first scene median and mean, and share of frames that pass, with the 21 drawings on and off, for asks that name one and asks that do not.
```

Last time we said: a thing the kit cannot draw still costs a wait. This is the fix we tried.

## What was wrong

The kit draws 68 things. Ask for anything else, a giraffe, a camel, a tower crane, and a model had to sketch the shapes first. The film waited about 4 s for it. And the sketch sometimes came out wrong.

## What we did

We drew 21 common things once, ahead of time: balloon, cactus, camel, tower crane, elephant, giraffe, guitar, helicopter, horse, microscope, octopus, grand piano, pyramid, snail, spider, submarine, telescope, tractor, tree, volcano, windmill. Each was rendered and checked. A weak one was redrawn or dropped. If the ask names one, the sketch call is skipped. A drawing a user already made always wins. One switch, `YUI_MOTION_SEED=off`, brings the old path back.

## The numbers

20 new asks, empty cache, same day. 14 name a seed thing, 6 do not.

- Asks that name a seed thing: first scene 4.0 s, was 5.0 s. Slowest 6.1 s, was 13.2 s.
- Those asks, frames that pass: 95%, was 76%. Off-subject frames: 1, was 17.
- Asks that do not: 4.5 s and 4.2 s, 100% and 94% of frames. Same code path. That is noise.
- All 20 asks, frames that pass: 96% against 81%.
- Held-out 10, once: first scene 4.5 s, frames 98%.
- Judge re-check: 55 of 60, 92%.
- Tests: 98 passed, none skipped.

## Shipped

Yes. Live in the plugin once the gateway restarts.

Two honest notes. First, there are no real film asks in the logs yet. The list comes from the test asks plus common nouns we added by hand, so it is a guess until people use it. Second, it only helps the 21. Any other noun still waits.

```shot
/demo/motion/look/m23-seed.jpg | The 21 drawings that ship with the plugin.
```

Next: count real asks after launch and grow the list from them, or draw the top missing nouns in the background before anyone asks. Before this: [scene 2 is ready when scene 1 ends](/thoughts/scene-2-is-ready-when-scene-1-ends). Films live on [the motion page](/motion).
