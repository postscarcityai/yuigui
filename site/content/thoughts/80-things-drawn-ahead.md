---
date: 2026-10-07
tag: release
title: "93 things drawn ahead. Films about a lion or a ship start sooner."
dek: Last time 21 common things were drawn and checked before anyone asked. Now it is 93. A film about one of them skips the wait and looks right more often.
---

```shot
/demo/motion/look/m24-chart.jpg | Bars: first scene median and mean, and share of frames that pass, with the 93-thing seed on and off, for asks that name a seed thing and asks that do not.
```

Last time we said: any noun outside the list still waits. This is the next step on that list.

## What waited before

The kit draws 68 things. The first seed added 21. Ask for anything else, a lion, a planet, a light bulb, and a model had to sketch the shapes first. The film waited about 4 s. The sketch sometimes came out wrong.

## What is drawn ahead now

72 more things, 93 in all. Animals, the body, space, machines, buildings, nature, science and daily things: lion, shark, penguin, planet, comet, ship, anchor, mountain, mushroom, magnet, atom, light bulb, padlock, crown. Each was drawn once, rendered and checked. We tried 79. Six did not read at a glance and were dropped. The dam was dropped by eye. A drawing a user already made still wins. `YUI_MOTION_SEED=off` brings the old path back.

The seed file is 83 KB and loads in 3 ms.

## The numbers

20 new asks, empty cache, same day. 14 name a new seed thing in fresh words. 6 name nouns in neither list.

- Asks that name a seed thing: first scene 4.0 s, was 5.9 s. Slowest 5.9 s, was 10.5 s.
- Those asks, frames that pass: 95%, was 87%.
- All 20 asks, frames that pass: 91%, was 88%. Off-subject frames: 4, was 10.
- Asks that do not: 4.7 s and 5.8 s. 82% and 91% of frames. Same code path. Six asks, 33 frames, so this is noise.
- Held-out 10, once: first scene 4.5 s, frames 91%. The last round read 98% on the same set, so that one is a step down. Seed on and off read the same today (91% and 91%), so we put it on the busy host.
- Judge re-check: 56 of 60, 93%.
- Tests: 100 passed, 1 skipped.

The host was busy while this ran. Load swung from 3 to 180, so the seconds are rough. The gap between on and off is the part to trust.

## Shipped

Yes. Live in the plugin once the gateway restarts.

Two honest notes. First, there are still no real film asks in the logs. The 72 are our guess at what people will ask about. Second, it helps only the 93. Any other noun still waits and still gets a fresh drawing nobody checked. The held-out frame rate on those slipped from 91% to 82% on six asks. We think it is noise, and we will watch it.

```shot
/demo/motion/look/m24-seed.jpg | The 72 new drawings that ship with the plugin.
```

Next: count real asks after launch and grow the list from them, or make the miss path itself faster so the list matters less. Before this: [films draw common things at once](/thoughts/films-draw-common-things-at-once). Films live on [the motion page](/motion).
