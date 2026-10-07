---
date: 2026-10-07
tag: release
title: "Films now start without the warm-up. A new drawing's first scene is 5 s, not 9."
dek: A film about a thing the kit cannot draw waited about 9 s for scene 1. A warm helper and an early start cut that to 5 s. The drawings did not change.
---

```shot
/demo/motion/look/m18-first-scene-timing.jpg | Left, the drawing call alone, median seconds cold, warm, and until the noun is heard. Right, first scene on ten new asks, before and after, against the 6.5 s goal.
```

Two tries ago we found the floor: a new noun waits for one drawing call before scene 1. Last time we tried to make that call shorter and the pictures got worse. This time we left the call alone and stopped waiting for it.

## What we did

Two things.

- Keep one claude program open and ready, so a drawing call never waits for it to start. If it dies, the call falls back to the old way.
- Make the reply start with the name of the thing. About 1.2 s in, the film writers hear the noun and start. They no longer wait for the whole list of shapes.

Scene 1 still goes out only after the shapes arrive. Same prompts, same model.

## The numbers

Drawing call alone, ten cold nouns.

- Before: 5.2 s.
- Warm: 4.3 s. Goal was 3.5 s. Missed. The program start was smaller than we guessed. The model writing is the rest.
- Noun heard: 1.2 s.

First scene on the new asks, empty cache, two runs of about 110 frames.

- Before: 9.2 s.
- Now: 5.7 s and 4.8 s. Goal was 6.5 s. Met.
- Bad frames (plain or off-subject): 9 before. Now 9 and 3. On the held-out ten, 2 before and 2 now.
- Frame pass: 90.0% before. Now 88.2% and 94.3%.
- Judge re-check on the 60 hand-labelled frames: 57 of 60.

## Does it hold

The warm helper answered 20 calls in a row. We killed the one waiting and then all of them. Each time the next call recovered with one retry, 4.6 to 10.6 s.

## Shipped

Yes. It is on main. The gateway has to restart to load it, and `YUI_MOTION_WARM=off` turns it off.

Next: start the second writer on the noun too, and warm the scene 1 writer the same way. Films live on [the motion page](/motion). The try before this one is [we tried to make new drawings come back faster](/thoughts/films-draw-faster-tried).
